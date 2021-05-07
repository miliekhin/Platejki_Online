<template>
  <div id="home_block">
<!--    <keep-alive>-->
      <head-main
        :login_show = 'login_show'
        :need_logout = 'need_logout'
      />
<!--    </keep-alive>-->
    <div class="block1">
      <ul data-aos="fade-left" data-aos-duration="1000">
        <li>Больше не нужно заполнять бумажные бланки вручную</li>
        <li>Введите платежные данные один раз</li>
        <li>Создавайте и распечатывайте платежки*</li>
        <li>Оплачивайте в любом отделении почты</li>
      </ul>
      <div class="blue_block_left" data-aos="flip-up">Так удобнее!</div>
      <p class="p_asterisk">
        * Если нет принтера &mdash; можно сохранить платежки на флешку, и распечатать там где он доступен.
      </p>
    </div>

    <div class="block2">
      <div class="back_img"></div>
      <div class="blue_block_left" data-aos="flip-up">В чем преимущества?</div>
      <div class="text_block" data-aos="fade-right" data-aos-duration="1000">
        <ul>
          <li>История всех платежей за услуги ЖКХ</li>
          <li>Ведение платежек для нескольких адресов</li>
          <li>Архив платежек всегда доступен в интернете</li>
          <li>Просмотр статистики по платежам</li>
        </ul>

<!--        <p>-->
<!--        - История всех платежей за услуги ЖКХ <br>-->
<!--        - Ведение платежек для нескольких адресов<br>-->
<!--        - Архив платежек всегда доступен в интернете<br>-->
<!--        - Просмотр статистики по платежам<br>-->
<!--        </p>-->
      </div>
    </div>

    <div class="block_yellow">
      <p data-aos="zoom-in" data-aos-once="true">
        Платежки имеют предельно простую и универсальную форму в которой есть все необходимые данные для приема платежа
        от абонента за предоставляемые ему услуги ЖКХ.
      </p>
    </div>

    <div class="block_plat">
      <div class="blue_block_right" data-aos="flip-up">Пример заполненной платежки:</div>
      <div class="img_wrp"
           data-aos="flip-up"
           data-aos-duration="1000"
           data-aos-anchor-placement="center-bottom"
           @click="onPlatClick($event.target)">
        <img src="@/assets/plat.jpg" alt="Пример заполненной платежки">
      </div>
    </div>

    <div class="block_contact" id="konnekta">
      <div class="back_img"></div>
      <div class="blue_block_left" data-aos="flip-up">Мы на связи:</div>

      <div class="sub_block_form">
        <div id="contact_info">
          <p>
            Если у вас возникли проблемы при работе с сайтом, или есть предложения, напишите нам об этом. Мы постараемся ответить как можно быстрее.<br>
<!--            Мы постараемся ответить на ваше сообщение как можно быстрее.<br>-->
<!--            Пожалуйста, не забудьте проверить папку &laquo;Спам&raquo; в вашем почтовом ящике. Наш ответ может оказаться и там.-->
            Если у вас есть вопросы, загляните в раздел <router-link title="Часто задаваемые вопросы" :to="{name: 'Chavo'}">ЧаВо</router-link> &mdash; возможно, там вы найдете ответ.
          </p>
          <div id="soc_vk" data-aos="flip-up">
            <v-btn fab dark large color="indigo" class="mr-3"
                   @click.native="openVK"
            >
              <v-icon>mdi-vk</v-icon>
            </v-btn>
            <div>Читайте последние новости <br>в нашей группе VK</div>
          </div>
        </div>
        <div id="send_msg_block">
