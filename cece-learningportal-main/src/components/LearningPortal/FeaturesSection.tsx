import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Zap, 
  Users, 
  Trophy, 
  Clock, 
  Shield, 
  Smartphone 
} from "lucide-react";

export const FeaturesSection = () => {
  const features = [
    {
      icon: Zap,
      title: "Interactive Learning",
      description: "Hands-on projects and real-world examples to accelerate your learning journey.",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      icon: Users,
      title: "Expert Creators",
      description: "Learn from industry professionals and experienced educators worldwide.",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: Trophy,
      title: "Verified Certificates",
      description: "Earn industry-recognized certificates to showcase your skills and achievements.",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: Clock,
      title: "Learn at Your Pace",
      description: "Flexible scheduling with lifetime access to course materials and updates.",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: Shield,
      title: "Quality Assured",
      description: "All courses are reviewed and approved by our quality assurance team.",
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      icon: Smartphone,
      title: "Mobile Learning",
      description: "Access your courses anywhere, anytime with our responsive platform.",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose CECE Learning?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover the features that make us the preferred choice for learners and creators worldwide
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${feature.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};