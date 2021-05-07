<template>
  <v-card-text>
    <div v-if="send_success" class="text-center text-body-1">
      <div v-if="password_or_activation === 1">
        <h3 class="blue--text mt-0 mb-3">Инструкция по сбросу пароля к вашей учетной записи успешно отправлена на адрес {{email}}.</h3>
        <p>Откройте сообщение в вашем электронном почтовом ящике и выполните необходимые действия.</p>
      </div>
      <div v-else>
        <h3 class="blue--text mt-0 mb-3">Новая ссылка для активации вашей учетной записи успешно отправлена на адрес {{email}}.</h3>
        <p>Откройте сообщение в вашем электронном почтовом ящике и нажмите на ссылку активации.</p>
      </div>
      <p>Не забудьте также проверить папку "Спам", если письмо долго не приходит.</p>
    </div>
    <div v-else>
      <p v-if="password_or_activation === 1" class="body-1">
        Инструкция по сбросу пароля придет на указанный адрес электронной почты, если он зарегистрирован на сайте:
      </p>
      <p v-else class="body-1">
        Чтобы получить электронное письмо с новой ссылкой для активации вашей
        учетной записи, введите свой адрес электронной почты и нажмите "Продолжить".
      </p>
      <v-text-field
          label="Адрес электронной почты"
          prepend-icon="mdi-email-outline"
          v-model="email"
          :error="email_err_state"
          :error-messages="email_err_hint"
          ref="email_send"
          :autofocus="true"
          autocomplete="off"
      ></v-text-field>
    </div>
    <div v-if="serv_err">
      <div class="red--text">
        {{ error_obj.header }}
      </div>
      <div v-html="error_obj.body">
      </div>
    </div>
  </v-card-text>
</template>

<script>
export default {
  name: "SendPasswordActivation",
  props: ['password_or_activation',],
  data: ()=>({
    email: '',
    email_err_hint: '',
    email_err_state: false,
    error_obj: {},
    serv_err: false,
    send_success: false,
  }),
  methods: {
    goSending(){
      if (this.isEmailValid()) {
        console.log('go sending')
        this.serv_err = false
        if ( this.password_or_activation === 1)
          this.makeRequest('reset_password/')
        else
          this.makeRequest('resend_activation/')
      }
    },
    isEmailValid() {
      const email_pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      let err = true
      if( !this.email.length ){
        this.email_err_hint = 'Заполните адрес'
      }else if( !email_pattern.test(this.email) ) {
        this.email_err_hint = 'Проверьте ошибки в адресе'
      } else if (this.email.length > 128){
        this.email_err_hint = 'Адрес слишком длинный'
      } else {
        this.email_err_state = false
        this.email_err_hint = ''
        err = false
      }
      if(err){
        this.email_err_state = true
        this.$refs.email_send.focus()
        this.$emit('send_error')
      }
      return !err
    },
    makeRequest(path){
      this.axios.post('auth/users/' + path, {email: this.email})
        .then(response => {
          this.send_success = true
          this.$emit('send_success')
          console.log('response: ', response)
        })
        .catch(error => {
          this.$emit('send_error')
          this.serv_err = true
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            // console.log(error.response.data);
            //console.log('Error response status: ', error.response.status)
            // console.log(error.response.headers);
            //console.log('Error response data: ', error.response.data)
            this.errorHandler(2)
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log('Error request: ', error.request)
            this.errorHandler(1)
          } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', error.message)
          }
        })
    },
    errorHandler(err){
      const add_err_str = '<br>Если вы не нашли причину ошибки, пожалуйста сообщите о ней в службу поддержки пользователей.'
      const err_str = 'Ошибка могла возникнуть по следующим причинам:<br>- В адресе допущена ошибка. Проверьте еще раз введенный адрес;<br>- Пользователь с таким адресом не зарегистрирован. '
      switch (err) {
        case 1:
          this.error_obj.header = 'Очень жаль, но сервер временно не доступен.'
          this.error_obj.body = 'Пожалуйста, повторите попытку позже, или напишите в службу поддержки.'
          break
        case 2:
          this.error_obj.header = 'Сервер вернул ошибку.'
          if ( this.password_or_activation === 1){ // Восствновление пароля
            this.error_obj.body = err_str + add_err_str
          }
          else{ // Отправка активационного письма
            this.error_obj.body = err_str + 'Нажмите "Отмена" и пройдите регистрацию;<br>- Ваша учетная запись уже активна. Попробуйте зайти со своими учетными данными.' + add_err_str
          }
          break

        default:
          break

      }

    },
    reset(){
      this.serv_err = false
      this.error_obj = {}
      this.send_success = false
      this.email_err_hint = ''
      this.email_err_state = false
    },

  },

}
</script>

<style scoped>

</style>