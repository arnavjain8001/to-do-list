import React from 'react';
import { CheckCircle2, Info, AlertCircle } from 'lucide-react';

export function ToastContainer({ toasts }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast">
          {toast.type === 'success' && <CheckCircle2 size={18} style={{ color: '#4ade80' }} />}
          {toast.type === 'info' && <Info size={18} style={{ color: '#60a5fa' }} />}
          {toast.type === 'error' && <AlertCircle size={18} style={{ color: '#f87171' }} />}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
