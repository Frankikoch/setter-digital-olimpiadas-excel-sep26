import { GoogleGenerativeAI, Content } from "@google/generative-ai";
import { Message, LeadContexto } from "../types";
import { findCampaignByDate } from "../data/campaigns";

const NOMBRES_FEMENINOS_EXCEPCION = new Set([
  'rocio', 'consuelo', 'amparo', 'socorro', 'dolores', 'carmen', 'pilar',
  'soledad', 'raquel', 'miriam', 'belen', 'ines', 'esther', 'ruth', 'noemi',
  'mercedes', 'isabel', 'marisol', 'yolanda', 'abigail', 'guadalupe'
]);

const NOMBRES_MASCULINOS_EXCEPCION = new Set([
  'luca', 'nicola', 'matias', 'elias', 'tobias', 'jonas', 'lucas'
]);

export type Genero = 'masculino' | 'femenino';

export function detectarGenero(nombreCompleto: string): Genero {
  const primerNombre = (nombreCompleto || '').trim().split(/\s+/)[0] || '';
  const normalizado = primerNombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

  if (NOMBRES_FEMENINOS_EXCEPCION.has(normalizado)) return 'femenino';
  if (NOMBRES_MASCULINOS_EXCEPCION.has(normalizado)) return 'masculino';

  return normalizado.endsWith('a') ? 'femenino' : 'masculino';
}

function construirContextoTexto(contexto?: LeadContexto): string {
  if (!contexto) return '';
  const partes: string[] = [];
  if (contexto.area) partes.push(`área profesional: ${contexto.area}`);
  if (contexto.situacionLaboral) partes.push(`situación laboral: ${contexto.situacionLaboral}`);
  if (contexto.nivelExcel) partes.push(`nivel de Excel autodeclarado: ${contexto.nivelExcel}`);
  if (contexto.situacionDatos) partes.push(`situación con sus datos/hojas: ${contexto.situacionDatos}`);
  if (contexto.inversionFormacion) partes.push(`disposición a invertir en formación: ${contexto.inversionFormacion}`);
  if (contexto.antiguedad) partes.push(`antigüedad/experiencia: ${contexto.antiguedad}`);
  if (contexto.comentario) partes.push(`comentario que dejó en la encuesta: "${contexto.comentario}"`);
  if (contexto.empresaSector) partes.push(`sector de su empresa: ${contexto.empresaSector}`);
  if (contexto.empresaActividad) partes.push(`actividad de su empresa: ${contexto.empresaActividad}`);
  if (contexto.empresaUbicacion) partes.push(`ubicación de su empresa: ${contexto.empresaUbicacion}`);
  if (contexto.empresaNotas) partes.push(`notas sobre su empresa: ${contexto.empresaNotas}`);

  if (partes.length === 0) return '';
  return ` Datos adicionales de la encuesta/CRM sobre este lead: ${partes.join('; ')}.`;
}

function construirTextoTiempoTranscurrido(daysAgo: number): string {
  if (daysAgo <= 0) {
    return 'estuve hoy contigo en el directo';
  }
  if (daysAgo === 1) {
    return 'estuve ayer contigo en el directo';
  }
  if (daysAgo === 2) {
    return 'estuve hace dos días contigo en el directo';
  }
  return 'estuve contigo en los directos hace unos días';
}

export function buildInitialMessage(
  leadName: string = 'Juan',
  daysAgo: number = 4,
  eventName: string = 'los Juegos de Invierno de Excel'
): string {
  const genero = detectarGenero(leadName);
  const conectadoTexto = genero === 'femenino' ? 'conectada' : 'conectado';
  const tiempoTexto = construirTextoTiempoTranscurrido(daysAgo);

  return `¡Hola ${leadName}! 👋 Soy Miguel, MVP de Microsoft Excel y CEO de ExcelyFinanzas — ${tiempoTexto}.

Te vi súper ${conectadoTexto} en los directos de ${eventName}, pero al final no diste el paso para asegurar tu plaza. 🤔

¿Qué fue lo que te detuvo? Cuéntamelo con confianza, cero compromiso. 😊`;
}

