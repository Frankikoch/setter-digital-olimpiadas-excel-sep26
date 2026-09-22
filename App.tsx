
import React, { useState, useEffect, useRef } from 'react';
import { Message, LeadInfo, LeadContexto } from './types';
import { setterService, buildInitialMessage } from './services/gemini';
import { CAMPAIGNS, Campaign, findCampaignByDate, calculateDaysSinceCampaignEnd } from './data/campaigns';
import { CampaignsModal } from './components/CampaignsModal';
import { ChatSetup } from './components/ChatSetup';
import { 
  Send, 
  MoreVertical, 
  Phone, 
  Video, 
  CheckCheck, 
  Clock, 
  LayoutDashboard,
  MessageSquare,
  TrendingUp,
  Award,
  Zap,
  RotateCcw,
  Sliders,
  BadgeCheck,
  Sparkles,
  Calendar,
  Search,
  Check,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

const ProductCard = ({ type }: { type: NonNullable<Message['productCard']> }) => {
  const configs = {
    packelite: {
      title: "Pack Élite: Excel + IA Aplicada",
      price: "497€",
      features: ["Excel + IA completo", "12 Meses Acceso", "War Room Semanal", "Doble Certificación"],
      icon: <Award className="text-amber-500" />,
      color: "from-emerald-600 to-emerald-800",
      bg: "bg-emerald-50"
    },
    intensivo: {
      title: "Excel Intensivo (Directo)",
      price: "97€",
      features: ["6 Clases en Vivo", "3 Profes MVP", "+3 Bonus", "Certificado"],
      icon: <TrendingUp className="text-blue-500" />,
      color: "from-blue-600 to-blue-800",
      bg: "bg-blue-50"
    },
    grabado: {
      title: "Intensivo Grabado",
      price: "47€",
      features: ["Grabaciones Ilimitadas", "Píldoras Diarias", "Retos Prácticos", "A tu ritmo"],
      icon: <Zap className="text-amber-600" />,
      color: "from-amber-600 to-amber-800",
      bg: "bg-amber-50"
    }
  };

  const config = configs[type];

  return (
    <div className={`mt-3 overflow-hidden rounded-xl border border-gray-200 shadow-md ${config.bg} animate-in zoom-in-95 duration-300 w-full max-w-sm sm:max-w-md mx-auto`}>
      <div className={`p-4 bg-gradient-to-r ${config.color} text-white`}>
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-bold text-base sm:text-lg leading-tight">{config.title}</h4>
            <p className="text-emerald-100 text-[10px] sm:text-xs opacity-90 mt-1">Inversión única recomendada por Miguel</p>
          </div>
          <div className="bg-white/20 p-2 rounded-lg">
            {config.icon}
          </div>
        </div>
        <div className="mt-2 text-xl sm:text-2xl font-black">{config.price}</div>
      </div>
      <div className="p-3 sm:p-4">
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          {config.features.map(f => (
            <div key={f} className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-gray-600">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0" />
              <span className="truncate">{f}</span>
            </div>
          ))}
        </div>
        <button className={`w-full mt-3 sm:mt-4 py-2.5 rounded-lg font-bold text-xs sm:text-sm text-white transition-transform active:scale-95 bg-gradient-to-r ${config.color} shadow hover:opacity-95`}>
          ¡Quiero asegurar mi plaza!
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isChatActive, setIsChatActive] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [dateSearchInput, setDateSearchInput] = useState('');
  const [tableSearchQuery, setTableSearchQuery] = useState('');
  
  const [leadInfo, setLeadInfo] = useState<LeadInfo>({
    name: 'Juan',
    lastEvent: 'OLIMPIADAS EXCEL - SEP26',
    daysSinceEvent: 4,
    status: 'pending'
  });

  const handleDateLookup = (dateStr: string) => {
    setDateSearchInput(dateStr);
    if (!dateStr.trim()) return;
    const res = findCampaignByDate(dateStr);
    if (res) {
      setLeadInfo(prev => ({
        ...prev,
        lastEvent: res.campaign.name,
        daysSinceEvent: res.daysSinceEnd
      }));
    }
  };

  const handleSelectCampaign = (campaign: Campaign) => {
    const days = calculateDaysSinceCampaignEnd(campaign);
    const updated: LeadInfo = {
      ...leadInfo,
      lastEvent: campaign.name,
      daysSinceEvent: days
    };
    setLeadInfo(updated);
    setDateSearchInput(campaign.startDate);
    setShowCalendarModal(false);
    if (isChatActive) {
      startNewChat(updated);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const startNewChat = async (info: LeadInfo = leadInfo) => {
    setIsTyping(true);
    try {
      const assistantMsg = await setterService.startConversation(
        info.name,
        info.daysSinceEvent || 4,
        info.lastEvent,
        info.contexto
      );
      setMessages([assistantMsg]);
    } catch (error) {
      console.error("Error starting conversation", error);
      // Fallback direct message
      const initialText = buildInitialMessage(info.name, info.daysSinceEvent || 4, info.lastEvent);
      setMessages([{
        id: Date.now().toString(),
        role: 'assistant',
        text: initialText,
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleStartChat = async (configuredLead: LeadInfo) => {
    setLeadInfo(configuredLead);
    setIsChatActive(true);
    await startNewChat(configuredLead);
  };

  // Auto-arranque desde parametros de URL (integracion con el Dashboard de
  // Leads Calificados): al hacer clic en el boton de WhatsApp de una tarjeta,
  // el dashboard abre esta app con ?name=...&fecha=... y aqui saltamos
  // directo al chat con Miguel ya iniciado, sin pasar por la pantalla de
  // configuracion. Las dos apps siguen siendo independientes: si no llegan
  // parametros (uso normal, sin dashboard) esta app funciona exactamente
  // igual que antes, con su pantalla de configuracion manual.
  // Parametros soportados:
  //   name   (obligatorio) nombre del lead
  //   fecha  fecha de la encuesta/registro (DD/MM/AAAA o similar) -> se
  //          resuelve automaticamente a la campana mas cercana
  //   evento nombre de campana explicito (tiene prioridad sobre fecha)
  //   dias   dias transcurridos explicitos (tiene prioridad sobre lo anterior)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlName = params.get('name');
    if (!urlName) return;

    const urlFecha = params.get('fecha');
    const urlEvento = params.get('evento');
    const urlDias = params.get('dias');
    const urlContexto = params.get('contexto');

    let lastEvent = leadInfo.lastEvent;
    let daysSinceEvent = leadInfo.daysSinceEvent;

    if (urlEvento) {
      lastEvent = urlEvento;
    } else if (urlFecha) {
      const res = findCampaignByDate(urlFecha);
      if (res) {
        lastEvent = res.campaign.name;
        daysSinceEvent = res.daysSinceEnd;
      }
    }

    if (urlDias) {
      const parsedDias = parseInt(urlDias, 10);
      if (!isNaN(parsedDias)) daysSinceEvent = parsedDias;
    }

    // Datos adicionales de la encuesta/CRM (area, situacion laboral, nivel
    // de Excel, comentario, info de empresa...) que el dashboard manda como
    // un JSON en el parametro "contexto", para que Miguel pueda referenciarlos
    // en la conversacion y suene mas creible. Si no llega (uso manual del
    // setter) simplemente se omite, sin romper nada.
    let contexto: LeadContexto | undefined;
    if (urlContexto) {
      try {
        contexto = JSON.parse(urlContexto);
      } catch (e) {
        console.warn('No se pudo interpretar el contexto del lead recibido por URL', e);
      }
    }

    const leadFromUrl: LeadInfo = {
      name: urlName,
      lastEvent: lastEvent || 'los directos de Excel',
      daysSinceEvent: daysSinceEvent || 4,
      status: 'pending',
      contexto
    };

    handleStartChat(leadFromUrl);
    // Solo debe ejecutarse una vez, al montar el componente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInputText('');
    setIsTyping(true);

    try {
      const assistantMsg = await setterService.sendMessage(textToSend);
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Error sending message", error);
    } finally {
      setIsTyping(false);
    }
  };

  const quickReplies = [
    { label: "💸 Precio / Presupuesto", text: "Hola Miguel, la verdad es que me encantaron los directos pero ahora mismo la inversión se me va de presupuesto." },
    { label: "⏰ Falta de tiempo", text: "Buenas Miguel, estuve súper motivado en los directos pero ando desbordado de trabajo y temo no tener tiempo." },
    { label: "📊 Nivel de dificultad", text: "Hola Miguel! Me frenó la duda de si mi nivel será suficiente para seguir el ritmo o si será demasiado avanzado." },
    { label: "📅 Fecha 20/01/2025 (Juegos Invierno)", text: "Hola Miguel, yo estuve en los directos del 20/01/2025 pero no pude terminar de dar el paso." },
    { label: "📅 Fecha 10/03/2024 (Desafio Dashboards)", text: "Buenas Miguel! Asistí a los directos del 10/03/2024 y me quedé con algunas dudas." },
    { label: "📦 Opción grabada", text: "Hola Miguel, ¿tenéis alguna opción para acceder a los contenidos grabados y verlos a mi propio ritmo?" }
  ];

  const filteredCampaigns = CAMPAIGNS.filter(c => 
    c.name.toLowerCase().includes(tableSearchQuery.toLowerCase()) ||
    c.startDate.includes(tableSearchQuery) ||
    c.endDate.includes(tableSearchQuery)
  );

  return (
    <div className="flex flex-col h-[100dvh] bg-[#e5ddd5] font-sans text-gray-800 overflow-hidden">
      {/* Top Bar - Lead Setter Context */}
      <nav className="bg-emerald-950 text-white px-3 py-2 flex justify-between items-center shadow-md z-10 shrink-0">
        <div className="flex items-center gap-2">
          {isChatActive ? (
            <button
              onClick={() => setIsChatActive(false)}
              className="flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-700 text-amber-200 border border-emerald-600 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors shadow-2xs"
              title="Volver a la pantalla de configuración"
            >
              <ArrowLeft size={13} />
              <span>Nuevo Contacto</span>
            </button>
          ) : (
            <div className="bg-emerald-600 p-1.5 rounded-lg">
              <LayoutDashboard size={15} />
            </div>
          )}

          <div>
            <h1 className="font-bold tracking-tight text-xs sm:text-sm flex items-center gap-1.5">
              ExcelyFinanzas <span className="text-emerald-400 font-normal">| Setter AI</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Button to view all 31 launches */}
          <button 
            onClick={() => setShowCalendarModal(true)}
            className="flex items-center gap-1.5 bg-emerald-800/80 hover:bg-emerald-700 px-2.5 py-1 rounded-full border border-emerald-600 text-[10px] sm:text-xs transition-colors"
            title="Ver los 31 lanzamientos y fechas oficiales"
          >
            <Calendar size={12} className="text-amber-300" />
            <span className="font-semibold text-amber-200">31 Lanzamientos</span>
          </button>

          {!isChatActive && (
            <button
              onClick={() => handleStartChat(leadInfo)}
              className="flex items-center gap-1.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-xs active:scale-95"
              title="Iniciar chat con la configuración actual"
            >
              <span>Iniciar Chat</span>
              <ArrowRight size={13} />
            </button>
          )}

          {isChatActive && (
            <>
              <button 
                onClick={() => setShowConfig(!showConfig)}
                className="flex items-center gap-1.5 bg-emerald-800/80 hover:bg-emerald-800 px-2.5 py-1 rounded-full border border-emerald-700 text-[10px] sm:text-xs transition-colors"
                title="Ajustar parámetros del lanzamiento"
              >
                <Sliders size={12} className="text-emerald-300" />
                <span className="font-medium hidden sm:inline">Ajustes</span>
                <span className="bg-emerald-600/60 px-1.5 py-0.5 rounded text-[9px] font-mono">{leadInfo.daysSinceEvent}d</span>
              </button>

              <button
                onClick={() => startNewChat()}
                disabled={isTyping}
                className="flex items-center gap-1 bg-emerald-800/80 hover:bg-emerald-800 p-1.5 rounded-full border border-emerald-700 text-emerald-300 transition-colors"
                title="Reiniciar conversación con este prospecto"
              >
                <RotateCcw size={13} />
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Expandable Configuration Drawer for adjustments while in chat */}
      {showConfig && isChatActive && (
        <div className="bg-emerald-900 text-emerald-50 px-4 py-3 border-b border-emerald-800 shadow-inner z-20 text-xs animate-in slide-in-from-top-2 duration-200">
          <div className="max-w-5xl mx-auto space-y-3">
            <div className="flex justify-between items-center pb-1 border-b border-emerald-800/70">
              <span className="font-semibold text-emerald-200 flex items-center gap-1.5">
                <Sliders size={13} /> Ajuste rápido de datos del lead actual:
              </span>
              <button 
                onClick={() => setShowConfig(false)}
                className="text-emerald-300 hover:text-white text-[11px]"
              >
                Cerrar ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[10px] text-emerald-300 mb-0.5">Nombre del prospecto:</label>
                <input 
                  type="text" 
                  value={leadInfo.name}
                  onChange={(e) => setLeadInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-emerald-950 border border-emerald-700 rounded px-2 py-1 text-white text-xs outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="block text-[10px] text-emerald-300 mb-0.5">Lanzamiento asignado:</label>
                <input 
                  type="text" 
                  value={leadInfo.lastEvent}
                  onChange={(e) => setLeadInfo(prev => ({ ...prev, lastEvent: e.target.value }))}
                  className="w-full bg-emerald-950 border border-emerald-700 rounded px-2 py-1 text-white text-xs outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="block text-[10px] text-emerald-300 mb-0.5">Días transcurridos tras directos:</label>
                <div className="flex gap-1.5">
                  <input 
                    type="number" 
                    min="1" 
                    max="999"
                    value={leadInfo.daysSinceEvent || 4}
                    onChange={(e) => setLeadInfo(prev => ({ ...prev, daysSinceEvent: parseInt(e.target.value) || 1 }))}
                    className="w-20 bg-emerald-950 border border-emerald-700 rounded px-2 py-1 text-white text-xs outline-none focus:border-emerald-400"
                  />
                  <button
                    onClick={() => {
                      setShowConfig(false);
                      startNewChat(leadInfo);
                    }}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold px-3 py-1 rounded text-xs transition-colors"
                  >
                    Actualizar Chat
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Campaigns Table Modal */}
      <CampaignsModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        onSelectCampaign={handleSelectCampaign}
        selectedCampaignName={leadInfo.lastEvent}
      />

      {/* Main View: Setup Screen vs Active WhatsApp Chat */}
      {!isChatActive ? (
        <ChatSetup
          initialLead={leadInfo}
          onStartChat={handleStartChat}
          onOpenCampaignsModal={() => setShowCalendarModal(true)}
        />
      ) : (
        <div className="flex flex-1 overflow-hidden relative">
        <main className="flex-1 flex flex-col min-w-0 bg-[#e5ddd5] relative">
          {/* WhatsApp Header - Showing Miguel (MVP Microsoft Excel & CEO ExcelyFinanzas) */}
          <div className="bg-[#f0f2f5] px-3 sm:px-4 py-2 border-b border-gray-300 flex justify-between items-center shadow-sm shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="relative">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-700 rounded-full flex items-center justify-center text-white font-bold shadow-sm text-sm sm:text-base border border-emerald-600">
                  M
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-bold text-gray-800 text-sm sm:text-base leading-tight">
                    Miguel · ExcelyFinanzas
                  </h3>
                  <span className="inline-flex items-center gap-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border border-emerald-300">
                    <BadgeCheck size={11} className="text-emerald-600" />
                    Microsoft MVP
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-green-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  en línea
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 text-gray-500">
              <button
                onClick={() => setIsChatActive(false)}
                className="flex items-center gap-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all shadow-2xs"
                title="Configurar otro alumno o campaña"
              >
                <ArrowLeft size={12} className="text-emerald-600" />
                <span className="hidden sm:inline">Cambiar</span> Contacto
              </button>
              <div className="hidden md:flex flex-col items-end text-right">
                <span className="text-[10px] text-gray-500 font-medium">Conversación con:</span>
                <span className="text-xs font-bold text-gray-700">{leadInfo.name}</span>
              </div>
              <Video size={18} className="cursor-not-allowed opacity-30" />
              <Phone size={18} className="cursor-not-allowed opacity-30" />
              <MoreVertical size={18} className="cursor-pointer hover:text-gray-700" onClick={() => setShowConfig(!showConfig)} />
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:px-16 lg:px-36 xl:px-64 space-y-3 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
            <div className="flex justify-center mb-3">
              <div className="bg-white/85 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] text-gray-600 shadow-sm border border-white/60 flex items-center gap-1.5 font-medium">
                <Clock size={11} className="text-emerald-600" />
                Interacción directa tras {leadInfo.lastEvent} ({leadInfo.daysSinceEvent} días)
              </div>
            </div>

            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div 
                  className={`max-w-[94%] sm:max-w-[85%] md:max-w-[82%] px-3.5 py-2.5 rounded-2xl shadow-sm text-xs sm:text-sm relative leading-relaxed
                    ${msg.role === 'user' 
                      ? 'bg-[#dcf8c6] text-gray-800 rounded-tr-none' 
                      : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                    }`}
                >
                  {/* Assistant sender label */}
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 mb-1">
                      <span>Miguel (ExcelyFinanzas)</span>
                      <BadgeCheck size={11} className="text-emerald-600" />
                    </div>
                  )}

                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  
                  {msg.productCard && (
                    <ProductCard type={msg.productCard} />
                  )}

                  <div className={`flex items-center justify-end gap-1 mt-1 text-[8px] sm:text-[9px] ${msg.role === 'user' ? 'text-emerald-700' : 'text-gray-400'}`}>
                    <span>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.role === 'user' && <CheckCheck size={12} className="text-blue-500" />}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white px-3.5 py-2.5 rounded-2xl shadow-sm rounded-tl-none flex gap-2 items-center border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-medium">Miguel está escribiendo</span>
                  <div className="flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reply Objection Chips */}
          <div className="bg-[#f0f2f5]/90 border-t border-gray-200/80 px-3 py-1.5 shrink-0 overflow-x-auto">
            <div className="max-w-5xl mx-auto flex items-center gap-1.5 whitespace-nowrap text-[11px]">
              <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider flex items-center gap-1 shrink-0">
                <Sparkles size={11} className="text-amber-500" /> Probar objeción:
              </span>
              {quickReplies.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q.text)}
                  disabled={isTyping}
                  className="bg-white hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 border border-gray-300 hover:border-emerald-400 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all shrink-0 active:scale-95 shadow-2xs"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-[#f0f2f5] p-2 sm:p-3 border-t border-gray-300 shrink-0">
            <div className="w-full max-w-5xl mx-auto flex items-center gap-2 sm:gap-3">
              <div className="flex-1 bg-white rounded-full flex items-center px-4 py-2 sm:py-2.5 shadow-sm border border-gray-200 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
                <input
                  type="text"
                  placeholder={`Responder a Miguel como ${leadInfo.name}...`}
                  className="flex-1 outline-none text-xs sm:text-sm bg-transparent"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
              </div>
              <button 
                onClick={() => handleSend()}
                disabled={!inputText.trim() || isTyping}
                className={`p-2.5 sm:p-3 rounded-full flex items-center justify-center transition-all shadow-md active:scale-90 shrink-0
                  ${inputText.trim() && !isTyping 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                title="Enviar mensaje"
              >
                <Send size={16} className="sm:size-4" />
              </button>
            </div>
          </div>
        </main>

        {/* Floating AI Helper Tip */}
        <div className="absolute bottom-28 right-6 hidden xl:block max-w-[240px] pointer-events-none z-20">
          <div className="bg-white p-3 rounded-2xl shadow-xl border-2 border-emerald-600 relative">
            <div className="flex items-center gap-1.5 mb-1.5 text-emerald-700 font-bold text-[11px] uppercase tracking-tight">
              <MessageSquare size={13} />
              Estrategia Setter (Miguel MVP)
            </div>
            <p className="text-[10px] text-gray-600 leading-snug font-medium">
              Miguel se presenta primero con su cargo de MVP y CEO, saluda a Juan y pregunta qué le detuvo. Solo cuando Juan expresa su duda u objeción, Miguel responde con empatía y le propone la oferta adecuada.
            </p>
            <div className="absolute -bottom-2 right-6 w-3.5 h-3.5 bg-white border-r-2 border-b-2 border-emerald-600 rotate-45"></div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default App;

