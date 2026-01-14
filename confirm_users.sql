-- AUTO CONFIRM USERS
-- This script manually confirms all users who are currently "waiting for email confirmation".
-- Run this to allow login immediately without checking inbox.

update auth.users
set email_confirmed_at = now()
where email_confirmed_at is null;
