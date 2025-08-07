import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface TrackerCardProps {
  title: string;
  current: number;
  goal: number;
  unit: string;
  icon: React.ReactNode;
  color: 'meditation' | 'water' | 'nutrition' | 'fitness';
  className?: string;
  style?: React.CSSProperties;
}

export function TrackerCard({ 
  title, 
  current, 
  goal, 
  unit, 
  icon, 
  color,
  className,
  style
}: TrackerCardProps) {
  const percentage = Math.min((current / goal) * 100, 100);

  const colorClasses = {
    meditation: 'bg-wellness-meditation border-purple-200',
    water: 'bg-wellness-water border-blue-200',
    nutrition: 'bg-wellness-nutrition border-green-200',
    fitness: 'bg-wellness-fitness border-pink-200'
  };

  return (
    <Card 
      className={cn(
        "p-6 shadow-card transition-gentle hover:shadow-elevated cursor-pointer",
        colorClasses[color],
        className
      )}
      style={style}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-full bg-card/60 shadow-soft">
          {icon}
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">{current}</p>
          <p className="text-sm text-muted-foreground">/ {goal} {unit}</p>
        </div>
      </div>
      
      <h3 className="font-semibold text-foreground mb-3">{title}</h3>
      
      <div className="space-y-2">
        <Progress 
          value={percentage} 
          className="h-2 bg-card/60"
        />
        <p className="text-xs text-muted-foreground text-center">
          {percentage.toFixed(0)}% complete
        </p>
      </div>
    </Card>
  );
}