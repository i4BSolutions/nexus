alter table "public"."pruchase_invoice_audit_log" add constraint "pruchase_invoice_audit_log_changed_by_fkey" FOREIGN KEY (changed_by) REFERENCES user_profiles(id) not valid;

alter table "public"."pruchase_invoice_audit_log" validate constraint "pruchase_invoice_audit_log_changed_by_fkey";

alter table "public"."purchase_invoice" add column "is_voided" boolean not null default false;
