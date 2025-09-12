<script setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useCommunityStore } from '@/stores/community/community';

const route = useRoute();
const store = useCommunityStore();
const routeId = computed(() => String(route.params.id));

const post = computed(() => {
  const viaState = history.state?.post;
  if (viaState && String(viaState.id) === routeId.value) return viaState;
  return store.getById(routeId.value);
});

const myComment = ref('');
const like = () => {
  if (post.value) post.value.likes++;
};
const addComment = () => {
  if (!post.value || !myComment.value.trim()) return;
  post.value.comments++;
  myComment.value = '';
};
</script>

<template>
  <section v-if="post" class="detail">
    <h1 class="title">{{ post.title }}</h1>
    <div class="meta">
      <span class="avatar"></span>
      <span class="author">{{ post.author }}</span>
      <span class="time">· {{ post.time }}</span>
      <span class="sep">|</span>
      <button class="link danger">삭제하기</button>
    </div>

    <article class="content">{{ post.content }}</article>

    <div class="actions">
      <button class="btn-ghost" @click="like">❤️ {{ post.likes }}</button>
      <span class="caption">댓글 {{ post.comments }}개</span>
    </div>

    <div class="comment-box">
      <input
        class="input"
        v-model="myComment"
        placeholder="댓글을 입력하세요"
      />
      <button class="btn btn-primary" @click="addComment">등록</button>
    </div>
  </section>

  <section v-else class="detail"><p>글을 찾을 수 없습니다.</p></section>
</template>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  gap: var(--gap-md);
  padding: 0 var(--gap-lg) var(--gap-lg);
}
.title {
  font-size: var(--fs-category-bold);
  font-weight: 800;
}
.meta {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-typo-caption);
  font-size: 12px;
}
.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #eaeaea;
}
.author {
  color: var(--color-typo-secondary);
  font-weight: 600;
}
.link {
  background: none;
  border: none;
  color: var(--color-typo-secondary);
  cursor: pointer;
}
.link.danger {
  color: #ff595e;
}
.sep {
  color: #ddd;
  margin: 0 4px;
}
.content {
  white-space: pre-wrap;
  line-height: var(--lh-relaxed);
  color: var(--color-typo-primary);
}
.actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.btn-ghost {
  height: 36px;
  padding: 0 12px;
  border-radius: 999px;
  border: var(--border-1);
  background: #fff;
  cursor: pointer;
}
.comment-box {
  display: flex;
  gap: 8px;
}
.input {
  flex: 1;
  height: 40px;
  border: var(--border-1);
  border-radius: 12px;
  padding: 0 12px;
}
.btn {
  height: 40px;
  padding: 0 14px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
}
.btn-primary {
  background: var(--color-primary);
  color: #fff;
}
</style>
