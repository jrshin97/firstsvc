// app.js
// - 엔터/검색 버튼으로 조회
// - (샘플) 학번+이름 -> 구글 계정 ID(이메일)만 반환
// - PW는 표시하지 않음 (보안상)

(() => {
  // ===== DOM =====
  const form = document.getElementById("searchForm");
  const studentIdInput = document.getElementById("studentId");
  const studentNameInput = document.getElementById("studentName");

  const helperText = document.getElementById("helperText");
  const statusBox = document.getElementById("statusBox");
  const resultBox = document.getElementById("resultBox");

  const resultEmail = document.getElementById("resultEmail");
  const resultPassword = document.getElementById("resultPassword");
  const resetLink = document.getElementById("resetLink");

  // ===== 샘플 데이터 (나중에 서버/DB로 교체) =====
  // key 규칙: `${학번}|${이름}`
  const ACCOUNT_DB = new Map([
    ["1101|홍길동", { email: "1101.honggildong@school.edu" }],
    ["1207|김민지", { email: "1207.kimminji@school.edu" }],
    ["2303|이준호", { email: "2303.leejunho@school.edu" }],
  ]);
  const inko = new Inko();

  // 비밀번호 초기화 안내 링크(원하는 URL로 교체)
  const PASSWORD_RESET_GUIDE_URL = "https://support.google.com/accounts/answer/41078?hl=ko";

  // ===== 유틸 =====
  const normalizeStudentId = (v) => String(v ?? "").trim();
  const normalizeName = (v) => String(v ?? "").trim().replace(/\s+/g, ""); // 중간 공백 제거(선택)

  const buildNameCandidates = (rawName) => {
  const base = normalizeName(rawName); // 공백 제거 + trim
  const candidates = new Set();

  if (base) candidates.add(base);

  // 영어가 섞여 있으면 영타 -> 한글 변환 후보 추가
  // (예: "ghdrlfehd" -> "홍길동")
  if (/[a-zA-Z]/.test(base)) {
    const converted = normalizeName(inko.en2ko(base));
    if (converted) candidates.add(converted);
  }

  return [...candidates];
};


  const setStatus = (msg) => {
    statusBox.textContent = msg || "";
  };

  const setHelper = (msg) => {
    helperText.textContent = msg || "";
  };

  const hideResult = () => {
    resultBox.hidden = true;
    resultEmail.textContent = "-";
    // PW는 애초에 표시 안 함(문구는 HTML 기본값 유지)
  };

  const showResult = ({ email }) => {
    resultBox.hidden = false;
    resultEmail.textContent = email;

    // 비밀번호는 표시하지 않음
    if (resultPassword) {
      resultPassword.textContent = "보안상 표시하지 않습니다. (초기화 필요)";
    }

    if (resetLink) {
      resetLink.href = PASSWORD_RESET_GUIDE_URL;
    }
  };

  // ===== “검색” 로직 (지금은 로컬 Map, 나중에 fetch로 교체) =====
  const findAccount = async (studentId, studentName) => {
    // 실제 서버가 있다면 여기에서 fetch 호출로 바꾸면 됨.
    // 예: return fetch('/api/search', { ... }).then(r => r.json());

    // UX용: 로딩처럼 보이게 아주 짧게 지연
    await new Promise((r) => setTimeout(r, 250));

    const key = `${studentId}|${studentName}`;
    return ACCOUNT_DB.get(key) || null;
  };

  // ===== 이벤트 =====
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setHelper("");
    hideResult();

    const studentId = normalizeStudentId(studentIdInput.value);

    const nameCandidates = buildNameCandidates(studentNameInput.value);

if (!studentId || nameCandidates.length === 0) {
  setStatus("학번과 이름을 모두 입력해 주세요.");
  return;
}

setStatus("검색 중...");

try {
  let account = null;

  // 후보 이름들로 순차 검색 (원본 이름 → 변환된 이름)
  for (const candidateName of nameCandidates) {
    account = await findAccount(studentId, candidateName);
    if (account) break;
  }

  if (!account) {
    setStatus("일치하는 계정이 없습니다. 학번/이름을 확인해 주세요.");
    return;
  }

  setStatus("조회 완료");
  showResult(account);
} catch (err) {
  console.error(err);
  setStatus("오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
}


    
    // const studentName = normalizeName(studentNameInput.value);

    // if (!studentId || !studentName) {
    //   setStatus("학번과 이름을 모두 입력해 주세요.");
    //   return;
    // }

    // setStatus("검색 중...");

    // try {
    //   const account = await findAccount(studentId, studentName);

    //   if (!account) {
    //     setStatus("일치하는 계정이 없습니다. 학번/이름을 확인해 주세요.");
    //     return;
    //   }

    //   setStatus("조회 완료");
    //   showResult(account);
    // } catch (err) {
    //   console.error(err);
    //   setStatus("오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    // }
  });

  form.addEventListener("reset", () => {
    setHelper("");
    setStatus("");
    hideResult();

    // 포커스 UX
    setTimeout(() => studentIdInput.focus(), 0);
  });

  // 초기 상태
  hideResult();
  setStatus("");
  if (resetLink) resetLink.href = PASSWORD_RESET_GUIDE_URL;
})();
