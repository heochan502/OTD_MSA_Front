import { defineStore } from 'pinia';
import { getFood } from '@/services/meal/mealService';
import { ref, computed } from 'vue';
import dayjs from 'dayjs';

import 'dayjs/locale/ko';


export const useMealSelectedStore = defineStore("mealSelected",()=>{
    const selectedDay = ref({
        setTime :'',   // 선택한 타이밍
        setDay : '',   // 선택한 날짜        
      });
    
    const selectedFoods = ref({
      foodDbId: 0,
      foodName: '',
      amount: 0,
      kcal: 0,
      flag: '',
      protein: 0,
      carbohydrate: 0,
      fat: 0,
      sugar: 0,
      natrium: 0,
    });  // 선택한 음식들
    //  const selectedFoods = ref<[]>([]);  
      // const selectedFoods = ref<Array<{ 
      //   foodDbId: number | null,
      //   foodName: string,
      //   amount: number,
      //   kcal: number,
      //   protein: number,
      //   carbohydrate: number,
      //   fat: number,
      //   sugar: number,
      //   natrium: number,
      //   flag: string,
      // }>>([]);

    const totalKcal = computed(() =>
      selectedFoods.value.reduce((sum, food) => sum + (Number(food.kcal) || 0), 0)
   
    );
    

    const foodCount = computed(() => selectedFoods.value.length);

    const addOrUpdateFood = (food) => {
      const i = selectedFoods.value.findIndex(f => f.foodDbId === food.foodDbId)
      if (i === -1) selectedFoods.value.push(food)
      else selectedFoods.value[i] = food
    }
    const removeFood = (id) => {
      const i = selectedFoods.value.findIndex(f => f.foodDbId === id)
      if (i > -1) selectedFoods.value.splice(i, 1)
    }
  


      return {
        selectedDay, selectedFoods, totalKcal, foodCount, addOrUpdateFood, removeFood
      }
},
    {persist:true}
)



