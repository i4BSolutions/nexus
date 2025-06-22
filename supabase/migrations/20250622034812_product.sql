revoke delete on table "public"."supplier" from "anon";

revoke insert on table "public"."supplier" from "anon";

revoke references on table "public"."supplier" from "anon";

revoke select on table "public"."supplier" from "anon";

revoke trigger on table "public"."supplier" from "anon";

revoke truncate on table "public"."supplier" from "anon";

revoke update on table "public"."supplier" from "anon";

revoke delete on table "public"."supplier" from "authenticated";

revoke insert on table "public"."supplier" from "authenticated";

revoke references on table "public"."supplier" from "authenticated";

revoke select on table "public"."supplier" from "authenticated";

revoke trigger on table "public"."supplier" from "authenticated";

revoke truncate on table "public"."supplier" from "authenticated";

revoke update on table "public"."supplier" from "authenticated";

revoke delete on table "public"."supplier" from "service_role";

revoke insert on table "public"."supplier" from "service_role";

revoke references on table "public"."supplier" from "service_role";

revoke select on table "public"."supplier" from "service_role";

revoke trigger on table "public"."supplier" from "service_role";

revoke truncate on table "public"."supplier" from "service_role";

revoke update on table "public"."supplier" from "service_role";

revoke delete on table "public"."table_name" from "anon";

revoke insert on table "public"."table_name" from "anon";

revoke references on table "public"."table_name" from "anon";

revoke select on table "public"."table_name" from "anon";

revoke trigger on table "public"."table_name" from "anon";

revoke truncate on table "public"."table_name" from "anon";

revoke update on table "public"."table_name" from "anon";

revoke delete on table "public"."table_name" from "authenticated";

revoke insert on table "public"."table_name" from "authenticated";

revoke references on table "public"."table_name" from "authenticated";

revoke select on table "public"."table_name" from "authenticated";

revoke trigger on table "public"."table_name" from "authenticated";

revoke truncate on table "public"."table_name" from "authenticated";

revoke update on table "public"."table_name" from "authenticated";

revoke delete on table "public"."table_name" from "service_role";

revoke insert on table "public"."table_name" from "service_role";

revoke references on table "public"."table_name" from "service_role";

revoke select on table "public"."table_name" from "service_role";

revoke trigger on table "public"."table_name" from "service_role";

revoke truncate on table "public"."table_name" from "service_role";

revoke update on table "public"."table_name" from "service_role";

alter table "public"."supplier" drop constraint "supplier_email_check";

alter table "public"."supplier" drop constraint "supplier_email_key";

alter table "public"."supplier" drop constraint "supplier_pkey";

alter table "public"."table_name" drop constraint "table_name_pkey";

drop index if exists "public"."supplier_email_key";

drop index if exists "public"."supplier_pkey";

drop index if exists "public"."table_name_pkey";

drop table "public"."supplier";

drop table "public"."table_name";


