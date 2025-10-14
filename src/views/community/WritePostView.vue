<script setup>
import { useRouter, useRoute } from 'vue-router';
import { computed } from 'vue';
import ComposeForm from '@/components/community/ComposeForm.vue';

const router = useRouter();
const route = useRoute();

// 라우트 파라미터를 반응형으로
const category = computed(() =>
  typeof route.params.category === 'string' ? route.params.category : 'free'
);

function onCancel() {
  router.back();
}

async function onSubmitted({ categoryKey, postId }) {
  // A) 지금처럼 카테고리 목록으로
  await router
    .push({
      name: 'CommunityCategory',
      params: { category: categoryKey },
      query: { posted: '1' },
    })
    .catch(() => {});

  // B) (선택) 방금 작성한 글 상세로 곧장 가고 싶다면 위 대신 아래 사용
  // if (postId) {
  //   await router.push({ name: 'CommunityPost', params: { id: String(postId) } }).catch(() => {});
  // }
}
</script>

<template>
  <!--key로 카테고리 변경 시 폼 리셋/재생성 보장 -->
  <ComposeForm
    :key="category"
    :category="category"
    mode="create"
    @cancel="onCancel"
    @submitted="onSubmitted"
  />
</template>
