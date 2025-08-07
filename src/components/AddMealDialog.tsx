import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Plus, Search, X } from 'lucide-react';
import { indianFoods } from '@/data/indianFoods';

interface AddMealDialogProps {
  onMealAdded: () => void;
}

interface SelectedFood {
  id: string;
  name: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export function AddMealDialog({ onMealAdded }: AddMealDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([]);

  const filteredFoods = indianFoods.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addFood = (food: typeof indianFoods[0]) => {
    const existingFood = selectedFoods.find(f => f.id === food.id);
    if (existingFood) {
      setSelectedFoods(prev => prev.map(f =>
        f.id === food.id ? { ...f, quantity: f.quantity + 1 } : f
      ));
    } else {
      setSelectedFoods(prev => [...prev, { ...food, quantity: 1 }]);
    }
  };

  const updateFoodQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFood(id);
      return;
    }
    setSelectedFoods(prev => prev.map(f =>
      f.id === id ? { ...f, quantity: newQuantity } : f
    ));
  };

  const removeFood = (id: string) => {
    setSelectedFoods(prev => prev.filter(f => f.id !== id));
  };

  const getTotalNutrition = () => {
    return selectedFoods.reduce((total, food) => ({
      calories: total.calories + (food.calories * food.quantity),
      protein: total.protein + (food.protein * food.quantity),
      carbs: total.carbs + (food.carbs * food.quantity),
      fat: total.fat + (food.fat * food.quantity),
      fiber: total.fiber + (food.fiber * food.quantity)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  };

  const handleSubmit = async () => {
    if (!user || selectedFoods.length === 0) return;

    setLoading(true);

    const totalNutrition = getTotalNutrition();

    const { error } = await supabase
      .from('meals')
      .insert({
        user_id: user.id,
        name: selectedFoods.map(f => `${f.name} (${f.quantity}x)`).join(', '),
        calories: Math.round(totalNutrition.calories),
        protein: Math.round(totalNutrition.protein),
        carbs: Math.round(totalNutrition.carbs),
        fat: Math.round(totalNutrition.fat),
        fiber: Math.round(totalNutrition.fiber),
        logged_at: new Date().toISOString()
      });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to log meal. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Meal logged!",
        description: `Added ${Math.round(totalNutrition.calories)} calories to your daily intake.`,
      });
      setSelectedFoods([]);
      setSearchQuery('');
      setOpen(false);
      onMealAdded();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="shadow-soft h-7 md:h-8 text-xs md:text-sm px-2 md:px-3">
          <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
          <span className="hidden sm:inline">Add Meal</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-4xl h-[90vh] md:h-[85vh] flex flex-col p-4 md:p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg md:text-xl">Log New Meal</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 flex-1 min-h-0">
          {/* Search Section */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search Indian foods..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Food Results */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {searchQuery && filteredFoods.map(food => (
                <Card 
                  key={food.id} 
                  className="cursor-pointer transition-colors hover:bg-accent/50" 
                  onClick={() => addFood(food)}
                >
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{food.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {food.calories} cal • {food.protein}g protein
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {food.standardQuantity}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {searchQuery && filteredFoods.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No foods found matching "{searchQuery}"
                </p>
              )}
              {!searchQuery && (
                <p className="text-center text-muted-foreground py-8">
                  Start typing to search for foods...
                </p>
              )}
            </div>
          </div>

          {/* Selected Foods Section */}
          <div className="lg:w-80 flex flex-col">
            <h3 className="font-medium mb-3 text-sm md:text-base">Selected Foods</h3>
            
            <div className="flex-1 space-y-2 mb-4">
              {selectedFoods.map(food => (
                <Card key={food.id} className="p-3">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-sm flex-1">{food.name}</h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => removeFood(food.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0"
                          onClick={() => updateFoodQuantity(food.id, food.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="text-sm w-8 text-center">{food.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0"
                          onClick={() => updateFoodQuantity(food.id, food.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {selectedFoods.length > 0 && (
              <Card className="p-3 bg-accent/20 mb-4">
                <h4 className="font-medium text-sm mb-2">Total Nutrition</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Calories:</span>
                    <span className="font-medium">{getTotalNutrition().calories.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Protein:</span>
                    <span className="font-medium">{getTotalNutrition().protein.toFixed(1)}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Carbs:</span>
                    <span className="font-medium">{getTotalNutrition().carbs.toFixed(1)}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fat:</span>
                    <span className="font-medium">{getTotalNutrition().fat.toFixed(1)}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fiber:</span>
                    <span className="font-medium">{getTotalNutrition().fiber.toFixed(1)}g</span>
                  </div>
                </div>
              </Card>
            )}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={loading || selectedFoods.length === 0}
                className="flex-1"
              >
                {loading ? "Adding..." : "Add Meal"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}