-- Add unique constraint to ensure a phone number can only be verified once
-- This creates a partial unique index that only applies to verified records
CREATE UNIQUE INDEX IF NOT EXISTS idx_phone_verifications_verified_phone 
ON public.phone_verifications (phone_number) 
WHERE verified = true;

-- Add function to check if phone is already verified before allowing new verification
CREATE OR REPLACE FUNCTION public.check_phone_not_verified()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.verified = true THEN
    IF EXISTS (
      SELECT 1 FROM public.phone_verifications 
      WHERE phone_number = NEW.phone_number 
      AND verified = true 
      AND id != NEW.id
    ) THEN
      RAISE EXCEPTION 'Phone number % is already verified', NEW.phone_number;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to prevent duplicate verifications
DROP TRIGGER IF EXISTS prevent_duplicate_verification ON public.phone_verifications;
CREATE TRIGGER prevent_duplicate_verification
  BEFORE INSERT OR UPDATE ON public.phone_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.check_phone_not_verified();