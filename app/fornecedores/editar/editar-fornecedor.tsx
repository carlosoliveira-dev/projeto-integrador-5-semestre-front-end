"use client";

import { useSearchParams } from "next/navigation";
import StaticLink from "../../components/static-link";
import SupplierForm from "../../components/supplier-form";
import { useInventory } from "../../inventory-store";

export default function EditarFornecedorClient() {
  const supplierId = useSearchParams().get("id");
  const { suppliers, ready } = useInventory();
  const supplier = suppliers.find((item) => item.id === supplierId);

  if (!ready) {
    return <div className="empty-state"><p>Carregando fornecedor...</p></div>;
  }
  if (!supplierId || !supplier) {
    return (
      <div className="empty-state">
        <h1>Fornecedor não encontrado</h1>
        <p>O fornecedor pode ter sido removido, o link pode estar incompleto ou você não tem acesso a ele.</p>
        <StaticLink className="button button-primary" href="/fornecedores/">Voltar para fornecedores</StaticLink>
      </div>
    );
  }
  return <SupplierForm key={supplier.id} supplier={supplier} />;
}
