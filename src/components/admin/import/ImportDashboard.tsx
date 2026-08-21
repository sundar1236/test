import React, { useState } from 'react';
import { FileSpreadsheet, FileJson, AlertTriangle, CheckCircle, RefreshCw, Upload, FileText, Filter, Eye, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ImportDashboard: React.FC = () => {
  const [stats] = useState({
    totalImports: 24,
    totalQuestionsImported: 3840,
    failedQuestions: 42,
    duplicatesDetected: 118,
    pendingValidation: 215,
    publishedFromImports: 3465
  });

  const recentBatches = [
    { id: 'BATCH-847291', fileName: 'sbi_clerk_prelims_quant_2024.csv', format: 'CSV', total: 250, success: 242, failed: 8, dupes: 12, date: '10 mins ago', status: 'Completed' },
    { id: 'BATCH-847285', fileName: 'ibps_clerk_reasoning_puzzles.json', format: 'JSON', total: 120, success: 120, failed: 0, dupes: 4, date: '2 hours ago', status: 'Completed' },
    { id: 'BATCH-847210', fileName: 'rbi_assistant_english_vocab.csv', format: 'CSV', total: 500, success: 485, failed: 15, dupes: 30, date: '1 day ago', status: 'Completed' },
    { id: 'BATCH-847190', fileName: 'rrb_clerk_mock_batch_04.csv', format: 'CSV', total: 100, success: 95, failed: 5, dupes: 2, date: '2 days ago', status: 'Completed' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-banking-blue to-blue-700 rounded-xl p-6 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Bulk Import & Question Ingestion Center</h1>
          <p className="text-blue-100 text-sm mt-1">
            Safely import, validate, and manage thousands of SBI, IBPS, RBI, and RRB Clerk questions with automated duplicate detection.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Link
            to="/admin/import/csv"
            className="flex items-center gap-2 bg-white text-banking-blue px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            CSV Import
          </Link>
          <Link
            to="/admin/import/json"
            className="flex items-center gap-2 bg-blue-800 text-white border border-blue-400/30 px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-900 transition-colors shadow-sm"
          >
            <FileJson className="w-4 h-4" />
            JSON Import
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase text-slate-500 mb-1">Total Batches</div>
          <div className="text-2xl font-bold text-slate-900">{stats.totalImports}</div>
          <div className="text-xs text-slate-500 mt-1">Processed</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase text-slate-500 mb-1">Imported</div>
          <div className="text-2xl font-bold text-emerald-600">{stats.totalQuestionsImported.toLocaleString()}</div>
          <div className="text-xs text-emerald-700 mt-1">Questions ingested</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase text-slate-500 mb-1">Failed Records</div>
          <div className="text-2xl font-bold text-red-600">{stats.failedQuestions}</div>
          <div className="text-xs text-red-700 mt-1">Validation errors</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase text-slate-500 mb-1">Duplicates</div>
          <div className="text-2xl font-bold text-amber-600">{stats.duplicatesDetected}</div>
          <div className="text-xs text-amber-700 mt-1">Flagged by engine</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase text-slate-500 mb-1">Pending Drafts</div>
          <div className="text-2xl font-bold text-blue-600">{stats.pendingValidation}</div>
          <div className="text-xs text-blue-700 mt-1">Awaiting review</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase text-slate-500 mb-1">Published</div>
          <div className="text-2xl font-bold text-purple-600">{stats.publishedFromImports.toLocaleString()}</div>
          <div className="text-xs text-purple-700 mt-1">Live in exams</div>
        </div>
      </div>

      {/* Sub Navigation Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-banking-blue transition-all">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-banking-blue flex items-center justify-center mb-3">
            <Upload className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-900">CSV & Excel Ingestion</h3>
          <p className="text-xs text-slate-600 mt-1 mb-4">
            Upload CSV spreadsheets with field mapping, error highlighting, and real-time duplicate checks.
          </p>
          <Link
            to="/admin/import/csv"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-banking-blue hover:underline"
          >
            Launch CSV Importer <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-purple-500 transition-all">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
            <FileJson className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-900">Structured JSON Ingestion</h3>
          <p className="text-xs text-slate-600 mt-1 mb-4">
            Import structured question bank packages with strict schema validation and quality scoring.
          </p>
          <Link
            to="/admin/import/json"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:underline"
          >
            Launch JSON Importer <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-amber-500 transition-all">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-900">Duplicate Resolution Queue</h3>
          <p className="text-xs text-slate-600 mt-1 mb-4">
            Review near and exact match duplicate questions using side-by-side comparison tools.
          </p>
          <Link
            to="/admin/import/duplicates"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:underline"
          >
            Review Duplicates (12) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Recent Import Batches */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-slate-900 text-lg">Recent Import Batches</h2>
            <p className="text-xs text-slate-500 mt-0.5">Audit history of recent bulk question ingestion runs</p>
          </div>
          <Link
            to="/admin/import/history"
            className="text-xs font-medium text-banking-blue hover:underline flex items-center gap-1"
          >
            View Full Import History
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-100">
              <tr>
                <th className="p-3.5">Batch ID</th>
                <th className="p-3.5">File Name</th>
                <th className="p-3.5">Format</th>
                <th className="p-3.5">Total Records</th>
                <th className="p-3.5">Success</th>
                <th className="p-3.5">Failed</th>
                <th className="p-3.5">Duplicates</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentBatches.map((batch) => (
                <tr key={batch.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-mono font-medium text-slate-900">{batch.id}</td>
                  <td className="p-3.5 font-medium text-slate-800 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    {batch.fileName}
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      batch.format === 'CSV' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {batch.format}
                    </span>
                  </td>
                  <td className="p-3.5 font-medium">{batch.total}</td>
                  <td className="p-3.5 text-emerald-600 font-medium">{batch.success}</td>
                  <td className="p-3.5 text-red-600 font-medium">{batch.failed}</td>
                  <td className="p-3.5 text-amber-600 font-medium">{batch.dupes}</td>
                  <td className="p-3.5 text-slate-500">{batch.date}</td>
                  <td className="p-3.5 text-right">
                    <Link
                      to={`/admin/import/history?batch=${batch.id}`}
                      className="inline-flex items-center gap-1 text-banking-blue hover:text-blue-800 font-medium text-xs"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
