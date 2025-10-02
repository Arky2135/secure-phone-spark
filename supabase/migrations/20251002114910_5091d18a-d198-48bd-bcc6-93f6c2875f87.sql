-- Drop the trigger that prevents multiple verifications for the same phone number
DROP TRIGGER IF EXISTS prevent_duplicate_verification ON public.phone_verifications CASCADE;

-- Drop the function that was used by the trigger
DROP FUNCTION IF EXISTS public.check_phone_not_verified() CASCADE;