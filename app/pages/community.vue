<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { 
  Users, Flame, Droplets, Scale, Heart, MessageSquare, 
  Send, Plus, CheckCircle2, ChevronRight, Clock, Award, 
  BookOpen, Sparkles, User, RefreshCw, X, XCircle
} from '@lucide/vue'
import { useHealthStore } from '~/stores/health'
import { useUserStore } from '~/stores/user'
import { useSupabaseClient, useSupabaseUser, useI18n } from '#imports'
import Card from '~/components/ui/Card.vue'
import Button from '~/components/ui/Button.vue'

const healthStore = useHealthStore()
const userStore = useUserStore()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { t } = useI18n()

// Tab State: 'timeline' | 'recipes' | 'groups'
const activeTab = ref<'timeline' | 'recipes' | 'groups'>('timeline')

// CUSTOM BEAUTIFUL ALERT MODAL STATE
const alertModal = ref<{
  isOpen: boolean
  type: 'success' | 'error'
  title: string
  message: string
}>({
  isOpen: false,
  type: 'success',
  title: '',
  message: ''
})

const showAlert = (type: 'success' | 'error', title: string, message: string) => {
  alertModal.value = {
    isOpen: true,
    type,
    title,
    message
  }
}

const closeAlert = () => {
  alertModal.value.isOpen = false
}

const currentUserId = ref<string | null>(null)

// 1. TIMELINE STATE
const newPostContent = ref('')
const attachSteps = ref(false)
const attachWater = ref(false)
const attachWeight = ref(false)
const isSubmittingPost = ref(false)
const posts = ref<any[]>([])
const isLoadingPosts = ref(true)

// 2. RECIPES STATE
const selectedCategory = ref<'all' | 'breakfast' | 'lunch' | 'dinner' | 'protein' | 'carb'>('all')
const selectedRecipe = ref<any | null>(null)

// 3. GROUPS STATE
const activeGroupId = ref('steps_warriors')
const chatMessageText = ref('')
const messages = ref<any[]>([])
const isLoadingMessages = ref(true)
const isSendingMessage = ref(false)

// Group discussions lists
const discussionGroups = computed(() => [
  { id: 'steps_warriors', name: 'Klub Pejuang 10.000 Langkah', icon: '🚶‍♂️', desc: 'Saling menyemangati untuk memenuhi target langkah harian.', membersCount: 142 },
  { id: 'calorie_deficit', name: 'Defisit Kalori Santuy', icon: '🥗', desc: 'Berbagi resep defisit kalori, tips kenyang lebih lama, & log makanan.', membersCount: 289 },
  { id: 'fasting_id', name: 'Intermittent Fasting Indonesia', icon: '⏱️', desc: 'Diskusi jendela makan, puasa sehat, dan gaya hidup IF.', membersCount: 195 },
  { id: 'gym_protein', name: 'High Protein Gym Club', icon: '💪', desc: 'Fokus pembentukan otot, resep dada ayam enak, dan asupan makro.', membersCount: 310 }
])

const activeGroup = computed(() => {
  return discussionGroups.value.find(g => g.id === activeGroupId.value) || discussionGroups.value[0]
})

// MOCK DATA FALLBACKS (If Supabase yields empty results, blend these in so R&D looks active and gorgeous)
const mockPosts = computed(() => [
  {
    id: 'mock-1',
    content: 'Wah, seneng banget hari ini akhirnya target air minum 8 gelas terpenuhi! Tubuh kerasa seger banget dan nggak gampang lemes saat kerja. Yuk semuanya semangat minum air hari ini!',
    steps: null,
    water: 8,
    weight: null,
    liked_by: [],
    created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    profiles: {
      name: 'Siti Rahma',
      avatar_url: 'https://api.dicebear.com/7.x/notionists/svg?seed=siti'
    }
  },
  {
    id: 'mock-2',
    content: 'Pencapaian baru! Timbangan pagi ini menunjukkan penurunan berat badan yang konsisten selama 3 minggu terakhir. Program defisit kalori santai beneran works kalau konsisten.',
    steps: null,
    water: null,
    weight: 68.4,
    liked_by: [],
    created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    profiles: {
      name: 'Budi Santoso',
      avatar_url: 'https://api.dicebear.com/7.x/notionists/svg?seed=budi'
    }
  },
  {
    id: 'mock-3',
    content: 'Selesai jalan sore mengelilingi komplek. Sedikit lagi menuju lencana Streak Master 7 Hari! Ada yang mau gabung besok?',
    steps: 8420,
    water: null,
    weight: null,
    liked_by: [],
    created_at: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
    profiles: {
      name: 'Rian Wijaya',
      avatar_url: 'https://api.dicebear.com/7.x/notionists/svg?seed=rian'
    }
  }
])

