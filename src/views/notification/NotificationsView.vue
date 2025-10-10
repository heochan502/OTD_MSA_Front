<script setup>
import { onMounted } from 'vue';
import { useNotificationStore } from '@/stores/notification/notification';
const n = useNotificationStore();
onMounted(() => n.load());
</script>

<template>
  <div class="screen">
    <header>내 소식</header>
    <button class="mark-all" @click="n.markAllRead()">모두 읽음 처리</button>

    <ul>
      <li
        v-for="it in n.items"
        :key="it.id"
        class="item"
        :class="{ unread: !it.read }"
        @click="n.markRead(it.id)"
      >
        <div class="title">{{ it.title }}</div>
        <div class="body">{{ it.body }}</div>
        <div class="time">{{ n.timeAgo(it.createdAt) }}</div>
      </li>
    </ul>

    <button class="demo" @click="n.pushDemo()">+ 데모 알림</button>
  </div>
</template>

<style scoped>
.screen {
  padding: 12px;
}
header {
  text-align: center;
  font-weight: 800;
  color: #07c5cf;
  margin-bottom: 8px;
}
.mark-all {
  font-size: 12px;
  color: #666;
  margin-bottom: 10px;
}
.item {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
  margin-bottom: 8px;
}
.item.unread {
  outline: 2px solid #e1fbff;
}
.title {
  font-weight: 700;
  color: #555;
  margin-bottom: 4px;
}
.body {
  color: #333;
}
.time {
  color: #999;
  font-size: 12px;
  margin-top: 6px;
}
.demo {
  position: fixed;
  right: 12px;
  bottom: 12px;
  border-radius: 999px;
  padding: 10px 14px;
  background: #ffd400;
  font-weight: 800;
}
</style>
