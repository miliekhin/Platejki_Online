<template>
<div>
  <v-text-field
      prepend-icon="mdi-lock-outline"
      v-model="password"
      :append-icon="show_pass ? 'mdi-eye' : 'mdi-eye-off'"
      :type="show_pass ? 'text' : 'password'"
      label="Пароль"
      hint="Минимум 8 символов"
      :error="pass_err_state"
      :error-messages="pass_err_hint"
      @click:append="show_pass = !show_pass"
      @keyup.enter="$emit('enter_pressed')"
      ref="pass"
      :autofocus = 'autofocus'
  ></v-text-field>
  <v-text-field
      prepend-icon="mdi-lock-outline"
      v-model="password_confirm"
      :append-icon="show_pass ? 'mdi-eye' : 'mdi-eye-off'"
      :type="show_pass ? 'text' : 'password'"
      label="Введите пароль еще раз"
      :error="pass_confirm_err_state"
      :error-messages="pass_confirm_err_hint"
      @click:append="show_pass = !show_pass"
      ref="pass_confirm"
      @keyup.enter="$emit('enter_pressed')"
  ></v-text-field>
</div>
</template>

<script>
export default {
  name: "SubPasswordConfirm",
  props:['autofocus'],
  data: ()=>({
    password_confirm: '',
    password: '',
    show_pass: false,
    pass_confirm_err_state: false,
    pass_confirm_err_hint: '',
    pass_err_state: false,
    pass_err_hint: '',
  }),
  methods:{
    validatePasswords(){
      if (this.password.length < 8){
        this.pass_err_state = true
        this.pass_err_hint = 'Минимум 8 символов'
        this.$refs.pass.focus()
        return false
      }

      if (this.password !== this.password_confirm){
        this.pass_confirm_err_state = true
        this.pass_confirm_err_hint = 'Пароли не совпадают'
        this.$refs.pass_confirm.focus()
        return false
      }else if(this.password.length > 128 || this.password_confirm.length > 128){
        this.pass_confirm_err_state = true
        this.pass_confirm_err_hint = 'Пароль подозрительно длинный'
        this.$refs.pass_confirm.focus()
        return false
      } else {
        this.pass_confirm_err_state = false
        this.pass_confirm_err_hint = ''
      }
      return true
    },
    resetErrors(){
      this.pass_confirm_err_state = false
      this.pass_confirm_err_hint = ''
      this.pass_err_state = false
      this.pass_err_hint = ''
      this.serv_errs_pass = []
    },
    resetFields(){
      this.password_confirm = ''
      this.password = ''
    },

  },

}
</script>

<style scoped>

</style>