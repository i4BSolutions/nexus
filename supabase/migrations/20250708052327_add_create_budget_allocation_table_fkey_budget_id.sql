alter table "public"."budget_allocation" add column "budget_id" bigint;

alter table "public"."budget_allocation_activity_logs" alter column "currency_code" drop not null;

alter table "public"."budget_allocation" add constraint "fk_allocations_budget" FOREIGN KEY (budget_id) REFERENCES budgets(id) not valid;

alter table "public"."budget_allocation" validate constraint "fk_allocations_budget";


