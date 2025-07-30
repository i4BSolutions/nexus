alter table "public"."budget_allocation" add column "created_by" uuid;

alter table "public"."budget_allocation" add column "note" text;

alter table "public"."budgets" alter column "status" drop default;

alter table "public"."budgets" alter column "status" drop not null;

alter table "public"."budgets" alter column "status" set data type boolean using "status"::boolean;

alter table "public"."budget_allocation" add constraint "budget_allocation_created_by_fkey" FOREIGN KEY (created_by) REFERENCES user_profiles(id) not valid;

alter table "public"."budget_allocation" validate constraint "budget_allocation_created_by_fkey";


