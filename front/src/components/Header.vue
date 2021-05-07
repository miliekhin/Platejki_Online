<template>
    <div class="head_menu" :style="styleObj">
      <div class="head_img"></div>
      <div class="slogan_line">
        <div class="slogan_wrapper" @click="clickLogo">
          <div class="slogan">
            <span class="slogan_main">МОИ ПЛАТЕЖКИ</span>
            <span class="sub_slogan">ОНЛАЙН</span>
          </div>
          <div class="under_slogan"><span class="inl_block">Управление платежками</span> <span class="inl_block">за услуги ЖКХ</span></div>
        </div>
        <div id="login_block">
          <v-btn
              v-if="is_LoggedIn && !isLogInProcess"
              :to="{name: 'Platejki'}"
              text
              color="white"
          >
            <v-icon left>mdi-table-account</v-icon>
            Мой кабинет
          </v-btn>
          <v-btn v-if="is_LoggedIn"
              :loading="isLogInProcess"
              :disabled="isLogInProcess"
              text
              color="white"
              @click="onExit()"
          >
            Выход
            <v-icon right>mdi-logout</v-icon>
          </v-btn>
          <sign-log-in v-else ref="login_btn"
                       :login_process="isLogInProcess"
                       @login_success="is_LoggedIn=true"
          />
        </div>
      </div>
      <div class="menu_links float-right">
        <span><a @click.prevent="scrollToContacts" href="#">Контакты</a></span>
<!--        <span><router-link :to="{name: 'Home', hash: '#konnekta'}" @click="scrollToContacts">Контакты</router-link></span>-->
        <span><router-link title="Часто задаваемые вопросы" :to="{name: 'Chavo'}">ЧаВо</router-link></span>
        <span><router-link :to="{name: 'About'}">О сайте</router-link></span>

      </div>
    </div>
</template>

<script>
  import SignLogIn from "@/components/modal/SignUpLogIn";
  import {mapActions, mapGetters, mapMutations} from "vuex";
  export default {
    name: "Header",
    components: {SignLogIn, },
    props: ['login_show', 'need_logout'],
    data:()=>({
      is_LoggedIn: false,
    }),
    methods:{
      ...mapActions(['startLogIn',]),
      ...mapMutations(['logOut', 'resetLogInProcess']),
      onExit(){
        this.logOut()
        this.is_LoggedIn = false
      },
      scrollToContacts(){
        const el = document.querySelector( '#konnekta' )
        el ? el.scrollIntoView({behavior: 'smooth', block: 'start'}) : this.$router.push({name: 'Home', hash: '#konnekta'})
      },
      clickLogo(){
        if (this.$router.currentRoute.name !== 'Home')
          this.$router.push({name: 'Home'})
      }
    },
    mounted() {
      if ( this.login_show ){// Если заходим по ссылке /login
        this.logOut()
        this.is_LoggedIn = false
        this.$nextTick(() => {
          this.$refs.login_btn.show_dlg = true
        })
        // console.log('Current route', this.$router.currentRoute.name, this.$refs.login_btn.show_dlg)
      }
    },
    async created() {
      //console.log('Header created. isTokensPresent:', this.isTokensPresent)
      if ( this.need_logout ){// Если заходим по ссылке /logout
        this.logOut()
        this.is_LoggedIn = false
      }
      else if( this.isTokensPresent ){
          this.is_LoggedIn = true

      //   try {
      //     await this.startLogIn(null)
      //     this.is_LoggedIn = true
      //   } catch (e) {
      //     this.resetLogInProcess()
      //     console.log('Unable to login.', e)
      //   }
      }
    },
    computed:{
      ...mapGetters(['isLoggedIn', 'getUser', 'isLogInProcess']),
      styleObj() {
        let h = 560
        // if (this.$router.currentRoute.name !== 'Home')
        if ( !['Home', 'HomeLogin', 'HomeLogout', ].includes(this.$router.currentRoute.name) )
          h = (window.innerWidth < 500 ? 400 : 200)
        return {height: h + 'px'}
      },
      isTokensPresent(){
        return Boolean(this.$store.state.authModule.tokens.access)
      }
    }
  }
</script>

<style scoped lang="scss">

  .head_menu{
    font-family: Montserrat, serif;
    position: relative;
    overflow: hidden;
    padding: 30px;
    @media screen and (max-width:420px){
      padding: 10px;
    }

   .slogan_line{
      position: relative;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;

        .slogan_wrapper{
          line-height: 0;
            @media screen and (max-width:420px){
              line-height: normal;
            }

          color: white;
          cursor: pointer;
          user-select: none;
            .slogan{
              .slogan_main{
                letter-spacing: 0.045em;
                font-weight: 600;
                font-size: 41px;
                margin-left: -3px;
                @media screen and (max-width:420px){
                  margin-left: 0;
                }
              }
              .sub_slogan{
                font-weight: bold;
                font-size: 27px;
                line-height: 41px;
                color: #FFE766;
                margin-left: 12px;
                letter-spacing: 0.045em;
                @media screen and (max-width:420px){
                  margin-left: 0;
                  display: block;
                  line-height: normal;
                }
              }
            }
            .under_slogan{
              letter-spacing: 0.045em;
              font-size: 24.2px;
              font-weight: normal;
              margin-top: 12px;
              .inl_block{
                display: inline-block;
              }
              @media screen and (max-width:420px){
                margin-top: 15px;
                font-size: 20px;
                text-align: right;
              }
            }
        }
        #login_block{
          @media screen and (max-width: 420px){
            text-align: center;
            width: 100%;
            margin-top: 63px;
          }
          @media screen and (max-width: 800px){
            margin-top: 30px;
          }
        }

    }

  .menu_links{
    position: relative;
    letter-spacing: 0.045em;
    font-weight: 300;
    font-size: 20px;
    margin-top: 60px;
      @media screen and (max-width: 420px){
        width: 100%;
        display: flex;
        justify-content: space-around;
        font-size: 21px;
      }
      a{
        color: white;
        text-decoration: none;
        @media screen and (max-width:420px){
          color: #393939;
          font-weight: 500;
          border-bottom: black 1px dashed;
        }
      }
      a:hover{
        color: #FFE766;
        border-bottom: #FFE766 1px dashed;
        transition: .3s;
      }
      span{
        margin-left: 20px;
        @media screen and (max-width:420px){
          margin: 0;
        }
      }
  }

  }

  .head_img{
    position: absolute;
    width: 100%;
    height: 560px;
    left: 0;
    top: 0;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.74) 0%,
        rgba(0, 0, 0, 0.47) 23.96%,
        rgba(255, 255, 255, 0.7) 57.81%,
        #FFFFFF 100%), url('~@/assets/head.jpg');
    @media screen and (max-width:420px){
      background: linear-gradient(180deg, rgba(0, 0, 0, 0.74) 0%,
        rgba(0, 0, 0, 0.47) 23.96%,
        rgba(255, 255, 255, 0.52) 57.81%,
        #FFFFFF 100%), url('~@/assets/head.jpg');
    }
  }

</style>