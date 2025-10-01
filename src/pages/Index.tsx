import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CountryCodeSelect } from "@/components/CountryCodeSelect";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    countryCode: "+1",
    phoneNumber: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phoneNumber.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Basic phone number validation
    const phoneRegex = /^\+?[\d\s\-()]+$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const fullPhoneNumber = formData.countryCode + formData.phoneNumber;
      
      const { data, error } = await supabase.functions.invoke("send-otp", {
        body: {
          phoneNumber: fullPhoneNumber,
          name: formData.name,
        },
      });

      if (error) throw error;

      // Check if phone number is already verified
      if (data?.alreadyVerified) {
        toast({
          title: "Already Verified",
          description: "This phone number is already verified",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "OTP Sent!",
        description: "Check your phone for the verification code",
      });

      // Navigate to verify page with phone number
      navigate(`/verify?phone=${encodeURIComponent(fullPhoneNumber)}`);
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background via-background to-accent/5">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-glow)] mb-4">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Phone Verification
          </h1>
          <p className="text-muted-foreground text-lg">
            Secure your account with phone number verification
          </p>
        </div>

        {/* Form Card */}
        <Card className="border-border/50 shadow-[var(--shadow-soft)] backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Enter Your Details</CardTitle>
            <CardDescription>
              We'll send you a one-time verification code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={loading}
                  className="transition-all duration-300 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex gap-2">
                  <CountryCodeSelect
                    value={formData.countryCode}
                    onChange={(code) => setFormData({ ...formData, countryCode: code })}
                    disabled={loading}
                  />
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="555-123-4567"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, phoneNumber: e.target.value })
                      }
                      disabled={loading}
                      className="pl-10 transition-all duration-300 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-[var(--shadow-glow)] transition-all duration-300"
              >
                {loading ? "Sending..." : "Send Verification Code"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            🔒 Secure • 🚀 Fast • ✅ Reliable
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
