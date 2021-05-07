<template>
  <div>
    <div class="text-center">
      <div v-if="activation">
        <h2 class="font-weight-light">
          Идет активация учетной записи. Пожалуйста подождите...
        </h2>
<!--        <div class="lds-hourglass"></div>-->
        <loada/>
      </div>
      <div v-else-if="activate_success">
        <h3 class="blue--text my-4">Поздравляем! Ваша ученая запись успешно активирована.</h3>
        После перехода на страницу входа, нажмите "Войти с помощью учетных данных",<br>
        и введите ваши e-mail и пароль. <br><br>
        <router-link :to="{name: 'HomeLogin'}" replace>ВОЙТИ</router-link>
      </div>
      <div v-else class="mt-4">
        <p>{{ error_obj.header }}</p>
        <div v-for="err in error_obj.body" :key="'e'+err" class="red--text">
          {{ err }}
        </div>
        <br>
        <p v-html="error_obj.footer"></p>
        <a v-if="error_obj.try_again" href="#" @click.prevent="activateUser()">Попытаться активировать
          учетную запись еще раз</a>
        <br><br>
        <router-link :to="{name: 'Home'}">Перейти на главную страницу</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import Loada from "../components/Loada"
export default {
  name: "UserActivation",
  components: {Loada},
  props: ['uid','token'],
  data: ()=>({
    activation: true,
    error_obj: {},
    sending: false,
    activate_success: false,
  }),
  methods:{
    activateUser(){
      this.activation = true
      this.axios.post( `auth/users/activation/`, {
          uid: this.uid,
          token: this.token,
        })
        .then(response => {
          this.activation = false
          this.error_obj = {}
          this.activate_success = true
          console.log('Success activate response:', response)
          //this.$router.push('/auth/signin')
        })
        .catch(error => {
          this.activation = false
          this.error_obj.body = []
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            // console.log(error.response.data);
            console.log(error.response.status)
            // console.log(error.response.headers);
            console.log(error.response.data)
            this.error_obj.header = 'Во время активации учетной записи возникли следующие ошибки:'
            for (let key in error.response.data){
              if(error.response.status === 400) {
                error.response.data[key].forEach(err => this.error_obj.body.push(err))
                this.error_obj.footer = 'Скорее всего ссылка по которой вы перешли на эту страницу не исправна. Вы можете обратится в службу поддержки клиентов с описанием проблемы.'
              }else if(error.response.status === 403) {
                // аккаунт уже активен
                this.error_obj.body.push('Учетная запись по этой ссылке уже активирована.')
                this.error_obj.footer = 'Если у вас не получается войти в свою учетную запись, пожалуйста, обратитесь в службу поддержки с описанием проблемы.'
              }else{
                this.error_obj.body.push(error.response.data[key])
              }
            }
          } else if (error.request) {
            this.activation = false
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            //console.log(error.request)
            this.error_obj.header = ''
            this.error_obj.footer = 'Пожалуйста, повторите попытку активации позже или свяжитесь со службой поддержки через форму на главной странице.'
            this.error_obj.try_again = true
          } else {
            // Something happened in setting up the request that triggered an Error
            console.log('User activation: Config error:', error.message)
          }
        })
    },

  },
  mounted() {
    this.activateUser()
  },
}
</script>

<style scoped>
  .lds-hourglass {
    display: inline-block;
    position: relative;
    width: 80px;
    height: 80px;
  }
  .lds-hourglass:after {
    content: " ";
    display: block;
    border-radius: 50%;
    width: 0;
    height: 0;
    margin: 8px;
    box-sizing: border-box;
    border: 32px solid;
    border-color: #ccc transparent #ccc transparent;
    animation: lds-hourglass 1.2s infinite;
  }
  @keyframes lds-hourglass {
    0% {
      transform: rotate(0);
      animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19);
    }
    50% {
      transform: rotate(900deg);
      animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    }
    100% {
      transform: rotate(1800deg);
    }
  }

  /*.custom-loader {*/
  /*  animation: loader 1s infinite;*/
  /*  display: flex;*/
  /*}*/
  /*@-moz-keyframes loader {*/
  /*  from {*/
  /*    transform: rotate(0);*/
  /*  }*/
  /*  to {*/
  /*    transform: rotate(360deg);*/
  /*  }*/
  /*}*/
  /*@-webkit-keyframes loader {*/
  /*  from {*/
  /*    transform: rotate(0);*/
  /*  }*/
  /*  to {*/
  /*    transform: rotate(360deg);*/
  /*  }*/
  /*}*/
  /*@-o-keyframes loader {*/
  /*  from {*/
  /*    transform: rotate(0);*/
  /*  }*/
  /*  to {*/
  /*    transform: rotate(360deg);*/
  /*  }*/
  /*}*/
  /*@keyframes loader {*/
  /*  from {*/
  /*    transform: rotate(0);*/
  /*  }*/
  /*  to {*/
  /*    transform: rotate(360deg);*/
  /*  }*/
  /*}*/

</style>