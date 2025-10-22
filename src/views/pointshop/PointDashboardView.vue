<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { usePointshop } from '@/components/pointshop/usePointshop.js';
import PointCategoryService from '@/services/pointshop/AdminPointCategoryService';

const router = useRouter();

const {
  userPoints,
  allItems,
  purchasedItems,
  fetchUserPoints,
  fetchAllItems,
  fetchPurchasedItems,
  purchaseItem,
  isPurchased,
  initialize,
} = usePointshop();

// 프로필 이동
const goToProfile = () => {
  router.push('/user/profile');
};

// 이미지 경로 변환 함수 (Vite 빌드 호환)
const getItemImage = (name) => {
  if (!name) {
    return new URL('@/assets/img/pointshop/default.png', import.meta.url).href;
  }

  // 외부 URL이거나 절대 경로일 경우 그대로 반환
  if (name.startsWith('http') || name.startsWith('/')) {
    return name;
  }

  try {
    // 내부 리소스 경로 변환
    return new URL(`@/assets/img/pointshop/${name}`, import.meta.url).href;
  } catch (e) {
    console.warn('[getItemImage] 로드 실패:', name);
    return new URL('@/assets/img/pointshop/default.png', import.meta.url).href;
  }
};

// 필터 상태
const searchKeyword = ref(localStorage.getItem('searchKeyword') || '');
const sortOption = ref(localStorage.getItem('sortOption') || 'default');
const priceRange = ref(localStorage.getItem('priceRange') || 'all');
const categoryFilter = ref(localStorage.getItem('categoryFilter') || 'all');

// 카테고리 옵션
const categoryOptions = ref([{ value: 'all', label: '전체' }]);

// 초기 로딩
onMounted(async () => {
  await initialize();  // 포인트, 아이템, 구매내역을 한 번에 불러옴
  await loadCategories(); // 카테고리만 별도 로드
});

// 카테고리 로드
const loadCategories = async () => {
  try {
    const categories = await PointCategoryService.getAllCategories();
    categoryOptions.value = [
      { value: 'all', label: '전체' },
      ...categories.map((c) => ({
        value: c.categoryId,
        label: c.categoryName,
      })),
    ];
  } catch (e) {
    console.error('[카테고리 불러오기 실패]', e);
  }
};

// 로컬스토리지 동기화
watch(
  [searchKeyword, sortOption, priceRange, categoryFilter],
  () => {
    localStorage.setItem('searchKeyword', searchKeyword.value);
    localStorage.setItem('sortOption', sortOption.value);
    localStorage.setItem('priceRange', priceRange.value);
    localStorage.setItem('categoryFilter', categoryFilter.value);
  },
  { flush: 'post' }
);

// 필터 리셋
const resetFilters = () => {
  searchKeyword.value = '';
  sortOption.value = 'default';
  priceRange.value = 'all';
  categoryFilter.value = 'all';
  localStorage.removeItem('searchKeyword');
  localStorage.removeItem('sortOption');
  localStorage.removeItem('priceRange');
  localStorage.removeItem('categoryFilter');
};

// 포인트 충분 여부
const isAffordable = (price) => (userPoints.value || 0) >= (price || 0);

// 필터 + 정렬 + 검색
const filteredItems = computed(() => {
  let list = [...(allItems.value || [])];

  if (categoryFilter.value !== 'all') {
    list = list.filter((i) => i.categoryId === Number(categoryFilter.value));
  }

  if (searchKeyword.value.trim()) {
    const kw = searchKeyword.value.trim().toLowerCase();
    list = list.filter((i) => i.pointItemName?.toLowerCase().includes(kw));
  }

  switch (priceRange.value) {
    case '0-5000':
      list = list.filter((i) => i.pointScore <= 5000);
      break;
    case '5001-10000':
      list = list.filter((i) => i.pointScore > 5000 && i.pointScore <= 10000);
      break;
    case '10001+':
      list = list.filter((i) => i.pointScore > 10000);
      break;
  }

  switch (sortOption.value) {
    case 'priceAsc':
      list.sort((a, b) => (a.pointScore || 0) - (b.pointScore || 0));
      break;
    case 'priceDesc':
      list.sort((a, b) => (b.pointScore || 0) - (a.pointScore || 0));
      break;
    case 'nameAsc':
      list.sort((a, b) => a.pointItemName.localeCompare(b.pointItemName));
      break;
    case 'popular':
      const counts = purchasedItems.value.reduce((acc, p) => {
        acc[p.pointItemName] = (acc[p.pointItemName] || 0) + 1;
        return acc;
      }, {});
      list.sort(
        (a, b) => (counts[b.pointItemName] || 0) - (counts[a.pointItemName] || 0)
      );
      break;
  }

  return list;
});

// 구매 처리
const handlePurchase = async (item) => {
  if (!item?.pointId) return alert('유효하지 않은 아이템입니다.');
  if (isPurchased(item.pointId)) return;
  if (item.stock === 0) return alert('품절된 상품입니다.');

  if (!isAffordable(item.pointScore)) {
    const goToChallenge = confirm('포인트가 부족합니다. 챌린지로 이동하시겠습니까?');
    if (goToChallenge) router.push('/challenge');
    return;
  }

  const ok = confirm(
    `${item.pointItemName} (${Number(item.pointScore).toLocaleString()}P)를 구매하시겠습니까?`
  );
  if (!ok) return;

  try {
    await purchaseItem(item);
    await fetchUserPoints();
  } catch (err) {
    console.error('[handlePurchase] 구매 실패:', err);
    alert('구매 처리 중 오류가 발생했습니다.');
  }
};
</script>

