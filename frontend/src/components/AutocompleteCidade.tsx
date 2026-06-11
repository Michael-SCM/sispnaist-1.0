import React, { useState, useRef, useEffect, useCallback } from 'react';
import { municipioService, Municipio } from '../services/municipioService.js';
import { MapPin, Loader2 } from 'lucide-react';

interface AutocompleteCidadeProps {
  cidade: string;
  estado: string;
  onChange: (cidade: string, estado?: string, pais?: string) => void;
  error?: string;
}

const inputCls = "w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all";

export const AutocompleteCidade: React.FC<AutocompleteCidadeProps> = ({
  cidade, estado, onChange, error
}) => {
  const [termo, setTermo] = useState(cidade);
  const [sugestoes, setSugestoes] = useState<Municipio[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setTermo(cidade);
  }, [cidade]);

  const buscar = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSugestoes([]);
      setIsOpen(false);
      return;
    }
    setIsLoading(true);
    try {
      const results = await municipioService.buscar(q);
      setSugestoes(results);
      setIsOpen(results.length > 0);
      setHighlightIndex(-1);
    } catch {
      setSugestoes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTermo(val);
    onChange(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => buscar(val), 300);
  };

  const selecionar = (m: Municipio) => {
    setTermo(`${m.n} - ${m.u}`);
    onChange(m.n, m.u, 'Brasil');
    setIsOpen(false);
    setSugestoes([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.min(prev + 1, sugestoes.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightIndex >= 0) {
      e.preventDefault();
      selecionar(sugestoes[highlightIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <label className="block text-sm font-bold text-slate-600 mb-2">
        Cidade Natal <span className="text-red-500"> *</span>
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <MapPin size={18} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={termo}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => termo.length >= 2 && sugestoes.length > 0 && setIsOpen(true)}
          className={`${inputCls} pl-10`}
          placeholder="Digite o nome da cidade..."
          autoComplete="off"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 size={16} className="text-blue-500 animate-spin" />
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500 font-bold">{error}</p>}

      {isOpen && sugestoes.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto"
        >
          {sugestoes.map((m, i) => (
            <button
              type="button"
              key={`${m.n}-${m.u}`}
              onClick={() => selecionar(m)}
              onMouseEnter={() => setHighlightIndex(i)}
              className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors ${
                i === highlightIndex ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="font-medium">{m.n}</span>
              <span className="text-xs font-black uppercase bg-slate-100 px-2 py-0.5 rounded-lg text-slate-500">
                {m.u}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