const mockMessages = computed(() => ({
  steps_warriors: [
    { id: 'm-1', message: 'Semangat pagi kawan-kawan! Target langkah hari ini berapa nih?', profiles: { name: 'Rian Wijaya', avatar_url: 'https://api.dicebear.com/7.x/notionists/svg?seed=rian' }, created_at: new Date(Date.now() - 30 * 60000).toISOString() },
    { id: 'm-2', message: 'Pagi! Aku target 8.000 langkah aja hari ini karena ada meeting padat.', profiles: { name: 'Budi Santoso', avatar_url: 'https://api.dicebear.com/7.x/notionists/svg?seed=budi' }, created_at: new Date(Date.now() - 20 * 60000).toISOString() },
    { id: 'm-3', message: 'Aku sudah 5.000 langkah jalan kaki tipis-tipis keliling kantor pas istirahat tadi! Semangat semuanya!', profiles: { name: 'Siti Rahma', avatar_url: 'https://api.dicebear.com/7.x/notionists/svg?seed=siti' }, created_at: new Date(Date.now() - 10 * 60000).toISOString() }
  ],
  calorie_deficit: [
    { id: 'm-4', message: 'Makan siang rendah kalori yang bikin kenyang lama apa ya rekomendasinya?', profiles: { name: 'Siti Rahma', avatar_url: 'https://api.dicebear.com/7.x/notionists/svg?seed=siti' }, created_at: new Date(Date.now() - 40 * 60000).toISOString() },
    { id: 'm-5', message: 'Coba dada ayam panggang rosemary plus tumis brokoli tahu deh. Kalorinya cuma sekitar 300-an tapi proteinnya tinggi bgt, awet kenyangnya!', profiles: { name: 'Rian Wijaya', avatar_url: 'https://api.dicebear.com/7.x/notionists/svg?seed=rian' }, created_at: new Date(Date.now() - 25 * 60000).toISOString() }
  ],
  fasting_id: [
    { id: 'm-6', message: 'Minggu pertama intermittent fasting jendela 16:8 kerasa laper bgt di 2 jam terakhir sebelum buka. Wajar ga ya?', profiles: { name: 'Budi Santoso', avatar_url: 'https://api.dicebear.com/7.x/notionists/svg?seed=budi' }, created_at: new Date(Date.now() - 15 * 60000).toISOString() },
    { id: 'm-7', message: 'Sangat wajar! Tubuh lagi adaptasi. Coba minum teh hijau hangat tanpa gula atau air putih dingin untuk mengalihkan rasa lapar.', profiles: { name: 'Siti Rahma', avatar_url: 'https://api.dicebear.com/7.x/notionists/svg?seed=siti' }, created_at: new Date(Date.now() - 5 * 60000).toISOString() }
  ],
  gym_protein: [
    { id: 'm-8', message: 'Baru kelar angkat beban hari ini. Langsung bikin whey protein + pisang 🍌', profiles: { name: 'Rian Wijaya', avatar_url: 'https://api.dicebear.com/7.x/notionists/svg?seed=rian' }, created_at: new Date(Date.now() - 35 * 60000).toISOString() },
    { id: 'm-9', message: 'Mantap bro, keep pushing! Jangan lupa dada ayamnya dipanggang nanti malam ya biar otot makin solid!', profiles: { name: 'Budi Santoso', avatar_url: 'https://api.dicebear.com/7.x/notionists/svg?seed=budi' }, created_at: new Date(Date.now() - 12 * 60000).toISOString() }
  ]
}))

