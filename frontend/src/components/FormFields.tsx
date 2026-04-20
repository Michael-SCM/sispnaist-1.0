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
  help?: string;
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
  help,
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
    {help && <p className="text-gray-500 text-xs mt-1">{help}</p>}
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
  help?: string;
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
  help,
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
    {help && <p className="text-gray-500 text-xs mt-1">{help}</p>}
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
  help?: string;
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
  help,
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
    {help && <p className="text-gray-500 text-xs mt-1">{help}</p>}
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
  help?: string;
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
  help,
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
    {help && <p className="text-gray-500 text-xs mt-1">{help}</p>}
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
  help?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  required,
  disabled,
  help,
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
    {help && <p className="text-gray-500 text-xs mt-1">{help}</p>}
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
  help?: string;
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
  help,
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
      {help && <p className="text-gray-500 text-xs mt-1">{help}</p>}
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
  help?: string;
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
  help,
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
      {help && <p className="text-gray-500 text-xs mt-1">{help}</p>}
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
  help?: string;
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
  help,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value);
    const syntheticEvent = {
      ...e,
      target: { ...e.target, name, value: formatted },
    };
