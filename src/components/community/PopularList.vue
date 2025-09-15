<script setup>
import PostCard from './PostCard.vue';

const props = defineProps({
  items: { type: Array, default: () => [] },
  emptyText: { type: String, default: '인기글이 아직 없어요.' },
  detailRouteName: { type: String, default: 'CommunityPost' },
  navigateOnClick: { type: Boolean, default: true },
  idKey: { type: String, default: 'postId' },
  routeParamKey: { type: String, default: 'id' },
});
const emit = defineEmits(['click-post']);
</script>

<template>
  <div class="list-wrap">
    <PostCard
      v-for="item in items"
      :key="item?.[idKey] ?? item?.id ?? item?.postId"
      :post="item"
      badge="인기"
      :clickable="navigateOnClick"
      :route-name="detailRouteName"
      :route-param-key="routeParamKey"
      :id-key="idKey"
      @click="emit('click-post', item)"
    />
    <div v-if="items.length === 0" class="empty">{{ emptyText }}</div>
  </div>
</template>

<style scoped>
.list-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 4px;
}
.empty {
  text-align: center;
  color: #9a9a9a;
  padding: 12px 0;
  font-size: 13px;
}
</style>
