import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendOTPRequest {
  phoneNumber: string;
  name: string;
}

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, name }: SendOTPRequest = await req.json();

    if (!phoneNumber || !name) {
      throw new Error("Phone number and name are required");
    }

    console.log("Generating OTP for:", phoneNumber);

    // Generate OTP code
    const otpCode = generateOTP();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Store OTP in database
    const { data, error: dbError } = await supabase
      .from("phone_verifications")
      .insert({
        phone_number: phoneNumber,
        name: name,
        otp_code: otpCode,
        verified: false,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to store OTP");
    }

    console.log("OTP stored in database:", data.id);

    // TODO: Send SMS using Twilio
    // For now, we'll just log the OTP (in production, you'd send via SMS)
    console.log(`OTP Code for ${phoneNumber}: ${otpCode}`);
    
    // In production, uncomment and configure Twilio:
    /*
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    
    const twilioResponse = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: phoneNumber,
        From: twilioPhoneNumber,
        Body: `Your verification code is: ${otpCode}. Valid for 10 minutes.`,
      }),
    });

    if (!twilioResponse.ok) {
      throw new Error("Failed to send SMS");
    }
    */

    return new Response(
      JSON.stringify({
        success: true,
        message: "OTP sent successfully",
        // In development, return the OTP for testing
        devOTP: otpCode,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
