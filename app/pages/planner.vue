<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  Sparkles, Scale, Flame, Droplets, ArrowRight, CheckCircle2, 
  HelpCircle, AlertCircle, ShoppingBag, DollarSign, Calendar, ChevronRight,
  TrendingDown, RotateCcw, AlertTriangle, ShieldCheck, BrainCircuit
} from '@lucide/vue'
import { useHealthStore } from '~/stores/health'
import { useUserStore } from '~/stores/user'
import { usePlannerStore } from '~/stores/planner'
import type { MealPlanDay } from '~/stores/planner'
import { useI18n } from '#imports'
import Card from '~/components/ui/Card.vue'
import Button from '~/components/ui/Button.vue'

const healthStore = useHealthStore()
const userStore = useUserStore()
const plannerStore = usePlannerStore()
const { t, locale } = useI18n()

// Active Planner Tab: 'recommendations' | 'generator'
const activeTab = ref<'recommendations' | 'generator'>('recommendations')

// Generator Parameters
const planSchedule = ref<'weekly' | 'daily'>('weekly')
const planBudget = ref<'economical' | 'normal'>('normal')
const planFocus = ref<'balanced' | 'high_protein' | 'low_sugar'>('balanced')
const planDiet = ref<'general' | 'keto' | 'vegetarian' | 'diabetic'>('general')

// Simulated AI Generating state
const isGenerating = ref(false)
const genProgress = ref(0)
const genStep = ref(0)

onMounted(() => {
  healthStore.fetchTodayData()
  userStore.fetchProfile()
  plannerStore.initializeStore()
})

// BMR / TDEE Calculations based on Mifflin-St Jeor
const bmrValue = computed(() => {
  const weight = healthStore.currentWeight || 70
  const height = healthStore.height || 170
  // Estimate age if not onboarding completed (default 25)
  const age = 25
  const bmr = 10 * weight + 6.25 * height - 5 * age + 5
  return Math.round(bmr)
})

const tdeeValue = computed(() => {
  return Math.round(bmrValue.value * 1.375) // Moderately Active multiplier
})

// 1. FOOD SWAPPER DATA
const selectedUnhealthyFood = ref('indomie')
const unhealthyFoods = computed(() => [
  { id: 'indomie', nameId: 'Mie Instan Goreng', nameEn: 'Fried Instant Noodles', calories: 380, protein: 8, carbs: 54, fat: 14, sugar: 7 },
  { id: 'nasi_goreng', nameId: 'Nasi Goreng Spesial', nameEn: 'Special Fried Rice', calories: 450, protein: 12, carbs: 58, fat: 16, sugar: 4.2 },
  { id: 'chips', nameId: 'Keripik Kentang Chips', nameEn: 'Potato Chips Sack', calories: 140, protein: 2, carbs: 16, fat: 8, sugar: 1.5 },
  { id: 'susu_full', nameId: 'Susu Sapi Full Cream', nameEn: 'Full Cream Milk', calories: 150, protein: 8, carbs: 12, fat: 8, sugar: 11 }
])

const healthyAlternatives = computed(() => ({
  indomie: { nameId: 'Sayur Sop Bening & Telur Rebus', nameEn: 'Clear Veg Soup & Boiled Egg', calories: 160, protein: 12, carbs: 15, fat: 5, sugar: 2 },
  nasi_goreng: { nameId: 'Nasi Merah & Dada Ayam Panggang', nameEn: 'Brown Rice & Grilled Chicken', calories: 280, protein: 32, carbs: 28, fat: 4, sugar: 0.5 },
  chips: { nameId: 'Kacang Edamame Kukus', nameEn: 'Steamed Edamame Beans', calories: 95, protein: 8, carbs: 9, fat: 2.5, sugar: 1 },
  susu_full: { nameId: 'Susu Almond Tanpa Gula', nameEn: 'Unsweetened Almond Milk', calories: 35, protein: 1.5, carbs: 1.5, fat: 2.5, sugar: 0.1 }
}))

const activeUnhealthy = computed(() => {
  const found = unhealthyFoods.value.find(f => f.id === selectedUnhealthyFood.value)
  const fallback = unhealthyFoods.value[0] as { id: string; nameId: string; nameEn: string; calories: number; protein: number; carbs: number; fat: number; sugar: number }
  return found || fallback
})

const activeHealthy = computed(() => {
  return (healthyAlternatives.value as any)[selectedUnhealthyFood.value] || healthyAlternatives.value.indomie
})

// Swap calculations differences
const diffCalories = computed(() => {
  if (!activeUnhealthy.value) return 0
  return activeUnhealthy.value.calories - activeHealthy.value.calories
})

const diffProtein = computed(() => {
  if (!activeUnhealthy.value) return 0
  return activeHealthy.value.protein - activeUnhealthy.value.protein
})

const diffSugar = computed(() => {
  if (!activeUnhealthy.value) return 0
  return activeUnhealthy.value.sugar - activeHealthy.value.sugar
})

const diffFat = computed(() => {
  if (!activeUnhealthy.value) return 0
  return activeUnhealthy.value.fat - activeHealthy.value.fat
})

