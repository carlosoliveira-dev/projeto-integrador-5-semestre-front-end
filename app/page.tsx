"use client";

import Link from "next/link";
import Image from "next/image";
import { useInventory } from "./inventory-store";

export default function Home() {
  const { products, suppliers, ready } = useInventory();
  const unitsInStock = products.reduce((total, product) => total + product.quantity, 0);
  const lowStock = products.filter(
    (product) => product.quantity > 0 && product.quantity <= 5,
  ).length;

  return (
    <div className="dashboard">
      <section className="welcome-panel">
        <div>
          <p className="eyebrow">PAINEL DE CONTROLE</p>
          <h1>Seu estoque, <span>sob controle.</span></h1>
          <p className="welcome-copy">
            Acompanhe seus produtos e fornecedores em um só lugar.
          </p>
          <div className="welcome-actions">
            <Link className="button button-light" href="/produtos/cadastrar">
              <span aria-hidden="true">＋</span> Cadastrar produto
            </Link>
            <Link className="welcome-link" href="/produtos">Ver produtos <span aria-hidden="true">→</span></Link>
          </div>
        </div>
        <div className="welcome-illustration" aria-hidden="true">
          <span className="illustration-box box-one">▧</span>
          <span className="illustration-box box-two">▤</span>
          <span className="illustration-box box-three">▧</span>
          <span className="illustration-spark">✳</span>
        </div>
      </section>

      <section className="stats-grid" aria-label="Resumo do estoque">
        <article className="stat-card">
          <span className="stat-icon icon-purple" aria-hidden="true">▦</span>
          <div><p>Produtos cadastrados</p><strong>{ready ? products.length : "—"}</strong></div>
          <Link className="stat-link" href="/produtos" aria-label="Ver produtos">↗</Link>
        </article>
        <article className="stat-card">
          <span className="stat-icon icon-green" aria-hidden="true">▤</span>
          <div><p>Unidades em estoque</p><strong>{ready ? unitsInStock : "—"}</strong></div>
          <span className="stat-footnote">em todos os produtos</span>
        </article>
        <article className="stat-card">
          <span className="stat-icon icon-orange" aria-hidden="true">♧</span>
          <div><p>Fornecedores</p><strong>{ready ? suppliers.length : "—"}</strong></div>
          <Link className="stat-link" href="/fornecedores" aria-label="Ver fornecedores">↗</Link>
        </article>
        <article className="stat-card">
          <span className="stat-icon icon-red" aria-hidden="true">⌁</span>
          <div><p>Estoque baixo</p><strong>{ready ? lowStock : "—"}</strong></div>
          <span className="stat-footnote">5 unidades ou menos</span>
        </article>
      </section>

      <section className="quick-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">COMECE POR AQUI</p>
            <h2>Ações rápidas</h2>
          </div>
        </div>
        <div className="quick-grid">
          <Link className="quick-card" href="/produtos/cadastrar">
            <span className="quick-icon quick-purple" aria-hidden="true">＋</span>
            <span><strong>Novo produto</strong><small>Adicione um item ao seu estoque</small></span>
            <span className="quick-arrow" aria-hidden="true">→</span>
          </Link>
          <Link className="quick-card" href="/fornecedores/cadastrar">
            <span className="quick-icon quick-orange" aria-hidden="true">♧</span>
            <span><strong>Novo fornecedor</strong><small>Cadastre um parceiro comercial</small></span>
            <span className="quick-arrow" aria-hidden="true">→</span>
          </Link>
          <Link className="quick-card" href="/associar">
            <span className="quick-icon quick-green" aria-hidden="true">↔</span>
            <span><strong>Associar fornecedor</strong><small>Vincule parceiros aos produtos</small></span>
            <span className="quick-arrow" aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section className="recent-section">
        <div className="section-heading">
          <div><p className="eyebrow">SEU CATÁLOGO</p><h2>Produtos recentes</h2></div>
          <Link className="text-link" href="/produtos">Ver todos <span aria-hidden="true">→</span></Link>
        </div>
        {products.length ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Produto</th><th>Categoria</th><th>Código de barras</th><th>Estoque</th></tr></thead>
              <tbody>
                {products.slice(-4).reverse().map((product) => (
                  <tr key={product.id}>
                    <td className="product-cell">{product.image ? <Image className="table-thumb" src={product.image} alt="" width={35} height={35} unoptimized /> : <span className="table-thumb thumb-placeholder">▦</span>}<strong>{product.name}</strong></td>
                    <td>{product.category}</td>
                    <td>{product.barcode}</td>
                    <td><span className={`stock-pill ${product.quantity <= 5 ? "stock-low" : "stock-ok"}`}>{product.quantity} un.</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">▦</span>
            <h3>Nenhum produto por aqui, ainda</h3>
            <p>Cadastre seu primeiro produto e comece a organizar o estoque.</p>
            <Link className="button button-primary" href="/produtos/cadastrar">Cadastrar produto</Link>
          </div>
        )}
      </section>
    </div>
  );
}
