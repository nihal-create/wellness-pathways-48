import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface ProfileData {
  display_name: string;
  age: number | null;
  height: number | null;
  weight: number | null;
  gender: string;
  activity_level: string;
  goal: string;
}

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    display_name: '',
    age: null,
    height: null,
    weight: null,
    gender: '',
    activity_level: '',
    goal: ''
  });

  const totalSteps = 4;

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Check if user already has a profile
    const checkProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
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
      return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
  };

  const calculateTDEE = (bmr: number, activityLevel: string) => {
    const multipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9
    };
    return bmr * multipliers[activityLevel as keyof typeof multipliers];
  };

  const calculateBMI = (weight: number, height: number) => {
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user || !profileData.age || !profileData.height || !profileData.weight) return;
    
    setLoading(true);
    
    const bmr = calculateBMR(profileData.weight, profileData.height, profileData.age, profileData.gender);
    const tdee = calculateTDEE(bmr, profileData.activity_level);
    const bmi = calculateBMI(profileData.weight, profileData.height);
    
    // Set calorie goal based on goal
    let dailyCalorieGoal = Math.round(tdee);
    if (profileData.goal === 'lose') {
      dailyCalorieGoal -= 500; // 500 calorie deficit
    } else if (profileData.goal === 'gain') {
      dailyCalorieGoal += 300; // 300 calorie surplus
    }

    const { error } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        display_name: profileData.display_name,
        age: profileData.age,
        height: profileData.height,
        weight: profileData.weight,
        gender: profileData.gender,
        activity_level: profileData.activity_level,
        goal: profileData.goal,
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        bmi: Math.round(bmi * 10) / 10,
        daily_calorie_goal: dailyCalorieGoal,
        daily_water_goal: 8,
        daily_meditation_goal: 20
      }, {
        onConflict: 'user_id'
      });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome!",
        description: "Your profile has been created successfully.",
      });
      navigate('/');
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return profileData.display_name.trim() !== '';
      case 2:
        return profileData.age && profileData.gender && profileData.height && profileData.weight;
      case 3:
        return profileData.activity_level !== '';
      case 4:
        return profileData.goal !== '';
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Welcome!</h2>
              <p className="text-muted-foreground">Let's start with your name</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={profileData.display_name}
                onChange={(e) => setProfileData({ ...profileData, display_name: e.target.value })}
                placeholder="Enter your name"
              />
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">About You</h2>
              <p className="text-muted-foreground">Tell us about your body measurements</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={profileData.age || ''}
                  onChange={(e) => setProfileData({ ...profileData, age: parseInt(e.target.value) || null })}
                  placeholder="25"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={profileData.gender} onValueChange={(value) => setProfileData({ ...profileData, gender: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={profileData.height || ''}
                  onChange={(e) => setProfileData({ ...profileData, height: parseInt(e.target.value) || null })}
                  placeholder="170"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={profileData.weight || ''}
                  onChange={(e) => setProfileData({ ...profileData, weight: parseInt(e.target.value) || null })}
                  placeholder="70"
                />
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Activity Level</h2>
              <p className="text-muted-foreground">How active are you?</p>
            </div>
            <div className="space-y-2">
              <Label>Activity Level</Label>
              <Select value={profileData.activity_level} onValueChange={(value) => setProfileData({ ...profileData, activity_level: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your activity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                  <SelectItem value="lightly_active">Lightly Active (light exercise 1-3 days/week)</SelectItem>
                  <SelectItem value="moderately_active">Moderately Active (moderate exercise 3-5 days/week)</SelectItem>
                  <SelectItem value="very_active">Very Active (hard exercise 6-7 days/week)</SelectItem>
                  <SelectItem value="extremely_active">Extremely Active (very hard exercise, physical job)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Your Goal</h2>
              <p className="text-muted-foreground">What would you like to achieve?</p>
            </div>
            <div className="space-y-2">
              <Label>Primary Goal</Label>
              <Select value={profileData.goal} onValueChange={(value) => setProfileData({ ...profileData, goal: value })}>
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
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-card">
          <CardHeader>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Step {step} of {totalSteps}</span>
                <span>{Math.round((step / totalSteps) * 100)}%</span>
              </div>
              <Progress value={(step / totalSteps) * 100} className="h-2" />
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {renderStep()}
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!isStepValid() || loading}
              >
                {step === totalSteps ? (loading ? "Creating..." : "Complete") : "Next"}
                {step < totalSteps && <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}