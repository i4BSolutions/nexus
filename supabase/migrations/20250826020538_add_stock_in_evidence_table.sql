
  create table "public"."stock_in_evidence" (
    "id" uuid not null default gen_random_uuid(),
    "stock_in_id" bigint not null,
    "file_url" text not null,
    "file_key" text not null,
    "mime_type" text not null,
    "size_bytes" bigint not null,
    "hash_sha256" text not null,
    "uploader_user_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );


CREATE INDEX idx_stock_in_evidence_stock_in_id ON public.stock_in_evidence USING btree (stock_in_id);

CREATE INDEX idx_stock_in_evidence_uploader ON public.stock_in_evidence USING btree (uploader_user_id);

CREATE UNIQUE INDEX stock_in_evidence_pkey ON public.stock_in_evidence USING btree (id);

alter table "public"."stock_in_evidence" add constraint "stock_in_evidence_pkey" PRIMARY KEY using index "stock_in_evidence_pkey";

alter table "public"."stock_in_evidence" add constraint "stock_in_evidence_stock_in_id_fkey" FOREIGN KEY (stock_in_id) REFERENCES stock_transaction(id) ON DELETE CASCADE not valid;

alter table "public"."stock_in_evidence" validate constraint "stock_in_evidence_stock_in_id_fkey";

alter table "public"."stock_in_evidence" add constraint "stock_in_evidence_uploader_user_id_fkey" FOREIGN KEY (uploader_user_id) REFERENCES auth.users(id) not valid;

alter table "public"."stock_in_evidence" validate constraint "stock_in_evidence_uploader_user_id_fkey";

grant delete on table "public"."stock_in_evidence" to "anon";

grant insert on table "public"."stock_in_evidence" to "anon";

grant references on table "public"."stock_in_evidence" to "anon";

grant select on table "public"."stock_in_evidence" to "anon";

grant trigger on table "public"."stock_in_evidence" to "anon";

grant truncate on table "public"."stock_in_evidence" to "anon";

grant update on table "public"."stock_in_evidence" to "anon";

grant delete on table "public"."stock_in_evidence" to "authenticated";

grant insert on table "public"."stock_in_evidence" to "authenticated";

grant references on table "public"."stock_in_evidence" to "authenticated";

grant select on table "public"."stock_in_evidence" to "authenticated";

grant trigger on table "public"."stock_in_evidence" to "authenticated";

grant truncate on table "public"."stock_in_evidence" to "authenticated";

grant update on table "public"."stock_in_evidence" to "authenticated";

grant delete on table "public"."stock_in_evidence" to "service_role";

grant insert on table "public"."stock_in_evidence" to "service_role";

grant references on table "public"."stock_in_evidence" to "service_role";

grant select on table "public"."stock_in_evidence" to "service_role";

grant trigger on table "public"."stock_in_evidence" to "service_role";

grant truncate on table "public"."stock_in_evidence" to "service_role";

grant update on table "public"."stock_in_evidence" to "service_role";


