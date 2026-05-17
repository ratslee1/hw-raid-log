import { generateReportText, getReportCacheKey } from './reportGen';
import { TYPE_META, TERMINAL } from '../constants';

export const TOOL_SCHEMAS = [
  {
    type: 'function',
    function: {
      name: 'query_items',
      description: 'RAID 항목을 조회합니다. 기간별(단기/중기/장기), 타입, 영역으로 필터링 가능합니다.',
      parameters: {
        type: 'object',
        properties: {
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
  const { items = [], areas = [], areaMap = {}, createItem, createArea, transitionStatus } = storeCtx;

  if (name === 'query_items') {
    let result = args.include_closed ? [...items] : items.filter(i => !TERMINAL.includes(i.status));
    if (args.item_type) result = result.filter(i => i.type === args.item_type);
    if (args.area_name) {
      const q = args.area_name.toLowerCase();
      result = result.filter(i => areaMap[i.area]?.name?.toLowerCase().includes(q));
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
    return {
      count: result.length,
      items: result.slice(0, 20).map(i => {
        const d = dayDiff(i.dueDate);
        return {
          id: i.id, type: i.type, title: i.title, status: i.status,
          severity: i.severity || '-', area: areaMap[i.area]?.name || '-',
          owner: i.owner || '-',
          due: i.dueDate ? `${i.dueDate} (D${d >= 0 ? '-' : '+'}${Math.abs(d)})` : '기한없음',
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

  if (name === 'generate_report') {
    const text = await generateReportText(items, areaMap);
    localStorage.setItem(getReportCacheKey(), text);
    return { success: true, summary: text.slice(0, 1500) };
  }

  return { error: `Unknown tool: ${name}` };
}
