import React, { useState, useMemo, useCallback } from 'react';
import { RADAR_LOCATIONS, RADAR_VIOLATION_NAMES } from '../constants';
// Fix: Add JudgmentDecision and RadarJudgmentData to type imports
import type { Page, RadarViolationData, JudgmentDecision, RadarJudgmentData } from '../types';
import { PageHeader, ActionButton, SuccessOverlay } from './SharedComponents';
import { JudgmentDecisionsView } from './JudgmentDecisionsView';
import { useToast } from './Toast';

// Fix: Update RadarsViewProps to accept judgment data and handlers
interface RadarsViewProps {
    navigate: (page: Page) => void;
    allJudgmentData: RadarJudgmentData[];
    updateJudgmentData: (radarName: string, judgments: JudgmentDecision[]) => void;
    selectedRadar: string | null;
    onSelectRadar: (radarName: string) => void;
    onClearSelectedRadar: () => void;
}

const initialViolationsState: RadarViolationData[] = RADAR_VIOLATION_NAMES.map((name, index) => ({
    id: index + 1,
    name,
    morningCount: 0,
    eveningCount: 0,
    morningAmount: 0,
    eveningAmount: 0,
}));

export const RadarsView: React.FC<RadarsViewProps> = ({ navigate, allJudgmentData, updateJudgmentData, selectedRadar, onSelectRadar, onClearSelectedRadar }) => {

    if (selectedRadar) {
        // Fix: Find and pass judgment data to the RadarDetail component
        const judgmentData = allJudgmentData.find(r => r.radarName === selectedRadar);
        return <RadarDetail 
            radarName={selectedRadar} 
            onBack={onClearSelectedRadar} 
            initialJudgments={judgmentData?.judgments || []}
            updateJudgmentData={updateJudgmentData}
        />;
    }

    return (
        <div>
            <PageHeader title="اختر موقع رادار" onBack={() => navigate('home')} />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {RADAR_LOCATIONS.map(name => (
                    <button
                        key={name}
                        onClick={() => onSelectRadar(name)}
                        className="btn-primary text-lg"
                    >
                        {name}
                    </button>
                ))}
            </div>
        </div>
    );
};

// Fix: Update RadarDetailProps to accept judgment data and handlers
interface RadarDetailProps {
    radarName: string;
    onBack: () => void;
    initialJudgments: JudgmentDecision[];
    updateJudgmentData: (radarName: string, judgments: JudgmentDecision[]) => void;
}

const exportTableToExcel = (tableId: string, fileName: string) => {
    const table = document.getElementById(tableId);
    if (table) {
        const wb = (window as any).XLSX.utils.table_to_book(table, { sheet: "Sheet JS" });
        (window as any).XLSX.writeFile(wb, `${fileName}.xlsx`);
    } else {
        alert('لم يتم العثور على الجدول للتصدير');
    }
};

