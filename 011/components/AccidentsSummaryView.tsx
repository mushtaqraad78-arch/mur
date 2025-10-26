import React, { useMemo, useState } from 'react';
import type { Page, AccidentData, AccidentAnalysis } from '../types';
import { PageHeader, ActionButton } from './SharedComponents';
import { useToast } from './Toast';

interface AccidentsSummaryViewProps {
    navigate: (page: Page) => void;
    data: { name: string; accidents: AccidentData }[];
}

// Helper to export to Excel
const exportAllTablesToExcel = () => {
    const tableIds = ['accidentTypesTable', 'deathsTable', 'injuriesTable', 'accidentAnalysisSummaryTable'];
    const wb = (window as any).XLSX.utils.book_new();

    tableIds.forEach(id => {
        const table = document.getElementById(id);
        if (table) {
            const ws = (window as any).XLSX.utils.table_to_sheet(table);
            // Use table caption or a default name for the sheet
            const sheetName = table.querySelector('caption')?.textContent || id;
            (window as any).XLSX.utils.book_append_sheet(wb, ws, sheetName);
        }
    });

    if (wb.SheetNames.length > 0) {
        (window as any).XLSX.writeFile(wb, 'accidents_summary_report.xlsx');
    } else {
        alert('لم يتم العثور على جداول للتصدير');
    }
};

export const AccidentsSummaryView: React.FC<AccidentsSummaryViewProps> = ({ navigate, data }) => {
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const { addToast } = useToast();


    const aggregatedTotals = useMemo(() => {
        const totals = {
            types: { pedestrian: 0, collision: 0, rollover: 0, other: 0 },
            deaths: { men: 0, women: 0, children: 0 },
            injuries: { men: 0, women: 0, children: 0 },
        };

        data.forEach(item => {
            totals.types.pedestrian += item.accidents.types.pedestrian;
            totals.types.collision += item.accidents.types.collision;
            totals.types.rollover += item.accidents.types.rollover;
            totals.types.other += item.accidents.types.other;

            totals.deaths.men += item.accidents.deaths.men;
            totals.deaths.women += item.accidents.deaths.women;
            totals.deaths.children += item.accidents.deaths.children;

            totals.injuries.men += item.accidents.injuries.men;
            totals.injuries.women += item.accidents.injuries.women;
            totals.injuries.children += item.accidents.injuries.children;
        });

        return totals;
    }, [data]);
    
    const allAnalysisData = useMemo(() => {
        return data.flatMap(item => 
            (item.accidents.analysis || []).map(analysis => ({
                ...analysis,
                precinctName: item.name
            }))
        );
    }, [data]);

    const [filteredAnalysisData, setFilteredAnalysisData] = useState(allAnalysisData);

    const handleSearch = () => {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        if (start > end) {
            addToast('تاريخ البدء يجب أن يكون قبل تاريخ الانتهاء.', 'error');
            return;
        }

        const newFilteredAnalysis = allAnalysisData.filter(analysisItem => {
            if (!analysisItem.date) return false; // Exclude items without a date
            const itemDate = new Date(analysisItem.date);
            itemDate.setHours(0, 0, 0, 0); // Normalize item date to start of day
            return itemDate >= start && itemDate <= end;
        });

        setFilteredAnalysisData(newFilteredAnalysis);
        addToast(`تم تطبيق فلتر التاريخ. تم العثور على ${newFilteredAnalysis.length} نتيجة.`, 'success');
    };

    const typeTotals = aggregatedTotals.types.pedestrian + aggregatedTotals.types.collision + aggregatedTotals.types.rollover + aggregatedTotals.types.other;
    const deathTotals = aggregatedTotals.deaths.men + aggregatedTotals.deaths.women + aggregatedTotals.deaths.children;
    const injuryTotals = aggregatedTotals.injuries.men + aggregatedTotals.injuries.women + aggregatedTotals.injuries.children;

    return (
        <div>
            <PageHeader title="ملخص الحوادث الكلي" onBack={() => navigate('home')} />

            <div className="bg-white p-4 rounded-lg shadow-lg printable-content space-y-8">
                <div className="flex flex-wrap gap-2 mb-6 justify-center no-print">
                    <ActionButton icon="lucide-printer" text="طباعة" onClick={() => window.print()} colorClass="bg-blue-500 text-white hover:bg-blue-600" />
                    <ActionButton
                        icon="lucide-file-spreadsheet"
                        text="تصدير إلى Excel"
                        onClick={exportAllTablesToExcel}
                        colorClass="bg-green-600 text-white hover:bg-green-700"
                    />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-6 no-print border border-gray-200">
                    <h4 className="text-xl font-bold text-[#0A1A3D] mb-3 text-center">تصفية حسب تاريخ الحادث</h4>
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

                <SummaryTable title="أنواع الحوادث" id="accidentTypesTable" headers={['دهس', 'اصطدام', 'انقلاب', 'اخرى', 'المجموع']}>
                    <tr>
                        <td>{aggregatedTotals.types.pedestrian}</td>
                        <td>{aggregatedTotals.types.collision}</td>
                        <td>{aggregatedTotals.types.rollover}</td>
                        <td>{aggregatedTotals.types.other}</td>
                        <td className="font-bold bg-gray-100">{typeTotals}</td>
                    </tr>
                </SummaryTable>

                <SummaryTable title="عــــــــــــــــــــــدد الوفيات" id="deathsTable" headers={['رجال', 'نساء', 'اطفال', 'المجموع']}>
                    <tr>
                        <td>{aggregatedTotals.deaths.men}</td>
                        <td>{aggregatedTotals.deaths.women}</td>
                        <td>{aggregatedTotals.deaths.children}</td>
                        <td className="font-bold bg-gray-100">{deathTotals}</td>
                    </tr>
                </SummaryTable>

                <SummaryTable title="عـــــــــــــــــــــــــدد الجرحــــــــــــــى" id="injuriesTable" headers={['رجال', 'نساء', 'اطفال', 'المجموع']}>
                    <tr>
                        <td>{aggregatedTotals.injuries.men}</td>
                        <td>{aggregatedTotals.injuries.women}</td>
                        <td>{aggregatedTotals.injuries.children}</td>
                        <td className="font-bold bg-gray-100">{injuryTotals}</td>
                    </tr>
                </SummaryTable>

                <AccidentAnalysisSummaryTable analysisData={filteredAnalysisData} />

            </div>
        </div>
    );
};

