<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps ({
 item: { type: Object, required: true },
 userPoints: { type: Number, required: true },
 isPurchased: { type: Function, required: true },
 onPurchase: { type: Function, required: true }
});

const getItemPrice = (priceStr) => {
  return parseInt(priceStr.toString().replace(/,/g, ''), 10);
};

const isDisabled = computed(() => {
  return props.isPurchased(props.item.id) || props.userPoints < getItemPrice(props.item.price) || props.item.stock === 0;
});

const buttonLabel = computed(() => {
  if (props.isPurchased(props.item.id)) return '구매 완료';
  if (props.item.stock === 0) return '품절';
  if (props.userPoints < getItemPrice(props.item.price)) return '포인트 부족';
  return '구매';
});

const handleClick = () => {
  if (props.userPoints < getItemPrice(props.item.price)) {
    if(confirm('포인트가 부족합니다. 챌린지 페이지로 이동할까요?')) {
      router.push("/challenge");
    }
    return;
  }
  props.onPurchase(props.item);
 };
</script>

<template>
  <div class="item-container">
    <img :src="`/image/pointshop/item${item.id}.png`" alt="Item Image" class="item-image" />
    <div class="item-details">
      <h5 class="item-name">{{ item.name }}</h5>
      <p class="item-price">Price: {{ item.price }} Points</p>
      <p class="item-stock">남은 수량: {{ item.stock ?? '∞' }}개</p>
      <button
        class="b-button"
        :disabled="isDisabled"
        @click="handleClick"
        :class="{ insufficient: userPoints < getItemPrice(item.price) && !isPurchased(item.id) }"
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
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.item-image {
  width: 100px;
  height: 100px;
  object-fit: contain;
  margin-bottom: 10px;
}

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