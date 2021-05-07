<template>
  <div>
    <v-dialog persistent v-model="show_new_plat_dialog" width="400"
              @keydown.esc.prevent="cancelNewPlat()"
              @keydown.enter.prevent="addNewPlat()">
      <template v-slot:activator="{ on, attrs }">
        <v-btn elevation="2" color="primary" v-bind="attrs" v-on="on" @click="onShow()">
          <v-icon left>mdi-table-large-plus</v-icon>
          Добавить платежку
        </v-btn>
      </template>

      <v-card>
        <v-card-title>
          <span class="headline">Добавление платежки</span>
        </v-card-title>

        <v-card-text>
          <form @submit="addNewPlat()">
            <span class="body-2">Укажите месяц в который будет добавлена платежка:</span>
            <v-menu
              ref="clndr_menu"
              v-model="cal_menu"
              :close-on-content-click="true"
              :return-value.sync="cal_menu"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="290px"
              :disabled="is_server_response_waiting"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field :value="dateStr" single-line dense prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on"></v-text-field>
              </template>
              <v-date-picker v-model="cal_date" type="month"
                             :min="min_date"
                             :max="currentDateInput()"
                             no-title locale="ru"
                             :show-current="false"
                             @change="onDateSelect"
              >
<!--                <v-spacer></v-spacer>-->
<!--                <v-btn text @click="cal_menu = false">Отмена</v-btn>-->
<!--                <v-btn text color="primary" @click="onDateSelect()">OK</v-btn>-->
              </v-date-picker>
            </v-menu>

            <v-checkbox v-if="isCopyPossible"
                        v-model="is_copy_from_prev_month"
                        @click="onCopyPlatClick()"
                        :disabled="is_server_response_waiting"
                        label="Копировать платежки из предыдущего месяца"
            />

            <v-expand-transition>
              <div v-show="!is_copy_from_prev_month || !isCopyPossible">
                <div class="body-2 mt-2">Введите адрес, например: <br>
                  г. Зугрес, ул. Ленина, д. 12, кв. 34:</div>
                <v-combobox v-model.trim="addr"
                            :disabled="is_server_response_waiting"
                            :error-messages="addr_err_hint"
                            :items="$store.getters.unusedAddresses('')"
                            dense
                            prepend-icon="mdi-home-city-outline"
                            maxlength="64"
                            ref="addr_field"
                            id="addr_field_id"
                />

                <div class="body-2 mt-2">Введите фамилию и инициалы плательщика, например: Петров П. П.:</div>
                <v-combobox v-model.trim="payer"
                            :disabled="is_server_response_waiting"
                            :error-messages="payer_err_hint"
                            :items="$store.getters.getPayerNames"
                            dense
                            prepend-icon="mdi-account-outline"
                            maxlength="32"
                            ref="payer_field"
                            id="payer_field_id"
                />

                <div class="body-2 mt-2">Период оплаты:</div>
                <v-menu
                    ref="clndr_month_pay_menu"
                    v-model="cal_month_pay_menu"
                    :close-on-content-click="true"
                    :return-value.sync="cal_month_pay_menu"
                    transition="scale-transition"
                    offset-y
                    max-width="290px"
                    min-width="290px"
                    :disabled="is_server_response_waiting"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                        :value="payDateStr"
                        single-line
                        dense
                        prepend-icon="mdi-calendar"
                        readonly
                        v-bind="attrs" v-on="on"
                        hint="За какой месяц производится оплата"
                        persistent-hint
                    />
                  </template>
                  <v-date-picker v-model="cal_date_pay" type="month"
                                 :min="min_date"
                                 :max="cal_date"
                                 no-title locale="ru"
                                 :show-current="false"
                  />
                </v-menu>


                <div class="d-flex align-end" title="Добавить код ЕРЦ в платежку">
                  <v-checkbox
                      :disabled="is_server_response_waiting"
                      v-model="add_erc"
                      :label="add_erc ? 'Код ЕРЦ:' : 'Код ЕРЦ'"
                      @click="onErcCheckClick"
                  />
                  <v-combobox
                      v-if="add_erc"
                      v-model.trim="erc"
                      :disabled="is_server_response_waiting"
                      :items="$store.getters.getErcNames"
                      :error-messages="erc_err_hint"
                      dense
                      maxlength="32"
                      class="ml-2 mb-1"
                      ref="erc_field"
                  />
                </div>
              </div>
            </v-expand-transition>
          </form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              text
              @click="cancelNewPlat()"
              :disabled="is_server_response_waiting"
          >
            Отмена</v-btn>
          <v-btn
              text
              color="primary"
              @click="addNewPlat()"
              :loading="is_server_response_waiting"
          >
            Продолжить</v-btn>
        </v-card-actions>
      </v-card>

    </v-dialog>
  </div>
</template>

