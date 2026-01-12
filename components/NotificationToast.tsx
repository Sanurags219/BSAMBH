
import React, { useEffect } from 'react';
import { X, CheckCircle2, Info, AlertCircle, Zap, Waves, Rocket } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationToastProps {
  notification: AppNotification;
  onClose: (id: string) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(notification.id);
    }, 6000);
    return () => clearTimeout(timer);
  }, [notification.id, onClose]);

  const icons = {
    success: <CheckCircle2 className="text-green-400" size={20} />,
    info: <Info className="text-blue-400" size={20} />,
    error: <AlertCircle className="text-red-400" size={20} />
  };

  return (
    <div className="group relative w-85 sm:w-96 glass-card rounded-2xl border border-white/10 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.4)] animate-in slide-in-from-right-12 fade-in duration-500 overflow-hidden pointer-events-auto cursor-pointer select-none">
      {/* Dynamic Background Pulse for success */}
      {notification.type === 'success' && (
        <div className="absolute inset-0 bg-green-500/5 animate-pulse pointer-events-none" />
      )}
      
      <div className="flex items-start gap-4 relative z-10">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
          notification.type === 'success' ? 'bg-green-500/10 text-green-400' : 
          notification.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
        }`}>
          {notification.icon || icons[notification.type]}
        </div>
        
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Bsambh Alert</span>
            <div className="w-1 h-1 rounded-full bg-zinc-700" />
            <span className="text-[9px] font-bold text-zinc-600">now</span>
          </div>
          <h4 className="text-xs font-black uppercase tracking-tight text-white mb-1 leading-tight">
            {notification.title}
          </h4>
          <p className="text-[11px] font-medium text-zinc-400 leading-snug">
            {notification.message}
          </p>
        </div>
        
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(notification.id); }}
          className="absolute top-4 right-4 text-zinc-600 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-[2px] bg-blue-600/40 w-full">
        <div 
          className="h-full bg-blue-600 transition-all duration-[6000ms] ease-linear"
          style={{ width: '0%', animation: 'progress 6s linear forwards' }}
        />
      </div>

      <style>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default NotificationToast;
