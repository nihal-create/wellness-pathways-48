import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Plus, Search } from 'lucide-react';
import { workoutTypes, workoutCategories } from '@/data/workouts';

interface AddWorkoutDialogProps {
  onWorkoutAdded: () => void;
}

export function AddWorkoutDialog({ onWorkoutAdded }: AddWorkoutDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [workoutData, setWorkoutData] = useState({
    name: '',
    type: '',
    duration_minutes: '',
    notes: ''
  });

  const filteredWorkouts = workoutTypes.filter(workout => {
    const matchesSearch = workout.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || workout.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
        notes: workoutData.notes || null,
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
        duration_minutes: '',
        notes: ''
      });
      setSearchQuery('');
      setSelectedCategory('All');
      setOpen(false);
      onWorkoutAdded();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="shadow-soft">
          <Plus className="h-4 w-4 mr-2" />
          Add Workout
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Log New Workout</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
          {/* Workout Selection */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="space-y-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search workouts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {workoutCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredWorkouts.map(workout => (
                <Card 
                  key={workout.id} 
                  className={`cursor-pointer transition-colors ${
                    workoutData.type === workout.name ? 'ring-2 ring-primary bg-accent' : 'hover:bg-accent/50'
                  }`} 
                  onClick={() => setWorkoutData({ ...workoutData, type: workout.name })}
                >
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{workout.name}</h4>
                        <p className="text-xs text-muted-foreground">{workout.caloriesPerMinute} cal/min</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {workout.category}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Workout Details */}
          <div className="lg:w-80 flex flex-col">
            <form onSubmit={handleSubmit} className="space-y-4 flex-1">
              <div className="space-y-2">
                <Label htmlFor="workout-name">Custom Name (optional)</Label>
                <Input
                  id="workout-name"
                  value={workoutData.name}
                  onChange={(e) => setWorkoutData({ ...workoutData, name: e.target.value })}
                  placeholder="e.g., Morning Jog in Park"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={workoutData.duration_minutes}
                  onChange={(e) => setWorkoutData({ ...workoutData, duration_minutes: e.target.value })}
                  placeholder="30"
                  required
                />
              </div>

              {selectedWorkout && workoutData.duration_minutes && (
                <Card className="p-3 bg-accent/20">
                  <h4 className="font-medium text-sm mb-2">Estimated Calories Burned</h4>
                  <p className="text-2xl font-bold text-primary">{estimatedCalories}</p>
                  <p className="text-xs text-muted-foreground">
                    Based on {selectedWorkout.caloriesPerMinute} cal/min × {workoutData.duration_minutes} min
                  </p>
                </Card>
              )}


              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || !workoutData.type || !workoutData.duration_minutes}
                  className="flex-1"
                >
                  {loading ? "Logging..." : "Log Workout"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}