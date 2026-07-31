const fs = require("fs");
const { createClient } = require("./node_modules/@supabase/supabase-js");

const env = {};
for (const l of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const adminDb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const url = new URL(env.NEXT_PUBLIC_SUPABASE_URL);
const ref = url.hostname.split(".")[0];

const TEST_EMAIL = "opencode_test_admin@example.com";
const TEST_PASS = "TestAdminPass123!";

(async () => {
  const { data: existing } = await adminDb.auth.admin.listUsers();
  let userId;
  const existingUser = (existing?.users ?? []).find((u) => u.email === TEST_EMAIL);
  if (existingUser) {
    userId = existingUser.id;
    console.log("existing user found");
  } else {
    const { data: created, error: createErr } = await adminDb.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASS,
      email_confirm: true,
      app_metadata: { role: "admin" },
      user_metadata: { full_name: "OpenCode Test Admin" },
    });
    if (createErr) throw new Error("createUser: " + createErr.message);
    userId = created.user.id;
    console.log("created user", userId);
  }

  const { error: profileErr } = await adminDb
    .from("profiles")
    .upsert({ id: userId, role: "admin", full_name: "OpenCode Test Admin", email: TEST_EMAIL }, { onConflict: "id" });
  if (profileErr) throw new Error("upsert profile: " + profileErr.message);

  const { data: deleted, error: delErr } = await adminDb.from("stores").delete().eq("seller_id", userId);
  console.log("deleted stores:", deleted?.length ?? 0, delErr?.message ?? "");

  const browser = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: sess, error: signInErr } = await browser.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASS,
  });
  if (signInErr) throw new Error("signIn: " + signInErr.message);

  const cookieValue = Buffer.from(JSON.stringify({
    access_token: sess.session.access_token,
    refresh_token: sess.session.refresh_token,
    expires_in: sess.session.expires_in,
    expires_at: sess.session.expires_at,
    token_type: sess.session.token_type,
    user: sess.user,
  })).toString("base64url");

  console.log("COOKIE_NAME=sb-" + ref + "-auth-token");
  console.log("COOKIE_VALUE=" + cookieValue);
  console.log("TEST_EMAIL=" + TEST_EMAIL);
  console.log("TEST_PASS=" + TEST_PASS);
})();
