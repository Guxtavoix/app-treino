"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { botaoPrimario, campo } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [modo, setModo] = useState<"senha" | "link">("senha");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [linkEnviado, setLinkEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("erro") === "link") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- lê a URL só no navegador
      setErro("O link expirou ou já foi usado. Peça um novo.");
    }
  }, []);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro(null);
    const { error } = await createClient().auth.signInWithPassword({ email, password: senha });
    setCarregando(false);
    if (error) return setErro("E-mail ou senha incorretos.");
    router.replace("/");
    router.refresh();
  }

  async function enviarLink(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro(null);
    const { error } = await createClient().auth.signInWithOtp({
      email,
      // Só para quem já tem conta: o link não cria usuário novo.
      options: { emailRedirectTo: `${window.location.origin}/auth/callback`, shouldCreateUser: false },
    });
    setCarregando(false);
    if (error) setErro(error.message);
    else setLinkEnviado(true);
  }

  function trocarModo() {
    setModo((m) => (m === "senha" ? "link" : "senha"));
    setErro(null);
    setLinkEnviado(false);
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4">
      <h1 className="mb-8 text-4xl font-bold">Treino</h1>

      {modo === "senha" ? (
        <form onSubmit={entrar} className="space-y-4">
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={campo}
          />
          <input
            type="password"
            required
            autoComplete="current-password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className={campo}
          />
          <button type="submit" disabled={carregando} className={botaoPrimario}>
            {carregando ? "Entrando…" : "Entrar"}
          </button>
        </form>
      ) : linkEnviado ? (
        <p className="rounded-2xl border border-borda bg-cartao p-4">
          Link enviado para <strong>{email}</strong>. Abra o e-mail no celular e toque no link.
        </p>
      ) : (
        <form onSubmit={enviarLink} className="space-y-4">
          <p className="text-suave">Esqueceu a senha? Receba um link de acesso por e-mail.</p>
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={campo}
          />
          <button type="submit" disabled={carregando} className={botaoPrimario}>
            {carregando ? "Enviando…" : "Enviar link"}
          </button>
        </form>
      )}

      <button onClick={trocarModo} className="mt-6 w-full py-2 text-suave underline">
        {modo === "senha" ? "Esqueci a senha / entrar com link" : "Voltar para login com senha"}
      </button>

      {erro && <p className="mt-4 text-red-400">{erro}</p>}
    </main>
  );
}
