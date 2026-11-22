"use client";

import { AdminForm, TextInput } from "@/components/admin/forms";
import { signIn } from "../actions";

export function LoginForm() {
  return (
    <AdminForm action={signIn} submitLabel="Sign in · प्रवेश करा">
      <TextInput name="email" type="email" label="Email · ईमेल" autoComplete="username" inputMode="email" lang="en" required />
      <TextInput name="password" type="password" label="Password · पासवर्ड" autoComplete="current-password" lang="en" required />
    </AdminForm>
  );
}
