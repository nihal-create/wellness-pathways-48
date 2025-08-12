import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trash2, Dumbbell, Clock, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AddWorkoutDialog } from '@/components/AddWorkoutDialog';
import type { Workout } from '@/hooks/useTrackerData';

export default function WorkoutsSummary() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkouts = async () => {
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_at', today.toISOString())
      .lt('logged_at', tomorrow.toISOString())
      .order('logged_at', { ascending: false });

    if (!error && data) {
      setWorkouts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWorkouts();
  }, [user]);

  const deleteWorkout = async (workoutId: string) => {
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', workoutId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete workout.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Workout deleted",
        description: "Workout has been removed from your log.",
      });
      fetchWorkouts();
    }
  };

  const getTotals = () => {
    return workouts.reduce((totals, workout) => ({
      totalMinutes: totals.totalMinutes + workout.duration_minutes,
      totalCalories: totals.totalCalories + workout.calories_burned,
      workoutCount: totals.workoutCount + 1
    }), { totalMinutes: 0, totalCalories: 0, workoutCount: 0 });
  };

  const totals = getTotals();

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getWorkoutTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'cardio': 'bg-red-100 text-red-800 border-red-200',
      'strength': 'bg-blue-100 text-blue-800 border-blue-200',
      'yoga': 'bg-purple-100 text-purple-800 border-purple-200',
      'pilates': 'bg-pink-100 text-pink-800 border-pink-200',
      'swimming': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'cycling': 'bg-green-100 text-green-800 border-green-200',
      'running': 'bg-orange-100 text-orange-800 border-orange-200',
      'walking': 'bg-teal-100 text-teal-800 border-teal-200',
      'sports': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'other': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[type] || colors['other'];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading workouts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-full bg-wellness-fitness">
                <Dumbbell className="h-5 w-5 text-pink-600" />
              </div>
              <h1 className="text-2xl font-bold">Today's Workouts</h1>
            </div>
          </div>
          <AddWorkoutDialog onWorkoutAdded={fetchWorkouts} />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left column: Summary metrics (stacked) */}
          <section aria-labelledby="workouts-metrics" className="space-y-4">
            <h2 id="workouts-metrics" className="sr-only">Today's Workout Metrics</h2>
            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center mb-1">
                  <Dumbbell className="h-5 w-5 text-primary mr-2" />
                  <p className="text-2xl font-bold text-primary">{totals.workoutCount}</p>
                </div>
                <p className="text-sm text-muted-foreground">Workouts Completed</p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center mb-1">
                  <Clock className="h-5 w-5 text-blue-600 mr-2" />
                  <p className="text-2xl font-bold text-blue-600">{totals.totalMinutes}</p>
                </div>
                <p className="text-sm text-muted-foreground">Minutes Active</p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center mb-1">
                  <Flame className="h-5 w-5 text-orange-600 mr-2" />
                  <p className="text-2xl font-bold text-orange-600">{Math.round(totals.totalCalories)}</p>
                </div>
                <p className="text-sm text-muted-foreground">Calories Burned</p>
              </CardContent>
            </Card>
          </section>

          {/* Right column: Workouts list (stacked) */}
          <section aria-labelledby="workouts-list" className="space-y-4">
            <h2 id="workouts-list" className="sr-only">Logged Workouts</h2>
            {workouts.length === 0 ? (
              <Card className="shadow-card">
                <CardContent className="p-8 text-center">
                  <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No workouts logged today</h3>
                  <p className="text-muted-foreground mb-4">Start your fitness journey by logging your first workout.</p>
                  <AddWorkoutDialog onWorkoutAdded={fetchWorkouts} />
                </CardContent>
              </Card>
            ) : (
              workouts.map((workout) => (
                <Card key={workout.id} className="shadow-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CardTitle className="text-lg">{workout.name}</CardTitle>
                        <Badge variant="outline" className={getWorkoutTypeColor(workout.type)}>
                          {workout.type}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {formatTime(workout.logged_at)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteWorkout(workout.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                        <div>
                          <p className="font-semibold">{workout.duration_minutes} minutes</p>
                          <p className="text-muted-foreground">Duration</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Flame className="h-4 w-4 text-muted-foreground mr-2" />
                        <div>
                          <p className="font-semibold">{workout.calories_burned} cal</p>
                          <p className="text-muted-foreground">Calories Burned</p>
                        </div>
                      </div>
                    </div>
                    {workout.notes && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground italic">"{workout.notes}"</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </section>
        </div>
      </div>
    </div>
  );
}