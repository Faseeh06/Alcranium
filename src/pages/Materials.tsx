import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  BookOpen, 
  Video, 
  FileText, 
  Code, 
  Calculator, 
  Award, 
  Lightbulb, 
  GraduationCap,
  ExternalLink,
  Bookmark,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Categories of study resources
const categories = [
  { id: 'all', name: 'All Resources', icon: BookOpen },
  { id: 'videos', name: 'Video Tutorials', icon: Video },
  { id: 'articles', name: 'Articles & Guides', icon: FileText },
  { id: 'code', name: 'Coding & Practice', icon: Code },
  { id: 'tools', name: 'Study Tools', icon: Calculator },
  { id: 'courses', name: 'Courses', icon: GraduationCap },
];

// Study resources
const resources = [
  {
    id: 1,
    name: 'Khan Academy',
    description: 'Free world-class education for anyone, anywhere. Covering math, science, and more.',
    url: 'https://www.khanacademy.org',
    imageUrl: 'https://cdn.kastatic.org/images/khan-logo-vertical-transparent.png',
    categories: ['videos', 'courses'],
    featured: true,
  },
  {
    id: 2,
    name: 'Coursera',
    description: 'Learn online and earn credentials from top universities like Yale, Michigan, Stanford, and more.',
    url: 'https://www.coursera.org',
    imageUrl: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera.s3.amazonaws.com/media/coursera-logo-square.png',
    categories: ['courses', 'videos'],
    featured: true,
  },
  {
    id: 3,
    name: 'edX',
    description: 'Access 2000+ online courses from 140+ institutions. Learn computer science, data science, business & more.',
    url: 'https://www.edx.org',
    imageUrl: 'https://www.edx.org/images/logos/edx-logo-elm.svg',
    categories: ['courses', 'videos'],
    featured: true,
  },
  {
    id: 4,
    name: 'Quizlet',
    description: 'Study tools for every student - learn with flashcards, games and more.',
    url: 'https://quizlet.com',
    imageUrl: 'https://assets.quizlet.com/a/j/dist/app/i/logo/2021/q-twilight.3d134d826ae9e53.svg',
    categories: ['tools'],
    featured: false,
  },
  {
    id: 5,
    name: 'LeetCode',
    description: 'Enhance your skills, expand your knowledge and prepare for technical interviews.',
    url: 'https://leetcode.com',
    imageUrl: 'https://leetcode.com/static/images/LeetCode_logo_rvs.png',
    categories: ['code'],
    featured: false,
  },
  {
    id: 6,
    name: 'Codecademy',
    description: 'Learn to code interactively, for free - from HTML & CSS to Python and data science.',
    url: 'https://www.codecademy.com',
    imageUrl: 'https://www.codecademy.com/resources/blog/content/images/2021/12/dark-purple-1.png',
    categories: ['code', 'courses'],
    featured: true,
  },
  {
    id: 7,
    name: 'MIT OpenCourseWare',
    description: 'Free access to MIT course materials - lecture notes, videos, and more.',
    url: 'https://ocw.mit.edu',
    imageUrl: 'https://ocw.mit.edu/wp-content/uploads/2022/06/ocw_v.svg',
    categories: ['courses', 'videos'],
    featured: false,
  },
  {
    id: 8,
    name: 'Wolfram Alpha',
    description: 'Computational intelligence for math, science, nutrition, history, and more.',
    url: 'https://www.wolframalpha.com',
    imageUrl: 'https://www.wolframalpha.com/images/spikey.png',
    categories: ['tools'],
    featured: false,
  },
  {
    id: 9,
    name: 'Project Gutenberg',
    description: 'Free eBooks for students and researchers. Over 60,000 free books.',
    url: 'https://www.gutenberg.org',
    imageUrl: 'https://www.gutenberg.org/gutenberg/pg-logo-129x80.png',
    categories: ['articles'],
    featured: false,
  },
  {
    id: 10,
    name: 'Duolingo',
    description: 'Learn languages for free with fun, bite-sized lessons.',
    url: 'https://www.duolingo.com',
    imageUrl: 'https://d35aaqx5ub95lt.cloudfront.net/images/logo-with-duo.png',
    categories: ['tools', 'courses'],
    featured: true,
  },
  {
    id: 11,
    name: 'Stack Overflow',
    description: 'Find answers to your programming questions with the largest developer community.',
    url: 'https://stackoverflow.com',
    imageUrl: 'https://cdn.sstatic.net/Sites/stackoverflow/Img/apple-touch-icon.png',
    categories: ['code'],
    featured: false,
  },
  {
    id: 12,
    name: 'TED-Ed',
    description: 'Educational videos and animations from educators and TED speakers.',
    url: 'https://ed.ted.com',
    imageUrl: 'https://pa.tedcdn.com/apple-touch-icon.png',
    categories: ['videos'],
    featured: false,
  },
];