<template>
  <div class="point-dashboard">
    <!-- 상단 포인트 -->
    <header class="point-header">
      <div class="point-mini" @click="goToProfile">
        <img src="/image/main/point.png" alt="포인트 아이콘" class="point-icon" />
        <div class="point-text">
          <span class="value">{{ (userPoints || 0).toLocaleString() }}</span>
          <span class="unit">P</span>
        </div>
      </div>
    </header>

    <p class="notice">포인트는 아이템 구매에만 사용됩니다.</p>

    <!-- 필터 바 -->
    <div class="filter-bar">
      <input
        v-model="searchKeyword"
        type="text"
        placeholder="아이템 이름 검색"
        class="search-input"
      />

      <select v-model="categoryFilter" class="filter-select">
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

      <select v-model="priceRange" class="filter-select">
        <option value="all">전체 가격대</option>
        <option value="0-5000">~5,000P</option>
        <option value="5001-10000">5,001~10,000P</option>
        <option value="10001+">10,001P 이상</option>
      </select>

      <button class="reset-btn" @click="resetFilters">초기화</button>
    </div>

    <!-- 아이템 목록 -->
    <section class="item-list">
      <h3>포인트 아이템 목록</h3>
      <p v-if="!filteredItems?.length" class="empty">조건에 맞는 아이템이 없습니다.</p>

      <ul v-else class="items">
        <li v-for="item in filteredItems" :key="item.pointId" class="item">
          <img
            :src="getItemImage(item.imageUrl || item.images?.[0]?.imageUrl)"
            alt="item"
            class="item-image"
          />

          <div class="info">
            <h4>{{ item.pointItemName }}</h4>
            <p class="price">{{ Number(item.pointScore || 0).toLocaleString() }}P</p>
            <p class="category">{{ item.categoryName || '기타' }}</p>

            <button
              @click="handlePurchase(item)"
              :class="{
                purchased: isPurchased(item.pointId),
                insufficient: !isAffordable(item.pointScore) && !isPurchased(item.pointId),
                out: item.stock === 0,
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

    <!-- 구매 내역 -->
    <section class="history">
      <h3>구매 내역</h3>
      <p v-if="!purchasedItems?.length" class="empty">구매 내역이 없습니다.</p>

      <ul v-else class="history-list">
        <li v-for="(h, idx) in purchasedItems" :key="idx" class="history-item">
          <span class="item-name">{{ h.pointItemName }}</span>
          <span class="amount">-{{ Number(h.pointScore || 0).toLocaleString() }}P</span>
          <span class="date">
            {{
              (() => {
                const d = new Date(h.purchaseAt);
                return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
                  d.getDate()
                ).padStart(2, '0')}\n${String(d.getHours()).padStart(2, '0')}:${String(
                  d.getMinutes()
                ).padStart(2, '0')}`;
              })()
            }}
          </span>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.point-dashboard {
  max-width: 880px;
  margin: 40px auto;
  padding: 28px;
  border-radius: 16px;
  background: #fdfdfd;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  font-family: 'Noto Sans KR', sans-serif;
  color: #2c3e50;
}

/* 상단 포인트 */
.point-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 12px;
}
.point-mini {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  padding: 6px 12px;
  border-radius: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
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
  font-size: 1rem;
  font-weight: 700;
  color: #1a4d8f;
}

/* 안내 문구 */
.notice {
  text-align: center;
  font-size: 0.85rem;
  color: #888;
  margin-bottom: 18px;
}

/* 필터 바 */
.filter-bar {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
}
.search-input,
.sort-select,
.filter-select {
  flex: 1;
  min-width: 160px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 0.9rem;
}
.reset-btn {
  padding: 8px 14px;
  background: #f3f3f3;
  border: 1px solid #aaa;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
}
.reset-btn:hover {
  background: #e8e8e8;
}

/* 아이템 목록 */
.items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}
.item {
  background: #fff;
  border-radius: 10px;
  padding: 14px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}
.item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}
.item-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 8px;
}
.info h4 {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 4px;
}
.price {
  color: #555;
  margin-bottom: 4px;
}
button {
  background: #1a4d8f;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.2s;
}
button:hover:not(:disabled) {
  background: #666;
}
button.purchased {
  background: #777;
  cursor: default;
  pointer-events: none;
  opacity: 0.8;
}
button.insufficient {
  background: #c0392b;
}
button.out {
  background: #999;
}

/* 구매 내역 */
.history {
  margin-top: 40px;
}
.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.history-item {
  display: grid;
  grid-template-columns: 1fr auto 100px;
  align-items: center;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  padding: 12px 16px;
  font-size: 0.9rem;
  color: #333;
}
.item-name {
  font-weight: 500;
}

/* 포인트 */
.amount {
  color: #1a4d8f;
  font-weight: 600;
  text-align: center;
  align-items: center;
  margin-right: 20px;
}

/* 날짜 */
.date {
  color: #777;
  font-size: 0.85rem;
  text-align: right;
  white-space: nowrap;
  line-height: 1.2;
}

/* 데이터가 없을 때 */
.empty {
  text-align: center;
  color: #999;
  font-size: 0.85rem;
  padding: 14px 0;
}
</style>