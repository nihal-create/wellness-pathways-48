import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from 'react-router-dom';
import { BarChart3, Plus } from 'lucide-react';

interface TrackerCardProps {
  title: string;
  current: number;
  goal: number;
  unit: string;
  icon: React.ReactNode;
  color: 'meditation' | 'water' | 'nutrition' | 'fitness';
  className?: string;
  style?: React.CSSProperties;
  addDialog?: React.ReactNode;
  summaryPath?: string;
}

export function TrackerCard({ 
  title, 
  current, 
  goal, 
  unit, 
  icon, 
  color,
  className,
  style,
  addDialog,
  summaryPath
}: TrackerCardProps) {
  const navigate = useNavigate();
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
        "p-3 md:p-4 shadow-card transition-gentle hover:shadow-elevated",
        colorClasses[color],
        className
      )}
      style={style}
    >
      <div className="flex items-start justify-between mb-2 md:mb-3">
        <div className="p-1.5 md:p-2 rounded-full bg-card/60 shadow-soft">
          {icon}
        </div>
        <div className="text-right">
          <p className="text-lg md:text-xl font-bold text-foreground">{current}</p>
          <p className="text-xs text-muted-foreground">/ {goal} {unit}</p>
        </div>
      </div>
      
      <h3 className="font-semibold text-foreground mb-2 md:mb-3 text-xs md:text-sm">{title}</h3>
      
      <div className="space-y-2 md:space-y-3">
        <Progress 
          value={percentage} 
          className="h-1.5 md:h-2 bg-card/60"
        />
        <p className="text-xs text-muted-foreground text-center">
          {percentage.toFixed(0)}% complete
        </p>
        
        {/* Action buttons */}
        <div className="flex items-center justify-between pt-1 md:pt-2">
          {addDialog}
          {summaryPath && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(summaryPath)}
              className="text-xs p-1 md:p-2 h-6 md:h-8"
            >
              <BarChart3 className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}