<script setup>
import { ref, onMounted, computed } from 'vue';
import { useCommentsStore } from '@/stores/community/comments';
import { useAuthenticationStore } from '@/stores/user/authentication';
import { formatYMDHM } from '@/stores/community/date';
import axios from '@/services/httpRequester';

const props = defineProps({
  postId: { type: [String, Number], required: true },
});

const commentsStore = useCommentsStore();
const auth = useAuthenticationStore();

const loading = computed(() => commentsStore.isLoading(props.postId));
const comments = computed(() => commentsStore.list(props.postId));
const count = computed(() => commentsStore.count(props.postId));

const input = ref('');
const meUserId = computed(() => auth.state.signedUser?.userId || 0);
const meNickName = computed(() => auth.state.signedUser?.nickName || '회원');
const myRole = computed(() => auth.state.signedUser?.userRole || '');

const DEFAULT_AVATAR =
  import.meta.env.BASE_URL + 'image/main/default-profile.png';

function toAbsUrl(p) {
  if (!p) return '';
  // 1) data URI/절대 URL은 그대로
  if (/^data:image\//i.test(p)) return p;
  if (/^https?:\/\//i.test(p)) return p;
  if (p.startsWith('//')) return window.location.protocol + p;
  // 2) 프론트 정적 경로는 프론트 BASE_URL과 합치기 (백엔드 baseURL로 바꾸지 말기)
  if (p.startsWith('/otd/')) return p;
  // 3) 그 외 상대경로는 백엔드 baseURL 기준으로 절대화
  try {
    return new URL(p, axios.defaults.baseURL).toString();
  } catch {
    const clean = p.replace(/^\.?\//, '');
    return '/' + clean;
  }
}

/** 댓글 프로필도 profile 우선 */
function getAvatar(c) {
  const raw =
    c.profile || // 백엔드에서 내려주는 댓글 작성자 프로필(있다면)
    c.profilePath ||
    c.profileUrl ||
    c.memberImg ||
    c.profileImg ||
    c.profileImage ||
    c.writer?.memberImg ||
    '';
  // 기본 이미지 경로는 프론트 자산으로 고정
  if (!raw) return DEFAULT_AVATAR;
  if (raw.startsWith('/otd/')) return raw;
  const url = toAbsUrl(raw);

  return url || DEFAULT_AVATAR;
}

async function submit() {
  const v = input.value.trim();
  if (!v) return;
  await commentsStore.add(props.postId, v, { nickName: meNickName.value });
  input.value = '';
}

async function removeOne(c) {
  await commentsStore.remove(c.commentId, props.postId, myRole.value);
}

const isMine = (c) => {
  if (myRole.value === 'ADMIN') return true;
  return Number(c.userId) === Number(meUserId.value);
};

onMounted(() => {
  commentsStore.load(props.postId);
});
</script>

<template>
  <section class="comments">
    <h3 class="title">댓글 {{ count }}개</h3>

    <div class="write">
      <input
        class="input"
        v-model="input"
        :disabled="loading"
        placeholder="댓글을 입력하세요"
        @keydown.enter.prevent="submit"
      />
      <button class="btn" :disabled="loading || !input.trim()" @click="submit">
        등록
      </button>
    </div>

    <div class="list" v-if="!loading && comments.length">
      <div v-for="c in comments" :key="c.commentId" class="item">
        <div class="meta">
          <div class="avatar">
            <img
              :src="getAvatar(c)"
              alt="프로필"
              @error="(e) => (e.target.src = DEFAULT_AVATAR)"
            />
          </div>
          <span class="nick">{{ c.nickName || '익명' }}</span>
          <span class="time">{{ formatYMDHM(c.createdAt) }}</span>

          <button v-if="isMine(c)" class="del" @click="removeOne(c)">
            삭제
          </button>
        </div>
        <p class="content">{{ c.content }}</p>
      </div>
    </div>

    <div v-else-if="loading" class="empty">불러오는 중…</div>
    <div v-else class="empty">첫 댓글을 남겨보세요!</div>
  </section>
</template>

<style scoped>
.comments {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.title {
  font-size: 14px;
  font-weight: 800;
  color: #2b2b2b;
}
.write {
  display: flex;
  gap: 8px;
}
.input {
  flex: 1;
  height: 38px;
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  padding: 0 10px;
}
.btn {
  height: 38px;
  padding: 0 12px;
  border: none;
  border-radius: 10px;
  background: #00d5df;
  color: #fff;
  cursor: pointer;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.item {
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}
.meta {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #777;
}
.avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  overflow: hidden;
  background: #eaeaea;
}
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.nick {
  font-weight: 700;
  color: #333;
}
.time {
  font-size: 12px;
  color: #999;
}
.del {
  margin-left: auto;
  background: none;
  border: none;
  color: #ff595e;
  cursor: pointer;
}
.content {
  margin: 4px 0 0;
  white-space: pre-wrap;
  line-height: 1.5;
  color: #303030;
}
.empty {
  color: #9aa3af;
  font-size: 13px;
}
</style>
