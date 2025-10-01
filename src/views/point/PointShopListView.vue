<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import PointUserService from '@/services/pointshop/PointUserService';
import PointShopService from '@/services/pointshop/PointShopService';

const router = useRouter();

const userPoints = ref(10000); // 예시 사용자 포인트
const purchasedItems = ref([]); // 구매된 아이템 목록
const allItems = ref([]);

const isPurchased = (itemId) => {
  return Array.isArray(purchasedItems.value) && purchasedItems.value.includes(itemId);
};

onMounted(async () => {
  try {
    const userResponse = await PointUserService.getUserPoints();
    if (userResponse?.data) {
      userPoints.value = userResponse.data.pointBalance;
    }
  
    const shopResponse = await PointShopService.getAllItems();
    if (shopResponse?.data) {
      allItems.value = shopResponse.data.items;
    }
  } catch (error) {
    console.error('데이터 로드 중 오류가 발생했습니다.:', error);
  }
});

const state = reactive({
  search: '',
  showMessage: true,
});

const filteredItems = computed(() => {
  const query = state.search.trim().toLowerCase();
  return query === ''
  ? allItems.value
  : allItems.value.filter(item =>
    item.name.toLowerCase().includes(query)
  );
});

const searchList = computed(() => {
  const names = filteredItems.value.map(item => item.name);
  return [...new Set(names)].slice(0, 5); // 중복 제거
});

const showNoticeMessage = computed(() => {
  return state.search.trim() === '';
});

const onTyping = () => {
  state.showMessage = state.search.trim() === '';
};

const getItemPrice = (priceStr) => {
  return parseInt(priceStr.replace(/,/g, ''), 10);
};

const purchase = (item) => {
  try {
    const purchasedItems = confirm(`${item.name} (${item.price}포인트)를 구매하시겠습니까?`);
    if(!purchaseItems) {
      alert('구매가 취소되었습니다.');
      return;
    }
    
    const pointPrice = (priceStr) => parseInt(priceStr.replace(/,/g, ''), 10);
    
    // 상품 가격 정보 확인
    if(isNaN(pointPrice)) {
      alert('상품 가격 정보가 올바르지 않습니다.');
      return;
    }
    
    // 이미 구매한 상품인지 확인
      if(isPurchased(item.id)) {
      alert('이미 구매된 상품입니다.');
      return;
    }
    // 포인트가 충분한지 확인
      if(userPoints.value >= pointPrice) {
        alert('포인트가 부족합니다.');
      const move = confirm('챌린지 페이지로 이동하시겠습니까?');
      if(move) {
        router.push('/challenge');
      }
      return;
    }
  
    // 구매 처리
      purchasedItems.value.push(item.id); // 구매된 아이템 목록에 추가
      userPoints.value -= itemPrice; // 포인트 차감
      alert(`'${item.name}'을(를) 구매했습니다!`);
    } catch (error) {
      console.error('구매 중 오류 발생:', error);
      alert('구매 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };
    // 구매 후 처리 로직 (예: 포인트 차감, 재고 업데이트 등)

</script>

<template>
  <div class="point-display-global">
    보유 포인트: {{ userPoints.value ? userPoints.value.toLocaleString() : '0' }} P
  </div>
  <div class="search-bar-wrapper">
    <div class="input-container">
      <input class="form-control"
        autocomplete="off"
        type="text"
        list="search-list-id"
        @input="onTyping"
        v-model="state.search"
      />
      <span v-if="showNoticeMessage" class="input-overlay">검색어를 입력해주세요.</span>
    </div>

    <datalist id="search-list-id" v-if="searchList.length > 0">
      <option v-for="item in searchList" :key="item">{{ item }}</option>
    </datalist>
  </div>

  <div class="pointshop-container">
    <div class="item-container" v-for="item in filteredItems" :key="item.id">
      <img :src="`/image/pointshop/item${item.id}.png`" alt="Item Image" class="item-image" />
      <div class="item-details">
        <h5 class="item-name">{{ item.name }}</h5>
        <p class="item-price">Price: {{ item.price }} Points</p>
          <button
          class="b-button"
          :disabled="isPurchased(item.id) || userPoints.value < getItemPrice(item.price)"
          @click="purchase(item)"
          >
            {{ isPurchased(item.id) ? '구매 완료' : '구매' }}
        </button>
        </div>
      </div>
    </div>

  <div v-if="filteredItems.length === 0" class="no-result-message">
    검색 결과가 없습니다.
  </div>
</template>

<style scoped>
.search-bar-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  width: 90%;
  max-width: 500px;
  padding: 20px 20px 0px;
}

.input-container {
  position: relative;
  width: 100%;
  flex-grow: 1;
}

.input-container input {
  width: 100%;
}

.input-overlay {
  position: absolute;
  top: 50%;
  left: 12px;
  transform: translateY(-50%);
  color: gray;
  font-size: 13px;
  pointer-events: none;
  opacity: 0.6;
}

.pointshop-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  padding: 20px;
}

.item-name {
  font-weight: bold;
  font-size: 14px;
  margin: 0;
  text-align: left;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 100%;
}

.item-price {
  font-size: 11px;
  color: #555;
  margin: 5px 0;
}

.item-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 150px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.b-button {
  font-size: 12px;
  padding: 5px 10px;
  margin-top: 10px;
  border-radius: 5px;
  background-color: #555;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
  color: #fff;
  width: 100%;
  text-align: center;
}
.b-button:hover {
  background-color: #333;
  color: #fff;
}

.b-button:disabled {
  background-color: #ddd;
  color: #999;
  font-weight: bold;
}

.item-image {
  width: 100px;
  height: 100px;
  object-fit: contain;
  margin-bottom: 10px;
}

.no-result-message {
  text-align: center;
  color: gray;
  font-size: 14px;
  margin-top: 20px;
}

.pointshop_main_margin {
  overflow: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
}
.point-display-global {
  text-align: right;
  margin: 10px 30px 0 0;
  font-weight: bold;
  font-size: 12px;
  color: #333;
}

</style>