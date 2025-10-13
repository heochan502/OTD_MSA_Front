<script setup>
import { ref, onMounted } from 'vue';
import { getMyComments } from '@/services/mypage/mypageService';
import { useRouter } from 'vue-router';

const router = useRouter();
const comments = ref([]);
const loading = ref(true);
const currentPage = ref(0);
const totalPages = ref(0);
const totalElements = ref(0);

// 내 댓글 목록 불러오기
const fetchComments = async (page = 0) => {
  try {
    loading.value = true;
    const response = await getMyComments(page, 10);
    
    const data = response.data;

    comments.value = response.data.content || [];
    currentPage.value = response.pageable?.pageNumber || 0;
    totalPages.value = response.totalPages || 0;
    totalElements.value = data.totalElements || 0;
  } catch (error) {
    console.error('댓글 조회 실패:', error);
    alert('댓글을 불러오는데 실패했습니다.');
  } finally {
    loading.value = false;
  }
};

// 페이지 변경
const changePage = (page) => {
  if (page >= 0 && page < totalPages.value) {
    fetchComments(page);
  }
};

// 게시글로 이동
const goToPost = (postId) => {
  router.push(`/community/post/${postId}`);
};

// 날짜 포맷팅
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replace(/\. /g, '.').replace(/\.$/, '');
};

onMounted(() => {
  fetchComments();
});
</script>

<template>
  <div class="my-comments-container">
    <div class="header">
      <button class="back-btn" @click="router.back()">‹</button>
      <h1>내가 쓴 댓글</h1>
      <div class="spacer"></div>
    </div>

    <!-- 통계 -->
    <div class="stats-section">
      <div class="stat-item">
        <span class="stat-label">총 댓글</span>
        <span class="stat-value">{{ totalElements }}개</span>
      </div>
    </div>

    <!-- 로딩 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>불러오는 중...</p>
    </div>

    <!-- 댓글 목록 -->
    <div v-else-if="comments.length > 0" class="comments-list">
      <div 
        v-for="comment in comments" 
        :key="comment.commentId" 
        class="comment-card"
        @click="goToPost(comment.postId)"
      >
        <div class="comment-header">
          <span class="post-title-label">게시글</span>
          <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
        </div>
        
        <h3 class="post-title">{{ comment.postTitle }}</h3>
        
        <div class="comment-content">
          <div class="quote-icon">💬</div>
          <p>{{ comment.content }}</p>
        </div>
      </div>
    </div>

    <!-- 댓글 없음 -->
    <div v-else class="empty-state">
      <div class="empty-icon">💬</div>
      <p>작성한 댓글이 없습니다</p>
      <button class="explore-btn" @click="router.push('/community')">
        커뮤니티 둘러보기
      </button>
    </div>

    <!-- 페이지네이션 -->
    <div v-if="totalPages > 1" class="pagination">
      <button 
        class="page-btn" 
        @click="changePage(currentPage - 1)"
        :disabled="currentPage === 0"
      >
        이전
      </button>
      
      <div class="page-numbers">
        <button
          v-for="page in totalPages"
          :key="page"
          class="page-number"
          :class="{ active: page - 1 === currentPage }"
          @click="changePage(page - 1)"
        >
          {{ page }}
        </button>
      </div>
      
      <button 
        class="page-btn"
        @click="changePage(currentPage + 1)"
        :disabled="currentPage === totalPages - 1"
      >
        다음
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.my-comments-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background: #f8f9fa;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  background: white;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .back-btn {
    background: none;
    border: none;
    font-size: 28px;
    cursor: pointer;
    color: #333;
    padding: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background 0.2s ease;

    &:hover {
      background: #f0f0f0;
    }
  }

  h1 {
    font-size: 20px;
    font-weight: bold;
    margin: 0;
    color: #333;
  }

  .spacer {
    width: 40px;
  }
}

.stats-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .stat-label {
      color: #666;
      font-size: 15px;
    }

    .stat-value {
      font-size: 20px;
      font-weight: bold;
      color: #4caf50;
    }
  }
}

.loading {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;

  .spinner {
    width: 40px;
    height: 40px;
    margin: 0 auto 16px;
    border: 4px solid #f0f0f0;
    border-top-color: #4caf50;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  p {
    color: #666;
    font-size: 14px;
  }
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .comment-card {
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .comment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      .post-title-label {
        display: inline-block;
        padding: 4px 10px;
        background: #f0f0f0;
        color: #666;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
      }

      .comment-date {
        color: #999;
        font-size: 13px;
      }
    }

    .post-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 12px 0;
      color: #666;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .comment-content {
      display: flex;
      gap: 12px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #4caf50;

      .quote-icon {
        font-size: 20px;
        color: #4caf50;
      }

      p {
        flex: 1;
        margin: 0;
        color: #333;
        font-size: 15px;
        line-height: 1.6;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;

  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
    opacity: 0.3;
  }

  p {
    color: #999;
    font-size: 16px;
    margin-bottom: 24px;
  }

  .explore-btn {
    background: #4caf50;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: #45a049;
      transform: translateY(-1px);
    }
  }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 32px;
  padding: 20px;
  background: white;
  border-radius: 12px;

  .page-btn {
    padding: 8px 16px;
    background: #f0f0f0;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      background: #e0e0e0;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .page-numbers {
    display: flex;
    gap: 8px;

    .page-number {
      width: 36px;
      height: 36px;
      border: none;
      background: #f0f0f0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: #e0e0e0;
      }

      &.active {
        background: #4caf50;
        color: white;
        font-weight: bold;
      }
    }
  }
}

@media (max-width: 768px) {
  .my-comments-container {
    padding: 12px;
  }

  .page-numbers {
    max-width: 200px;
    overflow-x: auto;
  }
}
</style>