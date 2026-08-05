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
          const { data: seller, error: sellerError } = await supabase
            .from("sellers")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();
          if (sellerError) {
            console.error(
              "[ServerHeader] seller lookup failed for admin; defaulting Seller link to /seller:",
              sellerError,
            );
          } else if (seller) {
            sellerHref = "/seller/dashboard";
          }
        } catch (err) {
          console.error(
            "[ServerHeader] seller lookup threw for admin; defaulting Seller link to /seller:",
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
