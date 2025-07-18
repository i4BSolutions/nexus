alter table "public"."budgets" drop constraint "budgets_status_check";

alter table "public"."budgets" alter column "status" drop default;

alter table "public"."budgets" alter column "status" drop not null;

alter table "public"."budgets" alter column "status" set data type boolean using "status"::boolean;


