
'use client';

import { useState } from 'react';
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // If verified, allow search without captchaToken
        if (query.trim()) {
            if (isVerified || captchaToken) {
                onSearch(captchaToken);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex flex-col space-y-6">

                {/* Type Selection */}
                <div className="text-center">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 text-[#000099]">Search Criteria</h2>
                    <div className="flex justify-center gap-6 items-center bg-blue-50/50 p-6 rounded-lg border border-blue-100">
                        {(['NAME', 'DOT', 'MC'] as SearchType[]).map((t) => (
                            <label key={t} className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="searchType"
                                    value={t}
                                    checked={type === t}
                                    onChange={() => setType(t)}
                                    className="w-5 h-5 text-blue-900 focus:ring-blue-900 border-gray-300"
                                />
                                <span className={`text-lg transition-colors ${type === t ? 'font-bold text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>
                                    {t === 'MC' ? 'MC/MX Number' : t === 'DOT' ? 'USDOT Number' : 'Name'}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col space-y-2">
                    <div className="relative">
                        <input
                            type="text"
                            id="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={type === 'NAME' ? "Enter Company Name..." : type === 'MC' ? "Enter MC/MX Number..." : "Enter USDOT Number..."}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900 transition-all font-medium text-lg"
                        />
                    </div>
                </div>
            </div>

            {/* Captcha - Only show if NOT verified */}
            {!isVerified ? (
                <div className="flex justify-center mt-6">
                    <ReCAPTCHA
                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
                        onChange={(token) => setCaptchaToken(token)}
                    />
                </div>
            ) : (
                <div className="flex justify-center mt-6 text-green-700 bg-green-50 py-2 rounded-lg border border-green-100 items-center gap-2 px-4 shadow-sm animate-fade-in-up">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-sm">Secure Session Active</span>
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading || !query.trim() || (!captchaToken && !isVerified)}
                className="w-full mt-6 py-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transform transition-all duration-200 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center text-base"
            >
                {isLoading ? (
                    <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Searching...
                    </span>
                ) : (
                    'Search Registry'
                )}
            </button>
        </form>
    );
}
