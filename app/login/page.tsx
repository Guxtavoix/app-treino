"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { botaoPrimario, botaoSecundario, campo } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("erro") === "link") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- lê a URL só no navegador
      setErro("O link expirou ou já foi usado. Peça um novo.");
    }
  }, []);

  async function enviarLink(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setCarregando(false);
    if (error) setErro(error.message);
    else setEnviado(true);
  }

  async function entrarComCodigo(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro(null);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({ email, token: codigo.trim(), type: "email" });
    setCarregando(false);
    if (error) setErro("Código inválido ou expirado.");
    else router.replace("/");
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4">
      <h1 className="mb-2 text-4xl font-bold">Treino</h1>
      <p className="mb-8 text-suave">Entre com seu e-mail para receber um link de acesso.</p>

      {!enviado ? (
        <form onSubmit={enviarLink} className="space-y-4">
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
            {carregando ? "Enviando…" : "Enviar link mágico"}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <p className="rounded-2xl border border-borda bg-cartao p-4">
            Link enviado para <strong>{email}</strong>. Abra o e-mail no celular e toque no link.
          </p>
          <form onSubmit={entrarComCodigo} className="space-y-3">
            <p className="text-suave">Ou, se o e-mail trouxer um código, digite aqui:</p>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Código"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className={campo}
            />
            <button type="submit" disabled={carregando || !codigo} className={botaoSecundario}>
              Entrar com código
            </button>
          </form>
          <button onClick={() => setEnviado(false)} className="w-full text-suave underline">
            Usar outro e-mail
          </button>
        </div>
      )}

      {erro && <p className="mt-4 text-red-400">{erro}</p>}
    </main>
  );
}
