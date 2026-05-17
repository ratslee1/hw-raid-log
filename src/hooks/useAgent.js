import { useState, useRef } from 'react';
import { plannerNode, executorNode } from '../agent/nodes';

const MAX_ITERATIONS = 12;

const SYSTEM_PROMPT = `당신은 ReAct(Reasoning + Acting) 패턴으로 동작하는 RAID 관리 에이전트입니다.

## 처리 절차

매 사용자 질의마다 아래 사이클을 정확히 따르세요:

**① Thought** — think 툴 (첫 번째 호출, 필수)
  - 사용자 의도 파악, 필요한 툴과 파라미터 결정, 검색 키워드 추출
  - 예: "예산 리스크 있어?" → reasoning: "keyword='예산', item_type='Risk'로 query_items 호출 예정"
  - 예: "R-03 기한 다음 달 말로 바꿔줘" → reasoning: "update_item(R-03, due_date='...')로 수정 예정. 먼저 존재 확인 필요"
  - 예: "D-07 진행상황 알려줘" → reasoning: "item_ids=['D-07'], detail:true로 상세 조회 필요"

**query_items 상세 조회 가이드**
- 목록 파악(기본): detail 생략 → id, type, title, status, severity, area, owner, due
- 내용·진행상황 파악: detail:true → 위 항목 + description, mitigation, comments(전체), relatedIds, createdAt
- 특정 항목 지정: item_ids 배열 사용 (예: ["D-07", "R-01"])

**② Action** — 계획한 툴 호출

**③ Observation** — 툴 결과 분석
  - 충분한 정보 → Answer 생성
  - 조회 0건 → think 재호출 후 키워드 변경 또는 전체 조회로 재시도
  - 추가 작업 필요 → think 재호출 후 다음 Action

**④ Answer** — 최종 한국어 답변

## 절대 규칙
- 툴 결과에 없는 항목 ID·제목·상태는 언급 금지
- 수정·삭제 전 반드시 query_items로 존재 확인
- 조회 결과 0건이면 "해당 항목을 찾을 수 없습니다" 명시

## 출력 형식
- 한국어, 간결하게
- ID 표기: 백틱 \`R-01\`
- 목록: -, 소제목: ###

오늘: ${new Date().toISOString().slice(0, 10)}`;

export default function useAgent(storeCtx) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [liveSteps, setLiveSteps] = useState([]);
  const [error, setError] = useState(null);
  const storeRef = useRef(storeCtx);
  storeRef.current = storeCtx;

  const sendMessage = async (text) => {
    setError(null);
    setLiveSteps([]);

    const userMsg = { role: 'user', content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setLoading(true);

    const steps = [];
    const onStep = (step) => {
      steps.push(step);
      setLiveSteps([...steps]);
    };

    // Build API messages from conversation history (strip UI-only fields like steps)
    const apiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...nextMessages.map(({ role, content }) => ({ role, content })),
    ];

    let iterations = 0;
    try {
      while (iterations < MAX_ITERATIONS) {
        iterations++;

        // Planner node: force think on the first call of each user query
        const choice = await plannerNode(apiMessages, { forceThink: iterations === 1 });
        apiMessages.push(choice.message);

        if (choice.finish_reason === 'tool_calls') {
          // Executor node: run tools, emit steps
          const toolMessages = await executorNode(
            choice.message.tool_calls,
            storeRef.current,
            onStep,
          );
          toolMessages.forEach(tm => apiMessages.push(tm));
        } else {
          // Answer node: package final response with trace
          setMessages([...nextMessages, {
            role: 'assistant',
            content: choice.message.content,
            steps: [...steps],
          }]);
          break;
        }
      }

      if (iterations >= MAX_ITERATIONS) {
        setError('최대 처리 단계에 도달했습니다. 질문을 더 구체적으로 입력해주세요.');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setLiveSteps([]);
    }
  };

  const clearMessages = () => { setMessages([]); setError(null); setLiveSteps([]); };

  return { messages, loading, error, liveSteps, sendMessage, clearMessages };
}
