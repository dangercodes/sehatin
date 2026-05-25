# Sehatin

Sehatin adalah aplikasi health & nutrition tracker modern yang membantu pengguna memantau pola makan, asupan nutrisi, gula, air minum, dan perkembangan berat badan secara sederhana, cerdas, dan menyenangkan.

Dirancang dengan pendekatan mobile-first dan clean user experience, Sehatin membantu pengguna membangun gaya hidup sehat melalui tracking harian, visualisasi progress, dan insight kesehatan berbasis data.

---

## ✨ Features

### 🍱 Food & Nutrition Tracking
- Track makanan harian
- Monitoring kalori
- Protein, karbohidrat, lemak
- Monitoring gula harian
- Meal categories:
  - Breakfast
  - Lunch
  - Dinner
  - Snack

---

### 📷 AI Food Recognition
Upload foto makanan dan AI akan membantu:
- mengenali makanan
- estimasi kalori
- estimasi nutrisi
- rekomendasi kesehatan

---

### 📦 Barcode Scanner
Scan barcode produk makanan/minuman dan dapatkan:
- nutrition facts
- calories
- sugar content
- ingredients

Powered by OpenFoodFacts API.

---

### ⚖️ Weight Tracker
- Track berat badan harian
- Grafik perkembangan
- BMI Calculator
- Target berat badan ideal

---

### 💧 Water Intake Tracker
- Monitoring konsumsi air harian
- Daily hydration progress
- Quick add water

---

### 📊 Dashboard Analytics
- Daily nutrition summary
- Weekly progress
- Health score
- Nutrition visualization

---

### 🔔 Smart Reminder
- Reminder makan
- Reminder minum air
- Reminder tracking harian

---

## 🎨 Design Philosophy

Sehatin menggunakan pendekatan:
- modern
- clean
- minimal
- calming
- mobile-first
- smooth experience

Inspirasi UI:
- Apple Health
- Fitbit
- MyFitnessPal
- Headspace

---

## 🛠 Tech Stack

### Frontend
- Nuxt 3 / Nuxt 4
- Vue 3
- TypeScript
- Tailwind CSS
- Pinia
- VueUse
- Chart.js / ApexCharts

---

### Backend
- Supabase Auth
- Supabase Database
- Supabase Storage
- Supabase Edge Functions

---

### AI & Integrations
- OpenAI Vision API
- OpenFoodFacts API
- Nutrition APIs

---

## 📱 Mobile First

Sehatin dibangun dengan pendekatan:
- mobile-first UI
- responsive layout
- smooth animation
- modern dashboard experience

---

## 📂 Project Structure

```bash
sehatin/
├── assets/
├── components/
│   ├── common/
│   ├── dashboard/
│   ├── food/
│   ├── tracker/
│   └── ui/
├── composables/
├── layouts/
├── pages/
├── plugins/
├── stores/
├── server/
├── types/
├── utils/
└── supabase/

## Setup Project
git clone https://github.com/dangercodes/sehatin.git
npm install

## Run Project
npm run dev

## Environment Variables
cp .env.example .env
SUPABASE_URL=
SUPABASE_KEY=

## Contribution Guidelines
- Fork the repository
- Create a feature branch
- Commit your changes
- Push to the branch
- Open a pull request