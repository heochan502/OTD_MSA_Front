import { reactive } from 'vue'
import { defineStore } from 'pinia'
import router from '@/router'

export const useAuthenticationStore = defineStore(
    "authentication", 
    () => {
        const state = reactive({            
            signedUser: {
                userId: 0,
                nickName: '',
                pic: null
            },            
            isSigned: false
        });

        const setSignedUser = signedUser => {
            state.isSigned = true;
            state.signedUser = signedUser                       
        }

        const setSigndUserPic = pic => {
            state.signedUser.pic = pic;
        }

        const logout = async () => {
            console.log('logout 처리')
            state.isSigned = false;
            state.signedUser = null;            
            await router.push('/user/login')
        }

        return { state, setSignedUser, setSigndUserPic, logout };
    }, 
    { persist: true }
);