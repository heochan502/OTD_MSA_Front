<script setup>
import { useRouter, useRoute } from 'vue-router';
import ComposeForm from '@/components/ComposeForm.vue';

const router = useRouter();
const route = useRoute();
const category =
  typeof route.params.category === 'string' ? route.params.category : 'free';

function onCancel() {
  router.back();
}
async function onSubmitted({ categoryKey }) {
  await router
    .push({
      name: 'CommunityCategory',
      params: { category: categoryKey },
      query: { posted: '1' },
    })
    .catch(() => {});
}
</script>

<template>
  <ComposeForm
    :category="category"
    @cancel="onCancel"
    @submitted="onSubmitted"
  />
</template>
