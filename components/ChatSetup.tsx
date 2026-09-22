import React, { useState, useEffect } from 'react';
import { LeadInfo } from '../types';
import { Campaign, CAMPAIGNS, findCampaignByDate, calculateDaysSinceCampaignEnd } from '../data/campaigns';
import { buildInitialMessage } from '../services/gemini';
import { 
  Calendar, 
  User, 
  Sparkles, 
  MessageSquare, 
  ArrowRight, 
  Search, 
  CheckCircle2, 
  Clock, 
  Award,
  BookOpen,
  Check
} from 'lucide-react';

interface ChatSetupProps {
  initialLead: LeadInfo;
  onStartChat: (lead: LeadInfo) => void;
  onOpenCampaignsModal: () => void;
}

// El estado interno sigue guardando la fecha en formato DD/MM/AAAA (el mismo
// que usan las campanas en data/campaigns.ts), pero el <input type="date">
// nativo del navegador (que muestra el mini calendario desplegable) solo
// entiende formato ISO YYYY-MM-DD. Estos dos helpers hacen de puente.
const ddmmyyyyToISO = (val: string): string => {
  const parts = val.split(/[\/\-]/).map(p => p.trim());
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) return '';
  const [d, m, y] = parts;
  return `${y.padStart(4, '0')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
};

const isoToDDMMYYYY = (iso: string): string => {
  const parts = iso.split('-');
  if (parts.length !== 3) return '';
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;
};

export const ChatSetup: React.FC<ChatSetupProps> = ({
  initialLead,
  onStartChat,
  onOpenCampaignsModal,
}) => {
  const [name, setName] = useState(initialLead.name || 'Juan');
  const [dateInput, setDateInput] = useState('01/09/2026');
  const [selectedCampaignName, setSelectedCampaignName] = useState(initialLead.lastEvent || 'OLIMPIADAS EXCEL - SEP26');
  const [daysSince, setDaysSince] = useState(initialLead.daysSinceEvent || 4);
  const [matchedCampaign, setMatchedCampaign] = useState<Campaign | null>(null);

  // When date input changes, automatically resolve campaign
  const handleDateChange = (val: string) => {
    setDateInput(val);
    if (!val.trim()) return;
    const res = findCampaignByDate(val);
    if (res) {
      setMatchedCampaign(res.campaign);
      setSelectedCampaignName(res.campaign.name);
      setDaysSince(res.daysSinceEnd || 4);
    }
  };

  // Sync initial setup
  useEffect(() => {
    const res = findCampaignByDate(dateInput);
    if (res) {
      setMatchedCampaign(res.campaign);
      setSelectedCampaignName(res.campaign.name);
      setDaysSince(res.daysSinceEnd || 4);
    } else {
      const found = CAMPAIGNS.find(c => c.name === selectedCampaignName) || CAMPAIGNS[0];
      setMatchedCampaign(found);
      setDateInput(found.startDate);
      setDaysSince(calculateDaysSinceCampaignEnd(found) || 4);
    }
  }, []);

  const handleSelectCampaignFromList = (campaignName: string) => {
    const found = CAMPAIGNS.find(c => c.name === campaignName);
    if (found) {
      setMatchedCampaign(found);
      setSelectedCampaignName(found.name);
      setDateInput(found.startDate);
      setDaysSince(calculateDaysSinceCampaignEnd(found) || 4);
    }
  };

  const triggerStartChat = () => {
    const finalLead: LeadInfo = {
      name: name.trim() || 'Prospecto',
      lastEvent: selectedCampaignName || 'los directos de Excel',
      daysSinceEvent: daysSince || 4,
      status: 'pending'
    };
    onStartChat(finalLead);
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    triggerStartChat();
  };

  const previewText = buildInitialMessage(name.trim() || 'Juan', daysSince || 4, selectedCampaignName || 'los directos de Excel');

  return (
    <div className="flex-1 min-h-0 w-full overflow-y-auto bg-[#f2f4f7] flex flex-col items-center p-2.5 sm:p-5 pb-24 sm:pb-28">
      <div className="max-w-4xl w-full bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200/80 overflow-hidden flex flex-col my-1 sm:my-3">
        
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white p-4 sm:p-6 relative overflow-hidden border-b border-emerald-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            {/* Identity */}
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white font-black text-xl sm:text-2xl border-2 border-emerald-400/80 shadow-md">
                  M
                </div>
                <span className="absolute -bottom-1 -right-1 bg-amber-400 text-emerald-950 text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs uppercase">
                  MVP
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
                    Miguel · ExcelyFinanzas
                  </h2>
                  <span className="bg-emerald-800/90 text-emerald-200 border border-emerald-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    Setter Oficial
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-emerald-200/90 flex items-center gap-1 mt-0.5">
                  <Award size={13} className="text-amber-300 shrink-0" />
                  Microsoft MVP de Excel & CEO de ExcelyFinanzas
                </p>
              </div>
            </div>

            {/* Quick Header Buttons */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
              <button
                type="button"
                onClick={onOpenCampaignsModal}
                className="flex items-center gap-1.5 bg-emerald-800/80 hover:bg-emerald-700 text-amber-200 border border-emerald-600 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
                title="Ver lista de los 31 lanzamientos"
              >
                <Calendar size={13} className="text-amber-300" />
                <span className="hidden xs:inline">31</span> Lanzamientos
              </button>

              {/* Instant Start Button right in the header */}
              <button
                type="button"
                onClick={triggerStartChat}
                className="bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <span>Iniciar Chat</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Form */}
        <form onSubmit={handleStart} className="p-3.5 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* Left Column: Form Controls (7 cols on lg) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Step 1: Lead Recipient Name */}
              <div className="bg-gray-50/80 p-3 sm:p-4 rounded-2xl border border-gray-200 space-y-2">
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <User size={15} className="text-emerald-600" />
                    1. ¿A quién va dirigido el mensaje?
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100/80 px-2 py-0.5 rounded-full">
                    Obligatorio
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Escribe el nombre del alumno (ej. Juan, Laura, Carlos...)"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all shadow-2xs"
                />
                <p className="text-[11px] text-gray-500">
                  Miguel le saludará personalmente por su nombre al comenzar la conversación.
                </p>
              </div>

              {/* Step 2: Date & Launch Campaign */}
              <div className="bg-gray-50/80 p-3 sm:p-4 rounded-2xl border border-gray-200 space-y-2.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar size={15} className="text-emerald-600" />
                    2. Fecha o Campaña del Lanzamiento
                  </label>
                  <button
                    type="button"
                    onClick={onOpenCampaignsModal}
                    className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold underline flex items-center gap-1"
                  >
                    <Search size={11} /> Ver las 31 campañas
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <input
                      type="date"
                      value={ddmmyyyyToISO(dateInput)}
                      onChange={(e) => handleDateChange(isoToDDMMYYYY(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all shadow-2xs cursor-pointer"
                    />
                  </div>

                  <div className="sm:w-56">
                    <select
                      value={selectedCampaignName}
                      onChange={(e) => handleSelectCampaignFromList(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-xs text-gray-800 outline-none font-semibold truncate shadow-2xs cursor-pointer focus:border-emerald-600"
                    >
                      {CAMPAIGNS.map(c => (
                        <option key={c.name} value={c.name}>
                          {c.name} ({c.startDate})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Detected Campaign Info Card */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5">
                  <div className="bg-emerald-600 text-white p-1.5 rounded-lg mt-0.5 shrink-0">
                    <BookOpen size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                      Campaña detectada:
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-emerald-950 truncate">
                      {matchedCampaign ? matchedCampaign.name : selectedCampaignName}
                    </h4>
                    {matchedCampaign && (
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        Del <span className="font-semibold">{matchedCampaign.startDate}</span> al <span className="font-semibold">{matchedCampaign.endDate}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Step 3: Elapsed Days */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                    <Clock size={14} className="text-emerald-600" />
                    <span>Días transcurridos tras los directos:</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1"
                      max="999"
                      value={daysSince}
                      onChange={(e) => setDaysSince(parseInt(e.target.value) || 1)}
                      className="w-16 text-center font-bold text-sm bg-white border border-gray-300 rounded-lg py-1 px-1 text-emerald-900 focus:border-emerald-600 outline-none shadow-2xs"
                    />
                    <span className="text-xs text-gray-500 font-medium">días</span>
                  </div>
                </div>
              </div>

              {/* Primary Launch Button Directly in Form */}
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-5 rounded-2xl text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg hover:shadow-emerald-600/30 transition-all active:scale-98"
              >
                <span>Comenzar conversación con {name || 'el alumno'}</span>
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Right Column: Live Message Preview (5 cols on lg) */}
            <div className="lg:col-span-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare size={14} className="text-emerald-600" />
                  Mensaje que se enviará:
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={11} className="text-emerald-600" /> En directo
                </span>
              </div>

              {/* WhatsApp Simulated Bubble */}
              <div className="bg-[#e5ddd5] p-3.5 sm:p-4 rounded-2xl border border-gray-300 shadow-inner">
                <div className="bg-white rounded-2xl rounded-tl-none p-3.5 shadow-sm text-xs text-gray-800 leading-relaxed border border-gray-200/70 space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold text-[10px] flex items-center justify-center">
                        M
                      </div>
                      <span className="font-bold text-emerald-900 text-[11px]">
                        Miguel (MVP Excel)
                      </span>
                    </div>
                    <span className="text-[9px] text-gray-400 font-mono">10:00</span>
                  </div>

                  <p className="whitespace-pre-line text-gray-700 text-[11px] sm:text-xs">
                    {previewText}
                  </p>

                  <div className="text-right text-[9px] text-gray-400 font-medium">
                    ✓✓ Entregado
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-gray-500 text-center sm:text-left px-1">
                Este es el primer mensaje oficial. El chat abrirá de forma limpia solo con esta presentación.
              </p>
            </div>

          </div>
        </form>
      </div>

      {/* FIXED / STICKY BOTTOM ACTION BAR (Always visible on mobile & desktop) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 shadow-xs">
            M
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
              Iniciar chat con <span className="text-emerald-700">{name.trim() || 'el alumno'}</span>
            </p>
            <p className="text-[10px] sm:text-[11px] text-gray-500 truncate">
              {matchedCampaign ? matchedCampaign.name : selectedCampaignName} · {daysSince} días después
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={triggerStartChat}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 sm:px-7 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm transition-all shadow-lg hover:shadow-emerald-600/30 active:scale-95 flex items-center gap-1.5 sm:gap-2 shrink-0"
        >
          <span>Comenzar Chat</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
