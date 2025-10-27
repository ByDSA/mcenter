/* eslint-disable import/no-default-export */
import { NextResponse } from "next/server";

export default function middleware(request) {
  const requestHeaders = new Headers(request.headers);

  // Agregar la URL completa como header
  requestHeaders.set("x-url", request.url);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  requestHeaders.set("x-search", request.nextUrl.search);

  return NextResponse.next( {
    request: {
      headers: requestHeaders,
    },
  } );
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest\\.).*)",
  ],
};
