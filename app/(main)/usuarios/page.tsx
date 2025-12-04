import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import UsuariosClient from "./UsuariosClient";

export default async function UsuariosPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  if (!session.roles.includes("Jefe")) {
    redirect("/");
  }

  const usuarios = await prisma.usuario.findMany({
    where: {
      // 👇 NO traer el usuario admin
      email: {
        not: "admin@admin.cl",
      },
      nombre: {
        not: "Admin",
      },
    },
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
