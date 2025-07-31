# 🌦️ Dynamic Weather Theme – Next.js App

Live: [https://dynamic-wether.vercel.app](https://dynamic-wether.vercel.app)

A visually dynamic weather and time-based themed web app built using **Next.js**, **TypeScript**, and **TailwindCSS**. The app changes its appearance based on **real-time weather and local time**, giving users an immersive UI experience.

---

## 📸 Features

- 🌞 Changes UI based on time (morning, noon, evening, night)
- 🌧️ Updates background visuals based on real-time weather (rainy, sunny, cloudy, etc.)
- 🌍 Detects user location for accurate weather display
- ⚙️ API integration with real-time weather data
- 🧩 Built with modular, clean components in React (Next.js)

---

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Language**: TypeScript
- **Deployment**: [Vercel](https://vercel.com/)
- **Weather API**: OpenWeatherMap or similar (configurable via `.env`)

---

## 🔧 Setup & Run Locally

```bash
# Clone the repository
git clone https://github.com/your-username/dynamic-weather.git
cd dynamic-weather

# Install dependencies
npm install

# Add your environment variables
touch .env

Example .env:

GEMINI_API_KEY=your_api_key_here
NEXT_PUBLIC_WEATHER_API_KEY=your_api_key_here

To get free Wether API: https://www.weatherapi.com

# Run the dev server
npm run dev

Visit http://localhost:3000

⸻

🛠️ Scripts

Command	Description
npm run dev	Start development server
npm run build	Build for production
npm run start	Start production server


⸻

📦 Deployment

Deployed on Vercel. Push to main branch triggers auto-deploy.

⸻

📄 License

MIT License © 2025 Aditya Chavan

---
