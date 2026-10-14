-- Avalia auth.uid() uma vez por consulta, não por linha (recomendação do linter do Supabase).
alter policy "dono le e escreve pesagens" on pesagens
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

alter policy "dono le e escreve treinos" on treinos_realizados
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
