<script setup>
import {
  getCommunity,
  getCommunityDetail,
  deleteCommunity,
  deleteComment,
  deleteFile,
} from '@/services/admin/adminService';
import { onMounted, ref, computed } from 'vue';

const posts = ref([]);
const selectedCategory = ref('전체');
const selectedPost = ref(null);
const detailDialog = ref(false);
const deleteDialog = ref(false);

const BASE_URL = import.meta.env.VITE_BASE_URL;

// 페이지네이션 상태
const page = ref(1);
const itemsPerPage = 8; // 한 페이지당 게시글 개수 (2열 × 3행 = 6개)

// 목록 로드
const loadPosts = async () => {
  const res = await getCommunity();
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

// 상세보기
const openDetail = async (postId) => {
  const res = await getCommunityDetail(postId);
  selectedPost.value = res.data;
  detailDialog.value = true;
};

// 댓글 삭제
const removeComment = async (id) => {
  await deleteComment(id);
  selectedPost.value.comments = selectedPost.value.comments.filter(
    (c) => c.id !== id
  );
};

// 파일 삭제
const removeFile = async (id) => {
  await deleteFile(id);
  selectedPost.value.files = selectedPost.value.files.filter(
    (f) => f.id !== id
  );
};

// 게시글 삭제
const openDelete = (postId) => {
  selectedPost.value = { postId };
  deleteDialog.value = true;
};
const confirmDelete = async () => {
  await deleteCommunity(selectedPost.value.postId);
  deleteDialog.value = false;
  await loadPosts();
};

const formatNumber = (n) => String(n).padStart(2, '0');
const formatDate = (date) => {
  const y = date.getFullYear();
  const m = formatNumber(date.getMonth() + 1);
  const d = formatNumber(date.getDate());
  return `${y}-${m}-${d}`;
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
            :class="['filter-btn', { active: selectedCategory === cat }]"
            variant="outlined"
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
            <v-card class="post-card" elevation="2">
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
                  <span
                    >작성일 : {{ formatDate(new Date(post.createdAt)) }}</span
                  >
                </v-card-text>

                <v-card-actions class="justify-end btn-area">
                  <v-btn class="btn-detail" @click="openDetail(post.postId)"
                    >상세</v-btn
                  >
                  <v-btn class="btn-delete" @click="openDelete(post.postId)"
                    >삭제</v-btn
                  >
                </v-card-actions>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- 🔹 페이지네이션 -->
      <div class="pagination">
        <v-btn
          :disabled="page === 1"
          variant="text"
          @click="page--"
          class="pg-btn"
        >
          이전
        </v-btn>
        <span>{{ page }} / {{ pageCount }}</span>
        <v-btn
          :disabled="page >= pageCount"
          variant="text"
          @click="page++"
          class="pg-btn"
        >
          다음
        </v-btn>
      </div>
    </v-card>
    <!-- ✅ 상세보기 모달 -->
    <v-dialog v-model="detailDialog" max-width="700">
      <v-card class="admin-dialog pa-6">
        <v-card-title class="dialog-title mb-3">
          {{ selectedPost?.title }}
        </v-card-title>

        <v-card-subtitle class="dialog-sub">
          [{{ selectedPost?.category }}]
        </v-card-subtitle>

        <v-card-text>
          <p>
            <strong>작성자:</strong>
            {{ selectedPost?.nickName ?? selectedPost?.userId }}
          </p>
          <p><strong>내용:</strong> {{ selectedPost?.content }}</p>

          <v-divider class="my-4" />

          <div class="section">
            <h4>댓글</h4>
            <ul v-if="selectedPost?.comments?.length">
              <li
                v-for="c in selectedPost.comments"
                :key="c.id"
                class="comment-item"
              >
                {{ c.content }}
                <v-btn
                  icon
                  size="small"
                  color="#ef9a9a"
                  variant="tonal"
                  @click="removeComment(c.id)"
                >
                  <v-icon size="18">mdi-delete</v-icon>
                </v-btn>
              </li>
            </ul>
            <p v-else class="empty-text">댓글 없음</p>
          </div>

          <v-divider class="my-4" />

          <div class="section">
            <h4>파일</h4>
            <div v-if="selectedPost?.files?.length" class="file-wrap">
              <div
                v-for="f in selectedPost.files"
                :key="f.id"
                class="file-item"
              >
                <a :href="BASE_URL + f.filePath" target="_blank">
                  <img :src="BASE_URL + f.filePath" class="preview" />
                </a>
                <v-btn
                  icon
                  size="x-small"
                  color="#ef9a9a"
                  variant="tonal"
                  @click="removeFile(f.id)"
                >
                  <v-icon size="18">mdi-close</v-icon>
                </v-btn>
              </div>
            </div>
            <p v-else class="empty-text">첨부 파일 없음</p>
          </div>
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn class="btn-cancel" @click="detailDialog = false">닫기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ✅ 삭제 확인 모달 -->
    <v-dialog v-model="deleteDialog" max-width="380">
      <v-card class="admin-dialog pa-5">
        <v-card-text>정말로 게시글을 삭제하시겠습니까?</v-card-text>
        <v-card-actions class="justify-end mt-2">
          <v-btn class="btn-cancel" @click="deleteDialog = false">취소</v-btn>
          <v-btn class="btn-delete" @click="confirmDelete">삭제</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
  background-color: #e0e0e0;

  &.active {
    background-color: #5ee6eb !important;
    color: #fff !important;
    border-color: #5ee6eb !important;
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
  height: 170px;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 12px 18px;

  &:hover {
    transform: translateY(3px);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
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

.btn-area {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 0 4px 4px 0 !important;
  margin-top: 4px !important;
}
// 버튼 공통
.btn-detail,
.btn-delete {
  min-width: 72px;
  height: 40px;
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
}

// 상세 버튼
.btn-detail {
  background-color: #ffe082 !important;
  color: #fff !important;
  border-radius: 10px;
}
.btn-detail:hover {
  background-color: #ffd54f !important;
  transform: scale(1.03);
}

// 삭제 버튼
.btn-delete {
  background-color: #ffb4b4 !important;
  color: #fff !important;
  border-radius: 10px;
}
.btn-delete:hover {
  background-color: #ff8a8a !important;
  box-shadow: 0 3px 10px rgba(61, 212, 218, 0.35);
  transform: scale(1.03);
}
</style>
