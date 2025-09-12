<script setup>
import { useRouter } from 'vue-router';

const props = defineProps({
  items: { type: Array, default: () => [] },
  emptyText: { type: String, default: '인기글이 아직 없어요.' },
  detailRouteName: { type: String, default: 'CommunityPost' },
  navigateOnClick: { type: Boolean, default: true },
});
const emit = defineEmits(['click-post']);
const router = useRouter();
function openPost(item) {
  if (props.navigateOnClick)
    router.push({
      name: props.detailRouteName,
      params: { id: String(item.id) },
    });
  else emit('click-post', item);
}
</script>

<template>
  <div class="list-wrap">
    <article
      v-for="item in items"
      :key="item.id"
      class="post-card"
      role="button"
      tabindex="0"
      @click="openPost(item)"
      @keydown.enter.space.prevent="openPost(item)"
    >
      <header class="post-header">
        <div class="badge">인기</div>
        <div class="meta">
          <span class="author">{{ item.author }}</span>
          <span class="time">· {{ item.time }}</span>
        </div>
      </header>
      <h3 class="title">{{ item.title }}</h3>
      <footer class="post-footer">
        <div class="stat">
          <span class="icon">❤️</span><span>{{ item.likes }}</span>
        </div>
        <div class="stat">
          <span class="icon">💬</span><span>{{ item.comments }}</span>
        </div>
      </footer>
    </article>

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
.post-card {
  background: #fff;
  border-radius: 14px;
  padding: 14px 12px;
  box-shadow: var(--shadow-md);
  cursor: pointer;
  outline: none;
}
.post-card:focus-visible {
  box-shadow: 0 0 0 2px var(--color-primary);
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
  padding: 12px 0;
  font-size: 13px;
}
</style>
