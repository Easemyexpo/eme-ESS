"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";

export interface LoginResult {
  ok: boolean;
  message: string;
}

/** Credentials sign-in invoked from the login form. */
export async function loginAction(username: string, password: string): Promise<LoginResult> {
  try {
    await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    return { ok: true, message: "" };
  } catch (err) {
    if (err instanceof AuthError) {
      return { ok: false, message: "Invalid username or password." };
    }
    throw err;
  }
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}
