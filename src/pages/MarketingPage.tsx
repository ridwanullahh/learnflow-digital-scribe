
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { BookOpen, Brain, Zap, Shield, Globe, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MarketingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">LearnFlow</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/app">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/app">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-5xl font-bold text-foreground mb-6">
            Transform Your Learning with
            <span className="text-primary"> AI-Powered Books</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Experience the future of digital reading with our offline-first, intelligent book app. 
            Master any subject with AI-generated quizzes, flashcards, and personalized learning tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/app">
              <Button size="lg" className="text-lg px-8">
                Start Learning Free
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-3xl font-bold text-center text-foreground mb-12">
            Why Choose LearnFlow?
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Brain className="w-10 h-10 text-primary mb-4" />
                <CardTitle>AI-Powered Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Generate quizzes, flashcards, and summaries instantly with our advanced AI technology.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Zap className="w-10 h-10 text-primary mb-4" />
                <CardTitle>Offline First</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Learn anywhere, anytime. All your books and generated content work without internet.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Shield className="w-10 h-10 text-primary mb-4" />
                <CardTitle>Privacy Focused</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your data stays yours. Local storage with optional cloud sync for your convenience.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Globe className="w-10 h-10 text-primary mb-4" />
                <CardTitle>Multi-Language TTS</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Listen to your books with our advanced text-to-speech in multiple languages.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Users className="w-10 h-10 text-primary mb-4" />
                <CardTitle>Interactive Canvas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Take notes, draw diagrams, and annotate directly on your digital books.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <BookOpen className="w-10 h-10 text-primary mb-4" />
                <CardTitle>Retention Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Blur modes and spaced repetition help you retain information longer.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h3 className="text-3xl font-bold text-foreground mb-6">
            Ready to Transform Your Learning?
          </h3>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of learners who have revolutionized their study habits with LearnFlow.
          </p>
          <Link to="/app">
            <Button size="lg" className="text-lg px-12">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/20 py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold text-foreground">LearnFlow</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 LearnFlow. All rights reserved. Built with love for learners.
          </p>
        </div>
      </footer>
    </div>
  );
};
