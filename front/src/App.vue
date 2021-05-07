<template>
  <div id="app">
<!--    <div id="nav">-->
<!--      <router-link to="/">Home</router-link> |-->
<!--      <router-link to="/platejki">Платежки</router-link> |-->
<!--      <router-link to="/settings">Настройки</router-link> |-->
<!--      <router-link to="/about">About</router-link>-->
<!--    </div>-->
<!--    <router-view/>-->
<!--  </div>-->
    <v-app>
      <router-view/>
      <div id="alert-box">
        <v-alert
            v-model="alert"
            type="error"
            dismissible
            border="top"
            transition="scale-transition"
        >
<!--            text-->
<!--            outlined-->
<!--            dense-->
          {{$store.state.alert_error_txt}}
        </v-alert>
      </div>
<!--      <v-footer app absolute>-->
<!--        <v-spacer></v-spacer>-->
<!--        <div>&copy; {{ new Date().getFullYear() }}</div>-->
<!--      </v-footer>-->
    </v-app>
  </div>
</template>

<script>
//import FlyingNote from "@/components/FlyingNote";
//import {mapGetters} from "vuex";
export default {
  components:{
    //FlyingNote,
  },
  data: ()=>({
    alert: false, //Сбрасывается обратно на false когда закрываешь сообщение алерта
  }),
  computed:{
  },
  watch: {
    '$route' (to) {
      let t = this.$store.getters.getPageTitle
      document.title = to.meta.title ? t + ' - ' + to.meta.title : t
    },

  },
  mounted() {
    this.$store.subscribe(mutation => {
      if (mutation.type==='mut_alertError'){
        this.alert = true
        //console.log('Global error!', state.alert_error_txt)
      }
    })
  }
}
</script>

<style lang="scss">
  #alert-box{
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: fixed;
    bottom: 0;
    z-index: 1000;
    .v-alert{
      max-width: 700px;
      @media screen and (max-width:375px) {
        width: 97%;
      }
    }
  }
/*#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}*/
</style>
