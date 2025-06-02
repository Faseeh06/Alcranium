import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-[#181824] flex flex-col">
      {/* Navbar */}
      <nav className="container mx-auto flex justify-between items-center py-6 px-4 md:px-0">
        <div className="flex items-center gap-3">
          <img 
            src="https://i.postimg.cc/ZnZMWhxb/image.png" 
            alt="Alcranium Logo" 
            className="h-8 w-8 rounded-lg"
          />
          <span className="text-xl font-bold tracking-tight">Alcranium</span>
        </div>
        <div className="hidden md:flex gap-8 text-muted-foreground text-base font-medium">
          <a href="#features" className="hover:text-primary transition">Features</a>
          <a href="#pricing" className="hover:text-primary transition">Pricing</a>
          <a href="#community" className="hover:text-primary transition">Community</a>
          <a href="#docs" className="hover:text-primary transition">Docs</a>
        </div>
        <div className="flex gap-3">
          <Link to="/signin">
            <Button variant="ghost" className="px-5">Log in</Button>
          </Link>
          <Link to="/signup">
            <Button className="px-5">Download</Button>
          </Link>
        </div>
      </nav>

      {/* Notification Banner */}
      <div className="flex justify-center mt-4">
        <div className="bg-card/80 border border-border px-6 py-2 rounded-full shadow text-sm text-muted-foreground backdrop-blur-md">
          🚀 The all-in-one productivity app for students. Organize, track, and excel with Alcranium!
        </div>
      </div>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-1 text-center px-4">
        <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mt-12 mb-4 drop-shadow-lg">
          Collaborate with Intelligence
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Trae IDE integrates seamlessly into your workflow, collaborating with you to maximize performance and efficiency.
        </p>
        <div className="flex flex-col gap-4 justify-center mb-6">
          <Button className="px-12 py-4 text-lg font-bold shadow-lg text-white bg-primary hover:bg-primary/90 transition ">
            Try Now
          </Button>
        </div>
        {/* Product Screenshot/Mockup */}
        <div className="w-full flex justify-center mt-4">
          <img 
            src="/dashboard.png" 
            alt="Dashboard Preview" 
            className="rounded-2xl w-full max-w-8xl md:w-3/4 shadow-lg"
          />
        </div>

        {/* Large Text Section */}
        <div className="w-full mt-40 mb-40 px-8 md:px-24 text-left">
          <div className="max-w-[98%]">
            <h2 className="text-5xl md:text-7xl lg:text-7xl font-extrabold mb-14 text-left">
              Alcranium enables natural learning to unlock possibilities for <span className="bg-gradient-to-r from-[#ff7070] to-[#e09cc1] bg-clip-text text-transparent">Student-AI collaboration</span><br />
              just <span className="text-[#e09cc1]">@Study</span> <span className="text-primary">#Focus</span>, and Alcranium will enhance your learning journey.
            </h2>
          </div>
        </div>

        {/* Feature Boxes */}
        <div className="container mx-auto flex flex-col gap-32">
          {/* Pomodoro Feature */}
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2 order-2 md:order-1">
              <span className="text-primary font-semibold uppercase text-base mb-2 block tracking-wide">#Pomodoro</span>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">Master Your Focus with Pomodoro</h2>
              <p className="text-muted-foreground text-xl mb-4">Break your study sessions into focused sprints and enjoy guilt-free breaks. Alcranium's Pomodoro timer helps you beat procrastination, stay energized, and get more done—one session at a time.</p>
            </div>
            <div className="md:w-1/2 order-1 md:order-2 flex justify-center">
              <img src="/pomodoro.png" alt="Pomodoro Feature" className="rounded-xl w-full max-w-2xl md:max-w-3xl shadow-lg" />
            </div>
          </div>

          {/* AI Feature */}
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2 flex justify-center">
              <img src="/ai.png" alt="AI Feature" className="rounded-xl w-full max-w-2xl md:max-w-3xl shadow-lg" />
            </div>
            <div className="md:w-1/2">
              <span className="text-primary font-semibold uppercase text-base mb-2 block tracking-wide">#AI Assistant</span>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">Your Personal AI Study Buddy</h2>
              <p className="text-muted-foreground text-xl mb-4">Get instant answers, smart study suggestions, and personalized insights. Alcranium's AI assistant helps you organize, learn, and achieve more—so you can reach your academic goals faster and smarter.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section Above Footer */}
      <div className="w-full flex flex-col items-center justify-center text-center py-20 bg-transparent">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-foreground">Ready to get started with Alcranium?</h2>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">Sign in to unlock your personalized dashboard, AI-powered study tools, and more. Join students already boosting their productivity with Alcranium!</p>
        <a href="/signin">
          <button className="px-10 py-4 text-lg font-bold shadow-lg text-white bg-primary hover:bg-primary/90 transition rounded-[5px] ">Log In</button>
        </a>
      </div>

      {/* Footer */}
      <footer className="w-full pt-36 pb-28 px-0 md:px-0 bg-transparent">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12 md:gap-0 gap-y-8 px-8 md:px-16">
          {/* Left: Logo, name, and copyright */}
          <div className="flex flex-col items-start gap-3 min-w-[220px]">
            <div className="flex items-center gap-3 mb-2">
              <img src="https://i.postimg.cc/ZnZMWhxb/image.png" alt="Alcranium Logo" className="h-8 w-8" />
              <span className="text-xl font-bold tracking-tight text-foreground">Alcranium</span>
            </div>
            <span className="text-muted-foreground text-sm">Copyright © {new Date().getFullYear()}. All rights reserved.</span>
          </div>
          {/* Right: Links */}
          <div className="flex flex-col md:flex-row gap-20 w-full md:w-auto justify-end md:justify-end">
            <div className="flex flex-col gap-1 min-w-[120px]">
              <span className="font-semibold mb-1">Terms</span>
              <a href="#" className="text-muted-foreground hover:text-foreground text-sm">Terms of Service</a>
              <a href="#" className="text-muted-foreground hover:text-foreground text-sm">Privacy Policy</a>
              <a href="#" className="text-muted-foreground hover:text-foreground text-sm">Cookie Policy</a>
            </div>
            <div className="flex flex-col gap-1 min-w-[120px]">
              <span className="font-semibold mb-1">Supports</span>
              <a href="#" className="text-muted-foreground hover:text-foreground text-sm">Feedback</a>
              <a href="#" className="text-muted-foreground hover:text-foreground text-sm">Docs</a>
            </div>
            <div className="flex flex-col gap-1 min-w-[120px]">
              <span className="font-semibold mb-1">Engage</span>
              <a href="#" className="text-muted-foreground hover:text-foreground text-sm">Discord ↗</a>
              <a href="#" className="text-muted-foreground hover:text-foreground text-sm">Twitter X ↗</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing; 