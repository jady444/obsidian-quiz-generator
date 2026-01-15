export enum Provider {
	OPENAI = "OPENAI",
	GOOGLE = "GOOGLE",
	ANTHROPIC = "ANTHROPIC",
	PERPLEXITY = "PERPLEXITY",
	MISTRAL = "MISTRAL",
	COHERE = "COHERE",
	OLLAMA = "OLLAMA",
	CLAUDE_CODE = "CLAUDE_CODE",
}

export const providers: Record<Provider, string> = {
	[Provider.OPENAI]: "OpenAI",
	[Provider.GOOGLE]: "Google",
	[Provider.ANTHROPIC]: "Anthropic",
	[Provider.PERPLEXITY]: "Perplexity",
	[Provider.MISTRAL]: "Mistral",
	[Provider.COHERE]: "Cohere",
	[Provider.OLLAMA]: "Ollama",
	[Provider.CLAUDE_CODE]: "Claude Code CLI",
};
