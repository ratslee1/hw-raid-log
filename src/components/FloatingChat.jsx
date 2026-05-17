import { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
import useAgent from '../hooks/useAgent';
import { highlightIds } from '../lib/utils';
import { MessageSquare, X, Trash2 } from './icons';

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
       fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
  </svg>
);

// ── Step trace ──────────────────────────────────────────────────

const TOOL_LABEL = {
  query_items: '검색',
  create_item: '항목 생성',
  update_item: '항목 수정',
  update_item_status: '상태 변경',
  add_comment: '코멘트 추가',
  create_area: '영역 생성',
  generate_report: '보고서 생성',
};

const stepArgSummary = ({ name, args }) => {
  if (name === 'query_items') {
    const parts = [];
    if (args.keyword) parts.push(`"${args.keyword}"`);
    if (args.item_type) parts.push(args.item_type);
    if (args.timeframe && args.timeframe !== 'all') parts.push(args.timeframe);
    return parts.join(' · ');
  }
  if (name === 'update_item') return args.item_id;
  if (name === 'update_item_status') return `${args.item_ids?.join(', ')} → ${args.new_status}`;
  if (name === 'add_comment') return args.item_id;
  if (name === 'create_item') return `[${args.type}] ${args.title}`;
  return '';
};

const stepResultSummary = ({ name, data }) => {
  if (name === 'query_items') return `${data.count}건 조회`;
  if (name === 'update_item_status') return `${data.updated}/${data.total}건 변경`;
  if (data?.success) return '완료';
  return data?.error ? `실패: ${data.error}` : '실패';
};

const StepTrace = ({ steps, isLive }) => (
  <div className="space-y-0.5">
    {steps.map((s, i) => (
      <div key={i} className="flex items-start gap-1.5 text-[10px] leading-snug">
        {s.type === 'think' && (
          <>
            <span className="flex-shrink-0 text-amber-500 mt-px">💭</span>
            <span className="text-stone-400 italic">{s.text}</span>
          </>
        )}
        {s.type === 'tool' && (
          <>
            <span className="flex-shrink-0 text-stone-400 mt-px">→</span>
            <span className="font-mono font-semibold text-stone-600 flex-shrink-0">
              {TOOL_LABEL[s.name] || s.name}
            </span>
            {stepArgSummary(s) && (
              <span className="text-stone-400 truncate">{stepArgSummary(s)}</span>
            )}
          </>
        )}
        {s.type === 'result' && (
          <>
            <span className="flex-shrink-0 text-emerald-500 mt-px">✓</span>
            <span className="text-stone-400">{stepResultSummary(s)}</span>
          </>
        )}
      </div>
    ))}
    {isLive && (
      <div className="flex items-center gap-0.5 pl-4 pt-0.5">
        {[0, 120, 240].map(d => (
          <span key={d} className="w-1 h-1 bg-stone-400 rounded-full animate-bounce"
            style={{ animationDelay: `${d}ms` }} />
        ))}
      </div>
    )}
  </div>
);

// ── Main component ──────────────────────────────────────────────

