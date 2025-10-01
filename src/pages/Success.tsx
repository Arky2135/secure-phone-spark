import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Success = () => {
  const navigate = useNavigate();

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
