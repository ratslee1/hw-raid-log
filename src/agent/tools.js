import { generateReportText, getReportCacheKey } from './reportGen';
import { TYPE_META, TERMINAL } from '../config/constants';

export const TOOL_SCHEMAS = [
  {
    type: 'function',
    function: {
      name: 'think',
      description: '행동 전 상황을 분석하고 다음 단계를 계획합니다. 매 질의의 첫 번째 호출로 반드시 사용하세요.',
      parameters: {
        type: 'object',
        properties: {
          reasoning: {
            type: 'string',
            description: '사용자 의도 파악, 필요한 툴·파라미터·검색 키워드를 2~3문장으로 분석 (한국어)',
          },
        },
        required: ['reasoning'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'query_items',
      description: 'RAID 항목을 조회합니다. 목록 조회(기본)와 상세 조회(detail:true)를 지원합니다. 특정 항목의 설명·대응방안·코멘트·연관항목이 필요하면 detail:true를 사용하세요.',
      parameters: {
        type: 'object',
        properties: {
          item_ids: {
            type: 'array',
            items: { type: 'string' },
            description: '특정 항목 ID 목록으로 조회 (예: ["D-07", "R-01"]). 지정하면 다른 필터는 무시됩니다.',
          },
          keyword: {
            type: 'string',
            description: '제목·설명·대응방안·코멘트 전체에서 키워드 검색 (공백 구분 시 OR 조건).',
          },
          timeframe: {
            type: 'string',
            enum: ['short', 'medium', 'long', 'no_due', 'all'],
            description: 'short: 1주 이내(≤7일), medium: 1~3주(8~21일), long: 3주 초과(>21일), no_due: 기한없음, all: 전체',
          },
          item_type: {
            type: 'string',
            enum: ['Risk', 'Assumption', 'Issue', 'Dependency'],
            description: '조회할 타입 (미지정 시 전체)',
          },
          include_closed: {
            type: 'boolean',
            description: '종결 항목 포함 여부 (기본 false)',
          },
          area_name: {
            type: 'string',
            description: '영역 이름 필터 (부분 일치)',
          },
          detail: {
            type: 'boolean',
            description: '상세 조회 여부. true이면 설명(description), 대응방안(mitigation), 코멘트 전체, 연관항목 ID, 생성일을 포함합니다. 특정 항목의 진행상황·내용 파악 시 사용하세요.',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_item',
      description: '새 RAID 항목을 생성합니다.',
      parameters: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['Risk', 'Assumption', 'Issue', 'Dependency'] },
          title: { type: 'string', description: '항목 제목' },
          area_name: { type: 'string', description: '영역 이름 (부분 일치 검색)' },
          severity: { type: 'string', enum: ['Critical', 'High', 'Medium', 'Low', 'None'], description: '심각도 (기본 Medium)' },
          owner: { type: 'string', description: '담당자' },
          due_date: { type: 'string', description: '기한 (YYYY-MM-DD)' },
          description: { type: 'string' },
          mitigation: { type: 'string', description: '대응 방안' },
        },
        required: ['type', 'title'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_area',
      description: '새 영역을 생성합니다.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: '영역 이름' },
        },
        required: ['name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_item_status',
      description: '하나 또는 여러 항목의 상태를 업데이트합니다.',
      parameters: {
        type: 'object',
        properties: {
          item_ids: {
            type: 'array',
            items: { type: 'string' },
            description: '업데이트할 항목 ID 목록 (예: ["R-01", "I-03"])',
          },
          new_status: { type: 'string', description: '변경할 상태 값 (예: In Progress, Closed, Resolved)' },
        },
        required: ['item_ids', 'new_status'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_item',
      description: '항목의 필드(제목, 설명, 심각도, 담당자, 기한, 대응방안, 영역 등)를 수정합니다.',
      parameters: {
        type: 'object',
        properties: {
          item_id: { type: 'string', description: '수정할 항목 ID (예: R-01)' },
          title: { type: 'string' },
          description: { type: 'string' },
          mitigation: { type: 'string' },
          severity: { type: 'string', enum: ['Critical', 'High', 'Medium', 'Low', 'None'] },
          owner: { type: 'string' },
          due_date: { type: 'string', description: 'YYYY-MM-DD 또는 빈 문자열로 기한 제거' },
          area_name: { type: 'string', description: '영역 이름 (부분 일치)' },
        },
        required: ['item_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_comment',
      description: '특정 RAID 항목에 코멘트를 추가합니다.',
      parameters: {
        type: 'object',
        properties: {
          item_id: { type: 'string', description: '코멘트를 추가할 항목 ID (예: R-01)' },
          text: { type: 'string', description: '코멘트 내용' },
        },
        required: ['item_id', 'text'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'generate_report',
      description: 'AI 요약 보고서를 생성합니다. 생성된 보고서는 당일 캐시됩니다.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
];

const dayDiff = (dueDate) => {
  if (!dueDate) return null;
  return Math.ceil((new Date(dueDate) - new Date()) / 86400000);
};

export async function executeTool(name, args, storeCtx) {
  const { items = [], areas = [], areaMap = {}, createItem, updateItem, createArea, transitionStatus, addComment } = storeCtx;

  if (name === 'query_items') {
    let result;

    // ID 지정 조회 — 다른 필터 무시
    if (args.item_ids?.length) {
      const idSet = new Set(args.item_ids);
      result = items.filter(i => idSet.has(i.id));
    } else {
      result = args.include_closed ? [...items] : items.filter(i => !TERMINAL.includes(i.status));
      if (args.item_type) result = result.filter(i => i.type === args.item_type);
      if (args.area_name) {
        const q = args.area_name.toLowerCase();
        result = result.filter(i => areaMap[i.area]?.name?.toLowerCase().includes(q));
      }
      if (args.keyword) {
        const keywords = args.keyword.toLowerCase().split(/\s+/).filter(Boolean);
        result = result.filter(i => {
          const corpus = [
            i.title, i.description, i.mitigation,
            ...(i.comments || []).map(c => c.text),
          ].join(' ').toLowerCase();
          return keywords.some(k => corpus.includes(k));
        });
      }
      if (args.timeframe && args.timeframe !== 'all') {
        result = result.filter(i => {
          const d = dayDiff(i.dueDate);
          if (args.timeframe === 'no_due') return d === null;
          if (d === null) return false;
          if (args.timeframe === 'short') return d <= 7;
          if (args.timeframe === 'medium') return d > 7 && d <= 21;
          if (args.timeframe === 'long') return d > 21;
          return true;
        });
      }
    }

    return {
      count: result.length,
      items: result.slice(0, 20).map(i => {
        const d = dayDiff(i.dueDate);
        const base = {
          id: i.id, type: i.type, title: i.title, status: i.status,
          severity: i.severity || '-', area: areaMap[i.area]?.name || '-',
          owner: i.owner || '-',
          due: i.dueDate ? `${i.dueDate} (D${d >= 0 ? '-' : '+'}${Math.abs(d)})` : '기한없음',
        };
        if (!args.detail) return base;
        return {
          ...base,
          createdAt: i.createdAt || '',
          description: i.description || '',
          mitigation: i.mitigation || '',
          relatedIds: i.relatedIds || [],
          comments: (i.comments || []).map(c => `[${c.date}] ${c.author}: ${c.text}`),
        };
      }),
    };
  }

  if (name === 'create_item') {
    let areaId = null;
    if (args.area_name) {
      const q = args.area_name.toLowerCase();
      const found = areas.find(a => a.name.toLowerCase().includes(q));
      areaId = found?.id ?? null;
    }
    const defaultStatus = TYPE_META[args.type]?.statuses?.[0] ?? 'Open';
    createItem({
      type: args.type,
      title: args.title,
      area: areaId,
      status: defaultStatus,
      severity: args.severity || 'Medium',
      owner: args.owner || '',
      dueDate: args.due_date || '',
      description: args.description || '',
      mitigation: args.mitigation || '',
    });
    return { success: true, message: `"${args.title}" (${args.type}) 항목이 생성되었습니다.` };
  }

  if (name === 'create_area') {
    createArea(args.name);
    return { success: true, message: `영역 "${args.name}"이 생성되었습니다.` };
  }

  if (name === 'update_item_status') {
    const results = [];
    for (const id of args.item_ids) {
      const item = items.find(i => i.id === id);
      if (!item) { results.push({ id, success: false, error: '항목을 찾을 수 없습니다' }); continue; }
      transitionStatus(id, args.new_status);
      results.push({ id, title: item.title, success: true });
    }
    return { updated: results.filter(r => r.success).length, total: args.item_ids.length, results };
  }

  if (name === 'update_item') {
    const item = items.find(i => i.id === args.item_id);
    if (!item) return { success: false, error: `항목 ${args.item_id}을 찾을 수 없습니다` };
    const upd = {};
    if (args.title !== undefined) upd.title = args.title;
    if (args.description !== undefined) upd.description = args.description;
    if (args.mitigation !== undefined) upd.mitigation = args.mitigation;
    if (args.severity !== undefined) upd.severity = args.severity;
    if (args.owner !== undefined) upd.owner = args.owner;
    if (args.due_date !== undefined) upd.dueDate = args.due_date;
    if (args.area_name !== undefined) {
      const found = areas.find(a => a.name.toLowerCase().includes(args.area_name.toLowerCase()));
      upd.area = found?.id ?? null;
    }
    updateItem(args.item_id, upd);
    return { success: true, updated: Object.keys(upd), message: `\`${args.item_id}\` 수정 완료` };
  }

  if (name === 'add_comment') {
    const item = items.find(i => i.id === args.item_id);
    if (!item) return { success: false, error: `항목 ${args.item_id}을 찾을 수 없습니다` };
    addComment(args.item_id, args.text);
    return { success: true, message: `\`${args.item_id}\`에 코멘트가 추가되었습니다.` };
  }

  if (name === 'generate_report') {
    const text = await generateReportText(items, areaMap);
    localStorage.setItem(getReportCacheKey(), text);
    return { success: true, summary: text.slice(0, 1500) };
  }

  return { error: `Unknown tool: ${name}` };
}
