import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    age: '',
    height: '',
    weight: '',
    gender: '',
    activity_level: '',
    goal: '',
    daily_calorie_goal: '',
    daily_water_goal: '',
    daily_meditation_goal: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        age: profile.age?.toString() || '',
        height: profile.height?.toString() || '',
        weight: profile.weight?.toString() || '',
        gender: profile.gender || '',
        activity_level: profile.activity_level || '',
        goal: profile.goal || '',
        daily_calorie_goal: profile.daily_calorie_goal?.toString() || '',
        daily_water_goal: profile.daily_water_goal?.toString() || '8',
        daily_meditation_goal: profile.daily_meditation_goal?.toString() || '20'
      });
    }
  }, [profile]);

  const calculateMetrics = () => {
    const age = parseInt(formData.age);
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);
    const gender = formData.gender;
    const activityLevel = formData.activity_level;

    if (!age || !height || !weight || !gender || !activityLevel) {
      return { bmr: null, tdee: null, bmi: null, dailyCalorieGoal: null };
    }

    // Calculate BMI
    const heightInM = height / 100;
    const bmi = weight / (heightInM * heightInM);

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Calculate TDEE
    const activityMultipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extra_active: 1.9
    };
    const tdee = bmr * activityMultipliers[activityLevel as keyof typeof activityMultipliers];

    // Calculate daily calorie goal based on goal
    let dailyCalorieGoal = tdee;
    if (formData.goal === 'lose_weight') {
      dailyCalorieGoal = tdee - 500; // 500 calorie deficit
    } else if (formData.goal === 'gain_weight') {
      dailyCalorieGoal = tdee + 500; // 500 calorie surplus
    }

    return { bmr, tdee, bmi, dailyCalorieGoal };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    const { bmr, tdee, bmi, dailyCalorieGoal } = calculateMetrics();

    const updateData = {
      user_id: user.id,
      display_name: formData.display_name,
      age: formData.age ? parseInt(formData.age) : null,
      height: formData.height ? parseFloat(formData.height) : null,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      gender: formData.gender || null,
      activity_level: formData.activity_level || null,
      goal: formData.goal || null,
      bmr: bmr,
      tdee: tdee,
      bmi: bmi,
      daily_calorie_goal: formData.daily_calorie_goal ? parseInt(formData.daily_calorie_goal) : Math.round(dailyCalorieGoal || 2000),
      daily_water_goal: parseInt(formData.daily_water_goal),
      daily_meditation_goal: parseInt(formData.daily_meditation_goal)
    };

    const { error } = await supabase
      .from('profiles')
      .upsert(updateData, { onConflict: 'user_id' });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile updated!",
        description: "Your profile has been saved successfully.",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (profileLoading) {
    return (
      <div className="bg-background px-3 py-4 md:px-6 md:py-8 max-w-2xl mx-auto overflow-x-hidden">
        <div className="flex items-center gap-4 mb-4 md:mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-background px-3 py-4 md:px-6 md:py-8 max-w-2xl mx-auto overflow-x-hidden">
      <div className="flex items-center gap-4 mb-4 md:mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Profile</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="Your name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="25"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  placeholder="170"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="70"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Fitness Goals */}
        <Card>
          <CardHeader>
            <CardTitle>Fitness Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="activity_level">Activity Level</Label>
              <Select value={formData.activity_level} onValueChange={(value) => setFormData({ ...formData, activity_level: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
                  <SelectItem value="lightly_active">Lightly active (light exercise 1-3 days/week)</SelectItem>
                  <SelectItem value="moderately_active">Moderately active (moderate exercise 3-5 days/week)</SelectItem>
                  <SelectItem value="very_active">Very active (hard exercise 6-7 days/week)</SelectItem>
                  <SelectItem value="extra_active">Extra active (very hard exercise, physical job)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">Primary Goal</Label>
              <Select value={formData.goal} onValueChange={(value) => setFormData({ ...formData, goal: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your primary goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lose_weight">Lose Weight</SelectItem>
                  <SelectItem value="maintain_weight">Maintain Weight</SelectItem>
                  <SelectItem value="gain_weight">Gain Weight</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Daily Goals */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="daily_calorie_goal">Daily Calorie Goal</Label>
              <Input
                id="daily_calorie_goal"
                type="number"
                value={formData.daily_calorie_goal}
                onChange={(e) => setFormData({ ...formData, daily_calorie_goal: e.target.value })}
                placeholder="2000"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="daily_water_goal">Daily Water Goal (glasses)</Label>
                <Input
                  id="daily_water_goal"
                  type="number"
                  value={formData.daily_water_goal}
                  onChange={(e) => setFormData({ ...formData, daily_water_goal: e.target.value })}
                  placeholder="8"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="daily_meditation_goal">Daily Meditation Goal (minutes)</Label>
                <Input
                  id="daily_meditation_goal"
                  type="number"
                  value={formData.daily_meditation_goal}
                  onChange={(e) => setFormData({ ...formData, daily_meditation_goal: e.target.value })}
                  placeholder="20"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex flex-col md:flex-row gap-3">
          <Button type="submit" disabled={loading} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Saving..." : "Save Profile"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleSignOut}
            className="flex-1 md:flex-none"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </form>
    </div>
  );
}