export default function FloatingChat({ storeCtx }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [expandedSteps, setExpandedSteps] = useState({});
  const { messages, loading, error, liveSteps, sendMessage, clearMessages } = useAgent(storeCtx);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const isComposing = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, liveSteps]);

  useEffect(() => {
    if (open) setTimeout(() => {
      inputRef.current?.focus();
      bottomRef.current?.scrollIntoView({ behavior: 'instant' });
    }, 50);
  }, [open]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    sendMessage(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing.current) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleSteps = (idx) =>
    setExpandedSteps(prev => ({ ...prev, [idx]: !prev[idx] }));

  const toolStepCount = (steps) => steps?.filter(s => s.type === 'tool').length ?? 0;

  return (
    <>
      {open && (
        <div className="fixed bottom-20 right-6 w-[420px] h-[580px] bg-white border border-stone-200 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 bg-stone-900 flex-shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-stone-300" />
              <span className="text-sm font-medium text-white">RAID Agent</span>
              <span className="text-[10px] text-stone-500 font-mono">ReAct</span>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button onClick={clearMessages}
                  className="text-stone-400 hover:text-stone-200 transition p-1 rounded hover:bg-stone-800" title="대화 초기화">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button onClick={() => setOpen(false)}
                className="text-stone-400 hover:text-stone-200 transition p-1 rounded hover:bg-stone-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && !loading && (
              <div className="text-center mt-10">
                <MessageSquare className="w-8 h-8 mx-auto mb-3 text-stone-300" />
                <p className="text-xs text-stone-400 leading-relaxed">
                  항목 조회, 생성, 상태 변경,<br />AI 보고서 생성을 도와드립니다.
                </p>
                <div className="mt-4 space-y-1.5">
                  {[
                    '1주 이내 Risk 조회해줘',
                    'R-01 기한 다음달 말로 바꿔줘',
                    'AI 보고서 만들어줘',
                  ].map(s => (
                    <button key={s} onClick={() => sendMessage(s)}
                      className="block w-full text-left text-xs text-stone-500 hover:text-stone-900 hover:bg-stone-50 px-3 py-2 rounded-lg border border-stone-100 hover:border-stone-200 transition">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                {msg.role === 'user' ? (
                  <div className="max-w-[80%] bg-stone-900 text-white text-sm px-3 py-2 rounded-2xl rounded-tr-sm">
                    <span className="whitespace-pre-wrap">{msg.content}</span>
                  </div>
                ) : (
                  <div className="max-w-[96%] space-y-1.5">
                    {/* Step trace toggle */}
                    {toolStepCount(msg.steps) > 0 && (
                      <button onClick={() => toggleSteps(i)}
                        className="flex items-center gap-1.5 text-[10px] text-stone-400 hover:text-stone-600 transition ml-1">
                        <span>{expandedSteps[i] ? '▾' : '▸'}</span>
                        <span>{toolStepCount(msg.steps)}단계 실행됨</span>
                      </button>
                    )}
                    {expandedSteps[i] && msg.steps?.length > 0 && (
                      <div className="bg-stone-50 border border-stone-100 rounded-xl px-3 py-2">
                        <StepTrace steps={msg.steps} isLive={false} />
                      </div>
                    )}
                    {/* Answer */}
                    <div className="text-sm px-3 py-2 rounded-2xl rounded-tl-sm bg-stone-50 border border-stone-200">
                      <div className="chat-md" dangerouslySetInnerHTML={{ __html: highlightIds(marked.parse(msg.content || '')) }} />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Live step trace while loading */}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[96%] bg-stone-50 border border-stone-100 rounded-2xl rounded-tl-sm px-3 py-2.5 min-w-[120px]">
                  {liveSteps.length > 0
                    ? <StepTrace steps={liveSteps} isLive={true} />
                    : (
                      <div className="flex items-center gap-1">
                        {[0, 150, 300].map(d => (
                          <span key={d} className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce"
                            style={{ animationDelay: `${d}ms` }} />
                        ))}
                      </div>
                    )
                  }
                </div>
              </div>
            )}

            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                오류: {error}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-stone-100 flex-shrink-0">
            <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus-within:border-stone-400 transition">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onCompositionStart={() => { isComposing.current = true; }}
                onCompositionEnd={() => { isComposing.current = false; }}
                placeholder="메시지를 입력하세요..."
                disabled={loading}
                className="flex-1 bg-transparent text-sm text-stone-900 placeholder:text-stone-400 outline-none"
              />
              <button onClick={handleSend} disabled={!input.trim() || loading}
                className="text-stone-400 hover:text-stone-900 disabled:opacity-30 transition flex-shrink-0">
                <SendIcon />
              </button>
            </div>
          </div>
        </div>
      )}

      <button onClick={() => setOpen(v => !v)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-stone-900 hover:bg-stone-800 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all z-50">
        {open ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
      </button>
    </>
  );
}
