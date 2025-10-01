import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, LogOut, XCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

interface VerificationRecord {
  id: string;
  phone_number: string;
  name: string;
  verified: boolean;
  created_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [verifications, setVerifications] = useState<VerificationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate("/auth");
      } else {
        fetchVerifications();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchVerifications = async () => {
    try {
      const { data, error } = await supabase
        .from("phone_verifications")
        .select("id, phone_number, name, verified, created_at")
        .order("created_at", { ascending: true })
        .limit(50);

      if (error) throw error;
      setVerifications(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load verification records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
      
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Officer Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage phone verification records
            </p>
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">
                  {verifications.length}
                </p>
                <p className="text-sm text-muted-foreground">Total Records</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-success">
                  {verifications.filter(v => v.verified).length}
                </p>
                <p className="text-sm text-muted-foreground">Verified</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-destructive">
                  {verifications.filter(v => !v.verified).length}
                </p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verification Records */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Records</TabsTrigger>
            <TabsTrigger value="verified">Verified</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <Card className="border-border/50 shadow-[var(--shadow-soft)]">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  <CardTitle>All Verification Records</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center text-muted-foreground py-8">Loading records...</p>
                ) : verifications.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No verification records found</p>
                ) : (
                  <div className="space-y-3">
                    {verifications.map((record, index) => (
                      <div
                        key={record.id}
                        className="p-4 rounded-lg border border-border/50 bg-card/50 hover:bg-card/80 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">
                                #{String(index + 1).padStart(3, '0')}
                              </span>
                              {record.verified ? (
                                <span className="text-xs font-medium bg-success/10 text-success px-2 py-0.5 rounded">
                                  Verified
                                </span>
                              ) : (
                                <span className="text-xs font-medium bg-destructive/10 text-destructive px-2 py-0.5 rounded">
                                  Failed
                                </span>
                              )}
                              <p className="font-medium text-foreground">{record.name}</p>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{record.phone_number}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(record.created_at).toLocaleString()}
                            </p>
                          </div>
                          {record.verified ? (
                            <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verified" className="mt-6">
            <Card className="border-border/50 shadow-[var(--shadow-soft)]">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <CardTitle>Verified Records</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center text-muted-foreground py-8">Loading records...</p>
                ) : verifications.filter(v => v.verified).length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No verified records found</p>
                ) : (
                  <div className="space-y-3">
                    {verifications.filter(v => v.verified).map((record, index) => (
                      <div
                        key={record.id}
                        className="p-4 rounded-lg border border-success/20 bg-success/5 hover:bg-success/10 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono bg-success/10 text-success px-2 py-0.5 rounded">
                                #{String(index + 1).padStart(3, '0')}
                              </span>
                              <p className="font-medium text-foreground">{record.name}</p>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{record.phone_number}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(record.created_at).toLocaleString()}
                            </p>
                          </div>
                          <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="failed" className="mt-6">
            <Card className="border-border/50 shadow-[var(--shadow-soft)]">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-destructive" />
                  <CardTitle>Failed Verifications</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center text-muted-foreground py-8">Loading records...</p>
                ) : verifications.filter(v => !v.verified).length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No failed records found</p>
                ) : (
                  <div className="space-y-3">
                    {verifications.filter(v => !v.verified).map((record, index) => (
                      <div
                        key={record.id}
                        className="p-4 rounded-lg border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono bg-destructive/10 text-destructive px-2 py-0.5 rounded">
                                #{String(index + 1).padStart(3, '0')}
                              </span>
                              <p className="font-medium text-foreground">{record.name}</p>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{record.phone_number}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(record.created_at).toLocaleString()}
                            </p>
                          </div>
                          <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
