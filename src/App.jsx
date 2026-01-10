import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Map, { Marker, NavigationControl, Popup } from '@vis.gl/react-maplibre';
import Papa from 'papaparse';
import {
  Building,
  Camera,
  Church,
  ExternalLink,
  Info,
  LocateFixed,
  MapPin,
  Mountain,
  Navigation,
  Palmtree,
  Search,
  ShoppingBag,
  Sparkles,
  Sun,
  Ticket,
  TreePine,
  Utensils,
  Waves,
  Moon,
} from 'lucide-react';

const MAP_STYLES = {
  dark: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
};

/* Inline flags (SVG) to avoid emoji fallback to "SG/MY/ID" on some devices */
function Flag({ code, className = '' }) {
  if (code === 'SG') {
    return (
      <svg className={className} viewBox="0 0 60 40" aria-label="Singapore flag" role="img">
        <rect width="60" height="20" fill="#EF3340" />
        <rect y="20" width="60" height="20" fill="#FFFFFF" />
        {/* crescent + 5 stars (simplified, readable at small sizes) */}
        <circle cx="16" cy="12" r="8" fill="#FFFFFF" />
        <circle cx="18.7" cy="12" r="6.2" fill="#EF3340" />
        {[
          [25, 8],
          [28, 12],
          [25, 16],
          [22, 12],
          [28, 16],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.2" fill="#FFFFFF" />
        ))}
      </svg>
    );
  }

  if (code === 'MY') {
    return (
      <svg className={className} viewBox="0 0 60 40" aria-label="Malaysia flag" role="img">
        <rect width="60" height="40" fill="#FFFFFF" />
        {Array.from({ length: 7 }).map((_, i) => (
          <rect key={i} y={i * 6} width="60" height="3" fill="#EF3340" />
        ))}
        <rect width="26" height="22" fill="#012A87" />
        {/* crescent + star (simplified) */}
        <circle cx="12" cy="11" r="6.2" fill="#FCD116" />
        <circle cx="13.8" cy="11" r="4.8" fill="#012A87" />
        <circle cx="19" cy="11" r="2.4" fill="#FCD116" />
      </svg>
    );
  }

  if (code === 'ID') {
    return (
      <svg className={className} viewBox="0 0 60 40" aria-label="Indonesia flag" role="img">
        <rect width="60" height="20" fill="#EF3340" />
        <rect y="20" width="60" height="20" fill="#FFFFFF" />
      </svg>
    );
  }

  return (
    <div
      className={`rounded-md bg-black/10 border border-black/10 ${className}`}
      aria-label="Flag"
      role="img"
    />
  );
}

// Destination configurations
const destinations = {
  singapore: {
    name: 'Singapore',
    flag: 'SG',
    currency: 'SGD',
    center: [1.29, 103.85],
    zoom: 12,
    dataFile: 'singapore.csv',
    theme: {
      primary: '#DC2626',
      accent: '#FCA5A5',
      gradient: 'from-red-500 to-rose-300',
    },
    categories: {
      Sightseeing: { icon: Camera, color: '#60A5FA' },
      Nature: { icon: TreePine, color: '#34D399' },
      Shows: { icon: Sparkles, color: '#C084FC' },
      Sentosa: { icon: Palmtree, color: '#F59E0B' },
      Food: { icon: Utensils, color: '#FB7185' },
    },
  },
  malaysia: {
    name: 'Malaysia',
    flag: 'MY',
    currency: 'MYR',
    center: [3.139, 101.6869],
    zoom: 12,
    dataFile: 'malaysia.csv',
    theme: {
      primary: '#2563EB',
      accent: '#FCD34D',
      gradient: 'from-blue-400 to-yellow-300',
    },
    categories: {
      Sightseeing: { icon: Building, color: '#60A5FA' },
      Culture: { icon: Church, color: '#C084FC' },
      Nature: { icon: TreePine, color: '#34D399' },
      Food: { icon: Utensils, color: '#FB7185' },
      Shopping: { icon: ShoppingBag, color: '#F59E0B' },
    },
  },
  bali: {
    name: 'Bali',
    flag: 'ID',
    currency: 'IDR',
    center: [-8.4095, 115.1889],
    zoom: 10,
    dataFile: 'bali.csv',
    theme: {
      primary: '#14B8A6',
      accent: '#FCD34D',
      gradient: 'from-teal-400 to-yellow-300',
    },
    categories: {
      Temple: { icon: Church, color: '#C084FC' },
      Nature: { icon: Mountain, color: '#34D399' },
      Beach: { icon: Waves, color: '#60A5FA' },
      Food: { icon: Utensils, color: '#FB7185' },
      Shopping: { icon: ShoppingBag, color: '#F59E0B' },
      Activity: { icon: Ticket, color: '#FB923C' },
    },
  },
};

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function hexToRgb(hex) {
  const clean = String(hex).replace('#', '').trim();
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const n = Number.parseInt(full, 16);
  if (!Number.isFinite(n)) return { r: 255, g: 255, b: 255 };
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbaFromHex(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function normalizePrice(place) {
  const p = String(place?.price ?? '').trim();
  if (p) return p;
  if (Number(place?.priceRange) === 0) return 'Free';
  return '';
}

function formatGbp(value) {
  if (!Number.isFinite(value)) return '';
  const abs = Math.abs(value);
  const maxFractionDigits = abs < 0.01 ? 6 : abs < 0.1 ? 4 : 3;
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: maxFractionDigits,
  }).format(value);
}

