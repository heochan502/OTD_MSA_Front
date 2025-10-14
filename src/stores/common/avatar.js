import { defineStore } from 'pinia';
import fallbackAvatar from '@/assets/img/common/avatar-default.png';

function isAbs(url) {
  return typeof url === 'string' && /^https?:\/\//i.test(url);
}

export const useAvatarStore = defineStore('avatar', {
  state: () => ({
    base: (import.meta.env.VITE_BASE_URL || '').replace(/\/$/, ''), // 끝 슬래시 제거
    fallback: fallbackAvatar,
    _handler: null, // 페이지 스코프 이미지 에러 핸들러
  }),

  actions: {
    /** 게시글/유저 객체에서 아바타 URL 조립 */
    buildFrom(post) {
      if (!post) return this.fallback;

      // 파일명 후보(백엔드 응답 케이스 폭 넓게)
      const file =
        post.profileFileName ??
        post.profileImg ??
        post.memberImg ??
        post.profile ??
        post.avatar ??
        '';

      // 작성자 식별자 후보
      const uid =
        post.writerId ??
        post.memberNoLogin ??
        post.memberId ??
        post.userId ??
        post.authorId ??
        '';

      // 절대 URL이면 그대로 사용
      if (isAbs(file)) return file;

      // 상대 경로면 서버 규칙대로 조립
      if (file && uid) {
        return `${this.base}/otd-api/profile/${uid}/${encodeURIComponent(
          file
        )}`;
      }

      // 없으면 기본 이미지
      return this.fallback;
    },

    /** 파일명/uid로 직접 조립하고 싶을 때 */
    build(uid, file) {
      if (isAbs(file)) return file;
      if (uid && file) {
        return `${this.base}/otd-api/profile/${uid}/${encodeURIComponent(
          file
        )}`;
      }
      return this.fallback;
    },

    /** 특정 뷰에서만: 404 이미지 → 기본 아바타로 자동 교체 */
    installPageScopedHandler() {
      if (this._handler) return;
      this._handler = (e) => {
        const el = e.target;
        if (!el || el.tagName !== 'IMG') return;
        if (el._fallbackApplied) return; // 무한루프 방지
        el._fallbackApplied = true;
        el.src = this.fallback;
      };
      // capture 단계에서 전역 이미지 에러를 잡음
      window.addEventListener('error', this._handler, true);
    },

    removeHandler() {
      if (!this._handler) return;
      window.removeEventListener('error', this._handler, true);
      this._handler = null;
    },
  },
});
