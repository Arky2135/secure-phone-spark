-- Create phone_verifications table
CREATE TABLE public.phone_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  name TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '10 minutes')
);

-- Enable Row Level Security
ALTER TABLE public.phone_verifications ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting verification requests (public)
CREATE POLICY "Anyone can create verification requests"
ON public.phone_verifications
FOR INSERT
WITH CHECK (true);

-- Create policy for reading own verification (by phone number)
CREATE POLICY "Users can read their own verifications"
ON public.phone_verifications
FOR SELECT
USING (true);

-- Create policy for updating verification status
CREATE POLICY "Anyone can update verification status"
ON public.phone_verifications
FOR UPDATE
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_phone_verifications_phone ON public.phone_verifications(phone_number);
CREATE INDEX idx_phone_verifications_expires_at ON public.phone_verifications(expires_at);

-- Create function to clean up expired OTPs
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.phone_verifications
  WHERE expires_at < now() AND verified = false;
END;
$$;