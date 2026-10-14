-- Tabelas do app Treino: pesagens e treinos realizados, protegidas por RLS.

create table pesagens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  data date not null default current_date,
  peso_kg numeric(5,1) not null check (peso_kg > 0),
  observacao text,
  created_at timestamptz not null default now()
);

create table treinos_realizados (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  data date not null default current_date,
  tipo text not null check (tipo in ('forca','cardio','caminhada')),
  series_feitas jsonb,
  notas text,
  created_at timestamptz not null default now()
);

create index pesagens_user_data_idx on pesagens (user_id, data);
create index treinos_user_data_idx on treinos_realizados (user_id, data);

alter table pesagens enable row level security;
alter table treinos_realizados enable row level security;

create policy "dono le e escreve pesagens" on pesagens
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "dono le e escreve treinos" on treinos_realizados
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
