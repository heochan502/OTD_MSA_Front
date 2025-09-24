import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  const signedUser = ref(null)

  async function fetchProfile(userId) {
    try {
      const res = await axios.get(`/OTD/user/profile`, {
        params: { profile_user_id: userId }
      })
      signedUser.value = res.data.result 
    } catch (err) {
      console.error('프로필 가져오기 실패:', err)
    }
  }

  return {
    signedUser,
    fetchProfile
  }
})