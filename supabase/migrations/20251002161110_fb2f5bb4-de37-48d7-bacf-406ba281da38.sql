-- Drop unique index that enforces a single verified record per phone number
-- This was causing verify errors when attempting to set a new record to verified
DROP INDEX IF EXISTS public.idx_phone_verifications_verified_phone;