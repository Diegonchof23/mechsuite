import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Redirigir al login después del logout
  const url = new URL(req.url);
  url.pathname = "/login";

  const res = NextResponse.redirect(url);

  // Borrar la cookie de sesión
  res.cookies.set("session", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0, // expira inmediatamente
  });

  return res;
}
