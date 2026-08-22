import api from "../api/api";

//
// =========================
// Types
// =========================
//

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  created_at?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user?: User;
}

//
// =========================
// Storage Keys
// =========================
//

const ACCESS_TOKEN_KEY = "access_token";
const USER_KEY = "user";

//
// =========================
// Storage Helpers
// =========================
//

const hasStorage =
  typeof window !== "undefined";

function setStorage(key: string, value: string) {
  if (!hasStorage) return;
  localStorage.setItem(key, value);
}

function getStorage(key: string): string | null {
  if (!hasStorage) return null;
  return localStorage.getItem(key);
}

function removeStorage(key: string) {
  if (!hasStorage) return;
  localStorage.removeItem(key);
}

//
// =========================
// Token
// =========================
//

export function saveAccessToken(token: string): void {
  setStorage(ACCESS_TOKEN_KEY, token);
}

export function getAccessToken(): string | null {
  return getStorage(ACCESS_TOKEN_KEY);
}

export function removeAccessToken(): void {
  removeStorage(ACCESS_TOKEN_KEY);
}

//
// =========================
// User
// =========================
//

export function saveUser(user: User): void {
  setStorage(USER_KEY, JSON.stringify(user));
}

export function getCurrentUser(): User | null {
  const raw = getStorage(USER_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as User;
  } catch {
    removeCurrentUser();
    return null;
  }
}

export function removeCurrentUser(): void {
  removeStorage(USER_KEY);
}

//
// =========================
// Auth
// =========================
//

export function logout(): void {
  removeAccessToken();
  removeCurrentUser();
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

//
// =========================
// Login
// =========================
//

export async function loginUser(
  credentials: LoginRequest
): Promise<LoginResponse> {
  const body = new URLSearchParams({
    username: credentials.email,
    password: credentials.password,
  });

  const { data } = await api.post<LoginResponse>(
    "/auth/login",
    body,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return data;
}

//
// =========================
// Register
// =========================
//

export async function registerUser(payload: RegisterRequest) {
  // The registration form uses `name`, while the backend
  // UserCreate schema expects the field to be called `username`.
  const body = {
    username: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
  };

  const { data } = await api.post("/auth/register", body);

  return data;
}

//
// =========================
// Profile
// =========================
//

export async function getProfile(): Promise<User> {
  const { data } = await api.get<User>("/auth/me");

  return data;
}

export async function updateProfile(
  payload: Partial<User>
): Promise<User> {
  const { data } = await api.put<User>("/auth/me", payload);

  saveUser(data);

  return data;
}

//
// =========================
// Password
// =========================
//

export async function changePassword(
  currentPassword: string,
  newPassword: string
) {
  const { data } = await api.put("/auth/change-password", {
    current_password: currentPassword,
    new_password: newPassword,
  });

  return data;
}

//
// =========================
// Refresh Token
// =========================
//

export async function refreshAccessToken(): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/refresh");

  if (data.access_token) {
    saveAccessToken(data.access_token);
  }

  return data;
}