// 2. MEAL PLAN GENERATOR DATABASE
const mockMealPlans = {
  weekly: {
    general: {
      budget_eco: [
        { day: 'Senin / Monday', breakfast: { name: 'Telur Rebus (2) & Pisang', calories: 230, protein: 14, carbs: 28, fat: 10, sugar: 12 }, lunch: { name: 'Nasi Putih, Tempe Bacem & Tumis Kangkung', calories: 350, protein: 12, carbs: 54, fat: 8, sugar: 4 }, dinner: { name: 'Sayur Sop Bening & Tahu Goreng', calories: 210, protein: 10, carbs: 24, fat: 6, sugar: 2 }, snack: { name: 'Kacang Tanah Sangrai', calories: 120, protein: 5, carbs: 6, fat: 9, sugar: 1 } },
        { day: 'Selasa / Tuesday', breakfast: { name: 'Bubur Kacang Hijau Roti', calories: 280, protein: 10, carbs: 48, fat: 5, sugar: 15 }, lunch: { name: 'Nasi Putih & Telur Dadar Daun Bawang', calories: 360, protein: 13, carbs: 42, fat: 12, sugar: 1 }, dinner: { name: 'Sayur Asem & Tempe Goreng Garing', calories: 240, protein: 9, carbs: 32, fat: 8, sugar: 3 }, snack: { name: 'Pisang Mas / Ambon', calories: 90, protein: 1, carbs: 22, fat: 0, sugar: 12 } },
        { day: 'Rabu / Wednesday', breakfast: { name: 'Roti Bakar Margarin & Teh Tawar', calories: 180, protein: 4, carbs: 28, fat: 5, sugar: 2 }, lunch: { name: 'Nasi Putih, Pepes Tahu & Sayur Lodeh', calories: 320, protein: 11, carbs: 45, fat: 9, sugar: 4 }, dinner: { name: 'Tumis Buncis & Telur Ceplok Air', calories: 220, protein: 12, carbs: 12, fat: 10, sugar: 1 }, snack: { name: 'Pepaya Potong Segar', calories: 80, protein: 1, carbs: 18, fat: 0, sugar: 10 } },
        { day: 'Kamis / Thursday', breakfast: { name: 'Singkong Rebus & Kopi Hitam', calories: 210, protein: 2, carbs: 44, fat: 1, sugar: 4 }, lunch: { name: 'Nasi Putih, Gado-Gado Hemat', calories: 390, protein: 12, carbs: 52, fat: 14, sugar: 8 }, dinner: { name: 'Sop Ceker Ayam Bening & Tahu Bakar', calories: 260, protein: 15, carbs: 18, fat: 11, sugar: 2 }, snack: { name: 'Semangka Potong', calories: 60, protein: 1, carbs: 14, fat: 0, sugar: 9 } },
        { day: 'Jumat / Friday', breakfast: { name: 'Telur Orak Arik & Tomat Potong', calories: 180, protein: 12, carbs: 4, fat: 11, sugar: 1 }, lunch: { name: 'Nasi Putih & Pepes Ayam Kemangi', calories: 380, protein: 28, carbs: 36, fat: 8, sugar: 1 }, dinner: { name: 'Capcay Kuah Bakso Sederhana', calories: 220, protein: 11, carbs: 20, fat: 7, sugar: 3 }, snack: { name: 'Salak / Jeruk Lokal', calories: 70, protein: 1, carbs: 16, fat: 0, sugar: 11 } },
        { day: 'Sabtu / Saturday', breakfast: { name: 'Ubi Cilembu Oven', calories: 240, protein: 3, carbs: 52, fat: 0, sugar: 15 }, lunch: { name: 'Nasi Putih, Sayur Sop Ceker & Tahu Bacem', calories: 310, protein: 14, carbs: 40, fat: 9, sugar: 3 }, dinner: { name: 'Tumis Tauge Teri Asin & Tempe Rebus', calories: 230, protein: 15, carbs: 22, fat: 8, sugar: 1 }, snack: { name: 'Pisang Rebus', calories: 110, protein: 1, carbs: 26, fat: 0, sugar: 13 } },
        { day: 'Minggu / Sunday', breakfast: { name: 'Nasi Kuning Sederhana + Tempe Orek', calories: 320, protein: 9, carbs: 48, fat: 8, sugar: 2 }, lunch: { name: 'Nasi Putih, Soto Ayam Hemat & Kol Kol', calories: 370, protein: 22, carbs: 44, fat: 10, sugar: 1 }, dinner: { name: 'Pepes Tahu & Tumis Labu Siam Sederhana', calories: 190, protein: 10, carbs: 18, fat: 7, sugar: 2 }, snack: { name: 'Semangka Merah', calories: 60, protein: 1, carbs: 14, fat: 0, sugar: 9 } }
      ],
      budget_normal: [
        { day: 'Senin / Monday', breakfast: { name: 'Oatmeal Milk Banana & Almonds', calories: 320, protein: 10, carbs: 45, fat: 8, sugar: 14 }, lunch: { name: 'Nasi Merah, Dada Ayam Panggang & Sop', calories: 420, protein: 34, carbs: 48, fat: 6, sugar: 2 }, dinner: { name: 'Tahu Tumis Jamur & Edamame', calories: 280, protein: 16, carbs: 22, fat: 9, sugar: 2 }, snack: { name: 'Greek Yogurt & Honey', calories: 150, protein: 12, carbs: 14, fat: 3, sugar: 10 } },
        { day: 'Selasa / Tuesday', breakfast: { name: 'Roti Gandum Toast, Avocado & Egg', calories: 290, protein: 13, carbs: 26, fat: 12, sugar: 2 }, lunch: { name: 'Nasi Merah & Ikan Kembung Bakar', calories: 440, protein: 28, carbs: 42, fat: 14, sugar: 1 }, dinner: { name: 'Sop Bening Dada Ayam & Brokoli', calories: 290, protein: 26, carbs: 18, fat: 7, sugar: 2 }, snack: { name: 'Apel Malang / Apel Merah', calories: 95, protein: 0.5, carbs: 22, fat: 0, sugar: 15 } },
        { day: 'Rabu / Wednesday', breakfast: { name: 'Oatmeal Greek Yogurt Berry', calories: 310, protein: 14, carbs: 38, fat: 5, sugar: 12 }, lunch: { name: 'Nasi Merah & Sate Ayam Bumbu Kacang (5)', calories: 480, protein: 26, carbs: 40, fat: 18, sugar: 6 }, dinner: { name: 'Tumis Tahu Tauge Jamur Kuping', calories: 240, protein: 14, carbs: 20, fat: 8, sugar: 2 }, snack: { name: 'Kacang Almond Segenggam', calories: 160, protein: 6, carbs: 6, fat: 14, sugar: 1 } },
        { day: 'Kamis / Thursday', breakfast: { name: 'Omelet 2 Telur, Bayam & Keju Slice', calories: 260, protein: 18, carbs: 2, fat: 19, sugar: 0.5 }, lunch: { name: 'Nasi Merah, Pepes Ikan Mas & Lalapan', calories: 410, protein: 30, carbs: 42, fat: 10, sugar: 1 }, dinner: { name: 'Tumis Pakcoy Jamur & Dada Ayam Panggang', calories: 310, protein: 28, carbs: 15, fat: 8, sugar: 1 }, snack: { name: 'Greek Yogurt Plain', calories: 120, protein: 12, carbs: 6, fat: 4, sugar: 4 } },
        { day: 'Jumat / Friday', breakfast: { name: 'Roti Gandum (2), Mentega Kacang', calories: 280, protein: 9, carbs: 32, fat: 11, sugar: 6 }, lunch: { name: 'Gado-Gado Spesial Lontong Telur Rebus', calories: 460, protein: 16, carbs: 54, fat: 16, sugar: 9 }, dinner: { name: 'Sop Tomat Seafood & Tahu Sutera', calories: 320, protein: 24, carbs: 22, fat: 10, sugar: 3 }, snack: { name: 'Jeruk Sunkist / Jeruk Manis', calories: 80, protein: 1, carbs: 18, fat: 0, sugar: 13 } },
        { day: 'Sabtu / Saturday', breakfast: { name: 'Smoothie Protein (Pisang & Susu Almond)', calories: 240, protein: 15, carbs: 32, fat: 3, sugar: 15 }, lunch: { name: 'Nasi Merah, Pepes Tahu & Sup Ceker Ayam', calories: 360, protein: 18, carbs: 40, fat: 11, sugar: 2 }, dinner: { name: 'Tumis Brokoli Kembang Kol & Udang Rebus', calories: 290, protein: 25, carbs: 16, fat: 9, sugar: 2 }, snack: { name: 'Kacang Mete Panggang', calories: 160, protein: 5, carbs: 9, fat: 12, sugar: 2 } },
        { day: 'Minggu / Sunday', breakfast: { name: 'Roti Gandum Toast & Scrambled Egg (2)', calories: 270, protein: 15, carbs: 24, fat: 11, sugar: 2 }, lunch: { name: 'Nasi Merah, Steak Dada Ayam & Buncis', calories: 430, protein: 36, carbs: 38, fat: 8, sugar: 1 }, dinner: { name: 'Capcay Kuah Dada Ayam & Tahu Jepang', calories: 290, protein: 22, carbs: 20, fat: 8, sugar: 3 }, snack: { name: 'Buah Naga Merah Potong', calories: 90, protein: 1, carbs: 20, fat: 0, sugar: 14 } }
      ]
    },
    keto: {
      budget_eco: [
        { day: 'Senin / Monday', breakfast: { name: 'Telur Rebus (3) Margarin', calories: 280, protein: 21, carbs: 2, fat: 20, sugar: 0 }, lunch: { name: 'Tempe Bacem Bakar & Tumis Bayam Bawang', calories: 290, protein: 14, carbs: 8, fat: 18, sugar: 1 }, dinner: { name: 'Tahu Goreng & Tumis Sawi Hijau Teri', calories: 260, protein: 16, carbs: 5, fat: 17, sugar: 0.5 }, snack: { name: 'Kacang Tanah Kulit', calories: 150, protein: 6, carbs: 5, fat: 12, sugar: 1 } },
        { day: 'Selasa / Tuesday', breakfast: { name: 'Telur Dadar Goreng Butter (2 Telur)', calories: 230, protein: 14, carbs: 1, fat: 18, sugar: 0 }, lunch: { name: 'Ayam Goreng Lengkuas (Paha) & Lalapan', calories: 380, protein: 24, carbs: 2, fat: 28, sugar: 0.5 }, dinner: { name: 'Orak Arik Telur, Kubis & Tempe Potong', calories: 270, protein: 15, carbs: 6, fat: 19, sugar: 1 }, snack: { name: 'Kacang Kedelai Goreng', calories: 130, protein: 9, carbs: 6, fat: 8, sugar: 1 } },
        { day: 'Rabu / Wednesday', breakfast: { name: 'Tahu Bejek Telur Butter', calories: 240, protein: 16, carbs: 3, fat: 18, sugar: 0.5 }, lunch: { name: 'Kulit Ayam Krispi & Sayur Kangkung', calories: 340, protein: 12, carbs: 4, fat: 30, sugar: 0.5 }, dinner: { name: 'Telur Dadar Gulung Isi Daun Singkong', calories: 250, protein: 15, carbs: 4, fat: 19, sugar: 0 }, snack: { name: 'Kacang Tanah Rebus', calories: 140, protein: 6, carbs: 6, fat: 10, sugar: 1 } },
        { day: 'Kamis / Thursday', breakfast: { name: 'Scrambled Egg Margarin & Cabai', calories: 210, protein: 13, carbs: 1.5, fat: 16, sugar: 0 }, lunch: { name: 'Tumis Ampela Ati Ayam & Tahu Rebus', calories: 310, protein: 22, carbs: 4, fat: 20, sugar: 0.5 }, dinner: { name: 'Sop Tetelan Daging Sapi Bening & Sayur', calories: 350, protein: 20, carbs: 5, fat: 25, sugar: 1 }, snack: { name: 'Keju Cheddar Lokal Slice (2)', calories: 160, protein: 10, carbs: 1, fat: 12, sugar: 0 } },
        { day: 'Jumat / Friday', breakfast: { name: 'Telur Ceplok (2) Keju Parut', calories: 250, protein: 17, carbs: 1, fat: 19, sugar: 0 }, lunch: { name: 'Pecel Lele Goreng (Tanpa Nasi)', calories: 340, protein: 22, carbs: 3, fat: 24, sugar: 0.5 }, dinner: { name: 'Tumis Tauge Tahu Sosis Sapi Butter', calories: 290, protein: 15, carbs: 5, fat: 21, sugar: 1 }, snack: { name: 'Kacang Tanah Sangrai', calories: 150, protein: 6, carbs: 5, fat: 12, sugar: 1 } },
        { day: 'Sabtu / Saturday', breakfast: { name: 'Bubur Tahu Butter & Telur Puyuh (4)', calories: 260, protein: 15, carbs: 3, fat: 20, sugar: 0.5 }, lunch: { name: 'Sayur Asem Tetelan Sapi & Tempe Goreng', calories: 320, protein: 18, carbs: 7, fat: 22, sugar: 1.5 }, dinner: { name: 'Orak Arik Telur Sarden Kaleng Goreng', calories: 310, protein: 22, carbs: 3, fat: 22, sugar: 0 }, snack: { name: 'Keju Slice Single (2)', calories: 160, protein: 10, carbs: 1, fat: 12, sugar: 0 } },
        { day: 'Minggu / Sunday', breakfast: { name: 'Omelet Bayam Butter & Sosis Ayam (1)', calories: 240, protein: 14, carbs: 2, fat: 19, sugar: 0.5 }, lunch: { name: 'Soto Ayam Ceker Santan Encer', calories: 360, protein: 24, carbs: 5, fat: 25, sugar: 1 }, dinner: { name: 'Tumis Pakcoy Daging Sapi Cincang Butter', calories: 330, protein: 22, carbs: 4, fat: 23, sugar: 0.5 }, snack: { name: 'Kacang Kulit Sangrai', calories: 150, protein: 6, carbs: 5, fat: 12, sugar: 1 } }
      ],
      budget_normal: [
        { day: 'Senin / Monday', breakfast: { name: 'Scrambled Eggs (3) with Butter & Bacon/Beef Rasher', calories: 380, protein: 24, carbs: 1, fat: 30, sugar: 0.5 }, lunch: { name: 'Grilled Salmon with Garlic Butter & Asparagus', calories: 490, protein: 32, carbs: 4, fat: 38, sugar: 0 }, dinner: { name: 'Ribeye Steak with Butter & Broccoli Cheese', calories: 520, protein: 36, carbs: 5, fat: 40, sugar: 0.5 }, snack: { name: 'Macadamia Nuts or Pecans', calories: 200, protein: 3, carbs: 4, fat: 21, sugar: 1 } },
        { day: 'Selasa / Tuesday', breakfast: { name: 'Avocado Baked Egg with Cheddar Cheese (2 Eggs)', calories: 360, protein: 16, carbs: 6, fat: 30, sugar: 1 }, lunch: { name: 'Grilled Chicken Thigh with Skin & Cauli-Rice', calories: 450, protein: 28, carbs: 5, fat: 34, sugar: 0.5 }, dinner: { name: 'Keto Pork Chops / Beef Chops & Mushrooms', calories: 480, protein: 34, carbs: 3, fat: 36, sugar: 0 }, snack: { name: 'Almond Nuts Segenggam', calories: 160, protein: 6, carbs: 6, fat: 14, sugar: 1 } },
        { day: 'Rabu / Wednesday', breakfast: { name: 'Keto Bulletproof Coffee & Scrambled Eggs', calories: 310, protein: 13, carbs: 1, fat: 28, sugar: 0 }, lunch: { name: 'Beef Burger Patty with Melted Cheese & Lettuce Wrap', calories: 480, protein: 30, carbs: 2, fat: 38, sugar: 0.5 }, dinner: { name: 'Shrimp sautéed in Olive Oil, Garlic, Spinach', calories: 390, protein: 26, carbs: 4, fat: 29, sugar: 0 }, snack: { name: 'Greek Yogurt Plain High Fat', calories: 140, protein: 10, carbs: 5, fat: 9, sugar: 4 } },
        { day: 'Kamis / Thursday', breakfast: { name: 'Omelette with Mushrooms, Feta Cheese, Avocado', calories: 380, protein: 15, carbs: 7, fat: 32, sugar: 1.5 }, lunch: { name: 'Seared Tuna Steak with Avocado Salad & Olives', calories: 460, protein: 34, carbs: 5, fat: 32, sugar: 0.5 }, dinner: { name: 'Grilled Chicken Breast with Pesto Sauce & Zucchini Noodles', calories: 420, protein: 32, carbs: 6, fat: 28, sugar: 1 }, snack: { name: 'Walnuts Segenggam', calories: 180, protein: 4, carbs: 4, fat: 18, sugar: 0.8 } },
        { day: 'Jumat / Friday', breakfast: { name: 'Smoked Salmon and Cream Cheese on Keto Roll', calories: 390, protein: 20, carbs: 4, fat: 31, sugar: 1 }, lunch: { name: 'Garlic Butter Pork/Beef Stir-Fry & Cauliflower', calories: 480, protein: 28, carbs: 5, fat: 38, sugar: 0.8 }, dinner: { name: 'Baked Salmon with Spinach and Olive Oil Dressing', calories: 460, protein: 30, carbs: 3, fat: 36, sugar: 0 }, snack: { name: 'Cheese Blocks (Gouda/Cheddar)', calories: 150, protein: 8, carbs: 1, fat: 12, sugar: 0 } },
        { day: 'Sabtu / Saturday', breakfast: { name: 'Keto Chia Seed Pudding (Coconut Milk)', calories: 290, protein: 6, carbs: 8, fat: 26, sugar: 1 }, lunch: { name: 'Baked Mackerel Steak with Asparagus Sauté', calories: 470, protein: 26, carbs: 4, fat: 39, sugar: 0.5 }, dinner: { name: 'Keto Meatballs in Rich Garlic Cream Sauce', calories: 510, protein: 28, carbs: 5, fat: 42, sugar: 1 }, snack: { name: 'Pumpkin Seeds Segenggam', calories: 150, protein: 7, carbs: 3, fat: 13, sugar: 0.5 } },
        { day: 'Minggu / Sunday', breakfast: { name: 'Avocado, Bacon, Fried Egg Salad (2 Eggs)', calories: 410, protein: 18, carbs: 7, fat: 34, sugar: 1 }, lunch: { name: 'Creamy Spinach Tuscan Garlic Butter Salmon', calories: 520, protein: 34, carbs: 4, fat: 41, sugar: 1 }, dinner: { name: 'Grilled Pork/Beef Ribs with Cauliflower Mash', calories: 530, protein: 32, carbs: 6, fat: 40, sugar: 1 }, snack: { name: 'Macadamia Nuts', calories: 200, protein: 3, carbs: 4, fat: 21, sugar: 1 } }
      ]
    }
  }
}

