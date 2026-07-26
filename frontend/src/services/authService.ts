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
// Local Storage Keys
// =========================
//

const ACCESS_TOKEN_KEY = "access_token";
const USER_KEY = "user";

//
// =========================
// Storage Helpers
// =========================
//

export function saveAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function removeAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function saveUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getCurrentUser(): User | null {
  const value = localStorage.getItem(USER_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function removeCurrentUser() {
  localStorage.removeItem(USER_KEY);
}

export function logout() {
  removeAccessToken();
  removeCurrentUser();
}

export function isAuthenticated() {
  return !!getAccessToken();
}

//
// =========================
// Login
// =========================
//

export async function loginUser(
  credentials: LoginRequest
): Promise<LoginResponse> {
  const formData = new URLSearchParams();

  formData.append("username", credentials.email);
  formData.append("password", credentials.password);

  const { data } =
    await api.post<LoginResponse>(
      "/auth/login",
      formData,
      {
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
      }
    );

  if (data.access_token) {
    saveAccessToken(data.access_token);
  }

  if (data.user) {
    saveUser(data.user);
  }

  return data;
}

//
// =========================
// Register
// =========================
//

export async function registerUser(
  user: RegisterRequest
) {
  const { data } = await api.post(
    "/auth/register",
    user
  );

  return data;
}

//
// =========================
// Profile
// =========================
//

export async function getProfile() {
  const { data } = await api.get<User>(
    "/auth/me"
  );

  return data;
}

export async function updateProfile(
  payload: Partial<User>
) {
  const { data } = await api.put(
    "/auth/me",
    payload
  );

  if (data.user) {
    saveUser(data.user);
  }

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
  const { data } = await api.put(
    "/auth/change-password",
    {
      current_password: currentPassword,
      new_password: newPassword,
    }
  );

  return data;
}

//
// =========================
// Refresh Token
// =========================
//
// Keep this function for future JWT refresh implementation.
//

export async function refreshAccessToken() {
  const { data } = await api.post(
    "/auth/refresh"
  );

  if (data.access_token) {
    saveAccessToken(data.access_token);
  }

  return data;
}