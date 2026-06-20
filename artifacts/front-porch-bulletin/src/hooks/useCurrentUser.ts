export interface CurrentUser {
  name: string;
  email: string;
  picture: string;
}

function readUserInfoCookie(): CurrentUser | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )user_info=([^;]*)/);
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

export function useCurrentUser(): CurrentUser | null {
  return readUserInfoCookie();
}

export function useIsSignedIn(): boolean {
  return readUserInfoCookie() !== null;
}
