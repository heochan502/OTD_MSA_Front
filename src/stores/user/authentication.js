import { reactive } from 'vue'
import { defineStore } from 'pinia'


export const useAuthenticationStore = defineStore(
    "authentication", 
    () => {
        const state = reactive({
            signedUser: { userId: 0, nickName: '', pic: null },
            accessToken: null,
            refreshToken: null,
            isSigned: false
          })

          const setSignedUser = ({ user, accessToken, refreshToken }) => {
            state.isSigned = true;
            state.signedUser = user;
            state.accessToken = accessToken;
            state.refreshToken = refreshToken;
          }

        const setSigndUserPic = pic => {
            state.signedUser.pic = pic;
        }

        const logout = async () => {
            console.log('logout 처리')
            state.signedUser = { userId: 0, nickName: '', pic: null };
            state.accessToken = null;
            state.refreshToken = null;
            state.isSigned = false;      
        }

        return { state, setSignedUser, setSigndUserPic, logout };
    }, 
    { persist: true }
);