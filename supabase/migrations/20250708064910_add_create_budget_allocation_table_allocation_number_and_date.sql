alter table "public"."budget_allocation" add column "allocation_date" date not null;

alter table "public"."budget_allocation" add column "allocation_number" text not null;

alter table "public"."budget_allocation" alter column "currency_code" set data type character varying(10) using "currency_code"::character varying(10);


