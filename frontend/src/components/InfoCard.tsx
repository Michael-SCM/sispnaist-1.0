import React from 'react';

interface InfoCardProps {
  label: string;
  value?: string | number | null;
  icon: React.ComponentType<{ size?: number }>;
  color: string;
}

export const InfoCard: React.FC<InfoCardProps> = React.memo(({ label, value, icon: Icon, color }) => (
    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100/50" role="region" aria-label={`${label}: ${value ?? '-'}`}>
    <div className={`p-2 ${color} bg-white rounded-xl shadow-sm`} aria-hidden="true">
      <Icon size={18} />
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-sm font-bold text-slate-700">{value ?? '-'}</p>
    </div>
  </div>
));
