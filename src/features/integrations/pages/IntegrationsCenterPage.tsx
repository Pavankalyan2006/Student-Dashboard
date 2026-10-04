// src/features/integrations/pages/IntegrationsCenterPage.tsx
// Connected Platforms Center for LinkedIn, Indeed, LeetCode, GitHub, HackerRank, CodeChef, GeeksforGeeks, Kaggle

import * as React from 'react';
import {
  Link2,
  Sparkles,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Plus,
  ShieldCheck,
  Code2,
  Briefcase,
  Database,
  Cpu,
  Award,
  Clock,
  Layers,
  Activity,
  Settings,
  X,
} from 'lucide-react';
import { PageContainer, PageHeader, LoadingState, EmptyState } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { externalIntegrationsApi } from '../../../api/externalIntegrationsApi';
import {
  ExternalProviderInfo,
  ExternalAccountConnection,
  ExternalActivity,
  ExternalProviderId,
} from '../../../types/externalIntegrations';
import { toast } from 'sonner';

interface IntegrationsCenterPageProps {
  onNavigate?: (path: string) => void;
  initialTab?: 'platforms' | 'activity' | 'settings';
}

export function IntegrationsCenterPage({ onNavigate, initialTab = 'platforms' }: IntegrationsCenterPageProps) {
  const [providers, setProviders] = React.useState<ExternalProviderInfo[]>([]);
  const [connections, setConnections] = React.useState<ExternalAccountConnection[]>([]);
  const [activities, setActivities] = React.useState<ExternalActivity[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'platforms' | 'activity' | 'settings'>(initialTab);

  // Connect Modal State
  const [connectModalProvider, setConnectModalProvider] = React.useState<ExternalProviderInfo | null>(null);
  const [connectUsername, setConnectUsername] = React.useState('');
  const [connectProfileUrl, setConnectProfileUrl] = React.useState('');
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [isSyncingId, setIsSyncingId] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [allProviders, studentConns, recentActs] = await Promise.all([
        externalIntegrationsApi.getProviders(),
        externalIntegrationsApi.getConnections(),
        externalIntegrationsApi.getActivities(),
      ]);
      setProviders(allProviders);
      setConnections(studentConns);
      setActivities(recentActs);
    } catch (err: any) {
      toast.error('Failed to load integration data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenConnectModal = (provider: ExternalProviderInfo) => {
    setConnectModalProvider(provider);
    setConnectUsername('');
    setConnectProfileUrl(provider.official_url);
  };

  const handleConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectModalProvider) return;

    try {
      setIsConnecting(true);
      await externalIntegrationsApi.connectPlatform(connectModalProvider.id, {
        username: connectUsername || undefined,
        profile_url: connectProfileUrl || undefined,
      });
      toast.success(`Successfully connected ${connectModalProvider.display_name}!`);
      setConnectModalProvider(null);
      loadData();
    } catch (err: any) {
      toast.error('Failed to connect: ' + err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSync = async (connectionId: string, providerName: string) => {
    try {
      setIsSyncingId(connectionId);
      await externalIntegrationsApi.syncConnection(connectionId);
      toast.success(`${providerName} synchronized successfully!`);
      loadData();
    } catch (err: any) {
      toast.error('Sync failed: ' + err.message);
    } finally {
      setIsSyncingId(null);
    }
  };

  const handleDisconnect = async (connectionId: string, providerName: string) => {
    if (!window.confirm(`Disconnect ${providerName}? Verified evidence already saved will be retained.`)) {
      return;
    }
    try {
      await externalIntegrationsApi.disconnectPlatform(connectionId);
      toast.success(`${providerName} disconnected.`);
      loadData();
    } catch (err: any) {
      toast.error('Failed to disconnect: ' + err.message);
    }
  };

  const getConnectionForProvider = (providerId: ExternalProviderId) => {
    return connections.find((c) => c.provider === providerId && c.status !== 'DISCONNECTED');
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Connected Platforms" description="Loading external integrations and sync statuses..." />
        <LoadingState message="ExternalPlatformAgent inspecting OAuth tokens and verified activity..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Connected Platforms"
        description="Connect your professional, coding, and developer accounts. Sync problem solving stats, repository activity, and verified skill evidence."
        badge={
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Official APIs & Public Profiles
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate?.('/profile/external')}
              className="text-xs"
            >
              External Profile Hub
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate?.('/career/jobs')}
              className="text-xs bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
            >
              Discover Jobs
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E4E7EC] pb-2">
        <button
          onClick={() => setActiveTab('platforms')}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'platforms' ? 'bg-[#101828] text-white' : 'text-[#475467] hover:bg-gray-100'
          }`}
        >
          Supported Platforms ({providers.length})
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'activity' ? 'bg-[#101828] text-white' : 'text-[#475467] hover:bg-gray-100'
          }`}
        >
          Activity Stream ({activities.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'settings' ? 'bg-[#101828] text-white' : 'text-[#475467] hover:bg-gray-100'
          }`}
        >
          Security & Sync Settings
        </button>
      </div>

      {/* Tab 1: Platforms Grid */}
      {activeTab === 'platforms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {providers.map((p) => {
            const connection = getConnectionForProvider(p.id);
            const isConnected = !!connection;

            return (
              <div
                key={p.id}
                className="p-5 rounded-2xl border border-[#E4E7EC] bg-white shadow-sm flex flex-col justify-between hover:border-blue-400 transition-all space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Bar: Icon + Category + Status */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[#101828] font-bold text-sm">
                        {p.icon_name === 'Linkedin' && <Briefcase className="w-5 h-5 text-blue-700" />}
                        {p.icon_name === 'Code2' && <Code2 className="w-5 h-5 text-amber-600" />}
                        {p.icon_name === 'Github' && <Code2 className="w-5 h-5 text-gray-900" />}
                        {p.icon_name === 'Award' && <Award className="w-5 h-5 text-emerald-600" />}
                        {p.icon_name === 'Trophy' && <Award className="w-5 h-5 text-amber-700" />}
                        {p.icon_name === 'Binary' && <Code2 className="w-5 h-5 text-teal-600" />}
                        {p.icon_name === 'Database' && <Database className="w-5 h-5 text-blue-500" />}
                        {p.icon_name === 'Briefcase' && <Briefcase className="w-5 h-5 text-indigo-600" />}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#101828]">{p.name}</h3>
                        <span className="text-[10px] text-gray-500 font-medium">
                          {p.category.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isConnected
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                    </span>
                  </div>

                  <p className="text-xs text-[#475467] leading-relaxed">{p.description}</p>

                  {/* Capabilities Badges */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                      Supported Capabilities
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {p.capabilities.profile && (
                        <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
                          Profile
                        </span>
                      )}
                      {p.capabilities.activity && (
                        <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-medium">
                          Activity
                        </span>
                      )}
                      {p.capabilities.statistics && (
                        <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-medium">
                          Statistics
                        </span>
                      )}
                      {p.capabilities.jobs && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium">
                          Job Alerts
                        </span>
                      )}
                      {p.capabilities.repositories && (
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium">
                          Repositories
                        </span>
                      )}
                      {p.capabilities.code_submissions && (
                        <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-medium">
                          Submissions
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Connected Details */}
                  {isConnected && connection && (
                    <div className="p-2.5 bg-gray-50 rounded-lg text-xs space-y-1 border border-gray-100">
                      <div className="flex items-center justify-between text-[#344054]">
                        <span className="font-medium truncate">{connection.display_name}</span>
                        <a
                          href={connection.profile_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-0.5 shrink-0"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <p className="text-[11px] text-gray-400">
                        Last synced: {connection.last_synced_at ? new Date(connection.last_synced_at).toLocaleTimeString() : 'Just now'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions Bottom Bar */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  {isConnected && connection ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isSyncingId === connection.id}
                        onClick={() => handleSync(connection.id, p.name)}
                        className="text-xs gap-1"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncingId === connection.id ? 'animate-spin' : ''}`} />
                        Sync
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDisconnect(connection.id, p.name)}
                        className="text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                      >
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleOpenConnectModal(p)}
                      className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs gap-1"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      Connect {p.name}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Activity Stream */}
      {activeTab === 'activity' && (
        <div className="p-6 rounded-2xl border border-[#E4E7EC] bg-white shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#101828] flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            Verified Multi-Platform Activity Stream
          </h3>

          <div className="space-y-3">
            {activities.map((act) => (
              <div
                key={act.id}
                className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded uppercase">
                      {act.provider}
                    </span>
                    <span className="text-xs font-bold text-[#101828]">{act.title}</span>
                  </div>
                  {act.description && <p className="text-xs text-[#475467]">{act.description}</p>}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-gray-400">
                    {(act.timestamp || act.occurred_at || act.created_at)
                      ? new Date(act.timestamp || act.occurred_at || act.created_at!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Recently'}
                  </span>
                  {act.url && (
                    <a
                      href={act.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded hover:bg-gray-200 text-gray-500"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Security & Privacy Settings */}
      {activeTab === 'settings' && (
        <div className="p-6 rounded-2xl border border-[#E4E7EC] bg-white shadow-sm space-y-4 max-w-2xl">
          <h3 className="text-base font-bold text-[#101828] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Privacy & External Credential Protections
          </h3>
          <ul className="space-y-3 text-xs text-[#344054] leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>No Third-Party Passwords:</strong> The platform uses official OAuth 2.0 or verified public profiles. We never ask for or store passwords for LinkedIn, LeetCode, GitHub, or any service.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Token Vault Encryption:</strong> Authorized OAuth tokens are encrypted at rest with AES-256 and never transmitted to the browser or sent to AI prompt context.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Read-Only Scope:</strong> Integrations pull verified learning evidence without modifying external profiles or publishing automated content on your behalf.
              </span>
            </li>
          </ul>
        </div>
      )}

      {/* Connect Modal Dialog */}
      {connectModalProvider && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E4E7EC] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-[#101828] flex items-center gap-2">
                <Link2 className="w-4 h-4 text-blue-600" />
                Connect {connectModalProvider.display_name}
              </h3>
              <button
                onClick={() => setConnectModalProvider(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConnectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">
                  Username or Handle
                </label>
                <input
                  type="text"
                  placeholder="e.g. your_handle"
                  value={connectUsername}
                  onChange={(e) => setConnectUsername(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">
                  Public Profile URL
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={connectProfileUrl}
                  onChange={(e) => setConnectProfileUrl(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="p-3 bg-blue-50/60 rounded-lg text-[11px] text-blue-900 border border-blue-200">
                Safe alternative: Synchronizes public problem counts, contest ratings, or headline without password sharing.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setConnectModalProvider(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isConnecting}
                  className="bg-[#2563EB] text-white"
                >
                  {isConnecting ? 'Verifying...' : 'Establish Connection'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
