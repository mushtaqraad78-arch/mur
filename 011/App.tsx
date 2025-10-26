import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { PrecinctsView } from './components/PrecinctsView';
import { WeighStationsView } from './components/WeighStationsView';
import { RadarsView } from './components/RadarsView';
import { ReportsView } from './components/ReportsView';
import { ControlPanel } from './components/ControlPanel';
import { RadarsSummaryView } from './components/RadarsSummaryView';
import { WeighStationsSummaryView } from './components/WeighStationsSummaryView';
import { AccidentsSummaryView } from './components/AccidentsSummaryView';
import { ClosuresSummaryView } from './components/ClosuresSummaryView';
import { ActivitiesSummaryView } from './components/ActivitiesSummaryView';
import { JudgmentsSummaryView } from './components/JudgmentsSummaryView';
import { CarsAndLicensesView } from './components/CarsAndLicensesView';
import { CarsAndLicensesSummaryView } from './components/CarsAndLicensesSummaryView';
import { ToastProvider, useToast } from './components/Toast';
import { PasswordModal } from './components/PasswordModal';
import { FullScreenLoader } from './components/SharedComponents';
import type { Page, WeighStationData, WeighStationViolationData, PrecinctRadarData, RadarViolationData, PrecinctAccidentData, AccidentData, PrecinctClosureData, RoadClosureData, PrecinctActivityData, ActivityData, PrecinctJudgmentData, JudgmentDecision, WeighStationJudgmentData, RadarJudgmentData, ViolationData, PrecinctViolationsData, Passwords, AuthRequest } from './types';
import { WEIGH_STATION_NAMES, WEIGH_STATION_VIOLATION_NAMES, PRECINCT_NAMES, RADAR_VIOLATION_NAMES, RADAR_LOCATIONS, VIOLATION_NAMES, PAGE_ACCESS_CONFIG } from './constants';

const initialPrecinctViolationsData = (): PrecinctViolationsData[] => {
    return PRECINCT_NAMES.map(precinctName => ({
        precinctName,
        violations: VIOLATION_NAMES.map((name, index) => ({ id: index + 1, name, morningCount: 0, eveningCount: 0, morningAmount: 0, eveningAmount: 0 }))
    }));
};
const initialWeighStationsData = (): WeighStationData[] => {
    return WEIGH_STATION_NAMES.map(stationName => ({
        name: stationName,
        violations: WEIGH_STATION_VIOLATION_NAMES.map((name, index) => ({ id: index + 1, name, morningCount: 0, eveningCount: 0, morningAmount: 0, eveningAmount: 0 }))
    }));
};
const initialPrecinctRadarData = (): PrecinctRadarData[] => {
    return PRECINCT_NAMES.map(precinctName => ({
        precinctName,
        violations: RADAR_VIOLATION_NAMES.map((name, index) => ({ id: index + 1, name, morningCount: 0, eveningCount: 0, morningAmount: 0, eveningAmount: 0 }))
    }));
};
const initialAccidentState: AccidentData = { id: '', types: { pedestrian: 0, collision: 0, rollover: 0, other: 0 }, deaths: { men: 0, women: 0, children: 0 }, injuries: { men: 0, women: 0, children: 0 }, analysis: [] };
const initialPrecinctAccidentData = (): PrecinctAccidentData[] => {
    return PRECINCT_NAMES.map(precinctName => ({ precinctName, accidents: { ...JSON.parse(JSON.stringify(initialAccidentState)), id: precinctName } }));
};
const initialPrecinctClosureData = (): PrecinctClosureData[] => {
    return PRECINCT_NAMES.map(precinctName => ({ precinctName, closures: [{ id: `closure-${precinctName}`, location: '', type: '', duration: '', distance: '', reason: '', detour: '' }] }));
};
const initialPrecinctActivityData = (): PrecinctActivityData[] => {
    return PRECINCT_NAMES.map(precinctName => ({ precinctName, activities: [{ id: `activity-${precinctName}`, name: '', type: '', date: new Date().toISOString().split('T')[0], location: '', notes: '' }] }));
};
const initialPrecinctJudgmentData = (): PrecinctJudgmentData[] => PRECINCT_NAMES.map(precinctName => ({ precinctName, judgments: [] }));
const initialWeighStationJudgmentData = (): WeighStationJudgmentData[] => WEIGH_STATION_NAMES.map(stationName => ({ stationName, judgments: [] }));
const initialRadarJudgmentData = (): RadarJudgmentData[] => RADAR_LOCATIONS.map(radarName => ({ radarName, judgments: [] }));
const initialPasswordsState = (): Passwords => ({
    master: '',
    pages: Object.fromEntries(Object.keys(PAGE_ACCESS_CONFIG).map(key => [key, ''])),
    precincts: Object.fromEntries(PRECINCT_NAMES.map(name => [name, ''])),
    weighStations: Object.fromEntries(WEIGH_STATION_NAMES.map(name => [name, ''])),
    radars: Object.fromEntries(RADAR_LOCATIONS.map(name => [name, ''])),
});

