<template>
  <v-card-text v-if="signup_success" class="body-1">
    <h3 class="blue--text mt-0 mb-3">Поздравляем! Ваша учетная запись успешно создана.</h3>
    <p>Теперь осталось лишь её активировать.</p>
    <p>Откройте сообщение в вашем электронном почтовом ящике и следуйте указаниям.</p>
    <p>Если письмо долго не приходит, не забудьте проверить папку "Спам".</p>
    <p>Вкладку браузера с этой страницей теперь можно просто закрыть.</p>
  </v-card-text>
  <v-card-text v-else>
    <v-form ref="reg_form">
      <p class="mt-0 mb-2">Регистрация новой учетной записи на ваш электронный почтовый ящик</p>

      <a href="" @click.prevent="$emit('resend_activation')">Не получили письмо для активации?</a>

      <v-text-field
          class="mt-4"
          label="Адрес электронной почты"
          prepend-icon="mdi-email-outline"
          v-model="email"
          :error="email_err_state"
          :error-messages="email_err_hint"
          ref="email_fld"
          autofocus
          autocomplete="off"
          @keyup.enter="$emit('enter_pressed')"
      >
      </v-text-field>
      <div v-for="err in serv_errs_user" :key="'u'+err" class="red--text">&uArr; {{err}}</div>
      <p class="mt-3 mb-2">Введите пароль состоящий из цифр и букв длиной не менее 8 символов:</p>
      <sub-password-confirm
          ref="sub_pass_conf"
          @enter_pressed="$emit('enter_pressed')"
          :autofocus="false"
      />
      <div v-for="err in serv_errs_pass" :key="'p'+err" class="red--text">&uArr; {{err}}</div>
      <v-checkbox class="mt-1 text-body-2"
                  v-model="data_handle_agree"
                  :error="data_handle_err_state"
                  :error-messages="data_handle_err_hint"
                  @click="data_handle_err_state=false; data_handle_err_hint=''"
      >
        <template v-slot:label>
          <div>Согласен с <a @click.prevent.stop="$emit('show_conditions')" href="#">условиями</a> использования</div>
        </template>
      </v-checkbox>
    </v-form>
    <div v-for="err in serv_errs_diff" :key="'d'+err" v-html="err"></div>
  </v-card-text>
</template>

<script>
import SubPasswordConfirm from "@/components/modal/SubPasswordConfirm"
import axios from "axios";
export default {
  name: "SignIn",
  components: {SubPasswordConfirm},
  data:()=>({
    data_handle_agree: true,
    data_handle_err_state: false,
    data_handle_err_hint: '',
    email:'',
    email_err_state: false,
    email_err_hint: '',
    serv_errs_user: [],
    serv_errs_pass: [],
    serv_errs_diff: [],
    signup_success: false,
  }),
  methods:{
    resetErrors(){
      if( this.$refs.sub_pass_conf )
        this.$refs.sub_pass_conf.resetErrors()
      this.email_err_state = false
      this.email_err_hint = ''
      this.data_handle_err_hint = ''
      this.data_handle_err_state = false
      this.serv_errs_user = []
      this.serv_errs_pass = []
      this.serv_errs_diff = []
    },
    isRegisterFieldsValid(){
      const email_pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      let err = true
      if( !this.email.length ) {
        this.email_err_hint = 'Заполните адрес'
      }else if( !email_pattern.test(this.email) ){
        this.email_err_hint = 'Проверьте ошибки в адресе'
      } else if (this.email.length > 128){
        this.email_err_hint = 'Адрес слишком длинный'
      } else{
        err = false
        this.email_err_state = false
        this.email_err_hint = ''
      }
      if(err){
        this.email_err_state = true
        this.$refs.email_fld.focus()
        //this.$emit('reg_error')
        return false
      }

      if( !this.$refs.sub_pass_conf.validatePasswords() )
        return false

      if( !this.data_handle_agree ){
        this.data_handle_err_hint = 'Поставьте галочку чтобы пройти регистрацию'
        this.data_handle_err_state = true
        return false
      }else {
        this.data_handle_err_hint = ''
        this.data_handle_err_state = false
      }

      return true
    },
    resetFields(){
      if(this.$refs.sub_pass_conf)
        this.$refs.sub_pass_conf.resetFields()
      this.resetErrors()
      if( this.$refs.reg_form )
        this.$refs.reg_form.resetValidation()
      this.email = ''
      this.data_handle_agree = true
    },
    async registerUser(){
      try {
        await axios.post(`auth/users/`,{
          email: this.email,
          username: this.email,
          password: this.$refs.sub_pass_conf.password
        })
        this.$emit('send_success')
        this.signup_success = true
      }catch(error){
        this.$emit('send_error')
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log('SignUp error response data: ', error.response.data)
          // console.log(error.response.status)
          // console.log(error.response.headers);
          if(error.response.status === 400)
            this.handleRegisterErrors(error.response.data)
        }
      }

      // this.axios.post(this.$hostname + `auth/users/`, {
      //   headers: { 'Content-type': 'application/json' },
      //   email: this.email,
      //   username: this.email,
      //   password: this.$refs.sub_pass_conf.password
      // })
      //     .then(response => {
      //       this.$emit('send_success')
      //       this.signup_success = true
      //       console.log('SignUp response: ',response)
      //       //this.$router.push('/auth/signin')
      //     })
      //     .catch(error => {
      //       this.$emit('send_error')
      //       if (error.response) {
      //         // The request was made and the server responded with a status code
      //         // that falls out of the range of 2xx
      //         console.log('SignUp error response data: ', error.response.data)
      //         // console.log(error.response.status)
      //         // console.log(error.response.headers);
      //         this.handleRegisterErrors(error.response.data)
      //       } else if (error.request) {
      //         // The request was made but no response was received
      //         // `error.request` is an instance of XMLHttpRequest in the browser and an instance of http.ClientRequest in node.js
      //         this.serv_errs_diff.push('<div class="red--text">Извините, сервер временно не доступен.</div>Пожалуйста, повторите попытку позже или свяжитесь со службой поддержки.')
      //         //console.log(this.serv_errs_diff)
      //         //console.log(error.request)
      //       } else {
      //         // Something happened in setting up the request that triggered an Error
      //         console.log('Error', error.message)
      //       }
      //     })
    },
    handleRegisterErrors(err_obj){
      for (let err_key in err_obj){
        if( err_key === 'username') {
          this.serv_errs_user = err_obj[err_key]
          this.email_err_state = true
        }else
        if( err_key === 'password'){
          this.serv_errs_pass = err_obj[err_key]
          this.pass_confirm_err_state = true
          this.pass_confirm_err_hint = ''
        }else{
          this.serv_errs_diff = err_obj[err_key]
        }
        //console.log('Error in handler: ', err_key, err_obj[err_key])
      }
    },


  },

}
</script>

<style scoped>

</style>