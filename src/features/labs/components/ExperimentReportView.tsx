// src/features/labs/components/ExperimentReportView.tsx
// Academic Laboratory Record & Report Generator with printable layout and editable fields

import React, { useState } from 'react';
import {
  Printer,
  FileText,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Building,
  User,
  Hash,
  Download,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { LabReportData } from '../types/labAssistantTypes';
import { toast } from 'sonner';

interface ExperimentReportViewProps {
  report: LabReportData;
  onBack: () => void;
}

export function ExperimentReportView({ report: initialReport, onBack }: ExperimentReportViewProps) {
  const [report, setReport] = useState<LabReportData>(initialReport);
  const [isEditing, setIsEditing] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Action Controls (hidden in print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-gray-200 shadow-xs print:hidden">
        <Button variant="outline" size="sm" onClick={onBack} className="gap-1.5 text-xs">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Experiment
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs"
          >
            {isEditing ? 'View Formatted Record' : 'Edit Content'}
          </Button>

          <Button
            onClick={handlePrint}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4" /> Print / Save as PDF
          </Button>
        </div>
      </div>

      {/* Academic Printable Laboratory Record Document */}
      <div
        id="printable-lab-record"
        className="bg-white rounded-2xl border border-gray-300 shadow-md p-8 sm:p-12 space-y-8 print:p-0 print:border-none print:shadow-none"
      >
        {/* Document Header */}
        <div className="text-center pb-6 border-b-2 border-gray-900 space-y-1.5">
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-gray-900">
            {report.lab_title || 'Laboratory Practical Record'}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-gray-700">
            {report.department || 'Department of Computer Science & Engineering'} • Semester {report.semester}
          </p>
          <p className="text-xs font-mono text-gray-600">
            Course Code: {report.course_code} | Subject: {report.subject}
          </p>
        </div>

        {/* Experiment Meta Header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs">
          <div>
            <span className="text-gray-500 block font-medium">Experiment No.</span>
            <span className="font-bold text-gray-900 text-sm">{report.experiment_number}</span>
          </div>
          <div className="sm:col-span-2">
            <span className="text-gray-500 block font-medium">Experiment Title</span>
            <span className="font-bold text-gray-900 line-clamp-1">{report.experiment_title}</span>
          </div>
          <div>
            <span className="text-gray-500 block font-medium">Date Performed</span>
            <span className="font-bold text-gray-900">{report.date_performed}</span>
          </div>
        </div>

        {/* Section 1: Aim */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-black uppercase tracking-wider text-blue-900 border-b border-gray-200 pb-1">
            1. Aim / Objective
          </h3>
          {isEditing ? (
            <textarea
              rows={2}
              value={report.aim}
              onChange={(e) => setReport({ ...report, aim: e.target.value })}
              className="w-full p-2 text-xs border rounded focus:outline-none"
            />
          ) : (
            <p className="text-xs text-gray-800 leading-relaxed">{report.aim}</p>
          )}
        </div>

        {/* Section 2: Theory & Background */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-black uppercase tracking-wider text-blue-900 border-b border-gray-200 pb-1">
            2. Theory & Principle
          </h3>
          {isEditing ? (
            <textarea
              rows={4}
              value={report.theory}
              onChange={(e) => setReport({ ...report, theory: e.target.value })}
              className="w-full p-2 text-xs border rounded focus:outline-none"
            />
          ) : (
            <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-line">{report.theory}</p>
          )}
        </div>

        {/* Section 3: Requirements */}
        {report.requirements && report.requirements.length > 0 && (
          <div className="space-y-1.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-900 border-b border-gray-200 pb-1">
              3. Requirements (Hardware & Software)
            </h3>
            <ul className="list-disc list-inside text-xs text-gray-800 pl-2 space-y-0.5">
              {report.requirements.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Section 4: Algorithm */}
        {report.algorithm && (
          <div className="space-y-1.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-900 border-b border-gray-200 pb-1">
              4. Algorithm
            </h3>
            <pre className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-xs font-mono text-gray-800 whitespace-pre-wrap">
              {report.algorithm}
            </pre>
          </div>
        )}

        {/* Section 5: Procedure */}
        {report.procedure && report.procedure.length > 0 && (
          <div className="space-y-1.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-900 border-b border-gray-200 pb-1">
              5. Step-by-Step Procedure
            </h3>
            <ol className="list-decimal list-inside text-xs text-gray-800 pl-2 space-y-1">
              {report.procedure.map((step, i) => (
                <li key={i} className="leading-relaxed">
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Section 6: Source Code */}
        {report.source_code && (
          <div className="space-y-1.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-900 border-b border-gray-200 pb-1">
              6. Program Code ({report.code_language || 'Code'})
            </h3>
            <pre className="p-4 rounded-lg bg-gray-900 text-emerald-400 text-[11px] font-mono overflow-x-auto whitespace-pre leading-snug">
              {report.source_code}
            </pre>
          </div>
        )}

        {/* Section 7: Output Results */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-900 border-b border-gray-200 pb-1">
              7A. Expected Output
            </h3>
            <pre className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-xs font-mono text-gray-700 whitespace-pre-wrap min-h-[60px]">
              {report.expected_output || 'No expected output was recorded for this experiment.'}
            </pre>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-900 border-b border-emerald-200 pb-1">
              7B. Actual Execution Output
            </h3>
            <pre className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-300 text-xs font-mono text-emerald-950 whitespace-pre-wrap min-h-[60px]">
              {report.actual_output || 'Not recorded yet. Run your code or enter your observations in the experiment workspace.'}
            </pre>
          </div>
        </div>

        {/* Section 8: Observation Table */}
        {report.observation_table &&
          ((report.observation_table.rows && report.observation_table.rows.length > 0) ||
            (report.observation_table.table_rows && report.observation_table.table_rows.length > 0)) && (
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-blue-900 border-b border-gray-200 pb-1">
                8. Observation & Measurement Table
              </h3>
              <div className="border border-gray-300 rounded-lg overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-gray-100 text-gray-900 font-bold border-b border-gray-300">
                    <tr>
                      <th className="p-2 border-r border-gray-300 w-12 text-center">S.No</th>
                      {report.observation_table.columns
                        ? report.observation_table.columns.map((col) => (
                            <th key={col.id} className="p-2 border-r border-gray-300">
                              {col.name} {col.unit ? `(${col.unit})` : ''}
                            </th>
                          ))
                        : report.observation_table.headers.map((h, i) => (
                            <th key={i} className="p-2 border-r border-gray-300">
                              {h}
                            </th>
                          ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.observation_table.table_rows
                      ? report.observation_table.table_rows.map((row, rIdx) => (
                          <tr key={rIdx} className="border-b border-gray-200">
                            <td className="p-2 border-r border-gray-200 text-center font-mono text-gray-500">
                              {rIdx + 1}
                            </td>
                            {report.observation_table!.columns!.map((col) => (
                              <td key={col.id} className="p-2 border-r border-gray-200 font-mono">
                                {row[col.id] || '-'}
                              </td>
                            ))}
                          </tr>
                        ))
                      : report.observation_table.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="border-b border-gray-200">
                            <td className="p-2 border-r border-gray-200 text-center font-mono text-gray-500">
                              {rIdx + 1}
                            </td>
                            {row.map((val, cIdx) => (
                              <td key={cIdx} className="p-2 border-r border-gray-200 font-mono">
                                {val}
                              </td>
                            ))}
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        {/* Section 9: Result & Conclusion */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-black uppercase tracking-wider text-blue-900 border-b border-gray-200 pb-1">
            9. Result & Conclusion
          </h3>
          {isEditing ? (
            <textarea
              rows={2}
              value={report.result_conclusion}
              onChange={(e) => setReport({ ...report, result_conclusion: e.target.value })}
              className="w-full p-2 text-xs border rounded focus:outline-none"
            />
          ) : (
            <p className="text-xs text-gray-800 leading-relaxed font-medium">
              {report.result_conclusion || 'Not written yet. Click Edit to write your own result and conclusion.'}
            </p>
          )}
        </div>

        {/* Signature & Verification Block */}
        <div className="pt-10 border-t border-gray-400 grid grid-cols-2 gap-8 text-xs text-center">
          <div className="space-y-1">
            <div className="h-10 border-b border-dashed border-gray-400 mx-auto w-48"></div>
            <p className="font-bold text-gray-800">Student Signature</p>
            <p className="text-[11px] text-gray-500">Verified Date: {report.date_performed}</p>
          </div>
          <div className="space-y-1">
            <div className="h-10 border-b border-dashed border-gray-400 mx-auto w-48"></div>
            <p className="font-bold text-gray-800">Faculty In-Charge Evaluation</p>
            <p className="text-[11px] text-gray-500">Grade / Remarks / Stamp</p>
          </div>
        </div>
      </div>
    </div>
  );
}
