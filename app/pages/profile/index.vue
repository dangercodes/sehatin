<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useUserStore } from '~/stores/user'
import { usePlannerStore } from '~/stores/planner'
import { useI18n } from '#imports'
import { 
  Settings, Moon, ChevronRight, LogOut, Bell, CircleUserRound, 
  Globe, X, Clock, Check, Volume2
} from '@lucide/vue'
import Card from '~/components/ui/Card.vue'
import Button from '~/components/ui/Button.vue'
import LanguageSwitcher from '~/components/widgets/LanguageSwitcher.vue'

const userStore = useUserStore()
const plannerStore = usePlannerStore()
const { t } = useI18n()

onMounted(() => {
  userStore.fetchProfile()
  plannerStore.initializeStore()
})

const showRemindersModal = ref(false)

const remindersCopy = ref({
  breakfast: true,
  breakfastTime: '08:00',
  lunch: true,
  lunchTime: '12:30',
  dinner: true,
  dinnerTime: '19:00',
  water: true,
  waterIntervalHours: 2,
  weight: true,
  weightTime: '07:30'
})

const openRemindersModal = () => {
  remindersCopy.value = {
    breakfast: plannerStore.reminders.breakfast,
    breakfastTime: plannerStore.reminders.breakfastTime,
    lunch: plannerStore.reminders.lunch,
    lunchTime: plannerStore.reminders.lunchTime,
    dinner: plannerStore.reminders.dinner,
    dinnerTime: plannerStore.reminders.dinnerTime,
    water: plannerStore.reminders.water,
    waterIntervalHours: plannerStore.reminders.waterIntervalHours,
    weight: plannerStore.reminders.weight,
    weightTime: plannerStore.reminders.weightTime
  }
  showRemindersModal.value = true
}

const saveRemindersConfig = () => {
  plannerStore.saveReminders(remindersCopy.value)
  showRemindersModal.value = false
}

const handleTestNotification = async () => {
  const granted = await plannerStore.requestNotificationPermission()
  if (granted) {
    plannerStore.triggerNotification(t('reminders.notifTitle'), t('reminders.notifBody'))
  } else {
    alert(t('reminders.alertBlocked'))
  }
}

const menuItems = computed(() => [
  { name: t('profile.edit'), icon: CircleUserRound, color: 'text-blue-500', bg: 'bg-blue-50' },
  { name: t('profile.notifications'), icon: Bell, color: 'text-purple-500', bg: 'bg-purple-50', action: openRemindersModal },
  { name: t('profile.darkMode'), icon: Moon, color: 'text-slate-700', bg: 'bg-slate-100', action: () => userStore.toggleTheme() },
  { name: t('profile.settings'), icon: Settings, color: 'text-slate-500', bg: 'bg-slate-100' },
])
</script>

