
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

      {/* SEO Content Section */}
      <section className="w-full max-w-4xl mt-24 mb-16 text-slate-600 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <article className="prose prose-slate max-w-none">
          <h2 className="text-2xl font-light text-slate-900 mb-6 tracking-tight">Why Verify Your Auto Transport Carrier?</h2>
          <p className="mb-6 leading-relaxed">
            Shipping a vehicle is a major decision, and the auto transport industry is filled with both legitimate carriers and unlicensed intermediaries. Using a <strong>Free Auto Transport Carrier Verification Tool</strong> is the smartest first step to protecting your vehicle. Our tool connects directly to the <strong>FMCSA (Federal Motor Carrier Safety Administration)</strong> database to provide real-time snapshots of any company's legal operating status.
          </p>

          <div className="grid md:grid-cols-2 gap-12 my-12">
            <div>
              <h3 className="text-xl font-medium text-slate-900 mb-3">Carrier vs. Broker: What's the Difference?</h3>
              <p className="leading-relaxed text-sm">
                <strong>Carriers</strong> own the trucks and physically move your car. They are directly responsible for the safety of your vehicle and hold the insurance coverage.
              </p>
              <p className="leading-relaxed text-sm mt-3">
                <strong>Brokers</strong> are sales agents who do not own trucks. They charge a fee to find a carrier for you. While many are legitimate, some may misrepresent themselves as carriers.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-medium text-slate-900 mb-3">What This Tool Checks</h3>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li><strong>Operating Authority:</strong> Validates if the company is legally allowed to cross state lines.</li>
                <li><strong>Insurance Status:</strong> Checks for active Bodily Injury & Property Damage (BIPD) coverage.</li>
                <li><strong>Safety Rating:</strong> Displays the official government safety grade (Satisfactory, Conditional, or Unrated).</li>
                <li><strong>Fleet Size:</strong> Reveals how many power units (trucks) and drivers the company actually employs.</li>
              </ul>
            </div>
          </div>

          <h2 className="text-2xl font-light text-slate-900 mb-6 tracking-tight">How to Spot a Double-Brokering Scam</h2>
          <p className="mb-6 leading-relaxed">
            "Double-brokering" occurs when a company accepts a payment to ship your car but then secretly re-posts the job to another cheaper carrier, pocketing the difference. This leaves you with no knowledge of who actually has your car and often voids insurance coverage. Always check the <strong>Power Units</strong> count on this tool. If a "Carrier" has 0 trucks or 0 drivers, they are likely just a broker in disguise.
          </p>

          <p className="text-sm text-slate-400 italic mt-12 border-t border-slate-100 pt-6">
            Disclaimer: Data provided via FMCSA SAFER System. Intercity Lines Inc. provides this free lookup tool as a public service to promote safety in the auto transport industry.
          </p>
        </article>
      </section>
    </main>
  );
}
