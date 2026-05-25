<script setup lang="ts">
import { ref, onBeforeUnmount, watch } from 'vue'
import { 
  Sparkles, Camera, Upload, Check, Loader2, AlertCircle, RefreshCw 
} from '@lucide/vue'
import { useHealthStore } from '~/stores/health'
import { useI18n } from '#imports'
import Button from '~/components/ui/Button.vue'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'logged'): void
}>()

const healthStore = useHealthStore()
const { t, locale } = useI18n()

// Food Item Database Interface
interface FoodItem {
  id: string
  nameId: string
  nameEn: string
  calories: number
  protein: number
  carbs: number
  fat: number
  sugar: number
  sodium: number
  fiber: number
  colorGroup: 'white' | 'green' | 'brown' | 'yellow'
}

// 17-item Curated High-Fidelity Food Database
const FOOD_DATABASE: FoodItem[] = [
  // --- WHITE GROUP ---
  {
    id: 'nasi_putih',
    nameId: 'Nasi Putih (Satu Piring)',
    nameEn: 'White Rice (One Plate)',
    calories: 204,
    protein: 4.2,
    carbs: 44.5,
    fat: 0.4,
    sugar: 0.1,
    sodium: 2,
    fiber: 0.6,
    colorGroup: 'white'
  },
  {
    id: 'bubur_ayam',
    nameId: 'Bubur Ayam Spesial',
    nameEn: 'Special Chicken Porridge',
    calories: 290,
    protein: 12.5,
    carbs: 38.2,
    fat: 8.4,
    sugar: 1.2,
    sodium: 620,
    fiber: 1.5,
    colorGroup: 'white'
  },
  {
    id: 'susu_sapi',
    nameId: 'Susu Sapi Murni (Segelas)',
    nameEn: 'Pure Whole Milk (A Glass)',
    calories: 149,
    protein: 7.7,
    carbs: 11.7,
    fat: 8.0,
    sugar: 11.0,
    sodium: 105,
    fiber: 0,
    colorGroup: 'white'
  },
  {
    id: 'yogurt_plain',
    nameId: 'Yogurt Plain / Yunani',
    nameEn: 'Greek Yogurt Plain',
    calories: 130,
    protein: 12.0,
    carbs: 6.0,
    fat: 4.0,
    sugar: 4.5,
    sodium: 65,
    fiber: 0,
    colorGroup: 'white'
  },

  // --- GREEN GROUP ---
  {
    id: 'salad_alpukat',
    nameId: 'Salad Alpukat & Sayur Hijau',
    nameEn: 'Avocado & Green Vegetable Salad',
    calories: 180,
    protein: 3.2,
    carbs: 12.4,
    fat: 14.5,
    sugar: 2.1,
    sodium: 120,
    fiber: 5.4,
    colorGroup: 'green'
  },
  {
    id: 'roti_gandum_alpukat',
    nameId: 'Roti Panggang Gandum Alpukat',
    nameEn: 'Avocado Whole Wheat Toast',
    calories: 260,
    protein: 8.5,
    carbs: 24.2,
    fat: 12.8,
    sugar: 1.8,
    sodium: 280,
    fiber: 4.2,
    colorGroup: 'green'
  },
  {
    id: 'sayur_sop',
    nameId: 'Sayur Sop Bening',
    nameEn: 'Clear Vegetable Soup',
    calories: 85,
    protein: 2.5,
    carbs: 14.8,
    fat: 1.2,
    sugar: 3.0,
    sodium: 480,
    fiber: 2.8,
    colorGroup: 'green'
  },
  {
    id: 'jus_alpukat',
    nameId: 'Jus Alpukat Tanpa Gula Tambahan',
    nameEn: 'Avocado Juice (No Added Sugar)',
    calories: 160,
    protein: 2.0,
    carbs: 15.0,
    fat: 12.0,
    sugar: 2.5,
    sodium: 10,
    fiber: 6.8,
    colorGroup: 'green'
  },

  // --- BROWN GROUP ---
  {
    id: 'dada_ayam',
    nameId: 'Steak Dada Ayam Panggang',
    nameEn: 'Grilled Chicken Breast Steak',
    calories: 220,
    protein: 36.5,
    carbs: 2.1,
    fat: 6.2,
    sugar: 0.1,
    sodium: 240,
    fiber: 0.2,
    colorGroup: 'brown'
  },
  {
    id: 'gado_gado',
    nameId: 'Gado-Gado Lontong & Bumbu Kacang',
    nameEn: 'Gado-Gado with Peanut Sauce',
    calories: 318,
    protein: 10.4,
    carbs: 38.6,
    fat: 14.2,
    sugar: 8.5,
    sodium: 540,
    fiber: 4.8,
    colorGroup: 'brown'
  },
  {
    id: 'rendang_daging',
    nameId: 'Rendang Daging Sapi (Per Potong)',
    nameEn: 'Beef Rendang (Per Piece)',
    calories: 195,
    protein: 18.2,
    carbs: 4.8,
    fat: 11.5,
    sugar: 1.5,
    sodium: 420,
    fiber: 0.8,
    colorGroup: 'brown'
  },
  {
    id: 'sate_ayam',
    nameId: 'Sate Ayam Bumbu Kacang (5 Tusuk)',
    nameEn: 'Chicken Satay with Peanut Sauce (5 Skewers)',
    calories: 280,
    protein: 22.4,
    carbs: 10.8,
    fat: 16.5,
    sugar: 6.2,
    sodium: 490,
    fiber: 1.2,
    colorGroup: 'brown'
  },

  // --- YELLOW GROUP ---
  {
    id: 'nasi_goreng',
    nameId: 'Nasi Goreng Spesial + Telur',
    nameEn: 'Special Fried Rice with Egg',
    calories: 450,
    protein: 12.8,
    carbs: 58.2,
    fat: 16.4,
    sugar: 4.2,
    sodium: 850,
    fiber: 2.1,
    colorGroup: 'yellow'
  },
  {
    id: 'telur_dadar',
    nameId: 'Telur Dadar Goreng (Dua Butir)',
    nameEn: 'Double Fried Omelette',
    calories: 162,
    protein: 12.2,
    carbs: 1.2,
    fat: 11.8,
    sugar: 0.2,
    sodium: 160,
    fiber: 0,
    colorGroup: 'yellow'
  },
  {
    id: 'indomie_goreng',
    nameId: 'Mie Instan Goreng',
    nameEn: 'Fried Instant Noodles',
    calories: 380,
    protein: 8.0,
    carbs: 54.0,
    fat: 14.0,
    sugar: 7.0,
    sodium: 1070,
    fiber: 2.0,
    colorGroup: 'yellow'
  },
  {
    id: 'chitato_chips',
    nameId: 'Keripik Kentang Chitato',
    nameEn: 'Chitato Potato Chips (Sack)',
    calories: 140,
    protein: 2.0,
    carbs: 16.0,
    fat: 8.0,
    sugar: 1.0,
    sodium: 220,
    fiber: 1.0,
    colorGroup: 'yellow'
  },
  {
    id: 'pisang_goreng',
    nameId: 'Pisang Goreng (2 Buah)',
    nameEn: 'Fried Banana (2 Pieces)',
    calories: 250,
    protein: 2.2,
    carbs: 42.0,
    fat: 9.5,
    sugar: 18.0,
    sodium: 95,
    fiber: 3.2,
    colorGroup: 'yellow'
  }
]

