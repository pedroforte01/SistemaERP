import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>Sistema ERP</h1>

      <nav>
        <ul>
          <li>
            <Link href="/clientes">Clientes</Link>
          </li>
          <li>
            <Link href="/dashboard">Dashboard</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}