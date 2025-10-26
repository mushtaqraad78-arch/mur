import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { PRECINCT_NAMES, VIOLATION_NAMES, RADAR_VIOLATION_NAMES } from '../constants';
import type { Page, ViolationData, RadarViolationData, PrecinctRadarData, PrecinctAccidentData, AccidentData, PrecinctClosureData, RoadClosureData, PrecinctActivityData, ActivityData, PrecinctJudgmentData, JudgmentDecision, PrecinctViolationsData } from '../types';
import { PageHeader, ActionButton, SuccessOverlay } from './SharedComponents';
import { JudgmentDecisionsView } from './JudgmentDecisionsView';
import { PrecinctAccidentsView } from './PrecinctAccidentsView';
import { PrecinctClosuresView } from './PrecinctClosuresView';
import { PrecinctActivitiesView } from './PrecinctActivitiesView';
import { useToast } from './Toast';


interface PrecinctsViewProps {
    navigate: (page: Page) => void;
    allViolationsData: PrecinctViolationsData[];
    updateViolationsData: (precinctName: string, violations: ViolationData[]) => void;
    allRadarData: PrecinctRadarData[];
    updateRadarData: (precinctName: string, violations: RadarViolationData[]) => void;
    allAccidentData: PrecinctAccidentData[];
    updateAccidentData: (precinctName: string, accidents: AccidentData) => void;
    allClosureData: PrecinctClosureData[];
    updateClosureData: (precinctName: string, closures: RoadClosureData[]) => void;
    allActivityData: PrecinctActivityData[];
    updateActivityData: (precinctName: string, activities: ActivityData[]) => void;
    allJudgmentData: PrecinctJudgmentData[];
    updateJudgmentData: (precinctName: string, judgments: JudgmentDecision[]) => void;
    selectedPrecinct: string | null;
    onSelectPrecinct: (precinctName: string) => void;
    onClearSelectedPrecinct: () => void;
}

const initialViolationsState = VIOLATION_NAMES.map((name, index) => ({
    id: index + 1,
    name,
    morningCount: 0,
    eveningCount: 0,
    morningAmount: 0,
    eveningAmount: 0,
}));

// Fix: Explicitly defined a props interface for the `PrecinctButton` component to resolve a TypeScript error where the `key` prop was not being correctly handled for components with inline prop types within a map function.
interface PrecinctButtonProps {
    name: string;
    onClick: () => void;
}

// New component for precinct buttons with icons
// Fix: Changed component to be of type React.FC to resolve issue with `key` prop validation.
const PrecinctButton: React.FC<PrecinctButtonProps> = ({ name, onClick }) => {
    const LucideIcon = ({ name, className }: { name: string, className: string }) => {
        const L = (window as any).lucide;
        if (!L || !L[name]) {
            return <div className={`${className} bg-gray-200 rounded-md animate-pulse`}></div>;
        }
        return React.createElement(L[name], { className });
    };

    // Using ShieldCheck for a more authoritative look
    const iconName = "ShieldCheck"; 

    return (
        <button
            onClick={onClick}
            className="group bg-[#0A1A3D] p-4 rounded-xl shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 ease-in-out transform hover:-translate-y-1 flex flex-col items-center justify-center space-y-3 border border-blue-900 hover:border-[#D4AF37] hover:bg-header-gradient"
        >
            <LucideIcon
                name={iconName}
                className="w-12 h-12 text-[#D4AF37] transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:text-[#1ECBE1]"
            />
            <span className="text-lg text-center font-bold text-[#D4AF37] transition-colors duration-300 ease-in-out group-hover:text-[#1ECBE1]">
                {name}
            </span>
        </button>
    );
};

export const PrecinctsView: React.FC<PrecinctsViewProps> = ({ navigate, allViolationsData, updateViolationsData, allRadarData, updateRadarData, allAccidentData, updateAccidentData, allClosureData, updateClosureData, allActivityData, updateActivityData, allJudgmentData, updateJudgmentData, selectedPrecinct, onSelectPrecinct, onClearSelectedPrecinct }) => {

    if (selectedPrecinct) {
        return <PrecinctDetail 
            precinctName={selectedPrecinct} 
            onBack={onClearSelectedPrecinct}
            allViolationsData={allViolationsData}
            updateViolationsData={updateViolationsData}
            allRadarData={allRadarData}
            updateRadarData={updateRadarData}
            allAccidentData={allAccidentData}
            updateAccidentData={updateAccidentData}
            allClosureData={allClosureData}
            updateClosureData={updateClosureData}
            allActivityData={allActivityData}
            updateActivityData={updateActivityData}
            allJudgmentData={allJudgmentData}
            updateJudgmentData={updateJudgmentData}
        />;
    }

    return (
        <div>
            <PageHeader title="اختر قاطعاً" onBack={() => navigate('home')} />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {PRECINCT_NAMES.map(name => (
                    <PrecinctButton
                        key={name}
                        name={name}
                        onClick={() => onSelectPrecinct(name)}
                    />
                ))}
            </div>
        </div>
    );
};

