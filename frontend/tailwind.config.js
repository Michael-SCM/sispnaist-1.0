/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
      },
    },
  },
  safelist: [
    'bg-blue-600',
    'hover:bg-blue-700',
    'border-blue-600',
    'text-blue-600',
    'hover:bg-blue-50',
    'bg-green-600',
    'hover:bg-green-700',
    'border-green-600',
    'text-green-600',
    'hover:bg-green-50',
    'bg-red-600',
    'hover:bg-red-700',
    'border-red-600',
    'text-red-600',
    'hover:bg-red-50',
    'bg-purple-600',
    'hover:bg-purple-700',
    'border-purple-600',
    'text-purple-600',
    'hover:bg-purple-50',
  ],
  plugins: [],
};
