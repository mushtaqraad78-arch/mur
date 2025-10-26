import React from 'react';
import type { Page } from '../types';

interface HomePageProps {
    navigate: (page: Page) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
    return (
        <div className="text-center">
            <h2 className="text-3xl font-bold text-[#0A1A3D] mb-12">بوابة مرور الأنبار الرقمية</h2>
            
            <div className="space-y-12">
                {/* Section 1: Daily Operations */}
                <div>
                    <h3 className="text-2xl font-bold text-[#0A1A3D] mb-6 border-r-4 border-[#D4AF37] pr-4 text-right">العمليات اليومية</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <NavButton icon="lucide-landmark" text="مواقف القواطع" onClick={() => navigate('precincts')} />
                        <NavButton icon="lucide-scale" text="مواقف محطات الوزن" onClick={() => navigate('weigh_stations')} />
                    </div>
                </div>
                
                {/* Section 2: Reports */}
                <div>
                    <h3 className="text-2xl font-bold text-[#0A1A3D] mb-6 border-r-4 border-[#D4AF37] pr-4 text-right">التقارير والمجاميع</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <NavButton icon="lucide-bar-chart-3" text="التقارير والمجاميع" onClick={() => navigate('reports')} />
                        <NavButton icon="lucide-radar" text="مجموع الرادارات" onClick={() => navigate('radars_summary')} />
                        <NavButton icon="lucide-car-crash" text="مجموع الحوادث" onClick={() => navigate('accidents_summary')} />
                        <NavButton icon="lucide-cone" text="مجموع القطوعات" onClick={() => navigate('closures_summary')} />
                        <NavButton icon="lucide-calendar-check" text="مجموع النشاطات" onClick={() => navigate('activities_summary')} />
                        <NavButton icon="lucide-gavel" text="مجموع قرارات الحكم" onClick={() => navigate('judgments_summary')} />
                    </div>
                </div>

                {/* Section 3: Admin & Data */}
                <div>
                    <h3 className="text-2xl font-bold text-[#0A1A3D] mb-6 border-r-4 border-[#D4AF37] pr-4 text-right">الإدارة والبيانات</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <NavButton icon="lucide-file-text" text="بيانات السيارات والإجازات" onClick={() => navigate('cars_and_licenses')} />
                        <NavButton icon="lucide-settings" text="لوحة التحكم" onClick={() => navigate('control_panel')} />
                    </div>
                </div>
            </div>
        </div>
    );
};

interface NavButtonProps {
    icon: string;
    text: string;
    onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, text, onClick }) => {
    const LucideIcon = ({ name, className }: { name: string, className: string }) => {
        const L = (window as any).lucide;
        if (!L || !L[name]) {
            // Provide a fallback placeholder if icons are loading
            return <div className={`${className} bg-gray-200 rounded-md animate-pulse`}></div>;
        }
        return React.createElement(L[name], { className });
    };

    // Maps the icon prop string (e.g., 'lucide-landmark') to the correct component name (e.g., 'Landmark')
    const iconName = icon.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');

    return (
        <button 
            onClick={onClick} 
            className="group bg-[#0A1A3D] p-6 rounded-xl shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 ease-in-out transform hover:-translate-y-1 flex flex-col items-center justify-center space-y-3 border border-blue-900 hover:border-[#D4AF37] hover:bg-header-gradient"
        >
            <LucideIcon 
                name={iconName} 
                className="w-14 h-14 text-[#D4AF37] transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:text-white" 
            />
            <span className="text-xl text-center font-bold text-[#D4AF37] transition-colors duration-300 ease-in-out group-hover:text-white">
                {text}
            </span>
        </button>
    );
};