<script setup>
import { getCommunity } from '@/services/admin/adminService';
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAdminStore } from '@/stores/admin/adminStore';
const adminStore = useAdminStore();
const router = useRouter();

const posts = ref([]);
const selectedCategory = ref('전체');

// 페이지네이션 상태
const page = ref(1);
const itemsPerPage = 8; // 한 페이지당 게시글 개수 (2열 × 3행 = 6개)

// 목록 로드
const loadPosts = async () => {
  const res = await getCommunity();
  console.log('commu', res.data);
  posts.value = res.data;
};

onMounted(loadPosts);

// 카테고리 목록
const categories = computed(() => {
  const set = new Set(posts.value.map((p) => p.category));
  return ['전체', ...set];
});

// 필터링
const filteredPosts = computed(() => {
  if (selectedCategory.value === '전체') return posts.value;
  return posts.value.filter((p) => p.category === selectedCategory.value);
});

// 페이지네이션 적용
const paginatedPosts = computed(() => {
  const start = (page.value - 1) * itemsPerPage;
  return filteredPosts.value.slice(start, start + itemsPerPage);
});
const pageCount = computed(() =>
  Math.ceil(filteredPosts.value.length / itemsPerPage)
);

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  const h24 = d.getHours();
  const dayPeriod = h24 < 12 ? '오전' : '오후';
  const h12 = String(h24 % 12 || 12).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const sec = String(d.getSeconds()).padStart(2, '0');

  return `${y}-${m}-${day} ${dayPeriod} ${h12}:${min}:${sec}`;
};

const toCommunityDetail = (postId) => {
  console.log('user', postId);
  adminStore.setSelectedPostId(postId);
  console.log(adminStore.state.selectedPostId);
  router.push({ path: '/admin/community/detail' });
};
</script>

<template>
  <div class="admin-community">
    <v-card class="data-card pa-2">
      <!-- 상단 제목 + 카테고리 필터 -->
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="title">커뮤니티 게시글 관리</span>

        <div class="filter-bar">
          <v-btn
            v-for="cat in categories"
            :key="cat"
            :class="['btn', { active: selectedCategory === cat }]"
            density="comfortable"
            @click="
              () => {
                selectedCategory = cat;
                page = 1;
              }
            "
          >
            {{ cat }}
          </v-btn>
        </div>
      </v-card-title>

      <!-- 카드 목록 -->
      <v-container fluid class="post-container">
        <v-row class="post-grid" no-gutters>
          <v-col
            v-for="post in paginatedPosts"
            :key="post.postId"
            cols="12"
            class="post-col"
          >
            <v-card
              class="post-card"
              elevation="2"
              @click="toCommunityDetail(post.postId)"
            >
              <v-card-title class="card-header">
                <span class="post-category">[{{ post.category }}]</span>
              </v-card-title>

              <v-card-subtitle class="post-top">
                <span class="post-title">{{ post.title }}</span>
                <v-chip
                  class="post-status"
                  :color="post.deleted ? 'red' : 'green'"
                >
                  {{ post.deleted ? '삭제됨' : '정상' }}
                </v-chip>
              </v-card-subtitle>

              <div class="post-bottom">
                <v-card-text class="post-writer">
                  <span>작성자 : {{ post.nickName ?? post.userId }}</span>
                  <span>작성일 : {{ formatDate(post.createdAt) }}</span>
                </v-card-text>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- 페이지네이션 -->
      <div class="pagination">
        <v-btn
          class="page-btn"
          :disabled="page === 1"
          prepend-icon="mdi-page-first"
          @click="page = 1"
        >
        </v-btn>
        <v-btn
          class="page-btn"
          :disabled="page === 1"
          prepend-icon="mdi-chevron-left"
          @click="page--"
        >
        </v-btn>

        <div class="page-info">
          <span class="current">{{ page }}</span>
          <span class="divider">/</span>
          <span class="total">{{ pageCount }}</span>
        </div>

        <v-btn
          class="page-btn"
          :disabled="page >= pageCount"
          append-icon="mdi-chevron-right"
          @click="page++"
        >
        </v-btn>
        <v-btn
          class="page-btn"
          :disabled="page >= pageCount"
          append-icon="mdi-page-last"
          @click="page = pageCount"
        >
        </v-btn>
      </div>
    </v-card>
  </div>
</template>
<style lang="scss" scoped>
.admin-community {
  padding: 10px;

  .title {
    font-weight: 700;
    font-size: 23px;
  }

  .data-card {
    background: #fff;
    border-radius: 15px;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
  }
}

/* 🔹 카테고리 필터 버튼 */
.filter-bar {
  display: flex;
  gap: 8px;
}

