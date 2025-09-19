

// 운동 리포트 관련 함수
export function filterExerciseLogsByDate(logs, dateStr) {
  return logs.filter((log) => log.startAt.startsWith(dateStr));
}

export function calcKcal(logs) {
  return logs.reduce((sum, log) => sum + (log.exerciseKcal || 0), 0);
}

export function calcEffortAvg(logs) {
  const sum = logs.reduce((acc, log) => acc + (log.effortLevel || 0), 0);
  return Math.round(sum / (logs.length || 1));
}



// 운동소요시간 계산
export const calcDuration = (startAt, endAt) => { // 운동 시작시점과 종료시점 받아옴
  if (!startAt || !endAt) return 0;

  // Date 객체로 변환
  const start = new Date(startAt);
  const end = new Date(endAt);

  // 밀리초 차이 계산
  const diffMs = end - start;
  if (diffMs < 0) return 0; // 안전하게 음수 처리

  // 분 단위로 변환
  const diffMinutes = Math.floor(diffMs / 1000 / 60);

  return diffMinutes;
};



