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
    full_name: data.name,
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
  let serverClient;
  try {
    serverClient = await createClient();
  } catch (err) {
    console.error("[signIn] createClient error:", err);
    return { type: "error", error: "Failed to create server client." };
  }

  let authData;
  try {
    const res = await serverClient.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (res.error) return { type: "error", error: res.error.message };
    authData = res.data;
  } catch (err) {
    console.error("[signIn] signInWithPassword exception:", err);
    return { type: "error", error: err instanceof Error ? err.message : "Auth sign-in failed." };
  }

  if (!authData?.user) return { type: "error", error: "No user returned after sign-in." };

  let role = (authData.user.app_metadata?.role as string) ?? null;

  // Fallback: query profiles table if app_metadata role is missing
  if (!role) {
    try {
      const { data: profile, error: profileError } = await serverClient
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .maybeSingle();
      if (profileError) {
        console.error("[signIn] profile query error:", profileError);
      } else if (profile?.role) {
        role = profile.role;
      }
    } catch (err) {
      console.error("[signIn] profile query exception:", err);
    }

    // Admin fallback if server-client query failed (RLS may block fresh session)
    if (!role) {
      try {
        const adminDb = createAdminClient();
        const { data: adminProfile } = await adminDb
          .from("profiles")
          .select("role")
          .eq("id", authData.user.id)
          .single();
        if (adminProfile?.role) role = adminProfile.role;
      } catch (err) {
        console.error("[signIn] admin fallback exception:", err);
      }
    }
  }

  return { type: "success", role };
}

export async function upgradeToSeller(data: {
  storeName: string;
  storeDescription?: string;
}): Promise<ActionResult> {
  const adminClient = createAdminClient();
  const serverClient = await createClient();

  const { data: { user } } = await serverClient.auth.getUser();
  if (!user) return { type: "error", error: "Not authenticated." };

  // Create store
  const { error: storeError } = await adminClient.from("stores").insert({
    seller_id: user.id,
    name: data.storeName,
    description: data.storeDescription ?? null,
    status: "pending",
  });
  if (storeError) return { type: "error", error: storeError.message };

  // Update profiles.role
  const { error: profileError } = await adminClient
    .from("profiles")
    .update({ role: "seller" })
    .eq("id", user.id);
  if (profileError) return { type: "error", error: profileError.message };

  // Update auth user app_metadata
  const { error: metaError } = await adminClient.auth.admin.updateUserById(
    user.id,
    { app_metadata: { role: "seller" } },
  );
  if (metaError) return { type: "error", error: metaError.message };

  return { type: "success" };
}

export async function sellerSignIn(data: {
  email: string;
  password: string;
}): Promise<
  | { type: "error"; error: string }
  | { type: "success"; storeName: string }
> {
  const serverClient = await createClient();

  const { data: authData, error } =
    await serverClient.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

  if (error) return { type: "error", error: error.message };
  if (!authData.user) return { type: "error", error: "No user returned." };

  const { data: store, error: storeError } = await serverClient
    .from("stores")
    .select("name")
    .eq("seller_id", authData.user.id)
    .maybeSingle();

  if (storeError) return { type: "error", error: storeError.message };

  if (!store) {
    return {
      type: "error",
      error: "NO_SELLER_ACCOUNT",
    };
  }

  return { type: "success", storeName: store.name };
}

export async function adminSignIn(data: {
  email: string;
  password: string;
}): Promise<
  | { type: "error"; error: string }
  | { type: "success"; adminName: string }
> {
  const serverClient = await createClient();

  const { data: authData, error } =
    await serverClient.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

  if (error) return { type: "error", error: error.message };
  if (!authData.user) return { type: "error", error: "No user returned." };

  let role = (authData.user.app_metadata?.role as string) ?? null;
  if (role !== "admin") {
    const adminDb = createAdminClient();
    const { data: profile } = await adminDb
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();
    if (profile?.role) role = profile.role;
  }

  if (role !== "admin") {
    return { type: "error", error: "NO_ADMIN_ACCESS" };
  }

  const adminDb = createAdminClient();
  const { data: profile } = await adminDb
    .from("profiles")
    .select("full_name")
    .eq("id", authData.user.id)
    .single();

  return { type: "success", adminName: profile?.full_name ?? "Admin" };
}

export async function signOut(): Promise<ActionResult> {
  const serverClient = await createClient();
  const { error } = await serverClient.auth.signOut();
  if (error) return { type: "error", error: error.message };
  return { type: "success" };
}
