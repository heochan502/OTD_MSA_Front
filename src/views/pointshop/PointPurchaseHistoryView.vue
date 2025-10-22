<script setup>
import { onMounted, watch, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePointshop } from '@/components/pointshop/usePointshop.js'

const router = useRouter()
const {
  userPoints,
  purchasedItems,
  isLoading,
  initializePurchaseHistory,
} = usePointshop()

// 애니메이션 포인트 표시
const animatedPoints = ref(0)
watch(userPoints, (newVal, oldVal) => {
  const start = oldVal || 0
  const end = newVal || 0
  const duration = 800
  const startTime = performance.now()

  const animate = (time) => {
    const progress = Math.min((time - startTime) / duration, 1)
    animatedPoints.value = Math.floor(start + (end - start) * progress)
    if (progress < 1) requestAnimationFrame(animate)
  }

  requestAnimationFrame(animate)
})

// 페이징 관련 상태
const currentPage = ref(1)
const itemsPerPage = 10

const totalPages = computed(() =>
  Math.ceil(purchasedItems.value.length / itemsPerPage)
)

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return purchasedItems.value.slice(start, end)
})

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const pageNumbers = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 3) return [1, 2, 3, 4, 5]
  if (current >= total - 2)
    return [total - 4, total - 3, total - 2, total - 1, total]
  return [current - 2, current - 1, current, current + 1, current + 2]
})

// 날짜 포맷
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  const pad = (n) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// 아이템 클릭 시 상세페이지 이동
const goToDetail = (item) => {
  router.push(`/pointshop/purchase-history/detail/${item.purchaseId}`)
}

// 초기화
onMounted(async () => {
  await initializePurchaseHistory()
})
</script>

<template>
  <div class="history-container">
    <h2 class="page-title">포인트샵 구매 내역</h2>

    <!-- 현재 포인트 -->
    <div class="user-balance" :class="{ loading: isLoading }">
      내 보유 포인트:
      <strong>{{ animatedPoints.toLocaleString() }} P</strong>
      <span v-if="isLoading" class="spinner"></span>
    </div>

    <!-- 로딩 중 -->
    <div v-if="isLoading" class="loading">로딩 중입니다...</div>

    <!-- 구매 내역 -->
    <table v-else-if="paginatedItems.length > 0" class="history-table">
      <thead>
        <tr>
          <th>상품명</th>
          <th>가격</th>
          <th>구매일시</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in paginatedItems"
          :key="item.pointId"
          class="clickable-row"
          @click="goToDetail(item)"
        >
          <td class="item-name">
            <img
              v-if="item.imageUrl"
              :src="item.imageUrl"
              alt="상품 이미지"
              class="item-image"
            />
            {{ item.pointItemName || item.name }}
          </td>
          <td>
            {{
              (
                item.price ||
                item.pointPrice ||
                item.pointScore ||
                item.point?.pointScore ||
                0
              ).toLocaleString()
            }}
            P
          </td>
          <td>{{ formatDate(item.purchaseAt || item.createdAt) }}</td>
        </tr>
      </tbody>
    </table>

    <!-- 페이징 -->
    <div v-if="totalPages > 1" class="pagination">
      <button
        class="page-btn"
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
      >
        이전
      </button>

      <button
        v-for="page in pageNumbers"
        :key="page"
        class="page-number"
        :class="{ active: page === currentPage }"
        @click="changePage(page)"
      >
        {{ page }}
      </button>

      <button
        class="page-btn"
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
      >
        다음
      </button>
    </div>

    <!-- 구매 내역 없음 -->
    <div v-else class="empty">
      <p>아직 구매한 상품이 없습니다.</p>
      <button class="go-shop-btn" @click="router.push('/pointshop')">
        포인트샵으로 이동 →
      </button>
    </div>
  </div>
</template>

<style scoped>
.history-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
  background: #fafafa;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  font-family: 'Noto Sans KR', sans-serif;
}
.page-title {
  text-align: center;
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 24px;
  color: #222;
}
.user-balance {
  text-align: right;
  margin-bottom: 16px;
  font-size: 1.1rem;
  color: #333;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  transition: opacity 0.3s;
}
.user-balance.loading {
  opacity: 0.7;
}
.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #ccc;
  border-top-color: #0078ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.loading {
  text-align: center;
  padding: 40px;
  color: #777;
  font-size: 1rem;
}
.history-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}
th {
  background-color: var(--color-primary, #0078ff);
  color: #fff;
  padding: 12px;
  text-align: left;
  font-size: 0.95rem;
}
td {
  padding: 10px 12px;
  border-bottom: 1px solid #eee;
  font-size: 0.9rem;
}
tr:hover td {
  background: #f9f9f9;
}
.item-name {
  display: flex;
  align-items: center;
  gap: 8px;
}
.item-image {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 6px;
}
.clickable-row {
  cursor: pointer;
  transition: background 0.2s;
}
.clickable-row:hover {
  background: #f0f8ff;
}
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
}
.page-btn,
.page-number {
  padding: 8px 16px;
  border: 1px solid #e5e7eb;
  background: white;
  color: #374151;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}
.page-btn:hover:not(:disabled),
.page-number:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}
.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.page-number.active {
  background: #0078ff;
  color: white;
  border-color: #0078ff;
  font-weight: bold;
}
.empty {
  text-align: center;
  color: #777;
  padding: 50px 0;
}
.go-shop-btn {
  background-color: var(--color-primary, #0078ff);
  color: #fff;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  margin-top: 12px;
  transition: background 0.2s;
}
.go-shop-btn:hover {
  background-color: var(--color-skyblue, #4aa8ff);
}
</style>