-- Drop the rate limiting table and function
DROP FUNCTION IF EXISTS public.check_otp_rate_limit(text, integer, integer);
DROP TABLE IF EXISTS public.otp_rate_limits;