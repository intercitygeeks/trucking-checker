'use client';

interface CompanyData {
    legalName: string;
    dbaName: string;
    usdot: string;
    mcNumber: string;
    entityType: string;
    status: 'BROKER' | 'CARRIER' | 'BOTH' | 'UNKNOWN' | string;
    powerUnits: string;
    drivers: string;
    authorizedForMotorVehicles?: boolean;
    phone?: string;
    address?: string;
    safetyRating?: string;
    safetyRatingDate?: string;
    usdotStatus?: string;
    operatingAuthorityStatus?: string;
}

interface CompanyResultProps {
    data: CompanyData;
}

export default function CompanyResult({ data }: CompanyResultProps) {
    const isAuthorizedForAutos = data.authorizedForMotorVehicles;
    const isDotActive = data.usdotStatus?.toUpperCase().includes('ACTIVE');

    return (
        <div className="w-full max-w-3xl mx-auto mt-12 animate-fade-in-up">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">

                {/* Header Section */}
                <div className="p-8 md:p-10 border-b border-slate-50 relative">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Company Overview
                            </span>
                            <h1 className="text-4xl md:text-5xl font-light text-slate-900 tracking-tight leading-tight">
                                {data.legalName}
                            </h1>
                            {data.dbaName && (
                                <p className="text-lg text-slate-500 font-normal">
                                    <span className="text-slate-400">DBA:</span> {data.dbaName}
                                </p>
                            )}
                        </div>

                        {/* IDs */}
                        <div className="flex flex-wrap gap-4 md:gap-6 mt-2 text-slate-900">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-md whitespace-nowrap">
                                <span className="text-xs font-bold text-slate-500 uppercase">USDOT</span>
                                <span className="text-sm font-mono font-bold">{data.usdot}</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-md whitespace-nowrap">
                                <span className="text-xs font-bold text-slate-500 uppercase">MC</span>
                                <span className="text-sm font-mono font-bold">{data.mcNumber}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2">

                    {/* Left Column: Contact & Identity */}
                    <div className="p-8 md:p-10 border-b md:border-b-0 md:border-r border-slate-50 bg-slate-[2px]">
                        <h3 className="text-sm font-semibold text-slate-900 mb-6 flex items-center gap-2">
                            <svg className="text-slate-400" style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Contact Details
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Address</p>
                                <p className="text-lg text-slate-700 font-medium leading-relaxed">
                                    {data.address || 'Address Not Available'}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Phone</p>
                                <p className="text-lg text-slate-700 font-medium font-mono">
                                    {data.phone || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Status & Authority */}
                    <div className="p-8 md:p-10 bg-slate-50/50">
                        <h3 className="text-sm font-semibold text-slate-900 mb-6 flex items-center gap-2">
                            <svg className="text-slate-400" style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Operating Status
                        </h3>

                        <div className="space-y-6">
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Entity Type</p>
                                    {data.entityType.toUpperCase().includes('CARRIER') ? (
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 shadow-sm">
                                            <svg className="flex-shrink-0" style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="font-bold">CARRIER</span>
                                        </div>
                                    ) : data.entityType.toUpperCase().includes('BROKER') ? (
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg border border-red-200 shadow-sm">
                                            <svg className="flex-shrink-0" style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            <span className="font-bold">BROKER</span>
                                        </div>
                                    ) : (
                                        <span className="text-base font-semibold text-slate-900">{data.entityType}</span>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">USDOT Status</p>
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${isDotActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                                        {data.usdotStatus || 'Unknown'}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-200/60">
                                <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Auto Transport Authority</p>
                                {isAuthorizedForAutos ? (
                                    <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                        <svg className="text-emerald-600 flex-shrink-0 mt-0.5" style={{ width: '24px', height: '24px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <div>
                                            <p className="font-bold text-emerald-900">Authorized for Autos</p>
                                            <p className="text-sm text-emerald-700 mt-0.5">This carrier is legally authorized to transport motor vehicles.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                                        <svg className="text-amber-600 flex-shrink-0 mt-0.5" style={{ width: '24px', height: '24px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <div>
                                            <p className="font-bold text-amber-900">Not Authorized</p>
                                            <p className="text-sm text-amber-800 mt-0.5">We could not confirm specific Motor Vehicle authorization.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Section: Fleet Stats & Link */}
                <div className="bg-slate-900 p-8 md:px-10 md:py-8 text-white flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex gap-12 divide-x divide-slate-800">
                        <div className="pr-4">
                            <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-1">Power Units</p>
                            <p className="text-3xl md:text-4xl font-light tracking-tight">{data.powerUnits || '0'}</p>
                        </div>
                        <div className="pl-12">
                            <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-1">Drivers</p>
                            <p className="text-3xl md:text-4xl font-light tracking-tight">{data.drivers || '0'}</p>
                        </div>
                    </div>

                    <a
                        href={`https://safer.fmcsa.dot.gov/query.asp?searchtype=ANY&query_type=queryCarrierSnapshot&query_param=USDOT&query_string=${data.usdot}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                    >
                        <span className="text-sm font-medium border-b border-transparent group-hover:border-white pb-0.5">View Complete Profile on SAFER</span>
                        <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    );
}
