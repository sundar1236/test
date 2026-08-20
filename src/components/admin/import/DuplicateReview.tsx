import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, ArrowRight, ShieldAlert, Check, X, RefreshCw } from 'lucide-react';

export const DuplicateReview: React.FC = () => {
  const [duplicateItems, setDuplicateItems] = useState([
    {
      id: 'dup-01',
      matchType: 'exact',
      similarityScore: 100,
      incoming: {
        id: 'inc-001',
        text: 'A trader sells an article at a profit of 20%. If he had bought it at 10% less and sold it for ₹18 less, he would have gained 25%. Find the cost price of the article.',
        exam: 'SBI Clerk',
        topic: 'Profit & Loss',
        options: ['₹200', '₹240', '₹250', '₹280', '₹300'],
        answer: 'B'
      },
      existing: {
        id: 'q-quant-02',
        text: 'A trader sells an article at a profit of 20%. If he had bought it at 10% less and sold it for ₹18 less, he would have gained 25%. Find the cost price of the article.',
        exam: 'SBI Clerk Prelims 2023',
        topic: 'Profit & Loss',
        options: ['₹200', '₹240', '₹250', '₹280', '₹300'],
        answer: 'B',
        status: 'published'
      }
    },
    {
      id: 'dup-02',
      matchType: 'near',
      similarityScore: 89,
      incoming: {
        id: 'inc-002',
        text: 'If A can complete a piece of work in 12 days and B can finish it in 18 days, working together for 4 days, what fraction of work is left unfinished?',
        exam: 'RBI Assistant',
        topic: 'Time & Work',
        options: ['4/9', '5/9', '2/3', '1/3', '7/18'],
        answer: 'A'
      },
      existing: {
        id: 'q-quant-03',
        text: 'A can complete a work in 12 days, while B can complete the same work in 18 days. If they work together for 4 days, what fraction of the work remains?',
        exam: 'RBI Assistant 2022',
        topic: 'Time & Work',
        options: ['4/9', '5/9', '2/3', '1/3', '7/18'],
        answer: 'A',
        status: 'published'
      }
    }
  ]);

  const handleResolve = (dupId: string, action: string) => {
    setDuplicateItems(prev => prev.filter(item => item.id !== dupId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" /> Duplicate Resolution Queue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Compare incoming import questions against existing repository items. Choose to skip, merge metadata, or import anyway.
          </p>
        </div>
        <div className="text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-3.5 py-2 rounded-lg">
          {duplicateItems.length} Pending Resolution
        </div>
      </div>

      {duplicateItems.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-800">Duplicate Queue Clean!</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All flagged exact and near duplicate questions have been successfully reviewed and resolved.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {duplicateItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase ${
                    item.matchType === 'exact' ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
                  }`}>
                    {item.matchType} match ({item.similarityScore}%)
                  </span>
                  <span className="text-xs text-slate-500">ID: {item.id}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleResolve(item.id, 'skip')}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded text-xs font-semibold"
                  >
                    Skip Incoming
                  </button>
                  <button
                    onClick={() => handleResolve(item.id, 'merge')}
                    className="px-3 py-1.5 bg-blue-50 text-banking-blue hover:bg-blue-100 border border-blue-200 rounded text-xs font-semibold"
                  >
                    Merge Metadata
                  </button>
                  <button
                    onClick={() => handleResolve(item.id, 'import')}
                    className="px-3 py-1.5 bg-banking-blue text-white hover:bg-blue-800 rounded text-xs font-semibold"
                  >
                    Import Anyway
                  </button>
                </div>
              </div>

              {/* Side by side comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 text-xs p-5 gap-6">
                {/* Incoming */}
                <div className="space-y-3">
                  <div className="font-bold text-slate-800 flex justify-between">
                    <span>Incoming Import Question</span>
                    <span className="text-banking-blue">{item.incoming.exam}</span>
                  </div>
                  <p className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 font-medium text-slate-900">
                    {item.incoming.text}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    {item.incoming.options.map((opt, idx) => (
                      <div key={idx} className="p-1.5 bg-slate-50 rounded border border-slate-100">
                        <span className="font-bold">{String.fromCharCode(65 + idx)}:</span> {opt}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Existing */}
                <div className="space-y-3 pt-4 md:pt-0">
                  <div className="font-bold text-slate-800 flex justify-between">
                    <span>Existing Repository Question</span>
                    <span className="text-purple-600">{item.existing.exam}</span>
                  </div>
                  <p className="p-3 bg-purple-50/50 rounded-lg border border-purple-100 font-medium text-slate-900">
                    {item.existing.text}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    {item.existing.options.map((opt, idx) => (
                      <div key={idx} className="p-1.5 bg-slate-50 rounded border border-slate-100">
                        <span className="font-bold">{String.fromCharCode(65 + idx)}:</span> {opt}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
