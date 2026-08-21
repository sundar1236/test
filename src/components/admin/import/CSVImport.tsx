import React, { useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, ShieldAlert, ArrowRight, RefreshCw, Download, FileText } from 'lucide-react';
import { importService, ImportPreviewSummary, ProcessedRecord } from '../../../services/importService';
import { DuplicateResolution } from '../../../services/duplicateDetectionService';

export const CSVImport: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [preview, setPreview] = useState<ImportPreviewSummary | null>(null);
  const [resolutions, setResolutions] = useState<Record<number, DuplicateResolution>>({});
  const [commitResult, setCommitResult] = useState<any | null>(null);
  const [isCommitting, setIsCommitting] = useState<boolean>(false);

  const sampleCSV = `Question Text,Option A,Option B,Option C,Option D,Option E,Correct Answer,Explanation,Exam,Phase,Section,Topic,Difficulty,Source,Year
"What is 20% of 450?","80","90","100","110","120","B","20% of 450 = 0.20 * 450 = 90.","sbi-clerk","prelims","Quantitative Aptitude","Percentage","easy","SBI Clerk 2023",2023
"Which letter replaces the question mark in series A, C, F, J, O, ?","T","U","V","W","X","U","The position gaps increase by +2, +3, +4, +5, +6. O + 6 = U.","ibps-clerk","prelims","Reasoning Ability","Letter Series","moderate","IBPS Clerk 2023",2023
"Find the grammatically correct sentence.","He don't know the answer","He doesn't knows the answer","He doesn't know the answer","He not know the answer","He isn't knowing","C","Subject 'He' requires third-person singular auxiliary 'doesn't' followed by base verb 'know'.","rbi-assistant","prelims","English Language","Grammar","easy","RBI Asst 2022",2022`;

  const handleFileUpload = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setLoading(true);
    setCommitResult(null);

    try {
      const text = await uploadedFile.text();
      const rawRecords = importService.parseCSVText(text);
      const summary = await importService.previewImport(rawRecords, uploadedFile.name, 'csv');

      setPreview(summary);

      // Initialize duplicate resolutions
      const initResolutions: Record<number, DuplicateResolution> = {};
      summary.records.forEach(r => {
        if (r.duplicateResult.isDuplicate) {
          initResolutions[r.rowNumber] = 'skip';
        } else {
          initResolutions[r.rowNumber] = 'import_anyway';
        }
      });
      setResolutions(initResolutions);
    } catch (err) {
      alert(`CSV Parsing Error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const downloadSampleCSV = () => {
    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bank_clerk_question_import_sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadErrorCSV = () => {
    if (!preview) return;
    const csvContent = importService.generateErrorCSV(preview.records);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `import_errors_${preview.batchNumber}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResolutionChange = (rowNum: number, res: DuplicateResolution) => {
    setResolutions(prev => ({ ...prev, [rowNum]: res }));
  };

  const handleCommitBatch = async () => {
    if (!preview) return;
    setIsCommitting(true);
    try {
      const result = await importService.commitImportBatch(preview, resolutions, 'a1', 'Admin Alex');
      setCommitResult(result);
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
            <FileSpreadsheet className="w-5 h-5 text-banking-blue" /> CSV Bulk Question Import
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Upload questions in CSV format. Preview data, inspect field errors, and resolve duplicates before publishing to drafts.
          </p>
        </div>
        <button
          onClick={downloadSampleCSV}
          className="flex items-center gap-1.5 text-xs font-semibold text-banking-blue bg-blue-50 border border-blue-200 px-3.5 py-2 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Download className="w-4 h-4" /> Download CSV Template
        </button>
      </div>

      {!preview && !commitResult && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-slate-300 hover:border-banking-blue rounded-xl p-10 bg-white text-center transition-all cursor-pointer shadow-sm"
        >
          <input
            type="file"
            accept=".csv"
            id="csv-input"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          />
          <label htmlFor="csv-input" className="cursor-pointer space-y-3 block">
            <div className="w-14 h-14 bg-blue-50 text-banking-blue rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">Drag and drop your CSV file here, or browse</p>
              <p className="text-xs text-slate-500 mt-1">Supports SBI, IBPS, RBI, and RRB Clerk questions with option choices</p>
            </div>
            {loading && (
              <div className="flex items-center justify-center gap-2 text-banking-blue text-xs font-semibold mt-2">
                <RefreshCw className="w-4 h-4 animate-spin" /> Parsing file and analyzing duplicates...
              </div>
            )}
          </label>
        </div>
      )}

      {/* Success Commit Banner */}
      {commitResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-emerald-900 space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            <div>
              <h2 className="text-lg font-bold">Import Batch Committed Successfully!</h2>
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
              onClick={() => { setPreview(null); setCommitResult(null); setFile(null); }}
              className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-xs font-medium hover:bg-slate-50"
            >
              Import Another File
            </button>
            <a
              href="/admin/questions?status=draft"
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-emerald-700"
            >
              View Ingested Drafts →
            </a>
          </div>
        </div>
      )}

      {/* Dry Run Preview Summary */}
      {preview && !commitResult && (
        <div className="space-y-6">
          {/* Summary Cards Bar */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-banking-blue" /> Batch Dry-Run Inspection
                  <span className="text-xs font-mono font-normal bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    {preview.batchNumber}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">File: {preview.fileName} ({preview.totalRecords} records)</p>
              </div>

              <div className="flex items-center gap-3">
                {preview.invalidCount > 0 && (
                  <button
                    onClick={downloadErrorCSV}
                    className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100"
                  >
                    <Download className="w-3.5 h-3.5" /> Export {preview.invalidCount} Invalid Rows
                  </button>
                )}
                <button
                  onClick={handleCommitBatch}
                  disabled={isCommitting}
                  className="flex items-center gap-2 bg-banking-blue text-white px-5 py-2 rounded-lg font-semibold text-xs hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isCommitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Committing Batch...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Confirm & Commit Batch
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Rows</div>
                <div className="text-lg font-bold text-slate-800">{preview.totalRecords}</div>
              </div>
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                <div className="text-[11px] font-semibold text-emerald-700 uppercase">Valid Records</div>
                <div className="text-lg font-bold text-emerald-600">{preview.validCount}</div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <div className="text-[11px] font-semibold text-red-700 uppercase">Invalid Records</div>
                <div className="text-lg font-bold text-red-600">{preview.invalidCount}</div>
              </div>
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                <div className="text-[11px] font-semibold text-amber-800 uppercase">Exact Duplicates</div>
                <div className="text-lg font-bold text-amber-600">{preview.exactDuplicatesCount}</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="text-[11px] font-semibold text-banking-blue uppercase">Avg Quality Score</div>
                <div className="text-lg font-bold text-banking-blue">{preview.averageQualityScore}%</div>
              </div>
            </div>
          </div>

          {/* Record Level Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Parsed Row Inspection & Resolution
              </h3>
              <span className="text-xs text-slate-500">
                Showing all {preview.records.length} parsed records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100/70 text-slate-500 font-semibold uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3 w-12 text-center">Row</th>
                    <th className="p-3">Question Preview</th>
                    <th className="p-3">Exam / Topic</th>
                    <th className="p-3 w-24">Quality</th>
                    <th className="p-3 w-40">Duplicate Match</th>
                    <th className="p-3 w-36">Action Resolution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {preview.records.map((rec) => (
                    <tr
                      key={rec.rowNumber}
                      className={rec.isValid ? 'hover:bg-slate-50' : 'bg-red-50/40 hover:bg-red-50'}
                    >
                      <td className="p-3 text-center font-mono font-medium text-slate-500">{rec.rowNumber}</td>
                      <td className="p-3 max-w-md">
                        <p className="font-medium text-slate-900 line-clamp-2">{rec.rawData.questionText || '(Empty Question)'}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Ans: <span className="font-semibold text-banking-blue">{rec.rawData.correctAnswer}</span> | A: {rec.rawData.optionA} | B: {rec.rawData.optionB}
                        </p>
                        {rec.errors.length > 0 && (
                          <div className="mt-1 space-y-0.5">
                            {rec.errors.map((err, idx) => (
                              <p key={idx} className="text-[10px] text-red-600 font-medium flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 shrink-0" /> [{err.field}] {err.message}
                              </p>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="font-medium text-slate-800">{rec.rawData.examCode}</span>
                        <div className="text-[11px] text-slate-500">{rec.rawData.topicTitle}</div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rec.qualityScore >= 80 ? 'bg-emerald-100 text-emerald-800' :
                          rec.qualityScore >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {rec.qualityScore}%
                        </span>
                      </td>
                      <td className="p-3">
                        {rec.duplicateResult.isDuplicate ? (
                          <div className="space-y-0.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              rec.duplicateResult.duplicateType === 'exact' ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
                            }`}>
                              {rec.duplicateResult.duplicateType} match ({rec.duplicateResult.similarityScore}%)
                            </span>
                            <p className="text-[10px] text-slate-500 line-clamp-1">{rec.duplicateResult.matchedQuestionText}</p>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Unique</span>
                        )}
                      </td>
                      <td className="p-3">
                        {rec.duplicateResult.isDuplicate ? (
                          <select
                            value={resolutions[rec.rowNumber] || 'skip'}
                            onChange={(e) => handleResolutionChange(rec.rowNumber, e.target.value as DuplicateResolution)}
                            className="text-xs p-1 rounded border border-slate-300 font-medium bg-white"
                          >
                            <option value="skip">Skip Record</option>
                            <option value="import_anyway">Import Duplicate</option>
                            <option value="merge">Merge</option>
                            <option value="replace_existing">Replace Existing</option>
                          </select>
                        ) : (
                          <span className="text-emerald-600 font-medium text-[11px] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
