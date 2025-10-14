<!-- src/views/community/EditPostView.vue -->
<script setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ComposeForm from '@/components/community/ComposeForm.vue';
import { useCommunityStore } from '@/stores/community/community';

const route = useRoute();
const router = useRouter();
const store = useCommunityStore();

const id = computed(() => String(route.params.id));
const post = computed(() => store.getById(id.value));

onMounted(async () => {
  if (!post.value) {
    await store.loadPostDetail(id.value);
  }
});

function onCancel() {
  router.back();
}

// 수정 완료 후 상세로 복귀
async function onSubmitted() {
  await router
    .push({ name: 'CommunityPost', params: { id: id.value } })
    .catch(() => {});
}
</script>

<template>
  <div class="edit-wrap">
    <ComposeForm
      v-if="post"
      mode="edit"
      :category="post.category || 'free'"
      :initial="{
        id: post.id ?? post.postId,
        title: post.title ?? '',
        content: post.content ?? '',
      }"
      @cancel="onCancel"
      @submitted="onSubmitted"
    />
    <div v-else class="hint">불러오는 중…</div>
  </div>
</template>

<style scoped>
.edit-wrap {
  display: flex;
  justify-content: center; /* 가로 중앙 */
  align-items: center; /* 세로 중앙 */
  height: 100vh; /* 전체 화면 중앙 기준 */
  background: rgba(0, 0, 0, 0.45); /* 작성 화면처럼 반투명 배경 (선택) */
  backdrop-filter: blur(2px); /* 선택: 흐림 효과 */
  z-index: 999;
}

.hint {
  text-align: center;
  color: #8b8b8b;
  font-size: 12px;
  padding: 16px 0;
}
</style>
