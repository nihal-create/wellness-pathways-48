export interface IndianFood {
  id: string;
  name: string;
  category: string;
  standardQuantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export const indianFoods: IndianFood[] = [
  // Rice & Grain Dishes
  { id: "1", name: "Basmati Rice (Steamed)", category: "Rice & Grains", standardQuantity: "1 cup (150g)", calories: 205, protein: 4.3, carbs: 45, fat: 0.4, fiber: 0.6 },
  { id: "2", name: "Jeera Rice", category: "Rice & Grains", standardQuantity: "1 cup (150g)", calories: 245, protein: 4.5, carbs: 48, fat: 4, fiber: 0.8 },
  { id: "3", name: "Biryani (Vegetable)", category: "Rice & Grains", standardQuantity: "1 plate (200g)", calories: 380, protein: 8, carbs: 65, fat: 12, fiber: 3 },
  { id: "4", name: "Biryani (Chicken)", category: "Rice & Grains", standardQuantity: "1 plate (250g)", calories: 450, protein: 25, carbs: 55, fat: 15, fiber: 2 },
  { id: "5", name: "Pulao", category: "Rice & Grains", standardQuantity: "1 cup (150g)", calories: 320, protein: 6, carbs: 58, fat: 8, fiber: 2 },

  // Roti & Bread
  { id: "6", name: "Chapati/Roti", category: "Bread", standardQuantity: "1 medium (30g)", calories: 80, protein: 3, carbs: 15, fat: 1, fiber: 2 },
  { id: "7", name: "Naan", category: "Bread", standardQuantity: "1 piece (60g)", calories: 160, protein: 5, carbs: 30, fat: 3, fiber: 1 },
  { id: "8", name: "Paratha (Plain)", category: "Bread", standardQuantity: "1 piece (50g)", calories: 150, protein: 4, carbs: 20, fat: 6, fiber: 2 },
  { id: "9", name: "Stuffed Paratha (Aloo)", category: "Bread", standardQuantity: "1 piece (80g)", calories: 220, protein: 5, carbs: 30, fat: 8, fiber: 3 },

  // Dal & Lentils
  { id: "10", name: "Dal Tadka", category: "Dal & Lentils", standardQuantity: "1 bowl (150ml)", calories: 180, protein: 12, carbs: 25, fat: 4, fiber: 8 },
  { id: "11", name: "Dal Makhani", category: "Dal & Lentils", standardQuantity: "1 bowl (150ml)", calories: 250, protein: 14, carbs: 20, fat: 12, fiber: 6 },
  { id: "12", name: "Sambar", category: "Dal & Lentils", standardQuantity: "1 bowl (150ml)", calories: 120, protein: 8, carbs: 18, fat: 2, fiber: 5 },
  { id: "13", name: "Rajma", category: "Dal & Lentils", standardQuantity: "1 bowl (150ml)", calories: 200, protein: 15, carbs: 30, fat: 3, fiber: 10 },

  // Vegetables
  { id: "14", name: "Aloo Gobi", category: "Vegetables", standardQuantity: "1 serving (100g)", calories: 150, protein: 3, carbs: 20, fat: 6, fiber: 4 },
  { id: "15", name: "Palak Paneer", category: "Vegetables", standardQuantity: "1 serving (150g)", calories: 280, protein: 18, carbs: 10, fat: 20, fiber: 3 },
  { id: "16", name: "Bhindi Masala", category: "Vegetables", standardQuantity: "1 serving (100g)", calories: 120, protein: 2, carbs: 12, fat: 7, fiber: 3 },
  { id: "17", name: "Baingan Bharta", category: "Vegetables", standardQuantity: "1 serving (100g)", calories: 140, protein: 2, carbs: 15, fat: 8, fiber: 5 },

  // Non-Veg
  { id: "18", name: "Chicken Curry", category: "Non-Vegetarian", standardQuantity: "1 serving (150g)", calories: 320, protein: 30, carbs: 8, fat: 18, fiber: 2 },
  { id: "19", name: "Butter Chicken", category: "Non-Vegetarian", standardQuantity: "1 serving (150g)", calories: 380, protein: 28, carbs: 10, fat: 25, fiber: 1 },
  { id: "20", name: "Fish Curry", category: "Non-Vegetarian", standardQuantity: "1 serving (150g)", calories: 280, protein: 25, carbs: 6, fat: 16, fiber: 1 },
  { id: "21", name: "Mutton Curry", category: "Non-Vegetarian", standardQuantity: "1 serving (150g)", calories: 420, protein: 35, carbs: 5, fat: 28, fiber: 1 },

  // Snacks
  { id: "22", name: "Samosa", category: "Snacks", standardQuantity: "1 piece (50g)", calories: 180, protein: 4, carbs: 22, fat: 8, fiber: 2 },
  { id: "23", name: "Pakora", category: "Snacks", standardQuantity: "4 pieces (60g)", calories: 220, protein: 6, carbs: 20, fat: 12, fiber: 3 },
  { id: "24", name: "Dhokla", category: "Snacks", standardQuantity: "2 pieces (80g)", calories: 160, protein: 5, carbs: 28, fat: 3, fiber: 2 },
  { id: "25", name: "Idli", category: "Snacks", standardQuantity: "2 pieces (60g)", calories: 120, protein: 4, carbs: 24, fat: 1, fiber: 1 },
  { id: "26", name: "Dosa (Plain)", category: "Snacks", standardQuantity: "1 piece (80g)", calories: 180, protein: 6, carbs: 30, fat: 4, fiber: 2 },

  // Sweets
  { id: "27", name: "Gulab Jamun", category: "Sweets", standardQuantity: "1 piece (30g)", calories: 150, protein: 3, carbs: 22, fat: 6, fiber: 0 },
  { id: "28", name: "Rasgulla", category: "Sweets", standardQuantity: "1 piece (25g)", calories: 90, protein: 2, carbs: 18, fat: 1, fiber: 0 },
  { id: "29", name: "Kheer", category: "Sweets", standardQuantity: "1 bowl (100ml)", calories: 180, protein: 4, carbs: 30, fat: 5, fiber: 0 },
  { id: "30", name: "Halwa (Carrot)", category: "Sweets", standardQuantity: "1 serving (80g)", calories: 250, protein: 4, carbs: 35, fat: 10, fiber: 2 },
];

export const foodCategories = [
  "All",
  "Rice & Grains",
  "Bread",
  "Dal & Lentils", 
  "Vegetables",
  "Non-Vegetarian",
  "Snacks",
  "Sweets"
];