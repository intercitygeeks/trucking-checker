
'use client';

import { useState } from 'react';
import SearchForm from '@/components/SearchForm';
import CompanyResult from '@/components/CompanyResult';
import CompanyList from '@/components/CompanyList';

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [listResults, setListResults] = useState<any[] | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  // Lifted state
  const [query, setQuery] = useState('');
  const [type, setType] = useState<'NAME' | 'MC' | 'DOT'>('NAME');

  const executeSearch = async (overrideQuery: string, overrideType: 'NAME' | 'MC' | 'DOT', captchaToken: string | null) => {
    setIsLoading(true);
    setError('');
    setData(null);
    setListResults(null);

    // Scroll to top to show progress
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const q = overrideQuery || query;
      const t = overrideType || type;

      if (!sessionToken && !captchaToken) throw new Error('Please complete the captcha.');

      const tokenParam = captchaToken ? `&token=${captchaToken}` : '';
      const sessionParam = sessionToken ? `&sessionToken=${encodeURIComponent(sessionToken)}` : '';

      const res = await fetch(`/api/check-company?query=${encodeURIComponent(q)}&type=${t}${tokenParam}${sessionParam}`);
      const result = await res.json();

      if (!res.ok) {
        if (res.status === 403 && sessionToken) {
          setSessionToken(null);
          throw new Error('Session expired. Please verify captcha again.');
        }
        throw new Error(result.error || 'Failed to fetch data');
      }

      if (result.sessionToken) setSessionToken(result.sessionToken);

      if (result.type === 'LIST') {
        if (result.results && result.results.length > 0) setListResults(result.results);
        else setError('No results found. Please check your query.');
      } else if (result.type === 'SNAPSHOT') {
        setData(result.data);
      } else {
        setError('Unexpected response from server.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (captchaToken: string | null) => {
    await executeSearch(query, type, captchaToken);
  };

  const handleSelectCompany = (item: any) => {
    if (item.id && (item.idType === 'DOT' || item.idType === 'MC')) {
      setQuery(item.id);
      setType(item.idType);

      if (sessionToken) {
        executeSearch(item.id, item.idType, null);
      } else {
        setListResults(null);
        setError('Company Selected. Please verify captcha to view full details.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      if (item.url) {
        setError("Could not determine ID for this company. Please try searching by specific DOT number.");
      }
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center p-6 relative">

      <div className="w-full max-w-3xl z-10 flex flex-col items-center mt-12 mb-12">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-light text-slate-900 tracking-tight mb-4">
            Trucking Company Checker
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto font-medium">
            Verify FMCSA status instantly. Check <span className="text-slate-900 font-semibold">Broker</span> vs <span className="text-emerald-600 font-semibold">Carrier</span> authority.
          </p>
        </div>

        <div className="w-full animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <SearchForm
            onSearch={(token) => executeSearch(query, type, token)}
            isLoading={isLoading}
            query={query}
            setQuery={setQuery}
            type={type}
            setType={setType}
            isVerified={!!sessionToken}
          />
        </div>

        {error && (
          <div className={`mt-8 p-4 rounded-xl max-w-lg text-center animate-fade-in-up shadow-sm border ${error.includes('Selected')
            ? 'bg-blue-50 border-blue-200 text-blue-800'
            : 'bg-red-50 border-red-200 text-red-700'
            }`}>
            {error}
          </div>
        )}

        {listResults && !data && (
          <CompanyList results={listResults} onSelect={handleSelectCompany} />
        )}

        {data && <CompanyResult data={data} />}
      </div>
    </main>
  );
}
