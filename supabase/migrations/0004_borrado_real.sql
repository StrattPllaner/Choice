-- Vocatlas · derecho de cancelación (ARCO) con borrado REAL
-- Nada de baja lógica: se eliminan los renglones. Lo único que sobrevive es el registro
-- de que hubo una revocación, que la propia ley obliga a poder acreditar.

create or replace function borrar_mis_datos()
returns void language plpgsql security definer set search_path = public as $$
declare v_usuario uuid := auth.uid();
begin
  if v_usuario is null then raise exception 'sin sesión'; end if;

  delete from perfil_versiones   where usuario_id = v_usuario;
  delete from mediciones_impacto where usuario_id = v_usuario;
  delete from carreras_guardadas where usuario_id = v_usuario;
  delete from vistas_carrera     where usuario_id = v_usuario;
  delete from almacen_alumno     where usuario_id = v_usuario;

  update consentimientos
     set otorgado = false, revocado_en = now()
   where usuario_id = v_usuario and revocado_en is null;

  insert into accesos (actor_id, rol, plantel_id, recurso, operacion)
  values (v_usuario, 'alumno', mi_plantel(), 'todos_sus_datos', 'borrar');
end;
$$;

-- Acceso y portabilidad: todo lo del alumno en un JSON, para descargarlo.
create or replace function exportar_mis_datos()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v_usuario uuid := auth.uid(); v_datos jsonb;
begin
  if v_usuario is null then raise exception 'sin sesión'; end if;

  select jsonb_build_object(
    'exportado_el', now(),
    'usuario', (select to_jsonb(u) - 'id' from usuarios u where u.id = v_usuario),
    'consentimientos', (select coalesce(jsonb_agg(to_jsonb(c) - 'usuario_id'), '[]'::jsonb) from consentimientos c where c.usuario_id = v_usuario),
    'perfil', (select coalesce(jsonb_agg(to_jsonb(p) - 'usuario_id'), '[]'::jsonb) from perfil_versiones p where p.usuario_id = v_usuario),
    'impacto', (select coalesce(jsonb_agg(to_jsonb(m) - 'usuario_id'), '[]'::jsonb) from mediciones_impacto m where m.usuario_id = v_usuario),
    'carreras_guardadas', (select coalesce(jsonb_agg(g.carrera_id), '[]'::jsonb) from carreras_guardadas g where g.usuario_id = v_usuario),
    'almacen', (select coalesce(jsonb_object_agg(a.clave, a.valor), '{}'::jsonb) from almacen_alumno a where a.usuario_id = v_usuario)
  ) into v_datos;

  insert into accesos (actor_id, rol, plantel_id, recurso, operacion)
  values (v_usuario, 'alumno', mi_plantel(), 'todos_sus_datos', 'exportar');

  return v_datos;
end;
$$;

revoke all on function borrar_mis_datos() from public;
revoke all on function exportar_mis_datos() from public;
grant execute on function borrar_mis_datos() to authenticated;
grant execute on function exportar_mis_datos() to authenticated;
