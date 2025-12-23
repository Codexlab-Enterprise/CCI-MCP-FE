import { jwtDecode } from "jwt-decode";
import { NextResponse, NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Define all protected routes
  const protectedRoutes = [
    // '/',
    "/members/:path*",
    "/repository/category/:path*",
    "/repository/membership/:path*",
  ];

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route.replace("/:path*", "")),
  );

  // Get the token from cookies
  // const token = request.cookies.get("user")?.value;
   const accessToken = request.cookies.get("accessToken")?.value;

  //  let isTokenExpired = false;
  // if (accessToken) {
  //   try {
  //     const decodedToken = jwtDecode(accessToken);
  //     const currentTime = Date.now() / 1000;
  //     isTokenExpired = decodedToken.exp < currentTime;
  //   } catch (error) {
  //     isTokenExpired = true;
  //   }
  // }

  // If trying to access protected route without token, redirect to login
  if (isProtectedRoute && !accessToken ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If trying to access login page with token, redirect to members dashboard
  if (request.nextUrl.pathname.startsWith("/login") && accessToken) {
    return NextResponse.redirect(new URL("/members", request.url));
  }

  // For all other cases, continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/members/:path*",
    "/repository/category/:path*",
    "/repository/membership/:path*",
    "/login",
    // '/'
  ],
};
