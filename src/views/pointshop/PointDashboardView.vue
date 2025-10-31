<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePointshop } from '@/components/pointshop/usePointshop.js'
import PointShopService from '@/services/pointshop/PointShopService'

const router = useRouter()

const {
  userPoints,
  allItems,
  purchasedItems,
  fetchUserPoints,
  fetchAllItems,
  purchaseItem,
  isPurchased,
  initialize,
} = usePointshop()

// 프로필 이동
const goToProfile = () => router.push('/user/profile')

// 구매 상세 페이지 이동
const goToPurchaseDetail = (purchaseId) => {
  router.push(`/pointshop/purchase-history/detail/${purchaseId}`)
}

// 이미지 자동 import
const images = import.meta.glob('@/assets/img/pointshop/*', {
  eager: true,
  import: 'default',
})

// 이미지 경로 처리
const getItemImage = (name) => {
  const defaultPath = '/src/assets/img/pointshop/default.png'
  if (!name) return images[defaultPath]
  if (name.startsWith('http') || name.startsWith('/')) return name
  const fullPath = `/src/assets/img/pointshop/${name}`
  if (images[fullPath]) return images[fullPath]
  const alt = Object.keys(images).find((key) => key.includes(name.split('.')[0]))
  return alt ? images[alt] : images[defaultPath]
}

// 필터 상태
const searchKeyword = ref(localStorage.getItem('searchKeyword') || '')
const sortOption = ref(localStorage.getItem('sortOption') || 'default')
const priceRange = ref(localStorage.getItem('priceRange') || 'all')
const categoryFilter = ref(localStorage.getItem('categoryFilter') || 'all')
const categoryOptions = ref([{ value: 'all', label: '전체' }])

// 초기 로딩
onMounted(async () => {
  await initialize()
  await loadCategories()
})

// 카테고리 목록
const loadCategories = async () => {
  try {
    const categories = await PointShopService.getAllCategories()
    categoryOptions.value = [
      { value: 'all', label: '전체' },
      ...categories
        .filter((c) => c.categoryName !== '기타')
        .map((c) => ({
          value: c.pointCategoryId,
          label: c.categoryName,
        })),
    ]
  } catch (e) {
    console.error('[카테고리 로드 실패]', e)
  }
}

// 카테고리 변경 시 재로드
const handleCategoryChange = async () => {
  try {
    const list = await PointShopService.getAllItems(categoryFilter.value)
    allItems.value = Array.isArray(list) ? list : []
  } catch (e) {
    console.error('[카테고리 변경 실패]', e)
    allItems.value = []
  }
}

// 로컬 스토리지 동기화
watch([searchKeyword, sortOption, priceRange, categoryFilter], () => {
  localStorage.setItem('searchKeyword', searchKeyword.value)
  localStorage.setItem('sortOption', sortOption.value)
  localStorage.setItem('priceRange', priceRange.value)
  localStorage.setItem('categoryFilter', categoryFilter.value)
})

// 필터 초기화
const resetFilters = async () => {
  searchKeyword.value = ''
  sortOption.value = 'default'
  priceRange.value = 'all'
  categoryFilter.value = 'all'
  localStorage.clear()
  await fetchAllItems()
}

// 가격 및 검색 필터
const extractCategoryId = (i) =>
  i?.categoryId ?? i?.pointCategoryId ?? i?.pointCategory?.pointCategoryId ?? null

const filteredItems = computed(() => {
  let list = [...(allItems.value || [])]
  list = list.filter((i) => i.pointId && i.categoryName !== '기타')

  if (categoryFilter.value !== 'all') {
    const want = Number(categoryFilter.value)
    list = list.filter((i) => Number(extractCategoryId(i)) === want)
  }

  if (searchKeyword.value.trim()) {
    const kw = searchKeyword.value.trim().toLowerCase()
    list = list.filter((i) => i.pointItemName?.toLowerCase().includes(kw))
  }

  switch (priceRange.value) {
    case '0-5000':
      list = list.filter((i) => i.pointScore <= 5000)
      break
    case '5001-10000':
      list = list.filter((i) => i.pointScore > 5000 && i.pointScore <= 10000)
      break
    case '10001+':
      list = list.filter((i) => i.pointScore > 10000)
      break
  }

  switch (sortOption.value) {
    case 'priceAsc':
      list.sort((a, b) => a.pointScore - b.pointScore)
      break
    case 'priceDesc':
      list.sort((a, b) => b.pointScore - a.pointScore)
      break
    case 'nameAsc':
      list.sort((a, b) => a.pointItemName.localeCompare(b.pointItemName))
      break
    case 'popular':
      const counts = purchasedItems.value.reduce((acc, p) => {
        acc[p.pointItemName] = (acc[p.pointItemName] || 0) + 1
        return acc
      }, {})
      list.sort(
        (a, b) => (counts[b.pointItemName] || 0) - (counts[a.pointItemName] || 0)
      )
      break
  }

  return list
})