// Generate procedurally simulated plan
const generatePlan = () => {
  isGenerating.value = true
  genProgress.value = 0
  genStep.value = 1

  const stepsTimer = setInterval(() => {
    genProgress.value += 12
    if (genProgress.value >= 25 && genProgress.value < 50) genStep.value = 2
    else if (genProgress.value >= 50 && genProgress.value < 75) genStep.value = 3
    else if (genProgress.value >= 75 && genProgress.value < 95) genStep.value = 4

    if (genProgress.value >= 100) {
      clearInterval(stepsTimer)
      isGenerating.value = false
      
      // Select appropriate local database plan
      const dietKey = planDiet.value === 'keto' ? 'keto' : 'general'
      const budgetKey = planBudget.value === 'economical' ? 'budget_eco' : 'budget_normal'
      let selectPlans: MealPlanDay[] = (mockMealPlans.weekly as any)[dietKey]?.[budgetKey] || mockMealPlans.weekly.general.budget_normal

      // If Daily is selected, pick today's specific day of the week
      if (planSchedule.value === 'daily') {
        const currentDayIdx = new Date().getDay() // 0 is Sunday, 1 is Monday...
        const targetIdx = currentDayIdx === 0 ? 6 : currentDayIdx - 1
        const chosenDay = selectPlans[targetIdx] || selectPlans[0]
        if (chosenDay) {
          selectPlans = [chosenDay]
        }
      }

      // Map macros based on focus parameters slightly
      const finalPlan = selectPlans.map(day => {
        let b = { ...day.breakfast }
        let l = { ...day.lunch }
        let d = { ...day.dinner }
        let s = { ...day.snack }

        if (planFocus.value === 'high_protein') {
          b.protein = Math.round(b.protein * 1.3)
          b.calories += 10
          l.protein = Math.round(l.protein * 1.3)
          l.calories += 20
          d.protein = Math.round(d.protein * 1.3)
          d.calories += 15
        } else if (planFocus.value === 'low_sugar') {
          b.sugar = Math.round(b.sugar * 0.4)
          l.sugar = Math.round(l.sugar * 0.3)
          d.sugar = Math.round(d.sugar * 0.3)
          s.sugar = Math.round(s.sugar * 0.2)
        }

        return { day: day.day, breakfast: b, lunch: l, dinner: d, snack: s }
      })

      plannerStore.saveMealPlan(finalPlan, {
        type: planSchedule.value,
        budget: planBudget.value,
        focus: planFocus.value,
        diet: planDiet.value
      })
    }
  }, 350)
}

