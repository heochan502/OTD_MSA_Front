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
  padding: 2px;
}

/* 각 게시글 카드 컨테이너 */
.item-card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #eef1f4;
  box-shadow: 0 2px 8px rgba(17, 24, 39, 0.05);
  overflow: hidden;
  padding: 10px;
}

/* PostCard 자체 그림자 제거(패널 안에서 과하지 않도록) */
:deep(.post-card),
:deep(.card),
:deep(.v-card) {
  box-shadow: none !important;
  border: none !important;
  background: transparent !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* ▼▼ 닉네임 영역 확장 & 세로 쪼개짐 방지 ▼▼
   - PostCard 내부에 author 영역이 있다면 클래스를 아래처럼 붙이는 걸 권장:
     .post-header .author-area .author-name
   - 그래도 안 먹으면 범용 selector([class*="author"], [class*="name"])가 커버 */
:deep(.post-header) {
  display: grid;
  grid-template-columns: 44px 1fr 72px; /* avatar | author block | 우측버튼 */
  align-items: center;
  column-gap: 10px;
}

:deep(.author-area),          /* 권장 클래스 */
:deep([class*="author"]) {
  /* 범용: 'author' 포함 클래스 */
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 160px; /* 닉네임 영역 넉넉히 */
}

:deep(.author-name),          /* 권장 클래스 */
:deep([class*="name"]) {
  /* 범용: 'name' 포함 클래스 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px; /* 필요 시 조정 */
  font-weight: 700;
}

/* 타임스탬프가 이름 아래로 밀리지 않도록 줄바꿈 억제 */
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
