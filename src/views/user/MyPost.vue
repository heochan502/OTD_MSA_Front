<script setup>
import { ref, onMounted } from 'vue';
import { getMyPosts } from '@/services/mypage/mypageService';
import { useRouter } from 'vue-router';

const router = useRouter();
const posts = ref([]);
const loading = ref(true);
const currentPage = ref(0);
const totalPages = ref(0);
const totalElements = ref(0);

// 게시글 목록 불러오기
const fetchPosts = async (page = 0) => {
  try {
    loading.value = true;
    const response = await getMyPosts(page, 10);

    const data = response.data;
    
    posts.value = data.content || [];
    currentPage.value = data.pageable?.pageNumber || 0;
    totalPages.value = data.totalPages || 0;
    totalElements.value = data.totalElements || 0;
  } catch (error) {
    console.error('게시글 조회 실패:', error);
    alert('게시글을 불러오는데 실패했습니다.');
  } finally {
    loading.value = false;
  }
};

// 페이지 변경
const changePage = (page) => {
  if (page >= 0 && page < totalPages.value) {
    fetchPosts(page);
  }
};

// 게시글 상세로 이동
const goToPost = (postId) => {
  router.push(`/community/post/${postId}`);
};

// 날짜 포맷팅
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replace(/\. /g, '.').replace(/\.$/, '');
};

onMounted(() => {
  fetchPosts();
});
</script>

<template>
  <div class="my-posts-container">
    <div class="header">
      <button class="back-btn" @click="router.back()">‹</button>
      <h1>내가 쓴 게시글</h1>
      <div class="spacer"></div>
    </div>

    <!-- 통계 -->
    <div class="stats-section">
      <div class="stat-item">
        <span class="stat-label">총 게시글</span>
        <span class="stat-value">{{ totalElements }}개</span>
      </div>
    </div>

    <!-- 로딩 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>불러오는 중...</p>
    </div>

    <!-- 게시글 목록 -->
    <div v-else-if="posts.length > 0" class="posts-list">
      <div 
        v-for="post in posts" 
        :key="post.postId" 
        class="post-card"
        @click="goToPost(post.postId)"
      >
        <div class="post-header">
          <span class="category-badge">{{ post.categoryName }}</span>
          <span class="post-date">{{ formatDate(post.createdAt) }}</span>
        </div>
        
        <h3 class="post-title">{{ post.title }}</h3>
        <p class="post-content">{{ post.content }}</p>
        
        <div class="post-footer">
          <div class="post-stats">
            <span class="stat">❤️ {{ post.likeCount }}</span>
            <span class="stat">💬 {{ post.commentCount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 게시글 없음 -->
    <div v-else class="empty-state">
      <div class="empty-icon">📝</div>
      <p>작성한 게시글이 없습니다</p>
      <button class="write-btn" @click="router.push('/community/write')">
        첫 게시글 작성하기
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
.my-posts-container {
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
      color: #393E46;
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
    border-top-color: #667eea;
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

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .post-card {
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

    .post-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .category-badge {
        display: inline-block;
        padding: 4px 12px;
        background: #667eea;
        color: white;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
      }

      .post-date {
        color: #999;
        font-size: 13px;
      }
    }

    .post-title {
      font-size: 18px;
      font-weight: bold;
      margin: 0 0 8px 0;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .post-content {
      color: #666;
      font-size: 14px;
      line-height: 1.6;
      margin: 0 0 16px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .post-footer {
      .post-stats {
        display: flex;
        gap: 16px;

        .stat {
          color: #999;
          font-size: 14px;
        }
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
  }

  p {
    color: #999;
    font-size: 16px;
    margin-bottom: 24px;
  }

  .write-btn {
    background: #393E46;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: #303030;
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
        background: #667eea;
        color: white;
        font-weight: bold;
      }
    }
  }
}

@media (max-width: 768px) {
  .my-posts-container {
    padding: 12px;
  }

  .page-numbers {
    max-width: 200px;
    overflow-x: auto;
  }
}
</style>