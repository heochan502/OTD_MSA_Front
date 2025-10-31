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

// 포인트 클릭 시 프로필 이동
const goToProfile = () => {
  router.push('/user/profile')
}

// 초기화
onMounted(async () => {
  await initializePurchaseHistory()
})
</script>

<template>
  <div class="history-container">
    <!-- 현재 포인트 -->
    <div class="user-balance" :class="{ loading: isLoading }"
    @click="goToProfile">
      내 보유 포인트 :
      <strong>{{ animatedPoints.toLocaleString() }}</strong>
      <img src="/image/main/point.png" alt="포인트 아이콘" class="point-icon" />
      <span v-if="isLoading" class="spinner"></span>
    </div>

    <!-- 로딩 중 -->
    <div v-if="isLoading" class="loading">로딩 중입니다...</div>

    <!-- 구매 내역 -->
    <!-- 헤더 -->
    <div class="history-header">
        <span class="header-name">상품명</span>
        <span class="header-price">포인트</span>
        <span class="header-date">구매일시</span>
      </div>

    <!-- 구매 내역 리스트 -->
    <div class="history-list">
    <div
        v-for="item in paginatedItems"
        :key="item.purchaseId"
        class="history-row"
        :class="{ used: item.isUsed }"
        @click="!item.isUsed && goToDetail(item)"
      >
        <span class="item-name">{{ item.pointItemName || item.name }}</span>
        <span class="item-price">
          {{
            (
              item.price ||
              item.pointPrice ||
              item.pointScore ||
              item.point?.pointScore ||
              0
            ).toLocaleString()
          }}P
        </span>
        <span class="item-date">{{ formatDate(item.purchaseAt || item.createdAt) }}</span>
        </div>
      </div>

    <!-- 페이징 -->
    <div v-if="totalPages > 1" class="pagination">

    <!-- 이전 버튼 -->
    <button
      class="page-btn prev-btn"
      :disabled="currentPage === 1"
      @click="changePage(currentPage - 1)"
    >
      이전
    </button>

    <!-- 페이지 번호 -->
    <button
      v-for="page in pageNumbers"
      :key="page"
      class="page-number"
      :class="{ active: page === currentPage }"
      @click="changePage(page)"
    >
      {{ page }}
    </button>

    <!-- 다음 버튼 -->
    <button
      class="page-btn next-btn"
      :disabled="currentPage === totalPages"
      @click="changePage(currentPage + 1)"
    >
      다음
    </button>
  </div>

    <!-- 구매 내역 없음 -->
    <div v-if="!paginatedItems.length" class="empty">
      <p>아직 구매한 상품이 없습니다.</p>
      <button class="go-shop-btn" @click="router.push('/pointshop')">
        포인트샵으로 이동 →
      </button>
    </div>
  </div>

  <transition name="fade" mode="out-in">
    <RouterView />
  </transition>
</template>

<style scoped>
.history-container {
  width: 100%;
  max-width: 390px;
  margin: 0 auto;
  padding: 24px 20px;
  background: #fafafa;
  border: 1px solid #e6e6e6;
  border-radius: 10px;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.08);
  font-family: 'Pretendard', sans-serif;
  color: #303030;
  box-sizing: border-box;
}

/* 내 보유 포인트 */
.user-balance {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  margin-right: 6px;
  margin-bottom: 14px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
}

.user-balance strong {
  font-size: 16px;
  font-weight: 700;
  color: #00b5df;
}

.point-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
  transform: translateY(1px);
}

.user-balance.loading {
  pointer-events: none;
  opacity: 0.6;
}
.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #ccc;
  border-top: 2px solid #00b5df;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
/* 헤더 + 행 공통 구조 */
.history-header,
.history-row {
  display: grid;
  grid-template-columns: 1.4fr 0.8fr 1.2fr;
  align-items: center;
  text-align: center;
  min-height: 44px;
  max-width: 350px;
  margin: 0 auto;
  padding: 8px 10px;
  border-radius: 8px;
  box-sizing: border-box;
}

.history-row.used {
  position: relative;
  background: #f0f0f0;
  color: #999;
  pointer-events: none;
  filter: grayscale(0.8);
  opacity: 0.85;
}

.history-row.used::after {
  content: "사용 완료";
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.55);
  background: rgba(255, 255, 255, 0.4);
  border-radius: 8px;
  pointer-events: none;
}

/* 헤더 */
.history-header {
  background: #f4faff;
  border: 1px solid #e6e6e6;
  border-radius: 10px;
  font-weight: 700;
  color: #00b5df;
  font-size: 13px;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  max-width: 350px;
  margin: 0 auto;
  padding: 8px 10px;
  box-sizing: border-box;
  margin-bottom: 10px;
}
.header-name {
  text-align: left;
  padding-left: 40px;
}
.header-price {
  text-align: center;
  padding-left: 15px;
}
.header-date {
  text-align: right;
  padding-right: 30px;
}

