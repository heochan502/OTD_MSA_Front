<script setup>
import { getUser } from '@/services/admin/adminService';
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAdminStore } from '@/stores/admin/adminStore';

const router = useRouter();
const adminStore = useAdminStore();

const users = ref([]);
const search = ref('');

onMounted(async () => {
  const res = await getUser();
  console.log('res:', res);
  console.log(typeof res.data);
  users.value = res.data.map((user) => ({
    ...user,
    userRoles: user.userRoles[0]?.userRoleIds.roleCode ?? '없음',
  }));
  console.log('adminUser', users.value);
});

const formatBirthDate = (birthDate) => {
  if (!birthDate) return '';
  const str = birthDate.toString();
  if (str.length === 8) {
    return `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`;
  }
  return str;
};

const formatNumber = (n) => String(n).padStart(2, '0');
const formatDate = (date) => {
  const y = date.getFullYear();
  const m = formatNumber(date.getMonth() + 1);
  const d = formatNumber(date.getDate());
  return `${y}-${m}-${d}`;
};

const headers = [
  { title: 'ID', key: 'userId', align: 'center' },
  { title: '닉네임 (이름)', key: 'nickName', align: 'center' },
  { title: '이메일', key: 'email', align: 'center' },
  { title: '권한', key: 'userRoles', align: 'center' },
  { title: '챌린지 등급', key: 'challengeRole', align: 'center' },
  { title: '가입일', key: 'createdAt', align: 'center' },
  { title: '생년월일', key: 'birthDate', align: 'center' },
];

const rowProps = ({ item } = {}) => ({
  onClick: () => item && toUserDetial(item),
  style: 'cursor: pointer;',
});

const toUserDetial = (user) => {
  console.log('user', user);
  adminStore.setSelectedUser(user);
  console.log(adminStore.state.selectedUser);
  router.push({ path: '/admin/user/detail' });
};

const reversedUser = computed(() => {
  return [...users.value].reverse();
});
</script>

<template>
  <div class="admin-user">
    <v-card class="data-card pa-2">
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="title">사용자 목록</span>
        <v-text-field
          v-model="search"
          label="검색"
          prepend-inner-icon="mdi-magnify"
          density="compact"
          hide-details
          single-line
          variant="outlined"
          style="max-width: 250px"
        />
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="reversedUser"
        :search="search"
        :items-per-page="12"
        height="700"
        fixed-header
        class="styled-table"
        :row-props="rowProps"
      >
        <!-- 닉네임 (이름) -->
        <template #item.nickName="{ item }">
          {{ item.nickName }}
          <span class="sub-name">({{ item.name }})</span>
        </template>

        <!-- 권한 -->
        <template #item.userRoles="{ item }">
          <template v-if="item.userRoles != null">
            <v-chip
              :color="
                item.userRoles === 'USER_1' || item.userRoles === 'USER_2'
                  ? '#00D5DF'
                  : item.userRoles === 'ADMIN'
                  ? '#7a7a7a'
                  : '#ff8a80'
              "
              small
              class="ma-1"
            >
              {{ item.userRoles }}
            </v-chip>
          </template>
        </template>
        <!-- 챌린지 등급 -->
        <template #item.challengeRole="{ item }">
          <v-chip
            :color="
              item.challengeRole === '브론즈'
                ? '#ce7430'
                : item.challengeRole === '실버'
                ? '#7a7a7a'
                : item.challengeRole === '골드'
                ? '#ffba57'
                : item.challengeRole === '다이아'
                ? '#00c6ff'
                : '#ff8a80' // 그 외
            "
            small
          >
            {{ item.challengeRole }}
          </v-chip>
        </template>

        <!-- 가입일 -->
        <template #item.createdAt="{ item }">
          {{ formatDate(new Date(item.createdAt)) }}
        </template>

        <!-- 생년월일 -->
        <template #item.birthDate="{ item }">
          <!-- {{ formatBirthDate(item.birthDate) }} -->
          {{ item.birthDate }}
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<style lang="scss" scoped>
.admin-user {
  padding: 10px;

  .data-card {
    border-radius: 15px;
    background: #fff;
    border-radius: 15px;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
  }
  .title {
    font-weight: 700;
    font-size: 23px;
  }
}
.styled-table {
  :deep(td),
  :deep(th) {
    // text-align: center !important;
    vertical-align: middle;
  }

  thead {
    background-color: #393e46;
    color: #fff;
    font-weight: 600;
  }

  tbody tr:hover {
    background-color: #f1f5f9 !important;
  }

  .v-data-table-footer {
    background: #fafafa;
  }

  .sub-name {
    color: #888;
    font-size: 0.85rem;
  }
}
/* 정렬 아이콘 항상 보이게 */
.styled-table :deep(.v-data-table__th .v-icon) {
  opacity: 1 !important; /* 항상 표시 */
  color: #bbb !important; /* 기본은 연한 회색으로 */
  transition: color 0.2s ease;
}

/* 활성 정렬 컬럼 아이콘 강조 */
.styled-table :deep(.v-data-table__th--sorted .v-icon) {
  color: #5ee6eb !important; /* 활성 정렬 컬럼만 민트 */
}
</style>
