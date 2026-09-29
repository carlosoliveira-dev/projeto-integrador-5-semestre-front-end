import { Suspense } from "react";
import EditarProdutoClient from "./editar-produto";

export default function EditarProdutoPage() {
  return (
    <Suspense fallback={<div className="empty-state"><p>Carregando produto...</p></div>}>
      <EditarProdutoClient />
    </Suspense>
  );
}
