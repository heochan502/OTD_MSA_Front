<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import ApexCharts from 'vue3-apexcharts'
import Papa from 'papaparse'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import NotoSansKR from '@/assets/fonts/NotoSansKR-Regular.ttf?base64'
import AdminPointStatsService from '@/services/pointshop/AdminPointStatsService.js'

const stats = ref([])
const selectedUserId = ref('')
const selectedRange = ref('6')
const isLoading = ref(false)
const errorMessage = ref('')
const chartRef = ref(null)

const topRechargeUsers = ref([])
const topPurchaseUsers = ref([])
const categoryStats = ref([])

const isTopLoading = ref(false)
const isCategoryLoading = ref(false)

// 다크모드
const theme = ref(localStorage.getItem('theme') || 'light')
const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme.value)
  localStorage.setItem('theme', theme.value)
}
onMounted(() => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  if (prefersDark && !localStorage.getItem('theme')) theme.value = 'dark'
  document.documentElement.setAttribute('data-theme', theme.value)
})

// 월별 차트
const series = ref([])
const chartOptions = ref({
  chart: { type: 'line', stacked: false, toolbar: { show: false } },
  title: { text: '월별 충전·구매·순변화 통계', align: 'center' },
  dataLabels: { enabled: false },
  stroke: { width: [0, 0, 3], curve: 'smooth' },
  xaxis: { categories: [] },
  yaxis: [
    { title: { text: '포인트 (충전/구매)' } },
    { opposite: true, title: { text: '순변화' } }
  ],
  fill: { opacity: [0.85, 0.85, 1] },
  colors: ['#00b894', '#0984e3', '#d63031'],
  legend: { position: 'bottom' }
})

// 카테고리별 통계 차트
const categorySeries = ref([])
const categoryOptions = ref({
  chart: { type: 'donut' },
  title: { text: '카테고리별 구매 포인트 비율', align: 'center' },
  labels: [],
  legend: { position: 'bottom' },
  colors: ['#6c5ce7', '#00b894', '#fdcb6e', '#e17055', '#0984e3', '#d63031']
})

// 폰트 등록
const registerFont = (pdf) => {
  pdf.addFileToVFS('NotoSansKR-Regular.ttf', NotoSansKR)
  pdf.addFont('NotoSansKR-Regular.ttf', 'NotoSansKR', 'normal')
  pdf.setFont('NotoSansKR')
}

// 데이터 로드
const fetchStats = async () => {
  isLoading.value = true
  try {
    stats.value = await AdminPointStatsService.getMonthlySummary()
    updateChart()
  } catch (e) {
    errorMessage.value = '데이터를 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
}

const fetchTopUsers = async () => {
  isTopLoading.value = true
  try {
    topRechargeUsers.value = await AdminPointStatsService.getTopRechargeUsers()
    topPurchaseUsers.value = await AdminPointStatsService.getTopPurchaseUsers()
  } catch {
    console.error('TOP10 조회 실패')
  } finally {
    isTopLoading.value = false
  }
}

const fetchCategoryStats = async () => {
  isCategoryLoading.value = true
  try {
    categoryStats.value = (await AdminPointStatsService.getCategoryTotals())
  .filter((c) => c.categoryName && c.categoryName !== '기타')
updateCategoryChart()
  } catch {
    console.error('카테고리 통계 조회 실패')
  } finally {
    isCategoryLoading.value = false
  }
}

onMounted(async () => {
  await Promise.all([fetchStats(), fetchTopUsers(), fetchCategoryStats()])
  window.addEventListener('updatePointStats', async () => {
  await Promise.all([fetchStats(), fetchCategoryStats()])
  })
})

// 차트 업데이트
const updateChart = async () => {
  if (!filteredStats.value.length) return
  const months = filteredStats.value.map((s) => s.month)
  const recharge = filteredStats.value.map((s) => s.totalRecharge)
  const purchase = filteredStats.value.map((s) => s.totalPurchase)
  const netChange = filteredStats.value.map((s) => s.netChange)
  chartOptions.value.xaxis.categories = months
  series.value = [
    { name: '충전 포인트', type: 'column', data: recharge },
    { name: '구매 포인트', type: 'column', data: purchase },
    { name: '순변화', type: 'line', data: netChange }
  ]
  await nextTick()
}

const updateCategoryChart = () => {
  if (!categoryStats.value.length) return
  categoryOptions.value.labels = categoryStats.value.map((c) => c.categoryName)
  categorySeries.value = categoryStats.value.map((c) => c.totalPurchase || 0)
}

// 최근 N개월 필터링
const filteredStats = computed(() => {
  if (selectedRange.value === 'all') return stats.value
  const n = Number(selectedRange.value)
  return stats.value.slice(-n)
})

// 합계 계산
const totalRecharge = computed(() =>
  filteredStats.value.reduce((sum, s) => sum + Number(s.totalRecharge || 0), 0)
)
const totalPurchase = computed(() =>
  filteredStats.value.reduce((sum, s) => sum + Number(s.totalPurchase || 0), 0)
)
const netTotal = computed(() => totalRecharge.value - totalPurchase.value)

// 내보내기
const exportToCSV = () => {
  const csvData = stats.value.map((s) => ({
    월: s.month,
    충전: s.totalRecharge,
    구매: s.totalPurchase,
    순변화: s.netChange
  }))
  const csv = Papa.unparse(csvData)
  saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), 'pointshop_stats.csv')
}

const exportToExcel = () => {
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(
    stats.value.map((s) => ({
      월: s.month,
      충전: s.totalRecharge,
      구매: s.totalPurchase,
      순변화: s.netChange
    }))
  )
  XLSX.utils.book_append_sheet(wb, ws, '통계')
  XLSX.writeFile(wb, 'pointshop_stats.xlsx')
}

