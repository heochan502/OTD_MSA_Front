<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePointshop } from '@/components/pointshop/usePointshop.js'
import html2canvas from 'html2canvas'
import axios from '@/services/httpRequester'
import PointPurchaseService from '@/services/pointshop/PointPurchaseService'

const route = useRoute()
const router = useRouter()
const { purchasedItems, fetchUserPurchaseHistory } = usePointshop()

const item = ref(null)
const barcode = ref('')
const barHeights = ref([])
const isLoading = ref(true)
const cardRef = ref(null)
const isProcessing = ref(false)

// 사용된 쿠폰 자동 랜더링
const fetchPurchaseDetail = async () => {
      try {
        const res = await PointPurchaseService.getPurchaseDetail(route.params.id)
        if (res?.data) {
          item.value = res.data

          // 이미 사용된 쿠폰이면 즉시 UI를 사용 완료로 반영
          if (item.value.isUsed) {
            await nextTick()
          }
        }
      } catch (e) {
        console.error('쿠폰 상세 조회 실패:', e)
      } finally {
        isLoading.value = false
      }
    }

    onMounted(() => {
      fetchPurchaseDetail()
    })

// 시간 계산
const formatUsedDate = (dateString) => {
  try {
    const date = new Date(dateString)
    if (isNaN(date)) return ''
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch {
    return ''
  }
}

// 기본 이미지
const defaultImageUrl = new URL('@/assets/img/pointshop/default.png', import.meta.url).href

// pointshop 폴더 내 이미지 자동 매핑
const images = import.meta.glob('@/assets/img/pointshop/*', {
  eager: true,
  import: 'default'
})

// 이미지 매핑 함수
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

// 바코드 생성
const generateBarcode = () => {
  const digits = Array.from({ length: 13 }, () => Math.floor(Math.random() * 10)).join('')
  const letters = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `${digits}-${letters}`
}
const generateBarHeights = () =>
  Array.from({ length: 60 }, (_, i) => (i % 3 === 0 ? 65 : 75))

// 단일 구매 내역 로드
const loadItem = async () => {
  isLoading.value = true
  try {
    await fetchUserPurchaseHistory()
    const list = purchasedItems.value || []
    const found = list.find((p) => String(p.purchaseId) === String(route.params.id))

    if (!found) {
      alert('구매 내역을 찾을 수 없습니다.')
      router.push('/pointshop/purchase-history')
      return
    }

    // 이미지 처리
    found.pointItemImage =
      found.pointItemImage ?? found.imageUrl ?? found.images?.[0]?.imageUrl ?? null

    item.value = found
    barcode.value = generateBarcode()
    barHeights.value = generateBarHeights()

    if (item.value.isUsed) {
      await nextTick()
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(loadItem)
watch(() => route.params.id, loadItem)

// 쿠폰 사용 처리
const markAsUsed = async () => {
  if (!item.value || isProcessing.value) return

  // 이미 사용된 경우 즉시 알림 후 리턴
  if (item.value.isUsed) {
    alert('이미 사용된 쿠폰입니다.')
    return
  }

  if (!confirm('이 쿠폰을 사용 처리하시겠습니까?')) return

  try {
    isProcessing.value = true
    const res = await axios.patch(`/pointshop/purchase/${item.value.purchaseId}/use`)
    const result = res?.data?.data ?? res?.data

  if (result) {
      item.value = {
        ...item.value,
        isUsed: result.isUsed ?? true,
        usedAt: result.usedAt || new Date().toISOString(),
      }

  // 리스트 캐시도 반영
  const target = purchasedItems.value.find(
        (p) => String(p.purchaseId) === String(item.value.purchaseId)
      )
      if (target) {
        target.isUsed = result.isUsed
        target.usedAt = result.usedAt || item.value.usedAt
      }

      await nextTick() // ✅ DOM 갱신 후 UI 반영 보장
      console.log('🟢 사용 완료 UI 반영됨:', item.value.isUsed, item.value.usedAt)
      alert('✅ 쿠폰이 사용 처리되었습니다.')
    }
} catch (e) {
    const msg = e.response?.data?.message || '쿠폰 사용 중 오류가 발생했습니다.'
    console.warn('❌ 쿠폰 사용 처리 실패:', msg)
    alert(msg)

    if (msg.includes('이미 사용된 쿠폰')) {
      item.value.isUsed = true
      await nextTick()
    }
  } finally {
    isProcessing.value = false
  }
}

// 라우트 변경 시 즉시 반응
watch(() => route.params.id, loadItem, { immediate: true })

// 유효기간 계산 (1년)
const expiryDate = computed(() => {
  if (!item.value) return ''
  const date = new Date(item.value.purchaseAt || item.value.createdAt)
  date.setDate(date.getDate() + 365)
  return date
})

// 남은 일수 계산
const daysLeft = computed(() => {
  if (!expiryDate.value) return 9999
  return Math.floor((expiryDate.value - new Date()) / (1000 * 60 * 60 * 24))
})

// 유효기간 색상 동적 적용
const expiryColor = computed(() => {
  if (daysLeft.value <= 7) return '#ff3b30' // 7일 이하: 진한 빨강
  if (daysLeft.value <= 30) return '#ff9500' // 30일 이하: 주황색
  return '#0078ff' // 정상: 파란색
})

const goBack = () => router.push('/pointshop/purchase-history')

// 이미지 캡처
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

    <!-- 단일 카드 구조 -->
     <div v-if="item" class="card" ref="cardRef" :class="{ used: item?.isUsed }">

      <!-- 상단 좌측 버튼 -->
      <button class="back-btn" @click="goBack">⬅ 목록으로</button>

      <!-- 워터 마크 -->
      <img
        src="/otd/image/main/ontoday_logo.png"
        alt="One ToDay 워터마크"
        class="watermark-logo"
      />
      
      <!-- 상품 이미지 -->
      <div class="image-wrapper">
        <img
          :src="getItemImage(item.pointItemImage)"
          alt="상품 이미지"
          class="product-image"
          @error="(e) => { e.target.src = defaultImageUrl }"
          />
      </div>

      <!-- 상품명 -->
      <h2 class="product-name">{{ item.pointItemName }}</h2>

      <!-- 바코드, 사용 완료 -->
      <transition name="fade-barcode" mode="out-in">
        <div v-if="!item?.isUsed" key="barcode" class="barcode-section">
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

        <!-- 사용 완료 시 표시 -->
        <div v-else key="used" class="used-label">
        사용 완료
        <span v-if="item?.usedAt" class="used-date-inline">
          ( {{ formatUsedDate(item.usedAt) }} )
        </span>
      </div>
    </transition>

      <!-- 구매/유효기간 테이블 -->
      <div class="info-table-container">
        <table class="info-table">
          <tr>
            <th>구매일</th>
            <td>{{ new Date(item?.purchaseAt).toLocaleDateString('ko-KR') }}</td>
          </tr>
          <tr>
            <th>유효기간</th>
            <td :style="{ color: expiryColor }">
              {{ expiryDate.toLocaleDateString('ko-KR') }}
            </td>
          </tr>
        </table>
      </div>

      <!-- 버튼 그룹 -->
      <transition name="fade-btn" mode="out-in">
        <div class="button-group">
          <button
            v-if="!item?.isUsed"
            class="use-btn"
            @click="markAsUsed"
            :disabled="isProcessing"
          >
            ✅ 쿠폰 사용 처리
          </button>
          <!-- 이미지 저장 버튼은 미사용일 때만 표시 -->
          <button 
            v-if="!item?.isUsed"
            class="download-btn" @click="downloadCardImage"
          >
            ⬇ 이미지 저장
          </button>

          <!-- 사용 완료 시 대체 문구 -->
          <span v-else class="used-finish-text">
            이미 사용 완료된 쿠폰입니다.
          </span>
        </div>
      </transition>

    </div>
  </div>
</template>

<style scoped>
.detail-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background: #f7f9fb;
  min-height: 100dvh;
  height: auto;
  padding-top: 40px;
  padding-bottom: 80px;
  overscroll-behavior-y: contain;
}

/* 카드 영역 */
.card {
  margin: 0 auto;
  position: relative;
  background: #fff;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  width: 90%;
  max-width: 360px;
  text-align: center;
  overflow: hidden;
  flex-shrink: 0;
  min-height: 400px;
}

.card.used {
  position: relative;
  background: #f0f0f0;
  filter: grayscale(0.8) brightness(0.9);
  opacity: 0.9;
  transition: all 0.3s ease;
}

.card.used::after {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  pointer-events: none;
}

.watermark-logo {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  opacity: 0.06;
  transform: translate(-50%, -50%);
}

/* 상품 이미지 */
.image-wrapper {
  width: 100px;
  height: 100px;
  margin: 36px auto 8px;
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

/* 상품명 */
.product-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 6px 0 10px 0;
}

/* 구매/유효기간 테이블 */
.info-table-container {
  display: flex;
  justify-content: center;
  margin-top: 8px;
  min-height: 60px;
}
.info-table {
  width: 90%;
  max-width: 240px;
  border-collapse: collapse;
  background: #fafafa;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  text-align: center;
}
.info-table th,
.info-table td {
  padding: 3px 8px;
  font-size: 0.8rem;
  line-height: 1.3;
  vertical-align: middle;
  text-align: center;
}
.info-table th {
  background: #f3f6fa;
  color: #555;
  width: 80px;
  font-weight: 600;
  border-right: 1px solid #e5e5e5;
  text-align: left;
}

.info-table td {
  text-align: center;
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
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 90px;
}
.barcode-section svg {
  width: 240px;
  height: 80px;
}
.barcode-text {
  font-family: 'Courier New', monospace;
  margin-top: 2px;
  font-size: 0.75rem;
  color: #444;
}

/* 사용된 상품 구분 */
.used {
  opacity: 0.6;
  filter: grayscale(0.7);
}

.used-label {
  background: #d25a57;
  width: 300px;
  color: #fff;
  font-weight: 700;
  border-radius: 8px;
  padding: 8px 14px;
  margin: 20px auto 10px;
  display: inline-block;
  font-size: 0.9rem;
  text-align: center;
  letter-spacing: -0.3px;
}

.used-label .used-date-inline {
  color: #aaa;
  font-weight: 500;
  font-size: 0.88rem;
  margin-left: 4px;
}

.used-label span {
  font-weight: 500;
  font-size: 0.88rem;
  color: #f9eaea;
}

.use-btn {
  background: #00c851;
  color: #fff;
  border-radius: 6px;
  padding: 8px 12px;
  font-weight: 600;
}
.use-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.used-finish-text {
  display: block;
  width: 100%;
  text-align: center;
  color: #666;
  margin-top: 16px;
  padding: 10px 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #666;
  animation: fadeIn 0.6s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
/* 바코드 fade-out / 사용 완료 fade-in 애니메이션 */
.fade-barcode-enter-active,
.fade-barcode-leave-active {
  transition: opacity 0.25s ease;
}
.fade-barcode-enter-from,
.fade-barcode-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* 버튼 페이드 아웃 */
.fade-btn-enter-active {
  opacity: 0;
  transform: scale(0.95);
  animation: popIn 0.4s ease forwards;
}

.fade-btn-leave-active {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.4s ease;
  background-color: #ccc !important;
}

.fade-btn-enter-from,
.fade-btn-leave-to {
  opacity: 0;
  visibility: hidden;
}

/* 등장 시 살짝 커졌다 돌아오는 효과 */
@keyframes popIn {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  70% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* 버튼 그룹 */
.button-group {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
  min-height: 64px;
}

.button-group button,
.button-group .used-finish-text {
  flex: 0 0 auto;
  white-space: nowrap;
}

/* ✅ 버튼 크기 균일화 */
button {
  border: none;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  min-width: 85px;
  text-align: center;
  white-space: nowrap;
  flex: 0 1 auto;
}

/* 버튼 스타일 */
.back-btn {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  color: #444;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
  cursor: pointer;
  transition: color 0.2s ease;
}

.back-btn:hover {
  color: #0078ff;
}

.use-btn,
.download-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  padding: 10px 18px;
  min-height: 42px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  color: #fff;
  transition: all 0.2s ease;
}

.use-btn {
  background: #00c851;
  color: #fff;
}
.download-btn {
  background: #0078ff;
  color: #fff;
}

.use-btn:hover,
.download-btn:hover {
  transform: translateY(-2px);
}

/* 모바일 대응 */
@media (max-width: 480px) {
  .button-group {
    flex-direction: row;
    justify-content: space-between;
    gap: 6px;
  }
  .use-btn,
  .download-btn {
    width: 48%;
    min-height: 40px;
    font-size: 0.85rem;
  }
}
</style>