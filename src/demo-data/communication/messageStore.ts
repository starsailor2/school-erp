import { messages as defaultMessages } from "@/demo-data/communication/messages";
import type { Message } from "@/types";

const STORAGE_KEY = "erp_messages";
const EVENT_NAME = "erp-messages-updated";

function isMessageArray(value: unknown): value is Message[] {
  return Array.isArray(value)
    && value.every((row) => row && typeof row === "object" && "id" in row && "sender_id" in row && "receiver_id" in row && "content" in row);
}

export function getMessages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultMessages;
    const parsed: unknown = JSON.parse(raw);
    return isMessageArray(parsed) ? parsed : defaultMessages;
  } catch {
    return defaultMessages;
  }
}

export function saveMessages(rows: Message[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function addMessage(row: Message) {
  saveMessages([row, ...getMessages()]);
}

export const MESSAGE_STORE_EVENT = EVENT_NAME;
