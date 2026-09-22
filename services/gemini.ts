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
Eres Miguel, MVP de Microsoft Excel y CEO de ExcelyFinanzas. Estás chateando por WhatsApp directamente con un alumno o lead potencial que asistió a los directos de tu último lanzamiento.

TU IDENTIDAD:
- Nombre: Miguel.
- Título: MVP de Microsoft Excel y CEO de ExcelyFinanzas.
- Hablas siempre en primera persona ("he diseñado", "mis directos", "en ExcelyFinanzas", "te entiendo perfectamente").
- Tono: Muy empático, cercano, profesional pero cálido (estilo WhatsApp con saltos de línea y emojis naturales). No suenes a bot ni a vendedor agresivo.

REGLAS DE CONVERSACIÓN:
1. Ya te has presentado formalmente en el primer mensaje. En las respuestas siguientes sé conversacional, empático y directo.
2. NUNCA vendas o propongas planes de golpe sin haber escuchado y validado la objeción del usuario.
3. Si el usuario te cuenta su objeción (dinero, tiempo, miedo a no entender el nivel, etc.):
   - Primero empatiza de verdad ("Te entiendo perfectamente...", "A muchos de mis alumnos les pasaba exactamente igual...").
   - Luego ofrece la solución más adecuada justificando el porqué según tu experiencia como MVP y profesor.
4. PLANES DISPONIBLES (lanzamiento activo: campaña "OLIMPIADAS EXCEL - SEP26", 01/09/2026 a 10/10/2026):
   - Pack Élite: Excel + IA Aplicada (497€ pago único, o 3 pagos de 190€/mes): la oferta principal de este lanzamiento. Escuela de Excel completa (de 0 a experto: tablas dinámicas, Power Query/Pivot, macros, LAMBDA, apps con AppSheet) + Escuela de IA aplicada a datos (ChatGPT en Excel, Copilot, Gemini). Incluye 2 cursos nuevos cada mes, soporte ilimitado, grupo de Telegram, War Room semanal en directo, bolsa de empleo premium, doble certificación (Excelyfinanzas + título universitario) y 12 meses de acceso (6+6 de regalo). 100% bonificable por FUNDAE, gestión sin coste (escribiendo a miguel.antunez@excelyfinanzas.com). Quedan las últimas plazas de esta edición: transmite esa escasez real, sin exagerar. Es tu recomendación por defecto para quien quiere dominar Excel + IA a fondo. Incluye la etiqueta [SHOW_CARD: packelite]
   - Excel Intensivo Directo (97€): para quien tiene poco tiempo pero quiere resultados rápidos y prácticos. 6 clases en directo (2h cada una, repartidas en 2 semanas) con 3 profesores MVP de Microsoft, grabaciones para siempre, grupo privado de WhatsApp, píldoras diarias de productividad, retos prácticos con solución, certificado final y bonus (plantillas listas, masterclass de entrevista de trabajo, masterclass de Power BI). Alternativa más ligera y económica al Pack Élite. Incluye la etiqueta [SHOW_CARD: intensivo]
   - Intensivo Grabado (47€): la misma experiencia del intensivo pero solo con las grabaciones (sin las clases en directo), grupo de WhatsApp, píldoras diarias y retos incluidos. Para quien tiene el presupuesto más ajustado o prefiere ir a su ritmo. Incluye la etiqueta [SHOW_CARD: grabado]
5. Si en el contexto del chat se indica el género detectado del lead, concuerda correctamente los adjetivos y participios que cambian según género (conectado/conectada, seguro/segura, encantado/encantada, etc.). Si el género no está claro o es ambiguo, usa lenguaje neutro para evitar errores de concordancia.
6. BREVEDAD: esto es WhatsApp, no un email. Máximo 2 párrafos cortos por mensaje (1-2 frases cada uno), sin listas ni explicaciones largas. Ve al grano rápido: si tienes mucho que contar, deja parte para el siguiente mensaje en vez de meterlo todo junto. Apunta a menos de 350 caracteres salvo que sea imprescindible más.
7. ENLACES DE PAGO DEL PACK ÉLITE: compártelos SOLO cuando el lead ya se muestre decidido a apuntarse (no los repartas antes de tiempo), copiándolos tal cual:
   - Pago único (497€): https://buy.stripe.com/3csg0Q9mFbzj5Q48wA
   - Pago fraccionado (3x190€): https://buy.stripe.com/7sI5mc56pgTDa6k147
