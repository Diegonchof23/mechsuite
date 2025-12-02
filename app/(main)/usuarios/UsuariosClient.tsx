"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.(com|cl)$/i;

type UsuarioDTO = {
  id: number;
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string | null;
  activo: boolean;
  roles: string[];
};

type CampoEditable = "email" | "telefono";

interface Props {
  usuarios: UsuarioDTO[];
}

export default function UsuariosClient({ usuarios }: Props) {
  const router = useRouter();

  // EDITAR
  const [abierto, setAbierto] = useState(false);
  const [campo, setCampo] = useState<CampoEditable>("email");
  const [valor, setValor] = useState("");
  const [usuarioSel, setUsuarioSel] = useState<UsuarioDTO | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargandoActivoId, setCargandoActivoId] = useState<number | null>(null);

  // BUSCAR
  const [search, setSearch] = useState("");

  // CREAR
  const [crearAbierto, setCrearAbierto] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoApellido, setNuevoApellido] = useState("");
  const [nuevoEmail, setNuevoEmail] = useState("");
  const [nuevoTelefono, setNuevoTelefono] = useState("");
  const [nuevoRol, setNuevoRol] = useState("");
  const [nuevoActivo, setNuevoActivo] = useState(true);
  const [nuevoPassword, setNuevoPassword] = useState("");
  const [errorCreacion, setErrorCreacion] = useState<string | null>(null);
  const [guardandoCreacion, setGuardandoCreacion] = useState(false);

  // ELIMINAR
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  // FILTROS
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [filtroRol, setFiltroRol] = useState<string>("");
  const [filtroActivo, setFiltroActivo] = useState<"todos" | "activos" | "inactivos">("todos");

  // ---------- MODAL EDITAR ----------
