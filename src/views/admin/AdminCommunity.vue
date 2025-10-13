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

// 📌 페이지네이션 상태
const page = ref(1);
const itemsPerPage = 6; // 한 페이지당 게시글 개수 (2열 × 3행 = 6개)

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

// ✅ 페이지네이션 적용
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
</script>

<template>
  <div class="community-board">
    <!-- 카테고리 버튼 필터 -->
    <div class="filter-bar">
      <v-btn
        v-for="cat in categories"
        :key="cat"
        class="mx-1"
        :color="selectedCategory === cat ? 'primary' : 'grey-lighten-2'"
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

    <!-- 게시글 카드 리스트 -->
    <v-row>
      <v-col
        v-for="post in paginatedPosts"
        :key="post.postId"
        cols="12"
        sm="6"
        md="6"
      >
        <v-card class="post-card" elevation="3">
          <v-card-title>
            <span class="category">[{{ post.category }}]</span>
            <span class="title">{{ post.title }}</span>
          </v-card-title>
          <v-card-subtitle>
            작성자: {{ post.nickName ?? post.userId }}
          </v-card-subtitle>
          <v-card-text>
            <p>
              <strong>상태:</strong>
              <v-chip
                :color="post.deleted ? 'red' : 'green'"
                small
                text-color="white"
              >
                {{ post.deleted ? '삭제됨' : '정상' }}
              </v-chip>
            </p>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" text @click="openDetail(post.postId)">
              상세보기
            </v-btn>
            <v-btn color="error" text @click="openDelete(post.postId)">
              삭제
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- ✅ 페이지네이션 -->
    <div class="d-flex justify-center mt-4">
      <v-pagination v-model="page" :length="pageCount" :total-visible="5" />
    </div>

    <!-- 상세보기 다이얼로그 -->
    <v-dialog v-model="detailDialog" max-width="700">
      <v-card v-if="selectedPost">
        <v-card-title>{{ selectedPost.title }}</v-card-title>
        <v-card-subtitle>[{{ selectedPost.category }}]</v-card-subtitle>

        <v-card-text>
          <p>
            <strong>작성자:</strong>
            {{ selectedPost.nickName ?? selectedPost.userId }}
          </p>
          <p><strong>내용:</strong> {{ selectedPost.content }}</p>
          <p>
            <strong>상태:</strong>
            <v-chip
              :color="selectedPost.deleted ? 'red' : 'green'"
              small
              text-color="white"
            >
              {{ selectedPost.deleted ? '삭제됨' : '정상' }}
            </v-chip>
          </p>

          <!-- 댓글 -->
          <div class="section">
            <h4>댓글</h4>
            <ul v-if="selectedPost.comments && selectedPost.comments.length">
              <li
                v-for="c in selectedPost.comments"
                :key="c.id"
                class="comment-item"
              >
                {{ c.content }}
                <v-tooltip text="댓글 삭제" location="top">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon
                      size="small"
                      color="red-lighten-1"
                      variant="tonal"
                      @click="removeComment(c.id)"
                    >
                      <v-icon size="18">mdi-delete</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
              </li>
            </ul>
            <p v-else>댓글 없음</p>
          </div>

          <!-- 파일 -->
          <div class="section">
            <h4>파일</h4>
            <div v-if="selectedPost.files && selectedPost.files.length">
              <div
                v-for="f in selectedPost.files"
                :key="f.id"
                class="file-item"
              >
                <a :href="BASE_URL + f.filePath" target="_blank">
                  <img
                    :src="BASE_URL + f.filePath"
                    alt="첨부 이미지"
                    class="preview"
                  />
                </a>
                <v-tooltip text="파일 삭제" location="top">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon
                      size="small"
                      color="red-lighten-1"
                      variant="tonal"
                      @click="removeFile(f.id)"
                    >
                      <v-icon size="18">mdi-close</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
              </div>
            </div>
            <p v-else>첨부 파일 없음</p>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" text @click="detailDialog = false">닫기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 삭제 확인 다이얼로그 -->
    <v-dialog v-model="deleteDialog" max-width="380">
      <v-card>
        <v-card-text>해당 게시글을 삭제하시겠습니까?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="error" text @click="confirmDelete">네</v-btn>
          <v-btn text @click="deleteDialog = false">아니오</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.community-board {
  padding: 20px;
}
.filter-bar {
  margin-bottom: 16px;
  display: flex;
  flex-wrap: wrap;
}
.post-card {
  border-radius: 16px;
  overflow: hidden;
}
.category {
  color: #4fc3f7;
  margin-right: 6px;
}
.title {
  font-weight: bold;
}
.section {
  margin-top: 16px;
}
.section h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}
.comment-item,
.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid #eee;
}
.preview {
  max-width: 100px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s;
}
.preview:hover {
  transform: scale(1.05);
}
</style>
