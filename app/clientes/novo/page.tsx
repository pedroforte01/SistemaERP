"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NovoClientePage() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [documento, setDocumento] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    await fetch("/api/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, documento, email, telefone }),
    });

    router.push("/clientes");
  }

  return (
    <div>
      <h1>Novo Cliente</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <div>
          <label>Documento</label>
          <input
            type="text"
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
          />
        </div>

        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label>Telefone</label>
          <input
            type="text"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />
        </div>

        <button type="submit">Salvar</button>
      </form>
    </div>
  );
}