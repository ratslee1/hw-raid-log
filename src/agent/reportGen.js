import { AZURE_ENDPOINT, AZURE_DEPLOYMENT, AZURE_API_VERSION, AZURE_KEY, TERMINAL } from '../constants';

export const getReportCacheKey = () => `raid_report_${new Date().toISOString().slice(0, 10)}`;

export async function generateReportText(items, areaMap) {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const openItems = items.filter(i => !TERMINAL.includes(i.status));
  const daysLeft = (d) => d ? Math.ceil((new Date(d) - now) / 86400000) : null;

  const sorted = [...openItems].sort((a, b) => {
    const da = a.dueDate ? new Date(a.dueDate) : new Date('9999-12-31');
    const db = b.dueDate ? new Date(b.dueDate) : new Date('9999-12-31');
    return da - db;
  });

  const buildCtx = (i) => {
    const d = daysLeft(i.dueDate);
    const dueLabel = d !== null ? `기한: ${i.dueDate} (D${d >= 0 ? '-' : '+'}${Math.abs(d)})` : '기한 미정';
    const comments = (i.comments || []).slice(-3).map(c => `    💬 [${c.date}] ${c.text}`).join('\n');
    return [
      `▸ [${i.type}] ${i.id} — ${i.title}`,
      `  상태: ${i.status} | 심각도: ${i.severity || '-'} | 영역: ${areaMap[i.area]?.name || '-'} | 담당: ${i.owner || '-'} | ${dueLabel}`,
      i.description ? `  내용: ${i.description}` : '',
      i.mitigation ? `  대응: ${i.mitigation}` : '',
      comments,
    ].filter(Boolean).join('\n');
  };

  const urgent = sorted.filter(i => { const d = daysLeft(i.dueDate); return d !== null && d <= 14; });
  const soon   = sorted.filter(i => { const d = daysLeft(i.dueDate); return d !== null && d > 14 && d <= 30; });
  const later  = sorted.filter(i => { const d = daysLeft(i.dueDate); return d !== null && d > 30; }).slice(0, 5);
  const noDue  = sorted.filter(i => !i.dueDate).slice(0, 5);

  const sections = [];
  if (urgent.length) sections.push(`### 긴급 — 2주 이내 (${urgent.length}건)\n${urgent.map(buildCtx).join('\n\n')}`);
  if (soon.length)   sections.push(`### 단기 — 2~4주 (${soon.length}건)\n${soon.map(buildCtx).join('\n\n')}`);
  if (later.length)  sections.push(`### 중기 — 4주 이후 (상위 ${later.length}건)\n${later.map(buildCtx).join('\n\n')}`);
  if (noDue.length)  sections.push(`### 기한 미정 (${noDue.length}건)\n${noDue.map(buildCtx).join('\n\n')}`);

  const prompt = `오늘은 ${todayStr}입니다. 아래는 프로젝트 RAID 현황 데이터입니다.

고객사 임원 앞에서 대면 보고하는 상황이라고 가정하고, 아래 구조와 형식 규칙을 **엄격히** 따라 한국어로 보고서를 작성해 주세요.

**형식 규칙 (반드시 준수)**
- 각 항목은 반드시 ### 소제목으로 시작: ### [타입] ID — 제목 형식
- 소제목 아래 세부내용은 반드시 불릿(-)으로 작성, 줄글 금지
- 불릿 항목: 현황, 최신 진행상황, 리스크/영향, 권고 조치 순서로
- 총평과 종합 권고사항만 문장으로 작성 가능

---
## 1. 총평
(3~4문장. 전체 건강 상태, 주요 우려사항, 긍정적 진척 포함)

## 2. 즉시 조치 필요 (2주 이내)

### [타입] ID — 제목
- **현황**: ...
- **최신 진행상황**: (코멘트 반영)
- **리스크/영향**: ...
- **권고 조치**: ...

(위 형식으로 각 항목 반복)

## 3. 단기 주의 항목 (2~4주)

### [타입] ID — 제목
- **현황**: ...
- **권고 조치**: ...

(위 형식으로 각 항목 반복)

## 4. 종합 권고사항
- (액션 아이템 1)
- (액션 아이템 2)
- (액션 아이템 3)
---

${sections.join('\n\n')}`;

  const url = `${AZURE_ENDPOINT}/openai/deployments/${AZURE_DEPLOYMENT}/chat/completions?api-version=${AZURE_API_VERSION}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': AZURE_KEY },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: '당신은 프로젝트 관리 전문가입니다. 고객사 임원 보고에 적합한 명확하고 전문적인 한국어 보고서를 작성합니다.' },
        { role: 'user', content: prompt },
      ],
      max_completion_tokens: 3000,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices[0].message.content;
}
