<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { Camera, ChevronLeft, Search, Check, AlertCircle, Sparkles, Loader2 } from '@lucide/vue'
import Input from '~/components/ui/Input.vue'
import Button from '~/components/ui/Button.vue'
import Card from '~/components/ui/Card.vue'
import { useHealthStore } from '~/stores/health'
import { useGamificationStore } from '~/stores/gamification'
import { useI18n } from '#imports'

const router = useRouter()
const healthStore = useHealthStore()
const gamificationStore = useGamificationStore()
const { t, locale } = useI18n()

// Tabs: 'search' | 'manual'
const activeTab = ref<'search' | 'manual'>('search')

// Shared State
const selectedCategory = ref<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Breakfast')
const categories = ['Breakfast', 'Lunch', 'Dinner', 'Snack']

const getCategoryLabel = (category: string) => {
  if (category === 'Breakfast') return locale.value === 'id' ? 'Sarapan' : 'Breakfast'
  if (category === 'Lunch') return locale.value === 'id' ? 'Makan Siang' : 'Lunch'
  if (category === 'Dinner') return locale.value === 'id' ? 'Makan Malam' : 'Dinner'
  return locale.value === 'id' ? 'Camilan' : 'Snack'
}

// Search Tab State
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const loadingSearch = ref(false)
const searchError = ref('')

// Scan Modal & Real Camera State
const showScanModal = ref(false)
const videoRef = ref<HTMLVideoElement | null>(null)
const cameraActive = ref(false)
const loadingCamera = ref(false)
const cameraError = ref('')
const manualBarcode = ref('')
const loadingScan = ref(false)
const scanError = ref('')
const scannedProduct = ref<any>(null)

let videoStream: MediaStream | null = null
let detectionInterval: any = null

// Start real browser camera stream
const startCamera = async () => {
  loadingCamera.value = true
  cameraError.value = ''
  scannedProduct.value = null
  scanError.value = ''
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
    })
    
    videoStream = stream
    cameraActive.value = true
    
    // Bind stream to video element
    setTimeout(() => {
      if (videoRef.value) {
        videoRef.value.srcObject = stream
        startDetectionLoop()
      }
    }, 100)
  } catch (err: any) {
    cameraError.value = locale.value === 'id' 
      ? 'Tidak dapat mengakses kamera. Pastikan memberikan izin kamera.' 
      : 'Cannot access camera. Please make sure camera permission is granted.'
    console.error(err)
  } finally {
    loadingCamera.value = false
  }
}

// Stop video camera stream
const stopCamera = () => {
  if (videoStream) {
    videoStream.getTracks().forEach(track => track.stop())
    videoStream = null
  }
  cameraActive.value = false
  if (detectionInterval) {
    clearInterval(detectionInterval)
    detectionInterval = null
  }
}

// Browser native Barcode Detector loop
const startDetectionLoop = () => {
  if (!('BarcodeDetector' in window)) {
    console.warn('BarcodeDetector not supported. Providing manual input option.')
    return
  }
  
  try {
    const detector = new (window as any).BarcodeDetector({
      formats: ['ean_13', 'ean_8', 'upc_a', 'code_128']
    })
    
    detectionInterval = setInterval(async () => {
      if (!videoRef.value || !cameraActive.value) return
      try {
        const barcodes = await detector.detect(videoRef.value)
        if (barcodes && barcodes.length > 0) {
          const code = barcodes[0].rawValue
          stopCamera()
          // Automatically query the scanned barcode
          await handleBarcodeQuery(code)
        }
      } catch (e) {
        // silently catch frames failure
      }
    }, 500)
  } catch (err) {
    console.error('Failed to initialize barcode detector:', err)
  }
}

// Open / Close Scan Modal
const openScanModal = () => {
  showScanModal.value = true
  startCamera()
}

const closeScanModal = () => {
  stopCamera()
  showScanModal.value = false
}

onBeforeUnmount(() => {
  stopCamera()
})