<script>
  import {mapGetters} from "vuex"
  import {getMonthName} from "@/utils/utils"

  export default {
  name: "AddPlat",
    data: ()=>({
      min_date: '2014-01',
      show_new_plat_dialog: false,
      cal_date: new Date().toISOString().substr(0, 7),
      cal_date_pay: '',
      cal_menu: false,
      cal_month_pay_menu: false,
      addr: '',
      payer: '',
      is_copy_from_prev_month: false,
      is_server_response_waiting: false,
      add_erc: false,
      erc: '',
      payer_err_hint: '',
      addr_err_hint: '',
      erc_err_hint: '',

    }),
    methods:{
      onDateSelect(){
        this.cal_date_pay = this.getPrevMonthDateStr(this.cal_date)
        if( !this.isCopyPossible )
          this.is_copy_from_prev_month = false
      },
      isFieldsValid() {
        if (!this.addr.length){
          this.addr_err_hint = 'Пожалуйста, введите адрес'
          this.$refs.addr_field.focus()
          return false
        }
        if (!this.payer.length){
          this.payer_err_hint = 'Пожалуйста, введите ФИО плательщика'
          this.$refs.payer_field.focus()
          return false
        }
        if ( this.add_erc && !this.erc.length){
          this.erc_err_hint = 'Введите код или снимите галочку'
          this.$refs.erc_field.focus()
          return false
        }
        return true
      },
      async addPlatByNewAddrs(){
        // console.log(this.payer)
        if ( !this.isFieldsValid() ){
          return false
        }

        if(this.$store.getters.isAddrUsedAtDate({addrs: this.addr, pdate: this.cal_date})){
          this.addr_err_hint = 'Платежка с таким адресом уже есть в указанном месяце'
          this.$refs.addr_field.focus()
          return false
        }
        this.is_server_response_waiting = true

        await this.$store.dispatch('act_addNewPlatejka', {
          adr_name: this.addr,
          payer_name: this.payer,
          pdate: this.cal_date,
          erc: this.erc,
          pay_period: this.cal_date_pay,
        })

        if( !this.$store.getters.isFirstPlatejkaCreated ){
          // Выводим инструкцию если была создана самая первая платежкка
          await this.$store.dispatch('act_firstPlatejkaCreated')
        }
        return true
      },
      // onAddrInput( val ){
      //   this.addr = val
      // },
      // onPayerInput( val ){
      //   this.payer = val
      // },
      // onErcInput( val ){
      //   this.erc = val
      // },
      async addPlatByCopy(){
        this.is_server_response_waiting = true
        return await this.$store.dispatch('act_copyPlat', this.cal_date)
      },
      async addNewPlat(){
        this.resetErrors()
        try {
          if (this.is_copy_from_prev_month) {
            await this.addPlatByCopy()
          }else{
            this.addr = document.getElementById('addr_field_id').value.trim()
            this.payer = document.getElementById('payer_field_id').value.trim()
            if( this.add_erc )
              this.erc = this.$refs.erc_field.value.trim()
            let res = await this.addPlatByNewAddrs()
            if (res === false)
              return
          }
        }
        catch (e){
          console.error(e)
        }
        this.is_server_response_waiting = false
        this.show_new_plat_dialog = false
      },
      cancelNewPlat(){
        this.show_new_plat_dialog = false
      },
      currentDateInput(){
        return new Date().toISOString().slice(0, 7)
      },
      onShow(){
        this.resetErrors()
        this.resetFields()
        this.initData()
      },
      resetErrors(){
        console.log('Reset errors')
        this.addr_err_hint = ''
        this.payer_err_hint = ''
        this.erc_err_hint = ''
      },
      resetFields(){
        this.addr = ''
        this.payer = ''
        this.erc = ''
        this.add_erc = false
      },
      initData(){
        this.resetFields()
        this.cal_date = new Date().toISOString().substr(0, 7)
        this.is_copy_from_prev_month = false
      },
      onCopyPlatClick(){
        // this.resetFields()
        // this.resetErrors()
      },
      onErcCheckClick(){
        this.$nextTick(() => {
          this.erc_err_hint = ''
          if( this.add_erc )
            this.$refs.erc_field.focus()
        })
      },
      getDateStr(cal_str){
        let mnm = getMonthName( +cal_str.substr(5, 2)-1 )
        let y = cal_str.substr(0, 4)
        return `${mnm} ${y}`
      },
      getPrevMonthDateStr(date_str){
        let dt = new Date()
        dt.setDate(1)
        let y = parseInt(date_str.substr(0, 4))
        let m = parseInt(date_str.substr(5, 2))-2
        // console.log(dt.toISOString(), date_str, m)
        if( m < 0) {
          dt.setMonth(11)
          dt.setFullYear(y-1)
          // console.log('new date:', dt.toISOString())
        } else {
          dt.setMonth(m)
          dt.setFullYear(y)
        }
        return dt.toISOString().substr(0, 7)
      },
    },
    computed:{
      ...mapGetters(['getPrevMonthPlatsCanBeAdded', 'getLatestPlatejki']),
      isCopyPossible(){
        return this.getPrevMonthPlatsCanBeAdded(this.cal_date).length
      },
      dateStr(){
        return this.getDateStr(this.cal_date)
      },
      payDateStr(){
        return 'за ' + this.getDateStr(this.cal_date_pay)
      },
    },
    mounted() {
    },
    created() {
      this.cal_date_pay = this.getPrevMonthDateStr(this.cal_date)
    }
  }
</script>

<style scoped>

</style>