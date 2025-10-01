-- Update the expires_at default to 5 minutes instead of 10 minutes
ALTER TABLE public.phone_verifications 
ALTER COLUMN expires_at SET DEFAULT (now() + interval '5 minutes');