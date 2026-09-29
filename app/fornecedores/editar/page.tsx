import { Suspense } from "react";
import EditarFornecedorClient from "./editar-fornecedor";

export default function EditarFornecedorPage() {
  return (
    <Suspense fallback={<div className="empty-state"><p>Carregando fornecedor...</p></div>}>
      <EditarFornecedorClient />
    </Suspense>
  );
}
