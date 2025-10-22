<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePointshop } from '@/components/pointshop/usePointshop.js'
import html2canvas from 'html2canvas'

const route = useRoute()
const router = useRouter()
const { purchasedItems, fetchUserPurchaseHistory } = usePointshop()

const item = ref(null)
const barcode = ref('')
const barHeights = ref([])
const isLoading = ref(true)
const cardRef = ref(null)

// ✅ 기본 이미지
const defaultImageUrl = new URL('@/assets/img/pointshop/default.png', import.meta.url).href

// ✅ pointshop 폴더 내 이미지 자동 매핑
const images = import.meta.glob('@/assets/img/pointshop/*', {
  eager: true,
  import: 'default'
})

// ✅ 이미지 매핑 함수
const getItemImage = (fileName) => {
  if (!fileName) return defaultImageUrl
  const cleanName = fileName.split('/').pop().toLowerCase()
    .replace(/\s+/g, '')
    .replace(/-/g, '_')
  const matched = Object.entries(images).find(([path]) => {
    const normalized = path.toLowerCase().replace(/\s+/g, '').replace(/-/g, '_')
    return normalized.includes(cleanName)
  })
  return matched ? matched[1] : defaultImageUrl
}

// ✅ 바코드 생성
const generateBarcode = () => {
  const digits = Array.from({ length: 13 }, () => Math.floor(Math.random() * 10)).join('')
  const letters = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `${digits}-${letters}`
}
const generateBarHeights = () =>
  Array.from({ length: 60 }, (_, i) => (i % 3 === 0 ? 65 : 75))

// ✅ 단일 구매 내역 로드
const loadItem = async () => {
  isLoading.value = true
  try {
    let list = purchasedItems.value
    if (!list?.length) {
      await fetchUserPurchaseHistory()
      list = purchasedItems.value
    }

    const found = list.find((p) => p.purchaseId == route.params.id)
    if (!found) {
      alert('구매 내역을 찾을 수 없습니다.')
      router.push('/pointshop/purchase-history')
      return
    }

    found.pointItemImage =
      found.pointItemImage ??
      found.imageUrl ??
      found.images?.[0]?.imageUrl ??
      null

    item.value = found
    barcode.value = generateBarcode()
    barHeights.value = generateBarHeights()

    console.log('🟢 구매 내역 확인:', found)
  } finally {
    isLoading.value = false
  }
}

// ✅ 라우트 변경 시 즉시 반응
watch(() => route.params.id, loadItem, { immediate: true })

// ✅ 유효기간 계산 (1년)
const expiryDate = computed(() => {
  if (!item.value) return ''
  const date = new Date(item.value.purchaseAt || item.value.createdAt)
  date.setDate(date.getDate() + 365)
  return date
})

// 남은 일수 계산
const daysLeft = computed(() => {
  if (!expiryDate.value) return 9999
  const diff = expiryDate.value - new Date()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
})

// 유효기간 색상 동적 적용
const expiryColor = computed(() => {
  if (daysLeft.value <= 7) return '#ff3b30' // 7일 이하: 진한 빨강
  if (daysLeft.value <= 30) return '#ff9500' // 30일 이하: 주황색
  return '#0078ff' // 정상: 파란색
})

const goBack = () => router.push('/pointshop/purchase-history')

// ✅ 이미지 캡처
const downloadCardImage = async () => {
  await nextTick()
  const el = cardRef.value
  if (!el) return

  const date = new Date()
  const formattedDate = date.toISOString().slice(0, 10).replace(/-/g, '')
  const filename = `${formattedDate}_${item.value.pointItemName || 'coupon'}.png`

  html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true }).then((canvas) => {
    const link = document.createElement('a')
    link.download = filename
    link.href = canvas.toDataURL('image/png')
    link.click()
  })
}
</script>

<template>
  <div class="detail-container">
    <div v-if="isLoading" class="loading">불러오는 중...</div>

    <div v-else-if="item" class="card" ref="cardRef">
      <img src="/otd/image/main/ontoday_logo.png" alt="One ToDay 워터마크" class="watermark-logo" />

      <div class="image-wrapper">
        <img
          :src="getItemImage(item.pointItemImage)"
          alt="상품 이미지"
          class="product-image"
          @error="(e) => { e.target.src = defaultImageUrl }"
        />
      </div>

      <h2 class="product-name">{{ item.pointItemName }}</h2>

      <!-- ✅ 구매/유효기간 테이블 -->
      <div class="info-table-container">
        <table class="info-table">
          <tr>
            <th>구매일</th>
            <td>{{ new Date(item.purchaseAt || item.createdAt).toLocaleDateString('ko-KR') }}</td>
          </tr>
          <tr>
            <th>유효기간</th>
            <td :style="{ color: expiryColor }">{{ expiryDate.toLocaleDateString('ko-KR') }}</td>
          </tr>
        </table>
      </div>

      <div class="barcode-section">
        <svg xmlns="http://www.w3.org/2000/svg" width="240" height="80">
          <rect width="100%" height="100%" fill="#fff" />
          <g>
            <rect
              v-for="(height, i) in barHeights"
              :key="i"
              :x="i * 4"
              y="0"
              width="2"
              :height="height"
              fill="#000"
            />
          </g>
        </svg>
        <div class="barcode-text">{{ barcode }}</div>
      </div>
    </div>

    <div class="button-group">
      <button class="back-btn" @click="goBack">← 목록으로</button>
      <button class="download-btn" @click="downloadCardImage">⬇ 이미지 저장</button>
    </div>
  </div>
</template>

<style scoped>
/* 동일 유지 */
.detail-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f7f9fb;
  min-height: 100vh;
  padding: 60px 16px 40px;
}
.card {
  position: relative;
  background: #fff;
  padding: 28px;
  border-radius: 14px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  max-width: 420px;
  width: 100%;
  text-align: center;
  overflow: hidden;
}
.watermark-logo {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 120px;
  opacity: 0.08;
  transform: translate(-50%, -50%);
}
.image-wrapper {
  width: 120px;
  height: 120px;
  margin: 42px auto 12px;
  border: 1px solid #eee;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.product-name {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 4px;
}

/* 구매/유효기간 테이블 */
.info-table-container {
  display: flex;
  justify-content: center;
  margin-top: 6px;
}

.info-table {
  width: 100%;
  max-width: 240px;
  border-collapse: collapse;
  background: #fafafa;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.info-table th,
.info-table td {
  padding: 3px 8px;
  font-size: 0.8rem;
  line-height: 1.2;
  text-align: left;
}

.info-table th {
  background: #f3f6fa;
  color: #555;
  width: 85px;
  font-weight: 600;
  border-right: 1px solid #e5e5e5;
}

.info-table tr + tr th,
.info-table tr + tr td {
  border-top: 1px solid #e5e5e5;
}

.info-table tr:first-child th {
  color: #777;
}
.info-table tr:first-child td {
  color: #333;
}
.info-table tr:last-child th {
  color: #0066cc;
}
.info-table tr:last-child td {
  color: #0078ff;
  font-weight: 600;
}

.barcode-section {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.barcode-text {
  font-family: 'Courier New', monospace;
  margin-top: 4px;
  font-size: 0.85rem;
  color: #444;
}
.button-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 18px;
}
button {
  border: none;
  border-radius: 8px;
  padding: 10px 14px;
  cursor: pointer;
  font-weight: bold;
}
.back-btn {
  background: #e0e0e0;
  color: #333;
}
.download-btn {
  background: #0078ff;
  color: #fff;
}
.download-btn:hover {
  background: #0063cc;
}
</style>