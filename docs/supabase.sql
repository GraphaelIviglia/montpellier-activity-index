-- Chez nous — les deux tables du carnet partagé.
-- À coller dans Supabase : SQL Editor → New query → Run.
--
-- Deux tables, choisies pour la façon dont elles se heurtent :
--   chez_nous_state  : un seul document par foyer (bébé, pesées, tâches).
--                      Il change rarement, le dernier qui écrit gagne.
--   chez_nous_events : une ligne par geste, jamais modifiée. Deux téléphones
--                      qui notent en même temps ne se marchent pas dessus,
--                      chaque ligne portant son propre identifiant.

create table if not exists chez_nous_state (
  household   text primary key,
  data        jsonb       not null,
  updated_at  timestamptz not null default now()
);

create table if not exists chez_nous_events (
  id          text primary key,
  household   text not null,
  task_id     text not null,
  at          text not null,
  by_name     text,
  variant     text,
  created_at  timestamptz not null default now()
);

create index if not exists chez_nous_events_household_idx
  on chez_nous_events (household);

alter table chez_nous_state  enable row level security;
alter table chez_nous_events enable row level security;

-- La clé « anon public » voyage dans la page : ces règles ouvrent donc la
-- lecture et l'écriture à qui possède l'adresse de l'app. C'est suffisant pour
-- un carnet de famille dont l'URL n'est pas publiée ; pour verrouiller
-- réellement, il faudrait passer par Supabase Auth et une vraie connexion.
drop policy if exists "carnet ouvert au foyer" on chez_nous_state;
create policy "carnet ouvert au foyer" on chez_nous_state
  for all to anon using (true) with check (true);

drop policy if exists "gestes ouverts au foyer" on chez_nous_events;
create policy "gestes ouverts au foyer" on chez_nous_events
  for all to anon using (true) with check (true);