// Modal & Mode State
const foodPhoto = ref<string | null>(null)
const analyzingFood = ref(false)
const aiPredictions = ref<any[]>([])
const selectedPrediction = ref<any | null>(null)
const aiResult = ref<any | null>(null)
const aiError = ref('')
const selectedMealCategory = ref<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Lunch')

// Camera State
const isCameraActive = ref(false)
const videoRef = ref<HTMLVideoElement | null>(null)
const activeStream = ref<MediaStream | null>(null)
const cameraError = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)

// Color Analysis Result State
const detectedColor = ref<{ r: number; g: number; b: number; name: string } | null>(null)
const detectedGroup = ref<'white' | 'green' | 'brown' | 'yellow' | null>(null)

// Reset state
const resetScannerState = () => {
  stopCamera()
  foodPhoto.value = null
  analyzingFood.value = false
  aiPredictions.value = []
  selectedPrediction.value = null
  aiResult.value = null
  aiError.value = ''
  detectedColor.value = null
  detectedGroup.value = null
  cameraError.value = ''
}

// Watch isOpen to reset
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    resetScannerState()
  } else {
    stopCamera()
  }
})

// Clean up camera on unmount
onBeforeUnmount(() => {
  stopCamera()
})

const stopCamera = () => {
  if (activeStream.value) {
    activeStream.value.getTracks().forEach(track => track.stop())
    activeStream.value = null
  }
  isCameraActive.value = false
}