const clearActivePlan = () => {
  plannerStore.clearMealPlan()
}

// Shopping list calculations based on active plan
const groceryBudgetEstimate = computed(() => {
  const isDaily = planSchedule.value === 'daily'
  if (planBudget.value === 'economical') {
    if (isDaily) {
      return locale.value === 'id' ? 'Rp 20.000 - Rp 35.000 / hari' : 'IDR 20k - 35k / day'
    }
    return locale.value === 'id' ? 'Rp 150.000 - Rp 250.000 / minggu' : 'IDR 150k - 250k / week'
  }
  if (isDaily) {
    return locale.value === 'id' ? 'Rp 65.000 - Rp 95.000 / hari' : 'IDR 65k - 95k / day'
  }
  return locale.value === 'id' ? 'Rp 450.000 - Rp 650.000 / minggu' : 'IDR 450k - 650k / week'
})

const smartGroceryList = computed(() => {
  const isId = locale.value === 'id'
  const isDaily = planSchedule.value === 'daily'
  
  if (planDiet.value === 'keto') {
    return [
      { name: isId ? 'Telur Ayam Broiler' : 'Chicken Eggs', qty: isDaily ? '4 pcs' : '30 pcs', price: isDaily ? 'Rp 6.000' : 'Rp 45.000' },
      { name: isId ? 'Dada & Paha Ayam Fillet' : 'Chicken Fillets & Thighs', qty: isDaily ? '250g' : '1.5 Kg', price: isDaily ? 'Rp 12.000' : 'Rp 75.000' },
      { name: isId ? 'Ikan Mackerel / Kembung Segar' : 'Fresh Mackerel Fish', qty: isDaily ? '200g' : '1 Kg', price: isDaily ? 'Rp 9.000' : 'Rp 45.000' },
      { name: isId ? 'Sayur Bayam, Pakcoy, & Kol Hijau' : 'Spinach, Pakcoy & Cabbage', qty: isDaily ? '1 ikat' : '5 ikat', price: isDaily ? 'Rp 4.000' : 'Rp 20.000' },
      { name: isId ? 'Alpukat Mentega Matang' : 'Butter Avocado', qty: isDaily ? '1 pc' : '1.5 Kg', price: isDaily ? 'Rp 8.000' : 'Rp 40.000' }
    ]
  }
  return [
    { name: isId ? 'Beras Merah Premium' : 'Premium Brown Rice', qty: isDaily ? '300g' : '2 Kg', price: isDaily ? 'Rp 6.000' : 'Rp 38.000' },
    { name: isId ? 'Dada Ayam Tanpa Kulit' : 'Skinless Chicken Breast', qty: isDaily ? '250g' : '1.5 Kg', price: isDaily ? 'Rp 13.000' : 'Rp 80.000' },
    { name: isId ? 'Telur Ayam Segar' : 'Fresh Farm Eggs', qty: isDaily ? '2 pcs' : '15 pcs', price: isDaily ? 'Rp 4.500' : 'Rp 24.000' },
    { name: isId ? 'Tempe, Tahu Bandung, & Pepes' : 'Tempeh, Tofu & Pepes', qty: isDaily ? '1 block' : '5 blocks', price: isDaily ? 'Rp 5.000' : 'Rp 25.000' },
    { name: isId ? 'Pisang Cavendish / Ambon' : 'Fresh Cavendish Bananas', qty: isDaily ? '2 pcs' : '1 Sisir', price: isDaily ? 'Rp 5.000' : 'Rp 25.000' }
  ]
})
</script>

