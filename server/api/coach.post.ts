import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { messages, userStats } = body

    if (!messages || !Array.isArray(messages)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Messages are required and must be an array'
      })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not defined in server environment!')
      throw createError({
        statusCode: 500,
        statusMessage: 'Gemini API key is not configured on the server'
      })
    }

    // Build highly personalized context instructions
    const name = userStats?.name || 'User Sehatin'
    const age = userStats?.age || 25
    const height = userStats?.height || 170
    const weight = userStats?.weight || 70
    const goalWeight = userStats?.goalWeight || 65
    const steps = userStats?.todaySteps || 0
    const water = userStats?.todayWater || 0
    const goalWater = userStats?.goalWater || 8
    const calories = userStats?.todayCalories || 0
    const goalCalories = userStats?.goalCalories || 2000
    const protein = userStats?.todayProtein || 0
    const carbs = userStats?.todayCarbs || 0
    const fat = userStats?.todayFat || 0
    const sugar = userStats?.todaySugar || 0

    const systemPrompt = `
Anda adalah Sehatin AI Nutrition Coach, konsultan nutrisi & diet personal pintar yang sangat ramah, suportif, informatif, dan profesional.
Anda sedang berbicara dengan ${name}.

Berikut adalah data fisik, target harian, & log progres harian milik ${name} HARI INI:
- Umur: ${age} tahun
- Tinggi Badan: ${height} cm
- Berat Badan Saat Ini: ${weight} kg (Target Berat Badan Ideal: ${goalWeight} kg)
- Langkah Kaki Hari Ini: ${steps.toLocaleString()} langkah
- Minum Air Hari Ini: ${water} gelas (Target Hidrasi: ${goalWater} gelas)
- Asupan Kalori Hari Ini: ${calories} kcal (Target Kalori Harian: ${goalCalories} kcal)
- Detail Asupan Makronutrisi Hari Ini:
  * Protein: ${protein}g
  * Karbohidrat: ${carbs}g
  * Lemak: ${fat}g
  * Gula: ${sugar}g

Tugas Utama Anda:
1. **Evaluasi Pola Makan**: Menganalisis asupan makanan harian ${name} di atas. Apakah kalori & rasio makronutrisinya sudah seimbang untuk hari ini? Berikan analisis khusus jika asupan gula harian melebihi 50 gram (batas gula tinggi) atau mendekati batasnya.
2. **Saran Diet**: Berikan saran diet sehat yang cerdas, aplikatif, dan suportif berdasarkan profil fisik, aktivitas langkah kaki harian, serta tujuan target berat badannya.
3. **Rekomendasi Makanan**: Rekomendasikan menu makan sehat, alternatif bahan makanan (food swaps), atau resep bernutrisi seimbang untuk sarapan, makan siang, makan malam, atau camilan rendah kalori yang mudah dibuat.

Panduan Komunikasi Anda:
- Gunakan bahasa yang hangat, memotivasi, penuh semangat, namun tetap ilmiah dan edukatif.
- Secara default, jawablah menggunakan Bahasa Indonesia yang santun & natural. Namun, jika user menyapa atau bertanya dalam Bahasa Inggris, jawablah dalam Bahasa Inggris.
- Format jawaban Anda menggunakan format markdown yang sangat rapi (bolding, bullet points, emoji, table jika diperlukan) agar jawaban Anda sangat terstruktur, bersih, dan memanjakan mata.
- Jawablah secara ringkas, padat, dan langsung menjawab esensi pertanyaan (jangan terlalu bertele-tele agar user nyaman berdiskusi).
`

    // Call official Gemini REST API (gemini-2.5-flash)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`

    const apiBody = {
      contents: messages,
      systemInstruction: {
        parts: [
          { text: systemPrompt }
        ]
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1200,
      }
    }

    const response: any = await $fetch(geminiUrl, {
      method: 'POST',
      body: apiBody
    })

    if (!response || !response.candidates || response.candidates.length === 0) {
      throw new Error('Invalid response from Gemini API')
    }

    const candidate = response.candidates[0]
    const textResponse = candidate?.content?.parts?.[0]?.text || ''

    return {
      success: true,
      message: textResponse
    }
  } catch (err: any) {
    console.error('Error in AI Coach server endpoint:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.message || 'Internal Server Error'
    })
  }
})
