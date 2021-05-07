<template>
<div>
  <h2 class="text-right">{{ monthName }}, {{prop_year}}</h2>
  <hr class="mb-4">
  <platejka v-for="(plid, i) in prop_plid_arr" :key="plid"
            :prop_plat_id="plid"
            :prop_month="prop_month"
            :prop_year="prop_year"
            :prop_is_last_plat="prop_plid_arr.length-1 === i"
            ref="platki"
            @amount-updated="countTotal"
  ></platejka>

  <div v-if="prop_plid_arr.length > 1" class="text-right text-h6 mr-6 mt-n6 mb-10">Всего: {{ +total.toFixed(2) }}</div>
</div>
</template>

<script>
import Platejka from "@/components/Platejka"
import {getMonthName} from "@/utils/utils"

export default {
name: "MonthPlatejka",
  components:{
    Platejka,
  },
  props: ['prop_plid_arr', 'prop_year', 'prop_month'],
  data: ()=>({
    total: 0,
  }),
  methods:{
    countTotal(){
      if(!this.$refs.platki || this.$refs.platki.length < 2 || this.prop_plid_arr.length < this.$refs.platki.length)
        return
      let amt = 0
      this.$refs.platki.forEach(r => {
        amt += +r.$refs.amount.innerText
      })
      this.total = amt
    }
  },
  computed:{
    monthName(){
      return getMonthName(this.prop_month)
    }
  },
}
</script>

<style scoped>
  h2{
    /*color: #aaa;*/
    /*color: #fc8553;*/
    /*color: #FFCC80;*/
    color: #B0BEC5;
    margin-bottom: 0;
  }
  hr{
    /*border: 2px #aaa solid;*/
    /*border: 2px #ffcab4 solid;*/
    /*border: 2px #FFCC80 solid;*/
    border: 2px #B0BEC5 solid;
    background: #B0BEC5;
  }
</style>