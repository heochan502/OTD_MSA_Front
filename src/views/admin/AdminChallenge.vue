<script setup>
import {
  getCommunity,
  getCommunityDetail,
  deleteCommunity,
} from '@/services/admin/adminService';
import { onMounted, ref, computed } from 'vue';

const posts = ref([]);
const selectedCategory = ref('전체');
const selectedPost = ref(null); // 상세보기 대상
const detailDialog = ref(false);
const deleteDialog = ref(false);

// 목록 불러오기
const loadPosts = async () => {
  const res = await getCommunity();
  posts.value = res.data;
};

onMounted(() => {
  loadPosts();
});

// 카테고리 목록
const categories = computed(() => {
  const set = new Set(posts.value.map((p) => p.category));
  return ['전체', ...set];
});

// 카테고리별 필터링
const filteredPosts = computed(() => {
  if (selectedCategory.value === '전체') return posts.value;
  return posts.value.filter((p) => p.category === selectedCategory.value);
});

// 상세보기
const openDetail = async (postId) => {
  const res = await getCommunityDetail(postId);
  selectedPost.value = res.data;
  detailDialog.value = true;
};

// 삭제
const openDelete = (postId) => {
  selectedPost.value = { postId };
  deleteDialog.value = true;
};
const confirmDelete = async () => {
  if (!selectedPost.value) return;
  await deleteCommunity(selectedPost.value.postId);
  deleteDialog.value = false;
  await loadPosts(); // 삭제 후 목록 갱신
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
        @click="selectedCategory = cat"
      >
        {{ cat }}
      </v-btn>
    </div>

    <!-- 게시글 카드 리스트 -->
    <v-row>
      <v-col
        v-for="post in filteredPosts"
        :key="post.postId"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card class="post-card" elevation="3">
          <v-card-title>
            <span class="category">[{{ post.category }}]</span>
            <span class="title">{{ post.title }}</span>
          </v-card-title>

          <v-card-subtitle> 작성자: {{ post.userId }} </v-card-subtitle>

          <v-card-text>
            <p><strong>작성일:</strong> {{ post.createdAt }}</p>
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
            <v-btn color="primary" text @click="openDetail(post.postId)"
              >상세보기</v-btn
            >
            <v-btn color="error" text @click="openDelete(post.postId)"
              >삭제</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- 상세보기 다이얼로그 -->
    <v-dialog v-model="detailDialog" max-width="600">
      <v-card v-if="selectedPost">
        <v-card-title>
          {{ selectedPost.title }}
        </v-card-title>
        <v-card-subtitle>[{{ selectedPost.category }}]</v-card-subtitle>
        <v-card-text>
          <p><strong>내용:</strong> {{ selectedPost.content }}</p>
          <p><strong>댓글:</strong></p>
          <ul>
            <li v-for="(c, i) in selectedPost.comment" :key="i">{{ c }}</li>
          </ul>
          <p><strong>파일:</strong></p>
          <ul>
            <li v-for="(f, i) in selectedPost.filePath" :key="i">
              <a :href="f" target="_blank">{{ f }}</a>
            </li>
          </ul>
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
</style>
