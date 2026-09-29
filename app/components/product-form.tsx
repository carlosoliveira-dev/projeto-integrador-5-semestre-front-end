"use client";

import Image from "next/image";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import StaticLink from "./static-link";
import { digitsOnly } from "../form-utils";
import { useInventory, type Product } from "../inventory-store";

type ProductFields = {
  name: string;
  barcode: string;
  description: string;
  quantity: string;
  category: string;
  customCategory: string;
  expirationDate: string;
};

type ProductField = keyof ProductFields;
type FieldErrors = Partial<Record<ProductField | "image", string>>;

const categories = [
  "Eletrônicos",
  "Alimentos",
  "Vestuário",
  "Casa e decoração",
  "Saúde e beleza",
  "Outro",
];

function fieldsFromProduct(product?: Product): ProductFields {
  const knownCategory = categories.includes(product?.category ?? "");
  return {
    name: product?.name ?? "",
    barcode: product?.barcode ?? "",
    description: product?.description ?? "",
    quantity: String(product?.quantity ?? 0),
    category: product ? (knownCategory ? product.category : "Outro") : "",
    customCategory: product && !knownCategory ? product.category : "",
    expirationDate: product?.expirationDate ?? "",
  };
}

export default function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const { products, addProduct, updateProduct, ready } = useInventory();
  const editing = !!product;
  const [fields, setFields] = useState(() => fieldsFromProduct(product));
  const [image, setImage] = useState(product?.image ?? "");
  const [imageName, setImageName] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [feedback, setFeedback] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function updateField(field: ProductField, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFeedback("");
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setImageName("");
    if (!file) {
      setErrors((current) => ({ ...current, image: undefined }));
      return;
    }
    if (!file.type.startsWith("image/")) {
      setErrors((current) => ({ ...current, image: "Selecione um arquivo de imagem." }));
      return;
    }
    if (file.size > 1024 * 1024) {
      setErrors((current) => ({ ...current, image: "A imagem deve ter no máximo 1 MB." }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImage(reader.result);
        setImageName(file.name);
        setErrors((current) => ({ ...current, image: undefined }));
      }
    };
    reader.onerror = () => {
      setErrors((current) => ({ ...current, image: "Não foi possível ler a imagem selecionada." }));
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    if (!fields.name.trim()) nextErrors.name = "Informe o nome do produto.";
    if (!fields.barcode.trim()) nextErrors.barcode = "Informe o código de barras.";
    else if (!/^\d+$/.test(fields.barcode)) nextErrors.barcode = "O código deve conter apenas números.";
    else if (products.some((item) => item.id !== product?.id && item.barcode === fields.barcode)) {
      nextErrors.barcode = "Este código de barras já está cadastrado.";
    }
    if (!fields.description.trim()) nextErrors.description = "Informe uma descrição para o produto.";
    if (!fields.category) nextErrors.category = "Selecione uma categoria.";
    if (fields.category === "Outro" && !fields.customCategory.trim()) {
      nextErrors.customCategory = "Informe o nome da categoria.";
    }
    if (fields.quantity && (!/^\d+$/.test(fields.quantity) || Number(fields.quantity) < 0)) {
      nextErrors.quantity = "Informe uma quantidade inteira igual ou maior que zero.";
    }
    if (errors.image) nextErrors.image = errors.image;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setFeedback(
        nextErrors.barcode && products.some((item) => item.id !== product?.id && item.barcode === fields.barcode)
          ? "Produto com este código de barras já está cadastrado!"
          : "Revise os campos indicados antes de continuar.",
      );
      setSuccess(false);
      return;
    }

    const data = {
      name: fields.name.trim(),
      barcode: fields.barcode,
      description: fields.description.trim(),
      quantity: Number(fields.quantity || 0),
      category: fields.category === "Outro" ? fields.customCategory.trim() : fields.category,
      expirationDate: fields.expirationDate,
      image,
    };

    setSubmitting(true);
    try {
      if (product) {
        await updateProduct(product.id, data);
        router.push("/produtos/");
        return;
      }
      await addProduct(data);
      setFields(fieldsFromProduct());
      setImage("");
      setImageName("");
      setFeedback("Produto cadastrado com sucesso!");
      setSuccess(true);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível salvar o produto.");
      setSuccess(false);
    } finally {
      setSubmitting(false);
    }
  }

  function fieldError(field: ProductField | "image") {
    return errors[field] ? <span className="field-error">{errors[field]}</span> : null;
  }

  return (
    <div className="content-page form-page">
      <div className="page-heading">
        <div>
          <StaticLink className="back-link" href="/produtos/"><span aria-hidden="true">←</span> Voltar para produtos</StaticLink>
          <p className="eyebrow">CATÁLOGO DE ESTOQUE</p>
          <h1>{editing ? "Editar produto" : "Cadastro de produto"}</h1>
          <p>{editing ? "Atualize os dados do produto. As alterações serão salvas na API." : "Adicione as informações do item que deseja acompanhar."}</p>
        </div>
      </div>
      <form className="form-card" onSubmit={handleSubmit} noValidate>
        <div className="form-section-heading">
          <span className="form-section-icon" aria-hidden="true">▦</span>
          <div><h2>Informações do produto</h2><p>Os campos marcados com <span className="required-mark">*</span> são obrigatórios.</p></div>
        </div>
        {feedback && <p className={`form-feedback ${success ? "feedback-success" : "feedback-error"}`} role={success ? "status" : "alert"}>{feedback}</p>}
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="productName">Nome do produto <span className="required-mark">*</span></label>
            <input id="productName" placeholder="Insira o nome do produto" value={fields.name} onChange={(event) => updateField("name", event.target.value)} aria-invalid={!!errors.name} />
            {fieldError("name")}
          </div>
          <div className="form-field">
            <label htmlFor="barcode">Código de barras <span className="required-mark">*</span></label>
            <input id="barcode" inputMode="numeric" placeholder="Insira o código de barras" value={fields.barcode} onChange={(event) => updateField("barcode", digitsOnly(event.target.value))} aria-invalid={!!errors.barcode} />
            {fieldError("barcode")}
          </div>
          <div className="form-field form-field-wide">
            <label htmlFor="description">Descrição <span className="required-mark">*</span></label>
            <textarea id="description" placeholder="Descreva brevemente o produto" rows={4} value={fields.description} onChange={(event) => updateField("description", event.target.value)} aria-invalid={!!errors.description} />
            {fieldError("description")}
          </div>
          <div className="form-field">
            <label htmlFor="quantity">Quantidade em estoque</label>
            <input id="quantity" type="number" min="0" step="1" placeholder="Quantidade disponível" value={fields.quantity} onChange={(event) => updateField("quantity", event.target.value)} aria-invalid={!!errors.quantity} />
            {fieldError("quantity")}
          </div>
          <div className="form-field">
            <label htmlFor="category">Categoria <span className="required-mark">*</span></label>
            <select id="category" value={fields.category} onChange={(event) => updateField("category", event.target.value)} aria-invalid={!!errors.category}>
              <option value="">Selecione uma categoria</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            {fieldError("category")}
          </div>
          {fields.category === "Outro" && (
            <div className="form-field form-field-wide">
              <label htmlFor="customCategory">Nome da categoria <span className="required-mark">*</span></label>
              <input id="customCategory" placeholder="Informe a categoria do produto" value={fields.customCategory} onChange={(event) => updateField("customCategory", event.target.value)} aria-invalid={!!errors.customCategory} />
              {fieldError("customCategory")}
            </div>
          )}
          <div className="form-field">
            <label htmlFor="expirationDate">Data de validade <span className="optional-label">Opcional</span></label>
            <input id="expirationDate" type="date" value={fields.expirationDate} onChange={(event) => updateField("expirationDate", event.target.value)} />
          </div>
          <div className="form-field">
            <label htmlFor="productImage">Imagem do produto <span className="optional-label">Opcional</span></label>
            <input id="productImage" type="file" accept="image/*" onChange={handleImageChange} aria-invalid={!!errors.image} />
            <span className="field-hint">Imagem de até 1 MB.</span>
            {image && (
              <div className="image-edit-preview">
                <Image src={image} alt="Imagem atual do produto" width={64} height={64} unoptimized />
                <button type="button" className="text-link" onClick={() => {
                  setImage("");
                  setImageName("");
                }}>Remover imagem</button>
              </div>
            )}
            {imageName && <span className="field-hint">Arquivo selecionado: {imageName}</span>}
            {fieldError("image")}
          </div>
        </div>
        <div className="form-actions">
          <StaticLink className="button button-quiet" href="/produtos/">Cancelar</StaticLink>
          <button className="button button-primary" type="submit" disabled={!ready || submitting}><span aria-hidden="true">{editing ? "✓" : "＋"}</span> {submitting ? "Salvando..." : editing ? "Salvar alterações" : "Cadastrar produto"}</button>
        </div>
      </form>
    </div>
  );
}
