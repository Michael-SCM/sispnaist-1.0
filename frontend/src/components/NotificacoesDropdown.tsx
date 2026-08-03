import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import alertaService, { IAlerta, IAlertaResumo } from '../services/alertaService.js';

const NIVEL_CORES: Record<string, string> = {
  alto: 'bg-red-500',
  medio: 'bg-amber-500',
  baixo: 'bg-slate-300',
};

export const NotificacoesDropdown: React.FC = () => {
  const [resumo, setResumo] = useState<IAlertaResumo>({ totalAtivos: 0, novos: 0, alto: 0 });
  const [alertas, setAlertas] = useState<IAlerta[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const carregar = useCallback(async () => {
    try {
      const [res, lista] = await Promise.all([
        alertaService.obterResumo(),
        alertaService.listar({ status: 'ativa', limit: 8 }),
      ]);
      setResumo(res);
      setAlertas(lista.data);
    } catch {
      // ignora erros do sino
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const exibirBadge = resumo.totalAtivos > 0;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-blue-700 transition"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Notificações de alertas"
      >
        <Bell size={20} />
        {exibirBadge && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-blue-600">
            {resumo.totalAtivos > 99 ? '99+' : resumo.totalAtivos}
          </span>
        )}
      </button>
      {open && (
        <div
          className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
          role="menu"
          aria-label="Notificações"
        >
          <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-bold text-gray-800">Notificações</p>
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
              {resumo.totalAtivos} ativos
            </span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {alertas.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-gray-400">
                Nenhum alerta ativo no momento.
              </p>
            )}
            {alertas.map((alerta) => (
              <Link
                key={alerta._id}
                to="/alertas"
                onClick={() => setOpen(false)}
                className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition"
                role="menuitem"
              >
                <span className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-none ${NIVEL_CORES[alerta.nivel]}`} aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-gray-800 truncate">{alerta.titulo}</span>
                  <span className="block text-xs text-gray-500 line-clamp-2">{alerta.descricao}</span>
                  <span className="block text-[11px] text-gray-400 mt-0.5">
                    {new Date(alerta.dataAlerta).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </span>
              </Link>
            ))}
          </div>
          <div className="px-4 py-2 border-t border-gray-100">
            <Link
              to="/alertas"
              onClick={() => setOpen(false)}
              className="block text-center text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Ver todos os alertas
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificacoesDropdown;
