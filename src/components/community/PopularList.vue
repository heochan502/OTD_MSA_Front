<script setup>
import PostCard from './PostCard.vue';

defineProps({
  items: { type: Array, default: () => [] },
  emptyText: { type: String, default: '인기글이 아직 없어요.' },
  detailRouteName: { type: String, default: 'CommunityPost' },
  navigateOnClick: { type: Boolean, default: true },
  idKey: { type: String, default: 'postId' },
  routeParamKey: { type: String, default: 'id' },
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
        badge="인기"
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
  padding: 2px; /* 카드 가장자리에 공간 조금 */
}

/* 각 게시글 카드 */
.item-card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #eef1f4;
  box-shadow: 0 2px 8px rgba(17, 24, 39, 0.05);
  overflow: hidden;
  padding: 10px;
}

/* 만약 PostCard 자체에 그림자가 강하면 끄기 */
:deep(.post-card),
:deep(.card),
:deep(.v-card) {
  box-shadow: none !important;
  border: none !important;
  background: transparent !important;
  margin: 0 !important;
  padding: 0 !important;
}

.empty {
  text-align: center;
  color: #9a9a9a;
  padding: 12px 0;
  font-size: 13px;
}
</style>
