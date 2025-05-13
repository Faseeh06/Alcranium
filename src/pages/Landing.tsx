import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";

const Landing = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="container mx-auto flex justify-between items-center p-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-medium">Alcranium</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            className="p-2 rounded-full hover:bg-secondary"
            onClick={toggleTheme}
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <Link to="/signin">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link to="/signup">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 flex flex-col md:flex-row items-center gap-16">
        <div className="md:w-1/2 space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Supercharge Your Learning & Productivity
          </h1>
          <p className="text-xl text-muted-foreground">
            Manage tasks, track study sessions, and organize materials all in one place. The ultimate companion for better productivity and learning.
          </p>
          <div className="flex gap-4">
            <Link to="/signup">
              <Button size="lg" className="px-8">
                Get Started
              </Button>
            </Link>
            <Link to="/signin">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
        <div className="md:w-1/2">
          <img 
            src="/dashboard-preview.png" 
            alt="Dashboard Preview" 
            className="rounded-lg shadow-xl border dark:border-gray-800"
            onError={(e) => {
              e.currentTarget.src = "https://placehold.co/600x400/4338CA/FFFFFF?text=Dashboard+Preview";
            }}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">
            Everything You Need to Excel
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg p-8 shadow-sm">
              <div className="bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full mb-6">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Task Management</h3>
              <p className="text-muted-foreground">
                Create, organize, and prioritize your tasks with ease. Set due dates, reminders, and track your progress.
              </p>
            </div>

            <div className="bg-card rounded-lg p-8 shadow-sm">
              <div className="bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full mb-6">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Pomodoro Timer</h3>
              <p className="text-muted-foreground">
                Stay focused and avoid burnout with our built-in Pomodoro timer. Customize work and break intervals to match your style.
              </p>
            </div>

            <div className="bg-card rounded-lg p-8 shadow-sm">
              <div className="bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full mb-6">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Calendar Integration</h3>
              <p className="text-muted-foreground">
                View your schedule at a glance and plan your studies efficiently with our intuitive calendar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Learning Experience?</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Join thousands of students who have already improved their productivity and learning outcomes with Alcranium.
        </p>
        <Link to="/signup">
          <Button size="lg" className="px-8">Get Started for Free</Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className="text-xl font-medium">Alcranium</h2>
              <p className="text-muted-foreground mt-2">© 2023 Alcranium. All rights reserved.</p>
            </div>
            <div className="flex gap-8 mt-6 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-foreground">Terms</a>
              <a href="#" className="text-muted-foreground hover:text-foreground">Privacy</a>
              <a href="#" className="text-muted-foreground hover:text-foreground">Help</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing; 