alter table "public"."purchase_order" add constraint "purchase_order_budget_id_fkey" FOREIGN KEY (budget_id) REFERENCES budgets(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."purchase_order" validate constraint "purchase_order_budget_id_fkey";


