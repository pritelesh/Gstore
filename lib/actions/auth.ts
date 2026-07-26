"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type ActionResult =
  | { type: "error"; error: string }
  | { type: "success" };

type SignInResult =
  | { type: "error"; error: string }
  | { type: "success"; role: string | null };

export async function signUp(data: {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: "customer" | "seller";
  storeName?: string;
  storeDescription?: string;
}): Promise<ActionResult> {
  const adminClient = createAdminClient();

  const { data: authData, error: authError } =
    await adminClient.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      app_metadata: { role: data.role },
    });

  if (authError) return { type: "error", error: authError.message };
  if (!authData.user) return { type: "error", error: "Failed to create user." };

  const { error: profileError } = await adminClient.from("profiles").insert({
    id: authData.user.id,
    role: data.role,
    name: data.name,
    email: data.email,
    phone: data.phone ?? null,
  });

  if (profileError) return { type: "error", error: profileError.message };

  if (data.role === "seller") {
    const { error: storeError } = await adminClient.from("stores").insert({
      seller_id: authData.user.id,
      name: data.storeName ?? data.name + "'s Store",
      description: data.storeDescription ?? null,
      status: "pending",
    });

    if (storeError) return { type: "error", error: storeError.message };
  }

  const serverClient = await createClient();

  const { error: signInError } =
    await serverClient.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

  if (signInError) return { type: "error", error: signInError.message };

  return { type: "success" };
}

export async function signIn(data: {
  email: string;
  password: string;
}): Promise<SignInResult> {
  const serverClient = await createClient();

  const { data: authData, error } =
    await serverClient.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

  if (error) return { type: "error", error: error.message };

  const role = (authData.user?.app_metadata?.role as string) ?? null;

  return { type: "success", role };
}

export async function signOut(): Promise<ActionResult> {
  const serverClient = await createClient();
  const { error } = await serverClient.auth.signOut();
  if (error) return { type: "error", error: error.message };
  return { type: "success" };
}
