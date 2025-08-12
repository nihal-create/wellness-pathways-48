import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Dumbbell, Plus, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AddEntryDrawer } from '@/components/AddEntryDrawer';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import type { Workout } from '@/hooks/useTrackerData';

export default function WorkoutsSummary() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
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
    <div className="bg-background p-4 overflow-x-hidden">
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
          {/* Removed header add button */}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left column: consolidated metrics */}
          <section aria-labelledby="workouts-metrics">
            <h2 id="workouts-metrics" className="sr-only">Today's Workout Metrics</h2>
            <Card className="shadow-card">
              <CardContent className="p-6">
                <div>
                  <p className="text-sm text-muted-foreground">Calories Burned</p>
                  <p className="mt-1 text-3xl font-bold text-primary">{Math.round(totals.totalCalories)}</p>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Workouts</p>
                    <p className="text-xl font-semibold">{totals.workoutCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Minutes</p>
                    <p className="text-xl font-semibold">{totals.totalMinutes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Right column: simplified workouts list */}
          <section aria-labelledby="workouts-list" className="space-y-4">
            <h2 id="workouts-list" className="sr-only">Logged Workouts</h2>
            {workouts.length === 0 ? (
              <Card className="w-full shadow-card">
                <CardContent className="p-8 text-center">
                  <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No workouts logged today</h3>
                  <p className="text-muted-foreground mb-4">Start your fitness journey by logging your first workout.</p>
                  <Button onClick={() => { setEditingWorkout(null); setDrawerOpen(true); }}>Add Workout</Button>
                </CardContent>
              </Card>
            ) : (
              workouts.map((workout) => (
                <Card key={workout.id} className="w-full shadow-card">
                  <CardContent className="p-4 overflow-hidden">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">
                          {workout.name}
                          <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">• {workout.duration_minutes} min</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <p className="text-sm font-semibold whitespace-nowrap">{workout.calories_burned} cal</p>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="More actions">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditingWorkout(workout); setDrawerOpen(true); }}>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => deleteWorkout(workout.id)}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </section>
        </div>
      </div>

      {/* Floating Action Button */}
      <Button onClick={() => { setEditingWorkout(null); setDrawerOpen(true); }} aria-label="Add workout" size="icon" className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50 h-14 w-14 rounded-full shadow-elevated">
        <Plus className="h-6 w-6" />
      </Button>

      {/* Shared drawer */}
      <AddEntryDrawer
        open={drawerOpen}
        onOpenChange={(o) => { if (!o) setEditingWorkout(null); setDrawerOpen(o); }}
        onAnyAdded={fetchWorkouts}
        startMode="workout"
        editWorkout={editingWorkout ?? undefined}
      />
    </div>
  );
}