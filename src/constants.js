export const BIN_ID  = '69fc2157250b1311c315daf3';
export const API_KEY = '$2a$10$zDfNJNpyKC3f605QrYHKMuYqdiNkrs5qlC2J8CpqGBKdGgPjmIy2i';
export const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
export const CACHE_KEY = 'raid_cache';

export const AZURE_ENDPOINT   = 'https://aif-lsh-test-251127.cognitiveservices.azure.com';
export const AZURE_DEPLOYMENT = 'gpt-5.4-mini';
export const AZURE_API_VERSION = '2024-12-01-preview';
export const AZURE_KEY = import.meta.env.VITE_AZURE_OPENAI_KEY ?? '';

export const TYPE_META = {
  Risk:        { ko: '리스크',   desc: '아직 안 터졌는데 걱정되는 것',   tone: 'rose',    statuses: ['Identified', 'Assessed', 'Mitigating', 'Closed'] },
  Assumption:  { ko: '가정',     desc: '확인 안됐는데 믿고 가는 것',     tone: 'amber',   statuses: ['Pending', 'Validated', 'Invalidated'] },
  Issue:       { ko: '이슈',     desc: '이미 영향 발생한 것',             tone: 'violet',  statuses: ['Open', 'In Progress', 'Resolved', 'Closed'] },
  Dependency:  { ko: '의존성',   desc: '외부 없으면 못하는 것',           tone: 'emerald', statuses: ['Pending', 'Active', 'Blocked', 'Resolved'] },
};

