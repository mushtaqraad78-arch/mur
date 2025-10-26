import React, { useState } from 'react';

interface PasswordModalProps {
    title: string;
    onSuccess: (password: string) => void;
    onCancel: () => void;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({ title, onSuccess, onCancel }) => {
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSuccess(password);
    };

    const LucideIcon = ({ name, className }: { name: string, className: string }) => {
        const L = (window as any).lucide;
        if (!L || !L[name]) {
            return <div className={`${className} bg-gray-200 rounded-md animate-pulse`}></div>;
        }
        return React.createElement(L[name], { className });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 no-print">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md mx-4">
                <h3 className="text-2xl font-bold text-center mb-6 text-[#0A1A3D]">{title}</h3>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="password-input" className="block font-semibold mb-2 text-gray-700">
                        الرجاء إدخال كلمة المرور
                    </label>
                    <input
                        id="password-input"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 mb-6"
                        autoFocus
                    />
                    <div className="flex justify-center gap-4">
                        <button type="submit" className="btn-primary flex items-center gap-2 bg-green-600 text-white hover:bg-green-700">
                            <LucideIcon name="ArrowRight" className="w-5 h-5" />
                            <span>دخول</span>
                        </button>
                        <button type="button" onClick={onCancel} className="btn-secondary">
                            إلغاء
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
