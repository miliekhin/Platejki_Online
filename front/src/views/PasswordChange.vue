<template>
  <v-card width="400" class="mt-4 mx-auto">
    <v-card-title class="headline blue--text text-uppercase">Изменение пароля</v-card-title>
    <div v-if="confirm_success" class="text-center text-body-1">
      <h3 class="blue--text mt-0 mb-3">Пароль входа в вашу учетную запись успешно изменен.</h3>
      <p>Перейдите на главную страницу и войдите в свою учетную запись с новым паролем.</p>
      <router-link :to="{name: 'HomeLogin'}" replace>Перейти на главную страницу</router-link>
      <br><br>
    </div>
    <div v-else>
      <v-card-subtitle>Введите новый пароль для своей учетной записи состоящий из цифр и букв длиной не менее 8 символов</v-card-subtitle>
      <v-card-text>
        <sub-password-confirm
            ref="sub_pass_conf"
            @enter_pressed="onGo()"
            :autofocus="true"
        />
        <div v-for="err in serv_errs_password" :key="'p'+err" class="red--text">&uArr; {{err}}</div>
        <div v-if="error_obj.hasOwnProperty('header')">
          <p>{{ error_obj.header }}</p>
          <div v-for="err in error_obj.body" :key="'e'+err" class="red--text">
            {{ err }}
          </div>
          <p v-html="error_obj.footer"></p>
          <router-link :to="{name: 'Home'}">Перейти на главную страницу</router-link>
        </div>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
            text
            color="primary"
            :loading="sending"
            @click="onGo()"
        >Применить
          <template v-slot:loader>
          <span class="custom-loader">
            <v-icon light>mdi-cached</v-icon>
          </span>
          </template>
        </v-btn>
      </v-card-actions>
    </div>
  </v-card>
</template>

<script>
import SubPasswordConfirm from "@/components/modal/SubPasswordConfirm"
export default {
  name: "PasswordChange",
  components: {SubPasswordConfirm},
  props: ['uid','token'],
  data: ()=>({
    error_obj: {},
    sending: false,
    confirm_success: false,
    serv_errs_password: [],
  }),
  methods: {
    onGo(){
      //console.log('go...')
      this.$refs.sub_pass_conf.resetErrors()
      if(this.$refs.sub_pass_conf.validatePasswords()) {
        this.doConfirm()
      }
    },
    doConfirm(){
      this.sending = true
      this.axios.post(`auth/users/reset_password_confirm/`, {
        uid: this.uid,
        token: this.token,
        new_password: this.$refs.sub_pass_conf.password,
      })
          .then(response => {
            this.sending = false
            this.error_obj = {}
            this.confirm_success = true
            console.log('Success confirm response:', response)
            //this.$router.push('/auth/signin')
          })
          .catch(error => {
            this.sending = false
            if (error.response) {
              // The request was made and the server responded with a status code
              // that falls out of the range of 2xx
              // console.log(error.response.data);
              console.log(error.response.status)
              // console.log(error.response.headers);
              console.log(error.response.data)
              this.error_obj.header = 'Во время сброса пароля возникли следующие ошибки:'
              this.error_obj.body = []
              const err_txt = 'Попробуйте еще раз сбросить пароль, или обратитесь в службу поддержки с описанием проблемы.'
              for (let key in error.response.data){
                if(error.response.status === 400) {
                  error.response.data[key].forEach(err => this.error_obj.body.push(err))
                  if (key === 'new_password')
                    this.error_obj.footer = 'Пожалуйста, придумайте другой пароль.'
                  else
                    this.error_obj.footer = 'Ссылка по которой вы перешли на эту страницу неисправна или устарела. ' + err_txt
                }else{
                  this.error_obj.body.push(error.response.data[key])
                  this.error_obj.footer = err_txt
                }
              }
            } else if (error.request) {
              this.sending = false
              // The request was made but no response was received
              // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
              // http.ClientRequest in node.js
              //console.log(error.request)
              this.error_obj.header = ''
              this.error_obj.body = []
              this.error_obj.body.push('Извините, сервер временно не доступен.')
              this.error_obj.footer = 'Пожалуйста, повторите попытку позже, или свяжитесь со службой поддержки через форму на главной странице.'
              this.error_obj.try_again = true
            } else {
              // Something happened in setting up the request that triggered an Error
              console.log('Error', error.message)
            }
          })

    }
  },
}
</script>

<style scoped>
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
</style>