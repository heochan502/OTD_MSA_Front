<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
  item: { type: Object, required: true },
  userPoints: { type: Number, required: true },
  isPurchased: { type: Function, required: true },
  onPurchase: { type: Function, required: true },
});

// 가격 숫자 변환
const getItemPrice = (price) => {
  if (typeof price === 'number') return price;
  return parseInt(String(price).replace(/,/g, ''), 10) || 0;
};

// 구매 버튼 비활성화 조건
const isDisabled = computed(() => {
  return (
    props.isPurchased(props.item.pointId) ||
    props.userPoints < getItemPrice(props.item.pointScore) ||
    props.item.stock === 0
  );
});

// 버튼 라벨 계산
const buttonLabel = computed(() => {
  if (props.isPurchased(props.item.pointId)) return '구매 완료';
  if (props.item.stock === 0) return '품절';
  if (props.userPoints < getItemPrice(props.item.pointScore)) return '포인트 부족';
  return '구매';
});

// 클릭 시 동작
const handleClick = () => {
  const itemPrice = getItemPrice(props.item.pointScore);

  if (props.userPoints < itemPrice) {
    if (confirm('포인트가 부족합니다. 챌린지 페이지로 이동할까요?')) {
      router.push('/challenge');
    }
    return;
  }

  props.onPurchase(props.item);
};

// 이미지 경로 (백엔드 이미지 서빙 경로 반영)
const imageSrc = computed(() => {
  return props.item.imageUrl
    ? props.item.imageUrl
    : `/api/OTD/pointshop/image/${props.item.pointId}`;
});
</script>

<template>
  <div class="item-container">
    <!-- 상품 이미지 -->
    <img
      :src="imageSrc"
      alt="Item Image"
      class="item-image"
      loading="lazy"
      @error="(e) => (e.target.src = '/image/pointshop/default.png')"
    />

    <!-- 상품 상세 -->
    <div class="item-details">
      <h5 class="item-name">{{ item.pointItemName }}</h5>
      <p class="item-price">가격: {{ item.pointScore.toLocaleString() }} P</p>
      <p class="item-stock">남은 수량: {{ item.stock ?? '∞' }}개</p>

      <!-- 구매 버튼 -->
      <button
        class="b-button"
        :disabled="isDisabled"
        @click="handleClick"
        :class="{
          insufficient:
            userPoints < getItemPrice(item.pointScore) && !isPurchased(item.pointId),
        }"
      >
        {{ buttonLabel }}
      </button>
    </div>
  </div>
</template>

<style scoped>
/* 카드 컨테이너 */
.item-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 150px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

/* 상품 이미지 */
.item-image {
  width: 100px;
  height: 100px;
  object-fit: contain;
  margin-bottom: 10px;
  border-radius: 4px;
}

/* 상세 정보 */
.item-details {
  text-align: center;
}

.item-name {
  font-weight: bold;
  font-size: 14px;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-desc {
  font-size: 11px;
  color: #888;
  margin: 4px 0;
}

.item-price {
  font-size: 12px;
  color: #555;
  margin: 6px 0 3px;
}

.item-stock {
  font-size: 11px;
  color: #888;
  margin-bottom: 6px;
}

/* 구매 버튼 */
.b-button {
  font-size: 12px;
  padding: 5px 10px;
  margin-top: 8px;
  border-radius: 5px;
  background-color: #555;
  border: none;
  cursor: pointer;
  color: #fff;
  width: 100%;
  text-align: center;
  transition: background-color 0.3s;
}

.b-button:hover {
  background-color: #333;
}

.b-button:disabled {
  background-color: #ddd;
  color: #999;
  font-weight: bold;
}

.b-button.insufficient {
  background-color: #e53935 !important;
  color: white;
}
</style>