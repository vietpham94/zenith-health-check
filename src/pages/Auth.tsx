import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Phone, Mail } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp" | "email">("phone");

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  const handlePhoneAuth = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone,
        options: {
          shouldCreateUser: true,
        }
      });

      if (error) throw error;

      setStep("otp");
      toast({
        title: "OTP Sent",
        description: "Please check your phone for the verification code.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.verifyOtp({
        phone: phone,
        token: otp,
        type: 'sms'
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Phone verified successfully!",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;

      toast({
        title: "Check your email",
        description: "Please check your email for the verification link.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAppleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">P</span>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Pickleball Ranking
          </CardTitle>
          <CardDescription>
            Sign in to manage your matches and rankings
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="phone" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </TabsTrigger>
            </TabsList>

            <TabsContent value="phone" className="space-y-4">
              {step === "phone" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+84 xxx xxx xxx"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handlePhoneAuth} 
                    disabled={loading || !phone}
                    className="w-full"
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Send OTP
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                    />
                  </div>
                  <Button 
                    onClick={handleOtpVerification} 
                    disabled={loading || otp.length !== 6}
                    className="w-full"
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Verify
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setStep("phone")}
                    className="w-full"
                  >
                    Back
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="email" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Button 
                    onClick={handleEmailSignIn} 
                    disabled={loading || !email || !password}
                    className="w-full"
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Sign In
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleEmailSignUp} 
                    disabled={loading || !email || !password}
                    className="w-full"
                  >
                    Sign Up
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Button 
              variant="outline" 
              onClick={handleGoogleAuth}
              className="w-full"
            >
              Continue with Google
            </Button>
            <Button 
              variant="outline" 
              onClick={handleAppleAuth}
              className="w-full"
            >
              Continue with Apple
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}