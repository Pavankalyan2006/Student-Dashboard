import { Router } from 'express';
import { AIService } from '../../ai/service';
import { AgentService } from '../../ai/agent';
import { db } from '../../db/database';
import { requireAuth } from '../../middleware/auth';
import { ValidationError, NotFoundError } from '../../core/exceptions';

export const aiRouter = Router();

// ================= CONVERSATION ROUTES =================

// GET /api/v1/ai/conversations - List conversations for authenticated student
aiRouter.get('/ai/conversations', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const conversations = await db.getConversationsByStudentId(studentId);
    res.json({
      success: true,
      data: conversations,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/ai/conversations - Create a new conversation
aiRouter.post('/ai/conversations', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { title } = req.body;
    const conversation = await db.createConversation(studentId, title);
    res.status(201).json({
      success: true,
      data: conversation,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/ai/conversations/search - Search student's conversations
aiRouter.get('/ai/conversations/search', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const query = String(req.query.q || '');
    const results = await db.searchConversations(studentId, query);
    res.json({
      success: true,
      data: results,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/ai/conversations/:id - Get conversation details and its message history
aiRouter.get('/ai/conversations/:id', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { id } = req.params;

    const conversation = await db.getConversationById(id, studentId);
    if (!conversation) {
      throw new NotFoundError(`Conversation '${id}' not found`);
    }

    const messages = await db.getMessagesByConversationId(id, studentId);

    res.json({
      success: true,
      data: {
        conversation,
        messages,
      },
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/ai/conversations/:id - Update conversation (rename, pin, archive)
aiRouter.patch('/ai/conversations/:id', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { id } = req.params;
    const { title, is_pinned, is_archived } = req.body;

    const updated = await db.updateConversation(id, studentId, {
      title,
      is_pinned,
      is_archived,
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/ai/conversations/:id - Delete a conversation
aiRouter.delete('/ai/conversations/:id', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { id } = req.params;

    const success = await db.deleteConversation(id, studentId);
    if (!success) {
      throw new NotFoundError(`Conversation '${id}' not found`);
    }

    res.json({
      success: true,
      data: { id, deleted: true },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/ai/context - Current student dynamic learning context
aiRouter.get('/ai/context', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const context = await db.getStudentLearningContext(studentId);
    res.json({
      success: true,
      data: context,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/ai/conversations/:id/messages - Post user message and generate response synchronously
aiRouter.post('/ai/conversations/:id/messages', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { id } = req.params;
    const { content, attachments } = req.body;

    if (!content || !content.trim()) {
      throw new ValidationError("Message 'content' cannot be empty");
    }

    // Persist user message
    const userMsg = await db.addMessageToConversation(id, studentId, {
      conversation_id: id,
      role: 'user',
      content: content.trim(),
      metadata: { attachments },
    });

    // Run agent stream to completion and capture final message
    let finalAssistantMsg = null;
    for await (const event of AgentService.runAgentStream(studentId, id, content)) {
      if (event.type === 'message_complete') {
        finalAssistantMsg = event.data.message;
      }
    }

    res.json({
      success: true,
      data: {
        userMessage: userMsg,
        assistantMessage: finalAssistantMsg,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/ai/chat - Streaming Server-Sent Events (SSE) AI Agent Orchestration
aiRouter.post('/ai/chat', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    let { conversation_id, message, context } = req.body;

    if (!message || !message.trim()) {
      throw new ValidationError("Message 'message' cannot be empty");
    }

    // Ensure conversation exists or create on the fly
    if (!conversation_id) {
      const newConv = await db.createConversation(studentId, message.slice(0, 30));
      conversation_id = newConv.id;
    }

    // Persist user message
    const userMsg = await db.addMessageToConversation(conversation_id, studentId, {
      conversation_id,
      role: 'user',
      content: message.trim(),
    });

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Stream agent events
    for await (const event of AgentService.runAgentStream(studentId, conversation_id, message, context)) {
      res.write(`event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`);
    }

    res.write('event: done\ndata: [DONE]\n\n');
    res.end();
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/ai/messages/:messageId/feedback - Record feedback
aiRouter.post('/ai/messages/:messageId/feedback', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { messageId } = req.params;
    const { is_helpful, reason } = req.body;

    if (typeof is_helpful !== 'boolean') {
      throw new ValidationError("Parameter 'is_helpful' must be a boolean");
    }

    const feedback = await db.recordFeedback(studentId, messageId, is_helpful, reason);
    res.json({
      success: true,
      data: feedback,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/ai/attachments - Upload/attach document metadata
aiRouter.post('/ai/attachments', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { filename, file_type, size_bytes } = req.body;

    if (!filename || !file_type) {
      throw new ValidationError('Filename and file_type are required');
    }

    const record = await db.saveAttachment(studentId, {
      filename,
      fileType: file_type,
      sizeBytes: size_bytes || 1024,
    });

    res.json({
      success: true,
      data: record,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/ai/workflows/:id - Get authenticated student's multi-agent workflow
aiRouter.get('/ai/workflows/:id', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { id } = req.params;
    const workflow = await db.getAgentWorkflowById(id);

    if (!workflow || workflow.student_id !== studentId) {
      throw new NotFoundError(`Workflow '${id}' not found`);
    }

    res.json({
      success: true,
      data: workflow,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/ai/workflows/:id/status - Safe status poll for workflow
aiRouter.get('/ai/workflows/:id/status', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { id } = req.params;
    const workflow = await db.getAgentWorkflowById(id);

    if (!workflow || workflow.student_id !== studentId) {
      throw new NotFoundError(`Workflow '${id}' not found`);
    }

    res.json({
      success: true,
      data: {
        id: workflow.id,
        status: workflow.status,
        complexity: workflow.complexity,
        completed_at: workflow.completed_at,
        tasks_completed: workflow.tasks.filter((t) => t.status === 'completed').length,
        tasks_total: workflow.tasks.length,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ================= EXISTING GENERATION & TOOL ROUTES =================

// POST /api/v1/ai/generate
aiRouter.post('/ai/generate', requireAuth, async (req, res, next) => {
  try {
    const { messages, promptKey, temperature } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new ValidationError("Parameter 'messages' must be a non-empty array");
    }
    const result = await AIService.generate(messages, promptKey, temperature);
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/ai/stream
aiRouter.post('/ai/stream', requireAuth, async (req, res, next) => {
  try {
    const { messages, promptKey, temperature } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new ValidationError("Parameter 'messages' must be a non-empty array");
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    await AIService.stream(
      messages,
      (chunk: string) => {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      },
      promptKey,
      temperature
    );

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/ai/tools
aiRouter.get('/ai/tools', requireAuth, (_req, res) => {
  const tools = AIService.getRegisteredTools();
  res.json({
    success: true,
    data: tools,
  });
});

// POST /api/v1/ai/tools/execute
aiRouter.post('/ai/tools/execute', requireAuth, async (req, res, next) => {
  try {
    const { toolName, parameters } = req.body;
    if (!toolName) {
      throw new ValidationError("Parameter 'toolName' is required");
    }

    const result = await AIService.executeTool(toolName, parameters || {}, {
      studentId: req.user!.userId,
      role: req.user!.role,
    });

    res.json({
      success: true,
      data: {
        toolName,
        result,
      },
    });
  } catch (err) {
    next(err);
  }
});
