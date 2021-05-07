<template>
  <p v-if="!$store.getters.platejkiAll.length" class="text-info text-center mt-10">Добавьте новые платежки для подсчета статистики.</p>
  <div v-else>
    <div class="d-flex">
      <v-sheet width="100" class="flex-shrink-1">
        <v-select
            :items="getYears"
            v-model="currentYear"
            outlined
        />
      </v-sheet>
      <v-sheet class="flex-grow-1">
        <v-select
            :items="getAddrNamesOfYearPlats(currentYear)"
            v-model="current_addr"
            outlined
        />
      </v-sheet>
    </div>

<!--    <v-simple-table class="tbl">-->
<!--      <template v-slot:default>-->
<!--        <thead>-->
<!--          <tr>-->
<!--            <th class="text-left"></th>-->
<!--            <th v-for="m in all_months" :key="m" class="text-left">-->
<!--              {{m}}-->
<!--            </th>-->
<!--            <th class="font-weight-black">Итого</th>-->
<!--          </tr>-->
<!--        </thead>-->
<!--        <tbody>-->
<!--          <tr v-for="row in statData" :key="row[0]">-->
<!--            <td v-for="(cell, i) in row" :key="row+i">{{ cell }}</td>-->
<!--          </tr>-->
<!--        </tbody>-->
<!--      </template>-->
<!--    </v-simple-table>-->

    <v-simple-table class="tbl">
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left"></th>
            <th v-for="row in statData" :key="row[0]" class="text-center text-body-2 font-weight-black">
              {{row[0]}}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(m, im) in all_months" :key="m" class="text-left">
            <td>{{m}}</td>
            <td v-for="row in statData" :key="m+row[0]">
              {{row[im+1]}}
            </td>
          </tr>
        <tr>
          <td class="font-weight-black">Итого</td>
            <td v-for="row in statData" :key="'13'+row[0]" class="font-weight-black">
              {{row[13]}}
            </td>
        </tr>
        </tbody>
      </template>
    </v-simple-table>
    <p class="text-right text-info mr-3 mt-4 font-weight-bold">
      Всего оплачено за год: {{ yearTotal }} <br>
      Всего оплачено за год по всем адресам: {{ yearTotalAllAddresses }}
    </p>
  </div>
</template>

<script>
import {monthNames} from "@/utils/utils"
import {mapGetters} from "vuex";

export default {
  name: "Stats",
  data: ()=>({
    current_year: 0,
    current_addr: '',
    addresses: [],
    all_months: monthNames,
  }),
  methods:{
  },
  computed: {
    ...mapGetters(['getYears', 'getAddrNamesOfYearPlats', 'getStatisticData', 'getYearTotalAllAddresses']),
    currentYear:{
      get(){
        if( !this.getYears.includes(this.current_year)){
          return this.$store.getters.getLatestYear
        }
        return this.current_year
      },
      set(val){
        this.current_year = val
        this.current_addr = this.getAddrNamesOfYearPlats(val)[0]
        //console.log('curr year: ', val)
      }
    },
    statData(){
      return this.getStatisticData({
        year: this.currentYear,
        addr_name: this.current_addr
      })
    },
    yearTotal(){
      let total = 0
      this.statData.forEach(strr => {
        total += strr[strr.length-1]
      })
      return total.toFixed(2)
    },
    yearTotalAllAddresses() {
      return this.getYearTotalAllAddresses(this.currentYear).toFixed(2)
    },
  },
  created() {
    this.current_addr = this.getAddrNamesOfYearPlats(this.currentYear)[0]
  }
}
</script>

<style scoped>
    /*td:last-of-type{*/
    /*  font-weight: bold;*/
    /*}*/
    td:not(:first-of-type){
      text-align: center;
    }

    /*.tbl{*/
    /*  position: absolute;*/
    /*  left: 10px;*/
    /*}*/
</style>