// Offline/busy fallback catalog for common foods
const LOCAL_FOODS_FALLBACK = [
  { name: 'Nasi Putih (White Rice)', calories: 130, protein: 2, carbs: 28, fat: 0, brand: 'Generic / Umum' },
  { name: 'Dada Ayam Panggang (Grilled Chicken Breast)', calories: 165, protein: 31, carbs: 0, fat: 4, brand: 'Generic / Umum' },
  { name: 'Telur Goreng (Fried Egg)', calories: 90, protein: 6, carbs: 0, fat: 7, brand: 'Generic / Umum' },
  { name: 'Telur Rebus (Boiled Egg)', calories: 78, protein: 6, carbs: 0, fat: 5, brand: 'Generic / Umum' },
  { name: 'Pisang Cavendish (Cavendish Banana)', calories: 105, protein: 1, carbs: 27, fat: 0, brand: 'Generic / Umum' },
  { name: 'Apel Merah (Red Apple)', calories: 52, protein: 0, carbs: 14, fat: 0, brand: 'Generic / Umum' },
  { name: 'Roti Gandum (Whole Wheat Bread)', calories: 79, protein: 4, carbs: 14, fat: 1, brand: 'Generic / Umum' },
  { name: 'Susu Sapi Full Cream (Whole Milk)', calories: 149, protein: 8, carbs: 12, fat: 8, brand: 'Generic / Umum' },
  { name: 'Chitato Kentang (Chitato Potato Chips)', calories: 150, protein: 2, carbs: 16, fat: 9, brand: 'Indofood' },
  { name: 'Chitato Sapi Panggang (Beef Potato Chips)', calories: 150, protein: 2, carbs: 16, fat: 9, brand: 'Indofood' },
  { name: 'Indomie Goreng (Indomie Instant Noodles)', calories: 380, protein: 8, carbs: 54, fat: 14, brand: 'Indofood' },
  { name: 'Tahu Goreng (Fried Tofu)', calories: 35, protein: 3, carbs: 1, fat: 3, brand: 'Generic / Umum' },
  { name: 'Tempe Goreng (Fried Tempeh)', calories: 120, protein: 6, carbs: 8, fat: 8, brand: 'Generic / Umum' },
  { name: 'Bubur Ayam (Chicken Porridge)', calories: 250, protein: 12, carbs: 35, fat: 6, brand: 'Generic / Umum' },
  { name: 'Sate Ayam (Chicken Satay - 5 skewers)', calories: 185, protein: 15, carbs: 4, fat: 12, brand: 'Generic / Umum' }
]

// OpenFoodFacts search handler
const performSearch = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }
  
  loadingSearch.value = true
  searchError.value = ''
  
  try {
    const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(searchQuery.value)}&json=true&page_size=10`)
    if (!res.ok) {
      throw new Error(`HTTP_${res.status}`)
    }
    const data = await res.json()
    
    if (data && data.products) {
      searchResults.value = data.products.map((p: any) => {
        const kcal = p.nutriments?.['energy-kcal_100g'] || p.nutriments?.['energy-kcal'] || 0
        return {
          name: p.product_name || (locale.value === 'id' ? 'Produk Tanpa Nama' : 'Unnamed Product'),
          brand: p.brands || p.creator || (locale.value === 'id' ? 'Brand Umum' : 'Generic Brand'),
          calories: Math.round(kcal),
          protein: Math.round(p.nutriments?.proteins_100g || 0),
          carbs: Math.round(p.nutriments?.carbohydrates_100g || 0),
          fat: Math.round(p.nutriments?.fat_100g || 0),
          image: p.image_front_thumb_url || p.image_thumb_url || ''
        }
      })
    } else {
      searchResults.value = []
    }
  } catch (err: any) {
    console.error('Search error, using local fallback:', err)
    
    // Friendly error messaging
    searchError.value = locale.value === 'id'
      ? 'Server database makanan sibuk (Error 503/Offline). Menampilkan hasil cadangan lokal.'
      : 'Food database server is busy (Error 503/Offline). Showing offline backup recommendations.'
    
    // Search in offline local catalog
    const query = searchQuery.value.toLowerCase()
    searchResults.value = LOCAL_FOODS_FALLBACK.filter(food => 
      food.name.toLowerCase().includes(query) || 
      food.brand.toLowerCase().includes(query)
    ).map(food => ({
      ...food,
      image: ''
    }))
  } finally {
    loadingSearch.value = false
  }
}

// Debounce search input
let debounceTimer: any = null
watch(searchQuery, () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    performSearch()
  }, 600)
})

// Log food item to store
const logFoodItem = async (food: {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
}) => {
  try {
    await healthStore.addMeal({
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      category: selectedCategory.value
    })
    gamificationStore.initializeStore()
    gamificationStore.checkProgress(healthStore)
    router.push('/food')
  } catch (e) {
    console.error(e)
  }
}

// Fetch Barcode data from OpenFoodFacts API
const handleBarcodeQuery = async (code: string) => {
  if (!code) return
  loadingScan.value = true
  scanError.value = ''
  scannedProduct.value = null
  
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`)
    if (!res.ok) {
      throw new Error(`HTTP_${res.status}`)
    }
    const data = await res.json()
    
    if (data.status === 1 && data.product) {
      const p = data.product
      const kcal = p.nutriments?.['energy-kcal_100g'] || p.nutriments?.['energy-kcal_serving'] || p.nutriments?.['energy-kcal'] || 0
      scannedProduct.value = {
        name: p.product_name || (locale.value === 'id' ? 'Produk Tidak Dikenal' : 'Unknown Product'),
        brand: p.brands || (locale.value === 'id' ? 'Brand Umum' : 'Generic Brand'),
        calories: Math.round(kcal),
        protein: Math.round(p.nutriments?.proteins_100g || 0),
        carbs: Math.round(p.nutriments?.carbohydrates_100g || 0),
        fat: Math.round(p.nutriments?.fat_100g || 0),
        barcode: code
      }
    } else {
      scanError.value = locale.value === 'id' 
        ? 'Produk tidak ditemukan. Coba kode barcode lain.' 
        : 'Product not found. Try another barcode.'
    }
  } catch (err: any) {
    console.error('Barcode fetch error:', err)
    scanError.value = locale.value === 'id'
      ? 'Database makanan tidak merespons (Error 503/Offline). Silakan gunakan tab Catat Manual.'
      : 'Food database server is temporarily offline (Error 503/Offline). Please use the Log Manually tab.'
  } finally {
    loadingScan.value = false
  }
}