<!--          <recaptcha ref="recaptcha" @verify="sendMessage"/>-->
              <div id="message_was_sent_block" v-if="is_msg_was_sent">
                <div v-if="is_msg_sent_success">
                  <h2 class="primary--text">&#9993;</h2>
                  <h3 class="primary--text">Ваше сообщение было успешно отправлено!</h3>
                  <p>
                    Мы постараемся ответить вам в ближайшее время.
                  </p>
                  <v-btn class="mt-5" @click="is_msg_was_sent = false">отлично!</v-btn>
                </div>
                <div id="send_msg_error" v-else>
                  <h2 class="warning--text">&#9888;</h2>
                  <h3 class="warning--text">Ой, сообщение <div style="display: inline-block">не отправилось :(</div></h3>
                  <p>
                    Пожалуйста, попытайтесь отправить сообщение позже, или отправьте его с вашего ящика
                    на адрес <span class="primary--text">info@moiplatejki.online</span>
                  </p>
                  <v-btn class="mt-5" @click="is_msg_sent_success = true; is_msg_was_sent = false">хорошо</v-btn>
                </div>
              </div>
              <div id="sending_msg_block" v-else-if="is_msg_sending">
                <h3>Отправка сообщения...</h3>
                <loada/>
              </div>
          <v-form v-else class="forma" ref="forma">
            <v-text-field
                filled
                background-color="white"
                label="Ваш e-mail:"
                required
                maxxlength="64"
                v-model="email"
                :error="email_err_state"
                :error-messages="email_err_hint"
                ref="email_fld"
                clearable
                @input="handleEmailInput"
            />
            <v-textarea
                filled
                no-resize
                background-color="white"
                label="Текст сообщения:"
                required
                maxxlength="1024"
                v-model="msg"
                :error="msg_err_state"
                :error-messages="msg_err_hint"
                ref="msg_fld"
                @input="handleMessageInput"
            />
            <v-card-actions class="pa-0">
              <v-spacer/>
              <v-btn class="btn_send"
                     @click="runSubmit"
                     outlined
              >
                <v-icon left>mdi-email-send-outline</v-icon>
                Отправить
              </v-btn>
            </v-card-actions>
          </v-form>
        </div>
      </div>

    </div>

    <div id="advert_block">
      <div id="yandex_rtb_R-A-766528-1"></div>
    </div>

  </div>
</template>

<script>

import HeadMain from "@/components/Header"
import Loada from "@/components/Loada"
// import Recaptcha from "@/components/Recaptcha"
// import RecaptchaRenderless from "@/components/RecaptchaRenderless"
  // import Vue from "vue";
  // import * as VueReCaptcha from "vue-recaptcha-v3";
  // Vue.use(VueReCaptcha, { siteKey: "your-google-recaptcha-site-key" });
export default {
  name: 'Home',
  components: {HeadMain, Loada, },
  props: ['login_show', 'need_logout'],
  data: () => ({
    email_pattern: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    valid: true,
    email: '',
    msg: '',
    email_err_state: false,
    email_err_hint: '',
    msg_err_state: false,
    msg_err_hint: '',
    is_msg_sending: false,
    is_msg_was_sent: false,
    is_msg_sent_success: true,
  }),
  methods:{
// send your recaptcha token to the server to verify it
    getRecaptchaToken() {
      return new Promise((resolve) => {
        // eslint-disable-next-line no-undef
        grecaptcha.ready(async () => {
          // eslint-disable-next-line no-undef
          const token = await grecaptcha.execute( this.$store.getters.getRecaptchaSiteKey )
          resolve(token)
        });
      });
    },
    async sendMessage(recaptcha_response) {
      // console.log('Response from RECAPTCHA:', recaptcha_response)
      try {
        await this.$store.dispatch('act_sendMessageFromLanding', {email: this.email, msg: this.msg, recaptcha_response})
        this.is_msg_sending = false
        this.is_msg_was_sent = true
        this.email = ''
        this.msg = ''
      }
      catch (e) {
        this.sendMessageError('Landing send message error: ' + e)
      }
    },
    handleEmailInput(){
      if (!this.email || !this.email.length || this.email_pattern.test(this.email) ) {
        this.email_err_state = false
        this.email_err_hint = ''
      }
    },
    handleMessageInput(){
      if ( !this.msg || !this.msg.length || this.msg.length >= 16) {
        this.msg_err_state = false
        this.msg_err_hint = ''
      }
    },
    // resetForm(){
    // },
    sendMessageError(err_txt){
      this.is_msg_sending = false
      this.is_msg_was_sent = true
      this.is_msg_sent_success = false
      console.log(err_txt)
    },
    async runSubmit(){
      if (this.isFieldsValid()){
        this.is_msg_sending = true
        // this.$refs.recaptcha.execute()
        try {
          const token = await this.getRecaptchaToken()
          await this.sendMessage(token)
        }catch (err){
          this.sendMessageError('reCAPTCHA error: ' + err)
          this.$store.commit('mut_alertError', 'Ошибка при получении токена reCAPTCHA.')
        }
      }
    },
    isFieldsValid() {
      let err = true
      if ( !this.email || !this.email.length) {
        this.email_err_hint = 'Введите электронный адрес'
      } else if (!this.email_pattern.test(this.email)) {
        this.email_err_hint = 'Проверьте ошибки в электронном адресе'
      } else if (this.email.length > 128) {
        this.email_err_hint = 'Электронный адрес слишком длинный'
      } else {
        err = false
        this.email_err_state = false
        this.email_err_hint = ''
      }

      if(err){
        this.email_err_state = true
        this.$refs.email_fld.focus()
        return false
      }

      err = true
      if ( !this.msg.length ) {
        this.msg_err_hint = 'Напишите сообщение'
      }else if ( this.msg.length < 16) {
        this.msg_err_hint = 'Сообщение слишком короткое'
      }else{
        err = false
        this.msg_err_state = false
        this.msg_err_hint = ''
      }

      if(err){
        this.msg_err_state = true
        this.$refs.msg_fld.focus()
        return false
      }

      return true
    },
    onPlatClick(el_img){
      if (window.innerWidth < 500){
        window.open(el_img.src, 'Image')
      }
    },
    openVK(){
      window.open('https://vk.com/club202282907', '_blank')
    },

  },
  mounted() {
    document.title = this.$store.getters.getPageTitle
    if(this.$route.hash) {
      const el = document.querySelector(this.$route.hash);
      el && el.scrollIntoView({behavior: 'smooth', block: 'start'});
    }
  },
}
</script>

<style scoped lang="scss">
  #home_block{
    font-family: Montserrat, serif;
    letter-spacing: 0.045em;
    font-weight: 500;
    font-size: 21px;
    @media screen and (max-width:420px){
      font-size: 19px;
      li{
        margin-bottom: 5px;
      }
    }
  }
  .block1{
    margin-top: -222px;
    position: relative;
    @media screen and (max-width:420px){
      margin-top: -122px;
    }
    .p_asterisk, ul{
      margin-left: 35px;
    }
    ul{
      margin-bottom: 20px;
      @media screen and (max-width:420px){
        margin-left: 15px;
      }
    }
    .p_asterisk{
      font-size: 14px;
      margin-top: 25px;
      width: 510px;
      @media screen and (max-width:420px){
        width: 90%;
        margin-left: 15px;
      }

    }
    .blue_block_left{
      width: 245px;
      @media screen and (max-width:420px){
        width: 219px;
      }

    }

  }

  .blue_block_left, .blue_block_right {
    height: 50px;
    background: #0047FF;
    opacity: .47;
    color: white;
    line-height: 50px;
  }
  .blue_block_left{
    padding-right: 40px;
    text-align: right;
  }

  .block2{
    position: relative;
    height: 324px;
    margin-top: 65px;
      .blue_block_left{
        max-width: 805px;
        @media screen and (max-width: 420px){
          width: 90%;
        }
      }
      .text_block{
        position: absolute;
        display: flex;
        justify-content: flex-end;
        width: 100%;
        height: 324px - 50;
        align-items: center;
        ul{
          margin-right: 10%;
          @media screen and (max-width: 420px){
            margin-left: 15px;
          }
          @media screen and (max-width: 800px) and (min-width: 420px){
            margin-right: 10px;
            width: 40%;
          }
        }
      }
      .back_img{
        position: absolute;
        top: 0;
        left: 0;
        width: 594px;
        height: 100%;
        background: linear-gradient(270deg, #FFFFFF 0, rgba(255, 255, 255, 0) 100%), url('~@/assets/coins.jpg');
        @media screen and (max-width:420px){
          width: 100%;
          background: linear-gradient(270deg, rgba(255, 255, 255, 100%) 0, rgba(255, 255, 255, 90%) 100%), url('~@/assets/coins.jpg');

        }
      }
  }
  .block_yellow{
    height: 172px;
    background: #FFE766;
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin: 55px 0;
    @media screen and (max-width:420px){
      height: auto;
    }
    p{
      max-width: 665px;
      text-align: center;
      margin: 0;
      padding: 10px;
    }
  }

  .block_plat{
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    .img_wrp{
      padding: 55px 0;
      text-align: center;
      flex: 0 1 100%;
      @media screen and (max-width:420px) {
        padding: 30px 0;
      }
    }
    img{
      transition: .3s;
      @media screen and (max-width:420px) {
        width: 100%;
        padding: 5px;
      }
      @media screen and (min-width: 800px) {
        &:hover {
          transform: scale(1.3);
          box-shadow: 0 0 20px 10px rgba(209, 209, 209, 1);
        }
      }
    }
    .blue_block_right{
      padding-left: 40px;
      /*max-width: 805px;*/
      flex: 0 1 70%;
      @media screen and (max-width:420px) {
        flex: 0 1 90%;
        height: auto;
        line-height: normal;
        padding: 5px 15px;
      }
    }
  }

  .block_contact{
    position: relative;
    min-height: 430px;
    .blue_block_left{
      max-width: 460px;
      @media screen and (max-width:420px) {
        width: 70%;
      }
    }
    .sub_block_form{
      position: relative;
      display: flex;
      flex-wrap: wrap;
      .forma, #contact_info {
        padding: 30px;
        @media screen and (max-width:420px) {
          padding: 10px;
        }
      }
      #contact_info{
        width: 50%;
        margin: 0;
        @media screen and (max-width:420px){
          width: 100%;
          font-size: 16px;
          //font-weight: normal;
        }
        @media screen and (max-width: 800px){
          font-size: 16px;
        }
        #soc_vk{
          display: inline-flex;
          background: #FFE766;
          font-size: 16px;
          align-items: center;
          padding-right: 16px;
          margin-top: 30px;
          border-radius: 30px 0 0 30px;
        }
      }
      #send_msg_block {
        width: 50%;
        background: #9594943d;
        height: 376px;
          @media screen and (max-width: 420px) {
            height: 336px;
            width: 100%;
            margin-bottom: 20px;
          }
        #message_was_sent_block,
        #sending_msg_block{
          height: 100%;
          text-align: center;
          display: flex;
          flex-wrap: wrap;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        #message_was_sent_block{
          padding: 0 10px;
          h2{
            font-size: 80px;
            line-height: 80px;
          }
          h3{
            line-height: normal;
            margin-bottom: 10px;
          }
          p{
            width: 100%;
            padding: 20px;
            font-size: 16px;
            @media screen and (max-width:420px){
              line-height: normal;
              padding: 0;
            }
          }
        }
        #sending_msg_block {
          color: #aaaaaa;
          h3 {
            margin-bottom: 20px;
            width: 100%;
          }
        }

        .forma{
          .btn_send:hover {
            background-color: rgba(0, 0, 0, 1) !important;
          }

          .btn_send {
            border: 2px solid #FFE766 !important;
            border-radius: 0 !important;
            color: white !important;
            background-color: rgba(0, 0, 0, .6) !important;
            transition: .4s;
          }
        }

      }
    }
    .back_img{
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      background: linear-gradient(180deg, #FFFFFF 0%,
          rgba(255, 255, 255, .9) 55%,
          rgba(255, 255, 255, .50) 100%),
          no-repeat bottom url('~@/assets/footer.jpg');
    }

  }

  #advert_block{
    padding: 10px 0;
    background: #707070;
  }

</style>