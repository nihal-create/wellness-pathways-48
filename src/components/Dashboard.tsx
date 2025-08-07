import { TrackerCard } from "./TrackerCard";
import { WelcomeHeader } from "./WelcomeHeader";
import { 
  Utensils, 
  Dumbbell, 
  Brain, 
  Droplets 
} from "lucide-react";

export function Dashboard() {
  // Mock data - in real app this would come from your state/API
  const trackers = [
    {
      title: "Indian Meals",
      current: 1850,
      goal: 2200,
      unit: "cal",
      icon: <Utensils className="h-6 w-6 text-orange-600" />,
      color: 'nutrition' as const
    },
    {
      title: "Workouts",
      current: 320,
      goal: 500,
      unit: "cal burned",
      icon: <Dumbbell className="h-6 w-6 text-pink-600" />,
      color: 'fitness' as const
    },
    {
      title: "Meditation",
      current: 15,
      goal: 20,
      unit: "minutes",
      icon: <Brain className="h-6 w-6 text-purple-600" />,
      color: 'meditation' as const
    },
    {
      title: "Water Intake",
      current: 6,
      goal: 8,
      unit: "glasses",
      icon: <Droplets className="h-6 w-6 text-blue-600" />,
      color: 'water' as const
    }
  ];

  return (
    <div className="min-h-screen bg-background p-4 animate-fade-in">
      <div className="max-w-lg mx-auto">
        <WelcomeHeader />
        
        <div className="grid grid-cols-2 gap-4">
          {trackers.map((tracker, index) => (
            <TrackerCard
              key={tracker.title}
              {...tracker}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
            />
          ))}
        </div>
        
        <div className="mt-8 p-4 bg-gradient-secondary rounded-2xl shadow-card">
          <h3 className="font-semibold text-foreground mb-2">Today's Insight</h3>
          <p className="text-sm text-muted-foreground">
            You're doing great! You're 78% towards your daily goals. 
            Consider having a healthy snack and staying hydrated. 🌟
          </p>
        </div>
      </div>
    </div>
  );
}