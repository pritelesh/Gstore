import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (pathname === "/account/login" || pathname === "/account/register") {
    if (user) {
      return NextResponse.redirect(new URL("/account", request.url));
    }
    return supabaseResponse;
  }

  if (pathname.startsWith("/account")) {
    if (!user) {
      return NextResponse.redirect(new URL("/account/login", request.url));
    }
    return supabaseResponse;
  }

  if (pathname.startsWith("/sell")) {
    if (!user) {
      return NextResponse.redirect(new URL("/sell/register", request.url));
    }
    const role = user.app_metadata?.role as string | undefined;
    if (role !== "seller") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return supabaseResponse;
  }

  if (pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/account/login", request.url));
    }
    const role = user.app_metadata?.role as string | undefined;
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return supabaseResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/account",
    "/account/:path*",
    "/sell",
    "/sell/:path*",
    "/admin",
    "/admin/:path*",
  ],
};
