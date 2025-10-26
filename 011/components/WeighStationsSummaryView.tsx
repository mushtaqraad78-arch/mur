import React, { useMemo } from 'react';
import { WEIGH_STATION_VIOLATION_NAMES } from '../constants';
import type { Page, WeighStationViolationData, WeighStationData } from '../types';
import { PageHeader, ActionButton } from './SharedComponents';

interface WeighStationsSummaryViewProps {
    navigate: (page: Page) => void;
    data: WeighStationData[];
}

// Helper to export to Excel
const exportTableToExcel = (tableId: string, fileName: string) => {
    const table = document.getElementById(tableId);
    if (table) {
        const wb = (window as any).XLSX.utils.table_to_book(table, { sheet: "Sheet JS" });
        (window as any).XLSX.writeFile(wb, `${fileName}.xlsx`);
    } else {
        alert('لم يتم العثور على الجدول للتصدير');
    }
};

export const WeighStationsSummaryView: React.FC<WeighStationsSummaryViewProps> = ({ navigate, data }) => {
    return (
        <div>
            <PageHeader title="مجموع محطات الوزن الكلي" onBack={() => navigate('weigh_stations')} />
            <div className="bg-white p-4 rounded-lg shadow-lg printable-content">
                 <div className="flex flex-wrap gap-2 mb-6 justify-center no-print">
                    <ActionButton icon="lucide-printer" text="طباعة" onClick={() => window.print()} colorClass="bg-blue-500 text-white hover:bg-blue-600" />
                    <ActionButton
                        icon="lucide-file-spreadsheet"
                        text="تصدير إلى Excel"
                        onClick={() => exportTableToExcel('totalWeighStationsTable', 'total_weigh_stations_report')}
                        colorClass="bg-green-600 text-white hover:bg-green-700"
                    />
                </div>
                <TotalWeighStationsTable data={data} />
            </div>
        </div>
    );
};

const TotalWeighStationsTable = ({ data }: { data: WeighStationData[] }) => {
    const aggregatedData = useMemo(() => {
        const totals = new Map<string, { morningCount: number; eveningCount: number; morningAmount: number; eveningAmount: number }>();

        WEIGH_STATION_VIOLATION_NAMES.forEach(name => {
            totals.set(name, { morningCount: 0, eveningCount: 0, morningAmount: 0, eveningAmount: 0 });
        });

        data.forEach(station => {
            station.violations.forEach(violation => {
                const current = totals.get(violation.name);
                if (current) {
                    current.morningCount += violation.morningCount;
                    current.eveningCount += violation.eveningCount;
                    current.morningAmount += violation.morningAmount;
                    current.eveningAmount += violation.eveningAmount;
                }
            });
        });

        return Array.from(totals.entries()).map(([name, values], index) => ({
            id: index + 1,
            name,
            ...values,
            totalCount: values.morningCount + values.eveningCount,
            totalAmount: values.morningAmount + values.eveningAmount
        }));
    }, [data]);

    const grandTotals = useMemo(() => {
        return aggregatedData.reduce((acc, item) => {
            acc.morningCount += item.morningCount;
            acc.eveningCount += item.eveningCount;
            acc.totalCount += item.totalCount;
            acc.morningAmount += item.morningAmount;
            acc.eveningAmount += item.eveningAmount;
            acc.totalAmount += item.totalAmount;
            return acc;
        }, { morningCount: 0, eveningCount: 0, totalCount: 0, morningAmount: 0, eveningAmount: 0, totalAmount: 0 });
    }, [aggregatedData]);


    return (
        <div>
            <h3 className="text-2xl font-bold text-center mb-4 text-[#0A1A3D]">جدول مجموع مخالفات محطات الوزن</h3>
            <div className="overflow-x-auto">
                <table id="totalWeighStationsTable" className="min-w-full bg-white border border-gray-300 text-center">
                    <thead className="bg-[#0A1A3D] text-white">
                        <tr>
                            <th className="py-3 px-2 border-b">ت</th>
                            <th className="py-3 px-2 border-b min-w-[300px] text-right">اسم المخالفة</th>
                            <th className="py-3 px-2 border-b">الصباحي</th>
                            <th className="py-3 px-2 border-b">المسائي</th>
                            <th className="py-3 px-2 border-b">الكلي</th>
                            <th className="py-3 px-2 border-b">مبلغ الصباحي</th>
                            <th className="py-3 px-2 border-b">مبلغ المسائي</th>
                            <th className="py-3 px-2 border-b">مجموع المبالغ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {aggregatedData.map(item => (
                            <tr key={item.id} className="odd:bg-gray-50">
                                <td className="py-2 px-2 border-b">{item.id}</td>
                                <td className="py-2 px-2 border-b text-right">{item.name}</td>
                                <td className="py-2 px-2 border-b">{item.morningCount.toLocaleString()}</td>
                                <td className="py-2 px-2 border-b">{item.eveningCount.toLocaleString()}</td>
                                <td className="py-2 px-2 border-b font-bold bg-gray-100">{item.totalCount.toLocaleString()}</td>
                                <td className="py-2 px-2 border-b">{item.morningAmount.toLocaleString()}</td>
                                <td className="py-2 px-2 border-b">{item.eveningAmount.toLocaleString()}</td>
                                <td className="py-2 px-2 border-b font-bold bg-gray-100">{item.totalAmount.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-[#0A1A3D] text-white font-bold text-lg">
                        <tr>
                            <td colSpan={2} className="py-3 px-2">المجاميع النهائية</td>
                            <td className="py-3 px-2">{grandTotals.morningCount.toLocaleString()}</td>
                            <td className="py-3 px-2">{grandTotals.eveningCount.toLocaleString()}</td>
                            <td className="py-3 px-2">{grandTotals.totalCount.toLocaleString()}</td>
                            <td className="py-3 px-2">{grandTotals.morningAmount.toLocaleString()}</td>
                            <td className="py-3 px-2">{grandTotals.eveningAmount.toLocaleString()}</td>
                            <td className="py-3 px-2">{grandTotals.totalAmount.toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};