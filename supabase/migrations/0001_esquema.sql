-- Vocatlas · esquema base
-- Principio: la privacidad se aplica en la base, no en la interfaz. Si un endpoint del
-- panel pudiera devolver el renglón de un alumno, la política de privacidad sería un adorno.

create extension if not exists "pgcrypto";

-- ── Planteles y licencias ────────────────────────────────────────────────

create table planteles (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  estado text not null,
  creado_en timestamptz not null default now()
);

create table licencias (
  id uuid primary key default gen_random_uuid(),
  plantel_id uuid not null references planteles(id) on delete cascade,
  fecha_inicio date not null,
  fecha_fin date not null,
  alumnos_permitidos integer not null check (alumnos_permitidos > 0),
  -- bloqueo suave: al vencer, el panel avisa y pasa a solo lectura; no se borra nada
  dias_de_gracia integer not null default 30,
  creada_en timestamptz not null default now(),
  constraint fechas_coherentes check (fecha_fin >= fecha_inicio)
);

create index licencias_plantel on licencias (plantel_id, fecha_fin desc);

-- ── Usuarios y roles ─────────────────────────────────────────────────────

create type rol_usuario as enum ('alumno', 'orientador', 'direccion');

-- Minimización: del alumno NO se guarda nombre, CURP, dirección, teléfono ni correo
-- personal. La identificación es el código que asigna la escuela.
create table usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  plantel_id uuid not null references planteles(id) on delete restrict,
  rol rol_usuario not null,
  codigo_alumno text,
  grupo text,
  grado smallint check (grado between 1 and 3),
  creado_en timestamptz not null default now(),
  constraint alumno_con_codigo check (rol <> 'alumno' or codigo_alumno is not null),
  unique (plantel_id, codigo_alumno)
);

create index usuarios_plantel_rol on usuarios (plantel_id, rol);

-- ── Consentimiento (LFPDPPP) ─────────────────────────────────────────────

create table consentimientos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  otorgado boolean not null,
  fecha timestamptz not null default now(),
  forma text not null,
  nombre_tutor text not null,
  parentesco text not null,
  version_aviso text not null,
  mayor_de_edad boolean not null default false,
  revocado_en timestamptz
);

create index consentimientos_usuario on consentimientos (usuario_id, fecha desc);

-- ── Datos del alumno ─────────────────────────────────────────────────────

create table perfil_versiones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  version integer not null,
  fecha timestamptz not null default now(),
  grado smallint,
  respuestas jsonb not null,
  resultado jsonb not null,
  version_algoritmo text not null,
  unique (usuario_id, version)
);

create table mediciones_impacto (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  momento text not null check (momento in ('inicial', 'seguimiento')),
  fecha timestamptz not null default now(),
  version_instrumento text not null,
  respuestas jsonb not null
);

create table carreras_guardadas (
  usuario_id uuid not null references usuarios(id) on delete cascade,
  carrera_id text not null,
  guardada_en timestamptz not null default now(),
  primary key (usuario_id, carrera_id)
);

create table vistas_carrera (
  usuario_id uuid not null references usuarios(id) on delete cascade,
  carrera_id text not null,
  vista_en timestamptz not null default now(),
  veces integer not null default 1,
  primary key (usuario_id, carrera_id)
);

-- Espejo del almacén clave-valor del cliente, para que la capa de abstracción
-- (src/lib/storage.ts) funcione igual contra Supabase sin tocar componentes.
create table almacen_alumno (
  usuario_id uuid not null references usuarios(id) on delete cascade,
  clave text not null,
  valor jsonb not null,
  actualizado_en timestamptz not null default now(),
  primary key (usuario_id, clave)
);

-- ── Bitácora de accesos ──────────────────────────────────────────────────

create table accesos (
  id bigserial primary key,
  fecha timestamptz not null default now(),
  actor_id uuid references usuarios(id) on delete set null,
  rol rol_usuario not null,
  plantel_id uuid references planteles(id) on delete cascade,
  recurso text not null,
  operacion text not null
);

create index accesos_plantel_fecha on accesos (plantel_id, fecha desc);
