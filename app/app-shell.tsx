"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { InventoryProvider, useInventory } from "./inventory-store";

function ShellContents({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { storageError, ready, user, signOut } = useInventory();
  const isLoginPage = pathname === "/login";

  return (
    <>
      <header className="site-header">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">E</span>
          <span>estoque<span className="brand-accent">fácil</span></span>
        </Link>
        {user ? (
          <nav className="main-nav" aria-label="Navegação principal">
            <Link href="/">Visão geral</Link>
            <Link href="/produtos">Produtos</Link>
            <Link href="/fornecedores">Fornecedores</Link>
            <Link className="nav-action" href="/associar">Associações</Link>
            <span className="nav-user">{user.name}</span>
            <button className="nav-logout" type="button" onClick={signOut}>Sair</button>
          </nav>
        ) : isLoginPage ? null : (
          <nav className="main-nav" aria-label="Navegação principal">
            <Link className="nav-action" href="/login">Entrar</Link>
          </nav>
        )}
      </header>
      {storageError && (
        <div className="storage-alert" role="alert">{storageError}</div>
      )}
      <main className="page-shell">
        {isLoginPage ? children : user ? children : (
          <section className="auth-required">
            <span className="empty-icon" aria-hidden="true">↗</span>
            <p className="eyebrow">ACESSO À SUA CONTA</p>
            <h1>{ready ? "Entre para gerenciar seu estoque" : "Conectando à sua conta..."}</h1>
            <p>Produtos e associações são protegidos pela API. Entre ou crie uma conta para continuar.</p>
            {ready && <Link className="button button-primary" href="/login">Entrar ou criar conta</Link>}
          </section>
        )}
      </main>
      <footer className="site-footer">
        <span>Estoque Fácil</span>
        <span>Controle simples para o seu negócio.</span>
      </footer>
    </>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <InventoryProvider>
      <ShellContents>{children}</ShellContents>
    </InventoryProvider>
  );
}
