import React from 'react';
import { formatCPF, formatCNPJ, formatTelefone, formatCEP } from '../utils/masks.js';

// TextInput
interface TextInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  required,
  disabled,
}) => (
  <div className="form-group">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

// TextArea
interface TextAreaProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  required,
  disabled,
  rows = 4,
}) => (
  <div className="form-group">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

// Select
interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  error,
  required,
  disabled,
}) => (
  <div className="form-group">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

// DatePicker
interface DatePickerProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  max?: string;
  min?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  required,
  disabled,
  max,
  min,
}) => (
  <div className="form-group">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      id={name}
      name={name}
      type="date"
      value={value}
      onChange={onChange}
      disabled={disabled}
      max={max}
      min={min}
      className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

// TimePicker
interface TimePickerProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  required,
  disabled,
}) => (
  <div className="form-group">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      id={name}
      name={name}
      type="time"
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

// Checkbox
interface CheckboxProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  help?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  name,
  checked,
  onChange,
  disabled,
  help,
}) => (
  <div className="form-group flex items-start">
    <input
      id={name}
      name={name}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
    />
    <label htmlFor={name} className="ml-3 text-sm">
      <span className="font-medium text-gray-700">{label}</span>
      {help && <p className="text-gray-500 text-xs mt-1">{help}</p>}
    </label>
  </div>
);

// MultiSelect (Tags)
interface MultiSelectProps {
  label: string;
  name: string;
  values: string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  name,
  values,
  onAdd,
  onRemove,
  placeholder,
  error,
  required,
}) => {
  const [inputValue, setInputValue] = React.useState('');

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        onAdd(inputValue.trim());
        setInputValue('');
      }
    }
  };

  return (
    <div className="form-group">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className={`border rounded-md p-2 min-h-[38px] focus-within:ring-2 focus-within:ring-blue-500 ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}>
        <div className="flex flex-wrap gap-2 mb-2">
          {values.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
            >
              {value}
              <button
                type="button"
                onClick={() => onRemove(value)}
                className="font-bold hover:text-blue-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          name={name}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder || 'Digite e pressione Enter'}
          className="w-full bg-transparent outline-none text-sm"
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

// CPF Input
interface CPFInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export const CPFInput: React.FC<CPFInputProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  required,
  disabled,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    const syntheticEvent = {
      ...e,
      target: { ...e.target, name, value: formatted },
    };
    onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="form-group">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="123.456.789-00"
        disabled={disabled}
        maxLength={14}
        className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

// CNPJ Input
interface CNPJInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export const CNPJInput: React.FC<CNPJInputProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  required,
  disabled,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value);
    const syntheticEvent = {
      ...e,
      target: { ...e.target, name, value: formatted },
    };
    onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="form-group">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="12.345.678/0001-90"
        disabled={disabled}
        maxLength={18}
        className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

// Telefone Input
interface TelefoneInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export const TelefoneInput: React.FC<TelefoneInputProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  required,
  disabled,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTelefone(e.target.value);
    const syntheticEvent = {
      ...e,
      target: { ...e.target, name, value: formatted },
    };
    onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="form-group">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="(11) 99999-9999"
        disabled={disabled}
        maxLength={15}
        className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

// CEP Input
interface CEPInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCEPFound?: (data: { logradouro: string; bairro: string; cidade: string; estado: string }) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export const CEPInput: React.FC<CEPInputProps> = ({
  label,
  name,
  value,
  onChange,
  onCEPFound,
  placeholder,
  error,
  required,
  disabled,
}) => {
  const [loading, setLoading] = React.useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value);
    const syntheticEvent = {
      ...e,
      target: { ...e.target, name, value: formatted },
    };
    onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);

    // Buscar CEP quando completar 8 dígitos
    const numbers = formatted.replace(/\D/g, '');
    if (numbers.length === 8 && onCEPFound) {
      setLoading(true);
      try {
        const { buscarCEP } = await import('../utils/masks.js');
        const data = await buscarCEP(numbers);
        if (data) {
          onCEPFound(data);
        }
      } catch (err) {
        console.error('Erro ao buscar CEP:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="form-group">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="12345-678"
          disabled={disabled}
          maxLength={9}
          className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${loading ? 'pr-10' : ''}`}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

// Search Input com debounce
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounce?: number;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Buscar...',
  debounce = 500,
}) => {
  const [localValue, setLocalValue] = React.useState(value);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, debounce);

    return () => clearTimeout(timer);
  }, [localValue, debounce, onChange]);

  return (
    <div className="relative">
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>
  );
};

