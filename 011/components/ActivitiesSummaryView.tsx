import React from 'react';
import type { Page, ActivityData } from '../types';
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

interface ActivitiesSummaryViewProps {
    navigate: (page: Page) => void;
    data: (ActivityData & { precinctName: string })[];
}

export const ActivitiesSummaryView: React.FC<ActivitiesSummaryViewProps> = ({ navigate, data }) => {
    return (
        <div>
            <PageHeader title="مجموع النشاطات الكلي" onBack={() => navigate('home')} />
            <div className="bg-white p-4 rounded-lg shadow-lg printable-content">
                <div className="flex flex-wrap gap-2 mb-6 justify-center no-print">
                    <ActionButton icon="lucide-printer" text="طباعة" onClick={() => window.print()} colorClass="bg-blue-500 text-white hover:bg-blue-600" />
                    <ActionButton
                        icon="lucide-file-spreadsheet"
                        text="تصدير إلى Excel"
                        onClick={() => exportTableToExcel('activitiesSummaryTable', 'activities_summary_report')}
                        colorClass="bg-green-600 text-white hover:bg-green-700"
                    />
                </div>
                <h3 className="text-2xl font-bold text-center mb-4 text-[#0A1A3D]">جدول مجموع النشاطات</h3>
                <div className="overflow-x-auto">
                    <table id="activitiesSummaryTable" className="min-w-full bg-white border text-center">
                        <thead className="bg-[#0A1A3D] text-white">
                            <tr>
                                <th className="py-2 px-2 border-b">اسم القاطع</th>
                                <th className="py-2 px-2 border-b">اسم النشاط</th>
                                <th className="py-2 px-2 border-b">نوعه</th>
                                <th className="py-2 px-2 border-b">تاريخه</th>
                                <th className="py-2 px-2 border-b">مكانه</th>
                                <th className="py-2 px-2 border-b">الملاحظات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length > 0 ? data.map(a => (
                                <tr key={a.id} className="odd:bg-gray-50">
                                    <td className="py-2 px-2 border-b font-bold">{a.precinctName}</td>
                                    <td className="py-2 px-2 border-b">{a.name}</td>
                                    <td className="py-2 px-2 border-b">{a.type}</td>
                                    <td className="py-2 px-2 border-b">{a.date}</td>
                                    <td className="py-2 px-2 border-b">{a.location}</td>
                                    <td className="py-2 px-2 border-b">{a.notes}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={6} className="py-4">لا توجد نشاطات مسجلة.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};