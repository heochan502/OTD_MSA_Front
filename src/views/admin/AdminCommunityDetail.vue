<script setup>
import { onMounted, ref } from 'vue';
import {
  getCommunityDetail,
  deleteCommunity,
  deleteComment,
  deleteFile,
} from '@/services/admin/adminService';
import { useAdminStore } from '@/stores/admin/adminStore';

const adminStore = useAdminStore();

const BASE_URL = import.meta.env.VITE_BASE_URL;
const communityDetail = ref({});
const deleteDialog = ref(false);
const successDialog = ref(false);
const deleteTarget = ref('');
const deletePicId = ref(0);
const deleteCommentId = ref(0);

onMounted(async () => {
  const postId = adminStore.state.selectedPostId;
  const res = await getCommunityDetail(postId);
  console.log('detail', res.data);
  communityDetail.value = res.data;
});

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

const confirmDelete = async () => {
  try {
    if (deleteTarget.value === 'post') {
      await deleteCommunity(adminStore.state.selectedPostId);
    } else if (deleteTarget.value === 'pic') {
      const picId = deletePicId.value;
      await deleteFile(picId);
      communityDetail.value.files = communityDetail.value.files.filter(
        (f) => f.id !== picId
      );
    } else if (deleteTarget.value === 'comment') {
      const commentId = deleteCommentId.value;
      await deleteComment(commentId);
      communityDetail.value.comments = communityDetail.value.comments.filter(
        (c) => c.id !== commentId
      );
    }
    deleteDialog.value = false;
    successDialog.value = true;
    await loadPosts(adminStore.state.selectedPostId);
  } catch (e) {
    console.error('삭제 실패:', e);
  }
};

const loadPosts = async (postId) => {
  const res = await getCommunityDetail(postId);
  console.log('detail', res.data);
  communityDetail.value = res.data;
};
</script>

<template>
  <div class="admin-community-detail">
    <!-- 삭제 확인 모달 -->
    <v-dialog v-model="deleteDialog" max-width="380">
      <v-card class="admin-dialog pa-6">
        <v-card-text v-if="deleteTarget === 'post'"
          >게시글을 삭제하시겠습니까?</v-card-text
        >
        <v-card-text v-if="deleteTarget === 'pic'"
          >해당 사진을 삭제하시겠습니까?</v-card-text
        >
        <v-card-text v-if="deleteTarget === 'comment'"
          >해당 댓글을 삭제하시겠습니까?</v-card-text
        >
        <v-card-actions class="modal-btn-area">
          <v-btn class="btn-yes" @click="confirmDelete">네</v-btn>
          <v-btn class="btn-no" @click="deleteDialog = false">아니오</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 삭제 완료 모달 -->
    <v-dialog v-model="successDialog" max-width="380" min-height="100">
      <v-card class="admin-dialog pa-6">
        <v-card-text> 성공적으로 완료되었습니다. </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn class="btn-yes" text @click="successDialog = false"
            >확인</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-container fluid>
      <v-row dense>
        <v-col cols="12">
          <v-card class="data-card pa-2">
            <!-- 상단 제목 -->
            <v-card-title class="d-flex justify-space-between align-center">
              <span class="title">게시글 상세</span>
            </v-card-title>

            <div class="post-wrap">
              <v-row dense>
                <!-- 왼쪽: 작성자 + 제목 -->
                <v-col cols="8">
                  <div class="author-title-wrap">
                    <div class="author">
                      <v-card-subtitle class="field-label"
                        >작성자</v-card-subtitle
                      >
                      <v-card-text class="field-text">
                        {{ communityDetail.nickName ?? communityDetail.userId }}
                      </v-card-text>
                    </div>

                    <div class="post-title">
                      <v-card-subtitle class="field-label"
                        >제목</v-card-subtitle
                      >
                      <v-card-text class="field-text">
                        {{ communityDetail.title }}
                      </v-card-text>
                    </div>
                  </div>
                </v-col>

                <!-- 오른쪽: 카테고리 + 좋아요 -->
                <v-col cols="4" class="d-flex justify-end align-start">
                  <div class="category-like-wrap">
                    <div class="category">
                      <v-card-subtitle class="field-label category-field"
                        >카테고리</v-card-subtitle
                      >
                      <v-card-text class="field-text category-field">
                        {{ communityDetail.category }}
                      </v-card-text>
                    </div>
                    <div class="like-box d-flex align-center">
                      <v-icon color="#ef5350" size="18">mdi-heart</v-icon>
                      <span class="like-count">{{
                        communityDetail.likeCount
                      }}</span>
                    </div>
                  </div>
                </v-col>

                <v-col cols="12">
                  <v-card-subtitle class="field-label">내용</v-card-subtitle>
                  <v-card-text class="field-text preserve-lines">{{
                    communityDetail.content
                  }}</v-card-text>
                </v-col>

                <v-col cols="12">
                  <v-card-subtitle class="field-label"
                    >작성일시</v-card-subtitle
                  >
                  <v-card-text class="field-text">{{
                    formatDate(communityDetail.createdAt)
                  }}</v-card-text>
                </v-col>
              </v-row>
              <div class="btn-area" v-if="communityDetail.deleted === false">
                <v-btn
                  class="btn-ban"
                  @click="
                    deleteDialog = true;
                    deleteTarget = 'post';
                  "
                >
                  글 삭제
                </v-btn>
              </div>
              <!-- 구분선 -->
              <v-divider class="my-4" />

              <!-- 파일 영역 -->
              <div>
                <v-card-subtitle class="field-label mb-2"
                  >첨부 이미지</v-card-subtitle
                >
                <div v-if="communityDetail.files?.length" class="file-wrap">
                  <div
                    v-for="f in communityDetail.files"
                    :key="f.id"
                    class="file-item position-relative"
                  >
                    <a :href="BASE_URL + f.filePath" target="_blank">
                      <img :src="BASE_URL + f.filePath" class="preview" />
                    </a>
                    <v-btn
                      icon
                      size="x-small"
                      color="#f18a86"
                      variant="tonal"
                      class="delete-btn"
                      @click="
                        deleteDialog = true;
                        deleteTarget = 'pic';
                        deletePicId = f.id;
                      "
                    >
                      <v-icon size="18">mdi-close</v-icon>
                    </v-btn>
                  </div>
                </div>
                <p v-else class="empty-text">첨부 이미지 없음</p>
              </div>
            </div>
            <!-- 구분선 -->
            <v-divider class="my-4" />

            <!-- 댓글 영역 -->
            <div>
              <v-card-subtitle class="field-label mb-2">댓글</v-card-subtitle>

              <div v-if="communityDetail.comments?.length">
                <v-row dense>
                  <v-col
                    v-for="c in communityDetail.comments"
                    :key="c.id"
                    cols="12"
                    class="comment-item d-flex justify-space-between align-center"
                  >
                    <div class="comment-left">
                      <div class="comment-text">
                        <strong>{{ c.nickName }}</strong> : {{ c.content }}
                      </div>
                      <div class="comment-date">
                        {{ formatDate(c.createdAt) }}
                      </div>
                    </div>
                    <v-btn
                      icon
                      size="small"
                      color="#f18a86"
                      variant="tonal"
                      @click="
                        deleteDialog = true;
                        deleteTarget = 'comment';
                        deleteCommentId = c.id;
                      "
                    >
                      <v-icon size="18">mdi-delete</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </div>
              <p v-else class="empty-text">댓글 없음</p>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style lang="scss" scoped>