const exportToPDF = async () => {
  const el = document.querySelector('.dashboard-container')
  if (!el) return
  const pdf = new jsPDF('p', 'mm', 'a4')
  registerFont(pdf)
  const canvas = await html2canvas(el, { scale: 2, useCORS: true })
  const img = canvas.toDataURL('image/png')
  pdf.addImage(img, 'PNG', 0, 25, 210, 0)
  pdf.save(`pointshop_report_${new Date().toISOString().split('T')[0]}.pdf`)
}
</script>

<template>
  <div class="dashboard-container">
    <div class="header">
      <h2>포인트샵 통합 통계 대시보드</h2>
      <button class="btn btn-theme" @click="toggleTheme">
        {{ theme === 'light' ? '🌙 다크모드' : '☀️ 라이트모드' }}
      </button>
    </div>

    <div class="user-filter">
      <select v-model="selectedRange" @change="updateChart">
        <option value="6">최근 6개월</option>
        <option value="12">최근 1년</option>
        <option value="all">전체</option>
      </select>
      <button class="btn btn-refresh" @click="fetchStats">조회</button>
      <button class="btn btn-export" @click="exportToCSV">CSV</button>
      <button class="btn btn-excel" @click="exportToExcel">Excel</button>
      <button class="btn btn-pdf" @click="exportToPDF">PDF</button>
    </div>

    <div v-if="isLoading" class="loader">로딩중...</div>
    <div v-else-if="errorMessage" class="error">{{ errorMessage }}</div>

    <div v-else class="summary-box">
      <p>총 충전: <strong>{{ totalRecharge.toLocaleString() }}</strong>P</p>
      <p>총 구매: <strong>{{ totalPurchase.toLocaleString() }}</strong>P</p>
      <p :class="{ positive: netTotal > 0, negative: netTotal < 0 }">
        순변화: <strong>{{ netTotal.toLocaleString() }}</strong>P
      </p>
    </div>

    <ApexCharts v-if="stats.length" height="420" :options="chartOptions" :series="series" />

    <div class="top-section">
      <h3>유저별 Top 10 순위</h3>
      <div class="top-grid">
        <div class="top-box">
          <h4>Top 10 충전자</h4>
          <table><tbody><tr v-for="(u,i) in topRechargeUsers" :key="i">
            <td>{{ i+1 }}</td><td>{{ u.nickname || `User#${u.userId}` }}</td><td>{{ u.totalRecharge }}</td>
          </tr></tbody></table>
        </div>
        <div class="top-box">
          <h4>Top 10 구매자</h4>
          <table><tbody><tr v-for="(u,i) in topPurchaseUsers" :key="i">
            <td>{{ i+1 }}</td><td>{{ u.nickname || `User#${u.userId}` }}</td><td>{{ u.totalPurchase }}</td>
          </tr></tbody></table>
        </div>
      </div>
    </div>

    <div class="category-section">
      <h3>카테고리별 구매 포인트 통계</h3>
      <ApexCharts type="donut" height="400" :options="categoryOptions" :series="categorySeries" />
    </div>
  </div>
</template>

<style scoped>
:root[data-theme='light'] {
  --bg: #ffffff;
  --text: #2d3436;
  --card: #f9f9f9;
  --accent: #0984e3;
}
:root[data-theme='dark'] {
  --bg: #1e1e1e;
  --text: #f5f5f5;
  --card: #2c2c2c;
  --accent: #74b9ff;
}

.dashboard-container {
  background: var(--bg);
  color: var(--text);
  max-width: 1100px;
  margin: 40px auto;
  padding: 30px;
  border-radius: 14px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  font-family: 'Noto Sans KR', sans-serif;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.btn {
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
}
.btn-refresh { background: #0984e3; }
.btn-export { background: #00b894; }
.btn-excel { background: #2d3436; }
.btn-pdf { background: #6c5ce7; }
.btn-theme { background: var(--accent); }

.summary-box {
  display: flex;
  justify-content: space-around;
  background: var(--card);
  border-radius: 8px;
  padding: 10px 0;
  margin: 20px 0;
}
.summary-box p { margin: 0; }
.summary-box .positive { color: #00b894; }
.summary-box .negative { color: #d63031; }

.chart-card {
  background: var(--card);
  padding: 20px;
  border-radius: 12px;
}

.top-section { margin-top: 60px; }
.top-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.top-box {
  flex: 1 1 45%;
  background: var(--card);
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
}
.top-box h4 {
  text-align: center;
  margin-bottom: 12px;
  color: var(--accent);
}
.top-table, .category-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
.top-table th, .top-table td,
.category-table th, .category-table td {
  border-bottom: 1px solid #eaeaea;
  text-align: center;
  padding: 8px;
}
.top-table tr:nth-child(1) td { font-weight: bold; color: #d63031; }
.top-table tr:nth-child(2) td { font-weight: bold; color: #e17055; }
.top-table tr:nth-child(3) td { font-weight: bold; color: #fdcb6e; }

.category-section {
  margin-top: 60px;
  background: var(--card);
  padding: 20px;
  border-radius: 12px;
}
.category-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 20px;
}
.category-chart {
  flex: 1 1 45%;
}
.category-table-wrapper {
  flex: 1 1 45%;
  overflow-x: auto;
}
@media (max-width: 768px) {
  .top-grid, .category-grid { flex-direction: column; }
  .top-box, .category-chart, .category-table-wrapper { flex: 1 1 100%; }
}
</style>
