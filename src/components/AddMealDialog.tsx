import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Plus, Search, X } from 'lucide-react';
import { indianFoods, foodCategories, IndianFood } from '@/data/indianFoods';

interface AddMealDialogProps {
  onMealAdded: () => void;
}

interface SelectedFood extends IndianFood {
  quantity: number;
}

export function AddMealDialog({ onMealAdded }: AddMealDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([]);
  const [mealType, setMealType] = useState('');

  const filteredFoods = indianFoods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addFood = (food: IndianFood) => {
    const existing = selectedFoods.find(f => f.id === food.id);
    if (existing) {
      setSelectedFoods(selectedFoods.map(f => 
        f.id === food.id ? { ...f, quantity: f.quantity + 1 } : f
      ));
    } else {
      setSelectedFoods([...selectedFoods, { ...food, quantity: 1 }]);
    }
  };

  const removeFood = (foodId: string) => {
    setSelectedFoods(selectedFoods.filter(f => f.id !== foodId));
  };

  const updateFoodQuantity = (foodId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFood(foodId);
      return;
    }
    setSelectedFoods(selectedFoods.map(f => 
      f.id === foodId ? { ...f, quantity } : f
    ));
  };

  const getTotalNutrition = () => {
    return selectedFoods.reduce((total, food) => ({
      calories: total.calories + (food.calories * food.quantity),
      protein: total.protein + (food.protein * food.quantity),
      carbs: total.carbs + (food.carbs * food.quantity),
      fat: total.fat + (food.fat * food.quantity),
      fiber: total.fiber + (food.fiber * food.quantity),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || selectedFoods.length === 0) return;

    setLoading(true);

    const totalNutrition = getTotalNutrition();
    const mealName = selectedFoods.map(f => `${f.name} (${f.quantity}x)`).join(', ');

    const { error } = await supabase
      .from('meals')
      .insert({
        user_id: user.id,
        name: mealName,
        calories: totalNutrition.calories,
        protein: totalNutrition.protein,
        carbs: totalNutrition.carbs,
        fat: totalNutrition.fat,
        fiber: totalNutrition.fiber,
        meal_type: mealType || null,
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
        description: `${selectedFoods.length} items logged successfully.`,
      });
      setSelectedFoods([]);
      setMealType('');
      setSearchQuery('');
      setSelectedCategory('All');
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
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add New Meal</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
          {/* Food Search & Selection */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="space-y-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search Indian dishes..."
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
                  {foodCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredFoods.map(food => (
                <Card key={food.id} className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => addFood(food)}>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{food.name}</h4>
                        <p className="text-xs text-muted-foreground">{food.standardQuantity}</p>
                        <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                          <span>{food.calories} cal</span>
                          <span>P: {food.protein}g</span>
                          <span>C: {food.carbs}g</span>
                          <span>F: {food.fat}g</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {food.category}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Selected Foods & Summary */}
          <div className="lg:w-80 flex flex-col">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Meal Type</Label>
                <Select value={mealType} onValueChange={setMealType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select meal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Selected Items ({selectedFoods.length})</Label>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                  {selectedFoods.map(food => (
                    <Card key={food.id} className="p-2">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{food.name}</p>
                          <p className="text-xs text-muted-foreground">{food.standardQuantity}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
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
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => removeFood(food.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {selectedFoods.length > 0 && (
                <Card className="p-3 bg-accent/20">
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
            </div>

            <div className="flex gap-2 mt-4">
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