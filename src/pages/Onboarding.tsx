import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    display_name: '',
    age: '',
    height: '',
    weight: '',
    gender: '',
    activity_level: '',
    goal: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const checkProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user.id)
        .single();

      if (data && data.display_name) {
        navigate('/');
      }
    };

    checkProfile();
  }, [user, navigate]);

  const calculateBMR = (weight: number, height: number, age: number, gender: string) => {
    if (gender === 'male') {
      return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
    }
    return 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
  };

  const calculateTDEE = (bmr: number, activityLevel: string) => {
    const multipliers: Record<string, number> = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9,
    };
    return bmr * (multipliers[activityLevel] || 1.2);
  };

  const calculateBMI = (weight: number, height: number) => {
    const h = height / 100;
    return weight / (h * h);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const age = parseInt(form.age);
    const height = parseFloat(form.height);
    const weight = parseFloat(form.weight);
    if (!form.display_name || !age || !height || !weight || !form.gender || !form.activity_level || !form.goal) {
      toast({ title: 'Missing info', description: 'Please fill all fields to continue.', variant: 'destructive' });
      return;
    }

    setLoading(true);

    const bmr = calculateBMR(weight, height, age, form.gender);
    const tdee = calculateTDEE(bmr, form.activity_level);
    const bmi = calculateBMI(weight, height);

    let dailyCalorieGoal = Math.round(tdee);
    if (form.goal === 'lose') dailyCalorieGoal -= 500;
    if (form.goal === 'gain') dailyCalorieGoal += 300;

    const { error } = await supabase
      .from('profiles')
      .upsert(
        {
          user_id: user.id,
          display_name: form.display_name,
          age,
          height,
          weight,
          gender: form.gender,
          activity_level: form.activity_level,
          goal: form.goal,
          bmr: Math.round(bmr),
          tdee: Math.round(tdee),
          bmi: Math.round(bmi * 10) / 10,
          daily_calorie_goal: dailyCalorieGoal,
          daily_water_goal: 8,
          daily_meditation_goal: 20,
        },
        { onConflict: 'user_id' }
      );

    setLoading(false);

    if (error) {
      toast({ title: 'Error', description: 'Failed to save profile. Please try again.', variant: 'destructive' });
      return;
    }

    toast({ title: 'Welcome!', description: 'Your profile has been created successfully.' });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-3 py-4 md:px-6 md:py-8">
      <div className="w-full max-w-md">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Create your profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name</Label>
                <Input id="display_name" value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="Your name" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="25" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input id="height" type="number" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} placeholder="170" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input id="weight" type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="70" />
              </div>

              <div className="space-y-2">
                <Label>Activity Level</Label>
                <Select value={form.activity_level} onValueChange={(v) => setForm({ ...form, activity_level: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                    <SelectItem value="lightly_active">Lightly Active (1-3 days/week)</SelectItem>
                    <SelectItem value="moderately_active">Moderately Active (3-5 days/week)</SelectItem>
                    <SelectItem value="very_active">Very Active (6-7 days/week)</SelectItem>
                    <SelectItem value="extremely_active">Extremely Active (physical job)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Primary Goal</Label>
                <Select value={form.goal} onValueChange={(v) => setForm({ ...form, goal: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lose">Lose Weight</SelectItem>
                    <SelectItem value="maintain">Maintain Weight</SelectItem>
                    <SelectItem value="gain">Gain Weight</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                  {loading ? 'Creating...' : 'Complete'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
