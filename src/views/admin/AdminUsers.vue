<script setup>
import { getUsers } from '@/services/admin/adminService';
import { onMounted, ref } from 'vue';

const users = ref([]);
const search = ref('');

onMounted(async () => {
  const res = await getUsers();
  users.value = res.data;
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

// ✅ Vuetify v-data-table headers
const headers = [
  { title: 'ID', key: 'userId' },
  { title: '닉네임 (이름)', key: 'nickName' },
  { title: '이메일', key: 'email' },
  { title: '권한', key: 'userRoles' },
  { title: '챌린지 등급', key: 'challengeRole' },
  { title: '가입일', key: 'createdAt' },
  { title: '생년월일', key: 'birthDate' },
];
</script>

<template>
  <div class="admin-users">
    <v-card>
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
        :items="users"
        :search="search"
        :items-per-page="10"
        height="580"
        fixed-header
        class="styled-table"
      >
        <!-- 닉네임 (이름) -->
        <template #item.nickName="{ item }">
          {{ item.nickName }}
          <span class="sub-name">({{ item.name }})</span>
        </template>

        <!-- 권한 -->
        <template #item.userRoles="{ item }">
          <template v-if="item.userRoles && item.userRoles.length">
            <v-chip
              v-for="role in item.userRoles"
              :key="role.userRoleIds.roleCode"
              :color="
                role.userRoleIds.roleCode.toLowerCase() === 'user'
                  ? '#00D5DF'
                  : role.userRoleIds.roleCode.toLowerCase() === 'admin'
                  ? '#303030'
                  : '#fff'
              "
              text-color="black"
              small
              class="ma-1"
            >
              {{ role.userRoleIds.roleCode }}
            </v-chip>
          </template>
          <v-chip v-else color="#fff" text-color="white" small>없음</v-chip>
        </template>
        <!-- 챌린지 등급 -->
        <template #item.challengeRole="{ item }">
          <v-chip
            :color="
              item.challengeRole === '브론즈'
                ? '#ce7430'
                : item.challengeRole === '실버'
                ? '#9e9e9e'
                : item.challengeRole === '골드'
                ? '#ffba57'
                : item.challengeRole === '다이아'
                ? '#00c6ff'
                : '#fff' // 그 외
            "
            :text-color="
              item.challengeRole === '골드'
                ? 'black' // 금색은 검정 글씨가 더 잘 보임
                : 'white' // 기본은 흰 글씨
            "
            small
          >
            {{ item.challengeRole }}
          </v-chip>
        </template>

        <!-- 가입일 -->
        <template #item.createdAt="{ item }">
          {{ new Date(item.createdAt).toLocaleDateString() }}
        </template>

        <!-- 생년월일 -->
        <template #item.birthDate="{ item }">
          {{ formatBirthDate(item.birthDate) }}
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<style lang="scss" scoped>
.admin-users {
  padding: 20px;

  .title {
    font-weight: 700;
    font-size: 18px;
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
</style>
