import React, { useState } from 'react';
import { FileJson, Upload, CheckCircle2, AlertCircle, RefreshCw, Code, Download } from 'lucide-react';
import { importService, ImportPreviewSummary } from '../../../services/importService';
import { DuplicateResolution } from '../../../services/duplicateDetectionService';

export const JSONImport: React.FC = () => {
  const [jsonText, setJsonText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [preview, setPreview] = useState<ImportPreviewSummary | null>(null);
  const [resolutions, setResolutions] = useState<Record<number, DuplicateResolution>>({});
  const [commitResult, setCommitResult] = useState<any | null>(null);
  const [isCommitting, setIsCommitting] = useState<boolean>(false);

  const sampleJSON = JSON.stringify(
    {
      exam: "sbi-clerk",
      phase: "prelims",
      section: "Quantitative Aptitude",
      questions: [
        {
          questionText: "If 15 men can complete a project in 20 days, how many days will 25 men take to complete the same work?",
          optionA: "10 days",
          optionB: "12 days",
          optionC: "14 days",
          optionD: "16 days",
          optionE: "18 days",
          correctAnswer: "B",
          explanation: "M1 * D1 = M2 * D2. 15 * 20 = 25 * D2 => 300 = 25 * D2 => D2 = 12 days.",
          topicTitle: "Time & Work",
          difficulty: "easy",
          source: "SBI Clerk Prelims 2023",
          year: 2023
        },
        {
          questionText: "Which number comes next in the sequence: 3, 7, 15, 31, 63, ?",
          optionA: "125",
          optionB: "127",
          optionC: "129",
          optionD: "131",
          optionE: "135",
          correctAnswer: "B",
          explanation: "Pattern: x * 2 + 1. 63 * 2 + 1 = 127.",
          topicTitle: "Number Series",
          difficulty: "easy",
          source: "SBI Clerk 2023",
          year: 2023
        }
      ]
    },
    null,
    2
  );

  const handleParseJSON = async (contentToParse: string) => {
    setLoading(true);
    setCommitResult(null);

    try {
      const records = importService.parseJSONText(contentToParse);
      const summary = await importService.previewImport(records, 'json_package.json', 'json');
      setPreview(summary);

      const initResolutions: Record<number, DuplicateResolution> = {};
      summary.records.forEach(r => {
        initResolutions[r.rowNumber] = r.duplicateResult.isDuplicate ? 'skip' : 'import_anyway';
      });
      setResolutions(initResolutions);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setJsonText(text);
      handleParseJSON(text);
    };
    reader.readAsText(file);
  };

  const loadSample = () => {
    setJsonText(sampleJSON);
    handleParseJSON(sampleJSON);
  };

  const handleCommit = async () => {
    if (!preview) return;
    setIsCommitting(true);
    try {
      const res = await importService.commitImportBatch(preview, resolutions, 'a1', 'Admin Alex');
      setCommitResult(res);
    } catch (e) {
      alert(`Commit Error: ${(e as Error).message}`);
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileJson className="w-5 h-5 text-purple-600" /> JSON Bulk Question Ingestion
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Import structured question bank packages adhering to the platform JSON schema.
          </p>
        </div>
        <button
          onClick={loadSample}
          className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-3.5 py-2 rounded-lg hover:bg-purple-100 transition-colors"
        >
          <Code className="w-4 h-4" /> Load Sample JSON Payload
        </button>
      </div>

      {!preview && !commitResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* File Drag / Drop */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-semibold text-slate-800 text-sm">Option A: Upload JSON File</h2>
            <div className="border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-xl p-8 text-center transition-all cursor-pointer bg-slate-50">
              <input
                type="file"
                accept=".json"
                id="json-file-input"
                className="hidden"
                onChange={handleFileUpload}
              />
              <label htmlFor="json-file-input" className="cursor-pointer space-y-2 block">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-800">Select JSON package file</p>
                <p className="text-[11px] text-slate-500">Must follow BankClerk official JSON schema</p>
              </label>
            </div>
          </div>

          {/* Direct Editor */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-slate-800 text-sm">Option B: Paste Raw JSON</h2>
              <button
                onClick={() => handleParseJSON(jsonText)}
                disabled={!jsonText.trim() || loading}
                className="text-xs bg-purple-600 text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? 'Validating...' : 'Validate & Preview'}
              </button>
            </div>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder="Paste JSON object here..."
              rows={8}
              className="w-full font-mono text-xs p-3 border border-slate-300 rounded-lg bg-slate-900 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      )}

      {/* Success Commit Banner */}
      {commitResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-emerald-900 space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            <div>
              <h2 className="text-lg font-bold">JSON Import Batch Committed Successfully!</h2>
              <p className="text-xs text-emerald-700">Batch ID: {commitResult.batchNumber}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 bg-white p-4 rounded-lg border border-emerald-200 text-center text-xs">
            <div>
              <div className="text-slate-500 font-medium uppercase">Ingested Drafts</div>
              <div className="text-xl font-bold text-emerald-600 mt-0.5">{commitResult.successCount}</div>
            </div>
            <div>
              <div className="text-slate-500 font-medium uppercase">Duplicates Handled</div>
              <div className="text-xl font-bold text-amber-600 mt-0.5">{commitResult.duplicateCount}</div>
            </div>
            <div>
              <div className="text-slate-500 font-medium uppercase">Failed Records</div>
              <div className="text-xl font-bold text-red-600 mt-0.5">{commitResult.failureCount}</div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => { setPreview(null); setCommitResult(null); setJsonText(''); }}
              className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-xs font-medium hover:bg-slate-50"
            >
              Import Another JSON Batch
            </button>
          </div>
        </div>
      )}

      {/* Preview Table */}
      {preview && !commitResult && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
            <div>
              <h2 className="font-bold text-slate-900 text-base">JSON Dry-Run Preview Summary</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Total: {preview.totalRecords} | Valid: {preview.validCount} | Duplicates: {preview.exactDuplicatesCount + preview.nearDuplicatesCount}
              </p>
            </div>
            <button
              onClick={handleCommit}
              disabled={isCommitting}
              className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2 rounded-lg font-semibold text-xs hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {isCommitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Commit JSON Batch
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Question Statement</th>
                  <th className="p-3">Topic / Difficulty</th>
                  <th className="p-3">Quality Score</th>
                  <th className="p-3">Duplicate Check</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {preview.records.map((r) => (
                  <tr key={r.rowNumber} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-slate-500">{r.rowNumber}</td>
                    <td className="p-3 max-w-md">
                      <p className="font-medium text-slate-900">{r.rawData.questionText}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Correct Option: {r.rawData.correctAnswer}</p>
                    </td>
                    <td className="p-3">
                      <span className="font-medium text-slate-800">{r.rawData.topicTitle}</span>
                      <div className="text-[10px] text-slate-500 uppercase">{r.rawData.difficulty}</div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {r.qualityScore}%
                      </span>
                    </td>
                    <td className="p-3">
                      {r.duplicateResult.isDuplicate ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                          {r.duplicateResult.duplicateType} ({r.duplicateResult.similarityScore}%)
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-medium">Unique</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
