<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { 
  Sparkles, Send, Trash2, ArrowLeft, RefreshCw, 
  ChevronRight, BrainCircuit, UserCheck, Flame, Droplets, Scale
} from '@lucide/vue'
import { useHealthStore } from '~/stores/health'
import { useUserStore } from '~/stores/user'
import { useI18n, useRouter } from '#imports'
import Card from '~/components/ui/Card.vue'
import Button from '~/components/ui/Button.vue'

interface ChatMessage {
  id: string
  sender: 'user' | 'coach'
  text: string
  timestamp: string
}

const healthStore = useHealthStore()
const userStore = useUserStore()
const router = useRouter()
const { t } = useI18n()

// Chat State
const messages = ref<ChatMessage[]>([])
const inputText = ref('')
const isTyping = ref(false)
const inputDisabled = ref(false)

// Quick Start Suggestion Chips
const suggestions = [
  { textKey: 'coach.suggestEval', prompt: 'Tolong berikan evaluasi pola makanku hari ini berdasarkan log kalori dan makro aktifku.' },
  { textKey: 'coach.suggestAdvice', prompt: 'Saya ingin menurunkan berat badan secara sehat. Berikan saran diet yang cocok dengan profil langkah kaki harian dan berat badanku.' },
  { textKey: 'coach.suggestRecipe', prompt: 'Tolong berikan rekomendasi resep makan siang tinggi protein yang mudah dibuat, lezat, dan ramah kantong.' }
]

onMounted(async () => {
  await healthStore.fetchTodayData()
  await userStore.fetchProfile()

  // Load chat session if persists in sessionStorage
  if (typeof window !== 'undefined') {
    const saved = sessionStorage.getItem('sehatin_coach_session')
    if (saved) {
      try {
        messages.value = JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse saved chat session', e)
      }
    }
  }

  // Scroll to bottom
  scrollToBottom()
})

const saveSession = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('sehatin_coach_session', JSON.stringify(messages.value))
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    const container = document.getElementById('coach-chat-scroll')
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  })
}

// Sending messages
const handleSend = async (customPrompt?: string) => {
  const prompt = customPrompt || inputText.value.trim()
  if (!prompt || isTyping.value) return

  // Reset text input
  if (!customPrompt) {
    inputText.value = ''
  }

  // Add user message
  const userMsg: ChatMessage = {
    id: `u-${Date.now()}`,
    sender: 'user',
    text: prompt,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  messages.value.push(userMsg)
  saveSession()
  scrollToBottom()

  // Set typing indicator
  isTyping.value = true
  inputDisabled.value = true

  try {
    // Format message history according to Gemini REST API expectations
    const formattedHistory = messages.value.map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }))

    // Construct precise user physical & log metrics context
    const userStats = {
      name: userStore.name,
      weight: healthStore.currentWeight,
      height: healthStore.height,
      goalWeight: healthStore.goalWeight,
      todaySteps: healthStore.steps,
      todayWater: healthStore.consumedWater,
      todayCalories: healthStore.consumedCalories,
      todayProtein: healthStore.macros.protein.current,
      todayCarbs: healthStore.macros.carbs.current,
      todayFat: healthStore.macros.fat.current,
      todaySugar: healthStore.macros.sugar.current,
      goalCalories: healthStore.dailyGoalCalories,
      goalWater: healthStore.dailyGoalWater
    }

    // Call server endpoint
    const response: any = await $fetch('/api/coach', {
      method: 'POST',
      body: {
        messages: formattedHistory,
        userStats
      }
    })

    // Add Coach message
    const coachMsg: ChatMessage = {
      id: `c-${Date.now()}`,
      sender: 'coach',
      text: response?.message || 'Maaf, saya tidak dapat merumuskan jawaban saat ini.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    messages.value.push(coachMsg)
    saveSession()
  } catch (err: any) {
    console.error('Failed to communicate with AI Coach:', err)
    const errMsg: ChatMessage = {
      id: `err-${Date.now()}`,
      sender: 'coach',
      text: t('coach.errorFetch'),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    messages.value.push(errMsg)
  } finally {
    isTyping.value = false
    inputDisabled.value = false
    scrollToBottom()
  }
}

