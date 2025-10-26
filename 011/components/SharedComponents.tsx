import React from 'react';

// Fix: Removed global JSX declaration. It's now centralized in types.ts.

interface PageHeaderProps {
    title: string;
    onBack: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, onBack }) => {
    
    const LucideIcon = ({ name, className }: { name: string, className: string }) => {
        const L = (window as any).lucide;
        if (!L || !L[name]) {
            return <div className={`${className} bg-gray-200 rounded-md animate-pulse`}></div>;
        }
        return React.createElement(L[name], { className });
    };

    return (
        <div className="flex items-center justify-between mb-8 no-print">
            <h2 className="text-3xl font-bold text-[#0A1A3D]">{title}</h2>
            <button onClick={onBack} className="btn-primary flex items-center gap-2">
                <LucideIcon name="ArrowRight" className="w-5 h-5" />
                <span>الرجوع</span>
            </button>
        </div>
    );
};

export const FullScreenLoader: React.FC<{ message?: string }> = ({ message = 'جاري التحميل...' }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-[100] no-print" aria-live="assertive" role="alert">
            <div className="w-16 h-16 border-4 border-t-4 border-gray-200 border-t-[#D4AF37] rounded-full animate-spin"></div>
            {message && <p className="text-white text-xl mt-4">{message}</p>}
        </div>
    );
};

export const Spinner: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => {
    return (
        <div className={`${className} border-2 border-t-2 border-current border-t-transparent rounded-full animate-spin`} role="status" aria-label="loading"></div>
    );
};


interface ActionButtonProps {
    icon: string;
    text: string;
    onClick: () => void;
    colorClass?: string;
    isLoading?: boolean;
    disabled?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ icon, text, onClick, colorClass = 'bg-[#D4AF37] text-[#0A1A3D] hover:bg-[#1ECBE1] hover:text-white', isLoading = false, disabled = false }) => {
    
    const LucideIcon = ({ name, className }: { name: string, className: string }) => {
        const L = (window as any).lucide;
        if (!L || !L[name]) {
            return <div className={`${className} bg-gray-200 rounded-md animate-pulse`}></div>;
        }
        return React.createElement(L[name], { className });
    };
    
    // A simple mapping from string to the expected icon component name.
    const iconName = icon.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
    
    return (
        <button onClick={onClick} className={`flex items-center justify-center gap-2 font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:-translate-y-0.5 ${colorClass} ${isLoading || disabled ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isLoading || disabled}>
            {isLoading ? <Spinner /> : <LucideIcon name={iconName} className="w-5 h-5" />}
            <span>{text}</span>
        </button>
    );
};

export const SuccessOverlay: React.FC<{ show: boolean; message?: string }> = ({ show, message = 'تم بنجاح!' }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[110] no-print animate-fadeIn">
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center transform animate-scaleIn">
                <svg className="checkmark" xmlns="http://www.w.org/2000/svg" viewBox="0 0 52 52">
                    <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
                    <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                </svg>
                <p className="text-xl font-bold text-gray-800 mt-4">{message}</p>
            </div>
        </div>
    );
};