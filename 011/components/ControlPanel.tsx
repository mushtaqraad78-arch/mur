import React from 'react';
import { PageHeader, ActionButton } from './SharedComponents';
import type { Page, Passwords } from '../types';
import { PRECINCT_NAMES, WEIGH_STATION_NAMES, RADAR_LOCATIONS, PAGE_ACCESS_CONFIG } from '../constants';
import { useToast } from './Toast';

interface ControlPanelProps {
    navigate: (page: Page) => void;
    passwords: Passwords;
    onPasswordsChange: (passwords: Passwords) => void;
}

type PasswordSectionKey = 'precincts' | 'weighStations' | 'radars';

export const ControlPanel: React.FC<ControlPanelProps> = ({ navigate, passwords, onPasswordsChange }) => {
    const { addToast } = useToast();

    const handlePasswordChange = (section: keyof Passwords | PasswordSectionKey, name: string, value: string) => {
        onPasswordsChange({
            ...passwords,
            [section]: {
                ...passwords[section as PasswordSectionKey],
                [name]: value,
            },
        });
    };
    
    const handleMasterPasswordChange = (value: string) => {
        onPasswordsChange({ ...passwords, master: value });
    };

    const handlePagePasswordChange = (page: string, value: string) => {
         onPasswordsChange({
            ...passwords,
            pages: {
                ...passwords.pages,
                [page]: value
            }
        });
    }

    const handleSaveChanges = (sectionTitle: string) => {
        addToast(`تم حفظ كلمات المرور لقسم ${sectionTitle} بنجاح!`);
        // The state is already updated on change, so this is just for user feedback.
        // In a real app, this would be the point to send all password changes to a backend.
    };

    return (
        <div>
            <PageHeader title="لوحة التحكم" onBack={() => navigate('home')} />
            <div className="space-y-8">
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
                    <h3 className="text-2xl font-bold text-[#0A1A3D] mb-4">كلمة المرور الرئيسية</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block font-semibold mb-1 text-gray-700">كلمة مرور لوحة التحكم</label>
                            <input
                                type="password"
                                value={passwords.master}
                                onChange={(e) => handleMasterPasswordChange(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
                                placeholder="اتركها فارغة لتعطيلها"
                            />
                        </div>
                    </div>
                     <div className="mt-6 flex justify-end">
                        <ActionButton icon="lucide-save" text="حفظ كلمة المرور الرئيسية" onClick={() => handleSaveChanges('كلمة المرور الرئيسية')} colorClass="bg-red-600 text-white hover:bg-red-700"/>
                    </div>
                </div>

                <PasswordSection
                    title="كلمات مرور الوصول للصفحات"
                    items={Object.entries(PAGE_ACCESS_CONFIG).map(([key, {title}]) => ({key, title}))}
                    passwords={passwords.pages}
                    onChange={(name, value) => handlePagePasswordChange(name, value)}
                    onSave={() => handleSaveChanges('الوصول للصفحات')}
                />
                <PasswordSection
                    title="كلمات مرور القواطع"
                    items={PRECINCT_NAMES.map(name => ({key: name, title: name}))}
                    passwords={passwords.precincts}
                    onChange={(name, value) => handlePasswordChange('precincts', name, value)}
                    onSave={() => handleSaveChanges('القواطع')}
                />
                <PasswordSection
                    title="كلمات مرور محطات الوزن"
                    items={WEIGH_STATION_NAMES.map(name => ({key: name, title: name}))}
                    passwords={passwords.weighStations}
                    onChange={(name, value) => handlePasswordChange('weighStations', name, value)}
                    onSave={() => handleSaveChanges('محطات الوزن')}
                />
                <PasswordSection
                    title="كلمات مرور الرادارات"
                    items={RADAR_LOCATIONS.map(name => ({key: name, title: name}))}
                    passwords={passwords.radars}
                    onChange={(name, value) => handlePasswordChange('radars', name, value)}
                    onSave={() => handleSaveChanges('الرادارات')}
                />
            </div>
        </div>
    );
};

interface PasswordSectionProps {
    title: string;
    items: {key: string, title: string}[];
    passwords: { [key: string]: string };
    onChange: (name: string, value: string) => void;
    onSave: () => void;
}

const PasswordSection: React.FC<PasswordSectionProps> = ({ title, items, passwords, onChange, onSave }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-[#0A1A3D] mb-4">{title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map(item => (
                    <div key={item.key}>
                        <label className="block font-semibold mb-1 text-gray-700">{item.title}</label>
                        <input
                            type="password"
                            value={passwords[item.key] || ''}
                            onChange={(e) => onChange(item.key, e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            placeholder="أدخل كلمة المرور"
                        />
                    </div>
                ))}
            </div>
            <div className="mt-6 flex justify-end">
                <ActionButton icon="lucide-save" text="حفظ التغييرات" onClick={onSave} />
            </div>
        </div>
    );
};
