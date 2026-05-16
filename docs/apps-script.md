# Google Apps Script 설정 가이드

## 순서

1. [sheets.google.com](https://sheets.google.com) 에서 새 스프레드시트 생성
2. 하단 시트 탭 이름을 `RAID` 로 변경
3. 상단 메뉴 `확장 프로그램 > Apps Script` 클릭
4. 기존 코드 전체 삭제 후 아래 코드 붙여넣기 → 저장(Ctrl+S)
5. `배포 > 새 배포` 클릭
6. ⚙️ 아이콘 → `웹 앱` 선택
7. **다음 사용자로 실행**: 나 / **액세스 권한**: 모든 사용자
8. `배포` → 권한 승인 → **웹 앱 URL 복사**

---

## Code.gs (최신 버전 — GET으로 읽기/쓰기 통합)

> POST redirect 시 body 소실 문제를 우회하기 위해 `doGet` 단일 함수로 읽기·쓰기를 처리합니다.

```javascript
const SHEET_NAME = 'RAID';
const HEADERS = ['id','type','title','area','status','severity','owner','dueDate','createdAt','description','mitigation','comments'];

function doGet(e) {
  const action = e.parameter.action;

  if (action === 'save') {
    try {
      const items = JSON.parse(e.parameter.data);
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let sheet = ss.getSheetByName(SHEET_NAME);
      if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
      sheet.clearContents();
      sheet.appendRow(HEADERS);
      items.forEach(item => {
        sheet.appendRow([
          item.id||'', item.type||'', item.title||'', item.area||'',
          item.status||'', item.severity||'', item.owner||'',
          item.dueDate||'', item.createdAt||'',
          item.description||'', item.mitigation||'',
          JSON.stringify(item.comments||[])
        ]);
      });
      return ContentService.createTextOutput(JSON.stringify({ ok: true }))
        .setMimeType(ContentService.MimeType.JSON);
    } catch(err) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // action === 'load' (기본)
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON);
  }
  const headers = data[0];
  const rows = data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    try { obj.comments = JSON.parse(obj.comments || '[]'); } catch(e) { obj.comments = []; }
    return obj;
  });
  return ContentService.createTextOutput(JSON.stringify(rows))
    .setMimeType(ContentService.MimeType.JSON);
}
```

---

## 기존 배포 업데이트 방법

코드 수정 후 새 URL이 필요한 경우:
1. `배포 > 기존 배포 관리` 클릭
2. 연필(✏️) 아이콘 클릭
3. 버전: **새 버전** 선택
4. `배포` → URL 복사