interface PrecinctDetailProps {
    precinctName: string;
    onBack: () => void;
    allViolationsData: PrecinctViolationsData[];
    updateViolationsData: (precinctName: string, violations: ViolationData[]) => void;
    allRadarData: PrecinctRadarData[];
    updateRadarData: (precinctName: string, violations: RadarViolationData[]) => void;
    allAccidentData: PrecinctAccidentData[];
    updateAccidentData: (precinctName: string, accidents: AccidentData) => void;
    allClosureData: PrecinctClosureData[];
    updateClosureData: (precinctName: string, closures: RoadClosureData[]) => void;
    allActivityData: PrecinctActivityData[];
    updateActivityData: (precinctName: string, activities: ActivityData[]) => void;
    allJudgmentData: PrecinctJudgmentData[];
    updateJudgmentData: (precinctName: string, judgments: JudgmentDecision[]) => void;
}

const PrecinctDetail: React.FC<PrecinctDetailProps> = ({ precinctName, onBack, allViolationsData, updateViolationsData, allRadarData, updateRadarData, allAccidentData, updateAccidentData, allClosureData, updateClosureData, allActivityData, updateActivityData, allJudgmentData, updateJudgmentData }) => {
    const [activeView, setActiveView] = useState('violations');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const { addToast } = useToast();

    const handleSearch = () => {
        addToast(`يتم البحث عن البيانات من تاريخ ${startDate} إلى ${endDate}`, 'info');
        // In a real app, you would fetch data for the selected date range here.
    };
    
    const violationsDataForPrecinct = useMemo(() => 
        allViolationsData.find(d => d.precinctName === precinctName)?.violations || [], 
        [allViolationsData, precinctName]
    );

    const handleUpdateViolationsData = useCallback((newViolations: ViolationData[]) => {
        updateViolationsData(precinctName, newViolations);
    }, [precinctName, updateViolationsData]);

    const radarDataForPrecinct = useMemo(() => 
        allRadarData.find(d => d.precinctName === precinctName)?.violations || [], 
        [allRadarData, precinctName]
    );

    const handleUpdateRadarData = useCallback((newViolations: RadarViolationData[]) => {
        updateRadarData(precinctName, newViolations);
    }, [precinctName, updateRadarData]);

    const accidentDataForPrecinct = useMemo(() => 
        allAccidentData.find(d => d.precinctName === precinctName)?.accidents, 
        [allAccidentData, precinctName]
    );

    const handleUpdateAccidentData = useCallback((newAccidentData: AccidentData) => {
        updateAccidentData(precinctName, newAccidentData);
    }, [precinctName, updateAccidentData]);

    const closureDataForPrecinct = useMemo(() => 
        allClosureData.find(d => d.precinctName === precinctName)?.closures || [], 
        [allClosureData, precinctName]
    );

    const handleUpdateClosureData = useCallback((newClosures: RoadClosureData[]) => {
        updateClosureData(precinctName, newClosures);
    }, [precinctName, updateClosureData]);

    const activityDataForPrecinct = useMemo(() => 
        allActivityData.find(d => d.precinctName === precinctName)?.activities || [], 
        [allActivityData, precinctName]
    );
    
    const handleUpdateActivityData = useCallback((newActivities: ActivityData[]) => {
        updateActivityData(precinctName, newActivities);
    }, [precinctName, updateActivityData]);
    
    const judgmentDataForPrecinct = useMemo(() => 
        allJudgmentData.find(d => d.precinctName === precinctName)?.judgments || [], 
        [allJudgmentData, precinctName]
    );

    const handleUpdateJudgmentData = useCallback((newJudgments: JudgmentDecision[]) => {
        updateJudgmentData(precinctName, newJudgments);
    }, [precinctName, updateJudgmentData]);


    const renderActiveView = () => {
        switch (activeView) {
            case 'violations':
                return <PrecinctViolationsView precinctName={precinctName} initialViolations={violationsDataForPrecinct} onSaveData={handleUpdateViolationsData} />;
            case 'radars':
                return <PrecinctRadarView precinctName={precinctName} initialViolations={radarDataForPrecinct} onSaveData={handleUpdateRadarData} />;
            case 'accidents':
                return <PrecinctAccidentsView precinctName={precinctName} initialData={accidentDataForPrecinct} onSave={handleUpdateAccidentData} />;
            case 'closures':
                return <PrecinctClosuresView precinctName={precinctName} initialData={closureDataForPrecinct} onSave={handleUpdateClosureData} />;
            case 'activities':
                return <PrecinctActivitiesView precinctName={precinctName} initialData={activityDataForPrecinct} onSave={handleUpdateActivityData} />;
            case 'judgments':
                return <JudgmentDecisionsView contextName={`قاطع ${precinctName}`} initialDecisions={judgmentDataForPrecinct} onSaveDecisions={handleUpdateJudgmentData} />;
            default:
                return <PrecinctViolationsView precinctName={precinctName} initialViolations={violationsDataForPrecinct} onSaveData={handleUpdateViolationsData} />;
        }
    }

    return (
        <div>
            <PageHeader title={`موقف قاطع: ${precinctName}`} onBack={onBack} />

            <div className="bg-white p-4 rounded-lg shadow-md mb-6 no-print">
                <h4 className="text-xl font-bold text-[#0A1A3D] mb-3 text-center">تصفية حسب التاريخ</h4>
                <div className="flex flex-wrap items-center justify-center gap-4">
                    <div>
                        <label htmlFor="startDate" className="font-semibold ml-2">من تاريخ:</label>
                        <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-2 border rounded" />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="font-semibold ml-2">إلى تاريخ:</label>
                        <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-2 border rounded" />
                    </div>
                    <ActionButton icon="lucide-search" text="بحث" onClick={handleSearch} />
                </div>
            </div>


            <div className="mb-6 flex flex-wrap justify-center gap-2 no-print">
                <TabButton text="المخالفات" icon="lucide-landmark" isActive={activeView === 'violations'} onClick={() => setActiveView('violations')} />
                <TabButton text="الرادارات" icon="lucide-radar" isActive={activeView === 'radars'} onClick={() => setActiveView('radars')} />
                <TabButton text="الحوادث" icon="lucide-car-crash" isActive={activeView === 'accidents'} onClick={() => setActiveView('accidents')} />
                <TabButton text="القطوعات" icon="lucide-cone" isActive={activeView === 'closures'} onClick={() => setActiveView('closures')} />
                <TabButton text="النشاطات" icon="lucide-calendar-check" isActive={activeView === 'activities'} onClick={() => setActiveView('activities')} />
                <TabButton text="قرارات الحكم" icon="lucide-gavel" isActive={activeView === 'judgments'} onClick={() => setActiveView('judgments')} />
            </div>

            {renderActiveView()}
        </div>
    );
};