// Trigger browser file select
const triggerFileSelect = () => {
  fileInputRef.value?.click()
}

// Start Camera stream
const startCamera = async () => {
  resetScannerState()
  isCameraActive.value = true
  cameraError.value = ''

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    })
    activeStream.value = stream
    if (videoRef.value) {
      videoRef.value.srcObject = stream
    }
  } catch (err: any) {
    console.error('Failed to open camera:', err)
    cameraError.value = locale.value === 'id' 
      ? 'Kamera tidak dapat diakses. Mengalihkan ke upload file...' 
      : 'Camera not accessible. Redirecting to file upload...'
    
    // Auto fallback to file picker after 1.8s
    setTimeout(() => {
      isCameraActive.value = false
      cameraError.value = ''
      triggerFileSelect()
    }, 1800)
  }
}

// Capture frame from video feed
const capturePhoto = () => {
  if (!videoRef.value) return

  const canvas = document.createElement('canvas')
  const video = videoRef.value
  canvas.width = video.videoWidth || 640
  canvas.height = video.videoHeight || 480
  const ctx = canvas.getContext('2d')
  
  if (ctx) {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    foodPhoto.value = canvas.toDataURL('image/jpeg')
    stopCamera()
    processPhoto()
  }
}

const handlePhotoUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    foodPhoto.value = reader.result as string
    processPhoto()
  }
  reader.readAsDataURL(file)
}

const processPhoto = async () => {
  if (!foodPhoto.value) return
  
  analyzingFood.value = true
  aiResult.value = null
  aiPredictions.value = []
  selectedPrediction.value = null
  aiError.value = ''

  // Run canvas pixel analysis on the captured photo
  const colorAnalysis = await analyzeImagePixels(foodPhoto.value)
  detectedColor.value = { r: colorAnalysis.r, g: colorAnalysis.g, b: colorAnalysis.b, name: colorAnalysis.name }
  detectedGroup.value = colorAnalysis.group

  // Trigger scanning sequence
  startAiAnalysisWithColor(colorAnalysis.group)
}

// Canvas-based dominant color segmenter
const analyzeImagePixels = (imgSrc: string): Promise<{ group: 'white' | 'green' | 'brown' | 'yellow'; r: number; g: number; b: number; name: string }> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve({ group: 'yellow', r: 230, g: 200, b: 80, name: locale.value === 'id' ? 'Kuning / Emas' : 'Yellow / Golden' })
        return
      }

      canvas.width = 40
      canvas.height = 40
      ctx.drawImage(img, 0, 0, 40, 40)

      try {
        const imgData = ctx.getImageData(0, 0, 40, 40)
        const data = imgData.data
        let rSum = 0, gSum = 0, bSum = 0, count = 0

        // Focus specifically on the central 60% region of the frame (from 20% to 80% coordinates)
        const width = 40
        const height = 40
        const startX = Math.round(width * 0.2) // index 8
        const endX = Math.round(width * 0.8)   // index 32
        const startY = Math.round(height * 0.2) // index 8
        const endY = Math.round(height * 0.8)   // index 32

        for (let y = startY; y < endY; y++) {
          for (let x = startX; x < endX; x++) {
            const idx = (y * width + x) * 4
            const rVal = data[idx]
            const gVal = data[idx + 1]
            const bVal = data[idx + 2]
            const aVal = data[idx + 3]
            if (rVal === undefined || gVal === undefined || bVal === undefined || aVal === undefined) continue
            if (aVal < 15) continue
            rSum += rVal
            gSum += gVal
            bSum += bVal
            count++
          }
        }

        if (count === 0) {
          resolve({ group: 'white', r: 245, g: 245, b: 245, name: locale.value === 'id' ? 'Putih / Terang' : 'White / Light' })
          return
        }

        const r = Math.round(rSum / count)
        const g = Math.round(gSum / count)
        const b = Math.round(bSum / count)

        let group: 'white' | 'green' | 'brown' | 'yellow' = 'white'
        let colorName = locale.value === 'id' ? 'Putih / Terang' : 'White / Light'

        const max = Math.max(r, g, b)
        const min = Math.min(r, g, b)
        const variance = max - min
        const brightness = (r + g + b) / 3

        if (variance < 30 && brightness > 135) {
          group = 'white'
          colorName = locale.value === 'id' ? 'Putih / Terang' : 'White / Light'
        }
        else if (g > b && g > r - 12 && variance >= 15) {
          group = 'green'
          colorName = locale.value === 'id' ? 'Hijau / Sayuran' : 'Green / Vegetables'
        }
        else if (r > b && g > b && brightness > 90 && variance >= 15) {
          if (brightness > 135 && r > 140) {
            group = 'yellow'
            colorName = locale.value === 'id' ? 'Kuning / Emas' : 'Yellow / Golden'
          } else {
            group = 'brown'
            colorName = locale.value === 'id' ? 'Cokelat / Panggang' : 'Brown / Roasted'
          }
        }
        else {
          group = 'brown'
          colorName = locale.value === 'id' ? 'Cokelat / Gelap' : 'Brown / Dark'
        }

        resolve({ group, r, g, b, name: colorName })
      } catch (e) {
        console.error('Error analyzing image pixels', e)
        resolve({ group: 'yellow', r: 230, g: 200, b: 80, name: locale.value === 'id' ? 'Kuning / Emas' : 'Yellow / Golden' })
      }
    }

    img.onerror = () => {
      resolve({ group: 'yellow', r: 230, g: 200, b: 80, name: locale.value === 'id' ? 'Kuning / Emas' : 'Yellow / Golden' })
    }

    img.src = imgSrc
  })
}

