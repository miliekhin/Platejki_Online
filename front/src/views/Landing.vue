<template>
  <v-main>
    <div class="main_frame mx-auto">
      <router-view/>
      <footer-main v-if="needFooter"/>
    </div>
  </v-main>
</template>

<script>
import FooterMain from "@/components/Footer"
import Vue from "vue"
export default {
  name: "Landing",
  components: {FooterMain},
  computed:{
    needFooter(){
      // console.log('this.$router.currentRoute.name:', this.$router.currentRoute.name)
      return !['user_activation', 'password_reset_confirm', 'social_redirector'].includes(this.$router.currentRoute.name)
    }
  },
  mounted() {
    //подгрузка скрипта для рекапчи
    const script = document.createElement('script')
    script.src = 'https://www.google.com/recaptcha/api.js?render=' + this.$store.getters.getRecaptchaSiteKey
    document.head.appendChild(script)

    if (!Vue.config.devtools){ // скрытие значка рекапчи на проде
      const style = document.createElement('style')
      style.textContent = '.grecaptcha-badge {opacity:0 !important;}'
      document.head.append(style)
    }
  },
  // beforeRouteEnter(to, from, next) {
  //   next(vm => {
  //     console.log('ROUTES:', to)
  //     vm.prevRoute = from
  //   })
  // },
}
</script>

<style>
  .main_frame{
    max-width: 1200px;
  }

</style>