// Fix: Updated component props to use React.PropsWithChildren to correctly type components that accept children, resolving TypeScript errors about missing 'children' prop.
const SummaryTable = ({ id, title, headers, children }: React.PropsWithChildren<{ id: string, title: string, headers: string[] }>) => (
    <div>
        <h4 className="text-xl font-bold text-center mb-2 text-[#0041C2]">{title}</h4>
        <div className="overflow-x-auto">
            <table id={id} className="min-w-full bg-white border text-center">
                 <caption className="hidden">{title}</caption>
                <thead className="bg-[#0A1A3D] text-white">
                    <tr>{headers.map(h => <th key={h} className="py-2 px-2 border-b">{h}</th>)}</tr>
                </thead>
                <tbody className="[&>tr>td]:py-2 [&>tr>td]:px-2 [&>tr>td]:border-b">{children}</tbody>
            </table>
        </div>
    </div>
);

const AccidentAnalysisSummaryTable: React.FC<{ analysisData: (AccidentAnalysis & { precinctName: string })[] }> = ({ analysisData }) => {
    return (
        <div>
            <h4 className="text-xl font-bold text-center mb-2 text-[#0041C2]">تحليل الحوادث</h4>
            <div className="overflow-x-auto">
                <table id="accidentAnalysisSummaryTable" className="min-w-full bg-white border text-center">
                     <caption className="hidden">تحليل الحوادث</caption>
                    <thead className="bg-[#0A1A3D] text-white">
                        <tr>
                            <th className="py-2 px-2 border-b">ت</th>
                            <th className="py-2 px-2 border-b">اسم القاطع</th>
                            <th className="py-2 px-2 border-b">نوع الحادث</th>
                            <th className="py-2 px-2 border-b">نوع الطريق</th>
                            <th className="py-2 px-2 border-b">الوفيات</th>
                            <th className="py-2 px-2 border-b">الاصابات</th>
                            <th className="py-2 px-2 border-b">أسباب الحادث</th>
                            <th className="py-2 px-2 border-b">تاريخ الحادث</th>
                            <th className="py-2 px-2 border-b">وقت الحادث</th>
                            <th className="py-2 px-2 border-b">التحليل</th>
                            <th className="py-2 px-2 border-b">الاستنتاج</th>
                        </tr>
                    </thead>
                    <tbody>
                        {analysisData.length > 0 ? analysisData.map((item, index) => (
                            <tr key={item.id} className="odd:bg-gray-50">
                                <td className="py-2 px-2 border-b">{index + 1}</td>
                                <td className="py-2 px-2 border-b font-bold">{item.precinctName}</td>
                                <td className="py-2 px-2 border-b">{item.accidentType}</td>
                                <td className="py-2 px-2 border-b">{item.roadType}</td>
                                <td className="py-2 px-2 border-b">{item.deaths}</td>
                                <td className="py-2 px-2 border-b">{item.injuries}</td>
                                <td className="py-2 px-2 border-b">{item.causes}</td>
                                <td className="py-2 px-2 border-b">{item.date}</td>
                                <td className="py-2 px-2 border-b">{item.time}</td>
                                <td className="py-2 px-2 border-b">{item.analysis}</td>
                                <td className="py-2 px-2 border-b">{item.conclusion}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan={11} className="py-4 text-center">لا توجد بيانات تحليل للحوادث.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};