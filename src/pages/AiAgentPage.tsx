import * as React from 'react';
import { useUiStore } from '../store/uiStore';
import { useConversations } from '../features/ai-agent/hooks/useConversations';
import { useAIChat } from '../features/ai-agent/hooks/useAIChat';
import { ConversationSidebar } from '../features/ai-agent/components/ConversationSidebar';
import { ChatWorkspace } from '../features/ai-agent/components/ChatWorkspace';
import { ContextPanel } from '../features/ai-agent/components/ContextPanel';
import { SelectedTutorContext } from '../features/ai-agent/types/ai';

export function AiAgentPage({ onNavigate }: { onNavigate?: (path: string) => void }) {
  const { aiInitialPrompt, setAiInitialPrompt } = useUiStore();
  const [selectedId, setSelectedId] = React.useState<string>('conv_01');
  const [mobileHistoryOpen, setMobileHistoryOpen] = React.useState(false);
  const [mobileContextOpen, setMobileContextOpen] = React.useState(false);
  const [input, setInput] = React.useState('');

  const [selectedContext, setSelectedContext] = React.useState<SelectedTutorContext>({
    mode: 'EXPLAIN',
    difficulty: 'Intermediate',
  });

  // Extract URL search parameters when opened from a course or lesson (e.g. /ai-tutor?courseId=...&lessonId=...)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const courseId = params.get('courseId') || params.get('course_id') || undefined;
      const courseName = params.get('courseName') || undefined;
      const lessonId = params.get('lessonId') || params.get('lesson_id') || undefined;
      const lessonTitle = params.get('lessonTitle') || undefined;
      const subject = params.get('subject') || undefined;
      const mode = params.get('mode') || undefined;
      const docId = params.get('docId') || params.get('document_id') || undefined;

      if (courseId || lessonId || subject || mode || docId) {
        setSelectedContext((prev) => ({
          ...prev,
          courseId: courseId || prev.courseId,
          courseName: courseName || prev.courseName,
          lessonId: lessonId || prev.lessonId,
          lessonTitle: lessonTitle || prev.lessonTitle,
          subject: subject || prev.subject,
          mode: mode ? mode.toUpperCase() : prev.mode,
          documentIds: docId ? [docId] : prev.documentIds,
        }));
      }
    }
  }, []);

  const {
    conversations,
    pinnedConversations,
    recentConversations,
    searchQuery,
    setSearchQuery,
    createConversation,
    updateConversation,
    deleteConversation,
  } = useConversations(selectedId, (newId) => setSelectedId(newId));

  const activeConv = conversations.find((c) => c.id === selectedId);

  const {
    messages,
    isGenerating,
    streamingContent,
    activeTool,
    activePlan,
    error,
    sendMessage,
    stopGeneration,
    retryLastMessage,
    submitFeedback,
  } = useAIChat(selectedId, (newId) => setSelectedId(newId));

  // If initial prompt arrived from Dashboard AI Hero or URL
  React.useEffect(() => {
    if (aiInitialPrompt) {
      const promptToSend = aiInitialPrompt;
      setAiInitialPrompt('');
      sendMessage(promptToSend, selectedContext.mode, selectedContext);
    }
  }, [aiInitialPrompt, setAiInitialPrompt, sendMessage, selectedContext]);

  const handleSelectPrompt = (prompt: string, modeOverride?: string) => {
    const targetMode = modeOverride || selectedContext.mode;
    sendMessage(prompt, targetMode, selectedContext);
    setMobileContextOpen(false);
  };

  const handleNewChat = () => {
    createConversation('New Learning Session');
  };

  return (
    <div className="h-[calc(100vh-4.5rem)] flex rounded-2xl border border-[#E4E7EC] bg-white overflow-hidden shadow-xs relative">
      {/* Desktop Left Sidebar: Conversation History (260px - 280px) */}
      <div className="hidden md:block w-64 lg:w-72 shrink-0 h-full">
        <ConversationSidebar
          conversations={conversations}
          pinnedConversations={pinnedConversations}
          recentConversations={recentConversations}
          selectedId={selectedId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelect={(id) => setSelectedId(id)}
          onNewChat={handleNewChat}
          onUpdate={updateConversation}
          onDelete={deleteConversation}
        />
      </div>

      {/* Center AI Workspace: Flexible main chat canvas */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        <ChatWorkspace
          conversationTitle={activeConv?.title || 'New Learning Session'}
          messages={messages}
          isGenerating={isGenerating}
          streamingContent={streamingContent}
          activeTool={activeTool}
          activePlan={activePlan}
          error={error}
          input={input}
          setInput={setInput}
          selectedContext={selectedContext}
          onContextChange={setSelectedContext}
          onSend={(text, mode) => {
            const msg = text || input;
            setInput('');
            sendMessage(msg, mode || selectedContext.mode, selectedContext);
          }}
          onStop={stopGeneration}
          onRetry={retryLastMessage}
          onSelectPrompt={handleSelectPrompt}
          onSubmitFeedback={submitFeedback}
          onToggleHistory={() => setMobileHistoryOpen(true)}
          onToggleContext={() => setMobileContextOpen(true)}
          onNavigate={onNavigate}
        />
      </div>

      {/* Desktop Right Sidebar: Dynamic Learning Context (280px) */}
      <div className="hidden lg:block w-72 shrink-0 h-full">
        <ContextPanel
          selectedContext={selectedContext}
          onContextChange={setSelectedContext}
          onSelectPrompt={handleSelectPrompt}
          onNavigate={onNavigate}
        />
      </div>

      {/* Mobile Drawer: Conversation History */}
      {mobileHistoryOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileHistoryOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] h-full bg-white z-10 shadow-2xl">
            <ConversationSidebar
              conversations={conversations}
              pinnedConversations={pinnedConversations}
              recentConversations={recentConversations}
              selectedId={selectedId}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSelect={(id) => setSelectedId(id)}
              onNewChat={handleNewChat}
              onUpdate={updateConversation}
              onDelete={deleteConversation}
              onCloseMobile={() => setMobileHistoryOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Mobile Drawer: Learning Context Panel */}
      {mobileContextOpen && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileContextOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] h-full bg-white z-10 shadow-2xl">
            <ContextPanel
              selectedContext={selectedContext}
              onContextChange={setSelectedContext}
              onSelectPrompt={handleSelectPrompt}
              onCloseMobile={() => setMobileContextOpen(false)}
              onNavigate={onNavigate}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export const AiTutorPage = AiAgentPage;
