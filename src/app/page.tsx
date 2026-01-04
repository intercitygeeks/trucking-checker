
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

  // Lifted state
  const [query, setQuery] = useState('');
  const [type, setType] = useState<'NAME' | 'MC' | 'DOT'>('NAME');

  const handleSearch = async (captchaToken: string | null) => {
    setIsLoading(true);
    setError('');
    setData(null);
    setListResults(null);

    try {
      if (!captchaToken) {
        throw new Error('Please complete the captcha.');
      }

      const res = await fetch(`/api/check-company?query=${encodeURIComponent(query)}&type=${type}&token=${captchaToken}`);
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to fetch data');
      }

      if (result.type === 'LIST') {
        if (result.results && result.results.length > 0) {
          setListResults(result.results);
        } else {
          setError('No results found. Please check your query.');
        }
      } else if (result.type === 'SNAPSHOT') {
        setData(result.data);
      } else {
        setError('Unexpected response from server.');
      }

    } catch (err: any) {
      setError(err.message || 'An error occurred while searching.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCompany = (item: any) => {
    if (item.id && (item.idType === 'DOT' || item.idType === 'MC')) {
      // Pre-fill the form and ask user to verify captcha
      setQuery(item.id);
      setType(item.idType);
      setListResults(null); // Clear list to show form clearly
      setListResults(null); // Clear list to show form clearly
      setError('found'); // Special flag to show blue box instead of red? Or just clearer text.
      // Actually, let's just make the error state accept a generic message, but maybe prefix it so we can style it? 
      // User complaint was it feels like an error.
      // Let's just change the text for now to be very specific explanation.
      setError('Company Selected. Please verify captcha to view full details.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
            onSearch={handleSearch}
            isLoading={isLoading}
            query={query}
            setQuery={setQuery}
            type={type}
            setType={setType}
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
