import React, { useState, useMemo } from 'react';
import type { Page } from '../types';
import { PageHeader, ActionButton, SuccessOverlay } from './SharedComponents';
import { useToast } from './Toast';

// Helper to export all tables to a single Excel file with multiple sheets
const exportAllTablesToExcel = () => {
    const tableIds = ['vehicleDataTable', 'licenseDataTable', 'tempInspectionTable'];
    const wb = (window as any).XLSX.utils.book_new();

    tableIds.forEach(id => {
        const table = document.getElementById(id);
        if (table) {
            const ws = (window as any).XLSX.utils.table_to_sheet(table);
            const sheetName = table.querySelector('caption')?.textContent || id;
            (window as any).XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
        }
    });

    if (wb.SheetNames.length > 0) {
        (window as any).XLSX.writeFile(wb, 'cars_and_licenses_report.xlsx');
    } else {
        alert('لم يتم العثور على جداول للتصدير');
    }
};

interface CarsAndLicensesViewProps {
    navigate: (page: Page) => void;
}

interface VehicleDataRow {
    type: string;
    start: number;
    decision68: number;
    northern: number;
    deregistered: number;
}

interface LicenseDataRow {
    type: string;
    previous: number;
    granted: number;
    changed: number;
    renewed: number;
}

// Initial Data structure for state
const initialVehicleData: VehicleDataRow[] = [
    { type: 'خصوصي', start: 0, decision68: 0, northern: 0, deregistered: 0 },
    { type: 'أجرة', start: 0, decision68: 0, northern: 0, deregistered: 0 },
    { type: 'حمل', start: 0, decision68: 0, northern: 0, deregistered: 0 },
    { type: 'دراجة نارية', start: 0, decision68: 0, northern: 0, deregistered: 0 },
    { type: 'إنشائية', start: 0, decision68: 0, northern: 0, deregistered: 0 },
    { type: 'زراعية', start: 0, decision68: 0, northern: 0, deregistered: 0 },
    { type: 'أخرى(حكومية)', start: 0, decision68: 0, northern: 0, deregistered: 0 },
];

const initialLicenseData: LicenseDataRow[] = [
    { type: 'خصوصي', previous: 0, granted: 0, changed: 0, renewed: 0 },
    { type: 'عمومي', previous: 0, granted: 0, changed: 0, renewed: 0 },
    { type: 'خاصة', previous: 0, granted: 0, changed: 0, renewed: 0 },
    { type: 'اخرى', previous: 0, granted: 0, changed: 0, renewed: 0 },
];


