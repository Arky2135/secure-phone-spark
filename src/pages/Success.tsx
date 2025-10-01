import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Database } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VerificationRecord {
  id: string;
  phone_number: string;
  name: string;
  verified: boolean;
  created_at: string;
}

const Success = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [verifications, setVerifications] = useState<VerificationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      const { data, error } = await supabase
        .from("phone_verifications")
        .select("id, phone_number, name, verified, created_at")
        .eq("verified", true)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setVerifications(data || []);
    } catch (error: any) {
      console.error("Error fetching verifications:", error);
      toast({
        title: "Error",
        description: "Failed to load verification records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background via-background to-success/5">
      <div className="w-full max-w-md space-y-8">
        {/* Success Animation */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-success/20 rounded-full blur-2xl animate-pulse" />
            <CheckCircle2 className="w-24 h-24 text-success relative" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-success to-success/70 bg-clip-text text-transparent">
            Verified Successfully!
          </h1>
          <p className="text-muted-foreground text-lg">
            Your phone number has been verified
          </p>
        </div>

        {/* Success Card */}
        <Card className="border-success/20 shadow-[0_0_40px_-10px_hsl(var(--success)/0.3)] backdrop-blur-sm bg-success/5">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2 text-center">
              <p className="text-foreground font-medium">
                ✅ Phone number verified
              </p>
              <p className="text-sm text-muted-foreground">
                You can now access all features of our service
              </p>
            </div>

            <Button
              onClick={() => navigate("/")}
              className="w-full bg-success hover:bg-success/90 text-success-foreground"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>

        {/* Database Records */}
        <Card className="border-border/50 shadow-[var(--shadow-soft)] backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              <CardTitle>Verification Records</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground">Loading records...</p>
            ) : verifications.length === 0 ? (
              <p className="text-center text-muted-foreground">No verification records found</p>
            ) : (
              <div className="space-y-3">
                {verifications.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 rounded-lg border border-border/50 bg-card/50 space-y-1"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">{record.name}</p>
                        <p className="text-sm text-muted-foreground">{record.phone_number}</p>
                      </div>
                      {record.verified && (
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(record.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Thank you for verifying your phone number 🎉
          </p>
        </div>
      </div>
    </div>
  );
};

export default Success;
