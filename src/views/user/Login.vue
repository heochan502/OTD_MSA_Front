<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '@/services/user/UserService';
import { useAuthenticationStore } from '@/stores/user/authentication';
import { checkValidation } from '@/utils/validation';

const router = useRouter();

const authentication = useAuthenticationStore();
//const beBaseUrl = import.meta.env.VITE_BASE_URL;
const beBaseUrl = import.meta.env.VITE_API_URL;
const feBaseUrl = window.location.origin;
const redirectUrl = `${feBaseUrl}/fe/redirect`;

const state = reactive({
  form: {
    uid: '',
    upw: '',
  },
});

const submit = async () => {
  //유효성 체크
  if (checkValidation()) { return; }
  
  const res = await login(state.form);
  console.log('Login.vue - submit() - res: ', res);
  if (res.status === 200) {
    const signedUser = res.data.result;
    console.log('signedUser:', signedUser);
    authentication.setSignedUser(signedUser);
    await router.push('/');
  }
};
</script>

<template>
  <div class="login">
    <div class="container">
      <form class="py-5 d-flex flex-column gap-3" @submit.prevent="submit">
        <h1 class="h5 mb-3">로그인</h1>
        <!-- 아이디 입력 -->
        <div class="form-floating">
          <input
            type="text"
            class="form-control valid"
            id="uid"
            placeholder="아이디"
            v-model="state.form.uid"
            not-null-message="아이디는 필수로 입력하셔야 합니다."
            regexp="^[A-Za-z0-9_]{4,50}$"
            regexp-message="아이디는 영어, 숫자, 언더바로만 구성되어야 하며 4~50자까지 작성할 수 있습니다." />
          <label for="uid">아이디</label>
        </div>
        <!-- 비밀번호 입력 -->
        <div class="form-floating">
          <input
            type="password"
            class="form-control valid"
            id="upw"
            placeholder="비밀번호"
            v-model="state.form.upw"
            autocomplete="off"
            not-null-message="비밀번호는 필수로 입력하셔야 합니다."
            regexp="^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&amp;*()_+\-=\[\]{};':&quot;\\|,.&lt;&gt;\/?])[A-Za-z\d!@#$%^&amp;*()_+\-=\[\]{};':&quot;\\|,.&lt;&gt;\/?]{10,}$"
            regexp-message="비밀번호는 영문자, 숫자, 특수기호로 구성되며 10자 이상이어야 합니다." />
          <label for="upw">비밀번호</label>
        </div>
        <button type="submit" class="button">로그인</button>
      </form>
      <div class="mb-3">
        <router-link class="button signup-button" to="/user/join">회원가입</router-link>
      </div>
      <!-- API 로그인 -->
      <div class="mb-3">
        <span class="pointer"><a :href="`${beBaseUrl}/oauth2/authorization/naver?redirect_uri=${redirectUrl}`">네이버</a></span>        
        <span class="pointer"><a :href="`${beBaseUrl}/oauth2/authorization/kakao?redirect_uri=${redirectUrl}`">카카오</a></span>      
      </div>
      <div class="additional-links">
        <div class="link-row">
          <a href="#" class="link">아이디 찾기</a>
          <span class="link-separator">|</span>
          <a href="#" class="link">비밀번호 찾기</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 576px;
}

.button {
  width: 100%;
  font-size: 1rem;
  padding-top: 1rem;
  padding-bottom: 1rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  background-color: #0d6efd;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  display: inline-block;
}

.button:hover {
  background-color: #0b5ed7;
  color: white;
  text-decoration: none;
}

</style>