import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Meal {
  id: string;
  user_id: string;
  name: string;
  calories: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber: number | null;
  meal_type: string | null;
  logged_at: string;
  created_at: string;
  updated_at: string;
}

export interface Workout {
  id: string;
  user_id: string;
  name: string;
  type: string;
  duration_minutes: number;
  calories_burned: number;
  notes: string | null;
  logged_at: string;
  created_at: string;
  updated_at: string;
}

export interface MeditationSession {
  id: string;
  user_id: string;
  duration_minutes: number;
  type: string | null;
  notes: string | null;
  logged_at: string;
  created_at: string;
}

export interface WaterIntake {
  id: string;
  user_id: string;
  glasses: number;
  logged_at: string;
  created_at: string;
}

export function useTrackerData() {
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [meditations, setMeditations] = useState<MeditationSession[]>([]);
  const [waterIntakes, setWaterIntakes] = useState<WaterIntake[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodayData = async () => {
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStr = today.toISOString();
    const tomorrowStr = tomorrow.toISOString();

    // Fetch today's data
    const [mealsRes, workoutsRes, meditationsRes, waterRes] = await Promise.all([
      supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', todayStr)
        .lt('logged_at', tomorrowStr)
        .order('logged_at', { ascending: false }),
      
      supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', todayStr)
        .lt('logged_at', tomorrowStr)
        .order('logged_at', { ascending: false }),
      
      supabase
        .from('meditation_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', todayStr)
        .lt('logged_at', tomorrowStr)
        .order('logged_at', { ascending: false }),
      
      supabase
        .from('water_intake')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', todayStr)
        .lt('logged_at', tomorrowStr)
        .order('logged_at', { ascending: false })
    ]);

    if (mealsRes.data) setMeals(mealsRes.data);
    if (workoutsRes.data) setWorkouts(workoutsRes.data);
    if (meditationsRes.data) setMeditations(meditationsRes.data);
    if (waterRes.data) setWaterIntakes(waterRes.data);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchTodayData();
  }, [user]);

  const getTodayTotals = () => {
    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalCaloriesBurned = workouts.reduce((sum, workout) => sum + workout.calories_burned, 0);
    const totalMeditationMinutes = meditations.reduce((sum, session) => sum + session.duration_minutes, 0);
    const totalWaterGlasses = waterIntakes.reduce((sum, intake) => sum + intake.glasses, 0);

    return {
      calories: totalCalories,
      caloriesBurned: totalCaloriesBurned,
      meditationMinutes: totalMeditationMinutes,
      waterGlasses: totalWaterGlasses
    };
  };

  return {
    meals,
    workouts,
    meditations,
    waterIntakes,
    loading,
    refetch: fetchTodayData,
    getTodayTotals
  };
}