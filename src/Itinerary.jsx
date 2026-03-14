import React, { useState, useEffect } from 'react';
import { Plane, Home, Clock, ExternalLink } from 'lucide-react';

const tripData = {
  singapore: {
    name: 'Singapore',
    emoji: '🇸🇬',
    dates: '1 – 4 Apr 2026',
    theme: {
      gradient: 'from-emerald-500 to-teal-500',
      cardBg: 'bg-emerald-50/60 dark:bg-emerald-950/20',
      border: 'border-emerald-200/60 dark:border-emerald-800/40',
      text: 'text-emerald-700 dark:text-emerald-400',
      badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
      iconBg: 'bg-emerald-500',
      dot: 'bg-emerald-500 dark:bg-emerald-400',
      headerBg: 'bg-emerald-50/80 dark:bg-emerald-950/30',
    },
    accommodation: [
      {
        name: 'The Robertson House',
        subtitle: 'by The Crest Collection · 3 nights',
        url: 'https://www.google.com/maps?sca_esv=445b43772c47b857&output=search&q=The+Robertson+House+by+The+Crest+Collection&source=lnms&fbs=ADc_l-aN0CWEZBOHjofHoaMMDiKpaEWjvZ2Py1XXV8d8KvlI3kj_s5Jds98_ubVRf0unUVsSxesyNaMSU8qNkqltIpMqt0EiWVIjJivfP-5dEs4ulfduhNoAL26h5jK8xRG_I-Q4z1JhlQwN4M1mHcjKBWb9D1qTmK9o1fMgUcJXsgNT5IZ1hT3zryGb79oMdahSGql9JjHJh45JFEARuburxh6cH4RXUQ&entry=mc&ved=1t:200715&ictx=111',
      },
    ],
    arrivalFlight: {
      route: 'LHR → SIN',
      flightNumber: 'BA11',
      date: '31 Mar',
      time: '19:35 – 16:05+1',
      duration: '13h 30m',
      url: 'https://www.flightradar24.com/data/flights/ba11',
    },
    departureFlight: {
      route: 'SIN → KUL',
      flightNumber: 'MH608',
      date: '4 Apr',
      time: '18:15 – 19:25',
      duration: '1h 10m',
      url: 'https://www.flightradar24.com/data/flights/mh608',
    },
    days: [
      { date: '1 Apr', dayOfWeek: 'Wednesday', note: 'Arrival · land ~16:05', activities: [
        '18:00–19:00 — Grab to hotel, check-in and refresh',
        '19:15–21:00 — Walk to Chinatown + Maxwell Hawker Centre (Ah Tai / Tian Tian) for dinner',
        '21:00–22:00 — Walk around Chinatown and back to hotel',
      ] },
      { date: '2 Apr', dayOfWeek: 'Thursday', activities: [
        '09:00–10:00 — Grab or MRT to Tiong Bahru Bakery for breakfast',
        '10:00–10:30 — Grab to Merlion Park',
        '10:30–12:00 — Walk through Merlion Park, Marina Bay waterfront and Helix Bridge',
        '12:30–14:15 — Walk to The Shoppes at Marina Bay Sands + lunch',
        '14:15–14:30 — Walk to Flower Dome',
        '14:30–15:45 — Visit Flower Dome - book tickets on Klook',
        '16:00–18:30 — Walk around Gardens by the Bay',
        '19:00–21:00 — Walk or short Grab to dinner around Marina Bay',
      ] },
      { date: '3 Apr', dayOfWeek: 'Friday', activities: [
        '09:30–10:30 — Breakfast near hotel',
        '10:30–11:00 — Grab to Yunomori Onsen & Spa',
        '11:00–13:30 — Yunomori Onsen & Spa',
        '13:30–14:00 — Walk or short Grab to lunch nearby',
        '14:00–15:00 — Lunch nearby',
        '15:00–15:30 — Grab to Marina One Green Heart',
        '15:30–17:00 — Walk around Marina One Green Heart',
        '17:00–17:15 — MRT or Grab to Chinatown / Telok Ayer',
        '17:15–19:30 — Walk around Chinatown / Telok Ayer',
        '19:30–21:00 — Dinner in the area, then Grab or MRT back',
      ] },
      { date: '4 Apr', dayOfWeek: 'Saturday', note: 'Depart 18:15 → KUL', activities: [
        '09:00–10:00 — Breakfast near hotel',
        '10:00–12:00 — Walk around hotel area / coffee / last-minute shopping',
        '12:30–13:30 — Early lunch near hotel',
        '13:30–14:30 — Return to hotel and collect bags',
        '14:30–15:30 — Grab to Changi Airport',
        '15:30–17:15 — Check-in, security, airport time',
        '18:15 — ✈ Flight to Kuala Lumpur (MH608)',
      ] },
    ],
  },
  malaysia: {
    name: 'Kuala Lumpur',
    emoji: '🇲🇾',
    dates: '4 – 7 Apr 2026',
    theme: {
      gradient: 'from-orange-500 to-amber-500',
      cardBg: 'bg-orange-50/60 dark:bg-orange-950/20',
      border: 'border-orange-200/60 dark:border-orange-800/40',
      text: 'text-orange-700 dark:text-orange-400',
      badge: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
      iconBg: 'bg-orange-500',
      dot: 'bg-orange-500 dark:bg-orange-400',
      headerBg: 'bg-orange-50/80 dark:bg-orange-950/30',
    },
    accommodation: [
      {
        name: 'Airbnb – Kuala Lumpur',
        subtitle: '3 nights',
        url: 'https://www.airbnb.co.uk/rooms/769138868515631387?source_impression_id=p3_1769531463_P3EeT3AizjKzqJ1C',
      },
    ],
    arrivalFlight: {
      route: 'SIN → KUL',
      flightNumber: 'MH608',
      date: '4 Apr',
      time: '18:15 – 19:25',
      duration: '1h 10m',
      url: 'https://www.flightradar24.com/data/flights/mh608',
    },
    departureFlight: {
      route: 'KUL → DPS',
      flightNumber: 'QZ551',
      date: '7 Apr',
      time: '10:35 – 13:40',
      duration: '3h 5m',
      url: 'https://www.flightradar24.com/data/flights/qz551',
    },
    days: [
      { date: '4 Apr', dayOfWeek: 'Saturday', note: 'Arrival evening · land ~19:25', activities: [
       '18:45–19:30 — ✈ Arrive in Kuala Lumpur (MH608) + immigration + bags',
       '19:30–20:30 — Grab to accomodation and check-in',
       '20:30–22:00 — Dinner near hotel / easy evening',
] },
      { date: '5 Apr', dayOfWeek: 'Sunday', activities: [
        '10:00–10:20 — Grab to Pavilion Kuala Lumpur',
        '10:20–11:00 — Visit Teddy Bear Café at Pavilion',
        '11:00–11:30 — Walk around Pavilion / Bukit Bintang',
        '11:30–11:50 — Grab to Thean Hou Temple',
        '11:50–12:40 — Visit Thean Hou Temple',
        '12:40–13:00 — Grab to Sri Mahamariamman Temple / Petaling Street',
        '13:00–13:20 — Visit Sri Mahamariamman Temple',
        '13:20–14:00 — Walk through Petaling Street',
        '14:00–14:30 — Walk to Central Market + coffee / cold drinks',
        '14:30–15:30 — Lunch around Central Market / Chinatown',
        '15:30–16:00 — Walk to Jamboo Concept Store',
        '16:00–16:30 — Walk to Kwai Chai Hong',
        '16:30–16:45 — Walk to Pasar Seni LRT station',
        '16:45–17:15 — LRT to KLCC',
        '17:15–18:15 — Visit Petronas Towers - book tickets on Klook',
        '18:15–18:45 — Walk around KLCC Park',
        '19:00–21:00 — Dinner at KLCC or Grab back',
      ] },
      { date: '6 Apr', dayOfWeek: 'Monday', activities: [
        '09:30–10:00 — Grab or train to Batu Caves',
        '10:00–11:30 — Visit Batu Caves',
        '11:30–12:00 — Coffee / drinks near Batu Caves',
        '12:00–13:00 — Grab to Subang Parade',
        '13:00–14:15 — Lunch at Chan Rak BBQ',
        '14:15–15:30 — Walk around Subang Parade',
        '15:30–16:15 — Coffee / dessert break inside the mall',
        '16:15–17:00 — Grab back to central Kuala Lumpur',
        '17:00–19:00 — Free time at Bukit Bintang / Pavilion or KLCC',
        '19:00–21:00 — Dinner and relaxed evening',
      ] },
      { date: '7 Apr', dayOfWeek: 'Tuesday', note: 'Early departure · QZ551 10:35', activities: [
        '06:00–06:30 — Early Breakfast',
        '07:00–08:30 — Grab to airport',
        '10:35 — ✈ Flight to Bali (QZ551)',
      ] },
    ],
  },
  bali: {
    name: 'Bali',
    emoji: '🇮🇩',
    dates: '7 – 14 Apr 2026',
    theme: {
      gradient: 'from-violet-600 to-purple-500',
      cardBg: 'bg-purple-50/60 dark:bg-purple-950/20',
      border: 'border-purple-200/60 dark:border-purple-800/40',
      text: 'text-purple-700 dark:text-purple-400',
      badge: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
      iconBg: 'bg-violet-600',
      dot: 'bg-violet-600 dark:bg-violet-400',
      headerBg: 'bg-purple-50/80 dark:bg-purple-950/30',
    },
    accommodation: [
      {
        name: 'Kaamala Resort',
        subtitle: '7–10 Apr',
        url: 'https://www.google.com/maps/place/Kaamala+Resort+%26+Spa+Ubud+by+iNi+Vie+Hospitality/@-8.5162792,115.2533625,17z/data=!4m11!3m10!1s0x2dd23d9efd543713:0xf8adf658c4f0fc16!5m4!1s2026-04-07!2i3!4m1!1i2!8m2!3d-8.5162845!4d115.2559374!16s%2Fg%2F11fq8xyt9h?entry=ttu&g_ep=EgoyMDI2MDIxOC4wIKXMDSoASAFQAw%3D%3D',
      },
      {
        name: 'Dolce Villas',
        subtitle: '10–14 Apr',
        url: 'https://www.google.com/maps/place/Dolce+x+The+Young+Villas/@-8.8184047,115.1070568,4551m/data=!3m1!1e3!4m11!3m10!1s0x2dd245c8df25f319:0x8e06a4d1aa987cc7!5m4!1s2026-04-07!2i3!4m1!1i2!8m2!3d-8.811818!4d115.1228975!16s%2Fg%2F11vybb_0b2?entry=ttu&g_ep=EgoyMDI2MDMxMS4wIKXMDSoASAFQAw%3D%3D',
      },
    ],
    arrivalFlight: {
      route: 'KUL → DPS',
      flightNumber: 'QZ551',
      date: '7 Apr',
      time: '10:35 – 13:40',
      duration: '3h 5m',
      url: 'https://www.flightradar24.com/data/flights/qz551',
    },
    departureFlight: {
      route: 'DPS → SIN',
      flightNumber: 'JQ88',
      date: '14 Apr',
      time: '15:05 – 18:00',
      duration: '2h 55m',
      url: 'https://www.flightradar24.com/data/flights/jq88',
    },
    days: [
      {
        date: '7 Apr',
        dayOfWeek: 'Tuesday',
        location: 'Ubud',
        note: 'Arrival · land ~13:40',
        activities: [
          '13:40–15:30 — ✈ Arrive in Bali + immigration + bags + transfer',
          '15:30–17:00 — Grab to Ubud hotel + check-in',
          '17:00–19:00 — Relax at hotel / pool / nearby walk',
          '19:00–21:00 — Dinner near hotel',
        ],
      },
      {
        date: '8 Apr',
        dayOfWeek: 'Wednesday',
        location: 'Ubud',
        activities: [
          '09:00–10:00 — Breakfast near hotel',
          '10:00–10:20 — Grab to Batuan Temple',
          '10:20–11:00 — Visit Batuan Temple',
          '11:00–11:20 — Grab to Bali Bird Park',
          '11:20–13:30 — Visit Bali Bird Park',
          '13:30–14:30 — Lunch nearby or at Bali Bird Park',
          '14:30–15:00 — Grab to The Jungle Club Ubud',
          '15:00–18:30 — Relax at The Jungle Club Ubud',
          '19:00–21:00 — Dinner there or Grab back to Ubud',
        ],
      },
      {
        date: '9 Apr',
        dayOfWeek: 'Thursday',
        location: 'Ubud',
        activities: [
          '09:00–10:00 — Breakfast near hotel',
          '10:00–10:30 — Grab to Cretya Ubud',
          '10:30–14:30 — Relax at Cretya Ubud',
          '14:30–15:00 — Late lunch / drinks at Cretya',
          '15:00–15:30 — Grab back to hotel / short rest',
          '16:30–17:00 — Grab to Taman Dedari',
          '17:00–20:00 — Sunset and dinner at Taman Dedari',
          '20:00–20:30 — Grab back to hotel',
        ],
      },
      {
        date: '10 Apr',
        dayOfWeek: 'Friday',
        location: 'Ubud → Uluwatu',
        activities: [
          '08:30–09:30 — Breakfast + check-out',
          '09:30–10:00 — Meet driver / start car tour',
          '10:00–11:30 — Tegallalang Rice Terrace + swing',
          '11:30–12:15 — Drive to Kanto Lampo Waterfall',
          '12:15–13:15 — Visit Kanto Lampo Waterfall',
          '13:15–13:45 — Drive to Tibumana Waterfall',
          '13:45–14:45 — Visit Tibumana Waterfall',
          '14:45–15:30 — Lunch stop on the way south',
          '15:30–17:15 — Drive to Garuda Wisnu Kencana Cultural Park',
          '17:15–18:30 — Visit Garuda Wisnu Kencana Cultural Park',
          '18:30–19:00 — Drive to new accommodation in Uluwatu + check-in',
          '19:00–20:00 — Check-in at new accommodation in Uluwatu + refresh',
          '20:00–22:00 — Dinner near hotel / easy evening',
        ],
      },
      {
        date: '11 Apr',
        dayOfWeek: 'Saturday',
        location: 'Uluwatu',
        activities: [
          '10:00–11:00 — Breakfast near hotel',
          '11:00–11:30 — Grab to Palmilla Bali Beach Club',
          '11:30–17:30 — Relax at Palmilla Bali Beach Club',
          '18:00–19:00 — Grab back to hotel / short rest',
          '19:30–21:30 — Dinner near hotel',
        ],
      },
      {
        date: '12 Apr',
        dayOfWeek: 'Sunday',
        location: 'Uluwatu',
        activities: [
          '09:00–10:00 — Breakfast near hotel',
          '10:00–10:30 — Grab to Melasti Beach',
          '10:30–13:00 — Relax at Melasti Beach',
          '13:00–13:30 — Grab to Sundays Beach Club',
          '13:30–18:30 — Relax at Sundays Beach Club',
          '18:30–19:00 — Sunset at Sundays Beach Club',
          '19:00–20:00 — Grab back to hotel',
        ],
      },
      {
        date: '13 Apr',
        dayOfWeek: 'Monday',
        location: 'Uluwatu',
        activities: [
          '09:00–10:00 — Breakfast near hotel',
          '10:00–10:30 — Grab to Suluban Beach',
          '10:30–12:30 — Relax at Suluban Beach',
          '12:30–13:00 — Grab to Padang Padang Beach',
          '13:00–16:00 — Relax at Padang Padang Beach + lunch nearby',
          '16:00–17:00 — Grab back to hotel / get ready',
          '17:30–18:00 — Grab to Savaya Bali',
          '18:00–23:30 — Savaya Bali',
        ],
      },
      {
        date: '14 Apr',
        dayOfWeek: 'Tuesday',
        location: 'Uluwatu',
        note: 'Depart 15:05 → SIN',
        activities: [
          '08:30–09:30 — Breakfast near hotel',
          '09:30–10:30 — Check-out and final packing',
          '10:30–11:15 — Grab to airport',
          '11:15–13:15 — Check-in, security, airport time',
          '15:05 — ✈ Flight to Singapore',
        ],
      },
    ],
  },
};

