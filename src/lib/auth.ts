import { jwtDecode } from "jwt-decode";
import { API_BASE_URL } from "@/lib/config";

interface DecodedToken {
  exp: number;
  role: string;
  username: string;
}

export function getTokens() {
  if (typeof window !== "undefined") {
    const access_token = localStorage.getItem("access_token");
    const refresh_token = localStorage.getItem("refresh_token");
    return { access_token, refresh_token };
  }
  return { access_token: null, refresh_token: null };
}

export function setTokens(access_token: string, refresh_token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
  }
}

export function clearTokens() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("access_token");
  }
}

export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  const decodedToken = jwtDecode<DecodedToken>(token);
  const currTime = Math.floor(Date.now() / 1000);
  return decodedToken.exp < currTime;
}

export async function refreshAccessToken() {
  const { refresh_token } = getTokens();
  if (!refresh_token) {
    throw new Error("No refresh token available");
  }
  const r = await fetch(`${API_BASE_URL}/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token }),
  });

  const { access_token, refresh_token: new_refresh_token } = await r.json();
  setTokens(access_token, new_refresh_token);
  return access_token;
}

export function getUserRole(token: string | null): string | null {
  if (!token) return null;
  const decodedToken = jwtDecode<DecodedToken>(token);
  return decodedToken.role;
}

export function getUserName(token: string | null): string | null {
  if (!token) return null;
  const decodedToken = jwtDecode<DecodedToken>(token);
  return decodedToken.username;
}
