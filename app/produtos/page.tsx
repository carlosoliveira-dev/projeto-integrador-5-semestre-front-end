"use client";

import Link from "next/link";
import Image from "next/image";
import { useInventory } from "../inventory-store";

export default function ProdutosPage() {
  const { products, suppliers, ready } = useInventory();

  return (
    <div className="content-page">
      <div className="page-heading">
        <div><p className="eyebrow">CATÁLOGO DE ESTOQUE</p><h1>Produtos</h1><p>Consulte e gerencie os itens cadastrados no seu estoque.</p></div>
        <Link className="button button-primary" href="/produtos/cadastrar"><span aria-hidden="true">＋</span> Novo produto</Link>
      </div>
      <div className="list-summary">
        <span><strong>{ready ? products.length : "—"}</strong> produtos</span>
        <span><strong>{ready ? products.reduce((sum, product) => sum + product.quantity, 0) : "—"}</strong> unidades em estoque</span>
      </div>
      {!ready ? <div className="empty-state"><p>Carregando produtos...</p></div> : products.length ? (
        <div className="product-list">
          {products.map((product) => {
            const linkedCount = product.supplierIds.filter((id) =>
              suppliers.some((supplier) => supplier.id === id),
            ).length;
            return (
              <article className="product-row" key={product.id}>
                {product.image ? <Image className="product-image" src={product.image} alt={`Imagem de ${product.name}`} width={65} height={65} unoptimized /> : <span className="product-image image-placeholder" aria-hidden="true">▦</span>}
                <div className="product-main">
                  <span className="category-tag">{product.category}</span>
                  <h2>{product.name}</h2>
                  <p>{product.barcode} <span aria-hidden="true">·</span> {linkedCount} {linkedCount === 1 ? "fornecedor" : "fornecedores"}</p>
                </div>
                <div className="product-quantity"><small>EM ESTOQUE</small><strong>{product.quantity}</strong><span>unidades</span></div>
                <div className="product-actions">
                  <Link className="button button-outline" href={`/produtos/editar?id=${encodeURIComponent(product.id)}`}>Editar</Link>
                  <Link className="button button-quiet" href="/associar">Fornecedores <span aria-hidden="true">→</span></Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">▦</span>
          <h2>Seu catálogo está vazio</h2>
          <p>Cadastre seu primeiro produto para acompanhar as quantidades em estoque.</p>
          <Link className="button button-primary" href="/produtos/cadastrar">Cadastrar produto</Link>
        </div>
      )}
    </div>
  );
}
