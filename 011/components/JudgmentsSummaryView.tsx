import React, { useState } from 'react';
import type { Page, JudgmentDecision } from '../types';
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

interface JudgmentsSummaryViewProps {
    navigate: (page: Page) => void;
    data: (JudgmentDecision & { sourceName: string })[];
}

export const JudgmentsSummaryView: React.FC<JudgmentsSummaryViewProps> = ({ navigate, data }) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    return (
        <div>
            <PageHeader title="مجموع قرارات الحكم الكلي" onBack={() => navigate('home')} />
            <div className="bg-white p-4 rounded-lg shadow-lg printable-content">
                <div className="flex flex-wrap gap-2 mb-6 justify-center no-print">
                    <ActionButton icon="lucide-printer" text="طباعة" onClick={() => window.print()} colorClass="bg-blue-500 text-white hover:bg-blue-600" />
                    <ActionButton
                        icon="lucide-file-spreadsheet"
                        text="تصدير إلى Excel"
                        onClick={() => exportTableToExcel('judgmentsSummaryTable', 'judgments_summary_report')}
                        colorClass="bg-green-600 text-white hover:bg-green-700"
                    />
                </div>
                <h3 className="text-2xl font-bold text-center mb-4 text-[#0A1A3D]">جدول مجموع قرارات الحكم</h3>
                <div className="overflow-x-auto">
                    <table id="judgmentsSummaryTable" className="min-w-full bg-white border text-center">
                        <thead className="bg-[#0A1A3D] text-white">
                            <tr>
                                <th className="py-2 px-2 border-b">مصدر القرار</th>
                                <th className="py-2 px-2 border-b">نص القرار</th>
                                <th className="py-2 px-2 border-b">اسم المخالف</th>
                                <th className="py-2 px-2 border-b">قيمة المخالفة</th>
                                <th className="py-2 px-2 border-b">تاريخ المخالفة</th>
                                <th className="py-2 px-2 border-b">صورة القرار</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length > 0 ? data.map(d => (
                                <tr key={d.id} className="odd:bg-gray-50">
                                    <td className="py-2 px-2 border-b font-bold">{d.sourceName}</td>
                                    <td className="py-2 px-2 border-b">{d.decisionText}</td>
                                    <td className="py-2 px-2 border-b">{d.violatorName}</td>
                                    <td className="py-2 px-2 border-b">{d.fineAmount.toLocaleString()}</td>
                                    <td className="py-2 px-2 border-b">{d.violationDate}</td>
                                    <td className="py-2 px-2 border-b">
                                        {d.photoPreviewUrl ? 
                                            <button onClick={() => setSelectedImage(d.photoPreviewUrl!)} className="focus:outline-none">
                                                <img src={d.photoPreviewUrl} alt="Decision" className="h-16 w-auto mx-auto rounded cursor-pointer transition-transform duration-200 hover:scale-110" />
                                            </button>
                                            : 'لا توجد صورة'}
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={6} className="py-4">لا توجد قرارات حكم مسجلة.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {selectedImage && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 no-print"
                    onClick={() => setSelectedImage(null)}
                >
                    <div 
                        className="relative p-4 bg-white rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img 
                            src={selectedImage} 
                            alt="قرار حكم مكبر" 
                            className="max-w-[90vw] max-h-[90vh] object-contain"
                        />
                        <button 
                            onClick={() => setSelectedImage(null)} 
                            className="absolute top-2 right-2 bg-white rounded-full p-1 text-gray-800 hover:bg-gray-200"
                            aria-label="إغلاق"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};