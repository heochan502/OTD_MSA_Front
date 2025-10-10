<script setup>
import { ref, onMounted, computed } from 'vue';
import { useCommentsStore } from '@/stores/community/comments';
import { useAuthenticationStore } from '@/stores/user/authentication';
import { formatYMDHM } from '@/stores/community/date';

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

async function submit() {
  const v = input.value.trim();
  if (!v) return;

  // ✅ 닉네임/권한 옵션을 store로 전달 (헤더에 실리도록)
  await commentsStore.add(props.postId, v, {
    nickName: meNickName.value,
    rolesCsv: 'ROLE_USER',
  });
  input.value = '';
}

async function removeOne(c) {
  await commentsStore.remove(c.commentId, props.postId);
}

// ✅ 내가 쓴 댓글 판별 (userId 기준)
const isMine = (c) => Number(c.userId) === Number(meUserId.value);

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
          <span class="avatar" aria-hidden="true"></span>
          <span class="nick">
            {{
              c.authorNickname || (c.userId === meUserId ? meNickName : '익명')
            }}
          </span>
          <span class="time">{{ formatYMDHM(c.createdAt) }}</span>

          <!-- ✅ 내 댓글일 때만 보이도록 -->
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
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #eaeaea;
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
