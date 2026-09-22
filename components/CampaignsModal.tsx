import React, { useState } from 'react';
import { Campaign, CAMPAIGNS } from '../data/campaigns';
import { Calendar, Search, Check, X } from 'lucide-react';

interface CampaignsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCampaign: (campaign: Campaign) => void;
  selectedCampaignName?: string;
}

export const CampaignsModal: React.FC<CampaignsModalProps> = ({
  isOpen,
  onClose,
  onSelectCampaign,
  selectedCampaignName,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredCampaigns = CAMPAIGNS.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.startDate.includes(searchQuery) ||
    c.endDate.includes(searchQuery)
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[88vh] flex flex-col overflow-hidden border border-gray-200">
        {/* Modal Header */}
        <div className="bg-emerald-950 text-white px-4 py-3 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-amber-400" />
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">Lanzamientos de ExcelyFinanzas</h3>
              <p className="text-[10px] text-emerald-300">Base de datos con los 31 lanzamientos (2023 - 2026)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white p-1 rounded-full text-sm font-bold transition-colors"
            title="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Filter */}
        <div className="p-3 border-b border-gray-200 bg-gray-50 flex gap-2 items-center shrink-0">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre de campaña o fecha (ej: 2025, tablas, 20/01)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>
          <span className="text-[11px] text-gray-500 font-medium whitespace-nowrap">
            {filteredCampaigns.length} de {CAMPAIGNS.length}
          </span>
        </div>

        {/* Table Content */}
        <div className="overflow-y-auto flex-1 p-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-emerald-50 text-emerald-900 border-b border-emerald-200 sticky top-0">
                <th className="py-2 px-3 font-semibold">Campaña</th>
                <th className="py-2 px-2 font-semibold">Desde</th>
                <th className="py-2 px-2 font-semibold">Hasta</th>
                <th className="py-2 px-2 font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCampaigns.map((c) => {
                const isCurrent = selectedCampaignName === c.name;
                return (
                  <tr
                    key={c.name + c.startDate}
                    className={`hover:bg-emerald-50/60 transition-colors ${
                      isCurrent ? 'bg-emerald-50/80 font-semibold' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 text-gray-800">
                      <div className="flex items-center gap-1.5">
                        {isCurrent && <Check size={13} className="text-emerald-600 shrink-0" />}
                        <span className="font-medium text-gray-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-gray-600 font-mono text-[11px]">{c.startDate}</td>
                    <td className="py-2.5 px-2 text-gray-600 font-mono text-[11px]">{c.endDate}</td>
                    <td className="py-2.5 px-2 text-right">
                      <button
                        onClick={() => {
                          onSelectCampaign(c);
                          onClose();
                        }}
                        className={`px-3 py-1 rounded text-[11px] font-medium transition-colors shadow-2xs ${
                          isCurrent
                            ? 'bg-emerald-700 text-white'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {isCurrent ? 'Seleccionada' : 'Seleccionar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-between items-center text-[11px] text-gray-500 shrink-0">
          <span>Selecciona un lanzamiento para asociar el nombre y fechas automáticamente.</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
