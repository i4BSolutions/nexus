alter table "public"."user_profiles"
add column "banned_until" timestamp
with
    time zone;