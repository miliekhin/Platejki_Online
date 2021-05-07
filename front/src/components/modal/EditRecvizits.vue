<template>
<span>
    <v-dialog persistent v-model="show_edit_recvizits_dialog" width="400"
              @keydown.esc.prevent="cancelEdit"
              @keyup.enter.prevent="onApply"
    >
      <v-card>
        <v-card-title>
          <span class="headline">Редактор реквизитов</span>
        </v-card-title>

        <v-card-text>
<!--          <div class="body-1">Введите название услуги и нажмите "Добавить":</div>-->
<!--Чтобы очищалось поле после клика по Добавить добавлена строка @input.native="serv_selected = $event.target.value"-->
          <v-combobox
              :items="this.$store.getters.getPayerNames"
              v-model="curr_payer"
              maxlength="32"
              label="Плательщик"
              :error-messages="err_hint_payer"
              ref="payer_field"
              :disabled="is_server_response_waiting"
              prepend-icon="mdi-account-outline"
              id="payer_field_id"
          />

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
                  :value="getDateStr"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs" v-on="on"
                  label="Период оплаты:"
              />
            </template>
            <v-date-picker v-model="cal_date_pay_period"
                           type="month"
                           :min="min_date"
                           :max="cal_date_max_pay_period"
                           no-title locale="ru"
                           :show-current="false"
            />
          </v-menu>

          <div class="d-flex align-end">
            <v-checkbox
                v-model="add_erc"
                :label="add_erc ? 'Код ЕРЦ:' : 'Код ЕРЦ'"
                @click="onErcCheckClick"
                :disabled="is_server_response_waiting"
            />
            <v-combobox
                v-if="add_erc"
                :items="this.$store.getters.getErcNames"
                v-model="curr_erc"
                dense
                maxlength="32"
                class="ml-2 mb-1"
                ref="erc_field"
                :error-messages="err_hint_erc"
                :disabled="is_server_response_waiting"
                id="erc_field_id"
            ></v-combobox>
          </div>

        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              :disabled="is_server_response_waiting"
              text
              @click="cancelEdit"
          >
            Отмена</v-btn>
          <v-btn
              text
              color="primary"
              @click="onApply"
              :loading="is_server_response_waiting"
          >
            Применить</v-btn>
        </v-card-actions>
      </v-card>

    </v-dialog>
</span>
</template>

<script>
import {capitalizeFirstLetter} from "@/utils/utils"
import {getMonthYearStr} from "@/utils/utils"
export default {
  name: "EditRecvizits",
  props:['prop_plat_id', ],
  data: ()=>({
    show_edit_recvizits_dialog: false,
    add_erc: false,
    curr_payer: '',
    curr_erc: '',
    old_payer: '',
    old_erc: '',
    err_hint_payer: '',
    err_hint_erc: '',
    is_server_response_waiting: false,
    cal_month_pay_menu: false,
    min_date: '2014-01',
    cal_date_pay_period: '',
    old_cal_date_pay_period: '',
    cal_date_max_pay_period: '',
  }),
  methods:{
    // onPayerInput( val ){
    //   this.curr_payer = val
    // },
    // onErcInput( val ){
    //   this.curr_erc = val
    // },
    resetErrors(){
      this.err_hint_payer = ''
      this.err_hint_erc = ''
    },
    isFieldsValid() {
      if ( !this.curr_payer.length ){
        this.err_hint_payer = 'Поле не должно быть пустым'
        this.$refs.payer_field.focus()
        return false
      }
      if ( this.add_erc && !this.curr_erc.length){
        this.err_hint_erc = 'Введите код или снимите галочку'
        this.$refs.erc_field.focus()
        return false
      }

      return true
    },
    cancelEdit(){
      this.show_edit_recvizits_dialog = false
      this.$emit('edit_recvizit_cancel')
    },
    async onApply(){
      if ( this.add_erc )
        this.curr_erc = document.getElementById('erc_field_id').value.trim()
      this.curr_payer = document.getElementById('payer_field_id').value.trim() || this.$refs.payer_field.value.trim()
      console.log('this.curr_payer', this.$refs.payer_field.value.trim())
      if ( this.add_erc && !this.curr_erc.length){
        this.isFieldsValid()
        return
      }

      if (this.old_payer === this.curr_payer && this.old_erc === this.curr_erc && this.old_cal_date_pay_period === this.cal_date_pay_period){
        console.log('All recvizites are equal')
        this.$emit('edit_recvizit_cancel')
        return
      }
      this.resetErrors()
      if( !this.isFieldsValid() )
        return

      this.is_server_response_waiting = true
      let obj = {
        plat_id: this.prop_plat_id,
        payer: (this.old_payer !== this.curr_payer ? capitalizeFirstLetter(this.curr_payer) : null),
        erc: (this.old_erc !== this.curr_erc ? this.curr_erc : null),
        pay_period: (this.old_cal_date_pay_period !== this.cal_date_pay_period ? this.cal_date_pay_period : null),
      }
      await this.$store.dispatch('act_UpdatePlatRecvizits', obj)
      this.is_server_response_waiting = false
      this.$emit('edit_recvizit_apply')
    },
    onErcCheckClick(){
      this.$nextTick(() => {
        if ( this.add_erc )
          this.$refs.erc_field.focus()
        else
          this.curr_erc = ''
      })
    },

  },
  computed:{
    getDateStr(){
      return getMonthYearStr(this.cal_date_pay_period, true)
    },
  },
  created() {
    this.show_edit_recvizits_dialog = true
    this.old_payer = this.curr_payer = this.$store.getters.getPayerName(this.prop_plat_id)
    this.old_erc = this.curr_erc = this.$store.getters.getErcCode(this.prop_plat_id)
    this.old_cal_date_pay_period = this.cal_date_pay_period = this.$store.getters.getPayPeriod(this.prop_plat_id)
    this.cal_date_max_pay_period = this.$store.getters.getMaxPayPeriod(this.prop_plat_id)
    // this.old_cal_date_pay_period = this.cal_date_pay_period = new Date().toISOString().substr(0, 7)
    if( this.curr_erc && this.curr_erc.length )
      this.add_erc = true
  },
}
</script>

<style scoped>

</style>