/* 리스트 */
.history-list {
  display: flex;
  flex-direction: column;
  width: 100%;
  border: 1px solid #e6e6e6;
  border-radius: 10px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

/* 데이터 행 */
.history-row {
  position: relative;
  display: grid;
  grid-template-columns: 1.6fr 0.8fr 1.2fr;
  align-items: center;
  width: 100%;
  padding: 2px 8px;
  font-size: 12px;
  line-height: 1.2;
  color: #303030;
  text-align: center;
  border-top: 0.5px solid #f0f0f0;
  background: #fff;
  transition: background 0.2s ease, transform 0.15s ease;
  overflow: hidden;
  z-index: 0;
  min-height: 35px;
}

/* hover 배경을 전체 폭으로 */
.history-row::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  z-index: 0;
  transition: background 0.25s ease;
}

/* hover 시 전체 가로 배경이 채워짐 */
.history-row:hover::before {
  background: #e8faff;
  box-shadow: inset 0 0 0 9999px rgba(230, 250, 255, 0.7);
}

.history-row:hover {
  background: #e8faff;
  box-shadow: inset 0 0 0 1000px rgba(232, 250, 255, 0.9);
  z-index: 1;
  transform: translateY(-1px);
}

/* 텍스트 hover 배경 위로 표시 */
.history-row span {
  position: relative;
  z-index: 1;
}

/* 첫 번째 행 상단선 제거 (헤더와 자연스러운 연결) */
.history-row:first-child {
  border-top: none;
}

/* 각 행 모서리 제거 (둥근 모서리는 부모에서 처리) */
.history-row {
  border-radius: 0;
}

/* 마지막 행 아래 라운드 유지 */
.history-row:last-child {
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}

/* 중간 행은 둥근 모서리 제거 */
.history-row:not(:first-child):not(:last-child) {
  border-radius: 0;
}

/* 텍스트 스타일 */
.item-name {
  text-align: left;
  padding-left: 4px;
  font-weight: 500;
  color: #303030;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-price {
  text-align: center;
  font-weight: 700;
  color: #00b5df;
}

.item-date {
  text-align: right;
  font-size: 10.5px;
  padding-right: 10px;
  color: #888;
}

/* 사용 완료 쿠폰 */
.history-row.used {
  background: #f2f2f2;
  color: #a0a0a0;
  opacity: 0.7;
  pointer-events: none;
  border: 1px solid #ddd;
}
.history-row.used .item-name {
  text-decoration: line-through;
  color: #999;
}
.history-row.used .item-price {
  color: #bbb;
}

/* 페이지네이션 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
}
.page-btn,
.page-number {
  border: 1px solid #e6e6e6;
  border-radius: 6px;
  padding: 5px 9px;
  font-size: 12px;
  background: #fff;
  color: #00b5df;
  cursor: pointer;
  transition: all 0.2s ease;
}
/* hover 시 배경 하이라이트 */
.page-btn:hover:not(:disabled),
.page-number:hover:not(:disabled) {
  background: #e6f8fa;
  transform: translateY(-1px);
}

/* 클릭(press) 시 눌림 효과 */
.page-btn:active:not(:disabled),
.page-number:active:not(:disabled) {
  transform: translateY(1px);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.15);
}

/* 현재 페이지 강조 */
.page-number.active {
  background: #00b5df;
  color: #fff;
  border-color: #00b5df;
}

/* 마지막 페이지에서도 이전 버튼은 활성 색 유지 */
.prev-btn:disabled {
  background: #fff;
  color: #00b5df;
  border-color: #00b5df;
  opacity: 1;
  cursor: not-allowed;
}

/* 첫 페이지에서 이전 버튼 비활성화 색 유지 */
.page-btn:disabled {
  background: #f5f5f5;
  color: #bbb;
  border-color: #ddd;
  cursor: not-allowed;
  opacity: 0.7;
  transform: none;
}

/* 활성화 버튼 */
.page-btn:not(:disabled) {
  color: #00b5df;
}

/* hover 효과 유지 */
.page-btn:not(:disabled):hover {
  background: #e6f8fa;
  transform: translateY(-1px);
}


/* 부드러운 전환 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
}

/* 빈 데이터 */
.empty {
  text-align: center;
  color: #777;
  padding: 50px 0;
}
.go-shop-btn {
  background-color: #00b5df;
  color: #fff;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  margin-top: 12px;
  transition: background 0.2s;
}
.go-shop-btn:hover {
  background-color: #02b7c1;
}

.item-point.clickable {
  color: #00b5df;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}
.item-point.clickable:hover {
  text-decoration: underline;
  color: #0091b5;
}

/* 반응형 */
@media (max-width: 480px) {
  .history-container {
    padding: 16px;
  }
  .history-header,
  .history-row {
    max-width: 100%;
    padding: 8px 10px;
  }
  .item-date {
    font-size: 10px;
  }
}

/* 페이드 인·아웃 애니메이션 */
.fade-enter-active, .fade-leave-active {
  transition: all 0.35s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>