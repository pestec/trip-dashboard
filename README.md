# 🗺️ Trip Dashboard

A modern, interactive trip dashboard for exploring Singapore, Malaysia, and Bali. Built with React, Vite, Leaflet maps, and Tailwind CSS.

![Trip Dashboard](https://via.placeholder.com/800x400/0F0F0F/DC2626?text=Trip+Dashboard)

## ✨ Features

- 🗺️ **Interactive Map** - Real OpenStreetMap with custom markers
- 📍 **GPS Location** - Show your current location on the map
- 🎨 **Dynamic Themes** - Each destination has its own color scheme
- 🔍 **Search & Filter** - Find places by name or category
- 📱 **Mobile First** - Fully responsive design
- 📊 **CSV Data** - Easy to edit place data in spreadsheet format
- ⚡ **Fast** - Built with Vite for instant hot reload

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [VS Code](https://code.visualstudio.com/) (recommended)

### Installation

1. **Clone or download this project**

2. **Open in VS Code**
   ```bash
   cd trip-dashboard
   code .
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Visit `http://localhost:5173`

## 📁 Project Structure

```
trip-dashboard/
├── data/                    # CSV data files
│   ├── singapore.csv        # Singapore places
│   ├── malaysia.csv         # Malaysia places
│   └── bali.csv             # Bali places
├── public/                  # Static assets
│   └── favicon.svg
├── src/
│   ├── App.jsx              # Main application
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 📝 Adding/Editing Places

Edit the CSV files in the `data/` folder. Each file has these columns:

| Column | Description | Example |
|--------|-------------|---------|
| id | Unique number | 1 |
| name | Place name | Marina Bay |
| description | Short description | Iconic waterfront walk |
| price | Price text | Free or S$40 |
| priceRange | 0=Free, 1=$, 2=$$, 3=$$$ | 0 |
| lat | Latitude | 1.2847 |
| lng | Longitude | 103.8610 |
| notes | Tips for visitors | Best at sunset |
| category | Category name | Sightseeing |
| googleMapsUrl | Google Maps link | https://... |

**Tip:** Use Google Sheets to edit CSV files, then export as CSV.

## 🌐 Deploy to GitHub Pages (FREE)

### Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click **"New repository"**
3. Name it `trip-dashboard` (or any name)
4. Make it **Public**
5. Click **Create repository**

### Step 2: Update Vite Config

Edit `vite.config.js` and change the `base` to your repo name:

```js
export default defineConfig({
  plugins: [react()],
  base: '/trip-dashboard/', // Your repo name here
})
```

### Step 3: Push Code to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add your GitHub repo as remote
git remote add origin https://github.com/YOUR_USERNAME/trip-dashboard.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 4: Deploy

```bash
# Build and deploy to GitHub Pages
npm run build
npm run deploy
```

### Step 5: Enable GitHub Pages

1. Go to your repo on GitHub
2. Click **Settings** → **Pages**
3. Under "Source", select **gh-pages** branch
4. Click **Save**
5. Wait 1-2 minutes, then visit:
   `https://YOUR_USERNAME.github.io/trip-dashboard/`

### 🔄 Updating Your Site

After making changes:

```bash
git add .
git commit -m "Your update message"
git push
npm run build
npm run deploy
```

## 📱 Add to Phone Home Screen

### iPhone (Safari)
1. Open your GitHub Pages URL in Safari
2. Tap the **Share** button (square with arrow)
3. Scroll down and tap **"Add to Home Screen"**
4. Name it and tap **Add**

### Android (Chrome)
1. Open your GitHub Pages URL in Chrome
2. Tap the **three dots** menu
3. Tap **"Add to Home screen"**
4. Name it and tap **Add**

## 🎨 Customizing Themes

Edit the `destinations` object in `src/App.jsx` to customize:

```javascript
const destinations = {
  singapore: {
    name: 'Singapore',
    emoji: '🇸🇬',
    theme: {
      primary: '#DC2626',    // Main accent color
      bg: 'bg-[#0F0F0F]',    // Background color
      card: 'bg-[#1A1A1A]',  // Card background
      // ... more colors
    },
    // ...
  },
  // Add more destinations here!
};
```

## 🆕 Adding a New Destination

1. Create a new CSV file in `data/` (e.g., `thailand.csv`)
2. Add destination config in `src/App.jsx`:

```javascript
thailand: {
  name: 'Thailand',
  emoji: '🇹🇭',
  center: [13.7563, 100.5018], // Bangkok coordinates
  zoom: 12,
  dataFile: 'thailand.csv',
  theme: {
    primary: '#F97316',
    // ... your theme colors
  },
  categories: {
    Temple: { icon: Church, color: '#A855F7' },
    // ... your categories
  }
}
```

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Leaflet** - Maps
- **Framer Motion** - Animations
- **PapaParse** - CSV parsing
- **Lucide Icons** - Icons

## 📄 License

MIT - Feel free to use for your own trips!

---

Made with ❤️ for your adventures
