// app/api/usuarios/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

// CREAR USUARIO
export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !session.roles.includes("Jefe")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { nombre, apellido, email, telefono, rol, activo, password } = body;

  if (!nombre || !apellido || !email || !rol || !password) {
    return NextResponse.json(
      { error: "Nombre, apellido, email, rol y contraseña son obligatorios" },
      { status: 400 }
    );
  }

  try {
    const rolDb = await prisma.rol.findFirst({
      where: { nombre: String(rol) },
    });

    if (!rolDb) {
      return NextResponse.json(
        { error: `Rol no encontrado: ${rol}` },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    const user = await prisma.usuario.create({
      data: {
        nombre: String(nombre),
        apellido: String(apellido),
        email: String(email),
        telefono:
          telefono === null || telefono === undefined || telefono === ""
            ? null
            : String(telefono),
        password_hash: passwordHash,
        activo: typeof activo === "boolean" ? activo : true,
      },
    });

    await prisma.usuarioRol.create({
      data: {
        id_usuario: user.id_usuario,
        id_rol: rolDb.id_rol,
      },
    });

    const userFull = await prisma.usuario.findUnique({
      where: { id_usuario: user.id_usuario },
      include: {
        roles: { include: { rol: true } },
      },
    });

    return NextResponse.json({ ok: true, user: userFull });
  } catch (err) {
    console.error("Error al crear usuario", err);
    return NextResponse.json(
      { error: "Error al crear usuario en la BD" },
      { status: 500 }
    );
  }
}

// ACTUALIZAR USUARIO
export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session || !session.roles.includes("Jefe")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { id, email, telefono, activo } = body;

  const idNum = Number(id);
  if (!idNum || Number.isNaN(idNum)) {
    return NextResponse.json(
      { error: `ID inválido en el body: ${String(id)}` },
      { status: 400 }
    );
  }

  const data: any = {};

  if (email !== undefined) {
    data.email = email === null ? null : String(email);
  }
  if (telefono !== undefined) {
    data.telefono = telefono === null ? null : String(telefono);
  }
  if (activo !== undefined) {
    data.activo = Boolean(activo);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "Nada para actualizar" },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.usuario.update({
      where: { id_usuario: idNum },
      data,
    });

    return NextResponse.json({ ok: true, user });
  } catch (err) {
    console.error("Error al actualizar usuario", err);
    return NextResponse.json(
      { error: "Error al actualizar en la BD" },
      { status: 500 }
    );
  }
}

// ELIMINAR USUARIO
export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session || !session.roles.includes("Jefe")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { id } = body;

  const idNum = Number(id);
  if (!idNum || Number.isNaN(idNum)) {
    return NextResponse.json(
      { error: `ID inválido en el body: ${String(id)}` },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.usuario.findUnique({
      where: { id_usuario: idNum },
      include: { ordenesCreadas: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    if (user.ordenesCreadas.length > 0) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar el usuario porque tiene órdenes de trabajo asociadas.",
        },
        { status: 400 }
      );
    }

    await prisma.usuarioRol.deleteMany({
      where: { id_usuario: idNum },
    });

    await prisma.usuario.delete({
      where: { id_usuario: idNum },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error al eliminar usuario", err);
    return NextResponse.json(
      { error: "Error al eliminar usuario en la BD" },
      { status: 500 }
    );
  }
}
