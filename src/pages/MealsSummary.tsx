import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Trash2, Utensils, Plus, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AddEntryDrawer } from '@/components/AddEntryDrawer';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import type { Meal } from '@/hooks/useTrackerData';

export default function MealsSummary() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const fetchMeals = async () => {
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_at', today.toISOString())
      .lt('logged_at', tomorrow.toISOString())
      .order('logged_at', { ascending: false });

    if (!error && data) {
      setMeals(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMeals();
  }, [user]);

  const deleteMeal = async (mealId: string) => {
    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', mealId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete meal.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Meal deleted",
        description: "Meal has been removed from your log.",
      });
      fetchMeals();
    }
  };

  const getTotals = () => {
    return meals.reduce((totals, meal) => ({
      calories: totals.calories + meal.calories,
      protein: totals.protein + (meal.protein || 0),
      carbs: totals.carbs + (meal.carbs || 0),
      fat: totals.fat + (meal.fat || 0),
      fiber: totals.fiber + (meal.fiber || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  };

  const totals = getTotals();

  

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading meals...</p>
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
              <div className="p-2 rounded-full bg-wellness-nutrition">
                <Utensils className="h-5 w-5 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold">Today's Meals</h1>
            </div>
          </div>
          {/* Removed header add button */}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left column: consolidated metrics */}
          <section aria-labelledby="meals-metrics">
            <h2 id="meals-metrics" className="sr-only">Today's Meal Metrics</h2>
            <Card className="shadow-card">
              <CardContent className="p-6">
                <div>
                  <p className="text-sm text-muted-foreground">Calories</p>
                  <p className="mt-1 text-3xl font-bold text-primary">{Math.round(totals.calories)}</p>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Protein</p>
                    <p className="text-xl font-semibold">{Math.round(totals.protein)}g</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Carbs</p>
                    <p className="text-xl font-semibold">{Math.round(totals.carbs)}g</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Fat</p>
                    <p className="text-xl font-semibold">{Math.round(totals.fat)}g</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Fiber</p>
                    <p className="text-xl font-semibold">{Math.round(totals.fiber)}g</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Right column: simplified meals list */}
          <section aria-labelledby="meals-list" className="space-y-4">
            <h2 id="meals-list" className="sr-only">Logged Meals</h2>
            {meals.length === 0 ? (
              <Card className="shadow-card">
                <CardContent className="p-8 text-center">
                  <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No meals logged today</h3>
                  <p className="text-muted-foreground mb-4">Start tracking your nutrition by adding your first meal.</p>
                  <Button onClick={() => setDrawerOpen(true)}>Add Meal</Button>
                </CardContent>
              </Card>
            ) : (
              meals.map((meal) => (
                <Card key={meal.id} className="shadow-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{meal.name}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-semibold">{meal.calories} kcal</p>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="More actions">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setDrawerOpen(true)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => deleteMeal(meal.id)}>Delete</DropdownMenuItem>
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
      <Button onClick={() => setDrawerOpen(true)} aria-label="Add meal" size="icon" className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg">
        <Plus className="h-6 w-6" />
      </Button>

      {/* Shared drawer */}
      <AddEntryDrawer open={drawerOpen} onOpenChange={setDrawerOpen} onAnyAdded={fetchMeals} startMode="meal" />
    </div>
  );
}