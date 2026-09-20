-- NOMBREAPP · Row Level Security
--
-- Regla dura: orientación y dirección NO tienen ninguna política de lectura sobre las
-- tablas con datos de alumnos. Ni una. Lo único que pueden llamar son funciones
-- agregadas (0003) que aplican k-anonimato. Así, "el panel no puede devolver datos
-- identificables" no es una promesa: no existe el permiso para hacerlo.

alter table planteles            enable row level security;
alter table licencias            enable row level security;
alter table usuarios             enable row level security;
alter table consentimientos      enable row level security;
alter table perfil_versiones     enable row level security;
alter table mediciones_impacto   enable row level security;
alter table carreras_guardadas   enable row level security;
alter table vistas_carrera       enable row level security;
alter table almacen_alumno       enable row level security;
alter table accesos              enable row level security;

-- Helpers. SECURITY DEFINER + search_path fijo para que no se puedan secuestrar.
create or replace function mi_plantel()
returns uuid language sql stable security definer set search_path = public as $$
  select plantel_id from usuarios where id = auth.uid()
$$;

create or replace function mi_rol()
returns rol_usuario language sql stable security definer set search_path = public as $$
  select rol from usuarios where id = auth.uid()
$$;

create or replace function tengo_consentimiento()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from consentimientos
    where usuario_id = auth.uid() and otorgado and revocado_en is null
  )
$$;

-- Planteles y licencias: lectura para quien pertenece al plantel.
create policy planteles_propio on planteles for select
  using (id = mi_plantel());

create policy licencias_propia on licencias for select
  using (plantel_id = mi_plantel());

-- Usuarios: cada quien ve y edita SOLO su renglón. No hay política para que un
-- orientador lea la lista de alumnos: no la necesita para ver agregados.
create policy usuarios_propio_select on usuarios for select using (id = auth.uid());
create policy usuarios_propio_update on usuarios for update using (id = auth.uid()) with check (id = auth.uid());

-- Consentimiento: el alumno lo lee y lo escribe. Nadie más.
create policy consentimientos_propio on consentimientos for select using (usuario_id = auth.uid());
create policy consentimientos_alta on consentimientos for insert with check (usuario_id = auth.uid());
create policy consentimientos_revocar on consentimientos for update
  using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());

-- Datos del alumno: suyos y nada más. Además, NO se puede escribir sin consentimiento
-- vigente: la misma regla que en el cliente, repetida donde sí manda.
create policy perfil_propio_select on perfil_versiones for select using (usuario_id = auth.uid());
create policy perfil_propio_insert on perfil_versiones for insert
  with check (usuario_id = auth.uid() and tengo_consentimiento());
create policy perfil_propio_delete on perfil_versiones for delete using (usuario_id = auth.uid());

create policy impacto_propio_select on mediciones_impacto for select using (usuario_id = auth.uid());
create policy impacto_propio_insert on mediciones_impacto for insert
  with check (usuario_id = auth.uid() and tengo_consentimiento());
create policy impacto_propio_delete on mediciones_impacto for delete using (usuario_id = auth.uid());

create policy guardadas_propias on carreras_guardadas for all
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid() and tengo_consentimiento());

create policy vistas_propias on vistas_carrera for all
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid() and tengo_consentimiento());

create policy almacen_propio on almacen_alumno for all
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid() and tengo_consentimiento());

-- Bitácora: el alumno ve lo que le toca a él; el plantel ve la suya sin datos de alumno.
create policy accesos_propios on accesos for select
  using (actor_id = auth.uid() or (plantel_id = mi_plantel() and mi_rol() in ('orientador', 'direccion')));
create policy accesos_alta on accesos for insert with check (true);
