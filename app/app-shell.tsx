"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import StaticLink from "./components/static-link";
import { InventoryProvider, useInventory } from "./inventory-store";

function ShellContents({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { storageError, ready, user, signOut } = useInventory();
  const isLoginPage = pathname === "/login" || pathname === "/login/";
  const isActiveRoute = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <>
      <header className={`site-header${!user && !isLoginPage ? " site-header-login" : ""}`}>
        <StaticLink className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">E</span>
          <span>estoque<span className="brand-accent">fácil</span></span>
        </StaticLink>
        {user ? (
          <nav className="main-nav" aria-label="Navegação principal">
            <div className="nav-links">
              <StaticLink
                className={isActiveRoute("/") ? "is-active" : undefined}
                href="/"
                aria-current={isActiveRoute("/") ? "page" : undefined}
              >
                Visão geral
              </StaticLink>
              <StaticLink
                className={isActiveRoute("/produtos") ? "is-active" : undefined}
                href="/produtos/"
                aria-current={isActiveRoute("/produtos") ? "page" : undefined}
              >
                Produtos
              </StaticLink>
              <StaticLink
                className={isActiveRoute("/fornecedores") ? "is-active" : undefined}
                href="/fornecedores/"
                aria-current={isActiveRoute("/fornecedores") ? "page" : undefined}
              >
                Fornecedores
              </StaticLink>
              <StaticLink
                className={`nav-action${isActiveRoute("/associar") ? " is-active" : ""}`}
                href="/associar/"
                aria-current={isActiveRoute("/associar") ? "page" : undefined}
              >
                Associações
              </StaticLink>
            </div>
            <div className="nav-account">
              <span className="nav-user">{user.name}</span>
              <button className="nav-logout" type="button" onClick={signOut}>Sair</button>
            </div>
          </nav>
        ) : isLoginPage ? null : (
          <nav className="main-nav" aria-label="Navegação principal">
            <div className="nav-links">
              <StaticLink
                className={`nav-action${isActiveRoute("/login") ? " is-active" : ""}`}
                href="/login/"
                aria-current={isActiveRoute("/login") ? "page" : undefined}
              >
                Entrar
              </StaticLink>
            </div>
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
            {ready && <StaticLink className="button button-primary" href="/login/">Entrar ou criar conta</StaticLink>}
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
