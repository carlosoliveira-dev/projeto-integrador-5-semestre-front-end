"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useInventory } from "../inventory-store";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp, user } = useInventory();
  const [registering, setRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFeedback("");
    try {
      if (registering) await signUp(name.trim(), email.trim(), password);
      else await signIn(email.trim(), password);
      setSuccess(true);
      setFeedback("Acesso realizado com sucesso. Você já pode usar o sistema.");
      router.push("/");
    } catch (error) {
      setSuccess(false);
      setFeedback(
        error instanceof Error ? error.message : "Não foi possível autenticar.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-card">
        <div className="auth-card-heading">
          <span className="form-section-icon" aria-hidden="true">E</span>
          <p className="eyebrow">ESTOQUE FÁCIL</p>
          <h1>{registering ? "Crie sua conta" : "Bem-vindo de volta"}</h1>
          <p>{registering ? "Cadastre-se para começar a gerenciar seu estoque." : "Entre para acessar seus produtos e fornecedores."}</p>
        </div>
        {user && <p className="form-feedback feedback-success">Sessão ativa: {user.name}</p>}
        {feedback && <p className={`form-feedback ${success ? "feedback-success" : "feedback-error"}`} role={success ? "status" : "alert"}>{feedback}</p>}
        <form className="auth-form" onSubmit={handleSubmit}>
          {registering && (
            <div className="form-field">
              <label htmlFor="accountName">Nome completo</label>
              <input id="accountName" autoComplete="name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Seu nome" />
            </div>
          )}
          <div className="form-field">
            <label htmlFor="accountEmail">E-mail</label>
            <input id="accountEmail" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@exemplo.com" />
          </div>
          <div className="form-field">
            <label htmlFor="accountPassword">Senha</label>
            <input id="accountPassword" type="password" autoComplete={registering ? "new-password" : "current-password"} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Sua senha" />
          </div>
          <button className="button button-primary auth-submit" type="submit" disabled={submitting}>
            {submitting ? "Aguarde..." : registering ? "Criar conta" : "Entrar"}
          </button>
        </form>
        <p className="auth-switch">
          {registering ? "Já tem uma conta?" : "Ainda não tem uma conta?"}{" "}
          <button type="button" onClick={() => {
            setRegistering((current) => !current);
            setFeedback("");
          }}>{registering ? "Entrar" : "Criar conta"}</button>
        </p>
        <Link className="auth-home-link" href="/">Voltar ao início</Link>
      </section>
    </div>
  );
}