const abrirModal = (usuario: UsuarioDTO, campo: CampoEditable) => {
  setUsuarioSel(usuario);
  setCampo(campo);

  if (campo === "email") {
    setValor(usuario.email ?? "");
  } else {
    // Teléfono: si viene como 9XXXXXXXX, dejamos solo los 8 dígitos
    const tel = usuario.telefono ?? "";
    if (tel.startsWith("9") && tel.length === 9) {
      setValor(tel.slice(1)); // guardamos solo 8 dígitos en el estado
    } else {
      setValor(tel);
    }
  }

  setError(null);
  setAbierto(true);
};


  const cerrarModal = () => {
    setAbierto(false);
    setUsuarioSel(null);
    setError(null);
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!usuarioSel) return;

  setGuardando(true);
  setError(null);

  try {
    let body: any;

    if (campo === "email") {
      const emailTrim = valor.trim();

      if (!emailTrim) {
        throw new Error("El correo no puede estar vacío.");
      }

      if (!EMAIL_REGEX.test(emailTrim)) {
        throw new Error("Ingresa un correo válido que termine en .com o .cl.");
      }

      body = { id: usuarioSel.id, email: emailTrim };
    } else {
      // Teléfono
      const tel = valor.trim();

      if (tel === "") {
        // dejamos teléfono en null
        body = { id: usuarioSel.id, telefono: null };
      } else {
        // Solo 8 dígitos
        const soloNumeros = tel.replace(/\D/g, "");
        if (soloNumeros.length !== 8) {
          throw new Error(
            "El teléfono debe tener exactamente 8 dígitos (se guardará como 9XXXXXXXX)."
          );
        }
        body = { id: usuarioSel.id, telefono: `9${soloNumeros}` };
      }
    }

    const res = await fetch("/api/usuarios", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(data?.error || "Error al actualizar usuario");
    }

    cerrarModal();
    router.refresh();
  } catch (err: any) {
    setError(err.message ?? "Error desconocido");
  } finally {
    setGuardando(false);
  }
};


  const toggleActivo = async (u: UsuarioDTO) => {
    setCargandoActivoId(u.id);
    setError(null);
    setErrorGeneral(null);

    try {
      const res = await fetch("/api/usuarios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: u.id,
          activo: !u.activo,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Error al cambiar estado");
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "Error desconocido");
      setErrorGeneral(err.message ?? "Error desconocido");
    } finally {
      setCargandoActivoId(null);
    }
  };

  // ---------- MODAL CREAR ----------
  const abrirModalCrear = () => {
    setNuevoNombre("");
    setNuevoApellido("");
    setNuevoEmail("");
    setNuevoTelefono("");
    setNuevoRol("");
    setNuevoActivo(true);
    setNuevoPassword("");
    setErrorCreacion(null);
    setErrorGeneral(null);
    setCrearAbierto(true);
  };

  const cerrarModalCrear = () => {
    setCrearAbierto(false);
    setErrorCreacion(null);
  };

  const handleCrearSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nombreTrim = nuevoNombre.trim();
    const apellidoTrim = nuevoApellido.trim();
    const emailTrim = nuevoEmail.trim();
    const rolTrim = nuevoRol.trim();
    const passwordTrim = nuevoPassword.trim();

    if (!nombreTrim || !apellidoTrim || !emailTrim || !rolTrim || !passwordTrim) {
      setErrorCreacion(
        "Nombre, apellido, email, rol y contraseña son obligatorios."
      );
      return;
    }

    if (passwordTrim.length < 8) {
      setErrorCreacion("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (!EMAIL_REGEX.test(emailTrim)) {
      setErrorCreacion("Ingresa un correo válido que termine en .com o .cl.");
      return;
    }

    if (nuevoTelefono !== "" && nuevoTelefono.length !== 8) {
      setErrorCreacion(
        "El teléfono debe tener exactamente 8 dígitos (se guardará como 9XXXXXXXX)."
      );
      return;
    }

    setGuardandoCreacion(true);
    setErrorCreacion(null);
    setErrorGeneral(null);

    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombreTrim,
          apellido: apellidoTrim,
          email: emailTrim,
          telefono: nuevoTelefono === "" ? null : `9${nuevoTelefono}`,
          rol: rolTrim,
          activo: nuevoActivo,
          password: passwordTrim,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Error al crear usuario");
      }

      cerrarModalCrear();
      router.refresh();
    } catch (err: any) {
      setErrorCreacion(err.message ?? "Error desconocido");
      setErrorGeneral(err.message ?? "Error desconocido");
    } finally {
      setGuardandoCreacion(false);
    }
  };

  // ---------- ELIMINAR ----------
  const handleEliminar = async (u: UsuarioDTO) => {
    const ok = window.confirm(
      `¿Eliminar al usuario ${u.nombre} ${u.apellido}? Esta acción no se puede deshacer.`
    );
    if (!ok) return;

    setEliminandoId(u.id);
    setErrorGeneral(null);

    try {
      const res = await fetch("/api/usuarios", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: u.id }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Error al eliminar usuario");
      }

      router.refresh();
    } catch (err: any) {
      setErrorGeneral(err.message ?? "Error desconocido");
    } finally {
      setEliminandoId(null);
    }
  };

  // ---------- FILTRO EN CLIENTE (search + rol + activo) ----------
  const usuariosFiltrados = usuarios.filter((u) => {
    const t = search.toLowerCase().trim();

    if (t) {
      const coincideTexto =
        u.nombre.toLowerCase().includes(t) ||
        u.apellido.toLowerCase().includes(t) ||
        (u.email ?? "").toLowerCase().includes(t) ||
        (u.telefono ?? "").toLowerCase().includes(t) ||
        u.roles.join(" ").toLowerCase().includes(t);

      if (!coincideTexto) return false;
    }

    if (filtroRol && !u.roles.includes(filtroRol)) {
      return false;
    }

    if (filtroActivo === "activos" && !u.activo) return false;
    if (filtroActivo === "inactivos" && u.activo) return false;

    return true;
  });

  return (
    <div className="p-6">
      {/* TOOLBAR */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={abrirModalCrear}
          className="px-4 py-2 rounded bg-blue-600 text-white"
        >
          Añadir
        </button>

        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-1/2"
        />

        <button
          type="button"
          onClick={() => setFiltrosAbiertos((v) => !v)}
          className="px-4 py-2 rounded bg-gray-300"
        >
          {filtrosAbiertos ? "Ocultar filtros" : "Filtrar"}
        </button>
      </div>

      {/* FILTROS */}
      {filtrosAbiertos && (
        <div className="mb-4 p-3 border rounded flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm mb-1">Rol</label>
            <select
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="">Todos</option>
              <option value="Jefe">Jefe</option>
              <option value="Tecnico">Técnico</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Estado</label>
            <select
              value={filtroActivo}
              onChange={(e) =>
                setFiltroActivo(e.target.value as "todos" | "activos" | "inactivos")
              }
              className="border rounded px-3 py-2"
            >
              <option value="todos">Todos</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              setFiltroRol("");
              setFiltroActivo("todos");
            }}
            className="px-3 py-2 border rounded text-sm"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {errorGeneral && (
        <p className="text-sm text-red-600 mb-2">{errorGeneral}</p>
      )}

      <h1 className="text-2xl font-semibold mb-4">Usuarios</h1>

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Nombre</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Teléfono</th>
              <th className="px-4 py-2 text-left">Rol(es)</th>
              <th className="px-4 py-2 text-left">Activo</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-2">{u.id}</td>
                <td className="px-4 py-2">
                  {u.nombre} {u.apellido}
                </td>

                {/* EMAIL */}
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span>{u.email ?? "-"}</span>
                    <button
                      type="button"
                      onClick={() => abrirModal(u, "email")}
                      className="text-xs underline"
                      title="Editar correo"
                    >
                      ✏️
                    </button>
                  </div>
                </td>

                {/* TELÉFONO */}
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span>{u.telefono ?? "-"}</span>
                    <button
                      type="button"
                      onClick={() => abrirModal(u, "telefono")}
                      className="text-xs underline"
                      title="Editar teléfono"
                    >
                      ✏️
                    </button>
                  </div>
                </td>

                {/* ROLES */}
                <td className="px-4 py-2">
                  {u.roles.length > 0 ? u.roles.join(", ") : "-"}
                </td>

                {/* ACTIVO */}
                <td className="px-4 py-2">
                  <button
                    type="button"
                    onClick={() => toggleActivo(u)}
                    disabled={cargandoActivoId === u.id}
                    className="text-xl"
                    title={u.activo ? "Desactivar" : "Activar"}
                  >
                    {cargandoActivoId === u.id
                      ? "…"
                      : u.activo
                      ? "✅"
                      : "❌"}
                  </button>
                </td>


                <td className="px-4 py-2">
                  <button
                    type="button"
                    onClick={() => handleEliminar(u)}
                    disabled={eliminandoId === u.id}
                    title="Eliminar usuario"
                    className="hover:scale-110 transition cursor-pointer"
                  >
                    {eliminandoId === u.id ? (
                      "⏳"
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="red"
                      >
                        <path d="M9 3v1H4v2h16V4h-5V3H9zm1 5v10h2V8h-2zm4 0v10h2V8h-2zM5 8v12h14V8H5z" />
                      </svg>
                    )}
                  </button>
                </td>


              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL EDITAR */}
      {abierto && usuarioSel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Editar {campo === "email" ? "correo" : "teléfono"} de{" "}
              {usuarioSel.nombre} {usuarioSel.apellido}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">
                  {campo === "email" ? "Correo electrónico" : "Teléfono"}
                </label>
{campo === "email" ? (
  <input
    type="email"
    value={valor}
    onChange={(e) => setValor(e.target.value)}
    className="w-full border rounded px-3 py-2"
  />
) : (
  <>
    <div className="flex items-center">
      <span className="px-3 py-2 border border-r-0 rounded-l bg-gray-100">
        9
      </span>
      <input
        type="tel"
        inputMode="numeric"
        value={valor}
        onChange={(e) => {
          const soloNumeros = e.target.value.replace(/\D/g, "").slice(0, 8);
          setValor(soloNumeros);
        }}
        className="w-full border border-l-0 rounded-r px-3 py-2"
        placeholder="12345678"
      />
    </div>
    <p className="text-xs text-gray-500 mt-1">
      Solo números, 8 dígitos. Se guardará como 9XXXXXXXX.
    </p>
  </>
)}

              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="px-4 py-2 border rounded"
                  disabled={guardando}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white"
                  disabled={guardando}
                >
                  {guardando ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREAR */}
      {crearAbierto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Crear usuario</h2>

            <form onSubmit={handleCrearSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Nombre</label>
                <input
                  type="text"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Apellido</label>
                <input
                  type="text"
                  value={nuevoApellido}
                  onChange={(e) => setNuevoApellido(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Correo electrónico</label>
                <input
                  type="email"
                  value={nuevoEmail}
                  onChange={(e) => setNuevoEmail(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">
                  Teléfono (opcional)
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2 border border-r-0 rounded-l bg-gray-100">
                    9
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={nuevoTelefono}
                    onChange={(e) => {
                      const soloNumeros = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 8);
                      setNuevoTelefono(soloNumeros);
                    }}
                    className="w-full border border-l-0 rounded-r px-3 py-2"
                    placeholder="12345678"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Solo números, 8 dígitos. Se guardará como 9XXXXXXXX.
                </p>
              </div>

              <div>
                <label className="block text-sm mb-1">Rol</label>
                <select
                  value={nuevoRol}
                  onChange={(e) => setNuevoRol(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Selecciona un rol...</option>
                  <option value="Jefe">Jefe</option>
                  <option value="Tecnico">Tecnico</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Contraseña</label>
                <input
                  type="password"
                  value={nuevoPassword}
                  onChange={(e) => setNuevoPassword(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="nuevo-activo"
                  type="checkbox"
                  checked={nuevoActivo}
                  onChange={(e) => setNuevoActivo(e.target.checked)}
                />
                <label htmlFor="nuevo-activo" className="text-sm">
                  Usuario activo
                </label>
              </div>

              {errorCreacion && (
                <p className="text-sm text-red-600">{errorCreacion}</p>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={cerrarModalCrear}
                  className="px-4 py-2 border rounded"
                  disabled={guardandoCreacion}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white"
                  disabled={guardandoCreacion}
                >
                  {guardandoCreacion ? "Creando..." : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
