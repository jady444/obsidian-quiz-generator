import { spawn } from "child_process";
import * as path from "path";
import Generator from "../generator";
import { QuizSettings } from "../../settings/config";

export default class ClaudeCodeGenerator extends Generator {
    constructor(settings: QuizSettings) {
        super(settings);
    }

    public async generateQuiz(contents: string[]): Promise<string | null> {
        return new Promise((resolve, reject) => {
            const systemPrompt = this.systemPrompt();
            const instructions = `You are a quiz generator.
CRITICAL: Your response MUST be a single JSON object and NOTHING ELSE. 
Do not include any conversational text, markdown formatting, or explanations.
The JSON object must have a "questions" property which is an array of questions.

IMPORTANT SCHEMA RULES:
1. True/False: "answer" must be a BOOLEAN (true or false), not a string.
2. Multiple Choice: "answer" must be the INDEX (number) of the correct option, not the text.
3. Select All That Apply: "answer" must be an ARRAY OF INDEXES (numbers), not text.
4. Matching: "answer" must be an array of objects with "leftOption" and "rightOption" keys.

Generate ${this.userPromptQuestions()} about the provided text.
If the text contains LaTeX, you should use $...$ (inline math mode) for mathematical symbols.
The overall focus should be on assessing understanding and critical thinking.

TEXT TO GENERATE FROM:
${contents.join("\n\n")}`;

            // We use a very simple command line and pass everything via stdin
            // to avoid shell escaping issues and command length limits.
            const args = [
                "-p",
                "Generate the quiz as JSON based on the provided text. Do not be conversational. Output ONLY JSON following the requested schema exactly.",
                "--output-format", "json",
                "--system-prompt", systemPrompt,
                "--max-turns", "2", // Allow 1-2 turns in case it needs to "think"
            ];

            const child = spawn(this.settings.claudeCodePath, args, {
                shell: true,
                env: { ...process.env, CLAUDE_CODE_NON_INTERACTIVE: "true" }
            });

            // Pipe the instructions and content to stdin
            child.stdin.write(instructions);
            child.stdin.end();

            let stdout = "";
            let stderr = "";

            child.stdout.on("data", (data) => {
                stdout += data.toString();
            });

            child.stderr.on("data", (data) => {
                stderr += data.toString();
            });

            child.on("close", (code) => {
                // Debug logging to console
                console.log("Claude Code STDOUT:", stdout);
                console.log("Claude Code STDERR:", stderr);

                if (code !== 0) {
                    reject(new Error(`Claude Code CLI exited with code ${code}: ${stderr}`));
                    return;
                }

                // Strip ANSI escape codes
                const cleanStdout = stdout.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "").trim();

                try {
                    // Try to find the JSON block
                    const jsonMatch = cleanStdout.match(/\{[\s\S]*\}/);
                    if (!jsonMatch) {
                        reject(new Error(`No JSON found in Claude Code output. Check the developer console (Ctrl+Shift+I) for debug info.`));
                        return;
                    }

                    const jsonStr = jsonMatch[0];
                    const parsed = JSON.parse(jsonStr);

                    // Handle the 'result' field or 'content' field from the CLI wrapper
                    let finalResult = "";
                    if (parsed.result && typeof parsed.result === "string") {
                        finalResult = parsed.result;
                    } else if (parsed.content && typeof parsed.content === "string") {
                        finalResult = parsed.content;
                    } else if (parsed.questions) {
                        finalResult = JSON.stringify(parsed);
                    } else {
                        finalResult = jsonStr;
                    }

                    // Sometimes the result itself is a string containing JSON
                    const nestedMatch = finalResult.match(/\{[\s\S]*\}/);
                    const quizJson = nestedMatch ? nestedMatch[0] : finalResult;

                    // Normalize the quiz format
                    const normalizedQuiz = this.normalizeQuiz(JSON.parse(quizJson));
                    console.log("Normalized Quiz:", normalizedQuiz);
                    resolve(JSON.stringify(normalizedQuiz));

                } catch (e) {
                    reject(new Error(`Failed to parse Claude Code output as JSON: ${(e as Error).message}`));
                }
            });

            child.on("error", (err) => {
                reject(err);
            });
        });
    }

    private normalizeQuiz(quiz: any): any {
        if (!quiz || !Array.isArray(quiz.questions)) return quiz;

        quiz.questions = quiz.questions.map((q: any) => {
            // Normalize True/False
            if (q.type === "true_or_false" || (q.question && q.answer !== undefined && !q.options)) {
                if (typeof q.answer === "string") {
                    q.answer = q.answer.toLowerCase() === "true";
                }
            }
            // Normalize Multiple Choice
            if (q.options && !Array.isArray(q.answer) && typeof q.answer === "string") {
                const index = q.options.indexOf(q.answer);
                if (index !== -1) q.answer = index;
            }
            // Normalize Select All That Apply
            if (q.options && Array.isArray(q.answer) && typeof q.answer[0] === "string") {
                q.answer = q.answer.map((a: string) => q.options.indexOf(a)).filter((i: number) => i !== -1);
            }
            // Normalize Matching
            if ((q.pairs || q.matching) && !q.answer) {
                const pairs = q.pairs || q.matching;
                q.answer = pairs.map((p: any) => ({
                    leftOption: p.left || p.leftOption,
                    rightOption: p.right || p.rightOption
                }));
                delete q.pairs;
                delete q.matching;
            }
            return q;
        });

        return quiz;
    }

    public async shortOrLongAnswerSimilarity(userAnswer: string, answer: string): Promise<number> {
        throw new Error("Claude Code CLI does not support grading short and long answer questions yet.");
    }
}