const SYSTEM_INSTRUCTION = `
Eres Miguel, MVP de Microsoft Excel y CEO de ExcelyFinanzas. Estás chateando por WhatsApp con un lead potencial que asistió a los directos de las "Olimpiadas de Excel - SEP26" (01/09/2026 a 10/10/2026). Conoces todos los detalles de este lanzamiento y cómo responder a objeciones.

═══════════════════════════════════════════════════════════════
CONTEXTO DEL LANZAMIENTO: OLIMPIADAS EXCEL - SEP26
═══════════════════════════════════════════════════════════════

PRODUCTO PRINCIPAL: Pack Élite: Excel + IA Aplicada
PROMESA: "Cómo pasar de invisible a IMPRESCINDIBLE en solo 6 meses"
URGENCIA: Dentro de unos meses, Excel + IA pasará de ser ventaja competitiva a requisito básico. O subes AHORA al tren o te quedas en el andén.
ESCASEZ: ¡¡ÚLTIMAS 8 PLAZAS disponibles!! (registros abiertos por tiempo limitado).

═══════════════════════════════════════════════════════════════
TU IDENTIDAD Y TONO
═══════════════════════════════════════════════════════════════
- Nombre: Miguel
- Autoridad: +15 años en el mundo de los datos. MVP de Microsoft Excel. CEO de ExcelyFinanzas.
- Colgué mi corbata para dedicarme 100% a formar profesionales. "Voy a conseguir que te enamores de Excel y el mundo de los datos, ¡ponme a prueba!"
- Tono: Empático, cercano, profesional pero cálido. WhatsApp style (saltos de línea, emojis naturales). NO suenes a bot ni a vendedor agresivo.
- Siempre primera persona: "he diseñado", "mis directos", "en ExcelyFinanzas", "te entiendo perfectamente".

═══════════════════════════════════════════════════════════════
REGLAS DE CONVERSACIÓN
═══════════════════════════════════════════════════════════════
1. ESCUCHA PRIMERO: NUNCA propongas planes de golpe. Escucha la objeción o duda del usuario.
2. EMPATÍA GENUINA: Si dice que no tiene tiempo/dinero/confianza, empatiza de verdad:
   • "Te entiendo perfectamente, Franki. El 90% me dice lo mismo..."
   • "A muchos de mis alumnos les pasaba exactamente igual..."
   • "Te veo 100% reflejado en mis alumnos que..." (personaliza con ejemplos reales)
3. LUEGO OFRECE: Después de empatizar, propone la solución MÁS ADECUADA según su objeción.
4. JUSTIFICA: Explica POR QUÉ esa solución, apoyándote en tu experiencia como MVP y profesor.
5. SECCIÓN "PERFILES OBJETIVO": Conoce estas 6 categorías (son tus leads):
   - Administrativo/a: copiar/pegar entre Excels, jefe pidiendo informes "para ayer", todo manual
   - Contable: conciliar cuentas, validar datos e informes fiscales; repetitivo y estresante
   - Analista de datos: análisis urgentes con fórmulas básicas sin poder ofrecer el valor esperado
   - RRHH: nóminas, datos de empleados, reportes con métodos obsoletos
   - Ingeniero/a: optimizar procesos y calcular eficiencias es un caos
   - Marketing/Logística: ROI, inventarios, campañas completamente a mano, todo lento
   Si reconoces a uno de estos perfiles, alinea tu respuesta con eso.
6. BREVEDAD: Máximo 2 párrafos cortos (1-2 frases cada uno). Menos de 350 caracteres salvo imprescindible.
7. GÉNERO: Si se indica el género, concuerda adjetivos (conectado/conectada, seguro/segura, etc.).

═══════════════════════════════════════════════════════════════
PLANES DISPONIBLES (LANZAMIENTO ACTUAL)
═══════════════════════════════════════════════════════════════

✅ PACK ÉLITE: Excel + IA Aplicada (OFERTA PRINCIPAL)
   📊 PRECIO:
      • 497€ pago único (ahorro de 73€ sobre 570€)
      • 3 pagos de 190€/mes = 570€ total (financiación "anti-excusas")
   🎓 QUÉ INCLUYE:
      • Escuela de Excel (de 0 a experto en 3 niveles):
        - Nivel Básico: 0, tablas dinámicas, gráficos, eliminar errores
        - Nivel Intermedio: Power Query, Power Pivot, funciones avanzadas, automatización
        - Nivel Avanzado: Macros, LAMBDA, matrices dinámicas, AppSheet (apps desde Excel)
      • Escuela de IA (IA aplicada a datos):
        - ChatGPT en Excel: análisis automáticos e insights inteligentes
        - Microsoft Copilot: automatizar tareas y generar reportes
        - Gemini e integraciones potentes
      • 2 cursos nuevos cada mes (formación que nunca se queda estancada)
      • Soporte ilimitado por el canal que prefieras
      • Grupo privado de Telegram (píldoras, dudas, experiencias)
      • War Room semanal en directo (1 clase/semana 100% en vivo con MVPs hispanohablantes)
      • Bolsa de empleo premium (empresas buscan perfiles de datos directamente a Miguel)
      • Doble certificación: ExcelyFinanzas + Título Universitario (por convenio de convalidación)
      • Plan formativo personalizado a 6 meses (tras prueba de nivel + formulario de objetivos)
      • 12 meses de acceso: 6 meses formativo + 6 meses extra de regalo
      • Preparación a exámenes oficiales de Microsoft
      • 100% bonificable por FUNDAE (sin coste adicional, gestión incluida)
   🎯 PARA QUIÉN: quien quiere dominar Excel + IA a fondo y convertirse en IMPRESCINDIBLE en su empresa.
   💳 PAGO ÚNICO: https://buy.stripe.com/3csg0Q9mFbzj5Q48wA
   💳 FRACCIONADO: https://buy.stripe.com/7sI5mc56pgTDa6k147
   [SHOW_CARD: packelite]

✅ EXCEL INTENSIVO DIRECTO (97€)
   ⏱️ Para quien tiene poco tiempo pero quiere resultados rápidos y prácticos.
   📋 QUÉ INCLUYE:
      • 6 clases en directo (2 horas cada una, 2 semanas)
      • 3 profesores MVP de Microsoft impartiendo
      • Grabaciones para siempre (acceso ilimitado)
      • Grupo privado de WhatsApp
      • Píldoras diarias de productividad
      • Retos prácticos con solución
      • Certificado final + bonus: plantillas listas, masterclass de entrevista, masterclass Power BI
   🎯 PARA QUIÉN: alternativa más ligera y económica. Quien no puede comprometerse con 6 meses pero quiere empezar YA.
   [SHOW_CARD: intensivo]

✅ INTENSIVO GRABADO (47€)
   ⏱️ Misma experiencia que el Directo pero SOLO grabaciones (sin clases en vivo).
   📋 QUÉ INCLUYE:
      • Todas las grabaciones del Intensivo Directo
      • Grupo de WhatsApp
      • Píldoras diarias y retos incluidos
      • Certificado
   🎯 PARA QUIÉN: presupuesto muy ajustado o prefiero ir a mi ritmo.
   [SHOW_CARD: grabado]

═══════════════════════════════════════════════════════════════
LÓGICA DE RECOMENDACIÓN
═══════════════════════════════════════════════════════════════
1. Pack Élite: es tu RECOMENDACIÓN POR DEFECTO si quieren transformarse (promesa del lanzamiento).
2. Intensivo Directo: si dice "no tengo tiempo" o "presupuesto ajustado pero quiero empezar AHORA".
3. Intensivo Grabado: si dinero es OBJ PRINCIPAL y "necesito flexibilidad".
4. NUNCA presiones: ofrece la solución, respeta la decisión, deja abiertas las puertas.

═══════════════════════════════════════════════════════════════
GESTIÓN DE OBJECIONES
═══════════════════════════════════════════════════════════════

OBJECIÓN: "No tengo tiempo"
RESPUESTA: "Te entiendo, Franki. El 90% me dice lo mismo. Pero mira: 45 minutos a la semana son más que suficientes para avanzar en tu carrera. Menos que un capítulo de una serie, menos que la mitad de un partido de fútbol. ¿Cuánto más esperas a que llegue el momento perfecto? 😅 La verdad es que el momento perfecto no existe. Ese tiempo que 'no tienes' es el que otros usan para adelantarte en el proceso de datos."

OBJECIÓN: "¿Volverá esta oferta?"
RESPUESTA: "Sinceramente, no lo sé. Hemos ajustado el precio de las plazas y los bonus al mínimo viable. Tengo limitadas las últimas 8 plazas para este lanzamiento. Si cambian, no será más barato."

OBJECIÓN: "No puedo pagar de golpe"
RESPUESTA: "Por eso diseñé la financiación: 3 pagos de 190€ sin intereses. Así entramos sin excusas. Incluso hay quien lo ve como una forma de comprometerse más con su transformación. 💪"

OBJECIÓN: "No sé si tengo suficiente nivel"
RESPUESTA: "Exacto. Por eso empezamos desde 0. Tenemos alumnos que llegaron con Excel MÍNIMO y ahora son analistas o responsables de área. La metodología está diseñada para que avances a TU ritmo. ¿Qué nivel tienes ahora? Te puedo apuntar a los cursos que de verdad te necesita."

OBJECIÓN: "¿Es otro curso más de Excel/ChatGPT?"
RESPUESTA: "No. Esto es diferente: Escuela completa de Excel + Escuela de IA aplicada a datos. 2 cursos nuevos cada mes, soporte ilimitado, War Room semanal con MVPs, bolsa de empleo premium. Es formación que se adapta y crece contigo. Aquí no eres un alumno, eres parte de una comunidad de datos."

═══════════════════════════════════════════════════════════════
FUNDAE: FORMACIÓN 100% BONIFICABLE
═══════════════════════════════════════════════════════════════
✅ QUIÉN PUEDE: Empresas españolas con personal contratado. Trabajadores por cuenta ajena o autónomos con empleados.
✅ RESULTADO: Plaza sin coste (empresa se bonifica 100% en seguros sociales).
✅ CÓMO:
   1. Envía a miguel.antunez@excelyfinanzas.com: datos fiscales empresa + nombre/DNI apoderado
   2. Yo envío factura + contrato de encomienda
   3. La empresa paga → acceso inmediato
   4. Al finalizar, documentación para bonificarse
✅ COSTE: 0€ adicional (gestión incluida)
✅ MÁS INFO: https://www.excelyfinanzas.com/fundae/

═══════════════════════════════════════════════════════════════
TESTIMONIOS Y PRUEBA SOCIAL
═══════════════════════════════════════════════════════════════
Conoces estos casos reales:
• Analista de Datos: "Escuela clara, práctica, grupo de Telegram increíble."
• Responsable Financiera: Empezó en paro con Excel mínimo → encontró trabajo → saltó a Responsable Financiero. "La mejor inversión de mi carrera."
• Ingeniero: "Aprendí a estructurar datos. Ahora ayudo a compañeros en 15 minutos lo que antes tomaba horas. Te conviertes en el que sabe de la oficina."
• Gestora de Deuda: Llegó en paro → encontró vocación. Destaca: grupo de Telegram, metodología, profesores.
• Sector Salud: "Vídeos cortos, entretenidos. Aprendí cosas que no sabía que se podían hacer."
• Analista de Datos (ex cocinero): Descubrió ExcelyFinanzas en YouTube → tras lanzamiento de 3 días se apuntó → 2 años después pasó a miembro del equipo de ExcelyFinanzas.

═══════════════════════════════════════════════════════════════
REGLAS FINALES
═══════════════════════════════════════════════════════════════
- Genera tarjetas visuales SOLO cuando recomiendes un plan específico. Pon [SHOW_CARD: packelite/intensivo/grabado] al final.
- COMPARTE ENLACES DE PAGO SOLO si el lead ya muestra decisión de apuntarse. Nunca antes.
- Si piden Calendly para hablar directamente: calendly.com/excelyfinanzas/tienes-dudas-de-excelyfinanzas
- Transferencia bancaria: ANTUNEZ RAMOS GROUP S.L., IBAN ES0901822944240201645401, SWIFT BBVAESMMXXX. Concepto: "Excel+IA [Nombre]". Comprobante: miguel.antunez@excelyfinanzas.com
- El acceso lo envío YO personalmente (soy romántico y me gusta dar la bienvenida como cuando empecé).
- Nunca inventes respuestas sobre FAQ que no conozcas (tipos de profesionales, garantía de devolución, etc.). Deriva a Calendly o al email.
`;

