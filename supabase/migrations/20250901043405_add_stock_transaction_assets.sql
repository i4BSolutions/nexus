create table "public"."stock_transaction_assets" (
    "id" bigint not null,
    "transaction_id" bigint not null,
    "type" text not null,
    "storage_key" text not null,
    "original_filename" text not null,
    "mime" text not null,
    "size_bytes" bigint not null,
    "width" integer,
    "height" integer,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
);


alter table "public"."stock_transaction" add column "approval_letter_id" uuid;

alter table "public"."stock_transaction" add column "approval_order_no" character varying(50);

alter table "public"."stock_transaction" add column "approve_by_contact_id" bigint;

alter table "public"."stock_transaction" add column "evidence_photo_count" integer default 0;

CREATE INDEX idx_stock_in_evidence_stock_in_id ON public.stock_in_evidence USING btree (stock_in_id);

CREATE INDEX idx_stock_in_evidence_uploader ON public.stock_in_evidence USING btree (uploader_user_id);

CREATE UNIQUE INDEX stock_in_evidence_pkey ON public.stock_in_evidence USING btree (id);

CREATE INDEX stock_transaction_approve_by_contact_id_idx ON public.stock_transaction USING btree (approve_by_contact_id);

CREATE UNIQUE INDEX stock_transaction_assets_pkey ON public.stock_transaction_assets USING btree (id);

CREATE INDEX stock_transaction_assets_transaction_id_type_idx ON public.stock_transaction_assets USING btree (transaction_id, type);

CREATE INDEX stock_transaction_warehouse_id_product_id_created_at_idx ON public.stock_transaction USING btree (warehouse_id, product_id, created_at DESC);

alter table "public"."stock_in_evidence" add constraint "stock_in_evidence_pkey" PRIMARY KEY using index "stock_in_evidence_pkey";

alter table "public"."stock_transaction_assets" add constraint "stock_transaction_assets_pkey" PRIMARY KEY using index "stock_transaction_assets_pkey";

alter table "public"."stock_in_evidence" add constraint "stock_in_evidence_stock_in_id_fkey" FOREIGN KEY (stock_in_id) REFERENCES stock_transaction(id) ON DELETE CASCADE not valid;

alter table "public"."stock_in_evidence" validate constraint "stock_in_evidence_stock_in_id_fkey";

alter table "public"."stock_in_evidence" add constraint "stock_in_evidence_uploader_user_id_fkey" FOREIGN KEY (uploader_user_id) REFERENCES auth.users(id) not valid;

alter table "public"."stock_in_evidence" validate constraint "stock_in_evidence_uploader_user_id_fkey";

alter table "public"."stock_transaction" add constraint "stock_transaction_approve_by_contact_id_fkey" FOREIGN KEY (approve_by_contact_id) REFERENCES person(id) not valid;

alter table "public"."stock_transaction" validate constraint "stock_transaction_approve_by_contact_id_fkey";

alter table "public"."stock_transaction_assets" add constraint "stock_transaction_assets_transaction_id_fkey" FOREIGN KEY (transaction_id) REFERENCES stock_transaction(id) ON DELETE CASCADE not valid;

alter table "public"."stock_transaction_assets" validate constraint "stock_transaction_assets_transaction_id_fkey";

alter table "public"."stock_transaction_assets" add constraint "stock_transaction_assets_type_check" CHECK ((type = ANY (ARRAY['photo'::text, 'pdf'::text]))) not valid;

alter table "public"."stock_transaction_assets" validate constraint "stock_transaction_assets_type_check";

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

grant delete on table "public"."stock_transaction_assets" to "anon";

grant insert on table "public"."stock_transaction_assets" to "anon";

grant references on table "public"."stock_transaction_assets" to "anon";

grant select on table "public"."stock_transaction_assets" to "anon";

grant trigger on table "public"."stock_transaction_assets" to "anon";

grant truncate on table "public"."stock_transaction_assets" to "anon";

grant update on table "public"."stock_transaction_assets" to "anon";

grant delete on table "public"."stock_transaction_assets" to "authenticated";

grant insert on table "public"."stock_transaction_assets" to "authenticated";

grant references on table "public"."stock_transaction_assets" to "authenticated";

grant select on table "public"."stock_transaction_assets" to "authenticated";

grant trigger on table "public"."stock_transaction_assets" to "authenticated";

grant truncate on table "public"."stock_transaction_assets" to "authenticated";

grant update on table "public"."stock_transaction_assets" to "authenticated";

grant delete on table "public"."stock_transaction_assets" to "service_role";

grant insert on table "public"."stock_transaction_assets" to "service_role";

grant references on table "public"."stock_transaction_assets" to "service_role";

grant select on table "public"."stock_transaction_assets" to "service_role";

grant trigger on table "public"."stock_transaction_assets" to "service_role";

grant truncate on table "public"."stock_transaction_assets" to "service_role";

grant update on table "public"."stock_transaction_assets" to "service_role";


