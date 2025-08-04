alter table "public"."purchase_order" alter column "note" set default ''::text;

alter table "public"."pruchase_orders_audit_log" add constraint "pruchase_orders_audit_log_changed_by_fkey" FOREIGN KEY (changed_by) REFERENCES user_profiles(id) not valid;

alter table "public"."pruchase_orders_audit_log" validate constraint "pruchase_orders_audit_log_changed_by_fkey";