const TabButton = ({ text, icon, isActive, onClick }: { text: string, icon: string, isActive: boolean, onClick: () => void }) => {
    const LucideIcon = ({ name, className }: { name: string, className: string }) => {
        const L = (window as any).lucide;
        if (!L || !L[name]) {
            return <div className={`${className} bg-gray-200 rounded-md`}></div>;
        }
        return React.createElement(L[name], { className });
    };
    const iconName = icon.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');

    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:-translate-y-0.5 ${isActive ? 'bg-[#0A1A3D] text-[#D4AF37]' : 'bg-white text-[#0A1A3D]'}`}
        >
            <LucideIcon name={iconName} className="w-5 h-5" />
            <span>{text}</span>
        </button>
    );
};

const exportTableToExcel = (tableId: string, fileName: string) => {
    const table = document.getElementById(tableId);
    if (table) {
        const wb = (window as any).XLSX.utils.table_to_book(table, { sheet: "Sheet JS" });
        (window as any).XLSX.writeFile(wb, `${fileName}.xlsx`);
    } else {
        alert('لم يتم العثور على الجدول للتصدير');
    }
};

interface PrecinctViolationsViewProps {
    precinctName: string;
    initialViolations: ViolationData[];
    onSaveData: (violations: ViolationData[]) => void;
}

const PrecinctViolationsView: React.FC<PrecinctViolationsViewProps> = ({ precinctName, initialViolations, onSaveData }) => {
    const [violations, setViolations] = useState<ViolationData[]>(JSON.parse(JSON.stringify(initialViolations)));
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        setViolations(JSON.parse(JSON.stringify(initialViolations)));
    }, [initialViolations]);

    const handleInputChange = (index: number, field: keyof ViolationData, value: string) => {
        const newViolations = [...violations];
        const numValue = parseInt(value, 10);
        (newViolations[index] as any)[field] = isNaN(numValue) ? 0 : numValue;
        setViolations(newViolations);
    };

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
            onSaveData(violations);
            setIsSaving(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 1500);
        }, 1000);
    }, [precinctName, violations, onSaveData]);

    return (
        <div className="bg-white p-4 rounded-lg shadow-lg printable-content">
            <SuccessOverlay show={showSuccess} message={`تم حفظ بيانات مخالفات قاطع ${precinctName} بنجاح!`} />
            <div className="flex flex-wrap gap-2 mb-6 justify-center no-print">
                <ActionButton icon="lucide-printer" text="طباعة" onClick={() => window.print()} colorClass="bg-blue-500 text-white hover:bg-blue-600" />
                <ActionButton 
                    icon="lucide-file-spreadsheet" 
                    text="تصدير إلى Excel" 
                    onClick={() => exportTableToExcel('precinctViolationsTable', `violations_${precinctName}`)}
                    colorClass="bg-green-600 text-white hover:bg-green-700"
                />
                <ActionButton icon="lucide-pencil" text="تعديل" onClick={() => addToast('تم تفعيل وضع التعديل', 'info')} colorClass="bg-yellow-500 text-white hover:bg-yellow-600" />
                <ActionButton icon="lucide-eraser" text="تفريغ" onClick={clearForm} colorClass="bg-orange-500 text-white hover:bg-orange-600" />
                <ActionButton icon="lucide-save" text="حفظ وإرسال" onClick={saveAndSend} isLoading={isSaving} colorClass="bg-red-500 text-white hover:bg-red-600" />
            </div>
             <h3 className="text-2xl font-bold text-center mb-4 text-[#0A1A3D]">جدول المخالفات</h3>
            <div className="overflow-x-auto">
                <table id="precinctViolationsTable" className="min-w-full bg-white border border-gray-300 text-center">
                    <thead className="bg-[#0A1A3D] text-white">
                        <tr>
                            <th className="py-3 px-2 border-b">ت</th>
                            <th className="py-3 px-2 border-b min-w-[250px] text-right">اسم المخالفة</th>
                            <th className="py-3 px-2 border-b">الموقف الصباحي</th>
                            <th className="py-3 px-2 border-b">الموقف المسائي</th>
                            <th className="py-3 px-2 border-b">المجموع</th>
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
    );
};


const initialRadarViolationsState: RadarViolationData[] = RADAR_VIOLATION_NAMES.map((name, index) => ({
    id: index + 1,
    name,
    morningCount: 0,
    eveningCount: 0,
    morningAmount: 0,
    eveningAmount: 0,
}));

interface PrecinctRadarViewProps {
    precinctName: string;
    initialViolations: RadarViolationData[];
    onSaveData: (violations: RadarViolationData[]) => void;
}

const PrecinctRadarView: React.FC<PrecinctRadarViewProps> = ({ precinctName, initialViolations, onSaveData }) => {
    const [violations, setViolations] = useState<RadarViolationData[]>(JSON.parse(JSON.stringify(initialViolations)));
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const { addToast } = useToast();

    const handleInputChange = (index: number, field: keyof RadarViolationData, value: string) => {
        const newViolations = [...violations];
        const numValue = parseInt(value, 10);
        (newViolations[index] as any)[field] = isNaN(numValue) ? 0 : numValue;
        setViolations(newViolations);
    };

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
            setViolations(JSON.parse(JSON.stringify(initialRadarViolationsState)));
            addToast('تم تفريغ الحقول بنجاح', 'info');
        }
    }, [addToast]);

    const saveAndSend = useCallback(() => {
        setIsSaving(true);
        setTimeout(() => {
            onSaveData(violations);
            setIsSaving(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 1500);
        }, 1000);
    }, [precinctName, violations, onSaveData]);
    
    return (
        <div className="bg-white p-4 rounded-lg shadow-lg printable-content">
            <SuccessOverlay show={showSuccess} message={`تم حفظ بيانات رادارات قاطع ${precinctName} بنجاح!`} />
            <h3 className="text-2xl font-bold text-center mb-4 text-[#0A1A3D]">موقف الرادارات</h3>
            <div className="flex flex-wrap gap-2 mb-6 justify-center no-print">
                <ActionButton icon="lucide-printer" text="طباعة" onClick={() => window.print()} colorClass="bg-blue-500 text-white hover:bg-blue-600" />
                <ActionButton 
                    icon="lucide-file-spreadsheet" 
                    text="تصدير إلى Excel" 
                    onClick={() => exportTableToExcel('precinctRadarTable', `radar_violations_${precinctName}`)}
                    colorClass="bg-green-600 text-white hover:bg-green-700"
                />
                <ActionButton icon="lucide-pencil" text="تعديل" onClick={() => addToast('تم تفعيل وضع التعديل', 'info')} colorClass="bg-yellow-500 text-white hover:bg-yellow-600" />
                <ActionButton icon="lucide-eraser" text="تفريغ" onClick={clearForm} colorClass="bg-orange-500 text-white hover:bg-orange-600" />
                <ActionButton icon="lucide-save" text="حفظ وإرسال" onClick={saveAndSend} isLoading={isSaving} colorClass="bg-red-500 text-white hover:bg-red-600" />
            </div>
            <div className="overflow-x-auto">
                    <table id="precinctRadarTable" className="min-w-full bg-white border border-gray-300 text-center">
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
    );
};