import React from 'react';
import { Plane, Home, Calendar, MapPin, Clock, Coffee, ExternalLink } from 'lucide-react';

export default function Itinerary() {
  // Trip itinerary
  const itinerary = [
    {
      date: '31 Mar',
      label: 'LHR → SIN',
      type: 'flight',
      color: 'blue',
      time: '19:35 - 16:05+1',
      flightNumber: 'BA11',
      duration: '13h 30m',
      url: 'https://www.flightradar24.com/data/flights/ba11'
    },
    { date: '01 Apr', label: 'Arrive Singapore', type: 'arrival', color: 'blue' },
    { date: '01-04 Apr', label: 'Singapore', nights: 3, type: 'stay', color: 'green' }, // TODO: Add accommodation URL
    {
      date: '04 Apr',
      label: 'SIN → KUL',
      type: 'flight',
      color: 'blue',
      time: '18:15 - 19:25',
      flightNumber: 'MH608',
      duration: '1h 10m',
      url: 'https://www.flightradar24.com/data/flights/mh608'
    },
    { date: '04 Apr', label: 'Arrive Malaysia', type: 'arrival', color: 'blue' },
    { date: '04-07 Apr', label: 'Kuala Lumpur', nights: 3, type: 'stay', color: 'orange', url: 'https://www.airbnb.co.uk/rooms/769138868515631387?source_impression_id=p3_1769531463_P3EeT3AizjKzqJ1C' },
    {
      date: '07 Apr',
      label: 'KUL → DPS',
      type: 'flight',
      color: 'blue',
      time: '10:35 - 13:40',
      flightNumber: 'QZ551',
      duration: '3h 5m',
      url: 'https://www.flightradar24.com/data/flights/qz551'
    },
    { date: '07 Apr', label: 'Arrive Indonesia', type: 'arrival', color: 'blue' },
    { date: '07-14 Apr', label: 'Bali', nights: 7, type: 'stay', color: 'purple' }, // TODO: Add accommodation URL
    {
      date: '14 Apr',
      label: 'DPS → SIN',
      type: 'flight',
      color: 'blue',
      time: '15:05 - 18:00',
      flightNumber: 'JQ88',
      duration: '2h 55m',
      url: 'https://www.flightradar24.com/data/flights/jq88'
    },
    { date: '14 Apr', label: 'Arrive Singapore', type: 'arrival', color: 'blue' },
    { date: '14-15 Apr', label: 'Singapore', nights: 1, type: 'stay', color: 'green' }, // TODO: Add accommodation URL
    {
      date: '15 Apr',
      label: 'SIN → DOH',
      type: 'flight',
      color: 'cyan',
      time: '19:40 - 22:40',
      flightNumber: 'QR947',
      duration: '8h 0m',
      url: 'https://www.flightradar24.com/data/flights/qr947'
    },
    { date: '15 Apr', label: 'Arrive Qatar', type: 'arrival', color: 'cyan' },
    { date: '15 Apr', label: 'Doha Layover', type: 'layover', color: 'cyan', duration: '2h 25m' },
    {
      date: '16 Apr',
      label: 'DOH → LGW',
      type: 'flight',
      color: 'cyan',
      time: '01:30 - 06:40',
      flightNumber: 'BA126',
      duration: '7h 10m',
      url: 'https://www.flightradar24.com/data/flights/ba126'
    },
    { date: '16 Apr', label: 'Arrive United Kingdom', type: 'arrival', color: 'cyan' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 mb-2 tracking-tight">
            Your Journey
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 font-medium">
            Singapore · Kuala Lumpur · Bali
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            31 March - 16 April 2026
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative">
          {/* Vertical Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-blue-200 dark:from-blue-900/50 dark:via-purple-900/50 dark:to-blue-900/50"></div>

          {/* Timeline Items */}
          <div className="space-y-6">
            {itinerary.map((event, idx) => {
              if (event.type === 'flight') {
                const flightUrl = event.url;
                const FlightCard = flightUrl ? 'a' : 'div';
                const cardProps = flightUrl ? { href: flightUrl, target: '_blank', rel: 'noopener noreferrer' } : {};

                return (
                  <div key={idx} className="relative pl-20">
                    {/* Timeline Dot */}
                    <div className="absolute left-[26px] top-6 w-4 h-4 rounded-full bg-blue-500 dark:bg-blue-400 border-4 border-white dark:border-slate-900 shadow-lg"></div>

                    {/* Flight Card */}
                    <FlightCard {...cardProps} className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-blue-200/50 dark:border-blue-900/50 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden block">
                      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 px-5 py-3 border-b border-blue-200/30 dark:border-blue-900/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500 dark:bg-blue-600 flex items-center justify-center shadow-md">
                              <Plane size={20} className="text-white" />
                            </div>
                            <div>
                              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                {event.label}
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                                {event.flightNumber}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                              {event.date}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="px-5 py-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                            <Clock size={16} className="text-blue-500 dark:text-blue-400" />
                            <span className="font-semibold">{event.time}</span>
                          </div>
                          <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent dark:from-blue-800 dark:to-transparent"></div>
                          <div className="text-sm font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full whitespace-nowrap">
                            {event.duration}
                          </div>
                        </div>
                      </div>
                    </FlightCard>
                  </div>
                );
              }

              if (event.type === 'stay') {
                const stayColors = {
                  green: { bg: 'from-emerald-500/10 to-green-500/10 dark:from-emerald-500/20 dark:to-green-500/20', border: 'border-emerald-200/50 dark:border-emerald-900/50', dot: 'bg-emerald-500 dark:bg-emerald-400', icon: 'bg-emerald-500 dark:bg-emerald-600', text: 'text-emerald-600 dark:text-emerald-400' },
                  orange: { bg: 'from-orange-500/10 to-amber-500/10 dark:from-orange-500/20 dark:to-amber-500/20', border: 'border-orange-200/50 dark:border-orange-900/50', dot: 'bg-orange-500 dark:bg-orange-400', icon: 'bg-orange-500 dark:bg-orange-600', text: 'text-orange-600 dark:text-orange-400' },
                  purple: { bg: 'from-purple-500/10 to-fuchsia-500/10 dark:from-purple-500/20 dark:to-fuchsia-500/20', border: 'border-purple-200/50 dark:border-purple-900/50', dot: 'bg-purple-500 dark:bg-purple-400', icon: 'bg-purple-500 dark:bg-purple-600', text: 'text-purple-600 dark:text-purple-400' },
                };
                const colors = stayColors[event.color];
                const stayUrl = event.url;
                const StayCard = stayUrl ? 'a' : 'div';
                const cardProps = stayUrl ? { href: stayUrl, target: '_blank', rel: 'noopener noreferrer' } : {};

                return (
                  <div key={idx} className="relative pl-20">
                    {/* Timeline Dot */}
                    <div className={`absolute left-[26px] top-6 w-4 h-4 rounded-full ${colors.dot} border-4 border-white dark:border-slate-900 shadow-lg`}></div>

                    {/* Stay Card */}
                    <StayCard {...cardProps} className={`group bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border ${colors.border} shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden block`}>
                      <div className={`bg-gradient-to-r ${colors.bg} px-5 py-3 border-b ${colors.border}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${colors.icon} flex items-center justify-center shadow-md`}>
                              <MapPin size={20} className="text-white" />
                            </div>
                            <div>
                              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                {event.label}
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                                {event.nights} night{event.nights > 1 ? 's' : ''} accommodation
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-xs font-semibold ${colors.text} uppercase tracking-wider`}>
                              {event.date}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Home size={16} className={colors.text.replace('text-', 'text-')} />
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Explore and relax
                          </span>
                        </div>
                      </div>
                    </StayCard>
                  </div>
                );
              }

              if (event.type === 'layover') {
                return (
                  <div key={idx} className="relative pl-20">
                    {/* Timeline Dot */}
                    <div className="absolute left-[26px] top-4 w-4 h-4 rounded-full bg-amber-500 dark:bg-amber-400 border-4 border-white dark:border-slate-900 shadow-lg"></div>

                    {/* Layover Card */}
                    <div className="bg-amber-50/80 dark:bg-amber-950/30 backdrop-blur-xl rounded-xl border border-amber-200/50 dark:border-amber-900/50 px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-3">
                        <Coffee size={18} className="text-amber-600 dark:text-amber-400" />
                        <div className="flex-1">
                          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {event.label}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            {event.duration} connection time
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              if (event.type === 'arrival') {
                return (
                  <div key={idx} className="relative pl-20 py-2">
                    <div className="flex items-center gap-3">
                      <div className="absolute left-[22px] w-6 h-6 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 border-2 border-white dark:border-slate-900 shadow-md flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500"></div>
                      </div>
                      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        {event.label}
                      </div>
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