// Manual Form States
const manualName = ref('')
const manualCalories = ref<number | ''>('')
const manualProtein = ref<number | ''>('')
const manualCarbs = ref<number | ''>('')
const manualFat = ref<number | ''>('')
const loggingManual = ref(false)
const manualError = ref('')

const handleLogManual = async () => {
  if (!manualName.value.trim() || manualCalories.value === '') {
    manualError.value = t('food.errFillFields')
    return
  }
  
  loggingManual.value = true
  manualError.value = ''
  
  try {
    await logFoodItem({
      name: manualName.value,
      calories: Number(manualCalories.value),
      protein: Number(manualProtein.value || 0),
      carbs: Number(manualCarbs.value || 0),
      fat: Number(manualFat.value || 0)
    })
  } catch (err) {
    manualError.value = t('common.error')
  } finally {
    loggingManual.value = false
  }
}
</script>

<template>
  <div class="px-6 py-8 pb-32 flex flex-col">
    <header class="flex items-center gap-4 mb-6">
      <button @click="router.back()" class="p-2 bg-white rounded-full shadow-soft text-secondary hover:bg-slate-50 transition-colors">
        <ChevronLeft class="w-6 h-6" />
      </button>
      <h1 class="text-xl font-bold text-secondary">{{ t('food.addTitle') }}</h1>
    </header>

    <!-- Category Selector -->
    <div class="mb-6">
      <label class="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2.5 ml-1">
        {{ t('food.categoryLabel') }}
      </label>
      <div class="grid grid-cols-4 bg-slate-200/60 p-1 rounded-2xl">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="selectedCategory = cat as any"
          :class="[
            'py-2 px-1 text-xs font-bold rounded-xl transition-all duration-300',
            selectedCategory === cat ? 'bg-white text-secondary shadow-sm' : 'text-text-muted dark:!text-slate-600 hover:text-secondary'
          ]"
        >
          {{ getCategoryLabel(cat) }}
        </button>
      </div>
    </div>

    <!-- Segment Switcher -->
    <div class="flex border-b border-slate-200 mb-6">
      <button 
        @click="activeTab = 'search'" 
        class="flex-1 py-3 text-sm font-bold border-b-2 transition-all"
        :class="activeTab === 'search' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-secondary'"
      >
        {{ locale === 'id' ? 'Cari & Scan Barcode' : 'Search & Scan Barcode' }}
      </button>
      <button 
        @click="activeTab = 'manual'" 
        class="flex-1 py-3 text-sm font-bold border-b-2 transition-all"
        :class="activeTab === 'manual' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-secondary'"
      >
        {{ locale === 'id' ? 'Catat Manual' : 'Log Manually' }}
      </button>
    </div>

    <!-- TAB 1: SEARCH & SCAN -->
    <div v-if="activeTab === 'search'" class="flex-1 flex flex-col">
      <Input v-model="searchQuery" :placeholder="t('food.addSearchPlaceholder')" icon class="mb-5">
        <template #icon>
          <Search class="w-5 h-5 text-slate-400" />
        </template>
      </Input>

      <!-- Barcode Scanner Trigger -->
      <div class="mb-6">
        <button 
          @click="openScanModal"
          class="w-full py-4 border-2 border-dashed border-primary-300 rounded-3xl flex items-center justify-center gap-3 text-primary-600 bg-primary-50/40 hover:bg-primary-50 transition-all hover:scale-[1.01] active:scale-95 dark:bg-slate-800/80 dark:border-slate-700"
        >
          <Camera class="w-6 h-6 animate-pulse dark:text-white" />
          <span class="font-bold text-sm dark:text-white">
            {{ locale === 'id' ? 'Buka Kamera & Scan Barcode' : 'Open Camera & Scan Barcode' }}
          </span>
        </button>
      </div>

      <!-- Search results -->
      <div class="flex-1">
        <div class="flex justify-between items-center mb-3">
          <h2 class="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles class="w-4 h-4 text-amber-500" />
            {{ locale === 'id' ? 'Hasil Pencarian Produk' : 'Product Search Results' }}
          </h2>
          <span v-if="loadingSearch" class="text-xs text-primary animate-pulse font-medium">
            {{ locale === 'id' ? 'Mencari...' : 'Searching...' }}
          </span>
        </div>

        <div v-if="loadingSearch" class="space-y-3">
          <div v-for="i in 3" :key="i" class="h-20 bg-white/60 border border-slate-100 rounded-2xl animate-pulse"></div>
        </div>

        <div v-else-if="searchError" class="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-2xl mb-4">
          {{ searchError }}
        </div>

        <div v-else-if="searchResults.length > 0" class="space-y-3">
          <Card 
            v-for="food in searchResults" 
            :key="food.name" 
            padding="p-4" 
            class="flex justify-between items-center hover:border-primary-300 transition-colors bg-white border border-slate-100 shadow-sm"
          >
            <div class="flex items-center gap-4 min-w-0 flex-1">
              <div class="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center shrink-0 border border-slate-200">
                <img v-if="food.image" :src="food.image" class="w-full h-full object-cover" />
                <span v-else class="text-text-muted text-xs">🍕</span>
              </div>
              <div class="min-w-0 flex-1">
                <h4 class="font-bold text-secondary text-sm truncate">{{ food.name }}</h4>
                <p class="text-[10px] text-text-muted truncate mt-0.5">{{ food.brand }} • {{ food.calories }} kcal</p>
                <div class="flex gap-2 mt-1.5">
                  <span class="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">P: {{ food.protein }}g</span>
                  <span class="text-[9px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-bold">C: {{ food.carbs }}g</span>
                  <span class="text-[9px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded font-bold">F: {{ food.fat }}g</span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" class="ml-4 rounded-full p-2.5 h-10 w-10 text-primary border-primary hover:bg-primary hover:text-white font-bold" @click="logFoodItem(food)">
              +
            </Button>
          </Card>
        </div>

        <div v-else-if="searchQuery" class="text-center py-8 text-text-muted">
          <p class="text-sm font-semibold">
            {{ locale === 'id' ? 'Tidak ada produk yang cocok dengan pencarian Anda.' : 'No products matched your search.' }}
          </p>
        </div>

        <!-- Initial popular state -->
        <div v-else class="space-y-3">
          <p class="text-xs text-text-muted ml-1 mb-2">
            {{ locale === 'id' ? 'Pilihan populer yang sering dikonsumsi:' : 'Popular food options:' }}
          </p>
          <Card padding="p-4" class="flex justify-between items-center hover:border-primary-300 cursor-pointer bg-white border border-slate-100 shadow-sm" @click="logFoodItem({ name: locale === 'id' ? 'Telur Rebus' : 'Boiled Egg', calories: 78, protein: 6, carbs: 0, fat: 5 })">
            <div>
              <h4 class="font-bold text-secondary text-sm">{{ locale === 'id' ? 'Telur Rebus' : 'Boiled Egg' }}</h4>
              <p class="text-xs text-text-muted mt-0.5">
                {{ locale === 'id' ? '1 butir besar' : '1 large piece' }} • 78 kcal • P: 6g C: 0g F: 5g
              </p>
            </div>
            <Button variant="ghost" size="sm" class="text-primary bg-primary-50 rounded-full h-9 w-9 p-0 flex items-center justify-center font-bold">+</Button>
          </Card>
          <Card padding="p-4" class="flex justify-between items-center hover:border-primary-300 cursor-pointer bg-white border border-slate-100 shadow-sm" @click="logFoodItem({ name: locale === 'id' ? 'Pisang Cavendish' : 'Cavendish Banana', calories: 105, protein: 1, carbs: 27, fat: 0 })">
            <div>
              <h4 class="font-bold text-secondary text-sm">{{ locale === 'id' ? 'Pisang Cavendish' : 'Cavendish Banana' }}</h4>
              <p class="text-xs text-text-muted mt-0.5">
                {{ locale === 'id' ? '1 buah sedang' : '1 medium piece' }} • 105 kcal • P: 1g C: 27g F: 0g
              </p>
            </div>
            <Button variant="ghost" size="sm" class="text-primary bg-primary-50 rounded-full h-9 w-9 p-0 flex items-center justify-center font-bold">+</Button>
          </Card>
        </div>
      </div>
    </div>

    <!-- TAB 2: MANUAL LOG -->
    <div v-else class="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft flex flex-col space-y-4">
      <div>
        <h2 class="text-lg font-bold text-secondary">
          {{ locale === 'id' ? 'Formulir Catat Manual' : 'Manual Entry Form' }}
        </h2>
        <p class="text-xs text-text-muted mt-0.5">
          {{ locale === 'id' ? 'Catat makanan rumahan atau menu yang tidak memiliki barcode.' : 'Log homecooked meals or food without barcodes.' }}
        </p>
      </div>

      <Input v-model="manualName" :placeholder="t('food.addSearchPlaceholder')" />
      
      <div class="grid grid-cols-2 gap-4">
        <Input v-model="manualCalories" type="number" :placeholder="t('food.labelCalories')">
          <template #suffix>kcal</template>
        </Input>
        <Input v-model="manualProtein" type="number" :placeholder="t('food.labelProtein')">
          <template #suffix>g</template>
        </Input>
        <Input v-model="manualCarbs" type="number" :placeholder="t('food.labelCarbs')">
          <template #suffix>g</template>
        </Input>
        <Input v-model="manualFat" type="number" :placeholder="t('food.labelFat')">
          <template #suffix>g</template>
        </Input>
      </div>

      <div v-if="manualError" class="bg-red-50 border border-red-200 text-red-600 text-xs px-3.5 py-2 rounded-xl">
        {{ manualError }}
      </div>

      <Button type="button" variant="primary" block size="lg" :loading="loggingManual" @click="handleLogManual" class="font-bold">
        {{ t('food.addBtn') }}
      </Button>
    </div>

    <!-- BARCODE SCAN LIVE CAMERA MODAL -->
    <div v-if="showScanModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div class="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative border border-slate-100 flex flex-col animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-bold text-secondary mb-1 flex items-center gap-2">
          <Camera class="w-5 h-5 text-primary-500" />
          {{ locale === 'id' ? 'Pindai Barcode Produk' : 'Scan Product Barcode' }}
        </h3>
        <p class="text-xs text-text-muted mb-4">
          {{ locale === 'id' ? 'Arahkan kamera ponsel Anda ke barcode produk makanan untuk mendeteksi nutrisinya secara otomatis.' : 'Point your phone camera to the food barcode to automatically detect its nutrition.' }}
        </p>

        <!-- Camera Feed Container -->
        <div class="relative w-full aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden mb-4 border border-slate-800 flex items-center justify-center">
          <video 
            v-show="cameraActive && !loadingCamera"
            ref="videoRef" 
            autoplay 
            playsinline 
            class="w-full h-full object-cover"
          ></video>
          
          <!-- Scanning line animation -->
          <div v-if="cameraActive && !loadingCamera" class="absolute w-full h-[2px] bg-primary-500 shadow-[0_0_10px_#22C55E] top-1/2 left-0 transform -translate-y-1/2 animate-bounce"></div>

          <!-- Loading Camera state -->
          <div v-if="loadingCamera" class="flex flex-col items-center gap-2 text-white">
            <Loader2 class="w-8 h-8 animate-spin text-primary" />
            <span class="text-xs text-slate-300">
              {{ locale === 'id' ? 'Mengaktifkan kamera...' : 'Activating camera...' }}
            </span>
          </div>

          <!-- Camera error state -->
          <div v-if="cameraError" class="p-4 text-center text-xs text-red-400 font-medium">
            {{ cameraError }}
          </div>

          <!-- Inactive placeholder -->
          <div v-if="!cameraActive && !loadingCamera && !cameraError" class="text-slate-400 text-xs text-center p-4">
            {{ locale === 'id' ? 'Kamera dinonaktifkan' : 'Camera disabled' }}
          </div>
        </div>

        <!-- Manual text barcode field -->
        <div class="space-y-2 mb-4">
          <label class="text-xs font-bold text-text-muted block ml-1">
            {{ locale === 'id' ? 'Atau masukkan nomor barcode secara manual:' : 'Or enter the barcode number manually:' }}
          </label>
          <div class="flex gap-2">
            <Input v-model="manualBarcode" placeholder="E.g. EAN Barcode" type="text" class="flex-1" />
            <Button variant="outline" class="px-4 font-bold" @click="handleBarcodeQuery(manualBarcode)">
              {{ locale === 'id' ? 'Cari' : 'Search' }}
            </Button>
          </div>
        </div>

        <!-- Query loader -->
        <div v-if="loadingScan" class="py-6 flex flex-col items-center justify-center gap-2">
          <Loader2 class="w-8 h-8 animate-spin text-primary" />
          <span class="text-xs text-text-muted animate-pulse">
            {{ locale === 'id' ? 'Mengambil data produk...' : 'Fetching product data...' }}
          </span>
        </div>

        <!-- Scan error -->
        <div v-else-if="scanError" class="bg-red-50 border border-red-200 text-red-600 text-xs px-3.5 py-2.5 rounded-xl mb-4 flex items-start gap-2 animate-in fade-in">
          <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
          <span>{{ scanError }}</span>
        </div>

        <!-- Result -->
        <div v-else-if="scannedProduct" class="bg-green-50/50 border border-green-200 rounded-2xl p-4 mb-5 flex flex-col gap-3 animate-in fade-in duration-300">
          <div>
            <span class="text-[10px] text-primary-600 font-bold bg-primary-100 px-2 py-0.5 rounded-full uppercase">
              {{ locale === 'id' ? 'Nutrisi Ditemukan' : 'Nutrition Found' }}
            </span>
            <h4 class="font-bold text-secondary text-sm mt-1.5">{{ scannedProduct.name }}</h4>
            <p class="text-xs text-text-muted">{{ scannedProduct.brand }}</p>
          </div>

          <div class="grid grid-cols-4 gap-2 bg-white p-2.5 rounded-xl border border-slate-100 text-center">
            <div>
              <div class="text-[9px] text-text-muted font-bold">{{ locale === 'id' ? 'Kalori' : 'Calories' }}</div>
              <div class="text-xs font-bold text-secondary">{{ scannedProduct.calories }}</div>
            </div>
            <div>
              <div class="text-[9px] text-text-muted font-bold">Protein</div>
              <div class="text-xs font-bold text-blue-600">{{ scannedProduct.protein }}g</div>
            </div>
            <div>
              <div class="text-[9px] text-text-muted font-bold">Karbo</div>
              <div class="text-xs font-bold text-orange-600">{{ scannedProduct.carbs }}g</div>
            </div>
            <div>
              <div class="text-[9px] text-text-muted font-bold">Lemak</div>
              <div class="text-xs font-bold text-purple-600">{{ scannedProduct.fat }}g</div>
            </div>
          </div>

          <Button variant="primary" block size="sm" @click="logFoodItem(scannedProduct)" class="font-bold">
            <Check class="w-4 h-4 mr-1.5" />
            {{ locale === 'id' ? 'Catat Ke Makanan Hari Ini' : 'Log to Today\'s Meals' }}
          </Button>
        </div>

        <!-- Cancel/Close modal button -->
        <Button variant="outline" class="border-slate-200 text-secondary hover:bg-slate-50 mt-2 font-bold" @click="closeScanModal">
          {{ locale === 'id' ? 'Tutup Pemindai' : 'Close Scanner' }}
        </Button>
      </div>
    </div>
  </div>
</template>