export default function Itinerary() {
  const [destination, setDestination] = useState(() => {
    try {
      return localStorage.getItem('trip_destination') || 'singapore';
    } catch {
      return 'singapore';
    }
  });

  useEffect(() => {
    const handler = (e) => setDestination(e.detail);
    window.addEventListener('trip:destination', handler);
    return () => window.removeEventListener('trip:destination', handler);
  }, []);

  const data = tripData[destination] || tripData.singapore;
  const { theme } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Destination Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-4xl leading-none">{data.emoji}</span>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {data.name}
            </h1>
          </div>
          <p className="text-base text-slate-500 dark:text-slate-400 font-medium">{data.dates}</p>
        </div>

        {/* Info Cards: Accommodation + Flights */}
        <div className="flex flex-wrap gap-3 mb-10">
          {/* Accommodation cards */}
          {data.accommodation.map((acc, i) => (
            <a
              key={i}
              href={acc.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 min-w-[200px] flex flex-col gap-2 p-4 rounded-2xl border ${theme.border} ${theme.cardBg} hover:shadow-lg hover:scale-[1.02] transition-all duration-200`}
            >
              <div className="flex items-start gap-2.5">
                <div className={`w-8 h-8 rounded-lg ${theme.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <Home size={15} className="text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Stay</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">{acc.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{acc.subtitle}</div>
                </div>
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${theme.text}`}>
                <ExternalLink size={10} />
                <span>View location</span>
              </div>
            </a>
          ))}

          {/* Arrival Flight */}
          <a
            href={data.arrivalFlight.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[200px] flex flex-col gap-2 p-4 rounded-2xl border border-blue-200/60 dark:border-blue-800/40 bg-blue-50/60 dark:bg-blue-950/20 hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
          >
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                <Plane size={15} className="text-white -rotate-45" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Arriving</div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{data.arrivalFlight.route}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{data.arrivalFlight.flightNumber} · {data.arrivalFlight.date}</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={11} className="text-blue-500" />
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{data.arrivalFlight.time}</span>
              <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">{data.arrivalFlight.duration}</span>
            </div>
          </a>

          {/* Departure Flight */}
          <a
            href={data.departureFlight.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[200px] flex flex-col gap-2 p-4 rounded-2xl border border-sky-200/60 dark:border-sky-800/40 bg-sky-50/60 dark:bg-sky-950/20 hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
          >
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center flex-shrink-0">
                <Plane size={15} className="text-white rotate-45" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Departing</div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{data.departureFlight.route}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{data.departureFlight.flightNumber} · {data.departureFlight.date}</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={11} className="text-sky-500" />
              <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">{data.departureFlight.time}</span>
              <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">{data.departureFlight.duration}</span>
            </div>
          </a>
        </div>

        {/* Day Cards */}
        <div className="space-y-4">
          {data.days.map((day, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border ${theme.border} bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-sm overflow-hidden`}
            >
              {/* Day Header */}
              <div className={`${theme.headerBg} border-b ${theme.border} px-5 py-3 flex items-center gap-4`}>
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${theme.gradient} flex flex-col items-center justify-center shadow-md flex-shrink-0`}>
                  <span className="text-white font-extrabold text-base leading-none">
                    {day.date.split(' ')[0]}
                  </span>
                  <span className="text-white/80 text-[9px] font-semibold leading-none mt-0.5">APR</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-bold text-slate-900 dark:text-slate-100">{day.date}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {day.dayOfWeek}
                    {day.location && <span className={`ml-2 font-semibold ${theme.text}`}>{day.location}</span>}
                  </div>
                </div>
                {day.note && (
                  <span className={`hidden sm:inline-flex text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${theme.badge}`}>
                    {day.note}
                  </span>
                )}
              </div>

              {/* Note badge on mobile */}
              {day.note && (
                <div className="sm:hidden px-5 pt-2">
                  <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${theme.badge}`}>
                    {day.note}
                  </span>
                </div>
              )}

              {/* Activities */}
              <div className="px-5 py-4">
                {day.activities.length > 0 ? (
                  <ul className="space-y-1.5">
                    {day.activities.map((activity, aIdx) => {
                      const sep = activity.indexOf(' \u2014 ');
                      const time = sep !== -1 ? activity.slice(0, sep) : null;
                      const desc = sep !== -1 ? activity.slice(sep + 3) : activity;
                      return (
                        <li key={aIdx} className="flex items-baseline gap-3 text-sm text-slate-700 dark:text-slate-300">
                          <span className="font-mono text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap w-24 flex-shrink-0 text-right tabular-nums">
                            {time ?? ''}
                          </span>
                          <span className="flex-1">{desc}</span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-400 dark:text-slate-600 italic">Activities to be planned…</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