// 구매 관련
const isAffordable = (price) => (userPoints.value || 0) >= (price || 0)
const handlePurchase = async (item) => {
  if (!item?.pointId) return alert('유효하지 않은 아이템입니다.')
  if (isPurchased(item.pointId)) return
  if (item.stock === 0) return alert('품절된 상품입니다.')
  if (!isAffordable(item.pointScore)) {
    if (confirm('포인트가 부족합니다. 챌린지로 이동하시겠습니까?'))
      router.push('/challenge')
    return
  }
  if (!confirm(`${item.pointItemName} (${item.pointScore.toLocaleString()}P) 구매?`)) return
  try {
    await purchaseItem(item)
    await fetchUserPoints()
  } catch (err) {
    alert('구매 중 오류가 발생했습니다.')
    console.error(err)
  }
}

// 구매내역 페이지네이션
const currentPage = ref(1)
const pageSize = 5
const totalPages = computed(() =>
  Math.ceil((purchasedItems.value?.length || 0) / pageSize)
)
const paginatedPurchasedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return purchasedItems.value.slice(start, start + pageSize)
})
const goToPage = (p) => {
  if (p >= 1 && p <= totalPages.value) currentPage.value = p
}
</script>

<template>
  <div class="point-dashboard">
    <!-- 포인트 표시 -->
    <header class="point-header">
      <div class="point-mini" @click="goToProfile">
        <img src="/image/main/point.png" alt="포인트" class="point-icon" />
        <div class="point-text">
          <span class="value">{{ (userPoints || 0).toLocaleString() }}</span>
          <span class="unit">P</span>
        </div>
      </div>
    </header>

    <p class="notice">포인트는 아이템 구매에만 사용됩니다.</p>

    <!-- 필터 -->
    <div class="filter-bar">
      <select v-model="priceRange" class="filter-select">
        <option value="all">전체 가격대</option>
        <option value="0-5000">~5,000P</option>
        <option value="5001-10000">5,001~10,000P</option>
        <option value="10001+">10,001P 이상</option>
      </select>

      <select v-model="categoryFilter" class="filter-select" @change="handleCategoryChange">
        <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>

      <select v-model="sortOption" class="sort-select">
        <option value="default">정렬 선택</option>
        <option value="priceAsc">가격 낮은순</option>
        <option value="priceDesc">가격 높은순</option>
        <option value="nameAsc">이름순</option>
        <option value="popular">인기순</option>
      </select>

      <input v-model="searchKeyword" type="text" placeholder="아이템 이름 검색" class="search-input" />
      <button class="reset-btn" @click="resetFilters">초기화</button>
    </div>

    <!-- 아이템 목록 -->
    <section class="item-list">
      <h3>포인트 아이템 목록</h3>
      <p v-if="!filteredItems?.length" class="empty">조건에 맞는 아이템이 없습니다.</p>

      <ul v-else class="items">
        <li v-for="item in filteredItems" :key="item.pointId" class="item">
          <img :src="getItemImage(item.pointItemImage || item.imageUrl)" alt="item" class="item-image" />
          <div class="info">
            <h4>{{ item.pointItemName }}</h4>
            <p class="price">{{ Number(item.pointScore || 0).toLocaleString() }}P</p>
            <p class="category">{{ item.categoryName || '기타' }}</p>
            <button
              @click="handlePurchase(item)"
              :class="{
                purchased: isPurchased(item.pointId),
                insufficient: !isAffordable(item.pointScore) && !isPurchased(item.pointId),
                out: item.stock === 0
              }"
            >
              <template v-if="item.stock === 0">품절</template>
              <template v-else-if="isPurchased(item.pointId)">구매 완료</template>
              <template v-else-if="!isAffordable(item.pointScore)">포인트 부족</template>
              <template v-else>구매하기</template>
            </button>
          </div>
        </li>
      </ul>
    </section>

    <!-- 짧은 점선 구분선 -->
    <div class="divider"></div>

    <!-- 구매 내역 -->
    <section class="purchase-section">
      <h3>구매 내역</h3>
      <p v-if="!purchasedItems?.length" class="empty">구매 내역이 없습니다.</p>

      <ul v-else class="history-list">
        <li
          v-for="(h, idx) in paginatedPurchasedItems"
          :key="idx"
          class="history-item clickable"
          :class="{ used: h.isUsed }"
          @click="goToPurchaseDetail(h.purchaseId)"
        >
          <span class="item-name">{{ h.pointItemName }}</span>
          <span class="amount">-{{ Number(h.pointScore || 0).toLocaleString() }}P</span>
          <span class="date">
            {{
              (() => {
                const d = new Date(h.purchaseAt)
                return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
                  d.getDate()
                ).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(
                  d.getMinutes()
                ).padStart(2, '0')}`
              })()
            }}
          </span>
        </li>
      </ul>

      <div v-if="totalPages > 1" class="pagination">
        <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">이전</button>
        <span>{{ currentPage }} / {{ totalPages }}</span>
        <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">다음</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* 전체 컨테이너 */
.point-dashboard {
  width: 100%;
  max-width: 390px;
  margin: 0 auto;
  padding: 20px;
  background: #fafafa;
  border: 1px solid #e6e6e6;
  border-radius: 10px;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.08);
  font-family: 'Pretendard', sans-serif;
  color: #303030;
  box-sizing: border-box;
}

/* 상단 포인트 표시 */
.point-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;
}
.point-mini {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  padding: 6px 12px;
  border: 1px solid #e6e6e6;
  border-radius: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
.point-icon {
  width: 20px;
  height: 20px;
}
.point-text {
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.point-text .value {
  font-size: 16px;
  font-weight: 700;
  color: #00d5df;
}

/* 안내문 */
.notice {
  text-align: center;
  font-size: 12px;
  color: #989898;
  margin-bottom: 20px;
}

/* 필터바 */
.filter-bar {
  width: 340px;
  margin: 0 auto 25px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
}
.filter-select,
.sort-select,
.search-input {
  flex: 1;
  min-width: 120px;
  padding: 8px 12px;
  border: 1px solid #e6e6e6;
  border-radius: 10px;
  background: #fff;
  font-size: 14px;
}
.reset-btn {
  background: #ffe864;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.reset-btn:hover {
  background: #ffd944;
}

/* 포인트 아이템 목록 */
.item-list {
  width: 340px;
  margin: 0 auto 40px;
  padding-left: 1px;
}

/* 포인트 아이템 */
.items {
  width: 100%;
  max-width: 340px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(2, 160px);
  justify-content: center;
  padding-right: 30px;
  gap: 10px;
}

/* 아이템 카드 */
.item {
  background: #fff;
  border: 1px solid #e6e6e6;
  border-radius: 10px;
  padding: 18px 14px;
  text-align: center;
  height: 220px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
  transition: transform 0.15s ease;
}
.item:hover {
  transform: translateY(-3px);
}
.item-image {
  width: 80px;
  height: 80px;
  border-radius: 10px;
  object-fit: cover;
  margin: 0 auto 8px;
}
.info h4 {
  font-size: 13px;
  font-weight: 600;
  color: #303030;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.price {
  font-size: 12px;
  color: #393e46;
  margin-bottom: 3px;
}
.category {
  font-size: 10px;
  color: #989898;
  margin-bottom: 6px;
}

/* 버튼 */
button {
  background: #00d5df;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
button:hover:not(:disabled) {
  background: #02b7c1;
}
button.purchased {
  background: #989898;
  cursor: default;
  opacity: 0.8;
}
button.insufficient {
  background: #ff2c2c;
}
button.out {
  background: #e6e6e6;
  color: #393e46;
}

/* 짧은 점선 구분선 */
.divider {
  width: 80%;
  max-width: 360px;
  margin: 18px auto;
  border-top: 1px dashed #ddd;
  opacity: 0.8;
}

/* 구매 내역 */
.purchase-section {
  width: 340px;
  margin: 0 auto;
  padding-top: 10px;
  box-sizing: border-box;
}

/* ✅ 공통 제목 h3 (포인트 아이템 목록 + 구매 내역) */
.item-list h3,
.purchase-section h3 {
  font-size: 16px;
  font-weight: 700;
  color: #303030;
  text-align: left;
  margin: 0 0 14px 0;
  padding-left: 2px;
}

/* 구매 내역 리스트 */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.history-item {
  display: grid;
  grid-template-columns: 1fr auto 90px;
  align-items: center;
  background: #fff;
  border: 1px solid #e6e6e6;
  border-radius: 10px;
  padding: 10px 14px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.3;
  transition: background-color 0.2s, transform 0.1s;
  width: 340px;
  margin: 0 0 0 -30px;
  box-sizing: border-box;
}
.history-item:hover {
  background: #e6f8fa;
  transform: translateY(-2px);
  z-index: 1;
}

/* 사용 완료 처리 */
.history-item.used {
  background: #f2f2f2;
  border: 1px solid #ddd;
  color: #999;
  cursor: default;
  position: relative;
  pointer-events: none;
}

.history-item.used::after {
  content: "사용 완료";
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.55);
  background: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
}

.history-item.used .amount {
  color: #bbb;
}

.history-item.used .item-name {
  text-decoration: line-through;
  color: #999;
}

.item-name {
  color: #303030;
  font-weight: 500;
  letter-spacing: -0.2px;
}
.amount {
  color: #00d5df;
  font-weight: 600;
  text-align: right;
}
.date {
  color: #989898;
  text-align: right;
  font-size: 11px;
  letter-spacing: -0.2px;
}

/* 페이지네이션 */
.pagination {
  width: 340px;
  margin: 20px auto 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}
.pagination button {
  background: #00d5df;
  color: #fff;
  border: none;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 12px;
}
.pagination button:disabled {
  background: #e6e6e6;
  color: #989898;
  cursor: not-allowed;
}

/* 반응형 */
@media (max-width: 480px) {
  .filter-bar,
  .item-list,
  .purchase-section,
  .pagination {
    width: 90%;
  }

  .items {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }
  .history-item {
    margin-left: -40px;
  }
}
</style>










