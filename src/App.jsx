import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Map, { Marker, NavigationControl, Popup } from '@vis.gl/react-maplibre';
import Papa from 'papaparse';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bookmark,
  Building,
  Camera,
  Check,
  ChevronDown,
  Church,
  Clock,
  Globe2,
  Info,
  LocateFixed,
  MapPin,
  Mountain,
  Navigation,
  Palmtree,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Sun,
  Tag,
  Ticket,
  TreePine,
  Utensils,
  Waves,
  Moon,
  X,
} from 'lucide-react';

const MAP_STYLES = {
  dark: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
};

/* Inline flags (SVG) to avoid emoji fallback to "SG/MY/ID" on some devices */
function Flag({ code, className = '', preserveAspectRatio = 'xMidYMid meet' }) {
  if (code === 'SG') {
    return (
      <svg className={className} viewBox="0 0 60 40" preserveAspectRatio={preserveAspectRatio} aria-label="Singapore flag" role="img">
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
      <svg className={className} viewBox="0 0 60 40" preserveAspectRatio={preserveAspectRatio} aria-label="Malaysia flag" role="img">
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
      <svg className={className} viewBox="0 0 60 40" preserveAspectRatio={preserveAspectRatio} aria-label="Indonesia flag" role="img">
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
    timezone: 'GMT+8',
    timezoneOffset: 8,
    center: [1.29, 103.85],
    zoom: 12,
    dataFile: 'singapore.csv',
    theme: {
      primary: '#DC2626',
      accent: '#FCA5A5',
      gradient: 'from-red-500 to-rose-300',
    },
    categories: {
      Landmark: { icon: Camera, color: '#60A5FA' },
      Attraction: { icon: Sparkles, color: '#C084FC' },
      Food: { icon: Utensils, color: '#FB7185' },
      Adventure: { icon: Ticket, color: '#F59E0B' },
      Culture: { icon: Church, color: '#A78BFA' },
    },
  },
  malaysia: {
    name: 'Malaysia',
    flag: 'MY',
    currency: 'MYR',
    timezone: 'GMT+8',
    timezoneOffset: 8,
    center: [3.139, 101.6869],
    zoom: 12,
    dataFile: 'malaysia.csv',
    theme: {
      primary: '#2563EB',
      accent: '#FCD34D',
      gradient: 'from-blue-400 to-yellow-300',
    },
    categories: {
      Landmark: { icon: Building, color: '#60A5FA' },
      Culture: { icon: Church, color: '#C084FC' },
      Food: { icon: Utensils, color: '#FB7185' },
      Attraction: { icon: Sparkles, color: '#A78BFA' },
      Shopping: { icon: ShoppingBag, color: '#F59E0B' },
    },
  },
  bali: {
    name: 'Bali',
    flag: 'ID',
    currency: 'IDR',
    timezone: 'GMT+8',
    timezoneOffset: 8,
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
      Adventure: { icon: Ticket, color: '#F59E0B' },
      Culture: { icon: Church, color: '#A78BFA' },
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

function formatNumberWithCommas(value) {
  // Remove all non-digit and non-decimal characters
  const cleaned = String(value).replace(/[^\d.]/g, '');

  // Split into integer and decimal parts
  const parts = cleaned.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  // Add commas to integer part
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // Reconstruct with decimal if present
  return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
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
  const [showNearby, setShowNearby] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [colorMode, setColorMode] = useState(() => {
    try {
      const saved = localStorage.getItem('trip_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'light';
  });

  const [visitedPlaces, setVisitedPlaces] = useState(() => {
    try {
      const saved = localStorage.getItem('trip_visited_places');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [tripPlaces, setTripPlaces] = useState(() => {
    try {
      const saved = localStorage.getItem('trip_selected_places');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [placeTags, setPlaceTags] = useState(() => {
    try {
      const saved = localStorage.getItem('trip_place_tags');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
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

  // Persist visited places to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('trip_visited_places', JSON.stringify(visitedPlaces));
    } catch {}
  }, [visitedPlaces]);

  // Persist trip places to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('trip_selected_places', JSON.stringify(tripPlaces));
    } catch {}
  }, [tripPlaces]);

  // Persist place tags to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('trip_place_tags', JSON.stringify(placeTags));
    } catch {}
  }, [placeTags]);

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

  // Update local time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Calculate local time for the destination
  const getLocalTime = useMemo(() => {
    const now = currentTime;
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const localTime = new Date(utc + (3600000 * config.timezoneOffset));

    const hours = localTime.getHours().toString().padStart(2, '0');
    const minutes = localTime.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`;
  }, [currentTime, config.timezoneOffset]);

  // Calculate time difference from user's timezone
  const getTimeDiff = useMemo(() => {
    const userOffset = -new Date().getTimezoneOffset() / 60;
    const diff = config.timezoneOffset - userOffset;

    if (diff === 0) return 'Same time';
    const sign = diff > 0 ? '+' : '';
    return `${sign}${diff}h`;
  }, [config.timezoneOffset]);

  // Load CSV data
  useEffect(() => {
    setLoading(true);
    setSelectedPlace(null);
    setExpandedPlace(null);
    setActiveCategory('All');

    const basePath = import.meta.env.BASE_URL || '/';
    const cacheBuster = `?v=${Date.now()}`;
    fetch(`${basePath}data/${config.dataFile}${cacheBuster}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
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
                rating: Number.parseFloat(row.rating) || null,
              }))
              .filter((row) => Number.isFinite(row.lat) && Number.isFinite(row.lng));

            console.log('Loaded places:', parsed.map(p => ({ name: p.name, category: p.category })));
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

  // Calculate distance between two points (Haversine formula)
  const getDistance = useCallback((lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  // Filter places
  const filteredPlaces = useMemo(() => {
    let filtered = places;

    // Apply category and search filters
    const q = searchQuery.trim().toLowerCase();
    filtered = filtered.filter((p) => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      if (!q) return matchesCategory;
      const hay = `${p.name ?? ''} ${p.description ?? ''}`.toLowerCase();
      return matchesCategory && hay.includes(q);
    });

    // Apply nearby filter
    if (showNearby && userLocation) {
      filtered = filtered
        .map((p) => ({
          ...p,
          distance: getDistance(userLocation.lat, userLocation.lng, p.lat, p.lng),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10);
    }

    return filtered;
  }, [places, activeCategory, searchQuery, showNearby, userLocation, getDistance]);

  const categories = useMemo(() => {
    const cats = [...new Set(places.map((p) => p.category).filter(Boolean))];
    return ['All', ...cats];
  }, [places]);

  const getCategoryColor = (category) => config.categories[category]?.color || '#94A3B8';
  const getCategoryIcon = (category) => config.categories[category]?.icon || MapPin;

  const getCategoryEmoji = (category) => {
    const emojiMap = {
      // Singapore
      Landmark: '🏛️',
      Attraction: '✨',
      Food: '🍜',
      Adventure: '🎢',
      Culture: '🎭',
      // Malaysia
      Shopping: '🛍️',
      // Bali
      Temple: '🛕',
      Nature: '🌿',
      Beach: '🏖️',
    };
    return emojiMap[category] || '📍';
  };

  const handleSelectPlace = (place) => {
    setSelectedPlace((prev) => (prev?.id === place.id ? null : place));
    setExpandedPlace((prev) => (prev === place.id ? null : place.id));
  };

  const toggleVisited = (placeId) => {
    setVisitedPlaces((prev) => ({
      ...prev,
      [`${destination}_${placeId}`]: !prev[`${destination}_${placeId}`],
    }));
  };

  const toggleTripPlace = (placeId) => {
    setTripPlaces((prev) => ({
      ...prev,
      [`${destination}_${placeId}`]: !prev[`${destination}_${placeId}`],
    }));
  };

  const selectedTripPlaces = useMemo(() => {
    return places.filter(p => tripPlaces[`${destination}_${p.id}`]);
  }, [places, tripPlaces, destination]);

  const buildGoogleMapsRoute = useCallback(() => {
    if (selectedTripPlaces.length < 1) return null;

    // Use "My Location" as origin (current location)
    const origin = 'My+Location';
    const dest = `${selectedTripPlaces[selectedTripPlaces.length - 1].lat},${selectedTripPlaces[selectedTripPlaces.length - 1].lng}`;

    // All selected places except the last one become waypoints
    const waypoints = selectedTripPlaces
      .slice(0, -1)
      .map(p => `${p.lat},${p.lng}`)
      .join('|');

    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}`;
    if (waypoints) {
      url += `&waypoints=${waypoints}`;
    }

    return url;
  }, [selectedTripPlaces]);

  const suggestedTags = [
    'Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5',
    'Morning', 'Afternoon', 'Evening',
    'Breakfast', 'Lunch', 'Dinner',
    'Must See', 'Optional', 'Backup Plan'
  ];

  const addTag = (placeId, tag) => {
    const key = `${destination}_${placeId}`;
    const trimmedTag = tag.trim();
    if (!trimmedTag) return;

    setPlaceTags((prev) => {
      const existing = prev[key] || [];
      // Case-insensitive duplicate check
      if (existing.some(t => t.toLowerCase() === trimmedTag.toLowerCase())) return prev;
      return {
        ...prev,
        [key]: [...existing, trimmedTag],
      };
    });
  };

  const removeTag = (placeId, tagToRemove) => {
    const key = `${destination}_${placeId}`;
    setPlaceTags((prev) => ({
      ...prev,
      [key]: (prev[key] || []).filter(t => t !== tagToRemove),
    }));
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
        <div className="mx-auto max-w-7xl px-2 xs:px-3 sm:px-4 pt-2 xs:pt-3 sm:pt-4 space-y-2">

          {/* Row 1: Country Info + Theme Toggle */}
          <div className="glass-panel-strong rounded-2xl border t-border-strong shadow-2xl overflow-hidden relative">
            <div
              className="absolute inset-0 opacity-5 pointer-events-none bg-gradient-to-r"
              style={{
                background: `linear-gradient(135deg, ${theme.primary}20 0%, transparent 50%, ${theme.accent}15 100%)`
              }}
            />

            <div className="relative px-3 xs:px-4 py-3 flex items-center justify-between gap-3">
              {/* Left: Country Indicator with Flag */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex-shrink-0 rounded-xl overflow-hidden shadow-lg ring-2 ring-white/10">
                  <Flag code={config.flag} className="w-12 h-8 xs:w-14 xs:h-9 sm:w-16 sm:h-11" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Globe2 size={16} className="t-muted2 flex-shrink-0" />
                    <h1 className={`text-lg xs:text-xl sm:text-2xl font-extrabold bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>
                      {config.name}
                    </h1>
                  </div>
                  <div className="flex items-center gap-2 text-xs t-muted2 mt-0.5 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="flex-shrink-0" />
                      <span className="font-bold tabular-nums">{getLocalTime}</span>
                      <span className="font-medium opacity-70">({getTimeDiff})</span>
                    </div>
                    <span className="hidden xs:inline">•</span>
                    <span className="hidden xs:inline">{places.length} places</span>
                  </div>
                </div>
              </div>

              {/* Right: Theme Toggle */}
              <div className="flex-shrink-0">
                <div className="glass-panel rounded-xl border p-1 flex items-center gap-1" role="group" aria-label="Theme">
                  <button
                    onClick={() => setTheme('light')}
                    className={`p-2.5 rounded-lg flex items-center justify-center transition-all ${
                      isLight ? 'bg-black/10 scale-105' : 't-hover'
                    }`}
                    title="Light mode"
                    aria-label="Light mode"
                  >
                    <Sun size={18} />
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-2.5 rounded-lg flex items-center justify-center transition-all ${
                      !isLight ? 'bg-white/10 scale-105' : 't-hover'
                    }`}
                    title="Dusk mode"
                    aria-label="Dusk mode"
                  >
                    <Moon size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Country Selector + FX Calculator */}
          <div className="glass-panel-strong rounded-2xl border t-border-strong shadow-lg">
            <div className="px-3 xs:px-4 py-3">
              <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-3">

                {/* Country Selector */}
                <div className="flex items-center justify-center sm:justify-start">
                  <div className="glass-panel rounded-xl border p-1.5 flex items-center gap-1.5" role="group" aria-label="Destinations">
                    {Object.entries(destinations)
                      .filter(([key]) => key !== destination)
                      .map(([key, dest]) => (
                        <button
                          key={key}
                          onClick={() => setDestination(key)}
                          className="px-3 py-2.5 rounded-lg t-hover transition-all hover:scale-105 flex items-center gap-2 min-h-[44px]"
                          title={`Switch to ${dest.name}`}
                          aria-label={`Switch to ${dest.name}`}
                        >
                          <Flag code={dest.flag} className="w-8 h-5 rounded shadow-sm ring-1 ring-black/10" />
                          <span className="text-sm font-bold hidden xs:inline">{dest.name}</span>
                        </button>
                      ))}
                  </div>
                </div>

                {/* FX Calculator with integrated rate display */}
                <div className="glass-panel rounded-xl border px-3 py-2.5 flex items-center gap-2">
                  <span className="text-xs font-extrabold t-muted2 flex-shrink-0">{config.currency}</span>
                  <input
                    inputMode="decimal"
                    value={localAmount}
                    onChange={(e) => {
                      const formatted = formatNumberWithCommas(e.target.value);
                      setLocalAmount(formatted);
                    }}
                    placeholder={`FX: ${fxLabel}`}
                    className="flex-1 min-w-0 rounded-lg border outline-none px-2.5 py-1.5 text-sm t-input"
                    aria-label="Local currency amount"
                    title={fx.asOf ? `Exchange rate as of ${fx.asOf}` : undefined}
                  />
                  <span className="text-xs t-muted3 flex-shrink-0">≈</span>
                  <span className="text-sm font-bold t-muted tabular-nums min-w-[60px] text-right">{gbpCalcLabel}</span>
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
            {/* Search & Filters */}
            <div className="glass-panel rounded-2xl border p-4 shadow-2xl space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 t-muted2" />
                <input
                  type="text"
                  placeholder="Search places"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border outline-none pl-11 pr-4 py-3 text-sm t-input"
                />
              </div>

              {/* Categories Grid */}
              <div className="grid grid-cols-3 gap-2">
                {categories.map((cat) => {
                  const isActive = activeCategory === cat;
                  const Icon = cat === 'All' ? MapPin : getCategoryIcon(cat);
                  const emoji = cat === 'All' ? '📍' : getCategoryEmoji(cat);
                  const count = cat === 'All' ? places.length : places.filter((p) => p.category === cat).length;
                  const color = cat === 'All' ? theme.primary : getCategoryColor(cat);

                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`flex flex-col gap-2 px-3 py-2.5 rounded-xl transition-all ${
                        isActive ? 'text-white shadow-lg scale-[1.02]' : 't-chip hover:scale-[1.02]'
                      }`}
                      style={isActive ? { backgroundColor: color } : undefined}
                    >
                      <div className="flex items-center gap-2 justify-center">
                        <span className="text-lg">{emoji}</span>
                        <span className="text-sm font-bold whitespace-nowrap">{cat}</span>
                      </div>
                      <div className={`text-xs font-extrabold tabular-nums text-center ${
                        isActive ? 'opacity-90' : 't-muted2'
                      }`}>
                        {count} {count === 1 ? 'place' : 'places'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trip Planner Panel */}
            {selectedTripPlaces.length > 0 && (
              <div className="glass-panel rounded-2xl border shadow-2xl overflow-hidden">
                <div className="px-4 py-3 flex items-center justify-between border-b t-border">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="flex-shrink-0" style={{ color: theme.primary }} />
                    <p className="text-sm font-extrabold tracking-tight">My Trip</p>
                    <span className="text-xs t-muted2">({selectedTripPlaces.length})</span>
                  </div>
                  <button
                    onClick={() => {
                      setTripPlaces((prev) => {
                        const updated = { ...prev };
                        places.forEach(p => delete updated[`${destination}_${p.id}`]);
                        return updated;
                      });
                    }}
                    className="text-xs font-bold t-muted2 t-hover px-2 py-1 rounded-lg"
                  >
                    Clear
                  </button>
                </div>

                <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                  {selectedTripPlaces.map((place, index) => {
                    const color = getCategoryColor(place.category);
                    return (
                      <div
                        key={place.id}
                        className="flex items-center gap-3 px-4 py-2.5 border-b t-border last:border-b-0"
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0"
                          style={{ backgroundColor: `${theme.primary}20`, color: theme.primary }}
                        >
                          {index + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm leading-tight truncate">{place.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <p className="text-xs t-muted2 truncate">{place.category}</p>
                            {placeTags[`${destination}_${place.id}`]?.length > 0 && (
                              <>
                                <span className="text-xs t-muted3">•</span>
                                <div className="flex gap-1">
                                  {placeTags[`${destination}_${place.id}`].slice(0, 2).map((tag) => (
                                    <span
                                      key={tag}
                                      className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                                      style={{
                                        backgroundColor: `${color}15`,
                                        color: color,
                                      }}
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => toggleTripPlace(place.id)}
                          className="flex-shrink-0 w-7 h-7 rounded-lg t-hover flex items-center justify-center"
                          title="Remove from trip"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 border-t t-border">
                  {selectedTripPlaces.length >= 1 ? (
                    <a
                      href={buildGoogleMapsRoute()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm text-white transition-all shadow-md hover:shadow-lg hover:scale-[1.02] w-full"
                      style={{ backgroundColor: theme.primary }}
                    >
                      <Navigation size={16} />
                      Open Route in Google Maps
                    </a>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-xs t-muted2">
                        Add at least 1 place to create route
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

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
                      {/* Collapsed View - Redesigned */}
                      <div
                        className={`px-4 py-4 cursor-pointer transition-colors ${rowHoverClass}`}
                        onClick={() => handleSelectPlace(place)}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div
                            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm relative"
                            style={{ backgroundColor: `${color}18` }}
                          >
                            <Icon size={22} style={{ color }} />
                            {visitedPlaces[`${destination}_${place.id}`] && (
                              <div
                                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-md"
                                style={{ backgroundColor: theme.primary }}
                              >
                                <Check size={12} className="text-white" />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="font-bold text-[15px] leading-tight">{place.name}</h3>
                              {priceText && (
                                <div className={`text-xs font-bold tabular-nums px-2 py-0.5 rounded-md ${isLight ? 'bg-black/5 text-black/70' : 'bg-white/10 text-white/85'} flex-shrink-0`}>
                                  {priceText}
                                </div>
                              )}
                            </div>
                            <p className="text-[13px] t-muted2 line-clamp-2 leading-relaxed">{place.description}</p>

                            {/* Tag badges */}
                            {placeTags[`${destination}_${place.id}`]?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {placeTags[`${destination}_${place.id}`].slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                                    style={{
                                      backgroundColor: `${color}12`,
                                      color: color,
                                    }}
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {placeTags[`${destination}_${place.id}`].length > 3 && (
                                  <span className="text-[10px] t-muted3 font-medium">
                                    +{placeTags[`${destination}_${place.id}`].length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Trip Planning Checkbox */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTripPlace(place.id);
                            }}
                            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                            style={{
                              backgroundColor: tripPlaces[`${destination}_${place.id}`] ? `${color}20` : 'transparent',
                            }}
                            title={tripPlaces[`${destination}_${place.id}`] ? 'Remove from trip' : 'Add to trip'}
                          >
                            <Bookmark
                              size={18}
                              className="transition-colors"
                              style={{
                                color: color,
                                fill: tripPlaces[`${destination}_${place.id}`] ? color : 'transparent',
                              }}
                            />
                          </button>

                          {/* Expand indicator */}
                          <div className="flex-shrink-0 pt-1">
                            <ChevronDown size={18} className={`t-muted3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </div>
                      </div>

                      {/* Expanded View - Modern Card Layout */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4">
                              <div className={`rounded-2xl overflow-hidden ${isLight ? 'bg-gradient-to-br from-black/[0.02] to-black/[0.04]' : 'bg-gradient-to-br from-white/[0.03] to-white/[0.05]'} border t-border shadow-sm`}>

                                {/* Category Header with Icon */}
                                <div className="px-4 pt-3 pb-2 flex items-center gap-2 border-b t-border">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ backgroundColor: `${color}20` }}>
                                    <Icon size={18} style={{ color }} />
                                  </div>
                                  <span className="text-xs font-extrabold uppercase tracking-wider" style={{ color }}>
                                    {place.category}
                                  </span>
                                </div>

                                {/* Content Section */}
                                <div className="p-4 space-y-3">

                                  {/* Notes/Description */}
                                  <div>
                                    <p className="text-sm t-muted leading-relaxed">{place.notes}</p>
                                  </div>

                                  {/* Custom Tags Section */}
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Tag size={14} className="t-muted2" />
                                      <p className="text-xs font-bold t-muted2 uppercase tracking-wider">Tags</p>
                                    </div>

                                    {placeTags[`${destination}_${place.id}`]?.length > 0 && (
                                      <div className="flex flex-wrap gap-1.5">
                                        {placeTags[`${destination}_${place.id}`].map((tag) => (
                                          <button
                                            key={tag}
                                            onClick={() => removeTag(place.id, tag)}
                                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all hover:scale-105"
                                            style={{
                                              backgroundColor: `${color}15`,
                                              color: color,
                                            }}
                                            title="Click to remove"
                                          >
                                            {tag}
                                            <X size={12} />
                                          </button>
                                        ))}
                                      </div>
                                    )}

                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        placeholder="Add tag (e.g., Day 1, Morning)..."
                                        className="flex-1 px-3 py-2 rounded-lg border outline-none text-xs t-input"
                                        onKeyPress={(e) => {
                                          if (e.key === 'Enter' && e.target.value.trim()) {
                                            addTag(place.id, e.target.value);
                                            e.target.value = '';
                                          }
                                        }}
                                      />
                                    </div>

                                    <div className="flex flex-wrap gap-1.5">
                                      {suggestedTags
                                        .filter(tag => !placeTags[`${destination}_${place.id}`]?.includes(tag))
                                        .slice(0, 6)
                                        .map((tag) => (
                                          <button
                                            key={tag}
                                            onClick={() => addTag(place.id, tag)}
                                            className="px-2 py-1 rounded-lg text-xs font-medium transition-all hover:scale-105"
                                            style={{
                                              backgroundColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)',
                                            }}
                                            title="Click to add"
                                          >
                                            + {tag}
                                          </button>
                                        ))}
                                    </div>
                                  </div>

                                  {/* Rating & Action Row */}
                                  <div className="flex items-center gap-2 pt-2 flex-wrap">
                                    {/* Rating */}
                                    {place.rating && (
                                      <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl" style={{ backgroundColor: `${color}08` }}>
                                        <Star size={16} className="fill-yellow-400 text-yellow-400 flex-shrink-0" />
                                        <span className="text-sm font-bold tabular-nums">{place.rating.toFixed(1)}</span>
                                      </div>
                                    )}

                                    {/* Visited Checkbox Button */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleVisited(place.id);
                                      }}
                                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md hover:scale-105"
                                      style={{
                                        backgroundColor: visitedPlaces[`${destination}_${place.id}`] ? theme.primary : `${color}15`,
                                        color: visitedPlaces[`${destination}_${place.id}`] ? 'white' : 'inherit',
                                      }}
                                      title={visitedPlaces[`${destination}_${place.id}`] ? 'Mark as not visited' : 'Mark as visited'}
                                    >
                                      {visitedPlaces[`${destination}_${place.id}`] ? (
                                        <Check size={16} className="flex-shrink-0" />
                                      ) : (
                                        <div className="w-4 h-4 rounded-full border-2 flex-shrink-0" style={{ borderColor: color }} />
                                      )}
                                      <span className="hidden xs:inline">
                                        {visitedPlaces[`${destination}_${place.id}`] ? 'Visited' : 'Visit'}
                                      </span>
                                    </button>

                                    {/* Google Maps Button */}
                                    <a
                                      href={place.googleMapsUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-sm text-white transition-all shadow-sm hover:shadow-md hover:scale-105 ml-auto"
                                      style={{ backgroundColor: theme.primary }}
                                      title="Open in Google Maps"
                                    >
                                      <Navigation size={16} />
                                      <span className="hidden xs:inline">Directions</span>
                                    </a>
                                  </div>

                                </div>
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
                      const emoji = getCategoryEmoji(place.category);
                      const isSel = selectedPlace?.id === place.id;
                      const isVisited = visitedPlaces[`${destination}_${place.id}`];

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
                          <div className="relative">
                            <div
                              className={`cursor-pointer transition-all ${
                                isSel ? 'scale-150' : 'scale-100 hover:scale-125'
                              }`}
                              style={{
                                fontSize: '28px',
                                filter: isSel ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                                textShadow: '0 0 3px white',
                                opacity: isVisited ? 0.5 : 1,
                              }}
                            >
                              {emoji}
                            </div>
                            {isVisited && (
                              <div
                                className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center shadow-lg pointer-events-none"
                                style={{
                                  backgroundColor: theme.primary,
                                  border: '1.5px solid white',
                                }}
                              >
                                <Check size={10} className="text-white" strokeWidth={3} />
                              </div>
                            )}
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

                              {/* Rating */}
                              {selectedPlace.rating && (
                                <div className="flex items-center gap-1 mt-2">
                                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs font-bold">{selectedPlace.rating.toFixed(1)}</span>
                                  <span className="text-[10px] t-muted2">Google Maps</span>
                                </div>
                              )}

                              {/* Tags */}
                              {placeTags[`${destination}_${selectedPlace.id}`]?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {placeTags[`${destination}_${selectedPlace.id}`].map((tag) => (
                                    <span
                                      key={tag}
                                      className="px-2 py-0.5 rounded-md text-[10px] font-bold"
                                      style={{
                                        backgroundColor: `${getCategoryColor(selectedPlace.category)}20`,
                                        color: getCategoryColor(selectedPlace.category),
                                      }}
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
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

            {/* Nearby Filter Button */}
            <div className="mt-4">
              <button
                onClick={() => {
                  if (!userLocation) {
                    getUserLocation();
                  }
                  setShowNearby((prev) => !prev);
                  if (!showNearby) {
                    setActiveCategory('All');
                    setSearchQuery('');
                  }
                }}
                disabled={!userLocation && showNearby}
                className={`w-full px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  showNearby
                    ? 'glass-panel-strong border t-border-strong shadow-lg'
                    : 'glass-panel border t-hover shadow-md hover:shadow-lg'
                }`}
                style={showNearby ? { backgroundColor: `${theme.primary}15`, borderColor: theme.primary } : undefined}
              >
                <LocateFixed size={18} style={showNearby ? { color: theme.primary } : undefined} />
                <span style={showNearby ? { color: theme.primary } : undefined}>
                  {showNearby ? '📍 Showing Nearest 10' : 'Find Nearby Places'}
                </span>
                {showNearby && (
                  <span className="ml-auto px-2 py-0.5 rounded-md text-xs font-bold text-white" style={{ backgroundColor: theme.primary }}>
                    {filteredPlaces.length}
                  </span>
                )}
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
