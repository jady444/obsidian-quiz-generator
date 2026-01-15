import { Setting } from "obsidian";
import QuizGenerator from "../../../main";

const displayClaudeCodeSettings = (containerEl: HTMLElement, plugin: QuizGenerator): void => {
    new Setting(containerEl)
        .setName("Claude Code CLI path")
        .setDesc("The command or path to the Claude Code CLI (default: 'claude').")
        .addText(text =>
            text
                .setValue(plugin.settings.claudeCodePath)
                .onChange(async (value) => {
                    plugin.settings.claudeCodePath = value.trim();
                    await plugin.saveSettings();
                })
        );
};

export default displayClaudeCodeSettings;
