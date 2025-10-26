import React, { useState, useEffect } from 'react';
import type { RoadClosureData } from '../types';
import { ActionButton, SuccessOverlay } from './SharedComponents';
import { useToast } from './Toast';

interface PrecinctClosuresViewProps {
    precinctName: string;
    initialData: RoadClosureData[];
    onSave: (data: RoadClosureData[]) => void;
}

export const PrecinctClosuresView: React.FC<PrecinctClosuresViewProps> = ({ precinctName, initialData, onSave }) => {
    const [closures, setClosures] = useState<RoadClosureData[]>(initialData);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const { addToast } = useToast();
    
    useEffect(() => {
        setClosures(initialData);
    }, [initialData]);

    const handleInputChange = (index: number, field: keyof RoadClosureData, value: string) => {
        const newClosures = [...closures];
        (newClosures[index] as any)[field] = value;
        setClosures(newClosures);
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            onSave(closures);
            setIsSaving(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 1500);
        }, 1000);
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-lg">
            <SuccessOverlay show={showSuccess} message={`تم حفظ بيانات القطوعات لقاطع ${precinctName} بنجاح!`} />
            <h3 className="text-2xl font-bold text-center mb-4 text-[#0A1A3D]">موقف القطوعات - {precinctName}</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border text-center">
                    <thead className="bg-[#0A1A3D] text-white">
                        <tr>
                            <th className="py-2 px-2 border-b">مكان القطع (داخلي/ خارجي/ لا يوجد)</th>
                            <th className="py-2 px-2 border-b">قطع كلي او جزئي</th>
                            <th className="py-2 px-2 border-b">مدة القطع من - الى</th>
                            <th className="py-2 px-2 border-b">مسافة القطع بالكيلو او الوصف</th>
                            <th className="py-2 px-2 border-b">سبب القطع</th>
                            <th className="py-2 px-2 border-b">تحويل مسار ان وجد</th>
                        </tr>
                    </thead>
                    <tbody>
                        {closures.map((closure, index) => (
                             <tr key={closure.id}>
                                <td><input type="text" value={closure.location} onChange={e => handleInputChange(index, 'location', e.target.value)} className="w-full p-1 border rounded"/></td>
                                <td><input type="text" value={closure.type} onChange={e => handleInputChange(index, 'type', e.target.value)} className="w-full p-1 border rounded"/></td>
                                <td><input type="text" value={closure.duration} onChange={e => handleInputChange(index, 'duration', e.target.value)} className="w-full p-1 border rounded"/></td>
                                <td><input type="text" value={closure.distance} onChange={e => handleInputChange(index, 'distance', e.target.value)} className="w-full p-1 border rounded"/></td>
                                <td><textarea value={closure.reason} onChange={e => handleInputChange(index, 'reason', e.target.value)} className="w-full p-1 border rounded" rows={2}></textarea></td>
                                <td><textarea value={closure.detour} onChange={e => handleInputChange(index, 'detour', e.target.value)} className="w-full p-1 border rounded" rows={2}></textarea></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-center mt-6 no-print">
                <ActionButton icon="lucide-save" text="حفظ" onClick={handleSave} isLoading={isSaving} colorClass="bg-red-500 text-white hover:bg-red-600" />
            </div>
        </div>
    );
};