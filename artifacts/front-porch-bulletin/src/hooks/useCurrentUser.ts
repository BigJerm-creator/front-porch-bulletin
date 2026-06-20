export interface CurrentUser {
  name: string;
  email: string;
  picture: string;
}

export function useCurrentUser(): CurrentUser | null {
  if (typeof localStorage === "undefined") return null;
  const stored = localStorage.getItem("user_info");
  if (!stored) return null;
  try {
    return JSON.parse(decodeURIComponent(stored));
  } catch {
    return null;
  }
}

export function useIsSignedIn(): boolean {
  if (typeof localStorage === "undefined") return false;
  return !!localStorage.getItem("session_token");
}
