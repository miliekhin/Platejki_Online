<template>
  <v-card-text>
<!--    <p>Войдите с помощью:</p>-->
    <v-row justify="center">

      <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
          <v-btn fab dark color="error" v-bind="attrs" v-on="on"
                 @click="socialLogin($store.getters.getSocNameGoogle)"
          >
            <v-icon>mdi-google</v-icon>
          </v-btn>
        </template>
        <span>{{ $store.getters.getSocNameGoogle }}</span>
      </v-tooltip>

      <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
          <v-btn fab dark color="indigo" class="mx-5" v-bind="attrs" v-on="on"
                 @click="socialLogin($store.getters.getSocNameVK)"
          >
            <v-icon>mdi-vk</v-icon>
          </v-btn>
        </template>
        <span>{{ $store.getters.getSocNameVK }}</span>
      </v-tooltip>

      <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
          <v-btn fab dark color="warning" v-bind="attrs" v-on="on"
                 @click="socialLogin($store.getters.getSocNameOK)"
          >
            <v-icon>mdi-odnoklassniki</v-icon>
          </v-btn>
        </template>
        <span>{{ $store.getters.getSocNameOK }}</span>
      </v-tooltip>
      <v-card-subtitle class="text-center">Не нужно регистрироваться. Ваша учетная запись будет создана автоматически.
        <br>
        Создавая учетную запись вы автоматически соглашаетесь с
        <a @click.prevent="$emit('show_conditions')" href="#">условиями</a> использования сайта.
      </v-card-subtitle>
    </v-row>
    <p class="text-center font-weight-black">&mdash; ИЛИ &mdash;</p>
<!--    <p>Войдите с помощью ваших учетных данных:</p>-->
    <v-expansion-panels tile v-model="open_panel">
      <v-expansion-panel>
        <v-expansion-panel-header>
          Войти с помощью учетных данных:
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-text-field
              label="Адрес электронной почты"
              prepend-icon="mdi-email-outline"
              v-model="email"
              :error="email_err_state"
              :error-messages="email_err_hint"
              autofocus
              autocomplete="off"
              @keyup.enter="$emit('enter_pressed')"
              ref="email_fld"
          >
          </v-text-field>
          <v-text-field
              prepend-icon="mdi-lock-outline"
              v-model="password"
              :append-icon="show_pass ? 'mdi-eye' : 'mdi-eye-off'"
              :type="show_pass ? 'text' : 'password'"
              label="Пароль"
              @click:append="show_pass = !show_pass"
              @keyup.enter="$emit('enter_pressed')"
              :error="pass_err_state"
              :error-messages="pass_err_hint"
              ref="pass_fld"
          ></v-text-field>
          <div class="mb-3" v-if="serv_errs.length" v-html="serv_errs"></div>
          <a href="" @click.prevent="$emit('reset_pass')">Забыли пароль?</a>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-card-text>
</template>

<script>
import {mapActions,} from 'vuex'
// import axios from "axios";
export default {
  name: "LogIn",
  data:()=>({
    email: '',
    show_pass: false,
    password: '',
    email_err_state: false,
    email_err_hint: '',
    pass_err_state: false,
    pass_err_hint: '',
    serv_errs: '',
    open_panel: undefined,
  }),
  methods:{
    ...mapActions(['startLogIn', ]),
    socialLogin(soc_name){
      this.$router.push({name: 'social_redirector', query: {state: soc_name}})
      // this.$emit('social_login', soc_name)
    },
    // async loginVK(){
    //   window.location = 'https://oauth.vk.com/authorize?' +
    //           `client_id=${process.env.VUE_APP_VK_APP_ID}&` +
    //           'redirect_uri=http://localhost:8080/social_redirector&' +
    //           'scope=email&' +
    //           'display=page&' +
    //           'response_type=code'
    // },
    openPanel(){
      this.open_panel = 0
    },
    closePanel(){
      this.open_panel = undefined
    },
    isFieldsValid(){
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
        this.openPanel()
        this.email_err_state = true
        // this.$refs.email_fld.focus()
        //this.$emit('reg_error')
        return false
      }

      if ( !this.password.length ){
        this.openPanel()
        this.pass_err_state = true
        this.pass_err_hint = 'Введите пароль'
        this.$refs.pass_fld.focus()
        return false
      }
      return true
    },
    async logIn(){
      this.$refs.pass_fld.blur()
      this.$refs.email_fld.blur()
      this.$store.commit('deleteTokens')
      try {
        await this.startLogIn({ username: this.email, password: this.password })
        this.$emit('send_success')
      }catch (error){
        this.$emit('send_error')
        //console.log('LogIn Error status:', error )
        if (error.response) {
          this.$store.commit('resetLogInProcess')
          // The request was made and the server responded with a status code that falls out of the range of 2xx
          if ( error.response.status === 401 ){
            this.serv_errs = '<div class="red--text">Пользователь с такими учетными данными не найден или не активирован.</div>Пожалуйста, проверьте еще раз введенные данные или напишите в службу поддержки описание проблемы.'
          }
          //console.log('LogIn Error status:', error.response.status );
          // console.log(error.response.headers);
        }
      }
    },
    resetErrors(){
      this.email_err_state = false
      this.pass_err_hint = ''
      this.pass_err_state = false
      this.email_err_hint = ''
      this.serv_errs = ''
    },
    resetFields(){
      this.resetErrors()
      this.email = ''
      this.password = ''
    },
  },

}
</script>

<style scoped>

</style>