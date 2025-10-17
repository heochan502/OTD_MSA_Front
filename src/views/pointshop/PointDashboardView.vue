<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { usePointshop } from '@/components/pointshop/usePointshop.js';

const {
  userPoints,
  allItems,
  purchasedItems,
  fetchUserPoints,
  fetchAllItems,
  fetchPurchasedItems,
  purchaseItem,
  isPurchased,
} = usePointshop();

// 검색 / 정렬 / 가격대 / 카테고리 필터 상태
const searchKeyword = ref(localStorage.getItem('searchKeyword') || '');
const sortOption = ref(localStorage.getItem('sortOption') || 'default');
const priceRange = ref(localStorage.getItem('priceRange') || 'all');
const categoryFilter = ref(localStorage.getItem('categoryFilter') || 'all');

// 카테고리 옵션 목록
const categoryOptions = ref([
  { value: 'all', label: '전체' },
  { value: 'coffee', label: '커피/음료' },
  { value: 'gift', label: '상품권' },
  { value: 'food', label: '식품' },
  { value: 'beauty', label: '뷰티/생활' },
]);

// 로컬스토리지 자동 저장
watch([searchKeyword, sortOption, priceRange, categoryFilter], () => {
  localStorage.setItem('searchKeyword', searchKeyword.value);
  localStorage.setItem('sortOption', sortOption.value);
  localStorage.setItem('priceRange', priceRange.value);
  localStorage.setItem('categoryFilter', categoryFilter.value);
}, { flush: 'post' });

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

// 포인트 부족 여부
const isAffordable = (price) => (userPoints.value || 0) >= (price || 0);

// 필터 + 정렬 + 검색 결과 계산
const filteredItems = computed(() => {
  let list = [...(allItems.value || [])];

  // 카테고리 필터
  if (categoryFilter.value !== 'all') {
    list = list.filter((i) => i.category === categoryFilter.value);
  }

  // 검색 필터
  if (searchKeyword.value.trim()) {
    const kw = searchKeyword.value.trim().toLowerCase();
    list = list.filter((i) => i.pointItemName?.toLowerCase().includes(kw));
  }

  // 가격대 필터
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

  // 정렬
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
      const counts = {};
      purchasedItems.value.forEach((p) => {
        counts[p.pointItemName] = (counts[p.pointItemName] || 0) + 1;
      });
      list.sort((a, b) => (counts[b.pointItemName] || 0) - (counts[a.pointItemName] || 0));
      break;
  }

  return list;
});

// 구매 처리
const handlePurchase = async (item) => {
  if (!item?.pointId) return alert('유효하지 않은 아이템입니다.');
  if (item.stock === 0) return alert('품절된 상품입니다.');
  if (!isAffordable(item.pointScore)) return alert('포인트가 부족합니다.');

  const confirmBuy = confirm(
    `${item.pointItemName} (${Number(item.pointScore).toLocaleString()}P)를 구매하시겠습니까?`
  );
  if (!confirmBuy) return;

  await purchaseItem(item);

  // 즉시 반영
  userPoints.value = Math.max((userPoints.value || 0) - (item.pointScore || 0), 0);
  purchasedItems.value.unshift({
    pointItemName: item.pointItemName,
    pointScore: item.pointScore,
    purchaseAt: new Date().toISOString(),
  });
  item.stock = Math.max((item.stock || 1) - 1, 0);
};

// 초기 로드
onMounted(async () => {
  await Promise.all([fetchUserPoints(), fetchAllItems(), fetchPurchasedItems()]);
});
</script>

<template>
  <div class="point-dashboard">
    <!-- 상단 포인트 -->
    <header class="point-header">
      <div class="point-mini">
        <img src="/image/main/point.png" alt="포인트 아이콘" class="point-icon" />
        <div class="point-text">
          <span class="label"></span>
          <span class="value">{{ (userPoints || 0).toLocaleString() }}</span>
          <span class="unit">P</span>
        </div>
      </div>
    </header>

    <p class="notice">포인트는 아이템 구매에만 사용됩니다.</p>

    <!-- 검색 + 정렬 + 가격 + 카테고리 + 리셋 -->
    <div class="filter-bar">
      <input v-model="searchKeyword" type="text" placeholder="아이템 이름 검색" class="search-input" />

      <select v-model="categoryFilter" class="filter-select">
        <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
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
            v-if="item.imageUrl || item.pointItemImage"
            :src="item.imageUrl || ('/api/OTD/pointshop/image/' + item.pointItemImage)"
            alt="item"
            class="item-image"
            @error="(e) => (e.target.src = '/image/pointshop/default.png')"
          />

          <div class="info">
            <h4>{{ item.pointItemName }}</h4>
            <p class="price">{{ Number(item.pointScore || 0).toLocaleString() }}P</p>
            <!-- 재고 주석 표시 -->
            <!-- <p class="stock" :class="{ out: item.stock === 0 }">
              재고: {{ item.stock === 0 ? '품절' : item.stock + '개' }}
            </p> -->

            <button
              :disabled="isPurchased(item.pointId) || !isAffordable(item.pointScore) || item.stock === 0"
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
          <span class="date">{{ new Date(h.purchaseAt).toLocaleDateString('ko-KR') }}</span>
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

.notice {
  text-align: center;
  font-size: 0.85rem;
  color: #888;
  margin-bottom: 18px;
}

/* 필터 영역 */
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

/* 아이템 카드 */
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
.stock {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 6px;
}
.stock.out {
  color: #c0392b;
  font-weight: 600;
}

/* 버튼 */
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
  background: #285db5;
}
button:disabled {
  background: #bbb;
  cursor: not-allowed;
}
button.purchased {
  background: #666;
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
.history-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 14px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  font-size: 0.85rem;
}
.amount {
  color: #c0392b;
  font-weight: 600;
}
.empty {
  text-align: center;
  color: #999;
  font-size: 0.85rem;
  padding: 14px 0;
}
</style>