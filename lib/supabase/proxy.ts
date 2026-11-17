import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { isPrivateRoute, isStaleRefresh } from "@/lib/auth";

function restoreRequestCookies(
  request: NextRequest,
  cookies: { name: string; value: string }[],
) {
  for (const cookie of request.cookies.getAll()) request.cookies.delete(cookie.name);
  for (const cookie of cookies) request.cookies.set(cookie.name, cookie.value);
}

function redirectWithSession(
  request: NextRequest,
  session: NextResponse,
  pathname: string,
  nextPath?: string,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  if (nextPath) url.searchParams.set("next", nextPath);

  const redirect = NextResponse.redirect(url);
  const refreshedCookies = session.headers.get("x-middleware-set-cookie");
  if (refreshedCookies) redirect.headers.set("x-middleware-set-cookie", refreshedCookies);
  return redirect;
}

export async function updateSession(request: NextRequest) {
  const snapshot = request.cookies.getAll().map(({ name, value }) => ({ name, value }));
  const pathname = request.nextUrl.pathname;
  request.headers.set("x-portal-path", pathname);

  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const finish = (signedIn: boolean) => {
    if (!signedIn && isPrivateRoute(pathname)) {
      return redirectWithSession(request, response, "/login", pathname);
    }

    if (signedIn && pathname === "/login") {
      const nextPath = request.nextUrl.searchParams.get("next");
      return redirectWithSession(
        request,
        response,
        nextPath && isPrivateRoute(nextPath) ? nextPath : "/dashboard",
      );
    }

    return response;
  };

  try {
    const { data, error } = await supabase.auth.getClaims();

    if (error && isStaleRefresh(error)) {
      restoreRequestCookies(request, snapshot);
      return NextResponse.next({ request });
    }

    return finish(Boolean(data?.claims));
  } catch (error) {
    console.error(error);
    restoreRequestCookies(request, snapshot);
    response = NextResponse.next({ request });
    return finish(false);
  }
}
