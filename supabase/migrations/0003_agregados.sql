-- NOMBREAPP · funciones agregadas del panel institucional
--
-- Estas son las ÚNICAS vías por las que un orientador o dirección obtienen datos.
-- Todas aplican k-anonimato: si el grupo tiene menos de MINIMO_GRUPO respuestas, no
-- devuelven números, devuelven el motivo. Y ninguna regresa usuario_id.

create or replace function minimo_grupo() returns integer
  language sql immutable as $$ select 10 $$;

-- Licencia vigente del plantel (incluye días de gracia: el bloqueo es suave).
create or replace function licencia_estado(p_plantel uuid)
returns table (
  vigente boolean,
  en_gracia boolean,
  fecha_inicio date,
  fecha_fin date,
  dias_restantes integer,
  alumnos_permitidos integer,
  alumnos_registrados bigint
)
language sql stable security definer set search_path = public as $$
  with lic as (
    select * from licencias
    where plantel_id = p_plantel
    order by fecha_fin desc
    limit 1
  )
  select
    current_date between lic.fecha_inicio and lic.fecha_fin as vigente,
    current_date > lic.fecha_fin and current_date <= lic.fecha_fin + lic.dias_de_gracia as en_gracia,
    lic.fecha_inicio,
    lic.fecha_fin,
    (lic.fecha_fin - current_date)::integer as dias_restantes,
    lic.alumnos_permitidos,
    (select count(*) from usuarios u where u.plantel_id = p_plantel and u.rol = 'alumno') as alumnos_registrados
  from lic;
$$;

