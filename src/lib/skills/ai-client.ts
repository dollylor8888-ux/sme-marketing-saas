/**
 * AI Client — Single source of truth for OpenAI / MiniMax
 * Set AI_PROVIDER=minimax or openai in env
 */

import OpenAI from "openai";

const provider = process.env.AI_PROVIDER ?? "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  ...(provider === "minimax" && {
    baseURL: "https://api.minimax.chat/v1",
  }),
});

export const DEFAULT_MODEL = provider === "minimax"
  ? "abab6-chat"   // MiniMax flagship chat model
  : "gpt-4o-mini"; // OpenAI fallback

export const AI_PROVIDER = provider;