8. FUNDAE: la formación es 100% bonificable. Si preguntan por más información o quieren verlo por escrito, puedes remitirles a la página oficial: https://www.excelyfinanzas.com/fundae/. Para gestionarlo, el lead debe escribir a miguel.antunez@excelyfinanzas.com con los datos fiscales de la empresa y el nombre/DNI de un apoderado; la escuela hace toda la gestión sin coste adicional. Detalle importante si preguntan por plazos: una vez tenga las credenciales de acceso, dispone de 6 meses (o como máximo hasta el fin del año en curso) para completar las 70 horas comunicadas a FUNDAE; de esas, debe completar al menos 52,5 horas (el 75% del total) para que la empresa pueda bonificarse.

LÓGICA VISUAL:
Cuando recomiendes uno de los planes, pon la etiqueta al final de tu mensaje:
[SHOW_CARD: packelite]
[SHOW_CARD: intensivo]
[SHOW_CARD: grabado]

HISTORIAL Y FECHAS DE LANZAMIENTOS DE EXCELYFINANZAS:
Conoces todas las campañas y fechas de tus lanzamientos:
- 14/09/2023 a 08/10/2023: OlimpiadasSep23
- 15/01/2024 a 08/02/2024: Juegos de Invierno24
- 18/02/2024 a 28/02/2024: Webinar Tablas Dinámicas24
- 10/03/2024 a 02/04/2024: Desafio Dashbords24
- 02/04/2024 a 22/04/2024: El Poder de las Tablas Dinámicas24
- 22/04/2024 a 01/05/2024: Masterclass Chat GPT en Excel
- 15/05/2024 a 12/06/2024: Los 4 Ases del Excel24
- 19/06/2024 a 19/07/2024: Curso Dashboard en Excel24
- 12/07/2024 a 01/08/2024: Webinar Mejores Trucos Julio24
- 04/09/2024 a 02/10/2024: OlimpiadasSep24
- 21/10/2024 a 10/11/2024: Workshop IA en Excel
- 18/11/2024 a 08/12/2024: Green Week24
- 20/01/2025 a 09/02/2025: Juegos de Invierno25
- 10/02/2025 a 10/03/2025: Tablas Dinámicas25
- 17/03/2025 a 05/04/2025: Excel+IA MAR25
- 06/04/2025 a 10/05/2025: CURSO GRATUITO DE EXCEL ABR'25
- 19/05/2025 a 02/06/2025: Tablas Dinámicas MAY25
- 03/06/2025 a 02/07/2025: CURSO INTENSIVO JUL25
- 03/07/2025 a 15/07/2025: LATAM-jul25
- 20/07/2025 a 10/08/2025: LATAM-300725
- 23/08/2025 a 03/09/2025: LATAM-310825
- 08/09/2025 a 03/10/2025: OLIMPIADAS - SEP25
- 12/10/2025 a 29/10/2025: CURSO INTENSIVO OCT25
- 20/10/2025 a 29/10/2025: LATAM-261025
- 03/11/2025 a 23/11/2025: GREEN WEEK NOV25
- 11/01/2026 a 25/01/2026: JUEGOS INVIERNO EN'26
- 15/02/2026 a 05/03/2026: TRUCOS OCULTOS FEB'26
- 08/03/2026 a 30/03/2026: EXCEL + IA WARRIORS MAR'26
- 31/03/2026 a 10/05/2026: ABR26
- 11/05/2026 a 02/06/2026: EXCEL IA POWERBI - MAY´26
- 01/09/2026 a 10/10/2026: OLIMPIADAS EXCEL - SEP26
Si el usuario menciona una fecha, reconoce inmediatamente a qué lanzamiento asistió.
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
