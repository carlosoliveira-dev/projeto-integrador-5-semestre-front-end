"use client";

import Link from "next/link";
import { useInventory } from "../inventory-store";

export default function FornecedoresPage() {
  const { suppliers, ready } = useInventory();

  return (
    <div className="content-page">
      <div className="page-heading">
        <div><p className="eyebrow">PARCEIROS COMERCIAIS</p><h1>Fornecedores</h1><p>Gerencie as informações dos seus parceiros.</p></div>
        <Link className="button button-primary" href="/fornecedores/cadastrar"><span aria-hidden="true">＋</span> Novo fornecedor</Link>
      </div>
      {!ready ? <div className="empty-state"><p>Carregando fornecedores...</p></div> : suppliers.length ? (
        <div className="supplier-grid">
          {suppliers.map((supplier) => (
            <article className="supplier-card" key={supplier.id}>
              <div className="supplier-card-top">
                <span className="supplier-avatar" aria-hidden="true">{supplier.companyName.slice(0, 1).toUpperCase()}</span>
                <span className="supplier-label">FORNECEDOR</span>
              </div>
              <h2>{supplier.companyName}</h2>
              <p className="supplier-contact">{supplier.contact}</p>
              <div className="supplier-details">
                <p><span aria-hidden="true">▣</span><span><small>CNPJ</small>{supplier.cnpj}</span></p>
                <p><span aria-hidden="true">✉</span><span><small>E-mail</small>{supplier.email}</span></p>
                <p><span aria-hidden="true">⌕</span><span><small>Telefone</small>{supplier.phone}</span></p>
                <p><span aria-hidden="true">⌖</span><span><small>Endereço</small>{supplier.address}</span></p>
              </div>
              <div className="supplier-actions">
                <Link className="button button-outline" href={`/fornecedores/${encodeURIComponent(supplier.id)}/editar`}>Editar fornecedor</Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">♧</span>
          <h2>Nenhum fornecedor cadastrado</h2>
          <p>Adicione os dados dos seus parceiros para vinculá-los aos produtos.</p>
          <Link className="button button-primary" href="/fornecedores/cadastrar">Cadastrar fornecedor</Link>
        </div>
      )}
    </div>
  );
}