// Reset chat history
const handleClearChat = () => {
  messages.value = []
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('sehatin_coach_session')
  }
}

const handleGoBack = () => {
  router.push('/dashboard')
}

// Simple Helper to replace text URLs with active markup anchors
const formatMarkdown = (text: string) => {
  // Simple bullet replacement and bold markup replacements for rich aesthetics
  let formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-rose-600 px-1 py-0.5 rounded text-xs">$1</code>')
    .replace(/\n/g, '<br />')
  return formatted
}
</script>

<template>
  <div class="flex flex-col h-[94vh] bg-slate-50 relative overflow-hidden">
    
    <!-- Top Nav Header -->
    <header class="bg-transparent border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-10">
      <div class="flex items-center gap-3">
        <button 
          @click="handleGoBack"
          class="w-10 h-10 rounded-full hover:bg-slate-100 text-slate-500 transition-colors flex items-center justify-center"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-md shadow-violet-500/20">
            <BrainCircuit class="w-5.5 h-5.5 animate-pulse" />
          </div>
          <div>
            <h1 class="text-sm font-black text-secondary leading-tight">{{ t('coach.title') }}</h1>
            <span class="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Online • Smart Coach</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Action: Clear Chat -->
      <button 
        v-if="messages.length > 0"
        @click="handleClearChat"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors text-[10px] font-black uppercase tracking-wide select-none active:scale-95"
      >
        <Trash2 class="w-3.5 h-3.5" />
        <span>{{ t('coach.resetChat') }}</span>
      </button>
    </header>

    <!-- Main Chat Window Scroll Container -->
    <div 
      id="coach-chat-scroll"
      class="flex-1 overflow-y-auto px-5 py-6 space-y-5 pb-32 md:pb-8 flex flex-col"
    >
      
      <!-- Welcome Message & suggestion Chips (Shown only if no messages present) -->
      <div v-if="messages.length === 0" class="max-w-xl mx-auto my-auto space-y-6 text-center animate-in zoom-in-95 duration-500">
        
        <!-- Large animated logo -->
        <div class="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-600/20 relative">
          <Sparkles class="w-10 h-10 animate-bounce" style="animation-duration: 3s;" />
          <div class="absolute -inset-2 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-[2.2rem] blur-xl opacity-30 -z-10 animate-pulse"></div>
        </div>

        <div class="space-y-2">
          <h2 class="text-lg font-black text-secondary">{{ t('coach.welcomeTitle') }}</h2>
          <p class="text-xs text-text-muted leading-relaxed font-semibold max-w-sm mx-auto">
            {{ t('coach.welcomeBody') }}
          </p>
        </div>

        <!-- Suggestion Chips -->
        <div class="space-y-3 max-w-md mx-auto pt-4">
          <h4 class="text-[10px] font-black text-text-muted uppercase tracking-wider text-left pl-2">
            {{ t('coach.suggestTitle') }}
          </h4>
          <button 
            v-for="(sug, idx) in suggestions" 
            :key="idx"
            @click="handleSend(sug.prompt)"
            class="w-full text-left p-4 rounded-3xl border border-slate-100 hover:border-violet-300 hover:bg-violet-500/[0.02] bg-white transition-all flex items-start justify-between group active:scale-98 shadow-sm"
          >
            <span class="text-xs text-secondary font-bold group-hover:text-violet-600 leading-snug">
              {{ t(sug.textKey) }}
            </span>
            <ChevronRight class="w-4.5 h-4.5 text-slate-400 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
          </button>
        </div>
      </div>

      <!-- Active Message Bubble Stream list -->
      <div 
        v-else 
        v-for="msg in messages" 
        :key="msg.id"
        class="flex items-start gap-3.5 max-w-[85%]"
        :class="msg.sender === 'user' ? 'ml-auto flex-row-reverse text-right' : ''"
      >
        <!-- Avatar indicator -->
        <div 
          class="w-8 h-8 rounded-full border flex items-center justify-center shrink-0 select-none shadow-sm"
          :class="msg.sender === 'user' 
            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
            : 'bg-violet-50 text-violet-600 border-violet-100'"
        >
          <UserCheck v-if="msg.sender === 'user'" class="w-4.5 h-4.5" />
          <BrainCircuit v-else class="w-4.5 h-4.5" />
        </div>

        <!-- Message Block -->
        <div class="space-y-1">
          <div class="flex items-center gap-2" :class="msg.sender === 'user' ? 'flex-row-reverse' : ''">
            <span class="text-[10px] font-black text-secondary">
              {{ msg.sender === 'user' ? (userStore.name ? userStore.name.split(' ')[0] : 'Me') : 'Coach AI' }}
            </span>
            <span class="text-[8px] text-text-muted font-semibold">{{ msg.timestamp }}</span>
          </div>
          
          <Card 
            padding="p-4" 
            class="text-xs font-semibold leading-relaxed rounded-[2rem] shadow-soft"
            :class="msg.sender === 'user'
              ? 'bg-gradient-to-br from-violet-600 to-indigo-700 text-white rounded-tr-none text-left'
              : 'bg-white text-secondary border border-slate-100 rounded-tl-none'"
          >
            <!-- Formatted HTML to support rich markdown -->
            <div v-html="formatMarkdown(msg.text)" class="prose-chat whitespace-pre-line"></div>
          </Card>
        </div>
      </div>

      <!-- Coach Typing Anim Bubble Loader -->
      <div v-if="isTyping" class="flex items-start gap-3.5 max-w-[85%] animate-in fade-in duration-300">
        <div class="w-8 h-8 rounded-full border bg-violet-50 text-violet-600 border-violet-100 flex items-center justify-center shrink-0 select-none shadow-sm">
          <BrainCircuit class="w-4.5 h-4.5 animate-spin" style="animation-duration: 4s;" />
        </div>
        <div class="space-y-1">
          <span class="text-[10px] font-black text-secondary block">{{ t('coach.statusTyping') }}</span>
          <div class="bg-white border border-slate-100 rounded-[2rem] rounded-tl-none p-4 flex gap-1 items-center shadow-soft">
            <div class="w-2.5 h-2.5 bg-violet-600 rounded-full animate-bounce" style="animation-delay: 0ms;"></div>
            <div class="w-2.5 h-2.5 bg-violet-600 rounded-full animate-bounce" style="animation-delay: 150ms;"></div>
            <div class="w-2.5 h-2.5 bg-violet-600 rounded-full animate-bounce" style="animation-delay: 300ms;"></div>
          </div>
        </div>
      </div>

    </div>

    <!-- Bottom Message Input Console Container -->
    <div class="fixed bottom-0 inset-x-0 bg-gradient-to-t from-slate-50 dark:from-slate-900 via-slate-50/95 dark:via-slate-900/95 to-transparent px-5 py-4 pb-8 shrink-0 md:relative md:bg-white md:border-t md:border-slate-100 md:pb-6 z-10">
      <div class="max-w-3xl mx-auto flex items-center gap-2">
        <input 
          v-model="inputText"
          @keydown.enter="handleSend()"
          :disabled="inputDisabled"
          :placeholder="t('coach.inputPlaceholder')"
          class="flex-1 bg-white border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all rounded-full px-5 py-3.5 text-xs text-secondary font-bold placeholder-slate-400 outline-none shadow-md"
        />
        <button 
          @click="handleSend()"
          :disabled="inputDisabled || !inputText.trim()"
          class="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shrink-0 disabled:opacity-50 disabled:hover:scale-100"
        >
          <Send class="w-4.5 h-4.5 ml-0.5 text-white" />
        </button>
      </div>
    </div>

  </div>
</template>

<style scoped>
.shadow-soft {
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.04);
}
.prose-chat strong {
  font-weight: 800 !important;
}
</style>
