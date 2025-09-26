import { defineStore } from 'pinia';
import { getMealTotalOnDay } from '@/services/meal/mealService';
import { ref } from 'vue';
import dayjs from 'dayjs';

import 'dayjs/locale/ko';