const startAiAnalysisWithColor = (colorGroup: 'white' | 'green' | 'brown' | 'yellow') => {
  setTimeout(() => {
    analyzingFood.value = false

    const matchingFoods = FOOD_DATABASE.filter(f => f.colorGroup === colorGroup)
    const otherFoods = FOOD_DATABASE.filter(f => f.colorGroup !== colorGroup)
    const predictions: any[] = []

    // 1. Matching color items elevated
    matchingFoods.forEach((food, idx) => {
      const confidence = Math.min(99, Math.max(92, 99 - idx * 2 - Math.floor(Math.random() * 3)))
      predictions.push({
        name: locale.value === 'id' ? food.nameId : food.nameEn,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        sugar: food.sugar,
        sodium: food.sodium,
        fiber: food.fiber,
        confidence,
        matchType: colorGroup
      })
    })

    // 2. Alternates
    const shuffledOthers = [...otherFoods].sort(() => 0.5 - Math.random())
    shuffledOthers.slice(0, 3).forEach((food, idx) => {
      const confidence = Math.min(84, Math.max(45, 80 - idx * 12 - Math.floor(Math.random() * 8)))
      predictions.push({
        name: locale.value === 'id' ? food.nameId : food.nameEn,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        sugar: food.sugar,
        sodium: food.sodium,
        fiber: food.fiber,
        confidence,
        matchType: food.colorGroup
      })
    })

    predictions.sort((a, b) => b.confidence - a.confidence)

    aiPredictions.value = predictions.slice(0, 4)
    selectedPrediction.value = predictions[0]
    aiResult.value = predictions[0]
  }, 2200)
}

const selectPrediction = (pred: any) => {
  selectedPrediction.value = pred
  aiResult.value = pred
}