function parseNumberLoose(s) {
  const raw = String(s ?? '')
    .replace(/\s+/g, '')
    .replace(/,/g, '');
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : null;
}

export default function App() {
  const [destination, setDestination] = useState('singapore');
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [expandedPlace, setExpandedPlace] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const [colorMode, setColorMode] = useState(() => {
    try {
      const saved = localStorage.getItem('trip_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'light';
  });

  const [fx, setFx] = useState({ loading: true, rate: null, asOf: null });
  const [localAmount, setLocalAmount] = useState('');

  const mapRef = useRef(null);

  const config = destinations[destination];
  const theme = config.theme;
  const isLight = colorMode === 'light';
  const mapStyle = isLight ? MAP_STYLES.light : MAP_STYLES.dark;

  const rowHoverClass = isLight ? 'hover:bg-black/5' : 'hover:bg-white/10';
  const rowSelectedClass = isLight ? 'bg-black/5' : 'bg-white/10';

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = colorMode;
    root.style.colorScheme = colorMode;
    root.classList.toggle('dark', colorMode === 'dark');
    try {
      localStorage.setItem('trip_theme', colorMode);
    } catch {}
  }, [colorMode]);


  // Reset calculator when destination changes
  useEffect(() => {
    setLocalAmount('');
  }, [destination]);

  // FX rate: 1 local currency -> GBP
  useEffect(() => {
    const from = config.currency;
    if (!from) {
      setFx({ loading: false, rate: null, asOf: null });
      return;
    }

    const ac = new AbortController();

    async function tryFetch(url, parseRate) {
      const r = await fetch(url, { signal: ac.signal });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      const rate = parseRate(data);
      const asOf = data?.date || data?.time_last_update_utc || null;
      if (!Number.isFinite(rate)) throw new Error('Bad rate');
      return { rate, asOf };
    }

    (async () => {
      setFx({ loading: true, rate: null, asOf: null });
      try {
        const primary = await tryFetch(
          `https://api.frankfurter.app/latest?from=${encodeURIComponent(from)}&to=GBP`,
          (d) => d?.rates?.GBP,
        );
        if (!ac.signal.aborted) setFx({ loading: false, rate: primary.rate, asOf: primary.asOf });
        return;
      } catch {}

      try {
        const secondary = await tryFetch(
          `https://api.exchangerate.host/latest?base=${encodeURIComponent(from)}&symbols=GBP`,
          (d) => d?.rates?.GBP,
        );
        if (!ac.signal.aborted) setFx({ loading: false, rate: secondary.rate, asOf: secondary.asOf });
      } catch {
        if (!ac.signal.aborted) setFx({ loading: false, rate: null, asOf: null });
      }
    })();

    return () => ac.abort();
  }, [config.currency]);

  const fxLabel = useMemo(() => {
    if (fx.loading) return `1 ${config.currency} → GBP…`;
    if (!fx.rate) return 'FX unavailable';
    return `1 ${config.currency} ≈ ${formatGbp(fx.rate)}`;
  }, [fx.loading, fx.rate, config.currency]);

  const localParsed = useMemo(() => parseNumberLoose(localAmount), [localAmount]);
  const gbpCalculated = useMemo(() => {
    if (!fx.rate) return null;
    if (!Number.isFinite(fx.rate)) return null;
    if (localParsed == null) return null;
    return localParsed * fx.rate;
  }, [fx.rate, localParsed]);

  const gbpCalcLabel = useMemo(() => {
    if (!localAmount) return '£0.00';
    if (!fx.rate) return '—';
    if (gbpCalculated == null) return '—';
    return formatGbp(gbpCalculated);
  }, [localAmount, fx.rate, gbpCalculated]);

  // Load CSV data
  useEffect(() => {
    setLoading(true);
    setSelectedPlace(null);
    setExpandedPlace(null);
    setActiveCategory('All');

    const basePath = import.meta.env.BASE_URL || '/';
    fetch(`${basePath}data/${config.dataFile}`)
      .then((r) => r.text())
      .then((csv) => {
        Papa.parse(csv, {
          header: true,
          complete: (results) => {
            const parsed = (results.data || [])
              .filter((row) => row?.id && row?.name)
              .map((row) => ({
                ...row,
                id: Number.parseInt(row.id, 10),
                lat: Number.parseFloat(row.lat),
                lng: Number.parseFloat(row.lng),
                priceRange: Number.parseInt(row.priceRange, 10) || 0,
              }))
              .filter((row) => Number.isFinite(row.lat) && Number.isFinite(row.lng));

            setPlaces(parsed);
            setLoading(false);
          },
        });
      })
      .catch((err) => {
        console.error('Error loading CSV:', err);
        setLoading(false);
      });
  }, [destination, config.dataFile]);

  // Map fly-to
  useEffect(() => {
    const map = mapRef.current?.getMap?.();
    if (!map || loading) return;

    if (selectedPlace) {
      map.flyTo({
        center: [selectedPlace.lng, selectedPlace.lat],
        zoom: clamp(15.8, config.zoom, 18),
        duration: 900,
        essential: true,
      });
      return;
    }

    map.flyTo({
      center: [config.center[1], config.center[0]],
      zoom: config.zoom,
      duration: 900,
      essential: true,
    });
  }, [selectedPlace, config.center, config.zoom, loading]);

  // Get user location
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(next);
        const map = mapRef.current?.getMap?.();
        map?.flyTo({ center: [next.lng, next.lat], zoom: 14.5, duration: 900, essential: true });
      },
      (error) => {
        console.log('Location error:', error.message);
        alert('Unable to get your location. Please enable location services.');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  // Filter places
  const filteredPlaces = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return places.filter((p) => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      if (!q) return matchesCategory;
      const hay = `${p.name ?? ''} ${p.description ?? ''}`.toLowerCase();
      return matchesCategory && hay.includes(q);
    });
  }, [places, activeCategory, searchQuery]);

  const categories = useMemo(() => {
    const cats = [...new Set(places.map((p) => p.category).filter(Boolean))];
    return ['All', ...cats];
  }, [places]);

  const getCategoryColor = (category) => config.categories[category]?.color || '#94A3B8';
  const getCategoryIcon = (category) => config.categories[category]?.icon || MapPin;

  const handleSelectPlace = (place) => {
    setSelectedPlace((prev) => (prev?.id === place.id ? null : place));
    setExpandedPlace((prev) => (prev === place.id ? null : place.id));
  };

  const neutralBackdrop = isLight
    ? 'radial-gradient(1200px 800px at 20% 10%, rgba(11,18,32,0.08), transparent 60%), radial-gradient(900px 700px at 80% 30%, rgba(11,18,32,0.06), transparent 55%), radial-gradient(800px 600px at 50% 90%, rgba(11,18,32,0.05), transparent 60%)'
    : 'radial-gradient(1200px 800px at 20% 10%, rgba(255,255,255,0.10), transparent 60%), radial-gradient(900px 700px at 80% 30%, rgba(255,255,255,0.07), transparent 55%), radial-gradient(800px 600px at 50% 90%, rgba(255,255,255,0.06), transparent 60%)';

  const tintBackdrop = useMemo(() => {
    const a1 = isLight ? 0.14 : 0.10;
    const a2 = isLight ? 0.12 : 0.08;
    return `radial-gradient(900px 600px at 15% 50%, ${rgbaFromHex(theme.primary, a1)}, transparent 65%), radial-gradient(900px 600px at 85% 55%, ${rgbaFromHex(theme.accent, a2)}, transparent 70%)`;
  }, [isLight, theme.primary, theme.accent]);

  const setTheme = useCallback((mode) => setColorMode(mode), []);

  return (
    <div
      className="min-h-screen t-bg t-fg transition-colors duration-500 noise overflow-x-hidden"
      style={{
        paddingTop: 'var(--safe-area-top)',
        paddingBottom: 'var(--safe-area-bottom)',
        paddingLeft: 'var(--safe-area-left)',
        paddingRight: 'var(--safe-area-right)',
      }}
    >
      {/* Backdrop */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 opacity-70" style={{ background: neutralBackdrop }} />
        <div className="absolute inset-0 opacity-60" style={{ background: tintBackdrop }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-[1000] mb-2 xs:mb-3 sm:mb-4">
        <div className="mx-auto max-w-7xl px-2 xs:px-3 sm:px-4 pt-2 xs:pt-3 sm:pt-4">
          <div className="glass-panel-strong rounded-2xl border t-border-strong shadow-2xl">
            <div className="px-2 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 flex items-center justify-between gap-2 xs:gap-3 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-2 xs:gap-3 min-w-0 flex-shrink-0">
                <Flag code={config.flag} className="w-8 h-5 xs:w-9 xs:h-6 sm:w-10 sm:h-7 rounded-md xs:rounded-lg shadow-sm ring-1 ring-black/10" />

                <div className="min-w-0">
                  <h1 className={`text-base xs:text-lg sm:text-xl font-extrabold bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>
                    {config.name}
                  </h1>
                  <p className="text-[10px] xs:text-xs t-muted2 truncate">{places.length} places • tap map pins</p>
                </div>

                {/* FX + Calculator (moved next to destination) */}
                <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
                  <div
                    className="glass-panel rounded-xl border px-3 py-2 flex items-center gap-2"
                    title={fx.asOf ? `As of ${fx.asOf}` : undefined}
                  >
                    <span className="text-xs font-extrabold t-muted2">FX</span>
                    <span className="text-xs font-semibold t-muted">{fxLabel}</span>
                  </div>

                  <div className="glass-panel rounded-xl border px-3 py-2 flex items-center gap-2">
                    <span className="text-xs font-extrabold t-muted2">{config.currency}</span>
                    <input
                      inputMode="decimal"
                      value={localAmount}
                      onChange={(e) => setLocalAmount(e.target.value)}
                      placeholder="Amount"
                      className="w-20 xs:w-24 sm:w-28 lg:w-[110px] rounded-lg border outline-none px-2 py-1 text-xs t-input"
                      aria-label="Local currency amount"
                    />
                    <span className="text-xs t-muted3">≈</span>
                    <span className="text-xs font-semibold t-muted tabular-nums">{gbpCalcLabel}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Theme toggle */}
                <div className="glass-panel rounded-2xl border p-1 flex items-center gap-1" role="group" aria-label="Theme">
                  <button
                    onClick={() => setTheme('light')}
                    className={`px-2 xs:px-3 py-2 rounded-xl flex items-center gap-1.5 xs:gap-2 transition-colors ${
                      isLight ? 'bg-black/10' : 't-hover'
                    }`}
                    title="Light mode"
                    aria-label="Light mode"
                  >
                    <Sun size={16} className="xs:hidden" />
                    <Sun size={18} className="hidden xs:block" />
                    <span className="text-xs xs:text-sm font-semibold hidden md:inline">Light</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`px-2 xs:px-3 py-2 rounded-xl flex items-center gap-1.5 xs:gap-2 transition-colors ${
                      !isLight ? 'bg-white/10' : 't-hover'
                    }`}
                    title="Dusk mode"
                    aria-label="Dusk mode"
                  >
                    <Moon size={16} className="xs:hidden" />
                    <Moon size={18} className="hidden xs:block" />
                    <span className="text-xs xs:text-sm font-semibold hidden md:inline">Dusk</span>
                  </button>
                </div>

                {/* Destination switcher - show other 2 destinations */}
                <div className="glass-panel rounded-2xl border p-1 flex items-center gap-1" role="group" aria-label="Destinations">
                  {Object.entries(destinations)
                    .filter(([key]) => key !== destination)
                    .map(([key, dest]) => (
                      <button
                        key={key}
                        onClick={() => setDestination(key)}
                        className="px-2 xs:px-3 py-2 rounded-xl flex items-center gap-1.5 xs:gap-2 t-hover transition-colors min-h-[44px]"
                        title={`Switch to ${dest.name}`}
                        aria-label={`Switch to ${dest.name}`}
                      >
                        <Flag code={dest.flag} className="w-5 h-3 xs:w-6 xs:h-4 sm:w-7 sm:h-5 rounded shadow-sm ring-1 ring-black/10" />
                        <span className="text-xs xs:text-sm font-semibold hidden lg:inline">{dest.name}</span>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile FX + Calculator - Outside header */}
        <div className="lg:hidden mx-auto max-w-7xl px-2 xs:px-3 sm:px-4 mt-2">
          <div className="glass-panel rounded-2xl border p-2 xs:p-3 shadow-lg">
            <div className="grid grid-cols-2 gap-2">
              <div
                className="glass-panel rounded-xl border px-3 py-2 flex items-center justify-center gap-2"
                title={fx.asOf ? `As of ${fx.asOf}` : undefined}
              >
                <span className="text-xs font-extrabold t-muted2">FX</span>
                <span className="text-xs font-semibold t-muted">{fxLabel}</span>
              </div>

              <div className="glass-panel rounded-xl border px-2 py-2 min-w-0">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-xs font-extrabold t-muted2 flex-shrink-0">{config.currency}</span>
                    <input
                      inputMode="decimal"
                      value={localAmount}
                      onChange={(e) => setLocalAmount(e.target.value)}
                      placeholder="Amount"
                      className="flex-1 min-w-0 w-full rounded-lg border outline-none px-2 py-1 text-xs t-input min-h-[36px]"
                      aria-label="Local currency amount"
                    />
                  </div>
                  <div className="text-[10px] xs:text-xs t-muted2 text-center truncate">
                    ≈ <span className="font-semibold tabular-nums">{gbpCalcLabel}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </header>

      {/* Layout */}
      <main className="mx-auto max-w-7xl px-2 xs:px-3 sm:px-4 pb-4 xs:pb-6 sm:pb-8 pt-2 xs:pt-3 sm:pt-4">
        <div className="grid gap-4 lg:grid-cols-[420px_1fr] w-full overflow-hidden">
          {/* Sidebar */}
          <section className="order-2 lg:order-1 space-y-4 w-full min-w-0">
            {/* Search */}
            <div className="glass-panel rounded-2xl border p-3 shadow-2xl">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 t-muted2" />
                <input
                  type="text"
                  placeholder="Search places"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border outline-none pl-11 pr-4 py-3 text-[15px] t-input"
                />
              </div>

              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {categories.map((cat) => {
                  const isActive = activeCategory === cat;
                  const Icon = cat === 'All' ? MapPin : getCategoryIcon(cat);
                  const count = cat === 'All' ? places.length : places.filter((p) => p.category === cat).length;
                  const color = cat === 'All' ? theme.primary : getCategoryColor(cat);

                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`flex items-center gap-2 px-3 xs:px-4 py-2.5 rounded-full whitespace-nowrap transition-all flex-shrink-0 text-sm font-semibold ${
                        isActive ? 'text-white shadow-2xl' : 't-chip'
                      }`}
                      style={isActive ? { backgroundColor: color } : undefined}
                    >
                      <Icon size={16} />
                      <span>{cat}</span>
                      <span className={`text-xs ${isActive ? 'text-white/75' : 't-muted3'}`}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Places */}
            <div className="glass-panel rounded-2xl border shadow-2xl overflow-hidden">
              <div className="px-4 py-3 flex items-center justify-between">
                <p className="text-sm font-extrabold tracking-tight">Places</p>
                <p className="text-xs t-muted2">{filteredPlaces.length} shown</p>
              </div>

              <div className="max-h-[calc(50vh-2rem)] sm:max-h-[calc(52vh-2rem)] lg:max-h-[calc(100vh-260px)] overflow-y-auto custom-scrollbar">
                {filteredPlaces.map((place, index) => {
                  const isSelected = selectedPlace?.id === place.id;
                  const isExpanded = expandedPlace === place.id;
                  const color = getCategoryColor(place.category);
                  const Icon = getCategoryIcon(place.category);
                  const priceText = normalizePrice(place);

                  return (
                    <motion.div
                      key={place.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className={`border-t t-border ${isSelected ? rowSelectedClass : ''}`}
                    >
                      <div
                        className={`px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors ${rowHoverClass}`}
                        onClick={() => handleSelectPlace(place)}
                      >
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${color}22` }}
                        >
                          <Icon size={20} style={{ color }} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[15px] truncate">{place.name}</h3>
                          <p className="text-[13px] t-muted2 truncate">{place.description}</p>
                        </div>

                        {/* Price */}
                        {priceText ? (
                          <div className={`text-sm font-extrabold tabular-nums ${isLight ? 'text-black/70' : 'text-white/85'}`}>
                            {priceText}
                          </div>
                        ) : null}

                        <a
                          href={place.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 rounded-xl t-chip transition-colors"
                          title="Directions"
                        >
                          <Navigation size={16} />
                        </a>

                        <ChevronDown size={18} className={`t-muted2 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4">
                              <div className="pl-[52px] space-y-3">
                                <div className="flex items-start gap-2">
                                  <Info size={14} className="t-muted3 mt-0.5 flex-shrink-0" />
                                  <p className="text-sm t-muted">{place.notes}</p>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: color }}>
                                    {place.category}
                                  </span>
                                </div>

                                <a
                                  href={place.googleMapsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-extrabold text-white transition-opacity hover:opacity-90"
                                  style={{ backgroundColor: theme.primary }}
                                >
                                  <Navigation size={16} />
                                  Open in Google Maps
                                  <ExternalLink size={14} />
                                </a>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}

                {filteredPlaces.length === 0 && !loading && (
                  <div className="px-4 py-12 text-center">
                    <Search size={40} className="mx-auto t-muted3 mb-3" />
                    <p className="t-muted2">No places found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 p-4 glass-panel rounded-2xl border shadow-2xl">
              <div className="text-center">
                <p className={`text-2xl font-extrabold ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>
                  {places.filter((p) => p.priceRange === 0).length}
                </p>
                <p className="text-xs t-muted2">Free spots</p>
              </div>
              <div className="text-center border-x t-border">
                <p className={`text-2xl font-extrabold ${isLight ? 'text-rose-700' : 'text-rose-200'}`}>
                  {places.filter((p) => p.category === 'Food').length}
                </p>
                <p className="text-xs t-muted2">Food places</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-extrabold" style={{ color: theme.primary }}>
                  {Object.keys(config.categories).length}
                </p>
                <p className="text-xs t-muted2">Categories</p>
              </div>
            </div>
          </section>

          {/* Map */}
          <section className="order-1 lg:order-2 w-full min-w-0">
            <div
              className="relative overflow-hidden rounded-3xl border t-border shadow-2xl"
              style={{
                boxShadow: isLight
                  ? '0 20px 60px rgba(11,18,32,0.18), 0 0 0 1px rgba(11,18,32,0.06) inset'
                  : '0 30px 90px rgba(0,0,0,0.50), 0 0 0 1px rgba(255,255,255,0.06) inset',
              }}
            >
              <div className="h-[42vh] min-h-[280px] xs:h-[44vh] xs:min-h-[300px] sm:h-[45vh] sm:min-h-[320px] lg:h-[calc(100vh-170px)] w-full overflow-hidden">
                {!loading && (
                  <Map
                    ref={mapRef}
                    initialViewState={{ latitude: config.center[0], longitude: config.center[1], zoom: config.zoom }}
                    mapStyle={mapStyle}
                    attributionControl={false}
                    cooperativeGestures
                    onClick={() => setSelectedPlace(null)}
                  >
                    <NavigationControl position="bottom-right" showCompass showZoom />

                    {filteredPlaces.map((place) => {
                      const color = getCategoryColor(place.category);
                      const isSel = selectedPlace?.id === place.id;

                      return (
                        <Marker
                          key={place.id}
                          longitude={place.lng}
                          latitude={place.lat}
                          anchor="center"
                          onClick={(e) => {
                            e.originalEvent?.stopPropagation?.();
                            handleSelectPlace(place);
                          }}
                        >
                          <div className={`pin ${isSel ? 'pin--selected' : ''}`} style={{ backgroundColor: color }}>
                            <div
                              className="absolute inset-0 rounded-full"
                              style={{
                                background: `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.55), rgba(255,255,255,0.0) 55%)`,
                              }}
                            />
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pin-dot" />
                          </div>
                        </Marker>
                      );
                    })}

                    {userLocation && (
                      <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="center">
                        <div className="user-dot" />
                      </Marker>
                    )}

                    {/* Popup */}
                    {selectedPlace && (
                      <Popup
                        longitude={selectedPlace.lng}
                        latitude={selectedPlace.lat}
                        anchor="top"
                        closeButton={false}
                        closeOnClick={false}
                        maxWidth="min(90vw, 320px)"
                        offset={14}
                      >
                        <div className="glass-panel-strong rounded-xl xs:rounded-2xl border p-2 xs:p-3 shadow-2xl">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <p className="font-extrabold leading-tight">{selectedPlace.name}</p>
                              <p className="text-sm t-muted2 mt-0.5">{selectedPlace.description}</p>
                            </div>
                            <button
                              onClick={() => setSelectedPlace(null)}
                              className="px-2 py-1 rounded-lg t-chip text-xs"
                              aria-label="Close"
                            >
                              ✕
                            </button>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-3">
                            <span
                              className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                              style={{ backgroundColor: getCategoryColor(selectedPlace.category) }}
                            >
                              {selectedPlace.category}
                            </span>

                            <a
                              href={selectedPlace.googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-extrabold text-white"
                              style={{ backgroundColor: theme.primary }}
                            >
                              <Navigation size={14} />
                              Directions
                            </a>
                          </div>
                        </div>
                      </Popup>
                    )}
                  </Map>
                )}

                {/* Map top-right controls */}
                <div className="absolute top-4 right-4 z-[10] flex flex-col gap-2">
                  <button
                    onClick={getUserLocation}
                    className="glass-panel rounded-2xl border p-3 t-hover transition-colors shadow-2xl"
                    title="My Location"
                  >
                    <LocateFixed size={20} />
                  </button>
                </div>

                {/* Loading */}
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="glass-panel-strong rounded-2xl border px-6 py-5 text-center shadow-2xl">
                      <div
                        className="w-12 h-12 border-4 rounded-full animate-spin mb-4 mx-auto"
                        style={{ borderColor: 'var(--spinner-track)', borderTopColor: 'var(--spinner-head)' }}
                      />
                      <p className="t-muted2 text-sm">Loading {config.name}…</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Helper */}
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 glass-panel rounded-full border text-xs t-muted2">
                👆 Tap pins or list items • Switch destination in header
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
