import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

interface AddMealDialogProps {
  onMealAdded: () => void;
}

export function AddMealDialog({ onMealAdded }: AddMealDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mealData, setMealData] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    meal_type: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    const { error } = await supabase
      .from('meals')
      .insert({
        user_id: user.id,
        name: mealData.name,
        calories: parseFloat(mealData.calories),
        protein: mealData.protein ? parseFloat(mealData.protein) : null,
        carbs: mealData.carbs ? parseFloat(mealData.carbs) : null,
        fat: mealData.fat ? parseFloat(mealData.fat) : null,
        fiber: mealData.fiber ? parseFloat(mealData.fiber) : null,
        meal_type: mealData.meal_type || null,
        logged_at: new Date().toISOString()
      });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add meal. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Meal added!",
        description: `${mealData.name} has been logged.`,
      });
      setMealData({
        name: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        fiber: '',
        meal_type: ''
      });
      setOpen(false);
      onMealAdded();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="shadow-soft">
          <Plus className="h-4 w-4 mr-2" />
          Add Meal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Meal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meal-name">Meal Name *</Label>
            <Input
              id="meal-name"
              value={mealData.name}
              onChange={(e) => setMealData({ ...mealData, name: e.target.value })}
              placeholder="e.g., Grilled Chicken Salad"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calories">Calories *</Label>
              <Input
                id="calories"
                type="number"
                value={mealData.calories}
                onChange={(e) => setMealData({ ...mealData, calories: e.target.value })}
                placeholder="350"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meal-type">Meal Type</Label>
              <Select value={mealData.meal_type} onValueChange={(value) => setMealData({ ...mealData, meal_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="protein">Protein (g)</Label>
              <Input
                id="protein"
                type="number"
                step="0.1"
                value={mealData.protein}
                onChange={(e) => setMealData({ ...mealData, protein: e.target.value })}
                placeholder="25"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbs">Carbs (g)</Label>
              <Input
                id="carbs"
                type="number"
                step="0.1"
                value={mealData.carbs}
                onChange={(e) => setMealData({ ...mealData, carbs: e.target.value })}
                placeholder="30"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fat">Fat (g)</Label>
              <Input
                id="fat"
                type="number"
                step="0.1"
                value={mealData.fat}
                onChange={(e) => setMealData({ ...mealData, fat: e.target.value })}
                placeholder="15"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fiber">Fiber (g)</Label>
              <Input
                id="fiber"
                type="number"
                step="0.1"
                value={mealData.fiber}
                onChange={(e) => setMealData({ ...mealData, fiber: e.target.value })}
                placeholder="5"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Meal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}