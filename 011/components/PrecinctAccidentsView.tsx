import React, { useState } from 'react';
import type { AccidentData, AccidentCounts, AccidentAnalysis } from '../types';
import { ActionButton, SuccessOverlay } from './SharedComponents';
import { useToast } from './Toast';

interface PrecinctAccidentsViewProps {
    precinctName: string;
    initialData?: AccidentData;
    onSave: (data: AccidentData) => void;
}

const initialAccidentState: AccidentData = {
    id: '',
    types: { pedestrian: 0, collision: 0, rollover: 0, other: 0 },
    deaths: { men: 0, women: 0, children: 0 },
    injuries: { men: 0, women: 0, children: 0 },
    analysis: []
};

export const PrecinctAccidentsView: React.FC<PrecinctAccidentsViewProps> = ({ precinctName, initialData, onSave }) => {
    const [data, setData] = useState<AccidentData>(JSON.parse(JSON.stringify(initialData || initialAccidentState)));
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const { addToast } = useToast();

    const handleTypeChange = (type: keyof typeof data.types, value: string) => {
        setData(prev => ({
            ...prev,
            types: { ...prev.types, [type]: parseInt(value) || 0 }
        }));
    };
    
    const handleCountChange = (category: 'deaths' | 'injuries', group: keyof AccidentCounts, value: string) => {
         setData(prev => ({
            ...prev,
            [category]: { ...prev[category], [group]: parseInt(value) || 0 }
        }));
    };

    const handleAnalysisChange = (index: number, field: keyof Omit<AccidentAnalysis, 'id'>, value: string | number) => {
        setData(prev => {
            const newAnalysis = [...prev.analysis];
            if (typeof value === 'string' && (field === 'deaths' || field === 'injuries')) {
                value = parseInt(value) || 0;
            }
            (newAnalysis[index] as any)[field] = value;
            return { ...prev, analysis: newAnalysis };
        });
    };

    const addAnalysisRow = () => {
        setData(prev => ({
            ...prev,
            analysis: [
                ...prev.analysis,
                { id: `analysis-${Date.now()}`, accidentType: '', roadType: '', deaths: 0, injuries: 0, causes: '', time: '', date: new Date().toISOString().split('T')[0], analysis: '', conclusion: '' }
            ]
        }));
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            onSave(data);
            setIsSaving(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 1500);
        }, 1000);
    };

    const typeTotals = data.types.pedestrian + data.types.collision + data.types.rollover + data.types.other;
    const deathTotals = data.deaths.men + data.deaths.women + data.deaths.children;
    const injuryTotals = data.injuries.men + data.injuries.women + data.injuries.children;

    return (
        <div className="bg-white p-4 rounded-lg shadow-lg space-y-8">
            <SuccessOverlay show={showSuccess} message={`تم حفظ بيانات حوادث قاطع ${precinctName} بنجاح!`} />
            <h3 className="text-2xl font-bold text-center mb-4 text-[#0A1A3D]">موقف الحوادث المرورية - {precinctName}</h3>

            <AccidentTable title="أنواع الحوادث" headers={['دهس', 'اصطدام', 'انقلاب', 'اخرى', 'المجموع']}>
                <tr>
                    <td><input type="number" value={data.types.pedestrian} onChange={e => handleTypeChange('pedestrian', e.target.value)} className="w-full text-center p-1 border rounded" /></td>
                    <td><input type="number" value={data.types.collision} onChange={e => handleTypeChange('collision', e.target.value)} className="w-full text-center p-1 border rounded" /></td>
                    <td><input type="number" value={data.types.rollover} onChange={e => handleTypeChange('rollover', e.target.value)} className="w-full text-center p-1 border rounded" /></td>
                    <td><input type="number" value={data.types.other} onChange={e => handleTypeChange('other', e.target.value)} className="w-full text-center p-1 border rounded" /></td>
                    <td className="font-bold bg-gray-100">{typeTotals}</td>
                </tr>
            </AccidentTable>

            <AccidentTable title="عــــــــــــــــــــــدد الوفيات" headers={['رجال', 'نساء', 'اطفال', 'المجموع']}>
                <tr>
                    <td><input type="number" value={data.deaths.men} onChange={e => handleCountChange('deaths', 'men', e.target.value)} className="w-full text-center p-1 border rounded" /></td>
                    <td><input type="number" value={data.deaths.women} onChange={e => handleCountChange('deaths', 'women', e.target.value)} className="w-full text-center p-1 border rounded" /></td>
                    <td><input type="number" value={data.deaths.children} onChange={e => handleCountChange('deaths', 'children', e.target.value)} className="w-full text-center p-1 border rounded" /></td>
                    <td className="font-bold bg-gray-100">{deathTotals}</td>
                </tr>
            </AccidentTable>

            <AccidentTable title="عـــــــــــــــــــــــــدد الجرحــــــــــــــى" headers={['رجال', 'نساء', 'اطفال', 'المجموع']}>
                <tr>
                     <td><input type="number" value={data.injuries.men} onChange={e => handleCountChange('injuries', 'men', e.target.value)} className="w-full text-center p-1 border rounded" /></td>
                    <td><input type="number" value={data.injuries.women} onChange={e => handleCountChange('injuries', 'women', e.target.value)} className="w-full text-center p-1 border rounded" /></td>
                    <td><input type="number" value={data.injuries.children} onChange={e => handleCountChange('injuries', 'children', e.target.value)} className="w-full text-center p-1 border rounded" /></td>
                    <td className="font-bold bg-gray-100">{injuryTotals}</td>
                </tr>
            </AccidentTable>

             <AccidentTable title="تحليل الحوادث" headers={['ت', 'نوع الحادث', 'نوع الطريق', 'الوفيات', 'الاصابات', 'أسباب الحادث', 'تاريخ الحادث', 'وقت الحادث', 'التحليل', 'الاستنتاج']}>
                 {data.analysis.map((analysisItem, index) => (
                    <tr key={analysisItem.id}>
                        <td>{index + 1}</td>
                        <td><input type="text" value={analysisItem.accidentType} onChange={e => handleAnalysisChange(index, 'accidentType', e.target.value)} className="w-full p-1 border rounded"/></td>
                        <td><input type="text" value={analysisItem.roadType} onChange={e => handleAnalysisChange(index, 'roadType', e.target.value)} className="w-full p-1 border rounded"/></td>
                        <td><input type="number" value={analysisItem.deaths} onChange={e => handleAnalysisChange(index, 'deaths', e.target.value)} className="w-full p-1 border rounded"/></td>
                        <td><input type="number" value={analysisItem.injuries} onChange={e => handleAnalysisChange(index, 'injuries', e.target.value)} className="w-full p-1 border rounded"/></td>
                        <td><textarea value={analysisItem.causes} onChange={e => handleAnalysisChange(index, 'causes', e.target.value)} className="w-full p-1 border rounded" rows={2}></textarea></td>
                        <td><input type="date" value={analysisItem.date} onChange={e => handleAnalysisChange(index, 'date', e.target.value)} className="w-full p-1 border rounded"/></td>
                        <td><input type="time" value={analysisItem.time} onChange={e => handleAnalysisChange(index, 'time', e.target.value)} className="w-full p-1 border rounded"/></td>
                        <td><textarea value={analysisItem.analysis} onChange={e => handleAnalysisChange(index, 'analysis', e.target.value)} className="w-full p-1 border rounded" rows={2}></textarea></td>
                        <td><textarea value={analysisItem.conclusion} onChange={e => handleAnalysisChange(index, 'conclusion', e.target.value)} className="w-full p-1 border rounded" rows={2}></textarea></td>
                    </tr>
                ))}
                {data.analysis.length === 0 && (
                    <tr><td colSpan={10} className="text-center py-4">لا يوجد بيانات تحليل. انقر على 'إضافة تحليل حادث' للبدء.</td></tr>
                )}
             </AccidentTable>
             <div className="flex justify-center -mt-4 no-print">
                <ActionButton icon="lucide-plus" text="إضافة تحليل حادث" onClick={addAnalysisRow} colorClass="bg-blue-500 text-white hover:bg-blue-600" />
            </div>
            <div className="flex justify-center mt-6 no-print">
                <ActionButton icon="lucide-save" text="حفظ" onClick={handleSave} isLoading={isSaving} colorClass="bg-red-500 text-white hover:bg-red-600" />
            </div>
        </div>
    );
};

// Fix: Updated component props to use React.PropsWithChildren to correctly type components that accept children, resolving TypeScript errors about missing 'children' prop.
const AccidentTable = ({ title, headers, children }: React.PropsWithChildren<{ title: string, headers: string[] }>) => (
    <div>
        <h4 className="text-xl font-bold text-center mb-2 text-[#0041C2]">{title}</h4>
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border text-center">
                <thead className="bg-[#0A1A3D] text-white">
                    <tr>{headers.map(h => <th key={h} className="py-2 px-2 border-b">{h}</th>)}</tr>
                </thead>
                <tbody>{children}</tbody>
            </table>
        </div>
    </div>
);