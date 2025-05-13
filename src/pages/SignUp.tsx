import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import AuthLayout from "@/components/auth/AuthLayout";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { FirebaseError } from "firebase/app";

const SignUp = () => {
  const navigate = useNavigate();
  const { register, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    firstName: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.username || !formData.firstName || !formData.password || !formData.confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    try {
      setLoading(true);
      await register(
        formData.email, 
        formData.password,
        `${formData.firstName} (${formData.username})`
      );
      
      toast.success("Account created successfully! Please sign in.");
      navigate('/signin');
    } catch (error) {
      const firebaseError = error as FirebaseError;
      let errorMessage = "Failed to create account";
      
      // Handle specific Firebase errors
      if (firebaseError.code === 'auth/email-already-in-use') {
        errorMessage = "Email already in use";
      } else if (firebaseError.code === 'auth/weak-password') {
        errorMessage = "Password is too weak";
      } else if (firebaseError.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address";
      }
      
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      toast.success("Account created with Google successfully!");
      navigate('/dashboard');
    } catch (error) {
      toast.error("Failed to create account with Google");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Get Started"
      subtitle={<>Already have an account? <Link to="/signin" className="text-primary font-medium">Sign in</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            className="h-14 rounded-md text-base border-gray-300 focus:border-gray-500 focus:ring-gray-500"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="username"
            name="username"
            placeholder="Username"
            className="h-14 rounded-md text-base border-gray-300 focus:border-gray-500 focus:ring-gray-500"
            value={formData.username}
            onChange={handleChange}
          />
          
          <Input
            id="firstName"
            name="firstName"
            placeholder="First Name"
            className="h-14 rounded-md text-base border-gray-300 focus:border-gray-500 focus:ring-gray-500"
            value={formData.firstName}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            className="h-14 rounded-md text-base border-gray-300 focus:border-gray-500 focus:ring-gray-500"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            className="h-14 rounded-md text-base border-gray-300 focus:border-gray-500 focus:ring-gray-500"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full h-14 bg-black text-white rounded-md font-medium mt-3 text-base" 
          disabled={loading}
        >
          Sign Up
        </Button>
        
        <div className="relative flex items-center gap-4 py-4 my-2">
          <Separator className="flex-1" />
          <span className="text-sm text-gray-500 bg-white px-2">or sign up with</span>
          <Separator className="flex-1" />
        </div>
        
        <Button 
          variant="outline" 
          className="w-full h-14 rounded-md border border-gray-300 flex items-center justify-center gap-2 text-gray-700 text-base" 
          type="button"
          onClick={handleGoogleSignUp}
          disabled={loading}
        >
          <svg width="22" height="22" viewBox="0 0 24 24">
            <path 
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" 
              fill="#4285F4" 
            />
            <path 
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" 
              fill="#34A853" 
            />
            <path 
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" 
              fill="#FBBC05" 
            />
            <path 
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" 
              fill="#EA4335" 
            />
          </svg>
          Sign up with Google
        </Button>
        
        <p className="text-sm text-center text-gray-600 mt-3">
          By signing up, I agree to the <Link to="#" className="text-primary">Terms of Service</Link> and <Link to="#" className="text-primary">Privacy Policy</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default SignUp;
