import { createClient } from "@/lib/supabase/server";
import Header from "./Header";

export default async function ServerHeader() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: string | null = null;
  let sellerHref = "/seller";

  if (user) {
    try {
      role = (user.app_metadata?.role as string) ?? null;

      if (!role) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        if (profileError) {
          console.error(
            "[ServerHeader] profile role lookup failed:",
            profileError,
          );
        } else if (profile?.role) {
          role = profile.role;
        }
      }

      if (role === "seller") {
        sellerHref = "/seller/dashboard";
      } else if (role === "admin") {
        try {
          const { data: store, error: storeError } = await supabase
            .from("stores")
            .select("id")
            .eq("seller_id", user.id)
            .maybeSingle();
          if (storeError) {
            console.error(
              "[ServerHeader] store lookup failed for admin; defaulting Seller link to /seller:",
              storeError,
            );
          } else if (store) {
            sellerHref = "/seller/dashboard";
          }
        } catch (err) {
          console.error(
            "[ServerHeader] store lookup threw for admin; defaulting Seller link to /seller:",
            err,
          );
        }
      }
    } catch (err) {
      console.error(
        "[ServerHeader] auth role resolution failed; rendering public navbar:",
        err,
      );
    }
  }

  return <Header role={role} sellerHref={sellerHref} />;
}
