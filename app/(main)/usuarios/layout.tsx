// app/(main)/usuarios/layout.tsx
import React from "react";

export default function UsuariosLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <div className="relative">
      {children}
      {modal}
    </div>
  );
}
