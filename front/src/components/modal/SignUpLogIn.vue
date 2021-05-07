<template>
<v-dialog persistent v-model="show_dlg" width="400"
          @keydown.esc.prevent="onCancel()"
>
    <template v-slot:activator="{ on, attrs }">
      <v-btn
          v-bind="attrs"
          v-on="on"
          @click="onShow()"
          :loading="login_process"
          outlined
          x-large
          color="white"
          height="44"
          class="head_btn my-0"
      >
        <v-icon left>mdi-login</v-icon>
        Вход/Регистрация
        <template v-slot:loader>
          <span class="custom-loader">
            <v-icon light color="white">mdi-cached</v-icon>
          </span>
        </template>
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span
            v-if="success_action || password_or_activation"
            class="headline blue--text"
        >
          {{ header_text }}
        </span>
        <v-tabs v-else v-model="tab">
          <v-tab>
            <span class="headline">Вход</span>
          </v-tab>
          <v-tab>
            <span class="headline">Регистрация</span>
          </v-tab>
        </v-tabs>
      </v-card-title>

      <v-tabs-items v-model="tab">
        <v-tab-item>
          <log-in
              ref="login_cmpnt"
              @reset_pass="resetPass"
              @enter_pressed="onGo"
              @send_error="onSendError"
              @send_success="onSendSuccess"
              @show_conditions="showConditions"
          />
        </v-tab-item>

        <v-tab-item>
          <sign-up
              ref="signup_cmpnt"
              @resend_activation="resendActivation"
              @enter_pressed="onGo"
              @send_error="onSendError"
              @send_success="onSendSuccess"
              @show_conditions="showConditions"
          />
        </v-tab-item>

        <v-tab-item>
          <send-password-activation
              ref="send_password_activation"
              :password_or_activation="password_or_activation"
              @send_success="onSendSuccess"
              @send_error="onSendError"
          />
        </v-tab-item>

      </v-tabs-items>


      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
            v-if="!success_action"
            text
            @click="onCancel()"
            :disabled="loada"
        >
          Отмена
        </v-btn>
<!--            :loading="loada"-->
        <v-btn
            text
            color="primary"
            :disabled="loada"
            @click="onGo()"
        >
          Продолжить
          <template v-slot:loader>
            <span class="custom-loader">
              <v-icon light>mdi-cached</v-icon>
            </span>
          </template>
        </v-btn>

      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<script>
import SendPasswordActivation from "@/components/modal/SendPasswordActivation"
import LogIn from "@/components/modal/LogIn"
import SignUp from "@/components/modal/SignUp"
export default {
name: "SignLogIn",
  components: {LogIn, SignUp, SendPasswordActivation, },
  props: ['login_process',],
  data: ()=>({
      loada: false,
      show_dlg: false,
      password_or_activation: 0, // Вкладки диалог-окна: Забыли пароль - 1, Не получили активационное письмо - 2, Процедура социального логина - 3
      success_action: false,
      header_text: '',
      tab: null,
      social_network_login: '',
    }),
  methods: {
    //...mapActions(['startLogIn',]),
    showConditions(){
      this.onCancel()
      if( this.$router.currentRoute.name !== 'About')
        this.$router.push({name: 'About'})
    },
    onCancel(){
      this.resetFields()
      this.show_dlg = false

      this.$nextTick(() => {
        this.loada = false
        this.success_action = false
        this.tab = 0
        if( this.$refs.login_cmpnt )
          this.$refs.login_cmpnt.closePanel()
        if( this.$refs.signup_cmpnt )
          this.$refs.signup_cmpnt.signup_success = false
        if( this.$refs.send_password_activation )
          this.$refs.send_password_activation.reset()
      })
    },
    onGo(){
      if ( this.success_action ){
        this.onCancel()
        return
      }
      this.resetErrors()
      if( this.tab === 0 ) {
        if ( !this.$refs.login_cmpnt.isFieldsValid() )
          return
        this.$refs.login_cmpnt.logIn()
      }
      if( this.tab === 1 ) {
        if ( !this.$refs.signup_cmpnt.isRegisterFieldsValid() )
          return
        this.$refs.signup_cmpnt.registerUser()
      }
      if(this.tab === 2){
        this.$refs.send_password_activation.goSending()
      }
      this.loada = true
    },
    resendActivation(){
      this.password_or_activation = 2
      this.tab = 2
      this.header_text = 'АКТИВАЦИЯ АККАУНТА'
    },
    resetPass(){
      this.password_or_activation = 1
      this.tab = 2
      this.header_text = 'СБРОС ПАРОЛЯ'
    },
    onSendError(){
      this.loada = false
    },
    onSendSuccess(){
      this.loada = false
      if (this.tab === 0){
        this.onCancel()
        this.$emit('login_success')
        // вход после логина
        this.$router.push({name: 'Platejki'})
      }
      if (this.tab === 1){
        this.success_action = true
        this.header_text = 'УЧЕТНАЯ ЗАПИСЬ СОЗДАНА'
      }
      if (this.tab === 2){
        this.success_action = true
      }

    },
    onShow(){
      this.password_or_activation = 0
    },
    resetErrors(){
      if(this.$refs.signup_cmpnt)
        this.$refs.signup_cmpnt.resetErrors()
      if(this.$refs.login_cmpnt)
        this.$refs.login_cmpnt.resetErrors()
    },
    resetFields(){
      if(this.$refs.signup_cmpnt)
        this.$refs.signup_cmpnt.resetFields()
      if(this.$refs.login_cmpnt)
        this.$refs.login_cmpnt.resetFields()
    },
  },
   computed: {
   },
  async created() {
  },
}
</script>

<style scoped lang="scss">
  .custom-loader {
    animation: loader 1s infinite;
    display: flex;
  }
  @-moz-keyframes loader {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
  @-webkit-keyframes loader {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
  @-o-keyframes loader {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
  @keyframes loader {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
  .head_btn{
    border: 2px solid #FFE766 !important;
    border-radius: 0 !important;
    @media screen and (max-width:420px){
      background: #0000008c;
    }
  }
</style>