export const DEFAULT_MODEL_TEST_MESSAGE = "我想到新山举办投资大会，有什么建议的方案吗？";

export const DEFAULT_OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";
export const DEFAULT_MINIMAX_CHAT_COMPLETIONS_URL = "https://api.minimaxi.com/v1/chat/completions";

export const DEFAULT_MINIMAX_MODEL = "MiniMax-M3";
export const DEFAULT_OPENAI_MODEL = "gpt-4.1-mini";

export const MINIMAX_MODEL_OPTIONS = [
  "MiniMax-M3",
  "MiniMax-M2.7",
  "MiniMax-M2.7-highspeed",
  "MiniMax-M2.5",
  "MiniMax-M2.5-highspeed",
  "MiniMax-M2.1",
  "MiniMax-M2.1-highspeed",
  "MiniMax-M2",
] as const;

export const OPENAI_MODEL_OPTIONS = ["gpt-4.1-mini", "gpt-4.1", "gpt-4o-mini"] as const;