-- Guardia común: ¿quien llama puede ver agregados de este plantel?
create or replace function puede_ver_panel(p_plantel uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select mi_plantel() = p_plantel and mi_rol() in ('orientador', 'direccion')
$$;

-- 1. Cobertura: cuántos completaron su perfil.
create or replace function panel_cobertura(p_plantel uuid)
returns table (alumnos bigint, con_perfil bigint, publicable boolean)
language plpgsql stable security definer set search_path = public as $$
declare v_alumnos bigint; v_con_perfil bigint;
begin
  if not puede_ver_panel(p_plantel) then raise exception 'sin permiso'; end if;

  select count(*) into v_alumnos from usuarios where plantel_id = p_plantel and rol = 'alumno';
  select count(distinct pv.usuario_id) into v_con_perfil
    from perfil_versiones pv join usuarios u on u.id = pv.usuario_id
    where u.plantel_id = p_plantel;

  return query select v_alumnos, v_con_perfil, v_alumnos >= minimo_grupo();
end;
$$;

-- 2. Sin rumbo definido (seguridad de decisión <= 2 en la última medición).
create or replace function panel_sin_rumbo(p_plantel uuid)
returns table (n bigint, sin_rumbo bigint, porcentaje numeric, publicable boolean)
language plpgsql stable security definer set search_path = public as $$
declare v_n bigint; v_sin bigint;
begin
  if not puede_ver_panel(p_plantel) then raise exception 'sin permiso'; end if;

  with ultimas as (
    select distinct on (m.usuario_id) m.usuario_id, (m.respuestas->>'seguridad')::numeric as seguridad
    from mediciones_impacto m join usuarios u on u.id = m.usuario_id
    where u.plantel_id = p_plantel
    order by m.usuario_id, m.fecha desc
  )
  select count(*), count(*) filter (where seguridad <= 2) into v_n, v_sin from ultimas;

  if v_n < minimo_grupo() then
    return query select v_n, null::bigint, null::numeric, false;
  else
    return query select v_n, v_sin, round(100.0 * v_sin / v_n, 1), true;
  end if;
end;
$$;

-- 3. Hacia qué áreas se inclina la generación.
create or replace function panel_areas(p_plantel uuid)
returns table (area text, alumnos bigint, porcentaje numeric)
language plpgsql stable security definer set search_path = public as $$
declare v_n bigint;
begin
  if not puede_ver_panel(p_plantel) then raise exception 'sin permiso'; end if;

  create temp table _ultimos on commit drop as
    select distinct on (pv.usuario_id) pv.usuario_id, pv.resultado
    from perfil_versiones pv join usuarios u on u.id = pv.usuario_id
    where u.plantel_id = p_plantel
    order by pv.usuario_id, pv.version desc;

  select count(*) into v_n from _ultimos;
  if v_n < minimo_grupo() then return; end if;  -- sin filas: el panel muestra el aviso

  return query
    select sugerida::text as area, count(*) as alumnos, round(100.0 * count(*) / v_n, 1)
    from _ultimos, jsonb_array_elements_text(resultado->'sugeridas') as sugerida
    group by sugerida
    having count(*) >= 3          -- un área con 1 o 2 alumnos también identifica
    order by count(*) desc;
end;
$$;

-- 4. Cambio del grupo entre primera y segunda medición.
create or replace function panel_cambio_impacto(p_plantel uuid)
returns table (
  indicador text,
  n_inicial bigint,
  n_seguimiento bigint,
  inicial numeric,
  seguimiento numeric,
  cambio numeric,
  publicable boolean
)
language plpgsql stable security definer set search_path = public as $$
declare v_ini bigint; v_seg bigint;
begin
  if not puede_ver_panel(p_plantel) then raise exception 'sin permiso'; end if;

  create temp table _med on commit drop as
    select m.momento, m.respuestas
    from mediciones_impacto m join usuarios u on u.id = m.usuario_id
    where u.plantel_id = p_plantel;

  select count(*) filter (where momento = 'inicial'), count(*) filter (where momento = 'seguimiento')
    into v_ini, v_seg from _med;

  if v_ini < minimo_grupo() or v_seg < minimo_grupo() then
    return query select 'grupo demasiado chico para publicar'::text, v_ini, v_seg,
                        null::numeric, null::numeric, null::numeric, false;
    return;
  end if;

  return query
  with valores as (
    select momento, llave as indicador, (valor)::text::numeric as valor
    from _med, jsonb_each(respuestas) as campos(llave, valor)
    where jsonb_typeof(valor) = 'number'
  ), promedios as (
    select indicador,
           avg(valor) filter (where momento = 'inicial') as ini,
           avg(valor) filter (where momento = 'seguimiento') as seg
    from valores group by indicador
  )
  select indicador, v_ini, v_seg, round(ini, 2), round(seg, 2), round(seg - ini, 2), true
  from promedios order by indicador;
end;
$$;

-- 5. Carreras más y menos exploradas.
create or replace function panel_carreras_exploradas(p_plantel uuid, p_limite integer default 10)
returns table (carrera_id text, alumnos bigint)
language plpgsql stable security definer set search_path = public as $$
declare v_n bigint;
begin
  if not puede_ver_panel(p_plantel) then raise exception 'sin permiso'; end if;

  select count(distinct v.usuario_id) into v_n
    from vistas_carrera v join usuarios u on u.id = v.usuario_id
    where u.plantel_id = p_plantel;
  if v_n < minimo_grupo() then return; end if;

  return query
    select v.carrera_id, count(distinct v.usuario_id) as alumnos
    from vistas_carrera v join usuarios u on u.id = v.usuario_id
    where u.plantel_id = p_plantel
    group by v.carrera_id
    having count(distinct v.usuario_id) >= 3
    order by alumnos desc
    limit p_limite;
end;
$$;

-- Permisos: solo estas funciones quedan expuestas al rol autenticado.
revoke all on function panel_cobertura(uuid) from public;
revoke all on function panel_sin_rumbo(uuid) from public;
revoke all on function panel_areas(uuid) from public;
revoke all on function panel_cambio_impacto(uuid) from public;
revoke all on function panel_carreras_exploradas(uuid, integer) from public;
revoke all on function licencia_estado(uuid) from public;

grant execute on function panel_cobertura(uuid) to authenticated;
grant execute on function panel_sin_rumbo(uuid) to authenticated;
grant execute on function panel_areas(uuid) to authenticated;
grant execute on function panel_cambio_impacto(uuid) to authenticated;
grant execute on function panel_carreras_exploradas(uuid, integer) to authenticated;
grant execute on function licencia_estado(uuid) to authenticated;
