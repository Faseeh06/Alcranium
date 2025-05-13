import { Quote } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const quotes = [
  {
    text: "The only way to learn is by doing.",
    author: "Albert Einstein"
  },
  {
    text: "Your actions today will shape the tomorrow you want.",
    author: "Unknown"
  },
  {
    text: "Study hard what interests you the most in the most undisciplined way possible.",
    author: "Richard Feynman"
  },
  {
    text: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar"
  },
  {
    text: "The expert in anything was once a beginner.",
    author: "Helen Hayes"
  }
];

const RandomQuote = () => {
  const navigate = useNavigate();
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  
  useEffect(() => {
    // Change quote every 10 minutes (600000 ms)
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 600000);
    
    // Clean up on unmount
    return () => clearInterval(interval);
  }, []);
  
  const { text, author } = quotes[currentQuoteIndex];
  
  const handleClick = () => {
    navigate("/dashboard/inspiration");
  };
  
  return (
    <div 
      className="quote-card cursor-pointer transition-all hover:shadow-md bg-[#205781] text-white"
      onClick={handleClick}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-light">Inspiration</h3>
        <Quote className="text-white" />
      </div>
      
      <div className="flex-grow flex flex-col justify-center items-center px-2">
        <p className="text-lg text-center font-medium italic">"{text}"</p>
        <p className="text-sm text-white/80 mt-2">— {author}</p>
      </div>
      
      
    </div>
  );
};

export default RandomQuote; 