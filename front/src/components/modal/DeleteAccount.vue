<template>
<div>
  <v-dialog persistent v-model="show_dlg" width="400"
          @keydown.esc.prevent="onCancel()"
          @keydown.enter.prevent="onApply()">
    <template v-slot:activator="{ on, attrs }">
      <v-btn
          small
          @click="onOpen()"
          v-bind="attrs"
          v-on="on"
      >
        Удалить учетную запись
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class="headline text-center">Удаление учетной записи</span>
      </v-card-title>

      <v-card-text>
        <p class="body-1 text-center">
          <span class="error--text">Внимание! Вместе с вашей учетной записью будут также полностью удалены все
            привязанные к ней данные без возможности их дальнейшего восстановления.</span>
          <br><br>
          <span class="warning--text">Чтобы подтвердить удаление вашей учетной записи, введите ниже большими буквами слово "УДАЛИТЬ".</span>
        </p>
        <v-row justify="center">
          <v-text-field
              autofocus
              autocomplete="off"
              v-model="new_value"
              label="Слово подтверждения:"
              :error="err_state"
              :error-messages="err_hint"
          />
        </v-row>
      </v-card-text>
      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="onCancel()">Отмена</v-btn>
        <v-btn text color="primary" :disabled="!new_value.length" @click="onApply()">Продолжить</v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>
</div>
</template>

<script>
import {mapGetters} from "vuex";

export default {
  name: "EditSome",
  data: ()=>({
    init_value: 'УДАЛИТЬ',
    new_value: '',
    show_dlg: false,
    err_hint: '',
    err_state: false,
  }),
  methods:{
    ...mapGetters(['getUser',]),
    onCancel() {
      this.show_dlg = false
    },
    onApply(){
      if(!this.new_value.length)
        return
      if(this.init_value !== this.new_value){
        this.err_state = true
        this.err_hint = 'Проверьте ошибки'
        return
      }
      this.show_dlg = false

      this.$store.dispatch('deleteAccount' )
      this.$router.replace({name: 'HomeLogout'})
    },
    onOpen(){
      this.err_state = false
      this.err_hint = ''
      this.new_value = ''
    },
  },

}
</script>

<style scoped>

</style>