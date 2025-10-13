<!-- src/views/notification/NotificationsView.vue -->
<script setup>
import { ref } from 'vue';

// --- 더미 알림 데이터 ---
const items = ref([
  {
    id: 1,
    title: '업데이트 안내',
    body: '지난 번 업데이트에서 발생한 오류들을 수정하고 식사 시간 입력, 음식 자유 입력 등 기능 몇 가지를 보완했어요. 일부 기기 이용 시 소음과 오작동이 발생했어도 더욱 매끄럽게 필수 업데이트로 진행될 예정인 점 양해 부탁드립니다.',
    category: 'system',
    read: false,
    createdAt: Date.now() - 2 * 60 * 60 * 1000,
    announce: true,
  },
  {
    id: 2,
    title: '커뮤니티',
    body: '한이월드 님이 댓글을 남겼습니다. 운동 잘한다!',
    category: 'comment',
    read: false,
    createdAt: Date.now() - 15 * 60 * 60 * 1000,
  },
  {
    id: 3,
    title: '커뮤니티',
    body: '따뜻한스무디 님이 댓글을 남겼습니다. 봉산동에 분위기 좋은 카페 많음',
    category: 'comment',
    read: false,
    createdAt: Date.now() - 15 * 60 * 60 * 1000,
  },
  {
    id: 4,
    title: '커뮤니티',
    body: 'iddadda 님이 댓글을 남겼습니다. 크로스핏 10년차인데요',
    category: 'comment',
    read: false,
    createdAt: Date.now() - 15 * 60 * 60 * 1000,
  },
]);

const timeAgo = (ts) => {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}초 전`;
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
};

const markAllRead = () => {
  items.value = items.value.map((it) => ({ ...it, read: true }));
};
const markRead = (id) => {
  const i = items.value.findIndex((x) => x.id === id);
  if (i !== -1) items.value[i] = { ...items.value[i], read: true };
};
</script>

<template>
  <div class="notification-page">
    <!-- 상단 헤더 -->
    <div class="header">
      <h2>내 소식</h2>
    </div>

    <button class="mark-all" @click="markAllRead">모두 읽기</button>

    <div class="list">
      <div
        v-for="it in items"
        :key="it.id"
        class="card"
        :class="{ unread: !it.read, announce: it.announce }"
        @click="markRead(it.id)"
      >
        <!-- 공지형 카드 (업데이트 안내) -->
        <template v-if="it.announce">
          <div class="announce-header">
            <img
              class="icon-announcement"
              src="/image/notification/megaphone.png"
              alt="공지"
            />
            <span class="title yellow">{{ it.title }}</span>
          </div>
          <div class="body">{{ it.body }}</div>
          <div class="time">{{ timeAgo(it.createdAt) }}</div>
        </template>

        <!-- 일반 카드 (커뮤니티 알림) -->
        <template v-else>
          <div class="icon-wrap">
            <img
              class="icon"
              src="/image/notification/megaphone.png"
              alt="알림"
            />
          </div>
          <div class="content">
            <div class="title">{{ it.title }}</div>
            <div class="body">{{ it.body }}</div>
            <div class="time">{{ timeAgo(it.createdAt) }}</div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notification-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f5f7fa;
  min-height: 100vh;
  padding-bottom: 40px;
}

/* 헤더 */
.header {
  width: 100%;
  background: #00d5df;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  position: relative;
  border-radius: 0; /* 🔹 둥근 모서리 제거 */
}
.header h2 {
  font-size: 20px;
  font-weight: 800;
}

/* 모두 읽음 */
.mark-all {
  background: none;
  border: none;
  color: #666;
  font-size: 13px;
  margin: 12px 0;
  cursor: pointer;
}

/* 리스트 */
.list {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 12px;
}

/* 카드 공통 */
.card {
  background: white;
  border-radius: 12px;
  width: 90%;
  padding: 14px 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #e8f3f5;
  transition: transform 0.1s ease;
}
.card:hover {
  transform: scale(1.01);
}
.card.unread {
  border: 2px solid #dffaff;
}
.card.announce {
  border-left: 4px solid #ffd400;
}

/* 공지 카드 전용 스타일 */
.announce-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}
.icon-announcement {
  width: 22px;
  height: 22px;
}
.title.yellow {
  font-weight: 800;
  color: #ffd400;
}

/* 일반 카드 아이콘 */
.icon-wrap {
  float: left;
  margin-right: 10px;
}
.icon {
  width: 22px;
  height: 22px;
}

/* 내용 */
.content {
  display: flex;
  flex-direction: column;
}
.title {
  font-weight: 700;
  font-size: 15px;
  color: #333;
}
.body {
  font-size: 13px;
  color: #444;
  line-height: 1.4;
  margin-top: 4px;
  margin-bottom: 6px;
}
.time {
  font-size: 12px;
  color: #999;
}
</style>
