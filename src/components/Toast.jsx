import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function Toast({ message, visible }) {
  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white shadow-xl shadow-blue-500/30 text-xs font-semibold animate-in slide-in-from-bottom-5 duration-200">
      <CheckCircle className="w-4 h-4 text-white" />
      <span>{message}</span>
    </div>
  );
}