// 4. HEALTHY RECIPES LIST
const recipes = computed(() => [
  {
    id: 'rec-1',
    title: 'Oatmeal Pisang Kayu Manis',
    category: 'breakfast',
    calories: 280,
    protein: 10,
    carbs: 45,
    fat: 6,
    prepTime: 10,
    difficulty: 'Mudah',
    difficultyColor: 'bg-emerald-100 text-emerald-800',
    emoji: '🥣',
    ingredients: [
      '40g Rolled Oats',
      '200ml Susu Almond Tawar (Unsweetened)',
      '1 buah Pisang Ambon matang (iris)',
      '1/2 sdt Bubuk Kayu Manis',
      '1 sdm Irisan Kacang Almond panggang',
      '1 sdt Madu Murni'
    ],
    instructions: [
      'Campurkan rolled oats dan susu almond ke dalam panci kecil.',
      'Masak di atas api sedang selama 5-7 menit hingga mengental sambil diaduk rata.',
      'Tuang oatmeal ke dalam mangkuk saji.',
      'Susun irisan pisang di atasnya, taburi dengan bubuk kayu manis, almond iris, dan tuangkan madu murni.',
      'Sajikan selagi hangat untuk sarapan berenergi!'
    ],
    tip: 'Oat kaya akan serat beta-glukan yang larut dalam air, efektif menjaga rasa kenyang lebih lama dan menstabilkan kadar gula darah di pagi hari.'
  },
  {
    id: 'rec-2',
    title: 'Dada Ayam Panggang Rosemary',
    category: 'lunch',
    calories: 320,
    protein: 35,
    carbs: 8,
    fat: 9,
    prepTime: 20,
    difficulty: 'Sedang',
    difficultyColor: 'bg-amber-100 text-amber-800',
    emoji: '🍗',
    ingredients: [
      '150g Dada Ayam fillet tanpa kulit',
      '1 sdm Minyak Zaitun (Extra Virgin Olive Oil)',
      '2 tangkai Daun Rosemary segar',
      '2 siung Bawang Putih (cincang halus)',
      '1/2 buah Lemon (ambil air perasannya)',
      'Garam laut & Lada hitam bubuk secukupnya'
    ],
    instructions: [
      'Marinasi dada ayam dengan minyak zaitun, bawang putih cincang, jus lemon, garam, lada hitam, dan daun rosemary selama 15 menit.',
      'Panaskan wajan anti-lengket (grill pan) dengan api sedang-tinggi.',
      'Panggang dada ayam selama 6-7 menit di setiap sisi hingga matang sempurna dan warnanya kecokelatan.',
      'Diamkan selama 3-5 menit sebelum diiris tipis agar sarinya (juice) tidak keluar.',
      'Sajikan dengan sayuran kukus kesukaan Anda.'
    ],
    tip: 'Dada ayam merupakan sumber protein tinggi tanpa lemak terbaik untuk membantu pemulihan otot dan pembakaran kalori aktif.'
  },
  {
    id: 'rec-3',
    title: 'Salmon Panggang Lemon Asparagus',
    category: 'lunch',
    calories: 380,
    protein: 28,
    carbs: 6,
    fat: 18,
    prepTime: 25,
    difficulty: 'Sedang',
    difficultyColor: 'bg-amber-100 text-amber-800',
    emoji: '🍣',
    ingredients: [
      '120g Fillet Ikan Salmon segar',
      '8 batang Asparagus muda (buang ujung kerasnya)',
      '1 sdm Mentega Tawar (dilumerkan)',
      '1/2 buah Lemon (iris tipis bulat)',
      '1 siung Bawang Putih (dihaluskan)',
      'Garam & Merica hitam secukupnya'
    ],
    instructions: [
      'Panaskan oven pada suhu 200°C.',
      'Letakkan salmon fillet dan asparagus di atas loyang yang sudah dilapisi kertas panggang (baking paper).',
      'Oleskan bawang putih, mentega cair, garam, dan merica ke seluruh permukaan salmon dan asparagus.',
      'Letakkan beberapa irisan lemon di atas fillet salmon.',
      'Panggang selama 12-15 menit hingga daging salmon mudah dipotong dengan garpu. Sajikan selagi hangat.'
    ],
    tip: 'Kandungan lemak Omega-3 yang tinggi pada salmon sangat baik untuk kesehatan kardiovaskular, menurunkan kolesterol jahat, dan menekan peradangan.'
  },
  {
    id: 'rec-4',
    title: 'Tumis Tahu Brokoli Jamur',
    category: 'dinner',
    calories: 210,
    protein: 14,
    carbs: 18,
    fat: 8,
    prepTime: 15,
    difficulty: 'Mudah',
    difficultyColor: 'bg-emerald-100 text-emerald-800',
    emoji: '🥦',
    ingredients: [
      '100g Tahu Putih (potong dadu)',
      '80g Kuntum Brokoli segar',
      '50g Jamur Kancing (iris tipis)',
      '1 sdm Kecap Asin rendah natrium',
      '1 sdt Minyak Wijen',
      '1/2 buah Bawang Bombay kecil (iris memanjang)',
      '1 sdm Minyak Kelapa untuk menumis'
    ],
    instructions: [
      'Kukus brokoli setengah matang selama 2 menit, lalu tiriskan.',
      'Panaskan minyak kelapa di wajan dengan api sedang.',
      'Tumis bawang bombay hingga harum, lalu masukkan tahu dan jamur. Masak hingga jamur layu.',
      'Masukkan brokoli kukus, kecap asin, dan minyak wijen.',
      'Aduk cepat selama 2 menit di atas api besar agar brokoli tetap renyah, lalu angkat dan sajikan.'
    ],
    tip: 'Menu rendah kalori dan tinggi serat ini sangat cocok untuk makan malam karena tidak membebani organ pencernaan sebelum tidur.'
  },
  {
    id: 'rec-5',
    title: 'Chia Seed Pudding Stroberi',
    category: 'protein',
    calories: 180,
    protein: 6,
    carbs: 22,
    fat: 7,
    prepTime: 5,
    difficulty: 'Mudah',
    difficultyColor: 'bg-emerald-100 text-emerald-800',
    emoji: '🍓',
    ingredients: [
      '3 sdm Biji Chia (Chia Seeds)',
      '150ml Susu Almond tawar atau Susu Low-Fat',
      '4 buah Stroberi segar (hancurkan kasar dengan garpu)',
      '1 sdt Madu Murni atau Sirup Maple',
      '1/4 sdt Ekstrak Vanila bubuk'
    ],
    instructions: [
      'Dalam gelas jar atau mangkuk kecil, campurkan biji chia, susu, vanila, dan madu.',
      'Aduk rata selama 1-2 menit. Diamkan 5 menit, lalu aduk kembali agar biji chia tersebar merata.',
      'Tutup wadah, simpan di dalam kulkas minimal 4 jam atau semalaman hingga biji chia mengembang membentuk konsistensi puding jeli.',
      'Sajikan dingin dengan stroberi yang sudah dihancurkan di atasnya sebagai topping.'
    ],
    tip: 'Biji chia adalah superfood kaya asam lemak omega-3, kalsium, antioksidan, serat tinggi, serta protein nabati yang baik untuk pencernaan.'
  }
])

const filteredRecipes = computed(() => {
  const cat = selectedCategory.value
  if (cat === 'all') return recipes.value
  if (cat === 'breakfast') return recipes.value.filter(r => r.category === 'breakfast')
  if (cat === 'lunch') return recipes.value.filter(r => r.category === 'lunch')
  if (cat === 'dinner') return recipes.value.filter(r => r.category === 'dinner')
  if (cat === 'protein') return recipes.value.filter(r => r.protein >= 15)
  if (cat === 'carb') return recipes.value.filter(r => r.carbs <= 20)
  return recipes.value
})

// ON MOUNTED INITIALIZATION
onMounted(async () => {
  await healthStore.fetchTodayData()
  await userStore.fetchProfile()
  
  // Set currentUserId asynchronously from verified session
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser) {
      currentUserId.value = authUser.id
    }
  } catch (err) {
    console.error('Error fetching user on mounted:', err)
  }
  
  // Load data based on default active tab
  if (activeTab.value === 'timeline') {
    await fetchTimelinePosts()
  } else if (activeTab.value === 'groups') {
    await fetchGroupMessages()
  }
})

// WATCh TAB TRANSITIONS
watch(activeTab, async (newVal) => {
  if (newVal === 'timeline') {
    await fetchTimelinePosts()
  } else if (newVal === 'groups') {
    await fetchGroupMessages()
  }
})

// WATCH DISCUSSION GROUP SWITCHES
watch(activeGroupId, async () => {
  await fetchGroupMessages()
})

// 1. TIMELINE CONTROLLERS
const fetchTimelinePosts = async () => {
  isLoadingPosts.value = true
  try {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*, profiles(name, avatar_url)')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Combine Supabase data with premium mock data
    // If user deleted or cleared Supabase, mock posts ensure timeline stays beautiful
    const supabaseData = (data || []).map(post => ({
      ...post,
      liked_by: Array.isArray(post.liked_by) ? post.liked_by : []
    }))
    posts.value = [...supabaseData, ...mockPosts.value]
  } catch (err) {
    console.error('Error fetching posts:', err)
    // Fallback to purely mock posts
    posts.value = [...mockPosts.value]
  } finally {
    isLoadingPosts.value = false
  }
}

