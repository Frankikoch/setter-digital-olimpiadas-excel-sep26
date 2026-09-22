export interface Campaign {
  startDate: string; // DD/MM/YYYY
  endDate: string;   // DD/MM/YYYY
  name: string;
  start: Date;
  end: Date;
}

function parseDMY(dateStr: string): Date {
  const parts = dateStr.trim().split(/[\/\-]/);
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  return new Date(year, month, day);
}

const RAW_CAMPAIGNS: Array<{ start: string; end: string; name: string }> = [
  { start: "14/09/2023", end: "08/10/2023", name: "OlimpiadasSep23" },
  { start: "15/01/2024", end: "08/02/2024", name: "Juegos de Invierno24" },
  { start: "18/02/2024", end: "28/02/2024", name: "Webinar Tablas Dinámicas24" },
  { start: "10/03/2024", end: "02/04/2024", name: "Desafio Dashbords24" },
  { start: "02/04/2024", end: "22/04/2024", name: "El Poder de las Tablas Dinámicas24" },
  { start: "22/04/2024", end: "01/05/2024", name: "Masterclass Chat GPT en Excel" },
  { start: "15/05/2024", end: "12/06/2024", name: "Los 4 Ases del Excel24" },
  { start: "19/06/2024", end: "19/07/2024", name: "Curso Dashboard en Excel24" },
  { start: "12/07/2024", end: "01/08/2024", name: "Webinar Mejores Trucos Julio24" },
  { start: "04/09/2024", end: "02/10/2024", name: "OlimpiadasSep24" },
  { start: "21/10/2024", end: "10/11/2024", name: "Workshop IA en Excel" },
  { start: "18/11/2024", end: "08/12/2024", name: "Green Week24" },
  { start: "20/01/2025", end: "09/02/2025", name: "Juegos de Invierno25" },
  { start: "10/02/2025", end: "10/03/2025", name: "Tablas Dinámicas25" },
  { start: "17/03/2025", end: "05/04/2025", name: "Excel+IA MAR25" },
  { start: "06/04/2025", end: "10/05/2025", name: "CURSO GRATUITO DE EXCEL ABR'25" },
  { start: "19/05/2025", end: "02/06/2025", name: "Tablas Dinámicas MAY25" },
  { start: "03/06/2025", end: "02/07/2025", name: "CURSO INTENSIVO JUL25" },
  { start: "03/07/2025", end: "15/07/2025", name: "LATAM-jul25" },
  { start: "20/07/2025", end: "10/08/2025", name: "LATAM-300725" },
  { start: "23/08/2025", end: "03/09/2025", name: "LATAM-310825" },
  { start: "08/09/2025", end: "03/10/2025", name: "OLIMPIADAS - SEP25" },
  { start: "12/10/2025", end: "29/10/2025", name: "CURSO INTENSIVO OCT25" },
  { start: "20/10/2025", end: "29/10/2025", name: "LATAM-261025" },
  { start: "03/11/2025", end: "23/11/2025", name: "GREEN WEEK NOV25" },
  { start: "11/01/2026", end: "25/01/2026", name: "JUEGOS INVIERNO EN'26" },
  { start: "15/02/2026", end: "05/03/2026", name: "TRUCOS OCULTOS FEB'26" },
  { start: "08/03/2026", end: "30/03/2026", name: "EXCEL + IA WARRIORS MAR'26" },
  { start: "31/03/2026", end: "10/05/2026", name: "ABR26" },
  { start: "11/05/2026", end: "02/06/2026", name: "EXCEL IA POWERBI - MAY´26" },
  { start: "01/09/2026", end: "10/10/2026", name: "OLIMPIADAS EXCEL - SEP26" }
];

export const CAMPAIGNS: Campaign[] = RAW_CAMPAIGNS.map(c => ({
  startDate: c.start,
  endDate: c.end,
  name: c.name,
  start: parseDMY(c.start),
  end: parseDMY(c.end)
})).sort((a, b) => b.start.getTime() - a.start.getTime()); // newest first

/**
 * Finds a campaign matching a given date.
 * If the date falls inside [startDate, endDate], it returns that campaign.
 * If not, it finds the most recent campaign whose end date was before the given date.
 */
export function findCampaignByDate(dateInput: string | Date): {
  campaign: Campaign;
  matchType: 'exact_period' | 'most_recent_before';
  daysSinceEnd: number;
} | null {
  let targetDate: Date;
  if (typeof dateInput === 'string') {
    // Check if input is DD/MM/YYYY or YYYY-MM-DD
    if (dateInput.includes('/')) {
      targetDate = parseDMY(dateInput);
    } else if (dateInput.includes('-')) {
      const [y, m, d] = dateInput.split('-').map(Number);
      targetDate = new Date(y, m - 1, d);
    } else {
      targetDate = new Date(dateInput);
    }
  } else {
    targetDate = new Date(dateInput.getTime());
  }

  if (isNaN(targetDate.getTime())) {
    return null;
  }

  // 1. Direct hit inside campaign duration
  const active = CAMPAIGNS.find(c => targetDate >= c.start && targetDate <= c.end);
  if (active) {
    const diffTime = targetDate.getTime() - active.end.getTime();
    const daysSinceEnd = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
    return {
      campaign: active,
      matchType: 'exact_period',
      daysSinceEnd
    };
  }

  // 2. Look for the campaign that ended most recently prior to this date
  const pastCampaigns = CAMPAIGNS.filter(c => c.end <= targetDate).sort((a, b) => b.end.getTime() - a.end.getTime());
  if (pastCampaigns.length > 0) {
    const mostRecent = pastCampaigns[0];
    const diffTime = targetDate.getTime() - mostRecent.end.getTime();
    const daysSinceEnd = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
    return {
      campaign: mostRecent,
      matchType: 'most_recent_before',
      daysSinceEnd
    };
  }

  // 3. If targetDate is older than all campaigns, pick the oldest campaign
  const oldest = CAMPAIGNS[CAMPAIGNS.length - 1];
  return {
    campaign: oldest,
    matchType: 'most_recent_before',
    daysSinceEnd: 4
  };
}

/**
 * Calculates days between campaign end date and a reference date (or today)
 */
export function calculateDaysSinceCampaignEnd(campaign: Campaign, referenceDate?: Date): number {
  const ref = referenceDate || new Date();
  const diffTime = ref.getTime() - campaign.end.getTime();
  const days = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 3;
}
