import { defineStore } from 'pinia';
import { getFood } from '@/services/meal/mealService';
import { ref, computed } from 'vue';
import dayjs from 'dayjs';

import 'dayjs/locale/ko';


export const useMealSelectedStore = defineStore("mealSelected",()=>{
    const selectedDay = ref({
        setDay :'',   // 선택한날        
      });
    
    const selectedFoods =ref ({});

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



