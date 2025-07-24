alter table "public"."budgets" drop constraint "budgets_status_check";

alter table "public"."budget_allocation" add column "created_by" uuid;

alter table "public"."budget_allocation" add column "note" text;

alter table "public"."budgets" alter column "status" drop default;

alter table "public"."budgets" alter column "status" drop not null;

alter table "public"."budgets" alter column "status" set data type boolean using "status"::boolean;

alter table "public"."budget_allocation" add constraint "budget_allocation_created_by_fkey" FOREIGN KEY (created_by) REFERENCES profiles(id) not valid;

alter table "public"."budget_allocation" validate constraint "budget_allocation_created_by_fkey";

create policy "Allow update by creator with Finance or Super Admin role"
on "public"."budget_allocation"
as permissive
for update
to authenticated
using (((created_by = auth.uid()) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.name = ANY (ARRAY['Finance'::text, 'Super Admin'::text])))))));



