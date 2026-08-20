import React, { useState } from 'react';
import { History, FileText, Download, CheckCircle2, AlertTriangle, Eye, Search } from 'lucide-react';

export const ImportHistory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const historyBatches = [
    { id: 'BATCH-847291', fileName: 'sbi_clerk_prelims_quant_2024.csv', format: 'CSV', importer: 'Alex Sharma', total: 250, success: 242, failed: 8, dupes: 12, date: '2024-05-18 14:30', status: 'Completed' },
    { id: 'BATCH-847285', fileName: 'ibps_clerk_reasoning_puzzles.json', format: 'JSON', importer: 'Alex Sharma', total: 120, success: 120, failed: 0, dupes: 4, date: '2024-05-18 12:15', status: 'Completed' },
    { id: 'BATCH-847210', fileName: 'rbi_assistant_english_vocab.csv', format: 'CSV', importer: 'Priya Verma', total: 500, success: 485, failed: 15, dupes: 30, date: '2024-05-17 09:45', status: 'Completed' },
    { id: 'BATCH-847190', fileName: 'rrb_clerk_mock_batch_04.csv', format: 'CSV', importer: 'Rahul Kumar', total: 100, success: 95, failed: 5, dupes: 2, date: '2024-05-16 17:20', status: 'Completed' },
    { id: 'BATCH-847050', fileName: 'sbi_mains_data_interpretation.json', format: 'JSON', importer: 'Alex Sharma', total: 80, success: 80, failed: 0, dupes: 0, date: '2024-05-15 11:00', status: 'Completed' },
  ];

  const filtered = historyBatches.filter(
    b => b.id.toLowerCase().includes(searchTerm.toLowerCase()) || b.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-banking-blue" /> Ingestion Audit & Import History
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete record of all CSV and JSON bulk import batches, success rates, duplicate decisions, and error logs.
          </p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Batch ID or file..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-banking-blue"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100 font-semibold text-xs text-slate-500 uppercase tracking-wider">
          Batch Records ({filtered.length})
        </div>
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-100/70 text-slate-500 font-semibold uppercase border-b border-slate-200">
            <tr>
              <th className="p-3.5">Batch ID</th>
              <th className="p-3.5">Source File</th>
              <th className="p-3.5">Format</th>
              <th className="p-3.5">Importer</th>
              <th className="p-3.5">Total Records</th>
              <th className="p-3.5">Success</th>
              <th className="p-3.5">Failed</th>
              <th className="p-3.5">Duplicates</th>
              <th className="p-3.5">Timestamp</th>
              <th className="p-3.5 text-right">Error Log</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50">
                <td className="p-3.5 font-mono font-medium text-slate-900">{b.id}</td>
                <td className="p-3.5 font-medium text-slate-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  {b.fileName}
                </td>
                <td className="p-3.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    b.format === 'CSV' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {b.format}
                  </span>
                </td>
                <td className="p-3.5 text-slate-600">{b.importer}</td>
                <td className="p-3.5 font-semibold text-slate-900">{b.total}</td>
                <td className="p-3.5 text-emerald-600 font-semibold">{b.success}</td>
                <td className="p-3.5 text-red-600 font-semibold">{b.failed}</td>
                <td className="p-3.5 text-amber-600 font-semibold">{b.dupes}</td>
                <td className="p-3.5 text-slate-500">{b.date}</td>
                <td className="p-3.5 text-right">
                  {b.failed > 0 ? (
                    <button
                      onClick={() => alert(`Downloading error report for batch ${b.id}...`)}
                      className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-medium text-xs bg-red-50 border border-red-200 px-2.5 py-1 rounded"
                    >
                      <Download className="w-3.5 h-3.5" /> Error Log ({b.failed})
                    </button>
                  ) : (
                    <span className="text-emerald-600 font-medium flex items-center justify-end gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Clean
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
