import React, { useState, useEffect } from 'react';
import type { ActivityData } from '../types';
import { ActionButton, SuccessOverlay } from './SharedComponents';
import { useToast } from './Toast';

interface PrecinctActivitiesViewProps {
    precinctName: string;
    initialData: ActivityData[];
    onSave: (data: ActivityData[]) => void;
}

export const PrecinctActivitiesView: React.FC<PrecinctActivitiesViewProps> = ({ precinctName, initialData, onSave }) => {
    const [activities, setActivities] = useState<ActivityData[]>(initialData);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const { addToast } = useToast();
    
    useEffect(() => {
        setActivities(initialData);
    }, [initialData]);

    const handleInputChange = (index: number, field: keyof ActivityData, value: string) => {
        const newActivities = [...activities];
        (newActivities[index] as any)[field] = value;
        setActivities(newActivities);
    };

    const addActivityRow = () => {
        setActivities(prev => [
            ...prev,
            { id: `activity-${Date.now()}`, name: '', type: '', date: new Date().toISOString().split('T')[0], location: '', notes: '' }
        ]);
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            onSave(activities);
            setIsSaving(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 1500);
        }, 1000);
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-lg">
            <SuccessOverlay show={showSuccess} message={`تم حفظ النشاطات لقاطع ${precinctName} بنجاح!`} />
            <h3 className="text-2xl font-bold text-center mb-4 text-[#0A1A3D]">موقف النشاطات - {precinctName}</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border text-center">
                    <thead className="bg-[#0A1A3D] text-white">
                        <tr>
                            <th className="py-2 px-2 border-b">اسم النشاط</th>
                            <th className="py-2 px-2 border-b">نوعه</th>
                            <th className="py-2 px-2 border-b">تاريخه</th>
                            <th className="py-2 px-2 border-b">مكانه</th>
                            <th className="py-2 px-2 border-b">الملاحظات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activities.map((activity, index) => (
                             <tr key={activity.id}>
                                <td><input type="text" value={activity.name} onChange={e => handleInputChange(index, 'name', e.target.value)} className="w-full p-1 border rounded"/></td>
                                <td><input type="text" value={activity.type} onChange={e => handleInputChange(index, 'type', e.target.value)} className="w-full p-1 border rounded"/></td>
                                <td><input type="date" value={activity.date} onChange={e => handleInputChange(index, 'date', e.target.value)} className="w-full p-1 border rounded"/></td>
                                <td><input type="text" value={activity.location} onChange={e => handleInputChange(index, 'location', e.target.value)} className="w-full p-1 border rounded"/></td>
                                <td><textarea value={activity.notes} onChange={e => handleInputChange(index, 'notes', e.target.value)} className="w-full p-1 border rounded" rows={2}></textarea></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-center mt-4 no-print gap-4">
                <ActionButton icon="lucide-plus" text="إضافة نشاط جديد" onClick={addActivityRow} colorClass="bg-green-500 text-white hover:bg-green-600" />
                <ActionButton icon="lucide-save" text="حفظ النشاطات" onClick={handleSave} isLoading={isSaving} colorClass="bg-red-500 text-white hover:bg-red-600" />
            </div>
        </div>
    );
};