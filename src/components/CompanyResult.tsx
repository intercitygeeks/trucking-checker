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
        <div className="w-full max-w-4xl mx-auto mt-8 animate-fade-in-up">
            <div className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-slate-100/50 overflow-hidden ring-1 ring-slate-900/5">

                {/* Header Section */}
                <div className="p-8 md:p-12 border-b border-slate-50 relative bg-gradient-to-b from-white to-slate-50/20">
                    <div className="flex flex-col gap-6">
                        <div>
                            <span className="inline-block mb-3 text-[11px] font-bold text-slate-400 uppercase tracking-[0.25em] ml-1">
                                Company Overview
                            </span>
                            <h1 className="text-4xl md:text-6xl font-light text-slate-900 tracking-tighter leading-[1.1]">
                                {data.legalName}
                            </h1>
                            {data.dbaName && (
                                <p className="mt-3 text-lg text-slate-500 font-normal ml-1">
                                    <span className="text-slate-400">DBA:</span> {data.dbaName}
                                </p>
                            )}
                        </div>

                        {/* IDs - Crisp Sans Serif, no Mono */}
                        <div className="flex flex-wrap gap-4 md:gap-8 mt-2 items-center">
                            <div className="flex items-center gap-2.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-300"></span>
                                <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">USDOT</span>
                                <span className="text-xl font-medium text-slate-900">{data.usdot}</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-300"></span>
                                <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">MC</span>
                                <span className="text-xl font-medium text-slate-900">{data.mcNumber ? data.mcNumber.replace(/^(MC|MX)-?/i, '') : 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2">

                    {/* Left Column: Contact & Identity */}
                    <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-slate-50">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 bg-slate-50 rounded-full text-slate-400">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Contact Details</h3>
                        </div>

                        <div className="space-y-8">
                            <div className="group">
                                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Address</p>
                                <p className="text-lg text-slate-700 font-medium leading-relaxed group-hover:text-slate-900 transition-colors">
                                    {data.address || 'Address Not Available'}
                                </p>
                            </div>

                            <div className="group">
                                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Phone</p>
                                <p className="text-lg text-slate-700 font-medium group-hover:text-slate-900 transition-colors">
                                    {data.phone || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Status & Authority */}
                    <div className="p-8 md:p-12 bg-slate-50/30">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 bg-slate-50 rounded-full text-slate-400">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Operating Status</h3>
                        </div>

                        <div className="space-y-8">
                            <div className="flex flex-col gap-6">
                                <div>
                                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3">Entity Type</p>
                                    {data.entityType.toUpperCase().includes('CARRIER') ? (
                                        <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 shadow-sm">
                                            <span className="relative flex h-2.5 w-2.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                            </span>
                                            <span className="font-bold tracking-tight">Active Carrier</span>
                                        </div>
                                    ) : data.entityType.toUpperCase().includes('BROKER') ? (
                                        <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100 shadow-sm">
                                            <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
                                            <span className="font-bold tracking-tight">Active Broker</span>
                                        </div>
                                    ) : (
                                        <span className="text-base font-semibold text-slate-900">{data.entityType}</span>
                                    )}
                                </div>

                                <div>
                                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3">USDOT Status</p>
                                    <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold tracking-wide border ${isDotActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                        {data.usdotStatus || 'Unknown'}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-200">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Transport Authority</p>
                                    {isAuthorizedForAutos && (
                                        <div className="flex items-center gap-1.5 text-emerald-600">
                                            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-xs font-bold uppercase tracking-wider">Verified</span>
                                        </div>
                                    )}
                                </div>

                                {isAuthorizedForAutos ? (
                                    <div className="group flex items-start gap-4 p-5 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100 hover:border-emerald-100 hover:shadow-md transition-all duration-300">
                                        <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:border-emerald-100">
                                            <svg className="text-emerald-500 w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">Authorized for Autos</p>
                                            <p className="text-sm text-slate-500 mt-1 leading-relaxed">Legally authorized to transport motor vehicles.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-4 p-5 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                                        <div className="p-2 bg-white/50 rounded-xl">
                                            <svg className="text-amber-500 w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-bold text-amber-900">Not Authorized</p>
                                            <p className="text-sm text-amber-800 mt-1 leading-relaxed">Motor Vehicle authorization could not be confirmed.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Section: Fleet Stats & Link */}
                <div className="bg-slate-900 text-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800/50">
                        {/* Stats Group */}
                        <div className="p-8 md:p-10 flex items-center justify-around md:justify-start md:gap-20">
                            <div>
                                <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Power Units</p>
                                <p className="text-4xl md:text-5xl font-light tracking-tighter text-white">{data.powerUnits || '0'}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Drivers</p>
                                <p className="text-4xl md:text-5xl font-light tracking-tighter text-white">{data.drivers || '0'}</p>
                            </div>
                        </div>

                        {/* Link Group */}
                        <div className="p-8 md:p-10 flex items-center justify-center md:justify-end">
                            <a
                                href={`https://safer.fmcsa.dot.gov/query.asp?searchtype=ANY&query_type=queryCarrierSnapshot&query_param=USDOT&query_string=${data.usdot}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-4 text-slate-300 hover:text-white transition-all px-6 py-3 rounded-full border border-slate-700 hover:border-slate-500 hover:bg-slate-800/50"
                            >
                                <span className="text-sm font-semibold tracking-wide">View Full SAFER Profile</span>
                                <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" className="group-hover:translate-x-1 transition-transform duration-300">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center mt-8">
                <p className="text-xs text-slate-400 font-medium">
                    Data provided by FMCSA • Last Verified: {new Date().toLocaleDateString()}
                </p>
            </div>
        </div>
    );
}
