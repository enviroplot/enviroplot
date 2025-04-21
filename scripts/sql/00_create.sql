create extension if not exists "uuid-ossp";
create extension if not exists postgis;

drop table if exists hslcriteriondetail cascade;
drop table if exists mlcriteriondetail cascade;
drop table if exists hildccriteriondetail cascade;
drop table if exists eslcriteriondetail cascade;
drop table if exists eilspecificchemicalcodes cascade;
drop table if exists eilindircriteriondetail cascade;
drop table if exists eilcriteriondetail cascade;
drop table if exists criteriondetail cascade;
drop table if exists criterion_details cascade;
drop table if exists criteria cascade;
drop table if exists chemical_measurements cascade;
drop table if exists sample_parameter_items cascade;
drop table if exists sample_parameters cascade;
drop table if exists samples cascade;
drop table if exists projects cascade;
drop table if exists unit_conversions cascade;
drop table if exists units cascade;
drop table if exists chemicals cascade;
drop table if exists chemical_groups cascade;

create table chemical_groups (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text
);

create table chemicals (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  cas_number text,
  group_id uuid references chemical_groups(id)
);

create table units (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  symbol text not null,
  dimension text
);

create table unit_conversions (
  id uuid primary key default uuid_generate_v4(),
  from_unit_id uuid references units(id),
  to_unit_id uuid references units(id),
  factor numeric not null,
  offset_value numeric default 0
);

create table projects (
  id uuid primary key default uuid_generate_v4(),
  project_number text,
  name text,
  client_name text,
  consultant text,
  prepared_by text,
  location text,
  site_coordinates geometry(Point, 4326),
  project_date date,
  site_map_url text,
  logo_url text,
  coc_url text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

create table samples (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  sample_id text,
  location geometry(Point, 4326),
  matrix text,
  depth numeric,
  collected_at timestamptz,
  created_at timestamptz default now()
);

create table sample_parameters (
  id uuid primary key default uuid_generate_v4(),
  sample_id uuid references samples(id) on delete cascade
);

create table sample_parameter_items (
  id uuid primary key default uuid_generate_v4(),
  parameter_id uuid references sample_parameters(id) on delete cascade,
  chemical_id uuid references chemicals(id),
  value numeric,
  unit_id uuid references units(id)
);

create table chemical_measurements (
  id uuid primary key default uuid_generate_v4(),
  sample_id uuid references samples(id),
  chemical_id uuid references chemicals(id),
  result numeric,
  unit_id uuid references units(id),
  method text,
  is_detected boolean
);

create table criteria (
  id uuid primary key default uuid_generate_v4(),
  type text not null,
  description text
);

create table criterion_details (
  id uuid primary key default uuid_generate_v4(),
  criterion_id uuid references criteria(id),
  chemical_id uuid references chemicals(id),
  matrix text,
  threshold_value numeric,
  unit_id uuid references units(id)
);

create table criteriondetail (
  id uuid primary key default uuid_generate_v4(),
  chemicalcode text,
  criterioncode text
);

create table eilcriteriondetail (
  id uuid primary key default uuid_generate_v4(),
  criteriondetail text,
  ph numeric,
  cec numeric,
  claycontent numeric,
  contaminationtype text,
  value numeric,
  units_id uuid references units(id),
  criteriondatasource text
);

create table eilindircriteriondetail (
  id uuid primary key default uuid_generate_v4(),
  criteriondetail text,
  units_id uuid references units(id),
  criteriondatasource text
);

create table eilspecificchemicalcodes (
  id uuid primary key default uuid_generate_v4(),
  criteriondetail text,
  ph numeric,
  cec numeric,
  claycontent numeric,
  value numeric
);

create table eslcriteriondetail (
  id uuid primary key default uuid_generate_v4(),
  criteriondetail text,
  soiltexture text,
  value numeric,
  units_id uuid references units(id),
  criteriondatasource text
);

create table hildccriteriondetail (
  id uuid primary key default uuid_generate_v4(),
  criteriondetail text,
  value numeric,
  units_id uuid references units(id),
  criteriondatasource text
);

create table hslcriteriondetail (
  id uuid primary key default uuid_generate_v4(),
  criteriondetail text,
  soiltype text,
  depthlevel text,
  value numeric,
  units_id uuid references units(id),
  isunlimited boolean,
  criteriondatasource text
);

create table mlcriteriondetail (
  id uuid primary key default uuid_generate_v4(),
  criteriondetail text,
  soiltexture text,
  value numeric,
  units_id uuid references units(id),
  criteriondatasource text
);
