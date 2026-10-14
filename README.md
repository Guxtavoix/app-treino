# Treino

Web app mobile-first (PWA) para acompanhar treino em casa e peso.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Supabase (banco + login por magic link) · Recharts · Vercel.

## Telas

- **Hoje** – treino do dia (Seg/Qua/Sex força, Ter/Qui cardio, Sáb caminhada leve, Dom descanso), séries com checkbox, timer de descanso de 90s com vibração e aviso "Hora de se pesar" quando a última pesagem tem 7 dias ou mais.
- **Exercícios** – lista completa com séries, dicas e versão mais fácil.
- **Peso** – registro, gráfico com média móvel de 7 dias e linha da meta, resumo (atual, perdido, média/semana, falta, IMC) e lista com editar/excluir.
- **Histórico** – calendário + lista dos treinos e sequência de semanas cumprindo o plano (3 força + 2 cardio).

## Onde mexer

| O quê | Arquivo |
|---|---|
| Altura, peso inicial, meta | `lib/perfil.ts` |
| Exercícios, séries, dicas, plano da semana | `lib/exercicios.ts` |
| Comprou barra fixa ou bike ergométrica? | `lib/perfil.ts` → `equipamentos: ["barra", "bike"]` (a barra substitui a remada com mochila e a bike substitui a caminhada automaticamente) |

---

## Passo a passo

### 1. Supabase: criar o projeto e o banco

1. Crie uma conta em [supabase.com](https://supabase.com) e clique em **New project**.
2. No projeto, abra **SQL Editor → New query**, cole e rode (**Run**), nesta ordem, os arquivos de
   [`supabase/migrations/`](supabase/migrations/):
   - `20261014000000_init.sql` (tabelas e RLS)
   - `20261014000100_rls_select_auth_uid.sql` (otimização das policies)
3. Em **Project Settings → API**, copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Rodar localmente

```bash
npm install
cp .env.example .env.local   # e preencha as duas variáveis
npm run dev
```

Abra http://localhost:3000. Em **Authentication → URL Configuration** do Supabase, adicione
`http://localhost:3000/**` em **Redirect URLs** para o link mágico funcionar localmente.

### 3. Vercel: deploy

1. Em [vercel.com](https://vercel.com) → **Add New → Project**, importe este repositório do GitHub.
2. Em **Environment Variables**, adicione `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Clique em **Deploy**. A partir daí, cada push na `main` faz deploy automático.

### 4. Supabase: liberar a URL da Vercel

Em **Authentication → URL Configuration**:

- **Site URL:** `https://SEU-APP.vercel.app`
- **Redirect URLs:** adicione `https://SEU-APP.vercel.app/**`

Sem isso, o link mágico do e-mail redireciona para o lugar errado.

> **Opcional – entrar com código:** em **Authentication → Email Templates → Magic Link**, inclua
> `{{ .Token }}` no texto do e-mail. Assim o e-mail traz também um código de 6 dígitos que pode ser
> digitado na tela de login (útil se o link abrir em outro navegador).

### 5. Instalar no celular

**Android (Chrome):** abra a URL da Vercel → menu **⋮** → **Adicionar à tela inicial** (ou **Instalar app**).

**iPhone (Safari):** abra a URL → botão **Compartilhar** → **Adicionar à Tela de Início**.

O app abre em tela cheia, com tema escuro e o nome "Treino".

---

## Estrutura

```
app/
  (app)/            telas com navegação inferior: Hoje, Exercícios, Peso, Histórico
  login/            login por magic link
  auth/callback/    troca o código do link mágico por sessão
  manifest.ts       manifest do PWA
components/         telas e componentes (Client Components)
lib/                dados fixos, datas e clientes do Supabase
proxy.ts            redireciona para /login quem não está logado (no Next 16, "middleware" virou "proxy")
supabase/migrations/
```

Os dados são lidos direto do navegador pelo cliente do Supabase; quem garante que cada um só vê os próprios dados é o **Row Level Security** configurado no SQL.
