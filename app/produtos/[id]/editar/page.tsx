"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import ProductForm from "../../../components/product-form";
import { useInventory } from "../../../inventory-store";

export default function EditarProdutoPage() {
  const params = useParams<{ id: string }>();
  const { products, ready } = useInventory();
  const product = products.find((item) => item.id === params.id);

  if (!ready) {
    return <div className="empty-state"><p>Carregando produto...</p></div>;
  }
  if (!product) {
    return (
      <div className="empty-state">
        <h1>Produto não encontrado</h1>
        <p>O produto pode ter sido removido ou você não tem acesso a ele.</p>
        <Link className="button button-primary" href="/produtos">Voltar para produtos</Link>
      </div>
    );
  }
  return <ProductForm key={product.id} product={product} />;
}
