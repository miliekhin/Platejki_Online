<template>
<div>
  <v-dialog persistent v-model="show_print_plat_dialog" width="400"
          @keydown.esc.prevent="cancelPrint()"
          @keydown.enter.prevent="printPlat()">
    <template v-slot:activator="{ on, attrs }">
      <v-btn elevation="2" v-bind="attrs" v-on="on" @click="onOpen()">
        <v-icon left>mdi-printer</v-icon>
        Печать
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class="headline">Печать платежек</span>
      </v-card-title>

      <v-card-text>
        <p class="body-1">Выберите месяцы платежки из которых нужно распечатать:</p>
        <v-row justify="center" class="mb-5">
          <v-date-picker
              elevation="2"
              multiple
              v-model="cal_dates"
              type="month"
              locale="ru"
              no-title
              :allowed-dates="allowedDates"
              min="2014-01"
              :max="currentDateInput()"
              :show-current="latest_plat_date"
              :key="cal_key"
          ></v-date-picker>
        </v-row>
        <v-checkbox
            v-model="double_plat"
            label="В двух экзеплярах"
            hide-details
        />

      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="cancelPrint()">Отмена</v-btn>
        <v-btn text color="primary" :disabled="!cal_dates.length" @click="printPlat()">Продолжить</v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>
</div>
</template>

<script>
import {mapGetters} from "vuex"

export default {
  name: "PrintPlat",
    data: ()=>({
      show_print_plat_dialog: false,
      cal_dates: [],
      allowed_dates: [],
      latest_plat_date: '',
      cal_key: 0,
      double_plat: false,
    }),
  methods:{
    ...mapGetters(['getAllPlatDates', 'getPrintDouble']),
    currentDateInput(){
      return new Date().toISOString().slice(0, 7)
    },
    cancelPrint(){
      this.show_print_plat_dialog = false
    },
    printPlat(){
      this.show_print_plat_dialog = false
      this.$store.commit('mut_printDouble', this.double_plat )
      this.$store.commit('setPrintMode', true)
      this.$router.push({name: 'Printer', params: {prop_dates: this.cal_dates}})
    },
    allowedDates(val){
      return this.allowed_dates.indexOf(val) !== -1
    },
    onOpen(){
      this.cal_key += 1
      this.allowed_dates = this.getAllPlatDates().sort()
      this.latest_plat_date = this.allowed_dates[this.allowed_dates.length-1]
      this.cal_dates = []
      this.cal_dates.push(this.latest_plat_date)
      this.double_plat = this.getPrintDouble()
      //console.log(this.allowed_dates)
    },
  },
}
</script>

<style scoped>

</style>