.filter-btn {
  height: 40px;
  font-weight: 600;
  border-radius: 10px !important;
  text-transform: none;
  color: #555;
  border: none !important;
  background-color: #eee;
}
.btn {
  min-width: 72px;
  height: 38px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  line-height: 1;
  text-transform: none;
  letter-spacing: -0.2px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  background-color: #eee !important;
  color: #555 !important;

  &.active {
    background-color: #5ee6eb !important;
    color: #fff !important;
  }
  &.active:hover {
    background-color: #3dd4da !important;
    box-shadow: 0 3px 10px rgba(61, 212, 218, 0.35);
    transform: scale(1.03);
  }
}

/* 🔹 카드 레이아웃 (이전 그대로 유지 가능) */
.post-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px 16px;
  justify-content: space-between;
}

.post-col {
  flex: 0 0 calc(50% - 8px) !important;
  max-width: calc(50% - 8px) !important;
  display: flex;
}

.post-card {
  flex: 1;
  height: 165px;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 12px 18px;

  &:hover {
    transform: scale(1.01);
  }
}

/* 🔹 카테고리 */
.post-category {
  font-weight: 600;
  font-size: 20px;
  color: #5ee6eb;
  padding: 0 0 10px 16px;
}

/* 🔹 제목 + 상태칩 */
.post-top {
  display: flex;
  align-items: center;
  font-weight: 700;
  font-size: 18px;

  margin-bottom: 5px 0 6px 0 !important;

  .post-title {
    color: #000;
  }

  .post-status {
    margin-left: 8px;
    font-size: 15px;
    border-radius: 12px;
    height: 30px;
  }
}

.post-bottom {
  display: flex;
}
/* 🔹 작성자 */
.post-writer {
  font-size: 14px;
  color: #666;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

/* 🔹 날짜 */
.post-date {
  font-size: 13px;
  color: #999;
}

.section {
  margin-top: 10px;
}

.comment-item {
  padding: 6px 0;
  border-bottom: 1px solid #eee;
  font-size: 0.9rem;
  color: #444;
}

.file-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.file-item {
  position: relative;
}

.preview {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ddd;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

.delete-btn {
  position: absolute;
  top: -6px;
  right: -6px;
}

.empty-text {
  font-size: 0.85rem;
  color: #888;
  text-align: center;
  margin-top: 8px;
}

.content-box {
  white-space: pre-wrap;
  background: #fafafa;
  border-radius: 8px;
  padding: 10px 12px;
  border: 1px solid #e2e2e2;
  font-size: 0.9rem;
  color: #333;
}
.comment-item {
  border-bottom: 1px solid #eee;
  font-size: 0.9rem;
  color: #444;
}

.file-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 6px;
}

.file-item {
  position: relative;
}

.preview {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #ddd;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

.delete-btn {
  position: absolute;
  top: -6px;
  right: -6px;
}

.empty-text {
  font-size: 0.85rem;
  color: #888;
  text-align: center;
  margin-top: 8px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 5px;
  padding: 12px 0;

  .btn,
  .page-btn {
    transition: background-color 0.2s ease, transform 0.2s ease;
  }
  .page-btn :deep(.v-btn__content) {
    padding: 0 !important;
  }
  .page-btn :deep(.v-icon) {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    line-height: 1 !important;
    vertical-align: middle !important;
    font-size: 20px !important; // 아이콘 크기도 조정 가능
  }
  .page-btn {
    min-width: 10px !important;
    font-weight: 600;
    font-size: 0.9rem;
    border-radius: 10px;
    background-color: #eee !important;
    color: #555 !important;
    transition: all 0.25s ease;

    &:disabled {
      background-color: #fcfcfc !important; // 평상시보다 더 연한 회색으로
      color: #aaa !important;
      opacity: 1 !important; // Vuetify의 disabled opacity 무시
      box-shadow: none !important;
      transform: none !important;
      transition: none !important;
    }
    // 🧩 Vuetify overlay 완전 제거
    :deep(.v-btn__overlay),
    :deep(.v-btn__underlay) {
      transition: none !important; // overlay에 있는 opacity 전환 제거
      background: transparent !important;
      opacity: 0 !important;
    }

    // 🧩 disabled일 때 overlay가 다시 생기지 않도록 완전 차단
    &:disabled :deep(.v-btn__overlay),
    &:disabled :deep(.v-btn__underlay) {
      display: none !important;
    }
  }
  .btn:disabled :deep(.v-btn__overlay),
  .page-btn:disabled :deep(.v-btn__overlay) {
    background: transparent !important; // 반투명 오버레이 제거
  }

  .page-info {
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 600;
    font-size: 1rem;
    color: #555;

    .current {
      color: #5ee6eb; // 메인 민트 강조
      font-size: 1.05rem;
      font-weight: 700;
    }

    .divider {
      margin: 0 2px;
      color: #999;
    }

    .total {
      color: #999;
      font-size: 0.95rem;
    }
  }
}
</style>
