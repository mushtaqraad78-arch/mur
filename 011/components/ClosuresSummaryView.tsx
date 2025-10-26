import React from 'react';
import type { Page, RoadClosureData } from '../types';
import { PageHeader, ActionButton } from './SharedComponents';

// Helper to export to Excel
const exportTableToExcel = (tableId: string, fileName:string) => {
    const table = document.getElementById(tableId);
    if(table){
        const wb = (window as any).XLSX.utils.table_to_book(table, {sheet: "Sheet JS"});
        (window as any).XLSX.writeFile(wb, `${fileName}.xlsx`);
    } else {
        alert('Table not found');
    }
};

interface ClosuresSummaryViewProps {
    navigate: (page: Page) => void;
    data: (RoadClosureData & { precinctName: string })[];
}

export const ClosuresSummaryView: React.FC<ClosuresSummaryViewProps> = ({ navigate, data }) => {
    return (
        <div>
            <PageHeader title="مجموع القطوعات الكلي" onBack={() => navigate('home')} />
            <div className="bg-white p-4 rounded-lg shadow-lg printable-content">
                <div className="flex flex-wrap gap-2 mb-6 justify-center no-print">
                    <ActionButton icon="lucide-printer" text="طباعة" onClick={() => window.print()} colorClass="bg-blue-500 text-white hover:bg-blue-600" />
                    <ActionButton
                        icon="lucide-file-spreadsheet"
                        text="تصدير إلى Excel"
                        onClick={() => exportTableToExcel('closuresSummaryTable', 'closures_summary_report')}
                        colorClass="bg-green-600 text-white hover:bg-green-700"
                    />
                </div>
                <h3 className="text-2xl font-bold text-center mb-4 text-[#0A1A3D]">جدول مجموع القطوعات</h3>
                <div className="overflow-x-auto">
                    <table id="closuresSummaryTable" className="min-w-full bg-white border text-center">
                        <thead className="bg-[#0A1A3D] text-white">
                            <tr>
                                <th className="py-2 px-2 border-b">اسم القاطع</th>
                                <th className="py-2 px-2 border-b">مكان القطع</th>
                                <th className="py-2 px-2 border-b">قطع كلي/جزئي</th>
                                <th className="py-2 px-2 border-b">مدة القطع</th>
                                <th className="py-2 px-2 border-b">مسافة القطع</th>
                                <th className="py-2 px-2 border-b">سبب القطع</th>
                                <th className="py-2 px-2 border-b">تحويل المسار</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length > 0 ? data.map(c => (
                                <tr key={c.id} className="odd:bg-gray-50">
                                    <td className="py-2 px-2 border-b font-bold">{c.precinctName}</td>
                                    <td className="py-2 px-2 border-b">{c.location}</td>
                                    <td className="py-2 px-2 border-b">{c.type}</td>
                                    <td className="py-2 px-2 border-b">{c.duration}</td>
                                    <td className="py-2 px-2 border-b">{c.distance}</td>
                                    <td className="py-2 px-2 border-b">{c.reason}</td>
                                    <td className="py-2 px-2 border-b">{c.detour}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={7} className="py-4">لا توجد قطوعات حالياً.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};