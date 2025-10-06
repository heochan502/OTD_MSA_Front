import { defineStore } from 'pinia';
import { getFood } from '@/services/meal/mealService';
import { ref } from 'vue';
import dayjs from 'dayjs';

import 'dayjs/locale/ko';


export const useMealSelectedDayStore = defineStore("mealSelectedDay",()=>{
    const selectedDay = ref({
        setDay :'',   // 선택한날
        
      })

      return {
        selectedDay,
      }
},
    {persist:true}
)