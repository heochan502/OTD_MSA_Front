<script setup>
import PostCard from './PostCard.vue';

defineProps({
  items: { type: Array, default: () => [] },
  emptyText: { type: String, default: '인기글이 아직 없어요.' },
  detailRouteName: { type: String, default: 'CommunityPost' },
  navigateOnClick: { type: Boolean, default: true },
  idKey: { type: String, default: 'postId' },
  routeParamKey: { type: String, default: 'id' },
  showBadge: { type: Boolean, default: true }, // 추가: 뱃지 표시 여부
  badgeText: { type: String, default: '인기' }, // 추가: 문구 변경 가능
});
defineEmits(['click-post']);
</script>

<template>
  <div class="list-wrap">
    <div
      v-for="item in items"
      :key="item?.[idKey] ?? item?.id ?? item?.postId"
      class="item-card"
    >
      <PostCard
        :post="item"
        :badge="showBadge ? badgeText : ''"
        :clickable="navigateOnClick"
        :route-name="detailRouteName"
        :route-param-key="routeParamKey"
        :id-key="idKey"
        @click="$emit('click-post', item)"
      />
    </div>

    <div v-if="items.length === 0" class="empty">{{ emptyText }}</div>
  </div>
</template>

<style scoped>
.list-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 2px;
}
.item-card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #eef1f4;
  box-shadow: 0 2px 8px rgba(17, 24, 39, 0.05);
  overflow: hidden;
  padding: 10px;
}
:deep(.post-card),
:deep(.card),
:deep(.v-card) {
  box-shadow: none !important;
  border: none !important;
  background: transparent !important;
  margin: 0 !important;
  padding: 0 !important;
}
:deep(.post-header) {
  display: grid;
  grid-template-columns: 44px 1fr 72px;
  align-items: center;
  column-gap: 10px;
}
:deep(.author-area),
:deep([class*='author']) {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 160px;
}
:deep(.author-name),
:deep([class*='name']) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
  font-weight: 700;
}
:deep(.post-meta),
:deep([class*='date']) {
  white-space: nowrap;
}
.empty {
  text-align: center;
  color: #9a9a9a;
  padding: 12px 0;
  font-size: 13px;
}
</style>
