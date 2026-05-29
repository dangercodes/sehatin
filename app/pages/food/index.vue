<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useHealthStore } from '~/stores/health'
import { useI18n } from '#imports'
import { Utensils, Search, Flame, Trash2 } from '@lucide/vue'
import Card from '~/components/ui/Card.vue'
import Button from '~/components/ui/Button.vue'

const healthStore = useHealthStore()
const { t, locale } = useI18n()

onMounted(() => {
  healthStore.fetchTodayData()
})

const categories = ['Breakfast', 'Lunch', 'Dinner', 'Snack']

const getMealsByCategory = (category: string) => {
  return healthStore.recentMeals.filter(m => m.category === category)
}

const getCategoryLabel = (category: string) => {
  if (category === 'Breakfast') return locale.value === 'id' ? 'Sarapan (Breakfast)' : 'Breakfast'
  if (category === 'Lunch') return locale.value === 'id' ? 'Makan Siang (Lunch)' : 'Lunch'
  if (category === 'Dinner') return locale.value === 'id' ? 'Makan Malam (Dinner)' : 'Dinner'
  return locale.value === 'id' ? 'Camilan (Snack)' : 'Snack'
}

// Custom Delete Modal State
const showDeleteModal = ref(false)
const mealToDeleteId = ref<string | null>(null)
const deletingMeal = ref(false)

const requestDeleteMeal = (id: string) => {
  mealToDeleteId.value = id
  showDeleteModal.value = true
}

const confirmDeleteMeal = async () => {
  if (!mealToDeleteId.value) return
  deletingMeal.value = true
  try {
    await healthStore.deleteMeal(mealToDeleteId.value)
    showDeleteModal.value = false
    mealToDeleteId.value = null
  } catch (e) {
    console.error(e)
  } finally {
    deletingMeal.value = false
  }
}
</script>

<template>
  <div class="px-6 py-8 pb-32 md:pb-8">
    <header class="mb-6 flex justify-between items-end">
      <div>
        <h1 class="text-2xl font-bold text-secondary">{{ t('food.title') }}</h1>
        <p class="text-text-muted text-sm mt-1">{{ t('food.subtitle') }}</p>
      </div>
      <!-- Desktop Add Button -->
      <NuxtLink to="/food/add" class="hidden md:flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary-600 transition-colors shadow-sm active:scale-95">
        <Search class="w-4 h-4" />
        {{ t('food.btnLog') }}
      </NuxtLink>
    </header>

    <div class="mb-8 md:hidden">
      <NuxtLink to="/food/add">
        <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex items-center gap-3 text-text-muted shadow-sm hover:shadow-md transition-shadow">
          <Search class="w-5 h-5 text-slate-400" />
          <span class="text-sm font-medium">{{ t('food.searchPlaceholder') }}</span>
        </div>
      </NuxtLink>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
      <div v-for="category in categories" :key="category" class="bg-transparent  md:border-none p-4 md:p-0 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm md:shadow-none">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-secondary text-sm uppercase tracking-wider">{{ getCategoryLabel(category) }}</h3>
          <span class="text-xs font-bold text-primary bg-primary-50 dark:bg-slate-800/50 px-2 py-1 rounded-lg">
            {{ getMealsByCategory(category).reduce((acc, curr) => acc + curr.calories, 0) }} kcal
          </span>
        </div>
        
        <div class="space-y-3">
          <Card 
            v-for="meal in getMealsByCategory(category)" 
            :key="meal.id"
            padding="p-4" 
            class="flex items-center justify-between shadow-sm hover:border-primary/30 transition-colors cursor-pointer bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
          >
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 shrink-0 border border-orange-100/50 shadow-inner">
                <Utensils class="w-5 h-5" />
              </div>
              <div>
                <h4 class="font-bold text-secondary text-sm line-clamp-1">{{ meal.name }}</h4>
                <p class="text-[10px] text-text-muted font-medium mt-0.5">{{ meal.time }}</p>
              </div>
            </div>
            
            <div class="flex items-center gap-3 shrink-0">
              <div class="flex items-center gap-1 font-extrabold text-secondary text-sm">
                {{ meal.calories }}
                <Flame class="w-3.5 h-3.5 text-orange-500" />
              </div>
              <button 
                @click.stop="requestDeleteMeal(meal.id)" 
                class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300 active:scale-95 flex items-center justify-center border border-transparent hover:border-red-100"
                title="Hapus Makanan"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </Card>

          <!-- Empty State -->
          <div v-if="getMealsByCategory(category).length === 0" class="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-center text-text-muted bg-white dark:bg-slate-800/50">
            <Utensils class="w-6 h-6 mb-2 opacity-40 text-slate-400" />
            <p class="text-xs font-semibold text-slate-400">{{ t('food.empty') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Custom Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div class="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative border border-slate-100 dark:border-slate-700 flex flex-col animate-in zoom-in-95 duration-300">
        <div class="w-14 h-14 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100 dark:border-red-800/50 shadow-md shadow-red-100/50 dark:shadow-none">
          <Trash2 class="w-7 h-7 text-red-500" />
        </div>
        
        <h3 class="text-lg font-bold text-secondary text-center mb-1">
          {{ t('food.deleteTitle') }}
        </h3>
        <p class="text-xs text-text-muted text-center mb-6 leading-relaxed">
          {{ t('food.deleteDesc') }}
        </p>

        <div class="flex gap-3">
          <Button variant="outline" class="flex-1 border-slate-200 dark:border-slate-700 text-secondary hover:bg-slate-50 dark:hover:bg-slate-700 font-bold" @click="showDeleteModal = false">
            {{ t('food.btnCancel') }}
          </Button>
          <Button type="button" class="flex-1 bg-red-500 text-white hover:bg-red-600 shadow-soft hover:shadow-red-500/20 active:scale-95 font-bold border border-transparent" :loading="deletingMeal" @click="confirmDeleteMeal">
            {{ t('food.btnDelete') }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
