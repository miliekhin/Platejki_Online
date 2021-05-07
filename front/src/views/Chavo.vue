<template>
  <div>
    <head-main/>
    <article>
      <div class="blue_block_left" data-aos="flip-up">Часто задаваемые вопросы:</div>
      <v-expansion-panels tile multiple>
        <v-expansion-panel>
          <v-expansion-panel-header class="text-h6">
            Как сохранить платежки на флешку?
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            В разделе "Платежки" своего кабинета нажмите кнопку "Печать" и выберите месяцы платежки из
            которых необходимо сохранить.<br>
            Нажмите кнопку "Продолжить".<br>
            В списке принтеров выберите "Сохранить как PDF" или "Microsoft Print to PDF", и нажмите "Сохранить".
            <div class="text-center my-8"><img src="@/assets/faq_pdf.png" alt="Выбор принтера"></div>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header class="text-h6">
            Зачем нужна опция "Копировать платежки из предыдущего месяца"?
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <div class="text-center my-8"><img src="@/assets/faq_copy.png" alt="Опция копирования"></div>
            Выбрав эту опцию можно скопировать сразу все платежки из предыдущего месяца оплаты.
            <br>
            Причем, последние значения счетчиков будут подставлены автоматически в колонку "Предыдущее показание счетчика".
            <br>
            Это особенно удобно когда нужно оплачивать несколько адресов.
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header class="text-h6">
            Зачем ставить отметку "Оплачено" ?
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            Рекомендуется в день оплаты платежки поставить отметку "Оплачено".
            <br>
            <div class="text-center my-8"><img src="@/assets/faq_oplacheno.png" alt="Меню"></div>
            Это сделано для удобства и уверенности в том, что вы действительно не забыли оплатить услуги.<br>
            Это также позволит видеть над платежкой дату оплаты.<br>
            <div class="text-center my-8"><img src="@/assets/faq_oplacheno2.png" alt="Дата оплаты"></div>
            Кроме того, платежка будет заблокирована от случайного изменения данных в ней.
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </article>
    <p class="ml-5">Вы можете прислать нам свой вопрос через <router-link title="Обратная связь" :to="{name: 'Home', hash: '#konnekta'}">контактную форму</router-link>
      на главной странице.</p>
  </div>
</template>

<script>
  import HeadMain from "@/components/Header";
export default {
  components: {HeadMain, },
  name: "Chavo",
  // data: () => ({
  //   open_panels: [0, 1],
  // }),
}
</script>

<style scoped lang="scss">
  article{
    min-height: 90vh;
    padding: 30px;
    @media screen and (max-width:420px) {
      padding: 30px 5px;
      img{
        width: 100%;
      }
    }
    .blue_block_left{
      font-family: Montserrat, serif;
      font-size: 20px;
      height: 50px;
      background: #0047FF;
      opacity: .47;
      color: white;
      line-height: 50px;
      padding-right: 40px;
      text-align: right;
      font-weight: 500;
      max-width: 505px;
      margin-left: -30px;
      margin-bottom: 30px;
      @media screen and (max-width:420px) {
        line-height: normal;
        padding: 7px 12px;
        height: auto;
        width: 100%;
      }
    }
  }
</style>