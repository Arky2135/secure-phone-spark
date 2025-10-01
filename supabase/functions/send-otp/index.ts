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

    // Send SMS using Twilio
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.warn("Twilio credentials not configured. OTP:", otpCode);
      return new Response(
        JSON.stringify({
          success: true,
          message: "OTP generated (Twilio not configured)",
          devOTP: otpCode,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    try {
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
          Body: `Hello ${name}! Your verification code is: ${otpCode}. Valid for 5 minutes.`,
        }),
      });

      if (!twilioResponse.ok) {
        const errorText = await twilioResponse.text();
        console.error("Twilio error:", errorText);
        throw new Error("Failed to send SMS via Twilio");
      }

      const twilioData = await twilioResponse.json();
      console.log("SMS sent successfully via Twilio:", twilioData.sid);

      return new Response(
        JSON.stringify({
          success: true,
          message: "OTP sent successfully via SMS",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    } catch (twilioError: any) {
      console.error("Error sending SMS via Twilio:", twilioError);
      // Still return success since OTP is stored in DB
      return new Response(
        JSON.stringify({
          success: true,
          message: "OTP generated (SMS sending failed)",
          devOTP: otpCode,
          error: twilioError.message,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
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
