
import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-header-gradient text-white text-center p-4 mt-8 no-print">
            <div className="container mx-auto">
                <p>&copy; {new Date().getFullYear()} مديرية مرور محافظة الانبار. جميع الحقوق محفوظة.</p>
            </div>
        </footer>
    );
};
