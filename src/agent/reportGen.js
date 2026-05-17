import { AZURE_ENDPOINT, AZURE_DEPLOYMENT, AZURE_API_VERSION, AZURE_KEY, TERMINAL } from '../config/constants';

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

  const urgent = sorted.filter(i => { const d = daysLeft(i.dueDate); return d !== null && d <= 7; });
  const soon   = sorted.filter(i => { const d = daysLeft(i.dueDate); return d !== null && d > 7 && d <= 28; });

  const buildCtx = (i) => {
    const d = daysLeft(i.dueDate);
    const dueLabel = d !== null ? `${i.dueDate} (D${d >= 0 ? '-' : '+'}${Math.abs(d)})` : '기한 미정';
    const lastComment = (i.comments || []).slice(-1)[0];
    return [
      `  항목: [${i.type}] ${i.id} — ${i.title}`,
      `    상태: ${i.status} | 심각도: ${i.severity || '-'} | 담당: ${i.owner || '-'} | 기한: ${dueLabel}`,
      i.description ? `    내용: ${i.description}` : '',
      i.mitigation ? `    대응: ${i.mitigation}` : '',
      lastComment ? `    최신코멘트: [${lastComment.date}] ${lastComment.text}` : '',
    ].filter(Boolean).join('\n');
  };

  const groupByArea = (list) => {
    const map = {};
    list.forEach(i => {
      const areaName = areaMap[i.area]?.name || '영역 미지정';
      if (!map[areaName]) map[areaName] = [];
      map[areaName].push(i);
    });
    return map;
  };

  const renderGroup = (map) =>
    Object.entries(map).map(([area, list]) =>
      `[영역: ${area}]\n${list.map(buildCtx).join('\n\n')}`
    ).join('\n\n');

  const urgentBlock = urgent.length ? renderGroup(groupByArea(urgent)) : '(해당 없음)';
  const soonBlock   = soon.length   ? renderGroup(groupByArea(soon))   : '(해당 없음)';

  const prompt = `오늘은 ${todayStr}입니다. 전체 진행 중 항목 수: ${openItems.length}건

아래 데이터를 바탕으로 고객사 임원 보고용 RAID 요약 보고서를 작성하세요.
형식 규칙을 **엄격히** 준수하세요.

**형식 규칙**
- 총평은 정확히 3문장으로 작성
- 항목별 소제목: #### [타입] ID — 제목 (반드시 #### 4개 샵 사용)
- 영역 소제목: ### 영역명 (반드시 ### 3개 샵 사용)
- 세부 내용은 반드시 -(하이픈) 불릿으로 작성, 불릿 항목명은 **볼드**
- ID는 반드시 원본 그대로 표기 (예: R-01, A-03)

---

## 1. 총평

(3문장으로 작성: 전체 현황, 주요 우려사항, 긴급 대응 필요성)

## 2. 즉시 조치 필요 (1주 이내, ${urgent.length}건)

[영역별로 ### 소제목 → 항목별로 #### 소제목]
각 항목:
- **기한 및 현황**: ...
- **최신 진행상황**: (코멘트 반영, 없으면 "업데이트 없음")
- **리스크/영향**: ...
- **권고사항**: ...

## 3. 단기 주의 항목 (2~4주, ${soon.length}건)

[영역별로 ### 소제목 → 항목별로 #### 소제목]
각 항목:
- **기한 및 현황**: ...
- **권고사항**: ...

---

### 데이터

**즉시 조치 필요 (1주 이내)**
${urgentBlock}

**단기 주의 항목 (2~4주)**
${soonBlock}`;

  const url = `${AZURE_ENDPOINT}/openai/deployments/${AZURE_DEPLOYMENT}/chat/completions?api-version=${AZURE_API_VERSION}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': AZURE_KEY },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: '당신은 프로젝트 관리 전문가입니다. 주어진 형식 규칙을 정확히 따라 한국어 보고서를 작성합니다.' },
        { role: 'user', content: prompt },
      ],
      max_completion_tokens: 3000,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices[0].message.content;
}