<template>
  <div class="px-6 py-8 pb-32 md:pb-8">
    <div class="w-full">
      <h1 class="text-2xl font-bold text-secondary mb-6">
        {{ t('profile.title') }}
      </h1>

      <div class="flex flex-col items-center mb-8">
        <div class="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-soft mb-4">
          <img :src="userStore.avatar" alt="User Avatar" class="w-full h-full object-cover bg-slate-100" />
        </div>
        <h2 class="text-xl font-bold text-secondary">{{ userStore.name }}</h2>
        <p class="text-sm text-text-muted">{{ userStore.email }}</p>
      </div>

      <Card padding="p-0" class="overflow-hidden mb-6 bg-white border border-slate-100 shadow-soft">
        <!-- Language Switcher Row inside Card -->
        <div class="flex items-center justify-between p-4 border-b border-slate-100">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600 shrink-0">
              <Globe class="w-5 h-5" />
            </div>
            <span class="font-bold text-secondary text-sm">{{ t('common.language') }}</span>
          </div>
          <LanguageSwitcher />
        </div>

        <div 
          v-for="(item, index) in menuItems" 
          :key="item.name"
          @click="item.action ? item.action() : null"
          class="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
          :class="index !== menuItems.length - 1 ? 'border-b border-slate-100' : ''"
        >
          <div class="flex items-center gap-4">
            <div :class="['w-10 h-10 rounded-xl flex items-center justify-center shrink-0', item.bg, item.color]">
              <component :is="item.icon" class="w-5 h-5" />
            </div>
            <span class="font-bold text-secondary text-sm">{{ item.name }}</span>
          </div>
          <ChevronRight class="w-5 h-5 text-slate-300" />
        </div>
      </Card>

      <button @click="userStore.logout()" class="md:hidden w-full flex items-center justify-center gap-2 p-4 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-colors mt-4">
        <LogOut class="w-5 h-5" />
        {{ t('profile.logout') }}
      </button>
    </div>

    <!-- REMINDERS MODAL DIALOG -->
    <div 
      v-if="showRemindersModal" 
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-300"
    >
      <div 
        class="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300"
      >
        <!-- Modal Header -->
        <div class="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div class="flex items-center gap-2">
            <Bell class="text-purple-600 w-5 h-5" />
            <h3 class="font-black text-secondary text-sm uppercase tracking-wider">{{ t('reminders.title') }}</h3>
          </div>
          <button @click="showRemindersModal = false" class="text-slate-400 hover:text-secondary hover:bg-slate-200 p-1.5 rounded-full transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal Scrollable Content -->
        <div class="p-6 overflow-y-auto space-y-6 flex-1">
          <p class="text-xs text-text-muted leading-relaxed font-semibold mb-2">{{ t('reminders.desc') }}</p>

          <div class="space-y-4">
            
            <!-- Breakfast Reminder -->
            <div class="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/30">
              <div>
                <span class="text-xs font-black text-secondary block">{{ t('reminders.breakfast') }}</span>
                <div v-if="remindersCopy.breakfast" class="flex items-center gap-1.5 mt-1 text-[10px] text-text-muted font-bold uppercase">
                  <Clock class="w-3.5 h-3.5 text-purple-600" />
                  <span>{{ t('reminders.timeLabel') }}</span>
                  <input type="time" v-model="remindersCopy.breakfastTime" class="bg-white border border-slate-200 rounded px-1 text-secondary font-black focus:outline-none focus:border-primary" />
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="remindersCopy.breakfast" class="sr-only peer" />
                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <!-- Lunch Reminder -->
            <div class="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/30">
              <div>
                <span class="text-xs font-black text-secondary block">{{ t('reminders.lunch') }}</span>
                <div v-if="remindersCopy.lunch" class="flex items-center gap-1.5 mt-1 text-[10px] text-text-muted font-bold uppercase">
                  <Clock class="w-3.5 h-3.5 text-purple-600" />
                  <span>{{ t('reminders.timeLabel') }}</span>
                  <input type="time" v-model="remindersCopy.lunchTime" class="bg-white border border-slate-200 rounded px-1 text-secondary font-black focus:outline-none focus:border-primary" />
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="remindersCopy.lunch" class="sr-only peer" />
                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <!-- Dinner Reminder -->
            <div class="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/30">
              <div>
                <span class="text-xs font-black text-secondary block">{{ t('reminders.dinner') }}</span>
                <div v-if="remindersCopy.dinner" class="flex items-center gap-1.5 mt-1 text-[10px] text-text-muted font-bold uppercase">
                  <Clock class="w-3.5 h-3.5 text-purple-600" />
                  <span>{{ t('reminders.timeLabel') }}</span>
                  <input type="time" v-model="remindersCopy.dinnerTime" class="bg-white border border-slate-200 rounded px-1 text-secondary font-black focus:outline-none focus:border-primary" />
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="remindersCopy.dinner" class="sr-only peer" />
                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <!-- Hydration Reminder -->
            <div class="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/30">
              <div>
                <span class="text-xs font-black text-secondary block">{{ t('reminders.water') }}</span>
                <div v-if="remindersCopy.water" class="flex items-center gap-1.5 mt-1 text-[10px] text-text-muted font-bold uppercase">
                  <Clock class="w-3.5 h-3.5 text-purple-600" />
                  <span>{{ t('reminders.intervalLabel') }}</span>
                  <select v-model="remindersCopy.waterIntervalHours" class="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-secondary font-black focus:outline-none">
                    <option :value="1">{{ t('reminders.hours', { n: 1 }) }}</option>
                    <option :value="2">{{ t('reminders.hours', { n: 2 }) }}</option>
                    <option :value="3">{{ t('reminders.hours', { n: 3 }) }}</option>
                  </select>
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="remindersCopy.water" class="sr-only peer" />
                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <!-- Weight Reminder -->
            <div class="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/30">
              <div>
                <span class="text-xs font-black text-secondary block">{{ t('reminders.weight') }}</span>
                <div v-if="remindersCopy.weight" class="flex items-center gap-1.5 mt-1 text-[10px] text-text-muted font-bold uppercase">
                  <Clock class="w-3.5 h-3.5 text-purple-600" />
                  <span>{{ t('reminders.timeLabel') }}</span>
                  <input type="time" v-model="remindersCopy.weightTime" class="bg-white border border-slate-200 rounded px-1 text-secondary font-black focus:outline-none focus:border-primary" />
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="remindersCopy.weight" class="sr-only peer" />
                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

          </div>

          <!-- Notification Permission & Test alert -->
          <button 
            @click="handleTestNotification"
            class="w-full mt-2 py-3 bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200/50 rounded-2xl text-xs font-black uppercase flex items-center justify-center gap-2 transition-colors active:scale-95"
          >
            <Volume2 class="w-4.5 h-4.5" />
            {{ t('reminders.testBtn') }}
          </button>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 border-t border-slate-100 flex justify-end gap-3.5 bg-slate-50">
          <Button @click="showRemindersModal = false" variant="outline" class="border-2 font-black border-slate-200 text-secondary py-2.5">
            {{ t('common.cancel') }}
          </Button>
          <Button @click="saveRemindersConfig" class="font-extrabold py-2.5 flex items-center gap-1.5">
            <Check class="w-4 h-4" />
            {{ t('common.save') }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