const handleSharePost = async () => {
  if (!newPostContent.value.trim() && !attachSteps.value && !attachWater.value && !attachWeight.value) return
  
  isSubmittingPost.value = true
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      showAlert('error', t('community.alertAccessDeniedTitle'), t('community.alertAccessDeniedComposer'))
      isSubmittingPost.value = false
      return
    }

    const postPayload = {
      user_id: authUser.id,
      content: newPostContent.value,
      steps: attachSteps.value ? healthStore.steps : null,
      water: attachWater.value ? healthStore.consumedWater : null,
      weight: attachWeight.value ? healthStore.currentWeight : null,
      liked_by: []
    }

    const { error } = await supabase
      .from('community_posts')
      .insert(postPayload)

    if (error) throw error

    // Reset Form fields
    newPostContent.value = ''
    attachSteps.value = false
    attachWater.value = false
    attachWeight.value = false

    // Trigger Notification Toast
    healthStore.addSteps(0) // Quick update health values
    await fetchTimelinePosts()

    // Trigger Success Alert Modal!
    showAlert('success', t('community.alertShareSuccessTitle'), t('community.alertShareSuccessMsg'))
  } catch (err: any) {
    console.error('Error inserting post:', err)
    showAlert('error', t('community.alertShareErrorTitle'), err?.message || t('community.alertShareErrorMsg'))
  } finally {
    isSubmittingPost.value = false
  }
}

const handleToggleLike = async (postItem: any) => {
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      showAlert('error', t('community.alertAccessDeniedTitle'), t('community.alertAccessDeniedLike'))
      return
    }

    const userId = authUser.id
    const likedByArray = Array.isArray(postItem.liked_by) ? postItem.liked_by : []
    const isLiked = likedByArray.includes(userId)
    
    let newLikedBy = [...likedByArray]
    if (isLiked) {
      newLikedBy = newLikedBy.filter(id => id !== userId)
    } else {
      newLikedBy.push(userId)
    }

    // Update locally instantly for responsive snappy UI feel
    postItem.liked_by = newLikedBy

    // Update in Supabase (if it's not a mockup post)
    if (postItem.id.startsWith('mock-')) {
      return // Mock posts only simulate local UI toggling
    }

    const { error } = await supabase
      .from('community_posts')
      .update({ liked_by: newLikedBy })
      .eq('id', postItem.id)

    if (error) throw error
  } catch (err: any) {
    console.error('Error liking post:', err)
    showAlert('error', t('community.alertLikeErrorTitle'), err?.message || t('community.alertLikeErrorMsg'))
  }
}

// 2. RECIPE DETAIL MODALS
const openRecipeModal = (recipe: any) => {
  selectedRecipe.value = recipe
}

const closeRecipeModal = () => {
  selectedRecipe.value = null
}

// 3. GROUP DISCUSSION CHATS CONTROLLERS
const fetchGroupMessages = async () => {
  isLoadingMessages.value = true
  try {
    const { data, error } = await supabase
      .from('community_messages')
      .select('*, profiles(name, avatar_url)')
      .eq('group_id', activeGroupId.value)
      .order('created_at', { ascending: true })

    if (error) throw error

    // Blend Supabase messages with pre-populated active room conversations
    const dbMessages = data || []
    const defaultMocks = (mockMessages.value as any)[activeGroupId.value] || []
    messages.value = [...defaultMocks, ...dbMessages]
  } catch (err) {
    console.error('Error fetching messages:', err)
    messages.value = (mockMessages.value as any)[activeGroupId.value] || []
  } finally {
    isLoadingMessages.value = false
    scrollChatToBottom()
  }
}

const handleSendMessage = async () => {
  if (!chatMessageText.value.trim()) return
  
  isSendingMessage.value = true
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      showAlert('error', t('community.alertAccessDeniedTitle'), t('community.alertAccessDeniedChat'))
      isSendingMessage.value = false
      return
    }

    const payload = {
      group_id: activeGroupId.value,
      user_id: authUser.id,
      message: chatMessageText.value
    }

    const { error } = await supabase
      .from('community_messages')
      .insert(payload)

    if (error) throw error

    chatMessageText.value = ''
    await fetchGroupMessages()
  } catch (err: any) {
    console.error('Error sending message:', err)
    showAlert('error', t('community.alertChatErrorTitle'), err?.message || t('community.alertChatErrorMsg'))
  } finally {
    isSendingMessage.value = false
  }
}

const scrollChatToBottom = () => {
  setTimeout(() => {
    const chatContainer = document.getElementById('chat-scroll-area')
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight
    }
  }, 100)
}

// Date formatter helper
const formatRelativeTime = (isoString: string) => {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)

  if (mins < 1) return 'Baru saja'
  if (mins < 60) return `${mins} menit lalu`
  if (hours < 24) return `${hours} jam lalu`
  return `${days} hari lalu`
}
</script>

