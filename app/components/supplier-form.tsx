"use client";

import { useState, type FormEvent } from "react";
import StaticLink, { navigateToStaticRoute } from "./static-link";
import {
  digitsOnly,
  formatCnpj,
  formatPhone,
  isValidCnpj,
} from "../form-utils";
import { useInventory, type Supplier } from "../inventory-store";

type SupplierFields = {
  companyName: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
  contact: string;
};

type SupplierField = keyof SupplierFields;
type FieldErrors = Partial<Record<SupplierField, string>>;

function fieldsFromSupplier(supplier?: Supplier): SupplierFields {
  return {
    companyName: supplier?.companyName ?? "",
    cnpj: supplier ? formatCnpj(supplier.cnpj) : "",
    address: supplier?.address ?? "",
    phone: supplier ? formatPhone(supplier.phone) : "",
    email: supplier?.email ?? "",
    contact: supplier?.contact ?? "",
  };
}

export default function SupplierForm({ supplier }: { supplier?: Supplier }) {
  const { suppliers, addSupplier, updateSupplier, ready } = useInventory();
  const editing = !!supplier;
  const [fields, setFields] = useState(() => fieldsFromSupplier(supplier));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [feedback, setFeedback] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function updateField(field: SupplierField, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFeedback("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    const requiredFields: SupplierField[] = [
      "companyName",
      "cnpj",
      "address",
      "phone",
      "email",
      "contact",
    ];
    requiredFields.forEach((field) => {
      if (!fields[field].trim()) nextErrors[field] = "Este campo é obrigatório.";
    });
    if (fields.cnpj && !isValidCnpj(fields.cnpj)) {
      nextErrors.cnpj = "Informe um CNPJ válido.";
    }
    const duplicateCnpj = suppliers.some(
      (item) =>
        item.id !== supplier?.id &&
        digitsOnly(item.cnpj) === digitsOnly(fields.cnpj),
    );
    if (fields.cnpj && duplicateCnpj) {
      setErrors({ ...nextErrors, cnpj: "Este CNPJ já está cadastrado." });
      setFeedback("Fornecedor com esse CNPJ já está cadastrado!");
      setSuccess(false);
      return;
    }
    if (fields.phone && ![10, 11].includes(digitsOnly(fields.phone).length)) {
      nextErrors.phone = "Informe um telefone com DDD.";
    }
    if (fields.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
      nextErrors.email = "Informe um e-mail válido.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setFeedback("Revise os campos indicados antes de continuar.");
      setSuccess(false);
      return;
    }

    const data = {
      companyName: fields.companyName.trim(),
      cnpj: fields.cnpj,
      address: fields.address.trim(),
      phone: fields.phone,
      email: fields.email.trim(),
      contact: fields.contact.trim(),
    };

    setSubmitting(true);
    try {
      if (supplier) {
        await updateSupplier(supplier.id, data);
        navigateToStaticRoute("/fornecedores/");
        return;
      }
      await addSupplier(data);
      setFields(fieldsFromSupplier());
      setFeedback("Fornecedor cadastrado com sucesso!");
      setSuccess(true);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível salvar o fornecedor.");
      setSuccess(false);
    } finally {
      setSubmitting(false);
    }
  }

  function fieldError(field: SupplierField) {
    return errors[field] ? <span className="field-error">{errors[field]}</span> : null;
  }

  return (
    <div className="content-page form-page">
      <div className="page-heading">
        <div>
          <StaticLink className="back-link" href="/fornecedores/"><span aria-hidden="true">←</span> Voltar para fornecedores</StaticLink>
          <p className="eyebrow">PARCEIROS COMERCIAIS</p>
          <h1>{editing ? "Editar fornecedor" : "Cadastro de fornecedor"}</h1>
          <p>{editing ? "Atualize os dados do fornecedor. As alterações serão salvas na API." : "Preencha os dados para adicionar um parceiro ao seu catálogo."}</p>
        </div>
      </div>

      <form className="form-card" onSubmit={handleSubmit} noValidate>
        <div className="form-section-heading">
          <span className="form-section-icon" aria-hidden="true">♧</span>
          <div><h2>Informações do fornecedor</h2><p>Os campos marcados com <span className="required-mark">*</span> são obrigatórios.</p></div>
        </div>
        {feedback && <p className={`form-feedback ${success ? "feedback-success" : "feedback-error"}`} role={success ? "status" : "alert"}>{feedback}</p>}
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="companyName">Nome da empresa <span className="required-mark">*</span></label>
            <input id="companyName" autoComplete="organization" placeholder="Insira o nome da empresa" value={fields.companyName} onChange={(event) => updateField("companyName", event.target.value)} aria-invalid={!!errors.companyName} />
            {fieldError("companyName")}
          </div>
          <div className="form-field">
            <label htmlFor="cnpj">CNPJ <span className="required-mark">*</span></label>
            <input id="cnpj" inputMode="numeric" placeholder="00.000.000/0000-00" value={fields.cnpj} onChange={(event) => updateField("cnpj", formatCnpj(event.target.value))} aria-invalid={!!errors.cnpj} />
            {fieldError("cnpj")}
          </div>
          <div className="form-field">
            <label htmlFor="phone">Telefone <span className="required-mark">*</span></label>
            <input id="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="(00) 00000-0000" value={fields.phone} onChange={(event) => updateField("phone", formatPhone(event.target.value))} aria-invalid={!!errors.phone} />
            {fieldError("phone")}
          </div>
          <div className="form-field">
            <label htmlFor="email">E-mail <span className="required-mark">*</span></label>
            <input id="email" type="email" autoComplete="email" placeholder="exemplo@fornecedor.com" value={fields.email} onChange={(event) => updateField("email", event.target.value)} aria-invalid={!!errors.email} />
            {fieldError("email")}
          </div>
          <div className="form-field">
            <label htmlFor="contact">Contato principal <span className="required-mark">*</span></label>
            <input id="contact" autoComplete="name" placeholder="Nome do contato principal" value={fields.contact} onChange={(event) => updateField("contact", event.target.value)} aria-invalid={!!errors.contact} />
            {fieldError("contact")}
          </div>
          <div className="form-field form-field-wide">
            <label htmlFor="address">Endereço <span className="required-mark">*</span></label>
            <textarea id="address" autoComplete="street-address" placeholder="Insira o endereço completo da empresa" rows={3} value={fields.address} onChange={(event) => updateField("address", event.target.value)} aria-invalid={!!errors.address} />
            {fieldError("address")}
          </div>
        </div>
        <div className="form-actions">
          <StaticLink className="button button-quiet" href="/fornecedores/">Cancelar</StaticLink>
          <button className="button button-primary" type="submit" disabled={!ready || submitting}><span aria-hidden="true">{editing ? "✓" : "＋"}</span> {submitting ? "Salvando..." : editing ? "Salvar alterações" : "Cadastrar fornecedor"}</button>
        </div>
      </form>
    </div>
  );
}
