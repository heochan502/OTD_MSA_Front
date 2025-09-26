<script setup>
import { reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getPoint } from '@/services/orderService';

const route = useRoute();

const state = reactive({
  point: {
    userId: 0,
    nickName: '',
    point: 0,
    items: [],
  },
});

onMounted(async () => {
  const orderId = route.params.id;
  const res = await getPoint(orderId);
  if (res === undefined || res.status !== 200) {
    alert('오류 발생'); 
    return;
  }
  state.point = res.data;
});
</script>

<template>
  <div class="point-detail py-5">
    <div class="container">
      <div class="row">
        <div class="point col-lg-8">
          <div class="h5 mb-4">
            <b>최근포인트기록</b>
          </div>
          <table class="table table-bordered">
            <tbody>
              <tr>
                <th>닉네임</th>
                <td>{{ state.point.nickName}}</td>
              </tr>
              <tr>
                <th>포인트</th>
                <td>{{ state.point.point }}</td>
              </tr>
              <tr>
                <th>일시</th>
                <td>{{ state.point.created.toLocaleString() }}</td>
              </tr>
            </tbody>
            <tr v-for="(item, idx) in state.point.items" :key="item.id">
                <td>{{ idx + 1 }}</td>
                <td><img :src="`/pic/item/${item.id}/${item.imgPath}`" alt="테스트" /></td>
                <td>{{ item.name }}</td>
              </tr>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
table img { width: 150px; }
.point-detail {
  > .container {
    table {
      th,
      td {
        padding: 15px 25px;
      }
      th {
        background-color: #f7f7f7;
      }
    }
  }
}
</style>