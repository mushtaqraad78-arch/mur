import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Toast type definition
interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

// Context type
interface ToastContextType {
  addToast: (message: string, type?: ToastMessage['type']) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Provider component
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3000); // Auto-dismiss after 3 seconds
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Custom hook to use the toast context
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Container for all toasts
const ToastContainer: React.FC<{ toasts: ToastMessage[]; removeToast: (id: number) => void }> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-8 left-8 z-[100] space-y-3">
      {toasts.map(toast => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

// Individual toast component
const Toast: React.FC<{ message: string; type: ToastMessage['type']; onClose: () => void }> = ({ message, type, onClose }) => {
    const LucideIcon = ({ name, className }: { name: string, className: string }) => {
        const L = (window as any).lucide;
        if (!L || !L[name]) return null;
        return React.createElement(L[name], { className });
    };

    const styles = {
        success: {
            bg: 'bg-green-100',
            border: 'border-green-500',
            text: 'text-green-800',
            icon: 'CheckCircle',
            iconColor: 'text-green-500'
        },
        error: {
            bg: 'bg-red-100',
            border: 'border-red-500',
            text: 'text-red-800',
            icon: 'XCircle',
            iconColor: 'text-red-500'
        },
        info: {
            bg: 'bg-blue-100',
            border: 'border-blue-500',
            text: 'text-blue-800',
            icon: 'Info',
            iconColor: 'text-blue-500'
        }
    };
    const style = styles[type];

    return (
        <div 
            role="alert"
            className={`toast-enter flex items-center p-4 rounded-lg shadow-xl border-l-4 ${style.bg} ${style.border} ${style.text}`}
            style={{ minWidth: '300px' }}
        >
            <LucideIcon name={style.icon} className={`w-6 h-6 ml-3 ${style.iconColor}`} />
            <span className="flex-grow font-semibold">{message}</span>
            <button onClick={onClose} aria-label="إغلاق" className="mr-4 text-gray-500 hover:text-gray-800">
                <LucideIcon name="X" className="w-5 h-5" />
            </button>
        </div>
    );
};