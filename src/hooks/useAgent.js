import { useState, useRef } from 'react';
import { AZURE_ENDPOINT, AZURE_DEPLOYMENT, AZURE_API_VERSION, AZURE_KEY } from '../constants';
import { TOOL_SCHEMAS, executeTool } from '../agent/tools';

const SYSTEM_PROMPT = `당신은 프로젝트 RAID 관리 에이전트입니다. 사용자의 요청에 따라 RAID 항목(Risk/Assumption/Issue/Dependency)을 조회, 생성, 상태 업데이트하고 AI 보고서를 생성합니다.

- 한국어로 간결하게 응답하세요.
- 항목 ID(R-01, A-02 등)는 반드시 backtick으로 표기하세요: \`R-01\`
- 조회 결과는 글머리(-)로 나열하고, 그룹/소제목은 ### 형식을 사용하세요.
- 항목 생성·수정 후에는 결과를 짧게 확인해주세요.
- 오늘 날짜: ${new Date().toISOString().slice(0, 10)}`;

const callOpenAI = async (messages) => {
  const url = `${AZURE_ENDPOINT}/openai/deployments/${AZURE_DEPLOYMENT}/chat/completions?api-version=${AZURE_API_VERSION}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': AZURE_KEY },
    body: JSON.stringify({ messages, tools: TOOL_SCHEMAS, max_completion_tokens: 1200 }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices[0];
};

export default function useAgent(storeCtx) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const storeRef = useRef(storeCtx);
  storeRef.current = storeCtx;

  const sendMessage = async (text) => {
    setError(null);
    const userMsg = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    const apiMessages = [{ role: 'system', content: SYSTEM_PROMPT }, ...updatedMessages];
    try {
      while (true) {
        const choice = await callOpenAI(apiMessages);
        apiMessages.push(choice.message);

        if (choice.finish_reason === 'tool_calls') {
          for (const tc of choice.message.tool_calls) {
            const args = JSON.parse(tc.function.arguments);
            const result = await executeTool(tc.function.name, args, storeRef.current);
            apiMessages.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(result) });
          }
        } else {
          setMessages([...updatedMessages, { role: 'assistant', content: choice.message.content }]);
          break;
        }
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => { setMessages([]); setError(null); };

  return { messages, loading, error, sendMessage, clearMessages };
}
