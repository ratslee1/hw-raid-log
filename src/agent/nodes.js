import { executeTool, TOOL_SCHEMAS } from './tools';
import { AZURE_ENDPOINT, AZURE_DEPLOYMENT, AZURE_API_VERSION, AZURE_KEY } from '../config/constants';

// ── Planner Node ────────────────────────────────────────────────
// Calls LLM and returns the model's decision (tool_calls or final answer).
// forceThink=true sets tool_choice to 'think' to guarantee the Thought step.
export async function plannerNode(apiMessages, { forceThink = false } = {}) {
  const url = `${AZURE_ENDPOINT}/openai/deployments/${AZURE_DEPLOYMENT}/chat/completions?api-version=${AZURE_API_VERSION}`;
  const body = {
    messages: apiMessages,
    tools: TOOL_SCHEMAS,
    max_completion_tokens: 1500,
  };
  if (forceThink) {
    body.tool_choice = { type: 'function', function: { name: 'think' } };
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': AZURE_KEY },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices[0];
}

// ── Executor Node ───────────────────────────────────────────────
// Runs tool calls in sequence, emitting steps via onStep callback.
// Returns tool result messages to feed back into the conversation.
export async function executorNode(toolCalls, storeCtx, onStep) {
  const toolMessages = [];

  for (const tc of toolCalls) {
    const name = tc.function.name;
    const args = JSON.parse(tc.function.arguments);

    if (name === 'think') {
      onStep({ type: 'think', text: args.reasoning });
      toolMessages.push({ role: 'tool', tool_call_id: tc.id, content: '{"acknowledged":true}' });
      continue;
    }

    onStep({ type: 'tool', name, args });
    const result = await executeTool(name, args, storeCtx);
    onStep({ type: 'result', name, data: result });
    toolMessages.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(result) });
  }

  return toolMessages;
}
