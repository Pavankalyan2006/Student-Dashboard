import * as React from 'react';
import { ArrowLeft, Award, ExternalLink, Copy, CheckCircle2, ShieldCheck, Share2 } from 'lucide-react';
import { communityProfileApi } from '../../../api/communityProfileApi';
import { Certificate } from '../../../../server/models/communityProfileProgressTypes';
import { toast } from 'sonner';
import { copyText } from '../../../lib/clipboard';

export function ProfileCertificatesPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [certificates, setCertificates] = React.useState<Certificate[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const data = await communityProfileApi.getCertificates();
      setCertificates(data);
    } catch {
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (certId: string) => {
    const url = `${window.location.origin}/verify/certificate/${certId}`;
    copyText(url);
    toast.success('Public verification link copied to clipboard!');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/profile')}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Academic & Engineering Certificates</h1>
            <p className="text-xs text-slate-500">
              Cryptographically verified certificates earned upon complete, verifiable mastery of course and lab modules.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 self-start sm:self-auto">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Tamper-Proof Verification Active</span>
        </div>
      </div>

      {/* Certificates List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : certificates.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200 space-y-2">
          <Award className="h-8 w-8 mx-auto text-slate-300" />
          <p className="font-semibold text-slate-700">No certificates earned yet</p>
          <p className="text-[11px] text-slate-500 max-w-md mx-auto">
            Complete all lessons in a core course, pass the comprehensive assessment with ≥ 70%, and your certificate will be generated automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white rounded-2xl border-2 border-blue-100 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 transition-all relative overflow-hidden"
            >
              {/* Background watermark badge */}
              <Award className="absolute -right-6 -bottom-6 h-36 w-36 text-blue-50/70 -rotate-12 pointer-events-none" />

              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-200">
                    Verified Credential
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    ID: {cert.id}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{cert.program_name}</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Conferred upon <span className="font-semibold text-slate-900">{cert.student_name}</span>
                  </p>
                </div>

                <div className="pt-2 text-[11px] text-slate-500 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Issued By:</span>
                    <span className="font-semibold text-slate-800">{cert.issuer}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Completion Date:</span>
                    <span className="text-slate-800">
                      {new Date(cert.completion_date || cert.issue_date || new Date().toISOString()).toLocaleDateString([], {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  {cert.digital_signature_hash && (
                    <div className="flex items-center justify-between">
                      <span>Digital Hash:</span>
                      <span className="font-mono text-[9px] text-slate-500 truncate max-w-[180px]">
                        {cert.digital_signature_hash}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 relative z-10">
                <button
                  onClick={() => onNavigate(`/verify/certificate/${cert.id}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Verify Public Page</span>
                </button>

                <button
                  onClick={() => handleCopyLink(cert.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Link</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
