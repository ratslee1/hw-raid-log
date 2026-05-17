import { useState, useRef } from 'react';
import { AZURE_ENDPOINT, AZURE_DEPLOYMENT, AZURE_API_VERSION, AZURE_KEY } from '../config/constants';
import { TOOL_SCHEMAS, executeTool } from '../agent/tools';

const SYSTEM_PROMPT = `당신은 프로젝트 RAID 관리 에이전트입니다. 사용자의 요청에 따라 RAID 항목(Risk/Assumption/Issue/Dependency)을 조회, 생성, 상태 업데이트하고 AI 보고서를 생성합니다.

**절대 규칙 — 반드시 준수**
- 항목 정보는 반드시 툴 호출 결과에서만 가져오세요. 툴이 반환하지 않은 항목 ID, 제목, 상태는 절대 언급하지 마세요.
- 존재하지 않는 항목을 추측하거나 만들어내지 마세요.
- 특정 항목을 조회·수정하기 전에 항상 먼저 \`query_items\` 툴로 실제 존재 여부를 확인하세요.
- 툴 결과가 비어 있으면 "해당 항목이 없습니다"라고 명확히 답하세요.

**자연어 질문 처리 전략**
- 사용자는 정확한 제목 대신 애매한 표현으로 질문합니다. 질문에서 핵심 명사·동사를 키워드로 추출해 \`query_items\`의 \`keyword\` 파라미터로 전달하세요.
  - 예: "예상답변 언제까지 받기로 했지?" → keyword: "예상답변"
  - 예: "인증 연동 관련 이슈 있어?" → keyword: "인증 연동", item_type: "Issue"
  - 예: "API 쪽에 막힌 거 있어?" → keyword: "API", item_type: "Dependency"
- 키워드 검색 결과가 0건이면, 키워드를 줄이거나 바꿔서 한 번 더 시도하세요.
- 두 번 시도해도 없으면 전체 조회(keyword 없이) 후 의미적으로 가장 관련 있는 항목을 골라 답하세요.

**형식 규칙**
- 한국어로 간결하게 응답하세요.
- 항목 ID는 반드시 backtick으로 표기하세요: \`R-01\`
- 조회 결과는 글머리(-)로 나열하고, 그룹/소제목은 ### 형식을 사용하세요.
- 항목 생성·수정·코멘트 추가 후에는 결과를 짧게 확인해주세요.
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
