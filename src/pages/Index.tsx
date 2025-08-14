import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Users, 
  Target, 
  Clock,
  ArrowRight,
  Star,
  Shield,
  Zap
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-primary/10">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="space-y-6 max-w-4xl mx-auto">
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
              🏓 Professional Pickleball Management
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent leading-tight">
              Master Your Pickleball Game
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Track rankings, manage matches, and compete with players at your level. 
              Join the ultimate pickleball ranking and match management platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <Link to="/auth">
                <Button size="lg" className="px-8 py-6 text-lg font-semibold">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
                Learn More
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 opacity-20">
          <Trophy className="w-12 h-12 text-primary animate-pulse" />
        </div>
        <div className="absolute top-40 right-20 opacity-20">
          <Target className="w-8 h-8 text-accent animate-bounce" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Comprehensive tools designed for serious pickleball players and tournament organizers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle>Smart Ranking System</CardTitle>
                <CardDescription>
                  Advanced ELO-based ranking with gender-specific starting points and dynamic scoring
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/70 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-accent-foreground" />
                </div>
                <CardTitle>Match Management</CardTitle>
                <CardDescription>
                  Create singles/doubles matches with automatic handicap suggestions and score tracking
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary to-secondary/70 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-secondary-foreground" />
                </div>
                <CardTitle>Secure Authentication</CardTitle>
                <CardDescription>
                  Multiple sign-in options: phone, email, Google, and Apple for maximum convenience
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">1,000+</div>
              <div className="text-muted-foreground">Active Players</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">5,000+</div>
              <div className="text-muted-foreground">Matches Played</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">50+</div>
              <div className="text-muted-foreground">Courts Available</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">99.9%</div>
              <div className="text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold">
              Ready to Elevate Your Game?
            </h2>
            <p className="text-muted-foreground text-lg">
              Join thousands of players already using our platform to track their progress and compete at the highest level.
            </p>
            <Link to="/auth">
              <Button size="lg" className="px-8 py-6 text-lg font-semibold">
                Start Your Journey
                <Zap className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">P</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Pickleball Ranking
            </span>
          </div>
          <p className="text-muted-foreground">
            © 2024 Pickleball Ranking. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;