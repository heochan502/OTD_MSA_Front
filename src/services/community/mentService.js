import axios from '@/services/httpRequester';

const BASE = '/community';

/**
 * 공통 헤더 생성
 * - 게이트웨이/필터(UserHeaderAuthenticationFilter)와 호환을 위해
 *   X-User-Id / X-User-Roles / X-User-Nickname 헤더를 함께 전송
 * - 기존 백엔드가 X-MEMBER-ID를 참고하는 경우도 고려해 둘 다 보냄
 *
 * @param {number|string} userId
 * @param {object} headers (선택) { nickName?: string, rolesCsv?: string, 'X-User-Nickname'?: string, 'X-User-Roles'?: string }
 */
const withUser = (userId, headers = {}) => {
  const nick = headers.nickName ?? headers['X-User-Nickname'] ?? '';
  const roles = headers.rolesCsv ?? headers['X-User-Roles'] ?? '';

  return {
    ...headers,
    'Content-Type': 'application/json',

    // ✅ 새 필터 호환
    'X-User-Id': String(userId ?? 0),
    'X-User-Nickname': nick,
    'X-User-Roles': roles,

    // ✅ 기존 서버 호환(있으면 함께 보냄)
    'X-MEMBER-ID': String(userId ?? 0),
  };
};

/** 댓글 목록 조회 */
export const fetchMents = (postId) =>
  axios.get(`${BASE}/posts/${postId}/ments`);

/**
 * 댓글 생성
 * @param {number|string} postId
 * @param {string} content
 * @param {number|string} userId
 * @param {object} opts (선택) { nickName?: string, rolesCsv?: string }
 *
 * 예)
 * createMent(postId, content, me.userId, { nickName: me.nickName, rolesCsv: 'ROLE_USER' })
 * // 기존 호출도 그대로 동작: createMent(postId, content, me.userId)
 */
export const createMent = (postId, content, userId, opts = {}) =>
  axios.post(
    `${BASE}/posts/${postId}/ments`,
    { content },
    {
      headers: withUser(userId, opts),
    }
  );

/** 댓글 삭제 */
export const deleteMent = (mentId, userId, opts = {}) =>
  axios.delete(`${BASE}/ments/${mentId}`, {
    headers: withUser(userId, opts),
  });
