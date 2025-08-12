import { TrackerCard } from "./TrackerCard";
import { WelcomeHeader } from "./WelcomeHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useTrackerData } from "@/hooks/useTrackerData";
import { 
  Utensils, 
  Dumbbell, 
  Brain, 
  Droplets,
  LogOut,
  BarChart3,
  Settings
} from "lucide-react";
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { getTodayTotals, refetch } = useTrackerData();
  const navigate = useNavigate();
  
  const totals = getTodayTotals();

  const handleSignOut = async () => {
    await signOut();
  };

  const trackers = [
    {
      title: "Meals",
      current: totals.calories,
      goal: profile?.daily_calorie_goal || 2000,
      unit: "cal",
      icon: <Utensils className="h-6 w-6 text-orange-600" />,
      color: 'nutrition' as const,
      summaryPath: '/meals'
    },
    {
      title: "Workouts",
      current: totals.caloriesBurned,
      goal: 500,
      unit: "cal burned",
      icon: <Dumbbell className="h-6 w-6" />,
      color: 'fitness' as const,
      summaryPath: '/workouts'
    },
    {
      title: "Meditation",
      current: totals.meditationMinutes,
      goal: profile?.daily_meditation_goal || 20,
      unit: "minutes",
      icon: <Brain className="h-6 w-6" />,
      color: 'meditation' as const
    },
    {
      title: "Water Intake",
      current: totals.waterGlasses,
      goal: profile?.daily_water_goal || 8,
      unit: "glasses",
      icon: <Droplets className="h-6 w-6" />,
      color: 'water' as const
    }
  ];

  const calculateProgress = () => {
    const totalProgress = trackers.reduce((sum, tracker) => {
      return sum + Math.min((tracker.current / tracker.goal) * 100, 100);
    }, 0);
    return Math.round(totalProgress / trackers.length);
  };

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-background px-3 py-4 md:px-6 md:py-8 animate-fade-in">
      <div className="max-w-sm md:max-w-7xl mx-auto">
        {/* Header - mobile optimized */}
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <WelcomeHeader profile={profile} />
          <div className="hidden md:flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/profile')}
              className="shadow-soft"
            >
              <Settings className="h-4 w-4 mr-2" />
              Profile
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {trackers.map((tracker, index) => (
            <TrackerCard
              key={tracker.title}
              {...tracker}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
            />
          ))}
        </div>
        
        <div className="mt-6 md:mt-8 p-4 md:p-6 bg-gradient-secondary rounded-xl md:rounded-2xl shadow-card">
          <h3 className="font-semibold text-foreground mb-2 text-sm md:text-base">Today's Progress</h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            You're {progress}% towards your daily goals. 
            {progress > 80 ? "Amazing work! Keep it up! 🌟" : progress > 50 ? "You're doing great! Stay consistent. 💪" : "Great start! Every step counts. 🚀"}
          </p>
        </div>
      </div>
    </div>
  );
}