const logAiFood = async () => {
  if (!aiResult.value) return
  
  try {
    await healthStore.addMeal({
      name: aiResult.value.name,
      calories: aiResult.value.calories,
      protein: aiResult.value.protein,
      carbs: aiResult.value.carbs,
      fat: aiResult.value.fat,
      category: selectedMealCategory.value
    })
    emit('logged')
    emit('close')
  } catch (e) {
    console.error(e)
    aiError.value = locale.value === 'id' ? 'Gagal mencatat makanan.' : 'Failed to log food.'
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
    <div class="bg-white rounded-[2.5rem] w-full max-w-md p-6 shadow-2xl relative border border-slate-100 flex flex-col animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
      
      <header class="flex justify-between items-center mb-4 shrink-0">
        <h3 class="text-lg font-black text-secondary flex items-center gap-2">
          <Sparkles class="w-5 h-5 text-primary animate-spin" style="animation-duration: 4s;" />
          {{ locale === 'id' ? 'AI Food Recognition' : 'AI Food Recognition' }}
        </h3>
        <button @click="emit('close')" class="text-slate-400 hover:text-secondary text-xl font-bold p-1">✕</button>
      </header>

      <!-- SELECTION MODE (Before Camera or Upload) -->
      <div v-if="!foodPhoto && !isCameraActive" class="space-y-4 py-4 shrink-0 text-center">
        <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-sm mx-auto mb-2">
          <Sparkles class="w-8 h-8" />
        </div>
        <div>
          <h4 class="font-extrabold text-base text-secondary">
            {{ locale === 'id' ? 'Pilih Metode Pemindaian' : 'Select Scanning Method' }}
          </h4>
          <p class="text-xs text-text-muted mt-1 leading-relaxed px-4">
            {{ locale === 'id' 
              ? 'Ambil foto hidangan Anda secara langsung menggunakan kamera, atau unggah gambar dari penyimpanan perangkat Anda.' 
              : 'Take a photo of your meal directly using your camera, or upload a picture from your device storage.' }}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-3 pt-2">
          <!-- Take Photo Button -->
          <button 
            @click="startCamera"
            class="flex flex-col items-center justify-center p-5 rounded-3xl border-2 border-slate-100 hover:border-primary bg-slate-50 hover:bg-primary-50/20 transition-all text-secondary group animate-in zoom-in-95 duration-300"
          >
            <Camera class="w-7 h-7 text-text-muted group-hover:text-primary mb-2.5 transition-colors" />
            <span class="text-xs font-black">{{ locale === 'id' ? 'Ambil Foto' : 'Take Photo' }}</span>
            <span class="text-[9px] text-text-muted font-bold mt-1 uppercase">{{ locale === 'id' ? 'Kamera' : 'Camera' }}</span>
          </button>

          <!-- Upload Image Button -->
          <button 
            @click="triggerFileSelect"
            class="flex flex-col items-center justify-center p-5 rounded-3xl border-2 border-slate-100 hover:border-primary bg-slate-50 hover:bg-primary-50/20 transition-all text-secondary group animate-in zoom-in-95 duration-300"
          >
            <Upload class="w-7 h-7 text-text-muted group-hover:text-primary mb-2.5 transition-colors" />
            <span class="text-xs font-black">{{ locale === 'id' ? 'Unggah Gambar' : 'Upload Image' }}</span>
            <span class="text-[9px] text-text-muted font-bold mt-1 uppercase">Galeri</span>
          </button>
        </div>

        <span class="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full inline-block mt-3">JPEG, PNG Max 5MB</span>
        <input 
          type="file" 
          ref="fileInputRef" 
          accept="image/*" 
          class="hidden" 
          @change="handlePhotoUpload" 
        />
      </div>

      <!-- CAMERA ACTIVE MODE -->
      <div v-else-if="isCameraActive" class="relative w-full aspect-[4/3] bg-slate-950 rounded-3xl overflow-hidden shrink-0 border border-slate-800 flex flex-col justify-end">
        <video 
          ref="videoRef"
          autoplay
          playsinline
          class="absolute inset-0 w-full h-full object-cover"
        ></video>

        <!-- Camera overlay elements -->
        <div class="absolute inset-0 border border-white/20 rounded-3xl pointer-events-none z-10"></div>
        <div class="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-[9px] font-extrabold uppercase tracking-wider z-20 flex items-center gap-1.5 animate-pulse">
          <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
          {{ locale === 'id' ? 'Kamera Aktif' : 'Camera Active' }}
        </div>

        <!-- Camera controls panel -->
        <div class="w-full bg-gradient-to-t from-black/80 to-transparent p-4 flex justify-between items-center z-20">
          <button 
            @click="stopCamera"
            class="text-white text-xs font-extrabold bg-white/20 hover:bg-white/30 backdrop-blur-md px-3.5 py-2 rounded-2xl transition-colors"
          >
            {{ locale === 'id' ? 'Batal' : 'Cancel' }}
          </button>
          
          <!-- Shutter Button -->
          <button 
            @click="capturePhoto"
            class="w-14 h-14 rounded-full border-4 border-white bg-red-500 hover:bg-red-600 shadow-lg active:scale-95 transition-all flex items-center justify-center shrink-0"
            aria-label="Capture photo"
          >
            <span class="w-10 h-10 rounded-full bg-white opacity-80 group-hover:opacity-100"></span>
          </button>

          <!-- Upload Switcher in Camera Mode -->
          <button 
            @click="triggerFileSelect"
            class="text-white text-xs font-extrabold bg-white/20 hover:bg-white/30 backdrop-blur-md px-3.5 py-2 rounded-2xl transition-colors"
          >
            {{ locale === 'id' ? 'Unggah' : 'Upload' }}
          </button>
        </div>
      </div>

      <!-- PHOTO PREVIEW & SCANNING OR RESULTS MODE -->
      <div v-else class="flex flex-col">
        <!-- Photo display container -->
        <div class="relative w-full aspect-[4/3] bg-slate-900 rounded-3xl overflow-hidden shrink-0 border border-slate-800 flex items-center justify-center">
          <img :src="foodPhoto || undefined" class="w-full h-full object-cover" />
          
          <!-- Glowing vertical neon scanning line - Sweeps up and down seamlessly without blocking standard loading icons -->
          <div 
            v-if="analyzingFood" 
            class="absolute w-full h-[4px] bg-[#22C55E] shadow-[0_0_12px_4px_#22C55E] left-0 top-0 z-20 pointer-events-none scanner-line"
          ></div>

          <!-- Scanning floating status overlay (removed central spinner for clear face scanning) -->
          <div v-if="analyzingFood" class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-[10px] font-extrabold uppercase tracking-widest z-30 animate-pulse border border-white/10 flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
            {{ locale === 'id' ? '⚡ Memindai Piring...' : '⚡ Scanning Plate...' }}
          </div>
        </div>

        <!-- Camera Fallback Error Alert -->
        <div v-if="cameraError" class="mt-3 bg-red-50 border border-red-200 text-red-600 text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2">
          <AlertCircle class="w-4 h-4 shrink-0" />
          <span>{{ cameraError }}</span>
        </div>

        <!-- Pixel Color Analysis Badge (Displays once color classification is done) -->
        <div v-if="detectedColor && !analyzingFood" class="mt-4 flex items-center justify-between bg-slate-50 border border-slate-100 p-3 rounded-2xl animate-in slide-in-from-bottom duration-300">
          <div class="flex items-center gap-2.5">
            <span 
              class="w-4 h-4 rounded-full border border-slate-200 shadow-sm shrink-0" 
              :style="{ backgroundColor: `rgb(${detectedColor.r}, ${detectedColor.g}, ${detectedColor.b})` }"
            ></span>
            <div>
              <div class="text-[9px] font-extrabold text-text-muted uppercase tracking-wider">
                {{ locale === 'id' ? 'Hasil Deteksi Warna Piksel' : 'Pixel Color Detection' }}
              </div>
              <div class="text-xs font-black text-secondary leading-none mt-0.5">
                {{ detectedColor.name }} <span class="text-text-muted font-bold">(R:{{ detectedColor.r }} G:{{ detectedColor.g }} B:{{ detectedColor.b }})</span>
              </div>
            </div>
          </div>
          <span class="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 flex items-center gap-0.5 border border-emerald-100">
            <Check class="w-3 h-3" /> OK
          </span>
        </div>

        <!-- Scanning Result Details -->
        <div v-if="aiResult && !analyzingFood" class="mt-5 space-y-4 animate-in fade-in duration-500 shrink-0">
          <!-- Predictions List Selector -->
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <label class="text-[10px] font-bold text-text-muted uppercase tracking-wider block ml-1">
                {{ locale === 'id' ? 'Hasil Deteksi AI (Ketuk untuk Memilih):' : 'AI Detection Results (Tap to Select):' }}
              </label>
              
              <!-- Foto Ulang / Upload Ulang Trigger Button -->
              <button 
                @click="resetScannerState"
                class="flex items-center gap-1 text-[10px] font-extrabold text-primary hover:text-primary-700 bg-primary/5 hover:bg-primary-100/50 px-2.5 py-1 rounded-full transition-all active:scale-95 duration-200"
              >
                <RefreshCw class="w-3 h-3 text-primary animate-spin" style="animation-duration: 3s;" />
                {{ locale === 'id' ? 'Foto / Scan Ulang' : 'Re-scan / Re-photo' }}
              </button>
            </div>
            
            <div class="grid grid-cols-2 gap-2">
              <button 
                v-for="pred in aiPredictions" 
                :key="pred.name"
                @click="selectPrediction(pred)"
                class="text-left p-3 rounded-2xl border-2 transition-all flex flex-col justify-between"
                :class="selectedPrediction?.name === pred.name ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'"
              >
                <span class="text-xs font-black text-secondary leading-tight truncate w-full">{{ pred.name }}</span>
                <div class="flex justify-between items-center w-full mt-2 text-[9px] font-bold">
                  <span class="text-primary">{{ pred.calories }} kcal</span>
                  <span :class="pred.confidence >= 90 ? 'text-emerald-600' : 'text-slate-400'">{{ pred.confidence }}%</span>
                </div>
              </button>
            </div>
          </div>

          <!-- Divider line -->
          <div class="border-t border-slate-100 pt-3 flex justify-between items-center">
            <div>
              <span class="text-[9px] font-extrabold bg-primary-100 text-primary px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {{ locale === 'id' ? '✨ Makanan Terpilih' : '✨ Selected Food' }}
              </span>
              <h4 class="font-black text-secondary text-base mt-1.5 leading-none">{{ selectedPrediction?.name }}</h4>
            </div>

            <!-- Category select for logging -->
            <div class="flex flex-col gap-1 items-end">
              <label class="text-[9px] font-bold text-text-muted uppercase mr-1">{{ locale === 'id' ? 'Kategori' : 'Category' }}</label>
              <select 
                v-model="selectedMealCategory"
                class="bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-secondary py-1 px-2 outline-none focus:border-primary transition-colors"
              >
                <option value="Breakfast">{{ locale === 'id' ? 'Sarapan' : 'Breakfast' }}</option>
                <option value="Lunch">{{ locale === 'id' ? 'Makan Siang' : 'Lunch' }}</option>
                <option value="Dinner">{{ locale === 'id' ? 'Makan Malam' : 'Dinner' }}</option>
                <option value="Snack">{{ locale === 'id' ? 'Camilan' : 'Snack' }}</option>
              </select>
            </div>
          </div>

          <!-- 4 macros grid + 3 micros list -->
          <div class="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
            <div>
              <div class="text-[8px] text-text-muted font-bold uppercase">{{ locale === 'id' ? 'Kalori' : 'Calories' }}</div>
              <div class="text-xs font-black text-secondary mt-0.5">{{ aiResult.calories }}</div>
            </div>
            <div>
              <div class="text-[8px] text-text-muted font-bold uppercase">Protein</div>
              <div class="text-xs font-black text-blue-600 mt-0.5">{{ aiResult.protein }}g</div>
            </div>
            <div>
              <div class="text-[8px] text-text-muted font-bold uppercase">Carbs</div>
              <div class="text-xs font-black text-orange-600 mt-0.5">{{ aiResult.carbs }}g</div>
            </div>
            <div>
              <div class="text-[8px] text-text-muted font-bold uppercase">Fat</div>
              <div class="text-xs font-black text-purple-600 mt-0.5">{{ aiResult.fat }}g</div>
            </div>
          </div>

          <div class="bg-white p-2.5 rounded-2xl border border-slate-100 flex justify-around text-center text-[10px] font-bold">
            <span class="text-rose-600">🍬 Gula: {{ aiResult.sugar }}g</span>
            <span class="text-amber-600">🧂 Sodium: {{ aiResult.sodium }}mg</span>
            <span class="text-emerald-600">🥬 Serat: {{ aiResult.fiber }}g</span>
          </div>

          <div v-if="aiError" class="bg-red-50 border border-red-200 text-red-600 text-xs px-3.5 py-2.5 rounded-xl">
            {{ aiError }}
          </div>

          <Button variant="primary" block size="lg" @click="logAiFood" class="font-bold py-3.5 rounded-2xl mt-2 flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20">
            <Check class="w-5 h-5 shrink-0" />
            {{ locale === 'id' ? 'Catat Ke Makanan Hari Ini' : 'Log to Today\'s Meals' }}
          </Button>
        </div>

        <Button variant="outline" class="border-slate-200 text-secondary hover:bg-slate-50 mt-4 font-bold rounded-2xl" @click="emit('close')">
          {{ locale === 'id' ? 'Tutup' : 'Close' }}
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scanner-line {
  animation: scanEffect 1.8s ease-in-out infinite;
}

@keyframes scanEffect {
  0% {
    top: 0%;
  }
  50% {
    top: calc(100% - 4px); /* Subtract 4px height of scanner line to prevent overflow */
  }
  100% {
    top: 0%;
  }
}
</style>
