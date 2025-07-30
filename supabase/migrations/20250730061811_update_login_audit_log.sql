alter table "public"."login_audit_log"
add column "location" jsonb;

alter table "public"."login_audit_log"
add column "type" text not null;

alter table "public"."login_audit_log"
add column "user_id" uuid;

alter table "public"."login_audit_log" add constraint "login_audit_log_user_id_fkey" FOREIGN KEY (user_id) REFERENCES user_profiles (id) not valid;

alter table "public"."login_audit_log" validate constraint "login_audit_log_user_id_fkey";