import type * as React from 'react';

export type Page = 
  | 'home'
  | 'precincts'
  | 'weigh_stations'
  | 'radars'
  | 'reports'
  | 'control_panel'
  | 'radars_summary'
  | 'weigh_stations_summary'
  | 'accidents_summary'
  | 'closures_summary'
  | 'activities_summary'
  | 'judgments_summary'
  | 'cars_and_licenses'
  | 'cars_and_licenses_summary';

export type AuthTargetType = 'page' | 'control_panel' | 'precinct' | 'weigh_station' | 'radar';

export interface AuthRequest {
  type: AuthTargetType;
  id: string;
  title: string;
}

export interface ViolationData {
    id: number;
    name: string;
    morningCount: number;
    eveningCount: number;
    morningAmount: number;
    eveningAmount: number;
}

export interface PrecinctViolationsData {
    precinctName: string;
    violations: ViolationData[];
}


export interface Precinct {
    name: string;
    violations: ViolationData[];
}

export interface WeighStationViolationData {
    id: number;
    name: string;
    morningCount: number;
    eveningCount: number;
    morningAmount: number;
    eveningAmount: number;
}

export interface WeighStationData {
    name: string;
    violations: WeighStationViolationData[];
}

export interface RadarViolationData {
    id: number;
    name: string;
    morningCount: number;
    eveningCount: number;
    morningAmount: number;
    eveningAmount: number;
}

export interface PrecinctRadarData {
    precinctName: string;
    violations: RadarViolationData[];
}

export interface JudgmentDecision {
    id: string;
    decisionText: string;
    violatorName: string;
    fineAmount: number;
    violationDate: string;
    photoPreviewUrl?: string;
}

export interface AccidentCounts {
    men: number;
    women: number;

    children: number;
}

export interface AccidentAnalysis {
    id: string;
    accidentType: string;
    roadType: string;
    deaths: number;
    injuries: number;
    causes: string;
    time: string;
    date: string;
    analysis: string;
    conclusion: string;
}

export interface AccidentData {
    id: string;
    types: {
        pedestrian: number;
        collision: number;
        rollover: number;
        other: number;
    };
    deaths: AccidentCounts;
    injuries: AccidentCounts;
    analysis: AccidentAnalysis[];
}

export interface PrecinctAccidentData {
    precinctName: string;
    accidents: AccidentData;
}


export interface RoadClosureData {
    id: string;
    location: string;
    type: string;
    duration: string;
    distance: string;
    reason: string;
    detour: string;
}

export interface ActivityData {
    id: string;
    name: string;
    type: string;
    date: string;
    location: string;
    notes: string;
}

export interface PrecinctClosureData {
    precinctName: string;
    closures: RoadClosureData[];
}

export interface PrecinctActivityData {
    precinctName: string;
    activities: ActivityData[];
}

export interface PrecinctJudgmentData {
    precinctName: string;
    judgments: JudgmentDecision[];
}

export interface WeighStationJudgmentData {
    stationName: string;
    judgments: JudgmentDecision[];
}

// Fix: Add RadarJudgmentData interface to support radar judgments.
export interface RadarJudgmentData {
    radarName: string;
    judgments: JudgmentDecision[];
}

export interface PagePasswords {
    [key: string]: string;
}

export interface Passwords {
    master: string;
    pages: PagePasswords;
    precincts: { [key:string]: string };
    weighStations: { [key:string]: string };
    radars: { [key:string]: string };
}


// Fix: Centralized all global JSX intrinsic element declarations here to avoid overwriting base React types.
declare global {
    namespace JSX {
      interface IntrinsicElements {
        'lucide-landmark': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        'lucide-scale': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        'lucide-bar-chart-3': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        'lucide-settings': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        'lucide-arrow-right': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        'lucide-printer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        'lucide-eraser': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        'lucide-save': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        'lucide-upload': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        'lucide-pencil': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        'lucide-file-spreadsheet': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        'lucide-file-text': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        'lucide-radar': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        'lucide-camera': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        'lucide-car-crash': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        'lucide-cone': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        'lucide-book-marked': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        'lucide-gavel': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        'lucide-calendar-check': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        'lucide-plus': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        'lucide-search': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        'lucide-x': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        'lucide-file-bar-chart': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        // Fix: Added standard HTML element types to the global JSX.IntrinsicElements interface to prevent overwriting base React types. This resolves numerous JSX-related TypeScript errors throughout the application.
        div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
        main: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        header: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        footer: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        h1: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
        h2: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
        h3: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
        h4: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
        p: React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
        button: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
        span: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
        input: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
        label: React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
        table: React.DetailedHTMLProps<React.TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;
        thead: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
        tbody: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
        tfoot: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
        tr: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>;
        th: React.DetailedHTMLProps<React.ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement>;
        td: React.DetailedHTMLProps<React.TdHTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement>;
        textarea: React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
        video: React.DetailedHTMLProps<React.VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>;
        canvas: React.DetailedHTMLProps<React.CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>;
        form: React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
        svg: React.SVGProps<SVGSVGElement>;
        path: React.SVGProps<SVGPathElement>;
        // Fix: Add SVG circle element to JSX definitions to support its use in components.
        circle: React.SVGProps<SVGCircleElement>;
        br: React.DetailedHTMLProps<React.HTMLAttributes<HTMLBRElement>, HTMLBRElement>;
        small: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        caption: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableCaptionElement>, HTMLTableCaptionElement>;
        img: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
      }
    }
  }