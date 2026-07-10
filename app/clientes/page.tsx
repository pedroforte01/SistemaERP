import Link from "next/link";
import { getClientes } from "./data";

export default async function ClientesPage() {
  const clientes = await getClientes();

  return (
    <div>
      <h1>Clientes</h1>

      <Link href="/clientes/novo">+ Novo Cliente</Link>

      <ul>
        {clientes.map((cliente) => (
          <li key={cliente.id}>
            <strong>{cliente.nome}</strong> ({cliente.documento}) —{" "}
            {cliente.email} — {cliente.telefone}
          </li>
        ))}
      </ul>
    </div>
  );
}