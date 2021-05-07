<template>
  <div class="wrp">
    <h2 v-if="!code" class="font-weight-light">
      Вход через учетную запись {{state}}...
    </h2>
    <h2 v-else class="font-weight-light">Авторизация...</h2>
    <loada v-if="!error_msg" class="mt-4"/>
    <div v-else class="mt-4">
      <p>Во время авторизации произошла ошибка:</p>
      <p class="red--text">{{error_msg}}</p>
      <p>Вы можете вернуться на <router-link :to="{name: 'HomeLogin'}" replace>главную страницу</router-link> и повторить попытку позже. <br>
        Или сообщить нам об этой ошибке через <router-link title="Обратная связь" replace :to="{name: 'Home', hash: '#konnekta'}">форму обратной связи.</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import Loada from "../components/Loada"
import {mapGetters} from "vuex"
export default {
  name: "SocialRedirector",
  components: {Loada},
  props: ['code', 'state', 'access_token'],
  data: () => ({
    error_msg: '',
    redirect_uri: process.env.VUE_APP_REDIRECT_URI
  }),
  methods:{
    ...mapGetters(['getSocNameGoogle', 'getSocNameVK', 'getSocNameOK']),
  },
  async mounted() {
    // console.log('OAUTH2 CODE:', this.code, this.access_token, this.state)
    if ( this.code || this.access_token) {
      // todo: Скорее всего сюда приходит мусор в state или code из-за чего некоторые юзеры не могут зайти через соцсеть
      try {
        await this.$store.dispatch('act_socialLogIn', {'provider': this.state, 'code': this.code})
        await this.$router.push({name: 'Platejki'})
      }catch (e) {
        // console.log('Social Error: ', e.text)
        this.error_msg = e
      }
      // this.error_msg = "this.getGlobalError().length"
    }else {
      // console.log('prop_soc_name', this.prop_soc_name, this.code)
      if (this.state === this.getSocNameVK()) {
        window.location = 'https://oauth.vk.com/authorize?' +
            `client_id=${process.env.VUE_APP_VK_APP_ID}&` +
            'redirect_uri=' + this.redirect_uri +
            'scope=email&' +
            'display=page&' +
            'response_type=code&' +
            'state=vk-oauth2'
      }
      else if (this.state === this.getSocNameOK()) {
        // Описание https://apiok.ru/ext/oauth/client
        window.location = 'https://connect.ok.ru/oauth/authorize?' +
            `client_id=${process.env.VUE_APP_OK_APP_ID}&` +
            'scope=GET_EMAIL&' +
            'response_type=code&' +
            'redirect_uri=' + this.redirect_uri +
            'state=odnoklassniki-oauth2'
      }
      else if (this.state === this.getSocNameGoogle()) {
        window.location = 'https://accounts.google.com/o/oauth2/v2/auth?' +
            `client_id=${process.env.VUE_APP_GG_APP_ID}&` +
            'scope=email&' +
            // 'include_granted_scopes=true&' +
            'response_type=code&' +
            'redirect_uri=' + this.redirect_uri +
            'state=google-oauth2'
      }
      else {
        await this.$router.replace({name: 'Home'})
      }
    }
  },
}
</script>

<style scoped>
  .wrp{
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
</style>