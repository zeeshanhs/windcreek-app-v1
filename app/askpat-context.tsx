"use client";

import { createContext, useContext } from "react";
import type { DemoState, Reference, User } from "@/lib/askpat/fixtures";

export type StagedPhoto = { file: File; description: string };
export type AskPatContextValue = {
  state: DemoState;
  user: User;
  notice: string;
  setNotice: (text: string) => void;
  navigate: (path: string, replace?: boolean) => void;
  refresh: () => Promise<void>;
  openPanel: (panel: string, sourceId?: string, locator?: string) => void;
  closePanel: () => void;
  drafts: Record<string, string>;
  setDraft: (key: string, text: string) => void;
  staged: Record<string, StagedPhoto | undefined>;
  stagePhoto: (key: string, photo?: StagedPhoto) => void;
  send: (chatId: string | null) => Promise<void>;
  sendErrors: Record<string, string>;
  waitingChats: Record<string, boolean>;
  answerFailures: Record<string, { messageId: string; text: string; references?: Reference[] }>;
  retryAnswer: (chatId: string) => Promise<void>;
};

export const AskPatContext = createContext<AskPatContextValue | null>(null);
export function useAskPat() {
  const value = useContext(AskPatContext);
  if (!value) throw new Error("AskPat context is missing");
  return value;
}