export const CarsAndLicensesView: React.FC<CarsAndLicensesViewProps> = ({ navigate }) => {
    const [vehicleData, setVehicleData] = useState<VehicleDataRow[]>(initialVehicleData);
    const [licenseData, setLicenseData] = useState<LicenseDataRow[]>(initialLicenseData);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const { addToast } = useToast();
    
    const handleVehicleDataChange = (index: number, field: keyof Omit<VehicleDataRow, 'type'>, value: string) => {
        const newData = [...vehicleData];
        newData[index] = { ...newData[index], [field]: parseInt(value, 10) || 0 };
        setVehicleData(newData);
    };
    
    const handleLicenseDataChange = (index: number, field: keyof Omit<LicenseDataRow, 'type'>, value: string) => {
        const newData = [...licenseData];
        newData[index] = { ...newData[index], [field]: parseInt(value, 10) || 0 };
        setLicenseData(newData);
    };
    
    const handleSearch = () => {
        addToast(`يتم البحث عن البيانات من تاريخ ${startDate} إلى ${endDate}`, 'info');
        // In a real app, you would fetch data for the selected date range here.
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            // In a real app, you would send vehicleData and licenseData to the backend.
            console.log("Saving Vehicle Data:", vehicleData);
            console.log("Saving License Data:", licenseData);
            setIsSaving(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 1500);
        }, 1000);
    };

    const calculateVehicleEndTotal = (row: VehicleDataRow) => row.start + row.decision68 + row.northern - row.deregistered;
    const calculateLicenseEndTotal = (row: LicenseDataRow) => row.previous + row.granted - row.changed;
    
    const vehicleTotals = useMemo(() => vehicleData.reduce((acc, row) => {
        acc.start += row.start;
        acc.decision68 += row.decision68;
        acc.northern += row.northern;
        acc.deregistered += row.deregistered;
        acc.end += calculateVehicleEndTotal(row);
        return acc;
    }, { start: 0, decision68: 0, northern: 0, deregistered: 0, end: 0 }), [vehicleData]);

    const licenseTotals = useMemo(() => licenseData.reduce((acc, row) => {
        acc.previous += row.previous;
        acc.granted += row.granted;
        acc.changed += row.changed;
        acc.end += calculateLicenseEndTotal(row);
        acc.renewed += row.renewed;
        return acc;
    }, { previous: 0, granted: 0, changed: 0, end: 0, renewed: 0 }), [licenseData]);

    return (
        <div>
            <SuccessOverlay show={showSuccess} message="تم حفظ البيانات بنجاح!" />
            <PageHeader title="بيانات السيارات والإجازات" onBack={() => navigate('home')} />

            <div className="bg-white p-4 rounded-lg shadow-lg printable-content space-y-12">
                <div className="flex flex-wrap gap-2 mb-6 justify-center no-print">
                    <ActionButton icon="lucide-printer" text="طباعة" onClick={() => window.print()} colorClass="bg-blue-500 text-white hover:bg-blue-600" />
                    <ActionButton
                        icon="lucide-file-spreadsheet"
                        text="تصدير إلى Excel"
                        onClick={exportAllTablesToExcel}
                        colorClass="bg-green-600 text-white hover:bg-green-700"
                    />
                     <ActionButton
                        icon="lucide-file-bar-chart"
                        text="عرض ملخص السيارات"
                        onClick={() => navigate('cars_and_licenses_summary')}
                        colorClass="bg-purple-500 text-white hover:bg-purple-600"
                    />
                    <ActionButton icon="lucide-save" text="حفظ البيانات" onClick={handleSave} isLoading={isSaving} colorClass="bg-red-500 text-white hover:bg-red-600" />
                </div>
                 <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-6 no-print border border-gray-200">
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
                
                {/* Vehicle Data Table */}
                <div>
                    <h3 className="text-2xl font-bold text-center mb-4 text-[#0A1A3D]">موجود السيارات الأهلية في مديرية مرور الانبار</h3>
                    <div className="overflow-x-auto">
                        <table id="vehicleDataTable" className="min-w-full bg-white border text-center">
                             <caption className="hidden">موجود السيارات الأهلية</caption>
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
                                {vehicleData.map((row, index) => (
                                    <tr key={row.type} className="odd:bg-gray-50">
                                        <td className="py-1 px-2 border-b font-bold">{row.type}</td>
                                        <td className="py-1 px-2 border-b"><input type="number" value={row.start} onChange={e => handleVehicleDataChange(index, 'start', e.target.value)} className="w-24 text-center p-1 border rounded" /></td>
                                        <td className="py-1 px-2 border-b"><input type="number" value={row.decision68} onChange={e => handleVehicleDataChange(index, 'decision68', e.target.value)} className="w-24 text-center p-1 border rounded" /></td>
                                        <td className="py-1 px-2 border-b"><input type="number" value={row.northern} onChange={e => handleVehicleDataChange(index, 'northern', e.target.value)} className="w-24 text-center p-1 border rounded" /></td>
                                        <td className="py-1 px-2 border-b"><input type="number" value={row.deregistered} onChange={e => handleVehicleDataChange(index, 'deregistered', e.target.value)} className="w-24 text-center p-1 border rounded" /></td>
                                        <td className="py-1 px-2 border-b font-bold bg-gray-100">{calculateVehicleEndTotal(row).toLocaleString()}</td>
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
                    
                    <div className="overflow-x-auto mt-4">
                        <table id="tempInspectionTable" className="min-w-full bg-white border text-center w-1/2 mx-auto">
                            <caption className="hidden">الفحص المؤقت</caption>
                             <thead className="bg-gray-100">
                                <tr>
                                    <th className="py-2 px-2 border">الفحص المؤقت المسجل الى دائمي</th>
                                    <th className="py-2 px-2 border">الباقي من الفحص المؤقت</th>
                                    <th className="py-2 px-2 border">المجموع</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="py-1 px-2 border"><input type="number" className="w-24 text-center p-1 border rounded" defaultValue={0}/></td>
                                    <td className="py-1 px-2 border"><input type="number" className="w-24 text-center p-1 border rounded" defaultValue={0}/></td>
                                    <td className="py-1 px-2 border font-bold bg-gray-100">0</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* License Data Table */}
                <div>
                    <h3 className="text-2xl font-bold text-center mb-4 text-[#0A1A3D]">جدول موجود اجازات السوق مديرية مرور الانبار</h3>
                    <div className="overflow-x-auto">
                        <table id="licenseDataTable" className="min-w-full bg-white border text-center">
                            <caption className="hidden">موجود اجازات السوق</caption>
                            <thead className="bg-[#0A1A3D] text-white">
                                <tr>
                                    <th rowSpan={2} className="py-2 px-2 border-b align-middle">نوع الإجازة</th>
                                    <th className="py-2 px-2 border-b">(1)</th>
                                    <th className="py-2 px-2 border-b">(2)</th>
                                    <th className="py-2 px-2 border-b">(3)</th>
                                    <th className="py-2 px-2 border-b">(4)</th>
                                    <th className="py-2 px-2 border-b">(5)</th>
                                </tr>
                                <tr>
                                    <th className="py-2 px-2 border-b font-normal">الموجود من الشهر السابق</th>
                                    <th className="py-2 px-2 border-b font-normal">الممنوحة خلال الشهر (+)</th>
                                    <th className="py-2 px-2 border-b font-normal">تبديل فئة (-)</th>
                                    <th className="py-2 px-2 border-b font-normal">الموجود في نهاية الشهر (=)</th>
                                    <th className="py-2 px-2 border-b font-normal">تجديد اجازة</th>
                                </tr>
                            </thead>
                            <tbody>
                                {licenseData.map((row, index) => (
                                    <tr key={row.type} className="odd:bg-gray-50">
                                        <td className="py-1 px-2 border-b font-bold">{row.type}</td>
                                        <td className="py-1 px-2 border-b"><input type="number" value={row.previous} onChange={e => handleLicenseDataChange(index, 'previous', e.target.value)} className="w-24 text-center p-1 border rounded" /></td>
                                        <td className="py-1 px-2 border-b"><input type="number" value={row.granted} onChange={e => handleLicenseDataChange(index, 'granted', e.target.value)} className="w-24 text-center p-1 border rounded" /></td>
                                        <td className="py-1 px-2 border-b"><input type="number" value={row.changed} onChange={e => handleLicenseDataChange(index, 'changed', e.target.value)} className="w-24 text-center p-1 border rounded" /></td>
                                        <td className="py-1 px-2 border-b font-bold bg-gray-100">{calculateLicenseEndTotal(row).toLocaleString()}</td>
                                        <td className="py-1 px-2 border-b"><input type="number" value={row.renewed} onChange={e => handleLicenseDataChange(index, 'renewed', e.target.value)} className="w-24 text-center p-1 border rounded" /></td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-[#0A1A3D] text-white font-bold text-lg">
                                <tr>
                                    <td className="py-3 px-2">المجموع</td>
                                    <td className="py-3 px-2">{licenseTotals.previous.toLocaleString()}</td>
                                    <td className="py-3 px-2">{licenseTotals.granted.toLocaleString()}</td>
                                    <td className="py-3 px-2">{licenseTotals.changed.toLocaleString()}</td>
                                    <td className="py-3 px-2">{licenseTotals.end.toLocaleString()}</td>
                                    <td className="py-3 px-2">{licenseTotals.renewed.toLocaleString()}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CarsAndLicensesView;