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

// 가격 변환 (문자 → 숫자)
const getItemPrice = (price) => {
  if (typeof price === 'number') return price;
  return parseInt(String(price).replace(/,/g, ''), 10) || 0;
};

// 구매 버튼 상태 계산
const isDisabled = computed(() =>
  props.isPurchased(props.item.pointId) ||
  props.userPoints < getItemPrice(props.item.pointScore) ||
  props.item.stock === 0
);

// 버튼 라벨 계산
const buttonLabel = computed(() => {
  if (props.isPurchased(props.item.pointId)) return '구매 완료';
  if (props.item.stock === 0) return '품절';
  if (props.userPoints < getItemPrice(props.item.pointScore)) return '포인트 부족';
  return '구매';
});

// 클릭 시 구매 또는 포인트 부족 처리
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

// 이미지 경로
const imageSrc = computed(() => {
  if (props.item.imageUrl?.startsWith('http')) return props.item.imageUrl;
  if (props.item.imageUrl) return `/pointshop/${props.item.imageUrl}`;
  return '/image/pointshop/default.png';
});
</script>

<template>
  <div class="item-container">
    <img
      :src="imageSrc"
      alt="포인트 상품 이미지"
      class="item-image"
      loading="lazy"
      @error="(e) => (e.target.src = '/image/pointshop/default.png')"
    />

    <div class="item-details">
      <h5 class="item-name">{{ item.pointItemName }}</h5>
      <p class="item-price">
        가격: {{ getItemPrice(item.pointScore).toLocaleString() }} P
      </p>
      <p class="item-stock">
        남은 수량: {{ item.stock ?? '∞' }}개
      </p>

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
.item-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 150px;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.08);
  background-color: #fff;
  transition: transform 0.2s;
}
.item-container:hover {
  transform: translateY(-2px);
}
.item-image {
  width: 100px;
  height: 100px;
  object-fit: contain;
  border-radius: 4px;
  margin-bottom: 8px;
}
.item-details {
  text-align: center;
}
.item-name {
  font-weight: 600;
  font-size: 14px;
  color: #222;
  margin-bottom: 4px;
}
.item-price {
  font-size: 12px;
  color: #444;
  margin: 2px 0;
}
.item-stock {
  font-size: 11px;
  color: #888;
  margin-bottom: 6px;
}
.b-button {
  font-size: 12px;
  padding: 6px;
  border: none;
  border-radius: 6px;
  width: 100%;
  background-color: #555;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.3s;
}
.b-button:hover:not(:disabled) {
  background-color: #333;
}
.b-button:disabled {
  background-color: #ccc;
  color: #777;
}
.b-button.insufficient {
  background-color: #e53935 !important;
}
</style>