
'use client';

interface CompanyListItem {
    name: string;
    location: string;
    id: string;
    idType: string;
    url: string;
}

interface CompanyListProps {
    results: CompanyListItem[];
    onSelect: (item: CompanyListItem) => void;
}

export default function CompanyList({ results, onSelect }: CompanyListProps) {
    return (
        <div className="w-full max-w-xl mx-auto mt-8 animate-fade-in-up">
            <h2 className="text-sm font-semibold text-slate-500 mb-4 px-1 uppercase tracking-wider">Select a Company</h2>
            <div className="flex flex-col gap-2">
                {results.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => onSelect(item)}
                        className="group w-full text-left p-4 bg-white hover:bg-gray-50 border border-gray-100 rounded-xl transition-all duration-200 flex items-center justify-between"
                    >
                        <div>
                            <div className="text-base font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">
                                {item.name}
                            </div>
                            <div className="text-sm text-gray-500">
                                {item.location}
                            </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">
                                {item.idType}
                            </span>
                            <span className="text-xs text-slate-600 font-mono bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                {item.id}
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
