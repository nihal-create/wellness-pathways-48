export interface WorkoutType {
  id: string;
  name: string;
  category: string;
  caloriesPerMinute: number; // Average calories burned per minute
}

export const workoutTypes: WorkoutType[] = [
  // Cardio
  { id: "1", name: "Running (Moderate)", category: "Cardio", caloriesPerMinute: 10 },
  { id: "2", name: "Running (Fast)", category: "Cardio", caloriesPerMinute: 15 },
  { id: "3", name: "Jogging", category: "Cardio", caloriesPerMinute: 8 },
  { id: "4", name: "Walking (Brisk)", category: "Cardio", caloriesPerMinute: 4 },
  { id: "5", name: "Cycling (Moderate)", category: "Cardio", caloriesPerMinute: 8 },
  { id: "6", name: "Cycling (Vigorous)", category: "Cardio", caloriesPerMinute: 12 },
  { id: "7", name: "Swimming", category: "Cardio", caloriesPerMinute: 11 },
  { id: "8", name: "Jump Rope", category: "Cardio", caloriesPerMinute: 13 },
  { id: "9", name: "Dancing", category: "Cardio", caloriesPerMinute: 6 },
  { id: "10", name: "Aerobics", category: "Cardio", caloriesPerMinute: 7 },

  // Strength Training
  { id: "11", name: "Weight Training (General)", category: "Strength", caloriesPerMinute: 6 },
  { id: "12", name: "Push-ups", category: "Strength", caloriesPerMinute: 8 },
  { id: "13", name: "Pull-ups", category: "Strength", caloriesPerMinute: 9 },
  { id: "14", name: "Squats", category: "Strength", caloriesPerMinute: 7 },
  { id: "15", name: "Deadlifts", category: "Strength", caloriesPerMinute: 8 },
  { id: "16", name: "Bench Press", category: "Strength", caloriesPerMinute: 6 },
  { id: "17", name: "Bodyweight Training", category: "Strength", caloriesPerMinute: 5 },

  // Sports
  { id: "18", name: "Cricket", category: "Sports", caloriesPerMinute: 5 },
  { id: "19", name: "Football", category: "Sports", caloriesPerMinute: 9 },
  { id: "20", name: "Basketball", category: "Sports", caloriesPerMinute: 8 },
  { id: "21", name: "Tennis", category: "Sports", caloriesPerMinute: 7 },
  { id: "22", name: "Badminton", category: "Sports", caloriesPerMinute: 6 },
  { id: "23", name: "Table Tennis", category: "Sports", caloriesPerMinute: 4 },

  // Yoga & Flexibility
  { id: "24", name: "Yoga (Hatha)", category: "Yoga", caloriesPerMinute: 3 },
  { id: "25", name: "Yoga (Vinyasa)", category: "Yoga", caloriesPerMinute: 4 },
  { id: "26", name: "Yoga (Power)", category: "Yoga", caloriesPerMinute: 5 },
  { id: "27", name: "Stretching", category: "Flexibility", caloriesPerMinute: 2 },
  { id: "28", name: "Pilates", category: "Flexibility", caloriesPerMinute: 4 },

  // Other
  { id: "29", name: "Martial Arts", category: "Combat", caloriesPerMinute: 10 },
  { id: "30", name: "Boxing", category: "Combat", caloriesPerMinute: 12 },
  { id: "31", name: "Hiking", category: "Outdoor", caloriesPerMinute: 6 },
  { id: "32", name: "Rock Climbing", category: "Outdoor", caloriesPerMinute: 11 },
];

export const workoutCategories = [
  "All",
  "Cardio",
  "Strength", 
  "Sports",
  "Yoga",
  "Flexibility",
  "Combat",
  "Outdoor"
];
