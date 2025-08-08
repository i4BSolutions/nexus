alter table "public"."budget_allocation" drop constraint "budget_allocation_status_check";

alter table "public"."budget_allocation" alter column "transfer_evidence" set data type text[] using "transfer_evidence"::text[];

alter table "public"."budget_allocation" add constraint "budget_allocation_status_check" CHECK ((status = ANY (ARRAY['Pending'::text, 'Approved'::text, 'Canceled'::text]))) not valid;

alter table "public"."budget_allocation" validate constraint "budget_allocation_status_check";