.admin-community-detail {
  padding: 10px;
}
.title {
  font-weight: 700;
  font-size: 18px;
  margin-bottom: 10px;
}
// 일반 카드 공통
.data-card {
  background: #fff;
  border-radius: 15px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
}

.author-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 9px; // 작성자와 제목 사이 여백
}

.category-like-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  margin-right: 12px; // 글 삭제 버튼과 수평 정렬 맞춤

  .category {
    text-align: right;
  }

  .category-field {
    padding-right: 0;
  }
  .like-box {
    background: #fff5f5;
    border: 1px solid #ffcdd2;
    border-radius: 8px;
    padding: 3px 8px;
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 600;
    color: #d32f2f;
    font-size: 0.85rem;
  }
}

.comment-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #eee;
  padding: 10px 18px; // 👈 좌우 여백 추가
  margin-bottom: 4px; // 👈 각 댓글 간 간격
  border-radius: 6px;
}

.comment-left {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.comment-text {
  font-size: 0.95rem;
  color: #333;
  word-break: break-word;
}

.comment-date {
  font-size: 0.8rem;
  color: #888;
  margin-left: 2px;
}

.file-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.field-label {
  margin-bottom: 0 !important; // 라벨과 값 사이 간격 줄이기
  font-weight: 600; // 라벨이 너무 약해보이면 강조
}
.preview {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ddd;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

.empty-text {
  font-size: 0.85rem;
  color: #888;
  text-align: center;
  margin-top: 8px;
}

.preserve-lines {
  white-space: pre-line;
  line-height: 1.6;
}
.btn-area {
  display: flex;
  justify-content: flex-end;
  gap: 14px;
  align-items: center;
  padding: 0 10px;
  margin-bottom: 10px;
}
.btn-ban {
  bottom: 0;
  left: 0;
  height: 40px;
  background-color: #f28b82 !important;
  color: #fff !important;
  border-radius: 10px;
  font-weight: 600;
}
.btn-ban:hover {
  background-color: #ef5350 !important;
}

// 관리 모달 카드
.admin-dialog {
  border-radius: 15px !important;
  background-color: #fff;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
}
// 버튼 영역
.modal-btn-area {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 0 4px 4px 0 !important;
  margin-top: 4px !important;
}

// 버튼 공통
.btn-no,
.btn-yes {
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
}

// 취소 버튼
.btn-no {
  background-color: #eee !important;
  color: #555 !important;
  border-radius: 10px;
}
.btn-no:hover {
  background-color: #dcdcdc !important;
  transform: scale(1.03);
}

// 저장 버튼
.btn-yes {
  background-color: #5ee6eb !important;
  color: #fff !important;
  border-radius: 10px;
}
.btn-yes:hover {
  background-color: #3dd4da !important;
  box-shadow: 0 3px 10px rgba(61, 212, 218, 0.35);
  transform: scale(1.03);
}
</style>
