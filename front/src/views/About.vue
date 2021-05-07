<template>
  <div>
    <head-main/>
    <article>
      <div class="blue_block_left" data-aos="flip-up">Общие положения, условия использования, и отказ от ответственности:</div>
      <p>Cайт разработан исключительно для собственных нужд разработчика, а именно &mdash; для удобного заполнения и
        распечатки так называемых "платежек" (извещений, квитанций) за услуги жилищно-коммунального хозяйства,
        а также, для ведения истории платежей за эти услуги, и подсчета статистики.</p>

      <p>Регистрируясь на сайте, пользователь соглашается с нижеизложенными положениями:</p>

      <p>Распечатываемая платежка не является официально-утвержденной формой платежного документа или иным документом.
        Она лишь предоставляет достаточную информацию кассиру почтового отделения для приема оплаты за услуги ЖКХ.</p>

      <p>Приём распечатанных платежек в любом почтовом отделении не гарантируется.</p>

      <p>Стабильная работа сайта и сохранность данных зарегистрированных пользователей в течении длительного периода
        времени не гарантируется.</p>

      <p>Полная защита данных пользователей от утечек не гарантируется.</p>
      <p>Все названия тоговых марок и организаций являются вымышленными.</p>
      <p>Все данные пользователей хранятся в закрытом доступе и доступны только им. При удалении учетной записи
        пользователя, вся информация связанная с этой учетной записью полностью удаляется из базы данных, и
        восстановлению не подлежит.</p>
    </article>
  </div>
</template>

<script>
  import HeadMain from "@/components/Header";
  export default {
    name: 'About',
    components: {HeadMain,},
  }
</script>

<style scoped lang="scss">
  article{
    font-family: Montserrat, serif;
    font-size: 20px;
    min-height: 50vh;
    padding: 30px;
    @media screen and (max-width:420px) {
      font-size: 19px;
      line-height: normal;
    }
    .blue_block_left{
      display: flex;
      flex-direction: column;
      justify-content: center;
      background: #0047FF;
      opacity: .47;
      color: white;
      padding: 10px 40px 10px;
      text-align: right;
      font-weight: 500;
      max-width: 890px;
      margin-left: -30px;
      margin-bottom: 30px;
      @media screen and (max-width:420px) {
        font-size: 19px;
        line-height: normal;
        padding: 7px 12px;
        height: auto;
        width: 100%;
      }

    }

  }
</style>