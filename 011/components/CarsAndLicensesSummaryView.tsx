import React from 'react';
import type { Page } from '../types';
import { PageHeader, ActionButton } from './SharedComponents';

// Helper to export a single table to Excel
const exportTableToExcel = (tableId: string, fileName: string) => {
    const table = document.getElementById(tableId);
    if (table) {
        const wb = (window as any).XLSX.utils.book_new();
        const ws = (window as any).XLSX.utils.table_to_sheet(table);
        (window as any).XLSX.utils.book_append_sheet(wb, ws, "Vehicle Summary");
        (window as any).XLSX.writeFile(wb, `${fileName}.xlsx`);
    } else {
        alert('لم يتم العثور على الجدول للتصدير');
    }
};

interface CarsAndLicensesSummaryViewProps {
    navigate: (page: Page) => void;
}

// Mock Data for Vehicle Table - This would ideally come from a shared source or props
const vehicleData = [
    { type: 'خصوصي', start: 15000, decision68: 200, northern: 50, deregistered: 30 },
    { type: 'أجرة', start: 3000, decision68: 50, northern: 10, deregistered: 5 },
    { type: 'حمل', start: 4500, decision68: 70, northern: 15, deregistered: 8 },
    { type: 'دراجة نارية', start: 8000, decision68: 150, northern: 40, deregistered: 25 },
    { type: 'إنشائية', start: 500, decision68: 10, northern: 2, deregistered: 1 },
    { type: 'زراعية', start: 600, decision68: 12, northern: 3, deregistered: 2 },
    { type: 'أخرى(حكومية)', start: 1200, decision68: 20, northern: 5, deregistered: 4 },
];


export const CarsAndLicensesSummaryView: React.FC<CarsAndLicensesSummaryViewProps> = ({ navigate }) => {
    const calculateVehicleEndTotal = (row: typeof vehicleData[0]) => row.start + row.decision68 + row.northern - row.deregistered;
    
    const vehicleTotals = vehicleData.reduce((acc, row) => {
        acc.start += row.start;
        acc.decision68 += row.decision68;
        acc.northern += row.northern;
        acc.deregistered += row.deregistered;
        acc.end += calculateVehicleEndTotal(row);
        return acc;
    }, { start: 0, decision68: 0, northern: 0, deregistered: 0, end: 0 });

    return (
        <div>
            <PageHeader title="ملخص بيانات السيارات" onBack={() => navigate('cars_and_licenses')} />

            <div className="bg-white p-4 rounded-lg shadow-lg printable-content space-y-8">
                <div className="flex flex-wrap gap-2 mb-6 justify-center no-print">
                    <ActionButton icon="lucide-printer" text="طباعة" onClick={() => window.print()} colorClass="bg-blue-500 text-white hover:bg-blue-600" />
                    <ActionButton
                        icon="lucide-file-spreadsheet"
                        text="تصدير إلى Excel"
                        onClick={() => exportTableToExcel('vehicleSummaryTable', 'vehicle_summary_report')}
                        colorClass="bg-green-600 text-white hover:bg-green-700"
                    />
                </div>
                
                {/* Vehicle Data Table */}
                <div>
                    <h3 className="text-2xl font-bold text-center mb-4 text-[#0A1A3D]">موجود السيارات الأهلية في مديرية مرور الانبار</h3>
                    <div className="overflow-x-auto">
                        <table id="vehicleSummaryTable" className="min-w-full bg-white border text-center">
                            <thead className="bg-[#0A1A3D] text-white">
                                <tr>
                                    <th rowSpan={2} className="py-2 px-2 border-b align-middle">أنواع السيارات</th>
                                    <th className="py-2 px-2 border-b">(1)</th>
                                    <th className="py-2 px-2 border-b">(2)</th>
                                    <th className="py-2 px-2 border-b">(3)</th>
                                    <th className="py-2 px-2 border-b">(4)</th>
                                    <th className="py-2 px-2 border-b">(5)</th>
                                </tr>
                                <tr>
                                    <th className="py-2 px-2 border-b font-normal">عدد المسجل من السابق في بداية الشهر</th>
                                    <th className="py-2 px-2 border-b font-normal">المسجلة خلال الشهر قرار( 68)</th>
                                    <th className="py-2 px-2 border-b font-normal">المسجلة خلال الشهر/الشمالية</th>
                                    <th className="py-2 px-2 border-b font-normal">المسقطة او المرحلة خلال الشهر<br/><small>(ايداع/معوقين/فحص)</small></th>
                                    <th className="py-2 px-2 border-b font-normal">الموجود نهاية الشهر</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vehicleData.map(row => (
                                    <tr key={row.type} className="odd:bg-gray-50">
                                        <td className="py-2 px-2 border-b font-bold">{row.type}</td>
                                        <td className="py-2 px-2 border-b">{row.start.toLocaleString()}</td>
                                        <td className="py-2 px-2 border-b">{row.decision68.toLocaleString()}</td>
                                        <td className="py-2 px-2 border-b">{row.northern.toLocaleString()}</td>
                                        <td className="py-2 px-2 border-b">{row.deregistered.toLocaleString()}</td>
                                        <td className="py-2 px-2 border-b font-bold bg-gray-100">{calculateVehicleEndTotal(row).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-[#0A1A3D] text-white font-bold text-lg">
                                <tr>
                                    <td className="py-3 px-2">المجموع</td>
                                    <td className="py-3 px-2">{vehicleTotals.start.toLocaleString()}</td>
                                    <td className="py-3 px-2">{vehicleTotals.decision68.toLocaleString()}</td>
                                    <td className="py-3 px-2">{vehicleTotals.northern.toLocaleString()}</td>
                                    <td className="py-3 px-2">{vehicleTotals.deregistered.toLocaleString()}</td>
                                    <td className="py-3 px-2">{vehicleTotals.end.toLocaleString()}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
