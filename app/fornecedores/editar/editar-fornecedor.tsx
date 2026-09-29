"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
        <Link className="button button-primary" href="/fornecedores">Voltar para fornecedores</Link>
      </div>
    );
  }
  return <SupplierForm key={supplier.id} supplier={supplier} />;
}
