import { Card, CardContent } from "@/components/ui/card";
import { Users, BookOpen, Award, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import DatabaseService from "@/services/databaseService";
import { formatDecimal, formatPercentage } from "@/utils/format";

export const StatsSection = () => {
  const [platformStats, setPlatformStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const result = await DatabaseService.getPlatformStats();
      if (result.data) {
        setPlatformStats(result.data);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    {
      icon: Users,
      value: platformStats ? `${formatDecimal(platformStats.totalActiveUsers / 1000)}K+` : "4.70K+",
      label: "Active Learners",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: BookOpen,
      value: platformStats ? platformStats.totalCourses.toString() : "156",
      label: "Expert Courses",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: Award,
      value: platformStats ? `${formatDecimal(platformStats.totalStudents * 0.5 / 1000)}K+` : "2.30K+",
      label: "Certificates Issued",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: TrendingUp,
      value: platformStats ? formatPercentage(platformStats.completionRate) : "87.00%",
      label: "Success Rate",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Trusted by Thousands of Learners
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join our growing community of learners and creators making an impact worldwide
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};