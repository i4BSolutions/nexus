alter table "public"."user_profiles" drop column "avatar";

alter table "public"."user_profiles" alter column "department" set not null;

alter table "public"."user_profiles" alter column "department" set data type bigint using "department"::bigint;

alter table "public"."user_profiles" alter column "full_name" set not null;

alter table "public"."user_profiles" alter column "username" set not null;

alter table "public"."user_profiles" add constraint "user_profiles_department_fkey" FOREIGN KEY (department) REFERENCES departments(id) not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_department_fkey";


