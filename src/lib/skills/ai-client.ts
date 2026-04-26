/**
 * AI Client — Single source of truth for OpenAI / MiniMax
 * Set AI_PROVIDER=minimax or openai in env
 * Lazy initialization to avoid build-time credential errors
 */

import OpenAI from "openai";

const provider = process.env.AI_PROVIDER ?? "openai";

// Singleton — lazily initialized on first use
let _openai: OpenAI | undefined;

export function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY ?? "sk-build-time-placeholder",
      ...(provider === "minimax" && {
        baseURL: "https://api.minimax.chat/v1",
      }),
    });
  }
  return _openai;
}

// Proxy object — all property access is lazy
// This prevents OpenAI instantiation until actually needed (runtime, not build)
export const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    return Reflect.get(getOpenAI(), prop);
  },
});

export const DEFAULT_MODEL = provider === "minimax"
  ? "abab6-chat"
  : "gpt-4o-mini";

export const AI_PROVIDER = provider;
