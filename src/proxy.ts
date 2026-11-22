import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Runs only for /admin. Keeps the admin's Supabase session fresh and sends anyone
 * who is not signed in to the login page. (Admin rights are checked again on the
 * server for every page and action, and by the database itself.)
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const isLogin = request.nextUrl.pathname === "/admin/login";

  if (url && key) {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(toSet) {
          for (const { name, value } of toSet) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of toSet) response.cookies.set(name, value, options);
        },
      },
    });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && !isLogin) {
      const login = request.nextUrl.clone();
      login.pathname = "/admin/login";
      login.search = "";
      return withAdminHeaders(NextResponse.redirect(login));
    }
  } else if (!isLogin) {
    const login = request.nextUrl.clone();
    login.pathname = "/admin/login";
    login.search = "?reason=setup";
    return withAdminHeaders(NextResponse.redirect(login));
  }

  return withAdminHeaders(response);
}

function withAdminHeaders(response: NextResponse) {
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
