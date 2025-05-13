import { ReactNode, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string | ReactNode;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  const location = useLocation();
  
  // Add animation class when route changes
  useEffect(() => {
    const formElement = document.querySelector('.auth-form-container');
    if (formElement) {
      formElement.classList.add('fade-in');
      const timer = setTimeout(() => {
        formElement.classList.remove('fade-in');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="absolute top-4 left-4">
        <Link 
          to="/"
          className="flex items-center gap-1 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={30} />
          
        </Link>
      </div>

      <div className="flex w-full max-w-5xl h-[650px] rounded-2xl overflow-hidden bg-white shadow-xl">
        {/* Left side - Auth form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex items-center">
          <div className="w-full max-w-md mx-auto auth-form-container">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
              <p className="text-gray-600 mt-2 text-base">{subtitle}</p>
            </div>
            
            {children}
          </div>
        </div>
        
        {/* Right side - Image */}
        <div className="hidden md:block md:w-1/2">
          <img 
            src="https://www.paintout.org/wp-content/uploads/2019/10/DSC04126-Artist-Stephen-Johnston-Autumn-Fireworks-among-the-Dahlias-Houghton-Hall-Walled-Garden-Oil-20x20in-%C2%A3350.-Paint-Out-Gardens-2019.jpg"
            alt="Colorful floral artwork"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .fade-in {
            animation: fadeIn 0.5s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
};

export default AuthLayout;