<template>
  <div class="px-6 py-8 pb-32 md:pb-8">
    <!-- Header -->
    <header class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-secondary">{{ t('planner.title') }}</h1>
        <p class="text-sm text-text-muted mt-1">{{ t('planner.subtitle') }}</p>
      </div>
      <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
        <Sparkles class="w-5 h-5 animate-pulse" />
      </div>
    </header>

    <!-- Custom Premium Tabs -->
    <div class="flex bg-slate-100 p-1.5 rounded-2xl mb-8 max-w-md">
      <button 
        @click="activeTab = 'recommendations'"
        class="flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all duration-300 flex items-center justify-center gap-2"
        :class="activeTab === 'recommendations' ? 'bg-white text-secondary shadow-soft' : 'text-text-muted hover:text-secondary'"
      >
        <ShieldCheck class="w-4 h-4" />
        {{ t('planner.tabRecommendations') }}
      </button>
      <button 
        @click="activeTab = 'generator'"
        class="flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all duration-300 flex items-center justify-center gap-2"
        :class="activeTab === 'generator' ? 'bg-white text-secondary shadow-soft' : 'text-text-muted hover:text-secondary'"
      >
        <Calendar class="w-4 h-4" />
        {{ t('planner.tabMealPlan') }}
      </button>
    </div>

    <!-- TAB 1: RECOMMENDATIONS & SWAPS -->
    <div v-if="activeTab === 'recommendations'" class="space-y-8 animate-in fade-in duration-300">
      
      <!-- AI Nutrition Coach promo card -->
      <Card padding="p-5" class="bg-gradient-to-br from-violet-600 to-indigo-700 text-white border-none relative overflow-hidden shadow-soft hover:shadow-lg transition-all duration-300 group">
        <div class="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none group-hover:scale-110 transition-transform"></div>
        <div class="absolute bottom-0 left-0 w-36 h-36 bg-primary/20 rounded-full blur-xl -ml-16 -mb-16 pointer-events-none"></div>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shrink-0 group-hover:rotate-6 transition-transform">
              <BrainCircuit class="w-6 h-6 text-primary animate-pulse" />
            </div>
            <div class="min-w-0">
              <span class="text-[9px] font-black uppercase bg-primary/25 border border-primary/30 text-primary-300 px-2.5 py-0.5 rounded-full tracking-wider inline-block">
                {{ t('coach.dashboardTag') }}
              </span>
              <h3 class="font-extrabold text-white text-base mt-2 leading-snug">
                {{ t('coach.dashboardTitle') }}
              </h3>
              <p class="text-xs text-white/80 mt-1 leading-relaxed font-semibold max-w-xl">
                {{ t('coach.dashboardDesc') }}
              </p>
            </div>
          </div>
          <NuxtLink to="/coach" class="sm:self-center inline-flex items-center justify-center gap-1.5 text-xs font-black bg-white text-indigo-700 hover:bg-slate-50 transition-all rounded-full px-5 py-3 shadow-md active:scale-95 shrink-0 self-start">
            <span>{{ t('coach.dashboardBtn') }}</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </NuxtLink>
        </div>
      </Card>

      <!-- Calorie needs analysis -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card padding="p-5" class="bg-gradient-to-br from-white to-primary-50 border-none relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div class="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none -mr-6 -mt-6"></div>
          <span class="text-[10px] font-black uppercase text-primary tracking-wider">{{ t('planner.bmr') }}</span>
          <div>
            <h2 class="text-3xl font-black text-secondary mt-1">{{ bmrValue }} <span class="text-xs font-bold text-text-muted">kcal/day</span></h2>
            <p class="text-xs text-text-muted mt-1 leading-relaxed">Metabolisme dasar tubuh Anda saat istirahat total.</p>
          </div>
        </Card>

        <Card padding="p-5" class="bg-gradient-to-br from-white to-orange-50 border-none relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div class="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-xl pointer-events-none -mr-6 -mt-6"></div>
          <span class="text-[10px] font-black uppercase text-orange-500 tracking-wider">{{ t('planner.tdee') }}</span>
          <div>
            <h2 class="text-3xl font-black text-secondary mt-1">{{ tdeeValue }} <span class="text-xs font-bold text-text-muted">kcal/day</span></h2>
            <p class="text-xs text-text-muted mt-1 leading-relaxed">Total energi terpakai disesuaikan dengan aktivitas Anda harian.</p>
          </div>
        </Card>

        <Card padding="p-5" class="bg-gradient-to-br from-white to-emerald-50 border-none relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div class="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none -mr-6 -mt-6"></div>
          <span class="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Target Calorie Intake</span>
          <div>
            <h2 class="text-3xl font-black text-secondary mt-1">{{ healthStore.dailyGoalCalories }} <span class="text-xs font-bold text-text-muted">kcal/day</span></h2>
            <p class="text-xs text-text-muted mt-1 leading-relaxed">Asupan kalori target untuk mencapai berat {{ healthStore.goalWeight }} kg.</p>
          </div>
        </Card>
      </div>

      <!-- Food swapper component -->
      <Card padding="p-6" class="bg-white border border-slate-100 shadow-soft">
        <div class="flex items-center gap-2 mb-2">
          <RotateCcw class="text-primary w-5 h-5 animate-spin" style="animation-duration: 6s" />
          <h3 class="font-extrabold text-secondary text-sm uppercase tracking-wider">{{ t('planner.swapperTitle') }}</h3>
        </div>
        <p class="text-xs text-text-muted leading-relaxed mb-6 font-semibold">{{ t('planner.swapperDesc') }}</p>

        <!-- Dropdowns selectors row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label class="text-[10px] font-black text-text-muted uppercase tracking-wider block mb-1.5">{{ t('planner.selectFood') }}</label>
            <select 
              v-model="selectedUnhealthyFood"
              class="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-secondary focus:border-primary focus:outline-none transition-colors"
            >
              <option v-for="item in unhealthyFoods" :key="item.id" :value="item.id">
                {{ locale === 'id' ? item.nameId : item.nameEn }} ({{ item.calories }} kcal)
              </option>
            </select>
          </div>
          <div>
            <label class="text-[10px] font-black text-text-muted uppercase tracking-wider block mb-1.5">{{ t('planner.swapWith') }}</label>
            <div class="w-full bg-emerald-50 border-2 border-emerald-100 rounded-2xl px-4 py-3 text-sm font-black text-emerald-800 flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 shrink-0" />
              <span>{{ locale === 'id' ? activeHealthy.nameId : activeHealthy.nameEn }} ({{ activeHealthy.calories }} kcal)</span>
            </div>
          </div>
        </div>

        <!-- Comparative Side-by-Side Analysis Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Calorie Diff -->
          <div class="p-4 rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <span class="text-[10px] font-bold text-text-muted uppercase tracking-wider">{{ t('planner.caloriesDiff') }}</span>
            <span class="text-xl font-black mt-1 text-emerald-600">-{{ diffCalories }} kcal</span>
            <span class="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1.5 uppercase tracking-wide">
              {{ t('planner.saveCal') }} {{ Math.round((diffCalories / activeUnhealthy.calories) * 100) }}%
            </span>
          </div>

          <!-- Protein Diff -->
          <div class="p-4 rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <span class="text-[10px] font-bold text-text-muted uppercase tracking-wider">{{ t('planner.proteinDiff') }}</span>
            <span class="text-xl font-black mt-1" :class="diffProtein >= 0 ? 'text-emerald-600' : 'text-rose-500'">
              {{ diffProtein >= 0 ? `+${diffProtein}` : diffProtein }}g
            </span>
            <span class="text-[9px] font-bold px-2 py-0.5 rounded-full mt-1.5 uppercase tracking-wide"
              :class="diffProtein >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'"
            >
              {{ diffProtein >= 0 ? t('planner.gainProt') : 'Less' }}
            </span>
          </div>

          <!-- Sugar Diff -->
          <div class="p-4 rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <span class="text-[10px] font-bold text-text-muted uppercase tracking-wider">{{ t('planner.sugarDiff') }}</span>
            <span class="text-xl font-black mt-1 text-emerald-600">-{{ diffSugar.toFixed(1) }}g</span>
            <span class="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1.5 uppercase tracking-wide">
              {{ t('planner.lessSug') }} {{ Math.round((diffSugar / activeUnhealthy.sugar) * 100) }}%
            </span>
          </div>

          <!-- Fat Diff -->
          <div class="p-4 rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <span class="text-[10px] font-bold text-text-muted uppercase tracking-wider">{{ t('planner.fatDiff') }}</span>
            <span class="text-xl font-black mt-1 text-emerald-600">-{{ diffFat.toFixed(1) }}g</span>
            <span class="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1.5 uppercase tracking-wide">
              {{ t('planner.lessFat') }} {{ Math.round((diffFat / activeUnhealthy.fat) * 100) }}%
            </span>
          </div>
        </div>
      </Card>

      <!-- Today's healthy menu list -->
      <div>
        <h3 class="font-extrabold text-secondary text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
          <ShieldCheck class="w-5 h-5 text-emerald-500" />
          {{ t('planner.recommendationsTitle') }}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card padding="p-5" class="bg-white border border-slate-100 flex items-start gap-4 shadow-soft transition-transform duration-300 hover:translate-y-[-2px]">
            <div class="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100 flex items-center justify-center text-2xl">
              🍳
            </div>
            <div>
              <span class="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full tracking-wider">Breakfast</span>
              <h4 class="font-black text-secondary text-base mt-1.5">Oatmeal Pisang & Almond</h4>
              <p class="text-xs text-text-muted mt-1 leading-relaxed font-medium">Bahan oat serat tinggi yang lambat dicerna membantu menjaga pelepasan energi stabil sepanjang hari tanpa lonjakan gula.</p>
              <div class="mt-3 flex gap-4 text-[10px] font-black text-text-muted uppercase">
                <span>🔥 320 kcal</span>
                <span>💪 10g Prot</span>
                <span>🍉 14g Gula</span>
              </div>
            </div>
          </Card>

          <Card padding="p-5" class="bg-white border border-slate-100 flex items-start gap-4 shadow-soft transition-transform duration-300 hover:translate-y-[-2px]">
            <div class="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100 flex items-center justify-center text-2xl">
              🍗
            </div>
            <div>
              <span class="text-[9px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full tracking-wider">Lunch</span>
              <h4 class="font-black text-secondary text-base mt-1.5">Nasi Merah & Dada Ayam Panggang</h4>
              <p class="text-xs text-text-muted mt-1 leading-relaxed font-medium">Pilihan kaya protein tinggi dengan rendah lemak jenuh. Menyediakan nutrisi krusial untuk perbaikan jaringan dan pembentukan otot.</p>
              <div class="mt-3 flex gap-4 text-[10px] font-black text-text-muted uppercase">
                <span>🔥 420 kcal</span>
                <span>💪 34g Prot</span>
                <span>🍉 2g Gula</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

    </div>

    <!-- TAB 2: AI MEAL PLAN GENERATOR -->
    <div v-else class="animate-in fade-in duration-300">
      
      <!-- GENERATING SCREEN -->
      <div v-if="isGenerating" class="flex flex-col items-center justify-center py-16 text-center">
        <div class="w-24 h-24 rounded-full border-4 border-slate-100 border-t-primary animate-spin mb-8 flex items-center justify-center text-3xl">
          🔮
        </div>
        <h3 class="text-xl font-black text-secondary mb-2">{{ t('planner.generating') }}</h3>
        
        <!-- Glowing animated progress bar -->
        <div class="w-64 h-3 bg-slate-100 rounded-full overflow-hidden mb-8 border border-slate-200">
          <div class="h-full bg-primary transition-all duration-300 shadow-[0_0_8px_#22C55E]" :style="{ width: `${genProgress}%` }"></div>
        </div>

        <div class="space-y-2.5 max-w-sm">
          <p class="text-sm font-extrabold text-secondary flex items-center justify-center gap-2" :class="genStep >= 1 ? 'opacity-100' : 'opacity-30'">
            <CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0" v-if="genStep > 1" />
            <span v-else class="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
            {{ t('planner.genStep1') }}
          </p>
          <p class="text-sm font-extrabold text-secondary flex items-center justify-center gap-2" :class="genStep >= 2 ? 'opacity-100' : 'opacity-30'">
            <CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0" v-if="genStep > 2" />
            <span v-else-if="genStep === 2" class="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
            {{ t('planner.genStep2') }}
          </p>
          <p class="text-sm font-extrabold text-secondary flex items-center justify-center gap-2" :class="genStep >= 3 ? 'opacity-100' : 'opacity-30'">
            <CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0" v-if="genStep > 3" />
            <span v-else-if="genStep === 3" class="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
            {{ t('planner.genStep3') }}
          </p>
          <p class="text-sm font-extrabold text-secondary flex items-center justify-center gap-2" :class="genStep >= 4 ? 'opacity-100' : 'opacity-30'">
            <span v-if="genStep === 4" class="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
            {{ t('planner.genStep4') }}
          </p>
        </div>
      </div>

      <!-- FORM PARAMETERS INTAKE -->
      <div v-else-if="!plannerStore.generatedPlan" class="max-w-2xl mx-auto space-y-6">
        <Card padding="p-6" class="bg-white border border-slate-100 shadow-soft">
          <h3 class="font-extrabold text-secondary text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
            <Calendar class="w-5 h-5 text-primary" />
            {{ t('planner.formTitle') }}
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <!-- Schedule type -->
            <div>
              <label class="text-[10px] font-black text-text-muted uppercase tracking-wider block mb-2">{{ t('planner.labelSchedule') }}</label>
              <div class="grid grid-cols-2 gap-2.5">
                <button 
                  @click="planSchedule = 'weekly'"
                  class="py-3 px-4 rounded-2xl text-xs font-black border-2 transition-all duration-300"
                  :class="planSchedule === 'weekly' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 text-text-muted hover:border-slate-200'"
                >
                  {{ t('planner.optWeekly') }}
                </button>
                <button 
                  @click="planSchedule = 'daily'"
                  class="py-3 px-4 rounded-2xl text-xs font-black border-2 transition-all duration-300"
                  :class="planSchedule === 'daily' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 text-text-muted hover:border-slate-200'"
                >
                  {{ t('planner.optDaily') }}
                </button>
              </div>
            </div>

            <!-- Budget Level -->
            <div>
              <label class="text-[10px] font-black text-text-muted uppercase tracking-wider block mb-2">{{ t('planner.labelBudget') }}</label>
              <div class="grid grid-cols-2 gap-2.5">
                <button 
                  @click="planBudget = 'economical'"
                  class="py-3 px-4 rounded-2xl text-xs font-black border-2 transition-all duration-300"
                  :class="planBudget === 'economical' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 text-text-muted hover:border-slate-200'"
                >
                  {{ t('planner.optEco') }}
                </button>
                <button 
                  @click="planBudget = 'normal'"
                  class="py-3 px-4 rounded-2xl text-xs font-black border-2 transition-all duration-300"
                  :class="planBudget === 'normal' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 text-text-muted hover:border-slate-200'"
                >
                  {{ t('planner.optNormal') }}
                </button>
              </div>
            </div>

            <!-- Focus Level -->
            <div>
              <label class="text-[10px] font-black text-text-muted uppercase tracking-wider block mb-2">{{ t('planner.labelFocus') }}</label>
              <select 
                v-model="planFocus"
                class="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-bold text-secondary focus:border-primary focus:outline-none transition-colors"
              >
                <option value="balanced">{{ t('planner.optBalanced') }}</option>
                <option value="high_protein">{{ t('planner.optProtein') }}</option>
                <option value="low_sugar">{{ t('planner.optSugar') }}</option>
              </select>
            </div>

            <!-- Diet level -->
            <div>
              <label class="text-[10px] font-black text-text-muted uppercase tracking-wider block mb-2">{{ t('planner.labelDiet') }}</label>
              <select 
                v-model="planDiet"
                class="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-bold text-secondary focus:border-primary focus:outline-none transition-colors"
              >
                <option value="general">{{ t('planner.optGeneral') }}</option>
                <option value="keto">{{ t('planner.optKeto') }}</option>
                <option value="vegetarian">{{ t('planner.optVeg') }}</option>
                <option value="diabetic">{{ t('planner.optDiabetic') }}</option>
              </select>
            </div>
          </div>

          <Button 
            @click="generatePlan"
            class="w-full py-4 text-sm font-extrabold flex items-center justify-center gap-2 group shadow-md"
          >
            <Sparkles class="w-5 h-5 group-hover:animate-pulse" />
            {{ t('planner.btnGenerate') }}
          </Button>
        </Card>
      </div>

      <!-- DISPLAY GENERATED MEAL PLAN RESULTS -->
      <div v-else class="space-y-8 max-w-5xl mx-auto">
        <!-- Result actions header -->
        <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
          <div>
            <h3 class="font-extrabold text-secondary text-sm uppercase tracking-wider">
              {{ planSchedule === 'weekly' ? t('planner.weeklyMeals') : (locale === 'id' ? 'Rencana Makan Harian Anda' : 'Your Daily Meal Plan') }}
            </h3>
            <div class="mt-1 flex items-center gap-2.5 flex-wrap">
              <span class="text-[10px] font-black bg-primary/10 text-primary px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {{ planDiet }}
              </span>
              <span class="text-[10px] font-black bg-orange-500/10 text-orange-600 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {{ planFocus }}
              </span>
              <span class="text-[10px] font-black bg-slate-200 text-secondary px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {{ planBudget }}
              </span>
            </div>
          </div>
          <Button @click="clearActivePlan" variant="outline" class="border-2 font-black border-slate-200 text-secondary py-2.5 flex items-center justify-center gap-1.5">
            <RotateCcw class="w-4 h-4" />
            {{ t('planner.btnRegenerate') }}
          </Button>
        </div>

        <!-- Weekly calendar grid cards -->
        <div class="space-y-4">
          <div 
            v-for="dayPlan in plannerStore.generatedPlan" 
            :key="dayPlan.day"
            class="p-5 bg-white border border-slate-100 shadow-soft rounded-3xl"
          >
            <h4 class="font-black text-secondary text-sm uppercase tracking-wide pb-3 border-b border-slate-50 mb-4 flex items-center gap-2 text-primary">
              <Calendar class="w-4 h-4" />
              {{ dayPlan.day }}
            </h4>
            
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <!-- Breakfast -->
              <div class="p-3 bg-slate-50/50 rounded-2xl border border-slate-100/40">
                <span class="text-[9px] font-black text-primary uppercase tracking-wide">🍳 Breakfast</span>
                <p class="text-xs font-black text-secondary mt-1.5">{{ dayPlan.breakfast.name }}</p>
                <span class="text-[9px] font-extrabold text-text-muted uppercase block mt-1.5">🔥 {{ dayPlan.breakfast.calories }} kcal | 💪 {{ dayPlan.breakfast.protein }}g P</span>
              </div>

              <!-- Lunch -->
              <div class="p-3 bg-slate-50/50 rounded-2xl border border-slate-100/40">
                <span class="text-[9px] font-black text-blue-600 uppercase tracking-wide">🍱 Lunch</span>
                <p class="text-xs font-black text-secondary mt-1.5">{{ dayPlan.lunch.name }}</p>
                <span class="text-[9px] font-extrabold text-text-muted uppercase block mt-1.5">🔥 {{ dayPlan.lunch.calories }} kcal | 💪 {{ dayPlan.lunch.protein }}g P</span>
              </div>

              <!-- Dinner -->
              <div class="p-3 bg-slate-50/50 rounded-2xl border border-slate-100/40">
                <span class="text-[9px] font-black text-indigo-600 uppercase tracking-wide">🍲 Dinner</span>
                <p class="text-xs font-black text-secondary mt-1.5">{{ dayPlan.dinner.name }}</p>
                <span class="text-[9px] font-extrabold text-text-muted uppercase block mt-1.5">🔥 {{ dayPlan.dinner.calories }} kcal | 💪 {{ dayPlan.dinner.protein }}g P</span>
              </div>

              <!-- Snack -->
              <div class="p-3 bg-slate-50/50 rounded-2xl border border-slate-100/40">
                <span class="text-[9px] font-black text-amber-600 uppercase tracking-wide">🥜 Snack</span>
                <p class="text-xs font-black text-secondary mt-1.5">{{ dayPlan.snack.name }}</p>
                <span class="text-[9px] font-extrabold text-text-muted uppercase block mt-1.5">🔥 {{ dayPlan.snack.calories }} kcal | 💪 {{ dayPlan.snack.protein }}g P</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Dynamic Smart Grocery Shopping List Card -->
        <Card padding="p-6" class="bg-gradient-to-br from-white to-primary-50/20 border border-primary-100 shadow-soft">
          <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 border-b border-primary-100/50 pb-4">
            <div class="flex items-center gap-2">
              <ShoppingBag class="text-primary w-5.5 h-5.5" />
              <h3 class="font-extrabold text-secondary text-base">{{ t('planner.groceryList') }}</h3>
            </div>
            <div class="flex items-center gap-1.5 bg-primary/10 text-primary px-3.5 py-1.5 rounded-2xl text-xs font-black">
              <DollarSign class="w-4 h-4 shrink-0" />
              <span>{{ t('planner.budgetEstimate') }} {{ groceryBudgetEstimate }}</span>
            </div>
          </div>

          <div class="divide-y divide-slate-100">
            <div 
              v-for="item in smartGroceryList" 
              :key="item.name"
              class="py-3 flex justify-between items-center text-xs"
            >
              <div class="flex items-center gap-3">
                <div class="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></div>
                <span class="font-bold text-secondary">{{ item.name }}</span>
              </div>
              <div class="flex items-center gap-4">
                <span class="font-bold text-text-muted bg-slate-100 px-2 py-0.5 rounded-md text-[10px]">{{ item.qty }}</span>
                <span class="font-black text-secondary">{{ item.price }}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

    </div>
  </div>
</template>
