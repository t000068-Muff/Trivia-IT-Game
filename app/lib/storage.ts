import type { Users } from "./types";

const LS_USERS = "it_trivia.users";
const LS_SESSION = "it_trivia.session";

export function loadUsers(): Users {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(LS_USERS) || "{}") as Users;
  } catch {
    return {};
  }
}

export function saveUsers(u: Users): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_USERS, JSON.stringify(u));
}

export function loadSession(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LS_SESSION);
}

export function saveSession(phone: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_SESSION, phone);
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LS_SESSION);
}
