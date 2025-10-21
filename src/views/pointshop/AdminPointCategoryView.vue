<script setup>
import { ref, onMounted } from 'vue'
import AdminPointCategoryService from '@/services/pointshop/AdminPointCategoryService.js'

const categories = ref([])
const newCategoryName = ref('')
const editMode = ref(false)
const selectedCategory = ref(null)
const loading = ref(false)

const fetchCategories = async () => {
  loading.value = true
  try {
    categories.value = await AdminPointCategoryService.getAllCategories()
  } catch {
    alert('카테고리 목록 조회 실패')
  } finally {
    loading.value = false
  }
}

const addCategory = async () => {
  if (!newCategoryName.value.trim()) return alert('카테고리명을 입력하세요.')
  try {
    await AdminPointCategoryService.addCategory(newCategoryName.value)
    newCategoryName.value = ''
    await fetchCategories()
  } catch {
    alert('등록 실패')
  }
}

const startEdit = (cat) => {
  editMode.value = true
  selectedCategory.value = { ...cat }
  newCategoryName.value = cat.categoryName
}

const saveEdit = async () => {
  try {
    await AdminPointCategoryService.editCategory(
      selectedCategory.value.categoryId,
      newCategoryName.value
    )
    cancelEdit()
    await fetchCategories()
  } catch {
    alert('수정 실패')
  }
}

const cancelEdit = () => {
  editMode.value = false
  selectedCategory.value = null
  newCategoryName.value = ''
}

const deleteCategory = async (id) => {
  if (!confirm('정말 삭제하시겠습니까?')) return
  try {
    await AdminPointCategoryService.deleteCategory(id)
    await fetchCategories()
  } catch {
    alert('삭제 실패')
  }
}

onMounted(fetchCategories)
</script>

<template>
  <div class="category-admin">
    <h2>카테고리 관리</h2>

    <div class="category-form">
      <input v-model="newCategoryName" placeholder="카테고리 이름 입력" class="input-text" />
      <button v-if="!editMode" class="btn primary" @click="addCategory">등록</button>
      <button v-else class="btn success" @click="saveEdit">수정 완료</button>
      <button v-if="editMode" class="btn cancel" @click="cancelEdit">취소</button>
    </div>

    <div v-if="loading" class="loading">로딩 중...</div>

    <table v-else class="category-table">
      <thead><tr><th>ID</th><th>카테고리명</th><th>작업</th></tr></thead>
      <tbody>
        <tr v-for="cat in categories" :key="cat.categoryId">
          <td>{{ cat.categoryId }}</td>
          <td>{{ cat.categoryName }}</td>
          <td>
            <button class="btn edit" @click="startEdit(cat)">수정</button>
            <button class="btn delete" @click="deleteCategory(cat.categoryId)">삭제</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-if="!categories?.length && !loading" class="empty">등록된 카테고리가 없습니다.</p>
  </div>
</template>

<style scoped>
.category-admin {
  max-width: 600px;
  margin: 40px auto;
  padding: 24px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
  font-family: 'Noto Sans KR', sans-serif;
}

.category-admin h2 {
  text-align: center;
  margin-bottom: 20px;
  font-weight: 700;
  color: #1a4d8f;
}

.category-form {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 20px;
}

.input-text {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.9rem;
}

.btn {
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s;
}

.btn.primary {
  background: #1a4d8f;
  color: #fff;
}
.btn.primary:hover {
  background: #17427b;
}

.btn.success {
  background: #16a085;
  color: #fff;
}
.btn.cancel {
  background: #aaa;
  color: #fff;
}
.btn.edit {
  background: #1abc9c;
  color: #fff;
}
.btn.delete {
  background: #e74c3c;
  color: #fff;
}
.btn.delete:hover {
  opacity: 0.9;
}

.category-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.category-table th,
.category-table td {
  padding: 10px;
  border-bottom: 1px solid #eee;
  text-align: center;
}

.loading,
.empty {
  text-align: center;
  color: #777;
  margin-top: 20px;
}
</style>
