<script setup>
import { formatYMDHM } from '@/stores/community/date';

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
});
const emit = defineEmits(['click-post']);

function openPost(item) {
  emit('click-post', item);
}
</script>

<template>
  <div class="list-wrap">
    <article
      v-for="item in items"
      :key="item.id"
      class="post-card"
      @click="openPost(item)"
    >
      <header class="post-header">
        <div class="meta">
          <span class="author">{{ item.author }}</span>
          <span class="time"
            >· {{ formatYMDHM(item.createdAt || item.time) }}</span
          >
        </div>
      </header>

      <h3 class="title">{{ item.title }}</h3>

      <footer class="post-footer">
        <div class="stat">
          <span class="icon">❤️</span>
          <span>{{ item.likes }}</span>
        </div>
        <div class="stat">
          <span class="icon">💬</span>
          <span>{{ item.comments }}</span>
        </div>
      </footer>
    </article>

    <div v-if="items.length === 0" class="empty">아직 게시글이 없어요.</div>
  </div>
</template>

<style scoped>
.list-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 12px;
}

/* 카드 컨테이너(회색 섀도우 영역) */
.post-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 14px 12px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
  cursor: pointer;
}

.post-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.badge {
  background: #ffedcf;
  color: #ff9f1c;
  border-radius: 8px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 700;
}
.meta {
  font-size: 12px;
  color: #7a7a7a;
}
.author {
  font-weight: 600;
  color: #525252;
}

.title {
  margin: 8px 0 10px;
  font-size: 14px;
  color: #2f2f2f;
  font-weight: 700;
}

.post-footer {
  display: flex;
  gap: 14px;
}
.stat {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #6a6a6a;
  font-size: 12px;
}
.stat .icon {
  font-size: 14px;
  line-height: 1;
}

.empty {
  text-align: center;
  color: #9a9a9a;
  padding: 18px 0;
  font-size: 13px;
}
</style>