<template>
  <div class="px-6 py-8 pb-32 md:pb-8">
    <!-- Header -->
    <header class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-secondary flex items-center gap-2">
          <Users class="w-7 h-7 text-primary" />
          {{ t('community.title') }}
        </h1>
        <p class="text-sm text-text-muted mt-1">
          {{ t('community.subtitle') }}
        </p>
      </div>
      <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
        <Sparkles class="w-5 h-5 animate-pulse" />
      </div>
    </header>

    <!-- Navigation Sub-Tabs -->
    <div class="flex bg-slate-100 p-1.5 rounded-2xl mb-8 max-w-xl shadow-inner">
      <button 
        @click="activeTab = 'timeline'"
        class="flex-1 py-3 px-2 rounded-xl text-xs font-black transition-all duration-300 flex items-center justify-center gap-1.5"
        :class="activeTab === 'timeline' ? 'bg-white text-secondary shadow-soft' : 'text-text-muted hover:text-secondary'"
      >
        <RefreshCw class="w-4 h-4" />
        {{ t('community.tabTimeline') }}
      </button>
      <button 
        @click="activeTab = 'recipes'"
        class="flex-1 py-3 px-2 rounded-xl text-xs font-black transition-all duration-300 flex items-center justify-center gap-1.5"
        :class="activeTab === 'recipes' ? 'bg-white text-secondary shadow-soft' : 'text-text-muted hover:text-secondary'"
      >
        <BookOpen class="w-4 h-4" />
        {{ t('community.tabRecipes') }}
      </button>
      <button 
        @click="activeTab = 'groups'"
        class="flex-1 py-3 px-2 rounded-xl text-xs font-black transition-all duration-300 flex items-center justify-center gap-1.5"
        :class="activeTab === 'groups' ? 'bg-white text-secondary shadow-soft' : 'text-text-muted hover:text-secondary'"
      >
        <MessageSquare class="w-4 h-4" />
        {{ t('community.tabGroups') }}
      </button>
    </div>

    <!-- TAB 1: SHARE PROGRESS / LINIMASA -->
    <div v-if="activeTab === 'timeline'" class="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-300">
      
      <!-- Composer Card -->
      <Card padding="p-5" class="bg-white border border-slate-100 shadow-soft relative overflow-hidden">
        <div class="absolute -top-10 -right-10 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none"></div>
        <div class="flex gap-4">
          <div class="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-xs shrink-0 select-none">
            {{ userStore.name ? userStore.name.substring(0, 2).toUpperCase() : 'ME' }}
          </div>
          <div class="flex-1 space-y-3">
            <textarea 
              v-model="newPostContent"
              :placeholder="t('community.composerPlaceholder')"
              rows="3"
              class="w-full bg-slate-50 border-2 border-slate-100 focus:border-primary focus:bg-white transition-all rounded-2xl p-4 text-sm text-secondary font-semibold placeholder-slate-400 outline-none resize-none"
            ></textarea>

            <!-- Attachment options checkboxes -->
            <div class="flex flex-wrap gap-2.5">
              <label 
                class="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-extrabold cursor-pointer transition-all active:scale-95 select-none"
                :class="attachSteps ? 'bg-amber-500/10 text-amber-600 border-amber-500/30' : 'bg-slate-50 text-text-muted border-slate-200/60 hover:border-slate-300'"
              >
                <input type="checkbox" v-model="attachSteps" class="hidden" />
                <span>🚶‍♂️ {{ t('community.attachSteps', { steps: healthStore.steps.toLocaleString() }) }}</span>
              </label>
              
              <label 
                class="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-extrabold cursor-pointer transition-all active:scale-95 select-none"
                :class="attachWater ? 'bg-accent/10 text-accent border-accent/30' : 'bg-slate-50 text-text-muted border-slate-200/60 hover:border-slate-300'"
              >
                <input type="checkbox" v-model="attachWater" class="hidden" />
                <span>💧 {{ t('community.attachWater', { water: healthStore.consumedWater }) }}</span>
              </label>

              <label 
                class="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-extrabold cursor-pointer transition-all active:scale-95 select-none"
                :class="attachWeight ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' : 'bg-slate-50 text-text-muted border-slate-200/60 hover:border-slate-300'"
              >
                <input type="checkbox" v-model="attachWeight" class="hidden" />
                <span>⚖️ {{ t('community.attachWeight', { weight: healthStore.currentWeight }) }}</span>
              </label>
            </div>

            <!-- Share Button -->
            <div class="flex justify-end pt-1">
              <Button 
                @click="handleSharePost" 
                :disabled="isSubmittingPost || (!newPostContent.trim() && !attachSteps && !attachWater && !attachWeight)"
                size="sm" 
                class="shadow-sm font-extrabold !px-6"
              >
                <Plus class="w-4 h-4 mr-1.5" />
                {{ t('community.btnShare') }}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <!-- Timeline Feed Loader -->
      <div v-if="isLoadingPosts" class="space-y-4 py-8 text-center text-text-muted font-bold text-sm">
        <RefreshCw class="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
        {{ t('community.loadingTimeline') }}
      </div>

      <!-- Feed List -->
      <div v-else class="space-y-4">
        <Card 
          v-for="post in posts" 
          :key="post.id"
          padding="p-5"
          class="bg-white border border-slate-100 shadow-soft hover:shadow-md transition-all duration-300"
        >
          <div class="flex items-start gap-4">
            <!-- Author avatar -->
            <div class="w-10 h-10 rounded-full overflow-hidden border border-slate-100 shrink-0 select-none">
              <img :src="post.profiles?.avatar_url || 'https://api.dicebear.com/7.x/notionists/svg?seed=default'" alt="Avatar" class="w-full h-full object-cover" />
            </div>
            
            <div class="flex-1 space-y-2">
              <!-- Author name & Time -->
              <div class="flex items-center justify-between">
                <h4 class="font-extrabold text-secondary text-sm">{{ post.profiles?.name || 'User Sehatin' }}</h4>
                <span class="text-[10px] text-text-muted font-semibold">{{ formatRelativeTime(post.created_at) }}</span>
              </div>

              <!-- Post Content Text -->
              <p class="text-xs text-secondary leading-relaxed font-semibold pr-2 whitespace-pre-line">{{ post.content }}</p>

              <!-- Attached Progress Badges Box -->
              <div v-if="post.steps || post.water || post.weight" class="flex flex-wrap gap-2 pt-1.5">
                <div v-if="post.steps" class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100/50 text-[10px] font-black">
                  <Flame class="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{{ t('community.badgeSteps', { steps: post.steps.toLocaleString() }) }}</span>
                </div>

                <div v-if="post.water" class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100/50 text-[10px] font-black">
                  <Droplets class="w-3.5 h-3.5 text-accent fill-accent" />
                  <span>{{ t('community.badgeWater', { water: post.water }) }}</span>
                </div>

                <div v-if="post.weight" class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100/50 text-[10px] font-black">
                  <Scale class="w-3.5 h-3.5 text-emerald-500" />
                  <span>{{ t('community.badgeWeight', { weight: post.weight }) }}</span>
                </div>
              </div>

              <!-- Interactive Actions Panel (Like button) -->
              <div class="flex items-center justify-between pt-3 border-t border-slate-50 mt-4">
                <button 
                  @click="handleToggleLike(post)"
                  class="flex items-center gap-1.5 text-xs font-bold transition-all active:scale-90 select-none group"
                  :class="currentUserId && post.liked_by?.includes(currentUserId) ? 'text-rose-600' : 'text-slate-400 hover:text-rose-500'"
                >
                  <Heart 
                    class="w-4 h-4 transition-transform group-hover:scale-110" 
                    :class="currentUserId && post.liked_by?.includes(currentUserId) ? 'text-rose-600' : 'text-slate-400'"
                    :fill="currentUserId && post.liked_by?.includes(currentUserId) ? 'currentColor' : 'none'"
                  />
                  <span>{{ t('community.likes', { count: (post.liked_by || []).length }) }}</span>
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>

    </div>

    <!-- TAB 2: HEALTHY RECIPES / RESEP SEHAT -->
    <div v-else-if="activeTab === 'recipes'" class="space-y-6 animate-in fade-in duration-300">
      
      <!-- Category Pills Filter -->
      <div class="flex gap-2 flex-wrap pb-2 border-b border-slate-50">
        <button 
          v-for="cat in [
            { id: 'all', label: t('community.catAll') },
            { id: 'breakfast', label: t('community.catBreakfast') },
            { id: 'lunch', label: t('community.catLunch') },
            { id: 'dinner', label: t('community.catDinner') },
            { id: 'protein', label: t('community.catProtein') },
            { id: 'carb', label: t('community.catCarb') }
          ]" 
          :key="cat.id"
          @click="selectedCategory = cat.id as any"
          class="px-4 py-2 rounded-full text-[11px] font-black tracking-wide border transition-all active:scale-95 select-none"
          :class="selectedCategory === cat.id ? 'bg-primary text-white border-primary shadow-sm shadow-primary/20' : 'bg-white text-text-muted border-slate-200 hover:border-slate-300 hover:text-secondary'"
        >
          {{ cat.label }}
        </button>
      </div>

      <!-- Recipe Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card 
          v-for="recipe in filteredRecipes" 
          :key="recipe.id"
          padding="p-5"
          class="bg-white border border-slate-100 shadow-soft flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
        >
          <div class="space-y-4">
            <!-- Icon header -->
            <div class="flex items-center justify-between">
              <span class="text-3xl select-none">{{ recipe.emoji }}</span>
              <span class="px-2 py-0.5 text-[9px] font-black rounded-full uppercase tracking-wider" :class="recipe.difficultyColor">
                {{ recipe.difficulty }}
              </span>
            </div>
            
            <!-- Title & Info -->
            <div class="space-y-1.5">
              <h4 class="font-extrabold text-secondary text-base leading-snug group-hover:text-primary transition-colors">{{ recipe.title }}</h4>
              <p class="text-[10px] text-text-muted font-bold flex items-center gap-1.5 uppercase">
                <Clock class="w-3.5 h-3.5 text-slate-400" />
                <span>{{ t('community.prepTime', { minutes: recipe.prepTime }) }}</span>
              </p>
            </div>

            <!-- Macros display row -->
            <div class="grid grid-cols-4 gap-1.5 pt-3 border-t border-slate-50 text-center">
              <div class="bg-orange-50/50 rounded-xl p-1.5">
                <span class="text-[8px] font-extrabold text-text-muted block uppercase">Kcal</span>
                <span class="text-xs font-black text-secondary mt-0.5 block">{{ recipe.calories }}</span>
              </div>
              <div class="bg-blue-50/50 rounded-xl p-1.5">
                <span class="text-[8px] font-extrabold text-text-muted block uppercase">Prot</span>
                <span class="text-xs font-black text-secondary mt-0.5 block">{{ recipe.protein }}g</span>
              </div>
              <div class="bg-amber-50/50 rounded-xl p-1.5">
                <span class="text-[8px] font-extrabold text-text-muted block uppercase">Carb</span>
                <span class="text-xs font-black text-secondary mt-0.5 block">{{ recipe.carbs }}g</span>
              </div>
              <div class="bg-rose-50/50 rounded-xl p-1.5">
                <span class="text-[8px] font-extrabold text-text-muted block uppercase">Fat</span>
                <span class="text-xs font-black text-secondary mt-0.5 block">{{ recipe.fat }}g</span>
              </div>
            </div>
          </div>

          <Button 
            @click="openRecipeModal(recipe)" 
            variant="ghost" 
            size="sm" 
            class="mt-5 w-full bg-primary/5 text-primary hover:bg-primary/10 font-bold"
          >
            {{ t('community.btnViewRecipe') }}
            <ChevronRight class="w-4 h-4 ml-1" />
          </Button>
        </Card>
      </div>

    </div>

    <!-- TAB 3: DIET CHAT ROOMS / KOMUNITAS DIET -->
    <div v-else class="max-w-5xl mx-auto animate-in fade-in duration-300">
      
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch min-h-[500px]">
        
        <!-- Groups Navigation list (3 cols on desktop) -->
        <div class="md:col-span-4 flex flex-col gap-3">
          <h3 class="text-xs font-black text-text-muted uppercase tracking-wider mb-1 px-1">{{ t('community.selectRoom') }}</h3>
          <button 
            v-for="group in discussionGroups" 
            :key="group.id"
            @click="activeGroupId = group.id"
            class="w-full text-left p-4 rounded-3xl border-2 transition-all flex items-start gap-3.5 active:scale-98 select-none"
            :class="activeGroupId === group.id ? 'border-primary bg-primary/[0.03] shadow-soft' : 'border-slate-100 hover:border-slate-200 bg-white'"
          >
            <div class="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl shrink-0">
              {{ group.icon }}
            </div>
            <div class="min-w-0 flex-1">
              <h4 class="font-extrabold text-secondary text-xs truncate leading-snug">{{ group.name }}</h4>
              <p class="text-[9px] text-text-muted mt-1 leading-normal truncate font-semibold">{{ group.desc }}</p>
              <span class="text-[8px] font-black bg-slate-100 text-slate-500 rounded-full px-2 py-0.5 inline-block mt-2 uppercase tracking-wide">
                👥 {{ t('community.members', { count: group.membersCount }) }}
              </span>
            </div>
          </button>
        </div>

        <!-- Dynamic Chat Window (8 cols on desktop) -->
        <div class="md:col-span-8 bg-white border border-slate-100 shadow-soft rounded-[2.5rem] flex flex-col overflow-hidden relative">
          
          <!-- Chat room header -->
          <div class="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div class="flex items-center gap-3">
              <span class="text-2xl select-none">{{ activeGroup.icon }}</span>
              <div>
                <h4 class="font-extrabold text-secondary text-sm leading-tight">{{ activeGroup.name }}</h4>
                <span class="text-[9px] text-emerald-600 font-bold block mt-0.5">{{ t('community.openChannel') }}</span>
              </div>
            </div>
          </div>

          <!-- Chat messages stream scroll area -->
          <div 
            id="chat-scroll-area"
            class="flex-1 p-5 overflow-y-auto space-y-4 min-h-[300px]"
          >
            <!-- Messages loader -->
            <div v-if="isLoadingMessages" class="py-8 text-center text-text-muted text-xs font-bold flex flex-col items-center justify-center gap-2">
              <RefreshCw class="w-6 h-6 animate-spin text-primary" />
              <span>{{ t('community.loadingMessages') }}</span>
            </div>

            <!-- Scroll log list -->
            <div v-else-if="messages.length === 0" class="py-8 text-center text-text-muted text-xs font-medium">
              {{ t('community.emptyMessages') }}
            </div>

            <div 
              v-else
              v-for="msg in messages" 
              :key="msg.id"
              class="flex items-start gap-3.5 max-w-[85%]"
              :class="currentUserId && msg.user_id === currentUserId ? 'ml-auto flex-row-reverse text-right' : ''"
            >
              <!-- Avatar -->
              <div class="w-8 h-8 rounded-full overflow-hidden border border-slate-100 shrink-0 select-none">
                <img :src="msg.profiles?.avatar_url || 'https://api.dicebear.com/7.x/notionists/svg?seed=default'" alt="Avatar" class="w-full h-full object-cover" />
              </div>

              <!-- Content and Info bubble -->
              <div class="space-y-1">
                <div class="flex items-center gap-2" :class="currentUserId && msg.user_id === currentUserId ? 'flex-row-reverse' : ''">
                  <span class="text-[10px] font-black text-secondary">{{ msg.profiles?.name || 'User Sehatin' }}</span>
                  <span class="text-[8px] text-text-muted font-semibold">{{ formatRelativeTime(msg.created_at) }}</span>
                </div>
                <div 
                  class="p-3.5 rounded-3xl text-xs font-semibold leading-relaxed"
                  :class="currentUserId && msg.user_id === currentUserId 
                    ? 'bg-primary text-white rounded-tr-none text-left' 
                    : 'bg-slate-50 text-secondary rounded-tl-none'"
                >
                  {{ msg.message }}
                </div>
              </div>
            </div>
          </div>

          <!-- Message input console -->
          <div class="p-4 border-t border-slate-100 bg-white shrink-0 flex items-center gap-2">
            <input 
              v-model="chatMessageText"
              @keydown.enter="handleSendMessage"
              :placeholder="t('community.chatInputPlaceholder')"
              class="flex-1 bg-slate-50 border border-slate-100 focus:border-primary focus:bg-white transition-all rounded-full px-5 py-3.5 text-xs text-secondary font-bold placeholder-slate-400 outline-none"
            />
            <button 
              @click="handleSendMessage"
              :disabled="isSendingMessage || !chatMessageText.trim()"
              class="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md shrink-0 disabled:opacity-50 disabled:hover:scale-100"
            >
              <Send class="w-4 h-4 ml-0.5" />
            </button>
          </div>

        </div>

      </div>

    </div>

    <!-- DETAILED HEALTHY RECIPE POPUP DIALOG MODAL (Tab 2 Component overlay) -->
    <Transition
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div 
        v-if="selectedRecipe"
        class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-4 flex items-center justify-center"
      >
        <div class="bg-white rounded-[3rem] border border-slate-100 shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-300">
          
          <!-- Close button -->
          <button 
            @click="closeRecipeModal"
            class="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors flex items-center justify-center z-20"
          >
            <X class="w-4.5 h-4.5" />
          </button>

          <!-- Modal Scrollable Content Container -->
          <div class="flex-1 p-6 md:p-8 overflow-y-auto space-y-6">
            <!-- Header section -->
            <div class="flex items-start gap-4">
              <span class="text-5xl select-none shrink-0">{{ selectedRecipe.emoji }}</span>
              <div>
                <span class="px-2.5 py-0.5 text-[9px] font-black rounded-full uppercase tracking-wider bg-primary/10 text-primary">
                  {{ selectedRecipe.category.toUpperCase() }}
                </span>
                <h3 class="text-xl font-black text-secondary mt-2">{{ selectedRecipe.title }}</h3>
                <p class="text-xs text-text-muted font-bold flex items-center gap-1.5 uppercase mt-1">
                  <Clock class="w-3.5 h-3.5 text-slate-400" />
                  <span>{{ t('community.prepTime', { minutes: selectedRecipe.prepTime }) }} • {{ selectedRecipe.difficulty }}</span>
                </p>
              </div>
            </div>

            <!-- Micro-Nutrients Progress Bars Grid -->
            <div class="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-3xl">
              <div>
                <span class="text-[9px] font-bold text-text-muted block uppercase">Kcal</span>
                <span class="text-base font-black text-secondary block mt-0.5">{{ selectedRecipe.calories }}</span>
                <div class="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
                  <div class="bg-orange-500 h-full rounded-full" :style="{ width: `${Math.min((selectedRecipe.calories / 2000) * 100, 100)}%` }"></div>
                </div>
              </div>
              <div>
                <span class="text-[9px] font-bold text-text-muted block uppercase">{{ t('dashboard.protein') }}</span>
                <span class="text-base font-black text-secondary block mt-0.5">{{ selectedRecipe.protein }}g</span>
                <div class="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
                  <div class="bg-blue-500 h-full rounded-full" :style="{ width: `${Math.min((selectedRecipe.protein / 150) * 100, 100)}%` }"></div>
                </div>
              </div>
              <div>
                <span class="text-[9px] font-bold text-text-muted block uppercase">{{ t('dashboard.carbs') }}</span>
                <span class="text-base font-black text-secondary block mt-0.5">{{ selectedRecipe.carbs }}g</span>
                <div class="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
                  <div class="bg-amber-500 h-full rounded-full" :style="{ width: `${Math.min((selectedRecipe.carbs / 250) * 100, 100)}%` }"></div>
                </div>
              </div>
              <div>
                <span class="text-[9px] font-bold text-text-muted block uppercase">{{ t('dashboard.fat') }}</span>
                <span class="text-base font-black text-secondary block mt-0.5">{{ selectedRecipe.fat }}g</span>
                <div class="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
                  <div class="bg-rose-500 h-full rounded-full" :style="{ width: `${Math.min((selectedRecipe.fat / 70) * 100, 100)}%` }"></div>
                </div>
              </div>
            </div>

            <!-- Ingredients checklist column -->
            <div>
              <h4 class="text-xs font-black text-secondary uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CheckCircle2 class="w-4.5 h-4.5 text-primary" />
                {{ t('community.ingredients') }}
              </h4>
              <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <li 
                  v-for="(ing, idx) in selectedRecipe.ingredients" 
                  :key="idx"
                  class="flex items-start gap-2 text-xs text-secondary font-semibold"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></span>
                  <span>{{ ing }}</span>
                </li>
              </ul>
            </div>

            <!-- Preparation instructions step-by-step -->
            <div>
              <h4 class="text-xs font-black text-secondary uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Award class="w-4.5 h-4.5 text-amber-500" />
                {{ t('community.instructions') }}
              </h4>
              <ol class="space-y-4">
                <li 
                  v-for="(step, idx) in selectedRecipe.instructions" 
                  :key="idx"
                  class="flex items-start gap-3 text-xs text-secondary font-semibold"
                >
                  <span class="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary text-[10px] shrink-0 mt-0.5 select-none">
                    {{ idx + 1 }}
                  </span>
                  <span class="leading-relaxed">{{ step }}</span>
                </li>
              </ol>
            </div>

            <!-- Daily tip info card -->
            <div class="bg-gradient-to-r from-emerald-50 to-teal-50/50 p-4 rounded-3xl border border-emerald-100/50 flex items-start gap-3">
              <span class="text-xl select-none">💡</span>
              <div>
                <h5 class="font-extrabold text-emerald-900 text-xs uppercase tracking-wider">{{ t('community.whyHealthy') }}</h5>
                <p class="text-[11px] text-emerald-700 leading-normal font-semibold mt-1">
                  {{ selectedRecipe.tip }}
                </p>
              </div>
            </div>

          </div>

          <!-- Bottom modal footer container -->
          <div class="p-6 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0 rounded-b-[3rem]">
            <Button @click="closeRecipeModal" variant="outline" class="border-2 font-black border-slate-200 text-secondary">
              {{ t('community.btnCloseRecipe') }}
            </Button>
          </div>

        </div>
      </div>
    </Transition>

    <!-- CUSTOM BEAUTIFUL ALERT MODAL (Success/Error) -->
    <Transition
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div 
        v-if="alertModal.isOpen"
        class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-4 flex items-center justify-center"
      >
        <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-300 relative">
          <!-- Close top right -->
          <button 
            @click="closeAlert"
            class="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors flex items-center justify-center"
          >
            <X class="w-4 h-4" />
          </button>

          <!-- Type Icon -->
          <div class="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
            :class="alertModal.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'"
          >
            <CheckCircle2 v-if="alertModal.type === 'success'" class="w-8 h-8" />
            <XCircle v-else class="w-8 h-8 text-rose-500" />
          </div>

          <!-- Content -->
          <h3 class="text-lg font-black text-secondary mb-1.5">{{ alertModal.title }}</h3>
          <p class="text-xs text-text-muted leading-relaxed font-semibold mb-6 px-2">{{ alertModal.message }}</p>

          <!-- Action Button -->
          <Button @click="closeAlert" block class="font-bold py-3">
            {{ alertModal.type === 'success' ? t('community.alertSuccessBtn') : t('community.alertErrorBtn') }}
          </Button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Responsive layout tweaks */
.shadow-soft {
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.04);
}
</style>
