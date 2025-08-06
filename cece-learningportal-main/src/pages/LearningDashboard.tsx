import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LearningDashboardEnhanced } from '@/components/LearningPortal/LearningDashboardEnhanced';
import { useToast } from '@/hooks/use-toast';
import learningService from '@/services/learningService';
import { LearnerDashboard } from '@/types/learning';
import { Loader2 } from 'lucide-react';

const LearningDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<LearnerDashboard | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'Student') {
      toast({
        title: "Access Restricted",
        description: "The learning dashboard is only available for students.",
        variant: "destructive"
      });
      navigate('/');
      return;
    }

    fetchDashboardData();
  }, [user, navigate, toast]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const result = await learningService.getDashboard();
      if (result.error) {
        throw new Error(result.error);
      }
      if (result.data) {
        setDashboardData(result.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast({
        title: "Error",
        description: "Failed to load your learning dashboard. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivityComplete = async (activityId: string, completion: any) => {
    try {
      const result = await learningService.completeActivity(activityId, completion);
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (result.data?.success) {
        // Show completion notification
        toast({
          title: "Activity Completed!",
          description: `You earned ${result.data.pointsEarned} points!`
        });

        // Show unlocked achievements
        result.data.unlockedAchievements.forEach(achievement => {
          toast({
            title: "Achievement Unlocked!",
            description: `${achievement.icon} ${achievement.name} - ${achievement.points} points`
          });
        });

        // Refresh dashboard data
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error completing activity:', error);
      toast({
        title: "Error",
        description: "Failed to complete activity. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleGoalUpdate = async (goalId: string, updates: any) => {
    try {
      const result = await learningService.updateWeeklyGoal(goalId, updates);
      if (result.error) {
        throw new Error(result.error);
      }
      
      toast({
        title: "Goal Updated",
        description: "Your weekly goal has been updated successfully."
      });
      
      // Refresh dashboard data
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: "Error",
        description: "Failed to update goal. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your learning dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <LearningDashboardEnhanced 
      dashboardData={dashboardData}
      onActivityComplete={handleActivityComplete}
      onGoalUpdate={handleGoalUpdate}
      onRefresh={fetchDashboardData}
    />
  );
};

export default LearningDashboard;