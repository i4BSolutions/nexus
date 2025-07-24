alter table "public"."budget_allocation" alter column "currency_code" set data type character varying using "currency_code"::character varying;

alter table "public"."purchase_order" add constraint "fk_po_budget" FOREIGN KEY (budget_id) REFERENCES budgets(id) not valid;

alter table "public"."purchase_order" validate constraint "fk_po_budget";


