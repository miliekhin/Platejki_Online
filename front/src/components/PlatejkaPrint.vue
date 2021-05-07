<template>
  <div>
    <div v-for="(pl, i) in plat_arr" :key="pl.id">
      <plat-print-single :prop_plat_obj="pl" :prop_prev_month="prevMonthStr" />
      <hr v-if="getPrintDouble" class="plat_divider">
      <plat-print-single v-if="getPrintDouble" :prop_plat_obj="pl" :prop_prev_month="prevMonthStr" />
      <hr v-if="!prop_is_last_plat || i !== plat_arr.length-1" class="plat_divider_bold">
    </div>
  </div>
</template>

<script>
import PlatPrintSingle from "@/components/PlatPrintSingle"
import {getPrevMonthName} from "@/utils/utils"
import {y_m_Obj} from '@/utils/utils'
import {mapGetters} from "vuex"

export default {
name: "PlatejkaPrint",
  components: {PlatPrintSingle},
  props:['prop_date', 'prop_is_last_plat', ],
  data: ()=>({
    plat_arr: [],
  }),
  computed: {
    ...mapGetters(['getPrintDouble']),
    prevMonthStr() {
      let ym = y_m_Obj(this.prop_date)
      let m = getPrevMonthName(ym.m)
      let y = (!ym.m ? ym.y - 1 : ym.y)
      return m + ' ' + y
    },
  },
  created() {
    //console.log(this.prop_is_last_plat)
    this.plat_arr = this.$store.getters.getPlatejkiByDate(this.prop_date)
  },
}
</script>

<style scoped>
  .plat_divider_bold, .plat_divider {
    margin: 30px 0;
    color: white;
    background-color: white;
    border: 0;
    height: 0;
  }
  .plat_divider_bold {
    border-top: 2px dashed black;
  }
  .plat_divider {
    border-top: 1px dashed gray;
  }
  .plat_divider_bold:after, .plat_divider:after {
    content: '\002702';
    display: inline-block;
    position: relative;
    top: -13px;
    left: 20px;
    padding: 0 2px;
    background: white;
    font-size: 15px;
  }
  .plat_divider_bold:after{
    color: black;
  }
  .plat_divider:after {
    color: gray;
  }

</style>