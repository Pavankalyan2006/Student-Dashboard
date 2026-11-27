import * as React from 'react';
import { ShieldCheck, Award, CheckCircle2, AlertTriangle, ArrowLeft, ExternalLink } from 'lucide-react';
import { communityProfileApi } from '../../../api/communityProfileApi';
import { CertificateVerification } from '../../../../server/models/communityProfileProgressTypes';

export function CertificateVerificationPage({
  certificateId,
  onNavigate,
}: {
  certificateId: string;
  onNavigate: (path: string) => void;
}) {
  const [verification, setVerification] = React.useState<CertificateVerification | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    verify();
  }, [certificateId]);

  const verify = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await communityProfileApi.verifyCertificate(certificateId);
      setVerification(res);
    } catch (err: any) {
      setError(err?.message || 'Certificate record could not be verified or does not exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl space-y-6">
        <button
          onClick={() => onNavigate('/dashboard')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Workspace</span>
        </button>

        {loading ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md text-center space-y-4 animate-pulse">
            <div className="h-16 w-16 bg-slate-200 rounded-full mx-auto" />
            <div className="h-6 w-48 bg-slate-200 rounded mx-auto" />
            <div className="h-24 bg-slate-100 rounded-xl" />
          </div>
        ) : error || !verification?.is_valid ? (
          <div className="bg-white rounded-3xl p-8 border border-red-200 shadow-md text-center space-y-4">
            <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Certificate Not Verified</h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
              {error || 'The certificate identifier provided does not match any authenticated record in the B.Tech registry.'}
            </p>
            <div className="pt-2 text-[11px] font-mono text-slate-400">
              Query ID: {certificateId}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border-2 border-emerald-500/30 p-8 shadow-lg space-y-6 relative overflow-hidden">
            {/* Header Status */}
            <div className="text-center space-y-2">
              <div className="h-14 w-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-3 py-0.5 rounded-full uppercase tracking-wider">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified Authentic Certificate
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 pt-2">
                {verification.course_name}
              </h2>
            </div>

            {/* Recipient Details */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                <span className="text-slate-500">Conferred To</span>
                <span className="font-bold text-slate-900 text-sm">{verification.student_name}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                <span className="text-slate-500">Issuing Authority</span>
                <span className="font-semibold text-slate-800">{verification.issuer}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                <span className="text-slate-500">Issue Date</span>
                <span className="text-slate-800">
                  {new Date(verification.issue_date).toLocaleDateString([], {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                <span className="text-slate-500">Credential ID</span>
                <span className="font-mono text-slate-800 font-semibold">{verification.certificate_id}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center py-1 gap-1">
                <span className="text-slate-500">Cryptographic Hash</span>
                <span className="font-mono text-[10px] text-slate-600 break-all">
                  {verification.verification_hash}
                </span>
              </div>
            </div>

            {/* Disclaimer & Privacy Protection Note */}
            <div className="text-[11px] text-slate-500 text-center space-y-1">
              <p>
                This record verifies official academic course mastery on the NEXORA AI.
              </p>
              <p className="text-[10px] text-slate-400">
                Private student credentials, internal tokens, and student IDs are securely shielded.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
