
export type MessageRole = 'assistant' | 'user' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: Date;
  imageUrl?: string;
  productCard?: 'packelite' | 'intensivo' | 'grabado';
}

// Datos adicionales opcionales del lead (encuesta de calificacion y/o ficha
// de empresa del Dashboard de Leads Calificados). Todo opcional: cuando el
// setter se usa solo (sin el dashboard) esto simplemente no llega nunca.
export interface LeadContexto {
  area?: string;               // Área profesional
  situacionLaboral?: string;   // Situación laboral
  nivelExcel?: string;         // Nivel de Excel autodeclarado
  situacionDatos?: string;     // Situación con los datos (encuesta)
  inversionFormacion?: string; // Inversión en formación (encuesta)
  antiguedad?: string;         // Antigüedad / experiencia
  comentario?: string;         // Comentario adicional que dejó en la encuesta
  empresaSector?: string;
  empresaActividad?: string;
  empresaUbicacion?: string;
  empresaNotas?: string;
}

export interface LeadInfo {
  name: string;
  lastEvent: string;
  daysSinceEvent?: number;
  status: 'pending' | 'engaging' | 'converted' | 'lost';
  contexto?: LeadContexto;
}

export enum ObjectionType {
  ECONOMIC = 'ECONOMIC',
  TIME = 'TIME',
  OTHER = 'OTHER',
  NONE = 'NONE'
}