const Materials = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);

  // Filter resources based on selected category and search term
  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === 'all' || resource.categories.includes(selectedCategory);
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl font-light">Study Materials</h1>
        <BookOpen size={28} className="text-[#f0bfdc]" />
      </div>

      {/* Search and filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <Input 
            placeholder="Search resources..." 
            className="pl-10 bg-white border-none shadow-sm focus-visible:ring-[#f0bfdc]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          className="bg-black text-white hover:bg-black/80 rounded-full px-6"
          onClick={() => setSearchTerm('')}
        >
          Clear
        </Button>
      </div>

      {/* Categories */}
      <div className="flex overflow-x-auto gap-2 pb-2 transparent-scrollbar">
        {categories.map(category => (
          <Button
            key={category.id}
            variant="ghost"
            className={cn(
              "flex gap-2 items-center rounded-full px-4 py-2 whitespace-nowrap transition-all",
              selectedCategory === category.id 
                ? "bg-[#f0bfdc]/20 text-[#f0bfdc] border-2 border-[#f0bfdc]"
                : "hover:bg-[#f0bfdc]/10"
            )}
            onClick={() => setSelectedCategory(category.id)}
          >
            <category.icon size={18} />
            {category.name}
          </Button>
        ))}
      </div>

      {/* Featured resources */}
      {selectedCategory === 'all' && searchTerm === '' && (
        <>
          <div className="mt-8">
            <h2 className="text-xl font-light flex items-center gap-2 mb-4">
              <Star className="text-[#f0bfdc]" size={20} />
              Featured Resources
            </h2>
            <Separator className="my-4 bg-black/10" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.filter(r => r.featured).map(resource => (
                <Card 
                  key={resource.id} 
                  className="overflow-hidden transition-all bg-[#eee7da] border-none rounded-xl shadow-sm hover:shadow-md"
                >
                  <div className="h-36 bg-white/50 flex items-center justify-center p-6">
                    <img 
                      src={resource.imageUrl} 
                      alt={resource.name} 
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-medium">{resource.name}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "text-gray-400 hover:text-[#f0bfdc]", 
                          favorites.includes(resource.id) && "text-[#f0bfdc]"
                        )}
                        onClick={() => toggleFavorite(resource.id)}
                      >
                        <Bookmark size={18} fill={favorites.includes(resource.id) ? "#f0bfdc" : "none"} />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {resource.description}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex flex-wrap gap-1">
                        {resource.categories.map(cat => (
                          <span 
                            key={cat} 
                            className="text-xs bg-white px-2 py-1 rounded-full text-black/60"
                          >
                            {categories.find(c => c.id === cat)?.name}
                          </span>
                        ))}
                      </div>
                      <a 
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#f0bfdc] hover:text-[#f0bfdc]/80 flex items-center gap-1 text-sm"
                      >
                        Visit <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      {/* All resources */}
      <div className="mt-8">
        <h2 className="text-xl font-light flex items-center gap-2 mb-4">
          <Lightbulb className="text-[#f0bfdc]" size={20} />
          {selectedCategory === 'all' ? 'All Resources' : categories.find(c => c.id === selectedCategory)?.name}
          {searchTerm && ` matching "${searchTerm}"`}
        </h2>
        <Separator className="my-4 bg-black/10" />
        
        {filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map(resource => (
              <Card 
                key={resource.id} 
                className="overflow-hidden transition-all bg-[#eee7da] border-none rounded-xl shadow-sm hover:shadow-md"
              >
                <div className="h-28 bg-white/50 flex items-center justify-center p-6">
                  <img 
                    src={resource.imageUrl} 
                    alt={resource.name} 
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-medium">{resource.name}</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "text-gray-400 hover:text-[#f0bfdc]", 
                        favorites.includes(resource.id) && "text-[#f0bfdc]"
                      )}
                      onClick={() => toggleFavorite(resource.id)}
                    >
                      <Bookmark size={18} fill={favorites.includes(resource.id) ? "#f0bfdc" : "none"} />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {resource.description}
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex flex-wrap gap-1">
                      {resource.categories.map(cat => (
                        <span 
                          key={cat} 
                          className="text-xs bg-white px-2 py-1 rounded-full text-black/60"
                        >
                          {categories.find(c => c.id === cat)?.name}
                        </span>
                      ))}
                    </div>
                    <a 
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#f0bfdc] hover:text-[#f0bfdc]/80 flex items-center gap-1 text-sm"
                    >
                      Visit <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white/50 rounded-xl p-8 text-center">
            <Lightbulb className="mx-auto text-[#f0bfdc] mb-4" size={40} />
            <h3 className="text-xl font-medium mb-2">No resources found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter to find what you're looking for.
            </p>
            <Button 
              className="mt-4 bg-black text-white hover:bg-black/80 rounded-full px-6"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
            >
              Reset filters
            </Button>
          </div>
        )}
      </div>

      {/* Study tips */}
      {selectedCategory === 'all' && searchTerm === '' && (
        <div className="mt-10">
          <h2 className="text-xl font-light flex items-center gap-2 mb-4">
            <Award className="text-[#f0bfdc]" size={20} />
            Study Tips
          </h2>
          <Separator className="my-4 bg-black/10" />
          
          <Card className="bg-[#eee7da] border-none rounded-xl shadow-sm hover:shadow-md transition-all p-6">
            <ul className="space-y-4">
              <li className="flex gap-2">
                <div className="bg-[#f0bfdc]/20 rounded-full p-2 h-8 w-8 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#f0bfdc] font-medium">1</span>
                </div>
                <div>
                  <h3 className="font-medium">Use spaced repetition</h3>
                  <p className="text-sm text-muted-foreground">
                    Review information at increasing intervals for better long-term retention.
                  </p>
                </div>
              </li>
              <li className="flex gap-2">
                <div className="bg-[#f0bfdc]/20 rounded-full p-2 h-8 w-8 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#f0bfdc] font-medium">2</span>
                </div>
                <div>
                  <h3 className="font-medium">Teach what you learn</h3>
                  <p className="text-sm text-muted-foreground">
                    Teaching a concept to someone else helps solidify your understanding.
                  </p>
                </div>
              </li>
              <li className="flex gap-2">
                <div className="bg-[#f0bfdc]/20 rounded-full p-2 h-8 w-8 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#f0bfdc] font-medium">3</span>
                </div>
                <div>
                  <h3 className="font-medium">Take frequent breaks</h3>
                  <p className="text-sm text-muted-foreground">
                    Use techniques like Pomodoro (25 min work, 5 min break) to maintain focus and productivity.
                  </p>
                </div>
              </li>
              <li className="flex gap-2">
                <div className="bg-[#f0bfdc]/20 rounded-full p-2 h-8 w-8 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#f0bfdc] font-medium">4</span>
                </div>
                <div>
                  <h3 className="font-medium">Practice active recall</h3>
                  <p className="text-sm text-muted-foreground">
                    Test yourself on material instead of just reviewing notes for better memory retention.
                  </p>
                </div>
              </li>
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Materials; 