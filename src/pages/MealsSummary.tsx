import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Pencil, Trash2, Utensils } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AddMealDialog } from '@/components/AddMealDialog';
import type { Meal } from '@/hooks/useTrackerData';

export default function MealsSummary() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getMealTypeColor = (type: string | null) => {
    switch (type) {
      case 'breakfast': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'lunch': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'dinner': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'snack': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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
          <AddMealDialog onMealAdded={fetchMeals} />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left column: Summary metrics (stacked) */}
          <section aria-labelledby="meals-metrics" className="space-y-4">
            <h2 id="meals-metrics" className="sr-only">Today's Meal Metrics</h2>
            <Card className="shadow-card">
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-primary">{Math.round(totals.calories)}</p>
                <p className="text-sm text-muted-foreground">Calories</p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-blue-600">{Math.round(totals.protein)}g</p>
                <p className="text-sm text-muted-foreground">Protein</p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-yellow-600">{Math.round(totals.carbs)}g</p>
                <p className="text-sm text-muted-foreground">Carbs</p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-red-600">{Math.round(totals.fat)}g</p>
                <p className="text-sm text-muted-foreground">Fat</p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-green-600">{Math.round(totals.fiber)}g</p>
                <p className="text-sm text-muted-foreground">Fiber</p>
              </CardContent>
            </Card>
          </section>

          {/* Right column: Meals list (stacked) */}
          <section aria-labelledby="meals-list" className="space-y-4">
            <h2 id="meals-list" className="sr-only">Logged Meals</h2>
            {meals.length === 0 ? (
              <Card className="shadow-card">
                <CardContent className="p-8 text-center">
                  <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No meals logged today</h3>
                  <p className="text-muted-foreground mb-4">Start tracking your nutrition by adding your first meal.</p>
                  <AddMealDialog onMealAdded={fetchMeals} />
                </CardContent>
              </Card>
            ) : (
              meals.map((meal) => (
                <Card key={meal.id} className="shadow-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CardTitle className="text-lg">{meal.name}</CardTitle>
                        {meal.meal_type && (
                          <Badge variant="outline" className={getMealTypeColor(meal.meal_type)}>
                            {meal.meal_type}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {formatTime(meal.logged_at)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMeal(meal.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="font-semibold">{meal.calories}</p>
                        <p className="text-muted-foreground">Calories</p>
                      </div>
                      {meal.protein !== null && (
                        <div>
                          <p className="font-semibold">{meal.protein}g</p>
                          <p className="text-muted-foreground">Protein</p>
                        </div>
                      )}
                      {meal.carbs !== null && (
                        <div>
                          <p className="font-semibold">{meal.carbs}g</p>
                          <p className="text-muted-foreground">Carbs</p>
                        </div>
                      )}
                      {meal.fat !== null && (
                        <div>
                          <p className="font-semibold">{meal.fat}g</p>
                          <p className="text-muted-foreground">Fat</p>
                        </div>
                      )}
                      {meal.fiber !== null && (
                        <div>
                          <p className="font-semibold">{meal.fiber}g</p>
                          <p className="text-muted-foreground">Fiber</p>
                        </div>
                      )}
                    </div>
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