import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

interface AddWorkoutDialogProps {
  onWorkoutAdded: () => void;
}

export function AddWorkoutDialog({ onWorkoutAdded }: AddWorkoutDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [workoutData, setWorkoutData] = useState({
    name: '',
    type: '',
    duration_minutes: '',
    calories_burned: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    const { error } = await supabase
      .from('workouts')
      .insert({
        user_id: user.id,
        name: workoutData.name,
        type: workoutData.type,
        duration_minutes: parseInt(workoutData.duration_minutes),
        calories_burned: parseFloat(workoutData.calories_burned),
        notes: workoutData.notes || null,
        logged_at: new Date().toISOString()
      });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add workout. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Workout logged!",
        description: `${workoutData.name} has been added.`,
      });
      setWorkoutData({
        name: '',
        type: '',
        duration_minutes: '',
        calories_burned: '',
        notes: ''
      });
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log New Workout</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workout-name">Workout Name *</Label>
            <Input
              id="workout-name"
              value={workoutData.name}
              onChange={(e) => setWorkoutData({ ...workoutData, name: e.target.value })}
              placeholder="e.g., Morning Jog"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="workout-type">Type *</Label>
            <Select value={workoutData.type} onValueChange={(value) => setWorkoutData({ ...workoutData, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select workout type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cardio">Cardio</SelectItem>
                <SelectItem value="strength">Strength Training</SelectItem>
                <SelectItem value="yoga">Yoga</SelectItem>
                <SelectItem value="pilates">Pilates</SelectItem>
                <SelectItem value="swimming">Swimming</SelectItem>
                <SelectItem value="cycling">Cycling</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="walking">Walking</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <Label htmlFor="calories-burned">Calories Burned *</Label>
              <Input
                id="calories-burned"
                type="number"
                value={workoutData.calories_burned}
                onChange={(e) => setWorkoutData({ ...workoutData, calories_burned: e.target.value })}
                placeholder="300"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={workoutData.notes}
              onChange={(e) => setWorkoutData({ ...workoutData, notes: e.target.value })}
              placeholder="How did it feel? Any achievements?"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Logging..." : "Log Workout"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}