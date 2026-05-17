import { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
import useAgent from '../hooks/useAgent';
import { MessageSquare, X, Trash2 } from './icons';

const ID_BADGE = {
  R: 'background:#fff0f0;color:#9f1239',
  A: 'background:#fffbeb;color:#92400e',
  I: 'background:#f5f3ff;color:#5b21b6',
  D: 'background:#ecfdf5;color:#065f46',
};

const highlightIds = (html) =>
  html.replace(/<code>([RAID]-\d{1,3})<\/code>/g, (_, id) => {
    const style = ID_BADGE[id[0]] || 'background:#f5f5f4;color:#292524';
    return `<span style="${style};font-family:monospace;font-size:.71rem;font-weight:700;padding:1px 6px;border-radius:4px;display:inline-block;line-height:1.5">${id}</span>`;
  });

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
       fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
  </svg>
);

export default function FloatingChat({ storeCtx }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, loading, error, sendMessage, clearMessages } = useAgent(storeCtx);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const isComposing = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
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

  return (
    <>
      {open && (
        <div className="fixed bottom-20 right-6 w-96 h-[560px] bg-white border border-stone-200 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 bg-stone-900 flex-shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-stone-300" />
              <span className="text-sm font-medium text-white">RAID Agent</span>
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

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && !loading && (
              <div className="text-center mt-10">
                <MessageSquare className="w-8 h-8 mx-auto mb-3 text-stone-300" />
                <p className="text-xs text-stone-400 leading-relaxed">
                  항목 조회, 생성, 상태 변경,<br />AI 보고서 생성을 도와드립니다.
                </p>
                <div className="mt-4 space-y-1.5">
                  {['단기 1주 이내 Risk 조회해줘', 'R-01 상태를 Mitigating으로 변경해줘', 'AI 보고서 만들어줘'].map(s => (
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
                <div className={
                  msg.role === 'user'
                    ? 'max-w-[80%] bg-stone-900 text-white text-sm px-3 py-2 rounded-2xl rounded-tr-sm'
                    : 'max-w-[92%] text-sm px-3 py-2 rounded-2xl rounded-tl-sm bg-stone-50 border border-stone-200'
                }>
                  {msg.role === 'user'
                    ? <span className="whitespace-pre-wrap">{msg.content}</span>
                    : <div className="chat-md" dangerouslySetInnerHTML={{ __html: highlightIds(marked.parse(msg.content || '')) }} />
                  }
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-stone-50 border border-stone-200 px-4 py-3 rounded-2xl rounded-tl-sm">
                  <div className="flex items-center gap-1.5">
                    {[0, 150, 300].map(d => (
                      <span key={d} className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
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
