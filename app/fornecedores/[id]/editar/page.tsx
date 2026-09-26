"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import SupplierForm from "../../../components/supplier-form";
import { useInventory } from "../../../inventory-store";

export default function EditarFornecedorPage() {
  const params = useParams<{ id: string }>();
  const { suppliers, ready } = useInventory();
  const supplier = suppliers.find((item) => item.id === params.id);

  if (!ready) {
    return <div className="empty-state"><p>Carregando fornecedor...</p></div>;
  }
  if (!supplier) {
    return (
      <div className="empty-state">
        <h1>Fornecedor não encontrado</h1>
        <p>O fornecedor pode ter sido removido ou você não tem acesso a ele.</p>
        <Link className="button button-primary" href="/fornecedores">Voltar para fornecedores</Link>
      </div>
    );
  }
  return <SupplierForm key={supplier.id} supplier={supplier} />;
}
