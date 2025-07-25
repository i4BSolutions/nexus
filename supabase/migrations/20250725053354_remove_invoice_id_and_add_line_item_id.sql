alter table "public"."stock_transaction" drop constraint "stock_transaction_invoice_id_fkey";

alter table "public"."purchase_invoice" alter column "note" set default ''::text;

alter table "public"."purchase_invoice" disable row level security;

alter table "public"."purchase_invoice_item" disable row level security;

alter table "public"."stock_transaction" drop column "invoice_id";

alter table "public"."stock_transaction" add column "invoice_line_item_id" bigint;

alter table "public"."stock_transaction" add constraint "stock_transaction_invoice_line_item_id_fkey" FOREIGN KEY (invoice_line_item_id) REFERENCES purchase_invoice_item(id) not valid;

alter table "public"."stock_transaction" validate constraint "stock_transaction_invoice_line_item_id_fkey";


