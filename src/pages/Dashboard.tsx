import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  User as UserIcon, 
  Trophy, 
  Target, 
  Calendar,
  LogOut,
  Users,
  Crown
} from "lucide-react";

interface Profile {
  id: string;
  account_code: string;
  full_name: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  email?: string;
  current_rank: number;
  total_matches: number;
  wins: number;
  losses: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      } else {
        fetchProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
        } else if (event === 'SIGNED_IN') {
          fetchProfile(session.user.id);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setProfile(data);
    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.message,
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
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-primary/10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-primary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>
              There was an issue loading your profile. Please try signing in again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSignOut} className="w-full">
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const winRate = profile.total_matches > 0 ? (profile.wins / profile.total_matches * 100).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-primary/10">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">P</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Pickleball Ranking
            </h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Profile Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{profile.full_name}</CardTitle>
                  <CardDescription className="text-lg">
                    Account: {profile.account_code}
                  </CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="capitalize">
                      {profile.gender}
                    </Badge>
                    <Badge variant="outline">
                      {profile.phone}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="text-center">
              <Crown className="w-8 h-8 mx-auto text-primary mb-2" />
              <CardTitle className="text-3xl font-bold text-primary">
                {profile.current_rank}
              </CardTitle>
              <CardDescription>Current Rank</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center pb-3">
              <Trophy className="w-6 h-6 mx-auto text-green-500 mb-1" />
              <CardTitle className="text-2xl font-bold text-green-600">
                {profile.wins}
              </CardTitle>
              <CardDescription>Wins</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center pb-3">
              <Target className="w-6 h-6 mx-auto text-red-500 mb-1" />
              <CardTitle className="text-2xl font-bold text-red-600">
                {profile.losses}
              </CardTitle>
              <CardDescription>Losses</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center pb-3">
              <Calendar className="w-6 h-6 mx-auto text-blue-500 mb-1" />
              <CardTitle className="text-2xl font-bold text-blue-600">
                {profile.total_matches}
              </CardTitle>
              <CardDescription>Total Matches</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center pb-3">
              <Users className="w-6 h-6 mx-auto text-purple-500 mb-1" />
              <CardTitle className="text-2xl font-bold text-purple-600">
                {winRate}%
              </CardTitle>
              <CardDescription>Win Rate</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="matches" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="rankings">Rankings</TabsTrigger>
            <TabsTrigger value="courts">Courts</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="matches" className="space-y-4">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>My Matches</CardTitle>
                <CardDescription>
                  View and manage your pickleball matches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No matches yet. Create your first match to get started!</p>
                  <Button className="mt-4">Create Match</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rankings" className="space-y-4">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Player Rankings</CardTitle>
                <CardDescription>
                  View leaderboard and player statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Rankings will appear here once matches are played.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courts" className="space-y-4">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Available Courts</CardTitle>
                <CardDescription>
                  Find and book pickleball courts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Court listings will be available here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Update your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <UserIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Profile editing features coming soon.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}