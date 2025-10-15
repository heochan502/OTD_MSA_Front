<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import axios from '@/services/httpRequester'
import ApexCharts from 'vue3-apexcharts'
import Papa from 'papaparse'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import NotoSansKR from '@/assets/fonts/NotoSansKR-Regular.ttf?base64'

// 통 상수
const BASE_PATH = '/pointshop/admin/stats'

// 상태 변수
const stats = ref([])
const selectedUserId = ref('')
const selectedRange = ref('6')
const isLoading = ref(false)
const errorMessage = ref('')
const chartRef = ref(null)

// 모달
const showModal = ref(false)
const selectedMonth = ref('')
const monthDetails = ref([])
const isDetailLoading = ref(false)

// TOP 10
const topRechargeUsers = ref([])
const topPurchaseUsers = ref([])
const isTopLoading = ref(false)
const topError = ref('')

// 다크모드 테마
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

// 차트 설정
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

// 유틸 - 폰트 등록
const registerFont = (pdf) => {
  pdf.addFileToVFS('NotoSansKR-Regular.ttf', NotoSansKR)
  pdf.addFont('NotoSansKR-Regular.ttf', 'NotoSansKR', 'normal')
  pdf.setFont('NotoSansKR')
}

// 데이터 조회
const fetchStats = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const endpoint = selectedUserId.value
      ? `${BASE_PATH}/user/${selectedUserId.value}`
      : `${BASE_PATH}/summary`
    const res = await axios.get(endpoint)
    if (res.data?.success && Array.isArray(res.data.data)) {
      stats.value = res.data.data.map((s) => ({
        ...s,
        netChange:
          s.netChange ?? (Number(s.totalRecharge || 0) - Number(s.totalPurchase || 0))
      }))
      updateChart()
    } else {
      throw new Error(res.data?.message || '데이터를 불러오지 못했습니다.')
    }
  } catch (e) {
    console.error('[fetchStats] 오류:', e)
    errorMessage.value = e.message
  } finally {
    isLoading.value = false
  }
}

// Top10 조회
const fetchTopUsers = async () => {
  isTopLoading.value = true
  try {
    const res = await axios.get(`${BASE_PATH}/top-users`)
    if (res.data?.success) {
      topRechargeUsers.value = res.data.data.topRechargeUsers || []
      topPurchaseUsers.value = res.data.data.topPurchaseUsers || []
    } else throw new Error('순위 데이터를 불러오지 못했습니다.')
  } catch (e) {
    console.error('[fetchTopUsers]', e)
    topError.value = e.message
  } finally {
    isTopLoading.value = false
  }
}

// 병렬 데이터 로드
onMounted(async () => {
  await Promise.all([fetchStats(), fetchTopUsers()])
})

// 차트 업데이트
const updateChart = async () => {
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

// 내보내기 (CSV/Excel)
const exportToCSV = () => {
  if (!stats.value.length) return alert('내보낼 데이터가 없습니다.')
  const csvData = stats.value.map((s) => ({
    월: s.month,
    '충전 포인트': s.totalRecharge,
    '구매 포인트': s.totalPurchase,
    '순변화(충전-구매)': s.netChange
  }))
  const csv = Papa.unparse(csvData)
  saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), 'pointshop_stats.csv')
}
const exportToExcel = () => {
  if (!stats.value.length) return alert('내보낼 데이터가 없습니다.')
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(stats.value)
  XLSX.utils.book_append_sheet(wb, ws, 'Summary')
  XLSX.writeFile(wb, 'pointshop_stats.xlsx')
}

// PDF 보고서
const exportToPDF = async () => {
  const el = document.querySelector('.dashboard-container')
  const pdf = new jsPDF('p', 'mm', 'a4')
  registerFont(pdf)
  const isDark = theme.value === 'dark'
  pdf.setFillColor(isDark ? 30 : 255, isDark ? 30 : 255, isDark ? 30 : 255)
  pdf.rect(0, 0, 210, 297, 'F')

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

    <!-- 필터 -->
    <div class="user-filter">
      <input
        v-model="selectedUserId"
        type="number"
        placeholder="User ID (비워두면 전체)"
        @keyup.enter="fetchStats"
      />
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

    <!-- 로딩/에러 -->
    <div v-if="isLoading" class="loader"></div>
    <div v-else-if="errorMessage" class="status-message error">{{ errorMessage }}</div>

    <!-- 요약 -->
    <div v-else-if="stats.length" class="summary-box">
      <p>총 충전: <strong>{{ totalRecharge.toLocaleString() }}</strong>P</p>
      <p>총 구매: <strong>{{ totalPurchase.toLocaleString() }}</strong>P</p>
      <p :class="{ positive: netTotal > 0, negative: netTotal < 0 }">
        순변화: <strong>{{ netTotal.toLocaleString() }}</strong>P
      </p>
    </div>

    <!-- 차트 -->
    <div v-if="stats.length" class="chart-card">
      <ApexCharts ref="chartRef" height="420" :options="chartOptions" :series="series" />
    </div>

    <!-- TOP 10 -->
    <div class="top-section">
      <h3>유저별 Top 10 순위</h3>
      <div v-if="isTopLoading" class="loader"></div>
      <div v-else-if="topError" class="status-message error">{{ topError }}</div>
      <div v-else class="top-grid">
        <div class="top-box">
          <h4>Top 10 충전자</h4>
          <table class="top-table">
            <thead><tr><th>순위</th><th>닉네임</th><th>총 충전(P)</th></tr></thead>
            <tbody>
              <tr v-for="(user, i) in topRechargeUsers" :key="i">
                <td>{{ i + 1 }}</td>
                <td>{{ user.nickname || `User#${user.userId}` }}</td>
                <td>{{ user.totalRecharge.toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="top-box">
          <h4>Top 10 구매자</h4>
          <table class="top-table">
            <thead><tr><th>순위</th><th>닉네임</th><th>총 구매(P)</th></tr></thead>
            <tbody>
              <tr v-for="(user, i) in topPurchaseUsers" :key="i">
                <td>{{ i + 1 }}</td>
                <td>{{ user.nickname || `User#${user.userId}` }}</td>
                <td>{{ user.totalPurchase.toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
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
  max-width: 960px;
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
.top-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
.top-table th, .top-table td {
  border-bottom: 1px solid #eaeaea;
  text-align: center;
  padding: 8px;
}
.top-table tr:nth-child(1) td { font-weight: bold; color: #d63031; }
.top-table tr:nth-child(2) td { font-weight: bold; color: #e17055; }
.top-table tr:nth-child(3) td { font-weight: bold; color: #fdcb6e; }

@media (max-width: 768px) {
  .top-grid { flex-direction: column; }
  .top-box { flex: 1 1 100%; }
}
</style>