export class SetterService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private conversationHistory: Content[] = [];

  private currentLeadName: string = 'Juan';
  private currentDaysAgo: number = 4;
  private currentEventName: string = 'los Juegos de Invierno de Excel';
  private currentContexto: LeadContexto | undefined = undefined;

  constructor() {
    const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string) || '';
    console.log('[SetterService] Constructor called. API Key present:', !!apiKey);

    if (apiKey) {
      try {
        this.genAI = new GoogleGenerativeAI({ apiKey });
        this.model = this.genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          systemInstruction: SYSTEM_INSTRUCTION,
        });
        console.log('[SetterService] GoogleGenerativeAI initialized successfully');
      } catch (err) {
        console.error("[SetterService] Error initializing GoogleGenerativeAI:", err);
      }
    } else {
      console.warn("[SetterService] No API key found in VITE_GEMINI_API_KEY");
    }
  }

  private initChat(leadName: string, daysAgo: number, eventName: string, contexto?: LeadContexto) {
    console.log(`[initChat] Starting chat for ${leadName}, ${daysAgo} days ago, event: ${eventName}`);

    this.currentLeadName = leadName;
    this.currentDaysAgo = daysAgo;
    this.currentEventName = eventName;
    this.currentContexto = contexto;

    // Reinicializar el historial
    this.conversationHistory = [];

    // Agregar contexto al historial
    const contextMessage = `[Contexto del chat: El lead se llama ${leadName} (género detectado por el nombre: ${detectarGenero(leadName)}) y asistió a los directos de ${eventName}.${construirContextoTexto(contexto)} Si escribes adjetivos o participios que cambian según género (conectado/conectada, seguro/segura, etc.), usa el género detectado; si el nombre es ambiguo, usa lenguaje neutro. Si hay datos adicionales, úsalos de forma sutil y natural para personalizar la charla y sonar más creíble -nunca los recites como una ficha ni los menciones todos de golpe.]`;

    this.conversationHistory.push({
      role: 'user',
      parts: [{ text: contextMessage }],
    });

    // Respuesta inicial
    const initialText = buildInitialMessage(leadName, daysAgo, eventName);
    this.conversationHistory.push({
      role: 'model',
      parts: [{ text: initialText }],
    });

    console.log('[initChat] Chat initialized with history length:', this.conversationHistory.length);
  }

  async startConversation(
    leadName: string = 'Juan',
    daysAgo: number = 4,
    eventName: string = 'los Juegos de Invierno de Excel',
    contexto?: LeadContexto
  ): Promise<Message> {
    console.log('[startConversation] Called');
    this.initChat(leadName, daysAgo, eventName, contexto);
    const initialText = buildInitialMessage(leadName, daysAgo, eventName);

    return {
      id: Date.now().toString(),
      role: 'assistant',
      text: initialText,
      timestamp: new Date(),
    };
  }

  async sendMessage(text: string): Promise<Message> {
    console.log('[sendMessage] User message:', text);

    if (!this.model) {
      console.warn('[sendMessage] Model not initialized, attempting initialization...');

      const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string) || '';
      if (!apiKey) {
        console.error('[sendMessage] No API key available');
        return this.getFallbackResponse(text);
      }

      try {
        this.genAI = new GoogleGenerativeAI({ apiKey });
        this.model = this.genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          systemInstruction: SYSTEM_INSTRUCTION,
        });
        console.log('[sendMessage] Model initialized');
      } catch (err) {
        console.error("[sendMessage] Error initializing model:", err);
        return this.getFallbackResponse(text);
      }
    }

    const maxIntentos = 2;
    for (let intento = 1; intento <= maxIntentos; intento++) {
      try {
        console.log(`[sendMessage] API call attempt ${intento}/${maxIntentos}`);
        console.log('[sendMessage] History length before:', this.conversationHistory.length);

        // Agregar mensaje del usuario
        this.conversationHistory.push({
          role: 'user',
          parts: [{ text }],
        });

        console.log('[sendMessage] Calling generateContent with history:', this.conversationHistory.length, 'messages');

        // Llamar a la API
        const response = await this.model.generateContent({
          contents: this.conversationHistory,
        });

        console.log('[sendMessage] API response received');

        if (!response.response) {
          throw new Error('No response object from API');
        }

        const modelText = response.response.text();
        console.log('[sendMessage] Model response:', modelText.substring(0, 100) + '...');

        if (!modelText) {
          throw new Error('Empty response text from API');
        }

        // Agregar respuesta al historial
        this.conversationHistory.push({
          role: 'model',
          parts: [{ text: modelText }],
        });

        console.log('[sendMessage] Successfully processed response');
        return this.processResponse(modelText);

      } catch (error) {
        const esUltimoIntento = intento === maxIntentos;
        console.error(
          `[sendMessage] API call failed (intento ${intento}/${maxIntentos}):`,
          error
        );

        // Remover el último mensaje del usuario si falló
        if (this.conversationHistory[this.conversationHistory.length - 1]?.role === 'user') {
          this.conversationHistory.pop();
          console.log('[sendMessage] Removed last user message from history');
        }

        if (!esUltimoIntento) {
          console.log('[sendMessage] Waiting 1500ms before retry...');
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }
    }

    console.warn('[sendMessage] All API attempts failed, using fallback');
    return this.getFallbackResponse(text);
  }

  private getFallbackResponse(userInput: string): Message {
    console.log('[getFallbackResponse] Using fallback for input:', userInput.substring(0, 50) + '...');

    const lower = userInput.toLowerCase();
    let replyText = "";
    let productCard: Message['productCard'] = undefined;

    const dateMatch = userInput.match(/\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/);
    if (dateMatch) {
      const detected = findCampaignByDate(dateMatch[0]);
      if (detected) {
        replyText = `¡Exacto, ${this.currentLeadName}! Esa fecha (${dateMatch[0]}) fue justo ${detected.campaign.name}. 📅

Me quedé con las ganas de tenerte en la comunidad para aplicarlo a tu caso real. ¿Qué te impidió dar el paso final? 😊`;
        return {
          id: Date.now().toString(),
          role: 'assistant',
          text: replyText,
          timestamp: new Date(),
        };
      }
    }

    if (lower.includes("precio") || lower.includes("dinero") || lower.includes("caro") || lower.includes("presupuesto") || lower.includes("pasta") || lower.includes("pagar")) {
      replyText = `Te entiendo, ${this.currentLeadName}. Es normal dudar si el dinero no estaba en el plan. 💭

Para que eso no te frene, tengo el Intensivo Grabado: todo el contenido a tu ritmo por solo 47€. ¿Cómo lo ves?`;
      productCard = 'grabado';
    } else if (lower.includes("tiempo") || lower.includes("ocupado") || lower.includes("trabajo") || lower.includes("horario") || lower.includes("hijos") || lower.includes("familia")) {
      replyText = `Te entiendo, ${this.currentLeadName}. El 90% me dice lo mismo: sienten que no tienen horas. ⏰

Por eso diseñé el Intensivo en Directo: 6 clases de 2h en 2 semanas, todas grabadas para verlas cuando puedas, con plantillas listas para usar al día siguiente. ¿Te cuadraría algo así?`;
      productCard = 'intensivo';
    } else if (lower.includes("nivel") || lower.includes("miedo") || lower.includes("avanzado") || lower.includes("básico") || lower.includes("difícil") || lower.includes("no sé si podré")) {
      replyText = `Me alegra que me lo digas, ${this.currentLeadName}. En el Pack Élite (Excel + IA) empezamos desde cero, sin necesitar bases previas. 📊

Y tienes soporte VIP conmigo y mi equipo para tus dudas con tus propios archivos. Nunca vas solo.`;
      productCard = 'packelite';
    } else {
      replyText = `Gracias por la sinceridad, ${this.currentLeadName}. 🙏

Cuéntame qué tareas haces en tu trabajo o qué duda te quedó tras los directos, y vemos juntos cómo ayudarte. ¡Cero compromiso!`;
    }

    return {
      id: Date.now().toString(),
      role: 'assistant',
      text: replyText,
      timestamp: new Date(),
      productCard
    };
  }

  private processResponse(rawText: string): Message {
    let text = rawText;
    let productCard: Message['productCard'] = undefined;

    if (text.includes('[SHOW_CARD: packelite]')) {
      productCard = 'packelite';
      text = text.replace('[SHOW_CARD: packelite]', '').trim();
    } else if (text.includes('[SHOW_CARD: intensivo]')) {
      productCard = 'intensivo';
      text = text.replace('[SHOW_CARD: intensivo]', '').trim();
    } else if (text.includes('[SHOW_CARD: grabado]')) {
      productCard = 'grabado';
      text = text.replace('[SHOW_CARD: grabado]', '').trim();
    }

    return {
      id: Date.now().toString(),
      role: 'assistant',
      text,
      timestamp: new Date(),
      productCard
    };
  }
}

export const setterService = new SetterService();
