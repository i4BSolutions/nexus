alter table "public"."purchase_order" drop column "authorized_signer_name";

alter table "public"."purchase_order" drop column "contact_person_name";

alter table "public"."purchase_order" drop column "sign_person_name";

alter table "public"."purchase_order" add column "authorized_signer_id" bigint;

alter table "public"."purchase_order" add column "contact_person_id" bigint not null;

alter table "public"."purchase_order" add column "sign_person_id" bigint;

alter table "public"."purchase_order" add constraint "purchase_order_authorized_signer_id_fkey" FOREIGN KEY (authorized_signer_id) REFERENCES person(id) not valid;

alter table "public"."purchase_order" validate constraint "purchase_order_authorized_signer_id_fkey";

alter table "public"."purchase_order" add constraint "purchase_order_contact_person_id_fkey" FOREIGN KEY (contact_person_id) REFERENCES person(id) not valid;

alter table "public"."purchase_order" validate constraint "purchase_order_contact_person_id_fkey";

alter table "public"."purchase_order" add constraint "purchase_order_sign_person_id_fkey" FOREIGN KEY (sign_person_id) REFERENCES person(id) not valid;

alter table "public"."purchase_order" validate constraint "purchase_order_sign_person_id_fkey";