const RadarDetail: React.FC<RadarDetailProps> = ({ radarName, onBack, initialJudgments, updateJudgmentData }) => {
    const [violations, setViolations] = useState<RadarViolationData[]>(JSON.parse(JSON.stringify(initialViolationsState)));
    const [showJudgments, setShowJudgments] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const { addToast } = useToast();

    const handleInputChange = (index: number, field: keyof RadarViolationData, value: string) => {
        const newViolations = [...violations];
        const numValue = parseInt(value, 10);
        (newViolations[index] as any)[field] = isNaN(numValue) ? 0 : numValue;
        setViolations(newViolations);
    };

    // Fix: Add callback to handle saving updated judgments
    const handleUpdateJudgments = useCallback((newJudgments: JudgmentDecision[]) => {
        updateJudgmentData(radarName, newJudgments);
    }, [radarName, updateJudgmentData]);

    const totals = useMemo(() => {
        return violations.reduce((acc, v) => {
            acc.morningCount += v.morningCount;
            acc.eveningCount += v.eveningCount;
            acc.totalCount += v.morningCount + v.eveningCount;
            acc.morningAmount += v.morningAmount;
            acc.eveningAmount += v.eveningAmount;
            acc.totalAmount += v.morningAmount + v.eveningAmount;
            return acc;
        }, { morningCount: 0, eveningCount: 0, totalCount: 0, morningAmount: 0, eveningAmount: 0, totalAmount: 0 });
    }, [violations]);

    const clearForm = useCallback(() => {
        if (window.confirm("هل أنت متأكد من رغبتك في تفريغ جميع الحقول؟")) {
            setViolations(JSON.parse(JSON.stringify(initialViolationsState)));
            addToast('تم تفريغ الحقول بنجاح', 'info');
        }
    }, [addToast]);

    const saveAndSend = useCallback(() => {
        setIsSaving(true);
        setTimeout(() => {
            // Note: In a real app, this would save the `violations` state.
            // For now, it just shows the success animation.
            setIsSaving(false);
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                clearForm();
            }, 1500);
        }, 1000);
    }, [radarName, clearForm]);

    return (
        <div>
            <SuccessOverlay show={showSuccess} message={`تم حفظ بيانات رادار ${radarName} بنجاح!`} />
            <PageHeader title={`موقف رادار: ${radarName}`} onBack={onBack} />
            
            <div className="bg-white p-4 rounded-lg shadow-lg printable-content">
                <div className="flex flex-wrap gap-2 mb-6 justify-center no-print">
                   <ActionButton icon="lucide-printer" text="طباعة" onClick={() => window.print()} colorClass="bg-blue-500 text-white hover:bg-blue-600" />
                   <ActionButton 
                        icon="lucide-file-spreadsheet" 
                        text="تصدير إلى Excel" 
                        onClick={() => exportTableToExcel('radarDetailTable', `radar_${radarName}`)}
                        colorClass="bg-green-600 text-white hover:bg-green-700"
                    />
                    <ActionButton icon="lucide-pencil" text="تعديل" onClick={() => addToast('تم تفعيل وضع التعديل', 'info')} colorClass="bg-yellow-500 text-white hover:bg-yellow-600" />
                    <ActionButton icon="lucide-gavel" text="إرفاق صور قرارات الحكم" onClick={() => setShowJudgments(!showJudgments)} colorClass="bg-indigo-500 text-white hover:bg-indigo-600" />
                    <ActionButton icon="lucide-eraser" text="تفريغ" onClick={clearForm} colorClass="bg-orange-500 text-white hover:bg-orange-600" />
                    <ActionButton icon="lucide-save" text="حفظ وإرسال" onClick={saveAndSend} isLoading={isSaving} colorClass="bg-red-500 text-white hover:bg-red-600" />
                </div>

                <div className="overflow-x-auto">
                    <table id="radarDetailTable" className="min-w-full bg-white border border-gray-300 text-center">
                        <thead className="bg-[#0A1A3D] text-white">
                            <tr>
                                <th className="py-3 px-2 border-b">ت</th>
                                <th className="py-3 px-2 border-b min-w-[250px] text-right">اسم المخالفة</th>
                                <th className="py-3 px-2 border-b">الصباحي</th>
                                <th className="py-3 px-2 border-b">المسائي</th>
                                <th className="py-3 px-2 border-b">الكلي</th>
                                <th className="py-3 px-2 border-b">مبلغ الصباحي</th>
                                <th className="py-3 px-2 border-b">مبلغ المسائي</th>
                                <th className="py-3 px-2 border-b">مجموع المبالغ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {violations.map((v, index) => {
                                const totalCount = v.morningCount + v.eveningCount;
                                const totalAmount = v.morningAmount + v.eveningAmount;
                                return (
                                    <tr key={v.id} className="odd:bg-gray-50">
                                        <td className="py-2 px-2 border-b">{v.id}</td>
                                        <td className="py-2 px-2 border-b text-right">{v.name}</td>
                                        <td className="py-2 px-2 border-b"><input type="number" value={v.morningCount} onChange={e => handleInputChange(index, 'morningCount', e.target.value)} className="w-20 text-center p-1 border rounded"/></td>
                                        <td className="py-2 px-2 border-b"><input type="number" value={v.eveningCount} onChange={e => handleInputChange(index, 'eveningCount', e.target.value)} className="w-20 text-center p-1 border rounded"/></td>
                                        <td className="py-2 px-2 border-b font-bold bg-gray-100">{totalCount}</td>
                                        <td className="py-2 px-2 border-b"><input type="number" value={v.morningAmount} onChange={e => handleInputChange(index, 'morningAmount', e.target.value)} className="w-24 text-center p-1 border rounded"/></td>
                                        <td className="py-2 px-2 border-b"><input type="number" value={v.eveningAmount} onChange={e => handleInputChange(index, 'eveningAmount', e.target.value)} className="w-24 text-center p-1 border rounded"/></td>
                                        <td className="py-2 px-2 border-b font-bold bg-gray-100">{totalAmount.toLocaleString()}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="bg-[#0A1A3D] text-white font-bold text-lg">
                            <tr>
                                <td colSpan={2} className="py-3 px-2">المجموع الكلي</td>
                                <td className="py-3 px-2">{totals.morningCount}</td>
                                <td className="py-3 px-2">{totals.eveningCount}</td>
                                <td className="py-3 px-2">{totals.totalCount}</td>
                                <td className="py-3 px-2">{totals.morningAmount.toLocaleString()}</td>
                                <td className="py-3 px-2">{totals.eveningAmount.toLocaleString()}</td>
                                <td className="py-3 px-2">{totals.totalAmount.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            {/* Fix: Pass required props to JudgmentDecisionsView */}
            {showJudgments && <div className="mt-8"><JudgmentDecisionsView 
                contextName={`رادار ${radarName}`} 
                initialDecisions={initialJudgments}
                onSaveDecisions={handleUpdateJudgments}
            /></div>}
        </div>
    );
};