export const TYPE_TONE = {
  rose:    { bg: 'bg-rose-50',    text: 'text-rose-700',    ring: 'ring-rose-200',    dot: 'bg-rose-500',    solid: 'bg-rose-600' },
  amber:   { bg: 'bg-amber-50',   text: 'text-amber-800',   ring: 'ring-amber-200',   dot: 'bg-amber-500',   solid: 'bg-amber-600' },
  violet:  { bg: 'bg-violet-50',  text: 'text-violet-700',  ring: 'ring-violet-200',  dot: 'bg-violet-500',  solid: 'bg-violet-600' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200', dot: 'bg-emerald-500', solid: 'bg-emerald-600' },
};

export const TRANSITIONS = {
  Risk:       { Identified: ['Assessed', 'Closed'], Assessed: ['Mitigating', 'Closed'], Mitigating: ['Closed'], Closed: ['Mitigating'] },
  Assumption: { Pending: ['Validated', 'Invalidated'], Validated: ['Pending'], Invalidated: ['Pending'] },
  Issue:      { Open: ['In Progress', 'Closed'], 'In Progress': ['Resolved', 'Open'], Resolved: ['Closed', 'In Progress'], Closed: ['Open'] },
  Dependency: { Pending: ['Active', 'Blocked'], Active: ['Resolved', 'Blocked'], Blocked: ['Active'], Resolved: ['Active'] },
};

export const STATUS_STYLES = {
  Identified:    'bg-stone-100 text-stone-700 ring-stone-200',
  Pending:       'bg-stone-100 text-stone-700 ring-stone-200',
  Open:          'bg-stone-100 text-stone-700 ring-stone-200',
  Assessed:      'bg-sky-50 text-sky-700 ring-sky-200',
  'In Progress': 'bg-sky-50 text-sky-700 ring-sky-200',
  Active:        'bg-sky-50 text-sky-700 ring-sky-200',
  Mitigating:    'bg-amber-50 text-amber-800 ring-amber-200',
  Blocked:       'bg-rose-50 text-rose-700 ring-rose-200',
  Invalidated:   'bg-rose-50 text-rose-700 ring-rose-200',
  Validated:     'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Resolved:      'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Closed:        'bg-stone-200/70 text-stone-500 ring-stone-300',
};

export const SEVERITY_STYLES = {
  Critical: 'bg-red-600 text-white',
  High:     'bg-orange-500 text-white',
  Medium:   'bg-amber-300 text-amber-950',
  Low:      'bg-sky-100 text-sky-700 ring-1 ring-sky-200',
};

export const SEVERITY_WEIGHT = { Critical: 4, High: 3, Medium: 2, Low: 1 };
export const SEVERITIES = ['Critical', 'High', 'Medium', 'Low'];
export const TERMINAL = ['Closed', 'Resolved', 'Validated', 'Invalidated'];
export const TYPE_ORDER = { Risk: 0, Assumption: 1, Issue: 2, Dependency: 3 };

export const TAG_PALETTE = [
  '#b85c58','#b87840','#9a8030','#3e9060',
  '#2a8880','#4070a8','#6858a0','#a85088',
  '#6a6060','#5a786a',
];

export const DEFAULT_AREAS = [
  { id: 'API',          name: '(툴)API 연동' },
  { id: 'ui_info',      name: 'UI 정보 (ui_info)' },
  { id: 'product_info', name: '상품 기준정보' },
  { id: '사용자 인증',   name: '사용자 인증' },
  { id: 'PII',          name: '개인정보 (PII)' },
  { id: 'eval_set',     name: '평가셋 작성' },
  { id: 'gpt_ptu',      name: '내부망 GPT PTU' },
];

export const INITIAL_ITEMS = [
  { id: 'I-01', type: 'Issue', title: '기간계 API 미연동', area: 'API', status: 'Open', severity: 'High', owner: '', dueDate: '2026-05-21', createdAt: '2026-05-06', description: '현재 API 호출 불가, 목킹으로만 개발 진행 중', mitigation: 'API 오픈 일정 확인 및 연동 필요', comments: [] },
  { id: 'R-01', type: 'Risk', title: '운영 시 오류 가능성', area: 'API', status: 'Identified', severity: 'High', owner: '', dueDate: '2026-05-21', createdAt: '2026-05-06', description: '목킹과 실제 API 차이로 오류 발생 가능', mitigation: '실 API 기반 테스트 필요', comments: [] },
  { id: 'A-01', type: 'Assumption', title: 'API 정상 제공 가정', area: 'API', status: 'Pending', severity: 'Medium', owner: '', dueDate: '2026-05-21', createdAt: '2026-05-06', description: '기간계 API가 추후 정상 제공될 것으로 가정', mitigation: 'API 제공 일정 확인', comments: [] },
  { id: 'D-01', type: 'Dependency', title: '기간계 시스템 연계를 통한 툴 개발 필요', area: 'API', status: 'Active', severity: 'High', owner: '', dueDate: '2026-05-21', createdAt: '2026-05-06', description: 'API 오픈, 권한, 네트워크 설정 필요', mitigation: '기간계 담당 부서 협의 필요', comments: [] },
  { id: 'R-02', type: 'Risk', title: 'ui_info 필드 활용 기준 미정', area: 'ui_info', status: 'Identified', severity: 'High', owner: '', dueDate: '2026-05-21', createdAt: '2026-05-06', description: 'ui_info 필드 정의는 확보했으나 에이전트 관점에서 어떤 필드를 사용해야 하는지 기준 부재로 구현 방향 불명확', mitigation: '에이전트 유스케이스 기준 필드 subset 정의 요청 및 샘플 기반 매핑 테이블 작성', comments: [] },
  { id: 'R-03', type: 'Risk', title: 'ui_info-에이전트 매핑 정의 부재', area: 'ui_info', status: 'Identified', severity: 'High', owner: '', dueDate: '2026-05-21', createdAt: '2026-05-06', description: 'ui_info 데이터 구조와 실제 에이전트 기능(UI 구성, 이벤트, 데이터 바인딩) 간 매핑 설계가 없음', mitigation: '화면/기능 단위 필드 매핑 정의 워크샵 진행', comments: [] },
  { id: 'R-04', type: 'Risk', title: '잘못된 데이터 사용으로 구현 오류 가능성', area: 'ui_info', status: 'Identified', severity: 'High', owner: '', dueDate: '2026-05-21', createdAt: '2026-05-06', description: '필요 필드 식별 없이 개발 진행 시 불필요 데이터 사용 또는 핵심 필드 누락으로 기능 오류 및 재작업 발생 가능', mitigation: '필드 정의 완료 전 핵심 기능 개발 제한 및 검증 프로세스 도입', comments: [] },
  { id: 'A-02', type: 'Assumption', title: 'ui_info 내 필요 정보 포함 가정', area: 'ui_info', status: 'Pending', severity: 'Medium', owner: '', dueDate: '2026-05-21', createdAt: '2026-05-06', description: '현재 제공된 ui_info 구조 내에 에이전트 구현에 필요한 정보가 포함되어 있을 것으로 가정', mitigation: '필수 정보 포함 여부 확인 필요', comments: [] },
  { id: 'D-02', type: 'Dependency', title: '에이전트 기준 필드 정의 필요', area: 'ui_info', status: 'Pending', severity: 'High', owner: '', dueDate: '2026-05-21', createdAt: '2026-05-06', description: 'ui_info 활용을 위해 UI/데이터 설계 담당자의 필드 정의 및 사용 기준 제공 필요', mitigation: '담당자 지정 및 정의 산출물 요청', comments: [] },
  { id: 'A-03', type: 'Assumption', title: '상품 기준정보는 이노룰스에서 구축한다고 가정', area: 'product_info', status: 'Pending', severity: 'Medium', owner: '', dueDate: '2026-05-21', createdAt: '2026-05-06', description: '정보계에서 상품정보 일배치로 받아서 최신성 유지한다고 가정', mitigation: '스키마 정보 or 실제 조회 가능일 확인 필요', comments: [] },
  { id: 'D-03', type: 'Dependency', title: '상품 기준정보 필요', area: 'product_info', status: 'Active', severity: 'High', owner: '', dueDate: '2026-05-21', createdAt: '2026-05-06', description: '판매중인 상품에 대한 정보(상품명, 상품코드, 판매개시일, 중지일, 구분 등)에 대한 postgreSQL 스키마 필요', mitigation: '담당자 지정 및 정의 산출물 요청', comments: [] },
  { id: 'D-04', type: 'Dependency', title: 'OIDC 문서 제공 의존', area: '사용자 인증', status: 'Pending', severity: 'High', owner: '', dueDate: '2026-05-21', createdAt: '2026-05-07', description: '인증 연동을 위해 고객사 OIDC 관련 문서 및 설정 정보(Client, Redirect URI, 인증 플로우 등) 제공 필요', mitigation: '고객사 대상 OIDC 문서 및 설정 정보 요청', comments: [] },
  { id: 'A-04', type: 'Assumption', title: 'OIDC 기반 인증 연동 가능 가정', area: '사용자 인증', status: 'Pending', severity: 'Medium', owner: '', dueDate: '2026-05-21', createdAt: '2026-05-07', description: '고객사 환경에서 표준 OIDC 기반 인증 연동이 가능할 것으로 가정', mitigation: 'OIDC 지원 범위 및 정책 확인 필요', comments: [] },
  { id: 'R-05', type: 'Risk', title: '인증 연동 설계 지연 가능성', area: '사용자 인증', status: 'Identified', severity: 'High', owner: '', dueDate: '2026-05-21', createdAt: '2026-05-07', description: 'OIDC 문서 미확보 상태 지속 시 인증 구조 설계 및 개발 일정 지연 가능', mitigation: '문서 수신 일정 확인 및 최소 필요 정보 우선 요청', comments: [] },
  { id: 'R-06', type: 'Risk', title: '인증 방식 불일치 가능성', area: '사용자 인증', status: 'Identified', severity: 'High', owner: '', dueDate: '2026-05-21', createdAt: '2026-05-07', description: '실제 고객 인증 구조와 현재 예상한 OIDC 플로우 간 차이 발생 가능', mitigation: '인증 시퀀스 및 토큰 처리 방식 사전 검토 필요', comments: [] },
  { id: 'D-05', type: 'Dependency', title: '고객사 DLP 솔루션 제공 의존', area: 'PII', status: 'Pending', severity: 'High', owner: '', dueDate: '2026-05-21', createdAt: '2026-05-07', description: 'PII 마스킹 및 개인정보 보호 처리를 위해 고객사 DLP 솔루션 및 연계 방식 제공 필요', mitigation: 'DLP 솔루션 제공 범위 및 연계 일정 확인', comments: [] },
  { id: 'A-05', type: 'Assumption', title: 'Azure PII Detection 임시 사용 가정', area: 'PII', status: 'Pending', severity: 'Medium', owner: '', dueDate: '2026-05-21', createdAt: '2026-05-07', description: '고객사 DLP 제공 전까지 Azure PII Detection 서비스로 개인정보 검출 기능을 대체 가능하다고 가정', mitigation: '임시 적용 범위 및 운영 가능 여부 확인', comments: [] },
  { id: 'R-07', type: 'Risk', title: 'DLP 연계 지연으로 인한 구조 변경 가능성', area: 'PII', status: 'Identified', severity: 'High', owner: '', dueDate: '2026-05-21', createdAt: '2026-05-07', description: '향후 고객사 DLP 적용 시 현재 Azure PII Detection 기반 구조와 차이 발생 가능', mitigation: 'DLP 연계 인터페이스 및 정책 사전 검토 필요', comments: [] },
  { id: 'R-08', type: 'Risk', title: 'PII 검출 정책 불일치 가능성', area: 'PII', status: 'Identified', severity: 'Medium', owner: '', dueDate: '2026-05-21', createdAt: '2026-05-07', description: 'Azure PII Detection 결과와 고객사 보안 정책 또는 DLP 검출 기준 간 차이 발생 가능', mitigation: '고객사 개인정보 검출 정책 및 예외 기준 확인 필요', comments: [] },
];
