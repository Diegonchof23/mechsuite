import Link from "next/link";
import { getSession } from "@/lib/auth";

export async function Navbar() {
  const session = await getSession();
  const roles = session?.roles ?? [];

  const esJefe = roles.includes("Jefe");
  const esTecnico = roles.includes("Tecnico");

  const fullName = session
    ? `${session.nombre} ${session.apellido}`
    : "Usuario";

  return (
    <nav className="w-full bg-gray-900 text-white flex items-center justify-between px-6 py-3">
      {/* IZQUIERDA: Links visibles según rol */}
      <div className="flex items-center gap-6 text-sm">

        {/* Ambos roles: Técnico y Jefe */}
        <Link href="/">Inicio</Link>
        <Link href="/equipos">Equipos</Link>
        <Link href="/ordenes">Órdenes de Trabajo</Link>

        {/* SOLO JEFE */}
        {esJefe && (
          <>
            <Link href="/clientes">Clientes</Link>
            <Link href="/usuarios">Usuarios</Link>
            <Link href="/indicadores">Indicadores</Link>
          </>
        )}
      </div>

      {/* DERECHA: Usuario + menú */}
      <div className="flex items-center">
        <details className="relative group">
          <summary className="list-none flex items-center gap-2 cursor-pointer select-none">
            <span>{fullName}</span>
            <span className="text-xs">▼</span>
          </summary>

          <div className="absolute right-0 mt-2 bg-white text-gray-900 rounded shadow-lg min-w-[140px] py-1 z-10">
            <form action="/api/logout" method="post">
              <button
                type="submit"
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </details>
      </div>
    </nav>
  );
}
