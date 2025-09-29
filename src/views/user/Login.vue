<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '@/services/user/userService';
import { useAuthenticationStore } from '@/stores/user/authentication';
import { checkValidation } from '@/utils/validation';

const router = useRouter();

const authentication = useAuthenticationStore();
const beBaseUrl = import.meta.env.VITE_BASE_URL;

const feBaseUrl = window.location.origin;
const redirectUrl = `${feBaseUrl}/fe/redirect`;

const state = reactive({
  form: {
    uid: '',
    upw: '',
  },
});

const submit = async () => {
  if (checkValidation()) {
    return;
  }

  try {
    console.log('전송할 데이터:', state.form);
    const res = await login(state.form);
    console.log('Login.vue - submit() - res: ', res);

    console.log('응답 데이터:', JSON.stringify(res.data.result, null, 2));

    if (res.status === 200) {
      const result = res.data.result;

      console.log('result 전체:', result);

      console.log('구조화된 userData:', result);

      // store 업데이트
      authentication.setSignedUser(result);

      // store 상태 확인
      console.log('업데이트 후 store 상태:', authentication.state.signedUser);

      await router.push('/');
    }
  } catch (error) {
    console.error('로그인 오류:', error);
    console.error('오류 상세:', error.response?.data);
    alert('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
  }
};
</script>

<template>
  <div class="login wrap">
    <div class="container">
      <form class="form" @submit.prevent="submit">
        <h1 class="inputa">로그인</h1>
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
            regexp-message="아이디는 영어, 숫자, 언더바로만 구성되어야 하며 4~50자까지 작성할 수 있습니다."
          />
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
            regexp="^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':\&quot;\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':\&quot;\\|,.<>\/?]{10,}$"
            regexp-message="비밀번호는 영문자, 숫자, 특수기호로 구성되며 10자 이상이어야 합니다."
          />
          <label for="upw">비밀번호</label>
        </div>
        <button type="submit" class="buttonlogin">로그인</button>
      </form>
      <div class="mb-3">
        <router-link class="buttonjoin" to="/user/join">회원가입</router-link>
      </div>
      <!-- API 로그인 -->

      <div class="API">
        <span class="naver"
          ><a
            :href="`${beBaseUrl}/oauth2/authorization/naver?redirect_uri=${redirectUrl}`"
            >네이버</a
          >
        </span>
        <span class="kakao"
          ><a
            :href="`${beBaseUrl}/oauth2/authorization/kakao?redirect_uri=${redirectUrl}`"
            >카카오</a
          ></span
        >
      </div>
    </div>
    <div class="additional-links">
      <div class="link-row">
        <a href="#" class="link">아이디 찾기</a>
        <span class="link-separator">|</span>
        <a href="#" class="link">비밀번호 찾기</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 576px;
  padding: 0px;
}

.buttonlogin {
  width: 100%;
  font-size: 16px;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  background-color: #393e46;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  display: inline-block;
}
.buttonjoin {
  width: 100%;
  font-size: 16px;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  background-color: #e6e6e6;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  display: inline-block;
}

.button:hover {
  background-color: #e6e6e6;
  color: white;
  text-decoration: none;
}
.form {
  padding-top: 10px;
  padding-bottom: 10px;
}

.form-floating {
  padding-top: 10px;
  padding-bottom: 10px;
}
.inputa {
  font-size: 20px;
  padding-top: 10px;
  padding-left: 10px;
}

.naver {
  width: 100%;
  font-size: 16px;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  background-color: #03c75a;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  display: inline-block;
}
.kakao {
  width: 100%;
  font-size: 16px;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  background-color: #fbe900;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  display: inline-block;
}

.additional-links {
  text-align: center;
}
.API {
  padding-bottom: 20px;
  text-align: center;
}
</style>