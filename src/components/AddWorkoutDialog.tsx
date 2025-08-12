import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Plus, Search } from 'lucide-react';
import { workoutTypes } from '@/data/workouts';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';

interface AddWorkoutDialogProps {
  onWorkoutAdded: () => void;
}

export function AddWorkoutDialog({ onWorkoutAdded }: AddWorkoutDialogProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [workoutData, setWorkoutData] = useState({
    name: '',
    type: '',
    duration_minutes: ''
  });

  const filteredWorkouts = workoutTypes.filter(workout =>
    workout.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedWorkout = workoutTypes.find(w => w.name === workoutData.type);
  const estimatedCalories = selectedWorkout && workoutData.duration_minutes 
    ? Math.round(selectedWorkout.caloriesPerMinute * parseInt(workoutData.duration_minutes))
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedWorkout) return;

    setLoading(true);

    const { error } = await supabase
      .from('workouts')
      .insert({
        user_id: user.id,
        name: workoutData.name || selectedWorkout.name,
        type: workoutData.type,
        duration_minutes: parseInt(workoutData.duration_minutes),
        calories_burned: estimatedCalories,
        logged_at: new Date().toISOString()
      });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to log workout. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Workout logged!",
        description: `${workoutData.name || selectedWorkout.name} logged successfully.`,
      });
      setWorkoutData({
        name: '',
        type: '',
        duration_minutes: ''
      });
      setSearchQuery('');
      setOpen(false);
      onWorkoutAdded();
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm" className="shadow-soft h-7 md:h-8 text-xs md:text-sm px-2 md:px-3">
        <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
        <span className="hidden sm:inline">Add Workout</span>
        <span className="sm:hidden">Add</span>
      </Button>

      {isMobile ? (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="p-0">
            <DrawerHeader>
              <DrawerTitle>Log New Workout</DrawerTitle>
            </DrawerHeader>
            <div className="w-[95vw] max-w-2xl max-h-[85vh] flex flex-col p-4">
              <div className="flex flex-col gap-4 flex-1">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input placeholder="Search workouts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {searchQuery && filteredWorkouts.map(workout => (
                      <Card key={workout.id} className={`cursor-pointer transition-colors ${workoutData.type === workout.name ? 'ring-2 ring-primary bg-accent' : 'hover:bg-accent/50'}`} onClick={() => setWorkoutData({ ...workoutData, type: workout.name })}>
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{workout.name}</h4>
                              <p className="text-xs text-muted-foreground">{workout.caloriesPerMinute} cal/min</p>
                            </div>
                            <Badge variant="outline" className="text-xs">{workout.category}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {searchQuery && filteredWorkouts.length === 0 && (<p className="text-center text-muted-foreground py-4">No workouts found matching "{searchQuery}"</p>)}
                    {!searchQuery && (<p className="text-center text-muted-foreground py-4">Start typing to search for workouts...</p>)}
                  </div>
                </div>

                {workoutData.type && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="workout-name">Custom Name (optional)</Label>
                      <Input id="workout-name" value={workoutData.name} onChange={(e) => setWorkoutData({ ...workoutData, name: e.target.value })} placeholder="e.g., Morning Jog in Park" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes) *</Label>
                      <Input id="duration" type="number" value={workoutData.duration_minutes} onChange={(e) => setWorkoutData({ ...workoutData, duration_minutes: e.target.value })} placeholder="30" required />
                    </div>
                    {selectedWorkout && workoutData.duration_minutes && (
                      <Card className="p-3 bg-accent/20">
                        <h4 className="font-medium text-sm mb-2">Estimated Calories Burned</h4>
                        <p className="text-2xl font-bold text-primary">{estimatedCalories}</p>
                        <p className="text-xs text-muted-foreground">Based on {selectedWorkout.caloriesPerMinute} cal/min × {workoutData.duration_minutes} min</p>
                      </Card>
                    )}
                    <div className="flex justify-end">
                      <Button type="submit" disabled={loading || !workoutData.type || !workoutData.duration_minutes}>{loading ? "Logging..." : "Log Workout"}</Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="right" className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Log New Workout</SheetTitle>
            </SheetHeader>
            <div className="w-full max-w-2xl max-h-[85vh] flex flex-col p-4">
              <div className="flex flex-col gap-4 flex-1">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input placeholder="Search workouts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {searchQuery && filteredWorkouts.map(workout => (
                      <Card key={workout.id} className={`cursor-pointer transition-colors ${workoutData.type === workout.name ? 'ring-2 ring-primary bg-accent' : 'hover:bg-accent/50'}`} onClick={() => setWorkoutData({ ...workoutData, type: workout.name })}>
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{workout.name}</h4>
                              <p className="text-xs text-muted-foreground">{workout.caloriesPerMinute} cal/min</p>
                            </div>
                            <Badge variant="outline" className="text-xs">{workout.category}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {searchQuery && filteredWorkouts.length === 0 && (<p className="text-center text-muted-foreground py-4">No workouts found matching "{searchQuery}"</p>)}
                    {!searchQuery && (<p className="text-center text-muted-foreground py-4">Start typing to search for workouts...</p>)}
                  </div>
                </div>
                {workoutData.type && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="workout-name">Custom Name (optional)</Label>
                      <Input id="workout-name" value={workoutData.name} onChange={(e) => setWorkoutData({ ...workoutData, name: e.target.value })} placeholder="e.g., Morning Jog in Park" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes) *</Label>
                      <Input id="duration" type="number" value={workoutData.duration_minutes} onChange={(e) => setWorkoutData({ ...workoutData, duration_minutes: e.target.value })} placeholder="30" required />
                    </div>
                    {selectedWorkout && workoutData.duration_minutes && (
                      <Card className="p-3 bg-accent/20">
                        <h4 className="font-medium text-sm mb-2">Estimated Calories Burned</h4>
                        <p className="text-2xl font-bold text-primary">{estimatedCalories}</p>
                        <p className="text-xs text-muted-foreground">Based on {selectedWorkout.caloriesPerMinute} cal/min × {workoutData.duration_minutes} min</p>
                      </Card>
                    )}
                    <div className="flex justify-end">
                      <Button type="submit" disabled={loading || !workoutData.type || !workoutData.duration_minutes}>{loading ? "Logging..." : "Log Workout"}</Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}