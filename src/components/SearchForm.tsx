
'use client';

import { useState, useRef } from 'react';
import ReCAPTCHA from "react-google-recaptcha";

type SearchType = 'NAME' | 'MC' | 'DOT';

interface SearchFormProps {
    onSearch: (captchaToken: string | null) => void;
    isLoading: boolean;
    query: string;
    setQuery: (q: string) => void;
    type: SearchType;
    setType: (t: SearchType) => void;
}

export default function SearchForm({ onSearch, isLoading, query, setQuery, type, setType, isVerified = false }: SearchFormProps & { isVerified?: boolean }) {
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // If verified, allow search without captchaToken
        if (query.trim()) {
            if (isVerified || captchaToken) {
                onSearch(captchaToken);

                // Always reset captcha after submission because tokens are one-time use.
                // If the search fails, the user needs a fresh token anyway.
                // If it succeeds, this component will re-render or be unmounted, no harm done.
                if (recaptchaRef.current) {
                    recaptchaRef.current.reset();
                    setCaptchaToken(null);
                }
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
            <div className="flex flex-col space-y-8">

                {/* Type Selection - Minimalist Pill Tabs */}
                <div className="flex justify-center">
                    <div className="inline-flex p-1.5 bg-slate-100/80 backdrop-blur-sm rounded-full border border-slate-200/50 relative">
                        {(['NAME', 'DOT', 'MC'] as SearchType[]).map((t) => (
                            <label key={t} className="relative cursor-pointer">
                                <input
                                    type="radio"
                                    name="searchType"
                                    value={t}
                                    checked={type === t}
                                    onChange={() => setType(t)}
                                    className="sr-only"
                                />
                                <div className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${type === t
                                    ? 'bg-white text-slate-900 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] ring-1 ring-slate-900/5 scale-100'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}>
                                    {t === 'MC' ? 'MC Number' : t === 'DOT' ? 'USDOT' : 'Company Name'}
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Input Area */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 via-slate-100 to-blue-100 rounded-full opacity-0 group-hover:opacity-100 transition duration-500 blur-md"></div>
                    <div className="relative">
                        <input
                            type="text"
                            id="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={type === 'NAME' ? "Enter Company Name..." : type === 'MC' ? "Enter MC/MX Number..." : "Enter USDOT Number..."}
                            className="w-full pl-8 pr-6 py-5 bg-white border border-slate-200 rounded-full text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all font-medium text-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)]"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-slate-50 rounded-full text-slate-300">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Captcha - Only show if NOT verified */}
            {!isVerified ? (
                <div className="flex justify-center mt-10 transform scale-90 md:scale-100 transition-transform origin-top">
                    <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
                        onChange={(token) => setCaptchaToken(token)}
                        theme="light"
                    />
                </div>
            ) : (
                <div className="flex justify-center mt-8">
                    <div className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-50 rounded-full border border-emerald-100 text-emerald-700 animate-fade-in-up">
                        <div className="bg-emerald-500 rounded-full p-0.5">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <span className="font-semibold text-sm tracking-tight">Verified Session Active</span>
                    </div>
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading || !query.trim() || (!captchaToken && !isVerified)}
                className="w-full mt-10 py-5 bg-slate-900 hover:bg-slate-800 text-white text-lg font-bold tracking-wide rounded-full transform transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center shadow-xl shadow-slate-900/20"
            >
                {isLoading ? (
                    <span className="flex items-center gap-3">
                        <svg className="animate-spin h-5 w-5 text-white/90" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying...
                    </span>
                ) : (
                    'Verify Company'
                )}
            </button>
        </form>
    );
}
