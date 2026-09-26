"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, type FormEvent } from "react";
import { useInventory } from "../inventory-store";

export default function AssociarPage() {
  const {
    products,
    suppliers,
    ready,
    associateSupplier,
    disassociateSupplier,
  } = useInventory();
  const [productId, setProductId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [feedback, setFeedback] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const product = products.find((item) => item.id === productId);
  const associatedSuppliers = suppliers.filter((supplier) =>
    product?.supplierIds.includes(supplier.id),
  );

  async function handleAssociate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!productId || !supplierId) {
      setFeedback("Selecione um produto e um fornecedor para continuar.");
      setSuccess(false);
      return;
    }
    setSubmitting(true);
    try {
      const result = await associateSupplier(productId, supplierId);
      if (result === "already-associated") {
        setFeedback("Fornecedor já está associado a este produto!");
        setSuccess(false);
        return;
      }
      setFeedback("Fornecedor associado com sucesso ao produto!");
      setSuccess(true);
      setSupplierId("");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível associar o fornecedor.");
      setSuccess(false);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDisassociate(id: string) {
    if (!product) return;
    try {
      await disassociateSupplier(product.id, id);
      setFeedback("Fornecedor desassociado com sucesso!");
      setSuccess(true);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível desassociar o fornecedor.");
      setSuccess(false);
    }
  }

  return (
    <div className="content-page association-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">GESTÃO DE PARCERIAS</p>
          <h1>Associação de fornecedor a produto</h1>
          <p>Escolha um produto e gerencie os fornecedores relacionados a ele.</p>
        </div>
      </div>
      {!ready ? <div className="empty-state"><p>Carregando catálogo...</p></div> : products.length ? (
        <>
          {feedback && <p className={`form-feedback association-feedback ${success ? "feedback-success" : "feedback-error"}`} role={success ? "status" : "alert"}>{feedback}</p>}
          <div className="association-layout">
            <section className="association-main">
              <div className="form-card association-card">
                <div className="form-section-heading">
                  <span className="form-section-icon" aria-hidden="true">▦</span>
                  <div><h2>Produto selecionado</h2><p>As informações abaixo são somente para consulta.</p></div>
                </div>
                <div className="form-field product-picker">
                  <label htmlFor="associationProduct">Produto</label>
                  <select id="associationProduct" value={productId} onChange={(event) => {
                    setProductId(event.target.value);
                    setFeedback("");
                  }}>
                    <option value="">Selecione um produto</option>
                    {products.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </div>
                {product ? (
                  <div className="product-detail-card">
                    {product.image ? <Image className="detail-image" src={product.image} alt={`Imagem de ${product.name}`} width={89} height={89} unoptimized /> : <span className="detail-image image-placeholder" aria-hidden="true">▦</span>}
                    <div className="product-detail-copy">
                      <span className="category-tag">{product.category}</span>
                      <h3>{product.name}</h3>
                      <dl>
                        <div><dt>Código de barras</dt><dd>{product.barcode}</dd></div>
                        <div><dt>Estoque</dt><dd>{product.quantity} unidades</dd></div>
                        <div className="detail-description"><dt>Descrição</dt><dd>{product.description}</dd></div>
                      </dl>
                    </div>
                  </div>
                ) : (
                  <div className="selection-hint"><span aria-hidden="true">↖</span><p>Selecione um produto acima para consultar seus dados e fornecedores.</p></div>
                )}
              </div>
              <div className="form-card association-card">
                <div className="form-section-heading">
                  <span className="form-section-icon icon-green" aria-hidden="true">↔</span>
                  <div><h2>Adicionar fornecedor</h2><p>Vincule um parceiro comercial a este produto.</p></div>
                </div>
                {suppliers.length ? (
                  <form onSubmit={handleAssociate}>
                    <div className="form-field">
                      <label htmlFor="supplierSelect">Fornecedor</label>
                      <select id="supplierSelect" value={supplierId} onChange={(event) => setSupplierId(event.target.value)} disabled={!productId}>
                        <option value="">Selecione um fornecedor</option>
                        {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.companyName} — {supplier.cnpj}</option>)}
                      </select>
                    </div>
                    <button className="button button-primary association-button" type="submit" disabled={!productId || !supplierId || submitting}><span aria-hidden="true">＋</span> {submitting ? "Associando..." : "Associar fornecedor"}</button>
                  </form>
                ) : (
                  <div className="inline-empty">
                    <p>Cadastre um fornecedor antes de criar uma associação.</p>
                    <Link className="text-link" href="/fornecedores/cadastrar">Cadastrar fornecedor <span aria-hidden="true">→</span></Link>
                  </div>
                )}
              </div>
            </section>
            <aside className="form-card linked-suppliers-card">
              <div className="section-heading compact-heading">
                <div><p className="eyebrow">PARCEIROS DO PRODUTO</p><h2>Fornecedores associados</h2></div>
                <span className="count-badge">{associatedSuppliers.length}</span>
              </div>
              {!productId ? (
                <div className="linked-empty"><span aria-hidden="true">↖</span><p>Selecione um produto para visualizar os fornecedores associados.</p></div>
              ) : associatedSuppliers.length ? (
                <ul className="linked-supplier-list">
                  {associatedSuppliers.map((supplier) => (
                    <li key={supplier.id}>
                      <span className="supplier-avatar small-avatar" aria-hidden="true">{supplier.companyName.slice(0, 1).toUpperCase()}</span>
                      <span className="linked-supplier-copy"><strong>{supplier.companyName}</strong><small>{supplier.cnpj}</small></span>
                      <button type="button" className="icon-button remove-button" aria-label={`Desassociar ${supplier.companyName}`} title="Desassociar fornecedor" onClick={() => handleDisassociate(supplier.id)}>×</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="linked-empty"><span aria-hidden="true">♧</span><p>Nenhum fornecedor associado a este produto.</p></div>
              )}
            </aside>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">↔</span>
          <h2>Cadastre um produto para começar</h2>
          <p>As associações são gerenciadas a partir dos produtos do seu catálogo.</p>
          <Link className="button button-primary" href="/produtos/cadastrar">Cadastrar produto</Link>
        </div>
      )}
    </div>
  );
}
