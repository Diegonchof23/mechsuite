// app/(main)/usuarios/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import UsuariosClient from "./UsuariosClient";

export default async function UsuariosPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // 👇 BLOQUEO POR ROL: solo "Jefe" puede entrar a Usuarios
  if (!session.roles.includes("Jefe")) {
    redirect("/"); // o a la ruta que quieras como inicio del técnico
  }

  const usuarios = await prisma.usuario.findMany({
    include: {
      roles: {
        include: { rol: true },
      },
    },
  });

  const usuariosDTO = usuarios.map((u) => ({
    id: u.id_usuario,
    nombre: u.nombre,
    apellido: u.apellido,
    email: u.email,
    telefono: u.telefono,
    activo: u.activo,
    roles: u.roles.map((ur) => ur.rol.nombre),
  }));

  return <UsuariosClient usuarios={usuariosDTO} />;
}

