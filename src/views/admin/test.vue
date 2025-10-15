<!-- 저장 실패 모달 -->
<v-dialog v-model="errorDialog" max-width="380" min-height="100">
      <v-card class="admin-dialog pa-6">
        <v-card-text> 실패했습니다. </v-card-text>
        <div class="btn-area">
          <v-btn class="btn-blue" @click="errorDialog = false">확인</v-btn>
        </div>
      </v-card>
    </v-dialog>

<!-- 밸리데이션 모달 -->
<v-dialog v-model="validationDialog" max-width="380" min-height="100">
          <v-card class="admin-dialog pa-6">
            <v-card-text> 모든 항목을 입력해주세요. </v-card-text>
            <div class="btn-area">
              <v-btn class="btn-blue" @click="validationDialog = false">확인</v-btn>
            </div>
          </v-card>
        </v-dialog>

<!-- 저장 -->
<v-dialog v-model="saveDialog" max-width="380" min-height="100">
      <v-card class="admin-dialog pa-6">
        <v-card-text> 저장하시겠습니까? </v-card-text>
        <div class="btn-area">
          <v-btn class="btn-blue" @click="submit()">네</v-btn>
          <v-btn class="btn-gray" @click="saveDialog = false">아니오</v-btn>
        </div>
      </v-card>
    </v-dialog>

const errorDialog = ref(false); 
const validationDialog = ref(false); 
const saveDialog = ref(false);
errorDialog.value = true;
