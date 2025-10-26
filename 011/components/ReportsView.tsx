import React, { useState, useMemo, useRef, useEffect } from 'react';
import { VIOLATION_NAMES, PRECINCT_NAMES } from '../constants';
import type { Page, ViolationData, PrecinctViolationsData } from '../types';
import { PageHeader, ActionButton } from './SharedComponents';
import { useToast } from './Toast';

// Fix: Add missing ReportsViewProps interface definition.
interface ReportsViewProps {
    navigate: (page: Page) => void;
    allViolationsData: PrecinctViolationsData[];
}

// ====================================================================================
// Helper function to export a specific table to Excel
// ====================================================================================
const exportTableToExcel = (tableId: string, fileName: string) => {
    const table = document.getElementById(tableId);
    if (table) {
        const wb = (window as any).XLSX.utils.table_to_book(table, { sheet: "Sheet JS" });
        (window as any).XLSX.writeFile(wb, `${fileName}.xlsx`);
    } else {
        alert('لم يتم العثور على الجدول للتصدير');
    }
};

const ViolationSelector = ({ selected, onChange }: { selected: string[], onChange: (selected: string[]) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const filteredViolations = VIOLATION_NAMES.filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleSelect = (violationName: string) => {
        if (selected.includes(violationName)) {
            onChange(selected.filter(name => name !== violationName));
        } else {
            onChange([...selected, violationName]);
        }
    };

    const selectAll = () => onChange(VIOLATION_NAMES);
    const clearAll = () => onChange([]);

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn-secondary w-full md:w-auto"
            >
                اختر المخالفات ({selected.length === 0 ? 'الكل' : `${selected.length} مختارة`})
            </button>
            {isOpen && (
                <div className="absolute z-10 top-full mt-2 w-72 md:w-96 bg-white border border-gray-300 rounded-lg shadow-xl p-3">
                    <input
                        type="text"
                        placeholder="ابحث عن مخالفة..."
                        className="w-full p-2 border rounded mb-2"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <div className="flex justify-between mb-2">
                        <button onClick={selectAll} className="text-sm text-blue-600 hover:underline">تحديد الكل</button>
                        <button onClick={clearAll} className="text-sm text-red-600 hover:underline">الغاء الكل</button>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                        {filteredViolations.map(name => (
                            <div key={name} className="flex items-center p-1 hover:bg-gray-100 rounded">
                                <input
                                    type="checkbox"
                                    id={`chk-${name}`}
                                    checked={selected.includes(name)}
                                    onChange={() => handleSelect(name)}
                                    className="ml-2"
                                />
                                <label htmlFor={`chk-${name}`} className="text-sm w-full cursor-pointer">{name}</label>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


export const ReportsView: React.FC<ReportsViewProps> = ({ navigate, allViolationsData }) => {
    const [activeReport, setActiveReport] = useState('total_violations');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedViolations, setSelectedViolations] = useState<string[]>([]);
    const { addToast } = useToast();
    
    const handleSearch = () => {
        addToast(`سيتم تطبيق الفلاتر والبحث عن البيانات من تاريخ ${startDate} إلى ${endDate}.`, 'info');
        // Note: Data filtering logic by date would be implemented here if the data source supported it.
    };
    
    return (
        <div>
            <PageHeader title="التقارير والمجاميع" onBack={() => navigate('home')} />
            
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-6 no-print border border-gray-200">
                <h4 className="text-xl font-bold text-[#0A1A3D] mb-3 text-center">تصفية النتائج</h4>
                <div className="flex flex-wrap items-center justify-center gap-4">
                    <div>
                        <label htmlFor="startDate" className="font-semibold ml-2">من تاريخ:</label>
                        <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-2 border rounded" />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="font-semibold ml-2">إلى تاريخ:</label>
                        <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-2 border rounded" />
                    </div>
                    {activeReport === 'total_violations' && (
                       <ViolationSelector selected={selectedViolations} onChange={setSelectedViolations} />
                    )}
                    <ActionButton icon="lucide-search" text="بحث" onClick={handleSearch} />
                </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mb-6 no-print">
                <button onClick={() => setActiveReport('total_violations')} className={`btn-primary ${activeReport !== 'total_violations' && 'opacity-60'}`}>المجموع الكلي للمخالفات</button>
                <button onClick={() => setActiveReport('precincts_summary')} className={`btn-primary ${activeReport !== 'precincts_summary' && 'opacity-60'}`}>ملخص مواقف القواطع</button>
                <button onClick={() => setActiveReport('detailed_precincts_summary')} className={`btn-primary ${activeReport !== 'detailed_precincts_summary' && 'opacity-60'}`}>الموقف التفصيلي للقواطع</button>
                <button onClick={() => navigate('accidents_summary')} className="btn-primary">ملخص الحوادث</button>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-lg printable-content">
                <div className="flex flex-wrap gap-2 mb-6 justify-center no-print">
                    <ActionButton icon="lucide-printer" text="طباعة" onClick={() => window.print()} colorClass="bg-blue-500 text-white hover:bg-blue-600" />
                </div>
                
                {activeReport === 'total_violations' && <TotalViolationsTable data={allViolationsData} selectedViolations={selectedViolations} />}
                {activeReport === 'precincts_summary' && <PrecinctsSummaryTable data={allViolationsData} />}
                {activeReport === 'detailed_precincts_summary' && <DetailedPrecinctsSummaryTable data={allViolationsData} />}
            </div>
        </div>
    );
};


const TotalViolationsTable = ({ data, selectedViolations }: { data: PrecinctViolationsData[], selectedViolations: string[] }) => {
    const aggregatedData = useMemo(() => {
        const totals = new Map<string, { morningTotal: number; eveningTotal: number; morningAmount: number; eveningAmount: number }>();
        
        VIOLATION_NAMES.forEach(name => {
            totals.set(name, { morningTotal: 0, eveningTotal: 0, morningAmount: 0, eveningAmount: 0 });
        });

        data.forEach(precinct => {
            precinct.violations.forEach(violation => {
                const current = totals.get(violation.name);
                if (current) {
                    current.morningTotal += violation.morningCount;
                    current.eveningTotal += violation.eveningCount;
                    current.morningAmount += violation.morningAmount;
                    current.eveningAmount += violation.eveningAmount;
                }
            });
        });
        
        const allAggregated = Array.from(totals.entries()).map(([name, values], index) => ({
            id: index + 1,
            name,
            morningTotal: values.morningTotal,
            eveningTotal: values.eveningTotal,
            totalViolations: values.morningTotal + values.eveningTotal,
            totalAmount: values.morningAmount + values.eveningAmount
        }));

        if (selectedViolations.length === 0) {
            return allAggregated;
        }

        return allAggregated.filter(item => selectedViolations.includes(item.name));

    }, [data, selectedViolations]);

    const grandTotals = useMemo(() => {
        return aggregatedData.reduce((acc, item) => {
            acc.morningTotal += item.morningTotal;
            acc.eveningTotal += item.eveningTotal;
            acc.totalViolations += item.totalViolations;
            acc.totalAmount += item.totalAmount;
            return acc;
        }, { morningTotal: 0, eveningTotal: 0, totalViolations: 0, totalAmount: 0 });
    }, [aggregatedData]);

    return (
        <div>
            <div className="text-center mb-4 relative">
                <h3 className="text-2xl font-bold text-[#0A1A3D]">المجموع الكلي للمخالفات</h3>
                <div className="absolute top-1/2 -translate-y-1/2 left-0 no-print">
                    <ActionButton 
                        icon="lucide-file-spreadsheet" 
                        text="تصدير إلى Excel" 
                        onClick={() => exportTableToExcel('totalViolationsTable', 'total_violations_report')}
                        colorClass="bg-green-600 text-white hover:bg-green-700"
                    />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table id="totalViolationsTable" className="min-w-full bg-white border border-gray-300 text-center">
                    <thead className="bg-[#0A1A3D] text-white">
                        <tr>
                            <th className="py-3 px-2 border-b">ت</th>
                            <th className="py-3 px-2 border-b min-w-[300px] text-right">اسم المخالفة</th>
                            <th className="py-3 px-2 border-b">المجموع الصباحي</th>
                            <th className="py-3 px-2 border-b">المجموع المسائي</th>
                            <th className="py-3 px-2 border-b">المجموع الكلي</th>
                            <th className="py-3 px-2 border-b">المبلغ الكلي للمخالفة</th>
                        </tr>
                    </thead>
                    <tbody>
                        {aggregatedData.map((item, index) => (
                            <tr key={item.name} className="odd:bg-gray-50">
                                <td className="py-2 px-2 border-b">{index + 1}</td>
                                <td className="py-2 px-2 border-b text-right">{item.name}</td>
                                <td className="py-2 px-2 border-b">{item.morningTotal.toLocaleString()}</td>
                                <td className="py-2 px-2 border-b">{item.eveningTotal.toLocaleString()}</td>
                                <td className="py-2 px-2 border-b font-bold bg-gray-100">{item.totalViolations.toLocaleString()}</td>
                                <td className="py-2 px-2 border-b font-bold bg-gray-100">{item.totalAmount.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-[#0A1A3D] text-white font-bold text-lg">
                        <tr>
                            <td colSpan={2} className="py-3 px-2">المجاميع النهائية</td>
                            <td className="py-3 px-2">{grandTotals.morningTotal.toLocaleString()}</td>
                            <td className="py-3 px-2">{grandTotals.eveningTotal.toLocaleString()}</td>
                            <td className="py-3 px-2">{grandTotals.totalViolations.toLocaleString()}</td>
                            <td className="py-3 px-2">{grandTotals.totalAmount.toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

const PrecinctsSummaryTable = ({ data }: { data: PrecinctViolationsData[] }) => {
    const summaryData = useMemo(() => {
        return data.map(precinct => {
            const totals = precinct.violations.reduce((acc, v) => {
                acc.morningTotal += v.morningCount;
                acc.eveningTotal += v.eveningCount;
                acc.totalAmount += v.morningAmount + v.eveningAmount;
                return acc;
            }, { morningTotal: 0, eveningTotal: 0, totalAmount: 0 });

            return {
                name: precinct.precinctName,
                morningTotal: totals.morningTotal,
                eveningTotal: totals.eveningTotal,
                totalViolations: totals.morningTotal + totals.eveningTotal,
                totalAmount: totals.totalAmount,
            };
        });
    }, [data]);
    
    return (
        <div>
            <div className="text-center mb-4 relative">
                <h3 className="text-2xl font-bold text-[#0A1A3D]">ملخص مواقف القواطع</h3>
                 <div className="absolute top-1/2 -translate-y-1/2 left-0 no-print">
                    <ActionButton 
                        icon="lucide-file-spreadsheet" 
                        text="تصدير إلى Excel" 
                        onClick={() => exportTableToExcel('precinctsSummaryTable', 'precincts_summary_report')}
                        colorClass="bg-green-600 text-white hover:bg-green-700"
                    />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table id="precinctsSummaryTable" className="min-w-full bg-white border border-gray-300 text-center">
                    <thead className="bg-[#0A1A3D] text-white">
                        <tr>
                            <th className="py-3 px-2 border-b">اسم القاطع</th>
                            <th className="py-3 px-2 border-b">الموقف الصباحي</th>
                            <th className="py-3 px-2 border-b">الموقف المسائي</th>
                            <th className="py-3 px-2 border-b">مجموع المخالفات</th>
                            <th className="py-3 px-2 border-b">مجموع المبالغ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {summaryData.map(item => (
                            <tr key={item.name} className="odd:bg-gray-50">
                                <td className="py-2 px-2 border-b font-bold">{item.name}</td>
                                <td className="py-2 px-2 border-b">{item.morningTotal}</td>
                                <td className="py-2 px-2 border-b">{item.eveningTotal}</td>
                                <td className="py-2 px-2 border-b font-bold bg-gray-100">{item.totalViolations}</td>
                                <td className="py-2 px-2 border-b font-bold bg-gray-100">{item.totalAmount.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// New component for the detailed precinct summary report

const VIOLATION_CATEGORIES_MAP = {
    seizedMotorcycles: ["م ب رقم ( 1 ) لسنة 2012 قيادة الدراجات النارية من الساعة 6 مساءً ولغاية 6 صباحا . استقلال الدراجة من قبل شخصين", "الدراجات المحجوزة"],
    seizedVehicles: ["حجز مركبات الفحص المؤقت", "المركبات المحجوزة"],
    motorcycleViolations: ["قيادة الدراجات النارية سعة محركها تقل عن (40 cc ) في الشوارع الرئيسية"],
    noPlates: ["عدم تثبيت لوحات مفردة او مزدوجة ( بدون لوحات تسجيل )"],
    drivingLicense: ["قيادة مركبة بإجازة سوق غير مخصصة بنوع المركبة", "عدم حمل (إجازة سوق او سنوية) او الامتناع عن اعطائها", "عدم تجديد (إجازة سوق او السنوية ) بعد مرور (30) يوم"],
    tintedGlass: ["الزجاج المضلل والستائر"],
    againstTraffic: ["السير عكس الاتجاه"],
    privateAsTaxi: ["م0ب(3) لسنة 2019 استخدام السيارات الخصوصي للإجرة"],
    noSeatbelt: ["عدم ارتداء حزام الامان ( للسائق او الراكب الذي بجانبه ) او جلوس الاطفال دون سن (8 سنوات ) في المقعد الامامي للسيارة"],
    illegalParking: ["الوقوف الممنوع"],
    trafficLight: ["عدم الامتثال للإشارة الضوئية او اشارة رجل المرور"],
    truckOvernightParking: ["مخالفات مبيت الحمل او السيارات الكبيرة داخل الاحياء"],
};
const ALL_CATEGORIZED_VIOLATIONS = new Set(Object.values(VIOLATION_CATEGORIES_MAP).flat());

const DetailedPrecinctsSummaryTable = ({ data }: { data: PrecinctViolationsData[] }) => {
    const [shift, setShift] = useState<'morning' | 'evening' | 'total'>('total');

    const processedData = useMemo(() => {
        return data.map(precinct => {
            const aggregated = {
                precinctName: precinct.precinctName,
                seizedMotorcycles: { m: 0, e: 0, mA: 0, eA: 0 },
                seizedVehicles: { m: 0, e: 0, mA: 0, eA: 0 },
                motorcycleViolations: { m: 0, e: 0, mA: 0, eA: 0 },
                noPlates: { m: 0, e: 0, mA: 0, eA: 0 },
                drivingLicense: { m: 0, e: 0, mA: 0, eA: 0 },
                tintedGlass: { m: 0, e: 0, mA: 0, eA: 0 },
                againstTraffic: { m: 0, e: 0, mA: 0, eA: 0 },
                privateAsTaxi: { m: 0, e: 0, mA: 0, eA: 0 },
                noSeatbelt: { m: 0, e: 0, mA: 0, eA: 0 },
                illegalParking: { m: 0, e: 0, mA: 0, eA: 0 },
                trafficLight: { m: 0, e: 0, mA: 0, eA: 0 },
                truckOvernightParking: { m: 0, e: 0, mA: 0, eA: 0 },
                otherViolations: { m: 0, e: 0, mA: 0, eA: 0 },
            };

            precinct.violations.forEach(v => {
                let categorized = false;
                for (const [key, names] of Object.entries(VIOLATION_CATEGORIES_MAP)) {
                    if (names.includes(v.name)) {
                        // Fix: Cast `key` to a type that excludes `precinctName` to ensure TypeScript resolves the property access to the correct object type ({m, e, mA, eA}) instead of a union including `string`.
                        const categoryData = aggregated[key as keyof Omit<typeof aggregated, 'precinctName'>];
                        categoryData.m += v.morningCount;
                        categoryData.e += v.eveningCount;
                        categoryData.mA += v.morningAmount;
                        categoryData.eA += v.eveningAmount;
                        categorized = true;
                        break;
                    }
                }
                if (!categorized) {
                    aggregated.otherViolations.m += v.morningCount;
                    aggregated.otherViolations.e += v.eveningCount;
                    aggregated.otherViolations.mA += v.morningAmount;
                    aggregated.otherViolations.eA += v.eveningAmount;
                }
            });
            return aggregated;
        });
    }, [data]);

    const getCount = (category: { m: number; e: number }) => {
        switch (shift) {
            case 'morning': return category.m;
            case 'evening': return category.e;
            case 'total': return category.m + category.e;
        }
    };
    
    const getAmount = (categories: any) => {
        let amount = 0;
        const allData = Object.values(categories).slice(1); // Exclude precinctName
        switch (shift) {
            case 'morning': 
                allData.forEach((cat: any) => amount += cat.mA);
                break;
            case 'evening':
                allData.forEach((cat: any) => amount += cat.eA);
                break;
            case 'total':
                allData.forEach((cat: any) => amount += (cat.mA + cat.eA));
                break;
        }
        return amount;
    };
    
    const tableHeaders = [
        "اسم القاطع", "دراجات محجوزة", "مركبات محجوزة", "مخالفات الدراجات", "بدون لوحات", "إجازة سوق",
        "زجاج مظلل", "عكس الاتجاه", "خصوصي أجرة", "حزام الامان", "وقوف ممنوع", "إشارة ضوئية",
        "مبيت الحمل", "مخالفات أخرى", "مجموع القاطع", "مبلغ المخالفة"
    ];

    const grandTotals = useMemo(() => {
        const initialTotals = {
            seizedMotorcycles: 0, seizedVehicles: 0, motorcycleViolations: 0, noPlates: 0, drivingLicense: 0,
            tintedGlass: 0, againstTraffic: 0, privateAsTaxi: 0, noSeatbelt: 0, illegalParking: 0,
            trafficLight: 0, truckOvernightParking: 0, otherViolations: 0,
            precinctTotal: 0, totalAmount: 0,
        };

        return processedData.reduce((acc, row) => {
            const categories = [
                row.seizedMotorcycles, row.seizedVehicles, row.motorcycleViolations, row.noPlates, row.drivingLicense,
                row.tintedGlass, row.againstTraffic, row.privateAsTaxi, row.noSeatbelt, row.illegalParking,
                row.trafficLight, row.truckOvernightParking, row.otherViolations
            ];
            const precinctTotalForRow = categories.reduce((sum, cat) => sum + getCount(cat), 0);
            
            acc.seizedMotorcycles += getCount(row.seizedMotorcycles);
            acc.seizedVehicles += getCount(row.seizedVehicles);
            acc.motorcycleViolations += getCount(row.motorcycleViolations);
            acc.noPlates += getCount(row.noPlates);
            acc.drivingLicense += getCount(row.drivingLicense);
            acc.tintedGlass += getCount(row.tintedGlass);
            acc.againstTraffic += getCount(row.againstTraffic);
            acc.privateAsTaxi += getCount(row.privateAsTaxi);
            acc.noSeatbelt += getCount(row.noSeatbelt);
            acc.illegalParking += getCount(row.illegalParking);
            acc.trafficLight += getCount(row.trafficLight);
            acc.truckOvernightParking += getCount(row.truckOvernightParking);
            acc.otherViolations += getCount(row.otherViolations);
            acc.precinctTotal += precinctTotalForRow;
            acc.totalAmount += getAmount(row);

            return acc;
        }, initialTotals);

    }, [processedData, shift, getCount, getAmount]);


    return (
        <div className="overflow-x-auto">
            <h3 className="text-2xl font-bold text-center mb-4 text-[#0A1A3D]">الموقف التفصيلي للقواطع</h3>
            <div className="flex justify-center gap-2 mb-4 no-print">
                <button onClick={() => setShift('morning')} className={`btn-secondary ${shift === 'morning' ? 'bg-blue-200' : ''}`}>الموقف الصباحي</button>
                <button onClick={() => setShift('evening')} className={`btn-secondary ${shift === 'evening' ? 'bg-blue-200' : ''}`}>الموقف المسائي</button>
                <button onClick={() => setShift('total')} className={`btn-secondary ${shift === 'total' ? 'bg-blue-200' : ''}`}>المجموع الكلي</button>
            </div>
            <table id="detailedPrecinctsSummaryTable" className="min-w-full bg-white border border-gray-300 text-center text-sm table-fixed">
                <thead className="bg-[#0A1A3D] text-white">
                    <tr>
                        {tableHeaders.map(h => <th key={h} className="py-2 px-1 border-b align-middle w-24 whitespace-normal break-words">{h}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {processedData.map(row => {
                         const categories = [
                            row.seizedMotorcycles, row.seizedVehicles, row.motorcycleViolations, row.noPlates, row.drivingLicense,
                            row.tintedGlass, row.againstTraffic, row.privateAsTaxi, row.noSeatbelt, row.illegalParking,
                            row.trafficLight, row.truckOvernightParking, row.otherViolations
                        ];
                        const precinctTotal = categories.reduce((sum, cat) => sum + getCount(cat), 0);
                        const totalAmount = getAmount(row);

                        return (
                            <tr key={row.precinctName} className="odd:bg-gray-50">
                                <td className="py-2 px-1 border-b font-bold">{row.precinctName}</td>
                                {categories.map((cat, i) => <td key={i} className="py-2 px-1 border-b">{getCount(cat)}</td>)}
                                <td className="py-2 px-1 border-b font-bold bg-gray-100">{precinctTotal}</td>
                                <td className="py-2 px-1 border-b font-bold bg-gray-100">{totalAmount.toLocaleString()}</td>
                            </tr>
                        );
                    })}
                </tbody>
                 <tfoot className="bg-blue-100 font-bold text-base text-[#0A1A3D]">
                    <tr>
                        <td className="py-3 px-1 border">المجموع الكلي</td>
                        <td className="py-3 px-1 border">{grandTotals.seizedMotorcycles.toLocaleString()}</td>
                        <td className="py-3 px-1 border">{grandTotals.seizedVehicles.toLocaleString()}</td>
                        <td className="py-3 px-1 border">{grandTotals.motorcycleViolations.toLocaleString()}</td>
                        <td className="py-3 px-1 border">{grandTotals.noPlates.toLocaleString()}</td>
                        <td className="py-3 px-1 border">{grandTotals.drivingLicense.toLocaleString()}</td>
                        <td className="py-3 px-1 border">{grandTotals.tintedGlass.toLocaleString()}</td>
                        <td className="py-3 px-1 border">{grandTotals.againstTraffic.toLocaleString()}</td>
                        <td className="py-3 px-1 border">{grandTotals.privateAsTaxi.toLocaleString()}</td>
                        <td className="py-3 px-1 border">{grandTotals.noSeatbelt.toLocaleString()}</td>
                        <td className="py-3 px-1 border">{grandTotals.illegalParking.toLocaleString()}</td>
                        <td className="py-3 px-1 border">{grandTotals.trafficLight.toLocaleString()}</td>
                        <td className="py-3 px-1 border">{grandTotals.truckOvernightParking.toLocaleString()}</td>
                        <td className="py-3 px-1 border">{grandTotals.otherViolations.toLocaleString()}</td>
                        <td className="py-3 px-1 border">{grandTotals.precinctTotal.toLocaleString()}</td>
                        <td className="py-3 px-1 border">{grandTotals.totalAmount.toLocaleString()}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};