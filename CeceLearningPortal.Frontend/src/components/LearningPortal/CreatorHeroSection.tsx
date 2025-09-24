import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPHP } from "@/utils/currency";
import { 
  BookOpen, 
  Users, 
  Trophy, 
  TrendingUp,
  Plus,
  Target,
  Rocket
} from "lucide-react";
import heroImage from "@/assets/hero-learning.jpg";

interface CreatorHeroSectionProps {
  onCreateCourse: () => void;
  stats: {
    totalCourses: number;
    totalStudents: number;
    totalEarnings: number;
    avgRating: number;
  };
  userName?: string;
}

export const CreatorHeroSection = ({ onCreateCourse, stats, userName }: CreatorHeroSectionProps) => {
  const isNewCreator = stats.totalCourses === 0;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-gradient-hero overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/80 to-learning-blue/90" />
      
      {/* Content */}
      <div className="relative z-10 min-h-[calc(100vh-4rem)] flex items-center px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full">
            {/* Left Content */}
            <div className="text-white space-y-4 lg:space-y-6 text-center lg:text-left">
              <div className="space-y-3">
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 inline-block">
                  🚀 Creator Studio
                </Badge>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Welcome back,
                {userName && <span className="text-learning-warning block">{userName}!</span>}
                <span className="bg-gradient-to-r from-white to-primary-glow bg-clip-text text-transparent block">
                  {isNewCreator ? 'Start Your Journey' : 'Continue Creating'}
                </span>
              </h1>
                <p className="text-lg sm:text-xl text-white/90 leading-relaxed max-w-lg mx-auto lg:mx-0">
                  Unlock your potential with CECE - Comprehensive eLearning & Content Ecosystem. Track progress, 
                  earn certificates, and connect with a community of learners.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button variant="hero" size="xl" className="group w-full sm:w-auto" onClick={onCreateCourse}>
                  {isNewCreator ? 'Create First Course' : 'Create New Course'}
                  <Plus className="group-hover:rotate-12 transition-transform" />
                </Button>
                <Button variant="outline" size="xl" className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                  View Analytics
                </Button>
              </div>
            </div>

            {/* Right Content - Feature Cards */}
            <div className="grid gap-4 sm:gap-6 mt-8 lg:mt-0">
            <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-primary rounded-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Community Learning</h3>
                  <p className="text-white/80">Connect with peers and mentors</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-primary rounded-lg">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Earn Certificates</h3>
                  <p className="text-white/80">Get recognized for your achievements</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-primary rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Track Progress</h3>
                  <p className="text-white/80">Monitor your learning journey</p>
                </div>
              </div>
            </Card>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};