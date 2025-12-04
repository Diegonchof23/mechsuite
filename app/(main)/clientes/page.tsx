// app/(main)/clientes/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ClientesClient from "./ClientesClient";

export default async function ClientesPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Solo Jefe puede ver clientes
  if (!session.roles.includes("Jefe")) {
    redirect("/");
  }

  const clientes = await prisma.cliente.findMany({
    orderBy: { id_cliente: "asc" },
  });

const clientesDTO = clientes.map((c) => ({
  id: c.id_cliente,
  razonSocial: c.razon_social,
  rut: c.rut,
  telefono: c.telefono,
  email: c.email,
  direccion: c.direccion ?? "",
}));


  return <ClientesClient clientes={clientesDTO} />;
}
