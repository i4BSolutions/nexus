alter table "public"."person" add column "department_id" bigint;

alter table "public"."person" add column "email" text;

alter table "public"."person" add column "rank" text;

alter table "public"."person" add constraint "person_department_id_fkey" FOREIGN KEY (department_id) REFERENCES departments(id) not valid;

alter table "public"."person" validate constraint "person_department_id_fkey";


