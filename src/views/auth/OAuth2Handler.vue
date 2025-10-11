<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthenticationStore } from '@/stores/user/authentication';

const route = useRoute(); //쿼리스트링 받기 위해 사용
const router = useRouter(); //라우팅 처리를 위해 사용

const authentication = useAuthenticationStore();

onMounted(async () => {

    const error = route.query.error;
    const userId = route.query.user_id;

    console.log('error:', error);
    console.log('userId:', userId);

    if(error || !userId) { //error 쿼리스트링이 있거나 userId 쿼리스트링이 없다면
        if(error) {
            alert(error);
        }
        await router.push('/login'); // sign-in으로 라우팅
    }
    //error 쿼리스트링 없었고, userId값 있다면
    const nickName = route.query.nick_name;
    const pic = route.query.pic;
    const name = route.query.name; // 이름 파라미터 받기

    const signedUser = { userId, nickName, pic }

    console.log('signedUser: ', signedUser);
    console.log('name:', name);

    authentication.setSignedUser(signedUser); //로그인 처리 하고
    
    // 이름이 없으면 온보딩 필요 (신규 사용자)
    if(!name || name === 'null' || name === '' || name === 'undefined') {
        console.log('✅ 이름 없음 - 온보딩 모달 표시 예정');
        await router.push('/?onboarding=true'); // 온보딩 파라미터와 함께 루트로 이동
    } else {
        console.log('❌ 이름 있음 - 일반 로그인');
        await router.push('/'); //루트로 라우팅
    }
})
</script>

<template>
    <div>
        <h1>소셜 로그인 처리 중...</h1>
    </div>
</template>

<style scoped>

</style>