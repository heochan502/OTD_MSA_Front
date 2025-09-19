// 오늘 날짜
export function getDateString(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60000; // 분 → ms
  const localDate = new Date(date.getTime() - offset);
  return localDate.toISOString().split("T")[0];
}
// 어제날짜
export function getYesterdayDateString(date = new Date()) {
  const yesterday = new Date(date);
  yesterday.setDate(date.getDate() - 1);
  return yesterday.toISOString().split("T")[0];
}

// 날짜 포맷 함수 'YYYY년 MM월 DD일'
export const formatDateKR = (dateStr) => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
};

// 날짜 포맷 함수 'YYYY-MM-DD'
export const formatDateISO = (dateStr) => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

// 시간 포맷 함수 'HH시 MM분'
export const formatTimeKR = (datetimeStr) => {
  const date = new Date(datetimeStr);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${hours}시 ${minutes}분`;
};
