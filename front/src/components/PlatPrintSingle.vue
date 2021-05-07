<template>
  <div class="wrapper">
    <div class="pl_head">
      <div><span>Плательщик:</span> {{ prop_plat_obj.payer }}</div>
      <div v-if="prop_plat_obj.erc"><span>Код ЕРЦ:</span> {{ prop_plat_obj.erc }}</div>
      <div v-if="prop_plat_obj.payed_date"><span>Оплачено:</span> {{ payedDate(prop_plat_obj.payed_date) }}</div>
      <div><span>Период оплаты:</span> за {{ prop_prev_month }}</div>
      <div><span>Адрес:</span> {{ prop_plat_obj.addr }}</div>
    </div>
    <div class="d-inline-block">
      <table>
        <tr>
          <th width="170" class="algn-left" rowspan="2">Услуги ЖКХ</th>
          <th width="150" rowspan="2">Лицевой счет</th>
          <th colspan="2">Показания счетчика</th>
          <th width="90" rowspan="2">Объем</th>
          <th width="90" rowspan="2">Сумма</th>
        </tr>
        <tr>
          <th>Предыдущее</th>
          <th>Текущее</th>
        </tr>
        <tr v-for="serv in prop_plat_obj.stroka" :key="serv.serv_id">
          <td class="algn-left text-truncate">{{ serv.srvc_name }}</td>
          <td class="text-truncate">{{ serv.schet }}</td>
          <td class="text-truncate">{{ serv.counter_prev }}</td>
          <td class="text-truncate">{{ serv.counter_curr }}</td>
          <td class="text-truncate">{{
              serv.counter_curr > 0 ? +(serv.counter_curr - serv.counter_prev).toFixed(3) : ''
            }}
          </td>
          <td class="text-truncate">{{ serv.pay_amount }}</td>
        </tr>
        <tr>
          <td class="algn-right" colspan="5">Итого:</td>
          <td>{{ getAmount() }}</td>
        </tr>
      </table>
      <div class="text-right create-txt">Платежка создана на сайте www.moiplatejki.online</div>
    </div>
  </div>
</template>

<script>
import {getMonthNameWhen} from "@/utils/utils"

export default {
  name: "PlatPrintSingle",
  props:['prop_plat_obj', 'prop_prev_month'],
  methods:{
    payedDate(payed_date){
      if( !payed_date ) return ''
      let dt = new Date(payed_date)
      return `${dt.getDate()} ${getMonthNameWhen(dt.getMonth())} ${dt.getFullYear()}`
    },
    getAmount(){
      let amt = 0
      this.prop_plat_obj.stroka.forEach(stroka => {
        amt += +stroka.pay_amount
      });
      return +amt.toFixed(2)
    },

  },
}
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css?family=Roboto+Mono:400,500');
  /*@import url('https://fonts.googleapis.com/css?family=Source+Code+Pro:400,500,600');*/
  .wrapper{
    /*font-family: "Courier New", serif;*/
    font-family: "Roboto Mono", serif;
    /*font-family: "Source Code Pro", serif;*/
    font-size: .95em;
    width: 740px;
  }
  .pl_head span{
    font-weight: 500;
  }
  .pl_head{
    line-height: 1.1em;
    margin-bottom: 2px;
  }
  table{
    table-layout: fixed;
    border-collapse: collapse;
    width: 740px;
  }
  th{
    font-weight: 500;
  }
  th, td{
      border: solid 1px gray;
      padding: 0 15px;
      /*width: 100px;*/
  }
  .algn-left{
      text-align: left;
  }
  .algn-right{
      text-align: right;
  }
  td{
      text-align: center;
    overflow: hidden;
  }
  tr:last-of-type{
      font-weight: 500;
  }
  .create-txt{
    font-size: .68em;
  }

</style>