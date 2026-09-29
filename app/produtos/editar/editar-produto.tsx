"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ProductForm from "../../components/product-form";
import { useInventory } from "../../inventory-store";

export default function EditarProdutoClient() {
  const productId = useSearchParams().get("id");
  const { products, ready } = useInventory();
  const product = products.find((item) => item.id === productId);

  if (!ready) {
    return <div className="empty-state"><p>Carregando produto...</p></div>;
  }
  if (!productId || !product) {
    return (
      <div className="empty-state">
        <h1>Produto não encontrado</h1>
        <p>O produto pode ter sido removido, o link pode estar incompleto ou você não tem acesso a ele.</p>
        <Link className="button button-primary" href="/produtos">Voltar para produtos</Link>
      </div>
    );
  }
  return <ProductForm key={product.id} product={product} />;
}
