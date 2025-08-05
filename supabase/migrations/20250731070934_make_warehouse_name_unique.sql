CREATE UNIQUE INDEX warehouse_name_key ON public.warehouse USING btree (name);

alter table "public"."warehouse" add constraint "warehouse_name_key" UNIQUE using index "warehouse_name_key";