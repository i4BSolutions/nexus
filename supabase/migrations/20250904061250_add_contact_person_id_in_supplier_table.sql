alter table "public"."supplier" add column "contact_person_id" bigint;

alter table "public"."supplier" add constraint "supplier_contact_person_id_fkey" FOREIGN KEY (contact_person_id) REFERENCES person(id) not valid;

alter table "public"."supplier" validate constraint "supplier_contact_person_id_fkey";