const AppContent: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [precinctViolationsData, setPrecinctViolationsData] = useState<PrecinctViolationsData[]>(initialPrecinctViolationsData());
    const [weighStationsData, setWeighStationsData] = useState<WeighStationData[]>(initialWeighStationsData());
    const [precinctRadarData, setPrecinctRadarData] = useState<PrecinctRadarData[]>(initialPrecinctRadarData());
    const [precinctAccidentData, setPrecinctAccidentData] = useState<PrecinctAccidentData[]>(initialPrecinctAccidentData());
    const [precinctClosureData, setPrecinctClosureData] = useState<PrecinctClosureData[]>(initialPrecinctClosureData());
    const [precinctActivityData, setPrecinctActivityData] = useState<PrecinctActivityData[]>(initialPrecinctActivityData());
    const [precinctJudgmentData, setPrecinctJudgmentData] = useState<PrecinctJudgmentData[]>(initialPrecinctJudgmentData());
    const [weighStationJudgmentData, setWeighStationJudgmentData] = useState<WeighStationJudgmentData[]>(initialWeighStationJudgmentData());
    const [radarJudgmentData, setRadarJudgmentData] = useState<RadarJudgmentData[]>(initialRadarJudgmentData());
    
    const [selectedPrecinct, setSelectedPrecinct] = useState<string | null>(null);
    const [selectedWeighStation, setSelectedWeighStation] = useState<string | null>(null);
    const [selectedRadar, setSelectedRadar] = useState<string | null>(null);
    
    const [passwords, setPasswords] = useState<Passwords>(initialPasswordsState());
    const [isControlPanelUnlocked, setIsControlPanelUnlocked] = useState(false);
    const [authRequest, setAuthRequest] = useState<AuthRequest | null>(null);
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    
    useEffect(() => {
        setSelectedPrecinct(null);
        setSelectedWeighStation(null);
        setSelectedRadar(null);
    }, [currentPage]);

    const handleNavigateRequest = (page: Page) => {
        setIsLoading(true);
        setTimeout(() => {
            if (page === 'control_panel') {
                if (passwords.master && !isControlPanelUnlocked) {
                    setAuthRequest({ type: 'control_panel', id: 'control_panel', title: 'الوصول إلى لوحة التحكم' });
                } else {
                    setCurrentPage('control_panel');
                }
            } else {
                const pagePassword = passwords.pages[page];
                if (pagePassword) {
                    const pageTitle = PAGE_ACCESS_CONFIG[page as keyof typeof PAGE_ACCESS_CONFIG]?.title || 'Page Access';
                    setAuthRequest({ type: 'page', id: page, title: `الوصول إلى ${pageTitle}` });
                } else {
                    setCurrentPage(page);
                }
            }
            setIsLoading(false);
        }, 300);
    };
    
    const handlePrecinctSelectRequest = (precinctName: string) => {
        setIsLoading(true);
        setTimeout(() => {
            const precinctPassword = passwords.precincts[precinctName];
            if (precinctPassword) {
                setAuthRequest({ type: 'precinct', id: precinctName, title: `الوصول إلى قاطع ${precinctName}` });
            } else {
                setSelectedPrecinct(precinctName);
            }
            setIsLoading(false);
        }, 300);
    };

    const handleWeighStationSelectRequest = (stationName: string) => {
        setIsLoading(true);
        setTimeout(() => {
            const stationPassword = passwords.weighStations[stationName];
            if (stationPassword) {
                setAuthRequest({ type: 'weigh_station', id: stationName, title: `الوصول إلى محطة ${stationName}` });
            } else {
                setSelectedWeighStation(stationName);
            }
            setIsLoading(false);
        }, 300);
    };

    const handleRadarSelectRequest = (radarName: string) => {
        setIsLoading(true);
        setTimeout(() => {
            const radarPassword = passwords.radars[radarName];
            if (radarPassword) {
                setAuthRequest({ type: 'radar', id: radarName, title: `الوصول إلى رادار ${radarName}` });
            } else {
                setSelectedRadar(radarName);
            }
            setIsLoading(false);
        }, 300);
    };

    const handlePasswordSubmit = (enteredPassword: string) => {
        if (!authRequest) return;

        let correctPassword = '';
        switch(authRequest.type) {
            case 'control_panel':
                correctPassword = passwords.master;
                break;
            case 'page':
                correctPassword = passwords.pages[authRequest.id];
                break;
            case 'precinct':
                correctPassword = passwords.precincts[authRequest.id];
                break;
            case 'weigh_station':
                correctPassword = passwords.weighStations[authRequest.id];
                break;
            case 'radar':
                correctPassword = passwords.radars[authRequest.id];
                break;
        }

        if (enteredPassword === correctPassword) {
             switch(authRequest.type) {
                case 'control_panel':
                    setIsControlPanelUnlocked(true);
                    setCurrentPage('control_panel');
                    break;
                case 'page':
                    setCurrentPage(authRequest.id as Page);
                    break;
                case 'precinct':
                    setSelectedPrecinct(authRequest.id);
                    break;
                case 'weigh_station':
                    setSelectedWeighStation(authRequest.id);
                    break;
                case 'radar':
                    setSelectedRadar(authRequest.id);
                    break;
            }
            setAuthRequest(null);
            addToast('تم الدخول بنجاح', 'success');
        } else {
            addToast('كلمة المرور غير صحيحة', 'error');
        }
    };
    
    const renderPage = () => {
        switch (currentPage) {
            case 'home':
                return <HomePage navigate={handleNavigateRequest} />;
            case 'precincts':
                return <PrecinctsView navigate={handleNavigateRequest} allViolationsData={precinctViolationsData} updateViolationsData={(name, data) => setPrecinctViolationsData(p => p.map(pr => pr.precinctName === name ? {...pr, violations: data} : pr))} allRadarData={precinctRadarData} updateRadarData={(name, data) => setPrecinctRadarData(p => p.map(pr => pr.precinctName === name ? {...pr, violations: data} : pr))} allAccidentData={precinctAccidentData} updateAccidentData={(name, data) => setPrecinctAccidentData(p => p.map(pr => pr.precinctName === name ? {...pr, accidents: data} : pr))} allClosureData={precinctClosureData} updateClosureData={(name, data) => setPrecinctClosureData(p => p.map(pr => pr.precinctName === name ? {...pr, closures: data} : pr))} allActivityData={precinctActivityData} updateActivityData={(name, data) => setPrecinctActivityData(p => p.map(pr => pr.precinctName === name ? {...pr, activities: data} : pr))} allJudgmentData={precinctJudgmentData} updateJudgmentData={(name, data) => setPrecinctJudgmentData(p => p.map(pr => pr.precinctName === name ? {...pr, judgments: data} : pr))} selectedPrecinct={selectedPrecinct} onSelectPrecinct={handlePrecinctSelectRequest} onClearSelectedPrecinct={() => setSelectedPrecinct(null)} />;
            case 'weigh_stations':
                return <WeighStationsView navigate={handleNavigateRequest} allStationsData={weighStationsData} updateStationData={(name, data) => setWeighStationsData(p => p.map(s => s.name === name ? {...s, violations: data} : s))} allJudgmentData={weighStationJudgmentData} updateJudgmentData={(name, data) => setWeighStationJudgmentData(p => p.map(s => s.stationName === name ? {...s, judgments: data} : s))} selectedStation={selectedWeighStation} onSelectStation={handleWeighStationSelectRequest} onClearSelectedStation={() => setSelectedWeighStation(null)} />;
            case 'radars':
                return <RadarsView navigate={handleNavigateRequest} allJudgmentData={radarJudgmentData} updateJudgmentData={(name, data) => setRadarJudgmentData(p => p.map(r => r.radarName === name ? {...r, judgments: data} : r))} selectedRadar={selectedRadar} onSelectRadar={handleRadarSelectRequest} onClearSelectedRadar={() => setSelectedRadar(null)} />;
            case 'weigh_stations_summary':
                return <WeighStationsSummaryView navigate={handleNavigateRequest} data={weighStationsData} />;
            case 'radars_summary':
                return <RadarsSummaryView navigate={handleNavigateRequest} data={precinctRadarData.map(d => ({ name: d.precinctName, violations: d.violations }))} />;
            case 'reports':
                return <ReportsView navigate={handleNavigateRequest} allViolationsData={precinctViolationsData} />;
            case 'accidents_summary':
                return <AccidentsSummaryView navigate={handleNavigateRequest} data={precinctAccidentData.map(d => ({ name: d.precinctName, accidents: d.accidents }))} />;
            case 'closures_summary':
                return <ClosuresSummaryView navigate={handleNavigateRequest} data={precinctClosureData.flatMap(d => d.closures.filter(c => c.location || c.reason).map(c => ({ ...c, precinctName: d.precinctName })))} />;
            case 'activities_summary':
                return <ActivitiesSummaryView navigate={handleNavigateRequest} data={precinctActivityData.flatMap(d => d.activities.filter(a => a.name || a.location).map(a => ({ ...a, precinctName: d.precinctName })))} />;
            case 'judgments_summary':
                const allJudgments = [
                    ...precinctJudgmentData.flatMap(d => d.judgments.map(j => ({ ...j, sourceName: d.precinctName }))),
                    ...weighStationJudgmentData.flatMap(d => d.judgments.map(j => ({ ...j, sourceName: d.stationName }))),
                    ...radarJudgmentData.flatMap(d => d.judgments.map(j => ({ ...j, sourceName: d.radarName })))
                ];
                return <JudgmentsSummaryView navigate={handleNavigateRequest} data={allJudgments} />;
            case 'cars_and_licenses':
                return <CarsAndLicensesView navigate={handleNavigateRequest} />;
            case 'cars_and_licenses_summary':
                return <CarsAndLicensesSummaryView navigate={handleNavigateRequest} />;
            case 'control_panel':
                return <ControlPanel navigate={handleNavigateRequest} passwords={passwords} onPasswordsChange={setPasswords} />;
            default:
                return <HomePage navigate={handleNavigateRequest} />;
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#F9F9F9] text-[#2E2E2E]">
            {isLoading && <FullScreenLoader />}
            {authRequest && (
                <PasswordModal
                    title={authRequest.title}
                    onSuccess={handlePasswordSubmit}
                    onCancel={() => setAuthRequest(null)}
                />
            )}
            <Header />
            <main className="flex-grow container mx-auto p-4 md:p-8">
                {renderPage()}
            </main>
            <Footer />
        </div>
    );
};

const App: React.FC = () => (
    <ToastProvider>
        <AppContent />
    </ToastProvider>
);

export default App;