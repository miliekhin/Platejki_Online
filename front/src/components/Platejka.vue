<template>
    <div class="plat_wrap d-inline-block px-8" :class="prop_is_last_plat ? 'pb-8' : ''">
      <div class="d-flex">
        <div class="flex-grow-1">
          <div><span class="font-weight-medium">Плательщик:</span> {{ getPayerName(prop_plat_id) }}</div>
          <div v-if="getErcCode(prop_plat_id)"><span class="font-weight-medium">Код ЕРЦ:</span> {{ getErcCode(prop_plat_id) }}</div>
          <div v-if="payed_date"><span class="font-weight-medium">Оплачено:</span> {{ payedDate }}</div>
          <div><span class="font-weight-medium">Период оплаты: </span>{{ payPeriod }}</div>
          <div><span class="font-weight-medium">Адрес:</span> {{ plat_address }}</div>
        </div>

        <div v-if="!payed_date" class="align-self-end pb-2">
          <v-menu offset-x max-width="300px" transition="slide-y-transition" left>
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="light-green darken-1 white--text" small v-bind="attrs" v-on="on" @click.prevent="onMenuClick">
                меню
                <v-icon right>mdi-menu</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item-group v-model="menu_selected">
                <v-hover v-slot="{ hover }">
                  <v-list-item @click="show_edit_plat_dialog = true">
                    <v-list-item-icon class="mr-4">
                      <v-icon :color="hover ? 'success' : ''">mdi-format-list-bulleted-type</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content :class="hover ? 'success--text' : ''">
                      <v-list-item-title>Изменить список услуг</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-hover>
                <v-hover v-slot="{ hover }">
                  <v-list-item @click="show_edit_recvizits_dialog = true">
                    <v-list-item-icon class="mr-4">
                      <v-icon :color="hover ? 'purple' : ''">mdi-card-account-details-outline</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content :class="hover ? 'purple--text' : ''">
                      <v-list-item-title>Изменить реквизиты</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-hover>
                <v-hover v-slot="{ hover }">
                  <v-list-item @click="removePlt">
                    <v-list-item-icon class="mr-4">
                      <v-icon :color="hover ? 'red' : ''">mdi-table-large-remove</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content :class="hover ? 'red--text' : ''">
                      <v-list-item-title>Убрать платежку</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-hover>
                <v-hover v-slot="{ hover }">
                  <v-list-item @click="setPayed">
                    <v-list-item-icon class="mr-4">
                      <v-icon :color="hover ? 'blue' : ''">mdi-check-decagram</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content :class="hover ? 'blue--text' : ''">
                      <v-list-item-title>Пометить как &laquo;Оплачено&raquo;</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-hover>
              </v-list-item-group>
            </v-list>
          </v-menu>
        </div>
        <div v-else class="align-self-end pb-2">
          <v-btn small class="blue lighten-4 black--text" @click="show_confirm_edit_plat=true">
            редактировать
            <v-icon right>mdi-playlist-edit</v-icon>
          </v-btn>
        </div>
      </div>

      <table :id="'plat_tbl'+prop_plat_id">
        <tr>
            <th width="200" class="algn-left font-weight-medium" rowspan="2">Услуги ЖКХ</th>
            <th width="150" rowspan="2" class="font-weight-medium">Лицевой счет</th>
            <th colspan="2" class="font-weight-medium">Показания счетчика</th>
            <th width="110" rowspan="2" class="font-weight-medium">Объем</th>
            <th width="110" rowspan="2" class="font-weight-medium">Сумма</th>
        </tr>
        <tr>
            <th class="font-weight-medium">Предыдущее</th>
            <th class="font-weight-medium">Текущее</th>
        </tr>
        <tr v-for="stroka in stroki" :key="stroka.id">
            <td class="algn-left text-truncate">{{stroka.srvc_name}}</td>
            <td>
              <div class="text-truncate" v-if="payed_date">{{stroka.schet}}</div>
              <input v-else type="text" v-model.trim="stroka.schet"
                       @keyup.enter="setNextFocus($event.target)"
                       @keydown.down="setFocusDown($event.target)"
                       @keydown.up="setFocusUp($event.target)"
                       @keydown.esc="$event.target.blur()"
                       :class="(stroka.schet && stroka.schet.length) ? '' : 'input_empty'"
                       maxlength="16"
            ></td>
            <td>
              <div class="payed_cell text-truncate" v-if="payed_date">{{stroka.counter_prev}}</div>
<!--              @input="onCounterPrevEdit(stroka)"-->
              <input v-else type="text"
                     :value="stroka.counter_prev"
                     @input="onCounterInput(stroka, $event.target, true)"
                     @keyup.enter="setNextFocus($event.target)"
                     @keydown.down.prevent="setFocusDown($event.target)"
                     @keydown.up.prevent="setFocusUp($event.target)"
                     @keydown.esc="$event.target.blur()"
                     maxlength="8"
            ></td>
            <td>
              <div class="payed_cell text-truncate" v-if="payed_date">{{stroka.counter_curr}}</div>
              <input v-else type="text"
                     :value="stroka.counter_curr"
                     @input="onCounterInput(stroka, $event.target, false)"
                     @keyup.enter="setNextFocus($event.target)"
                     @keydown.down.prevent="setFocusDown($event.target)"
                     @keydown.up.prevent="setFocusUp($event.target)"
                     @keydown.esc="$event.target.blur()"
                     maxlength="8"
                     :class="(stroka.counter_prev > 0 && !stroka.counter_curr) ? 'input_empty' : ''"
            ></td>
            <td class="text-truncate">
              <div
                  :class="(stroka.counter_curr > 0 && (stroka.counter_curr - stroka.counter_prev) < 0) ? 'input_empty' : ''"
              >
              {{ stroka.counter_curr > 0 ? +(stroka.counter_curr - stroka.counter_prev).toFixed(3) : '' }}
                </div>
            </td>
            <td>
              <div v-if="payed_date" class="payed_cell">{{stroka.pay_amount}}</div>
<!--              <input v-else type="number" v-model.number.trim="stroka.pay_amount"-->
              <input v-else type="text"
                     :value="stroka.pay_amount"
                     @input="onPayInput(stroka, $event.target)"
                     @keyup.enter="setNextFocus($event.target)"
                     @keydown.down.prevent="setFocusDown($event.target)"
                     @keydown.up.prevent="setFocusUp($event.target)"
                     @keydown.esc="$event.target.blur()"
                     maxlength="8"
                     :class="isInputEmpty(stroka.pay_amount)"
            ></td>
        </tr>
        <tr>
          <td class="algn-right" colspan="5">Итого:</td>
          <td ref="amount">{{getAmount}}</td>
        </tr>
      </table>
      <div class="shtamp_wrapper">
        <img v-if="payed_date"
             src="../assets/oplacheno-300x220.png"
             alt="Штамп оплаты"
             width="200"
             class="shtamp"
             :id="'shtamp'+prop_plat_id"
             draggable="false"
        >
      </div>
<!--      <div v-if="payed_date" class="text-right">-->
<!--        <v-icon size="40" color="success">mdi-check-decagram</v-icon>-->
<!--        Оплачено {{ payedDate }}-->
<!--      </div>-->

      <hr v-if="!prop_is_last_plat" class="plat_divider">

  <v-dialog v-model="dialog_remove_plat" persistent max-width="400">
    <v-card>
      <v-card-title class="headline text-break">Удаление платежки</v-card-title>
      <v-card-text class="text--primary">Вы действительно хотите удалить платежку?</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="default" text @click="cancelRemove()">Отмена</v-btn>
        <v-btn color="error" text @click="applyRemove()">Продолжить</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="dialog_payed" persistent max-width="400">
    <v-card>
      <v-card-title class="headline text-break">Найдены ошибки</v-card-title>
      <v-card-text class="text--primary">
        Пожалуйста, проверьте все значения и поля подчеркнутые красным пунктиром,
        чтобы в дальнейшем у вас не возникло трудностей с оплатой платежки.<br><br>
        Вы можете удалить ненужные услуги выбрав в меню команду &laquo;Изменить платежку&raquo;<br><br>
        Рекомендуется ставить отметку &laquo;ОПЛАЧЕНО&raquo; в день оплаты платежки.<br><br>
        Нажмите &laquo;Отмена&raquo; чтобы вернуться и заполнить поля, или &laquo;Продолжить&raquo; чтобы игнорировать это предупреждение.<br>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="default" text @click="dialog_payed = false">Отмена</v-btn>
        <v-btn color="error" text @click="setPayed($event, true)">Продолжить</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

      <yes-no-dlg
          v-if="show_confirm_edit_plat"
          :prop_head_txt = "'Подтвердите действие'"
          :prop_body_txt = "'Текущая дата оплаты будет сброшена!<br>Вы действительно хотите редактировать уже оплаченную платежку?'"
          :prop_confirm_event = "'edit_payed_plat_confirm'"
          :prop_show="true"
          @edit_payed_plat_confirm="onConfirmPayedPlat()"
          @yes_no_rejected="show_confirm_edit_plat=false"
      />

      <edit-plat v-if="show_edit_plat_dialog"
                 :prop_plat_id="prop_plat_id"
                 @services-list-updated="initPlatejka()"
                 @services-list-canceled="show_edit_plat_dialog = false"
      />
      <edit-recvizits v-if="show_edit_recvizits_dialog"
                      :prop_plat_id="prop_plat_id"
                      @edit_recvizit_cancel="show_edit_recvizits_dialog = false"
                      @edit_recvizit_apply="onApplyRecvizitEdit()"
      />

    </div>
</template>

<script>
    import EditPlat from "@/components/modal/EditPlat"
    import EditRecvizits from "@/components/modal/EditRecvizits"
    import YesNoDlg from "@/components/modal/YesNo"
    import {getMonthNameWhen, getMonthYearStr} from "@/utils/utils"
    // import {getPrevMonthName} from "@/utils/utils"
    import _ from 'lodash'
    import {mapActions, mapGetters} from 'vuex'
    //import {capitalizeFirstLetter} from "@/utils/utils"
    // const random_str = '#*~2*+=g6-3'
    const valid = /^[0-9]*\.?[0-9]*$/
    export default {
      name: "Platejka",
      components:{EditRecvizits, EditPlat, YesNoDlg,},
      props:['prop_plat_id', 'prop_month', 'prop_year', 'prop_is_last_plat', ],
      data: ()=>({
        show_confirm_edit_plat: false,
        stroki: [],
        payers: [],
        unwatch: undefined,
        // new_payer_name: random_str,
        // new_address: random_str,
        modal_data: null,
        plat_address: '',
        dialog_remove_plat: false,
        dialog_payed: false,
        show_edit_plat_dialog: false,
        show_edit_recvizits_dialog: false,
        menu_selected: -1,
        payed_date: '',
        debouncedSave: function (){},
      }),
      methods:{
        ...mapActions(['act_savePlatejka']),
        // onCounterPrevEdit(stroka){
        //   const save_stroka = {
        //     id: stroka.id,
        //     counter_prev: stroka.counter_prev,
        //   }
        //   this.debouncedSaveStroka(save_stroka)
        // },
        // saveStroka(str_obj){
        //   console.log(str_obj)
        // },
        isInputEmpty(pay_amount){
          if ( pay_amount > 0 )
            return ''

          if ( pay_amount !== null && pay_amount.toString().length )
            return ''
// // stroka.pay_amount > 0 ? '' : 'input_empty'
          return 'input_empty'
        },
        onCounterInput(stroka, target, is_counter_prev){
          let cursor_pos = target.selectionStart
          let new_val = target.value.replace(',', '.')
          if (!valid.test( new_val )) {
            target.value = is_counter_prev ? stroka.counter_prev : stroka.counter_curr
            cursor_pos--
          }
          else {
            if(is_counter_prev)
              stroka.counter_prev = new_val
            else
              stroka.counter_curr = new_val
          }
          this.$nextTick(() => {
            target.setSelectionRange(cursor_pos, cursor_pos)
          })
        },
        onPayInput(stroka, target){
          // const valid = /^\d*\.?(?:\d{1,2})?$/
          let cursor_pos = target.selectionStart
          // console.log('Cursor pos:', cursor_pos)
          let new_val = target.value.replace(',', '.')
          if (!valid.test( new_val )) {
            target.value = stroka.pay_amount
            cursor_pos--
          }
          else {
            // stroka.pay_amount = parseFloat(new_val).toFixed(2)
            stroka.pay_amount = new_val
          }
          this.$nextTick(() => {
            target.setSelectionRange(cursor_pos, cursor_pos)
          })
        },
        onMenuClick(){
          this.menu_selected = -1
        },
        applyRemove(){
          this.dialog_remove_plat = false
          this.$store.dispatch('platejkaRemoved', this.prop_plat_id )
        },
        cancelRemove(){
          this.dialog_remove_plat = false
        },
        setFocusDown(el){
          let cell_i = el.closest('td').cellIndex
          let row_i = el.closest('tr').rowIndex
          let tbl = document.getElementById("plat_tbl"+this.prop_plat_id)
          let el_cell = tbl.rows[row_i+1].cells[cell_i]
          if( !el_cell ) return
          let inp_el = el_cell.firstChild
          if( inp_el.nodeName.toLowerCase() === 'input' ) {
            inp_el.focus()
          }
        },
        setFocusUp(el){
          let cell_i = el.closest('td').cellIndex
          let row_i = el.closest('tr').rowIndex
          let tbl = document.getElementById("plat_tbl"+this.prop_plat_id)
          let el_cell = tbl.rows[row_i-1].cells[cell_i]
          if( !el_cell ) return
          let inp_el = el_cell.firstChild
          if( inp_el.nodeName.toLowerCase() === 'input' ) {
            inp_el.focus()
          }
        },
        setNextFocus(el){
          let cell_i = el.closest('td').cellIndex
          let row_i = el.closest('tr').rowIndex
          let tbl = document.getElementById("plat_tbl"+this.prop_plat_id)
          let inp_el = tbl.rows[row_i+1].cells[cell_i]
          if( !inp_el ) {
            el.blur()
            return
          }
          inp_el = inp_el.firstChild
          if( inp_el.nodeName.toLowerCase() === 'input' ) {
            inp_el.focus()
          }else{
            el.blur()
          }
        },
        // updateServList(){
        //   this.initPlatejka()
        // },
        // cancelPayerInput(){
        //   //console.log('escaped')
        //   this.new_payer_name = random_str
        //   this.$refs.payer_input.blur()
        // },
        // applyPayerInput(){
        //   if ( this.new_payer_name === random_str ){
        //     this.$refs.payer_input.blur()
        //     return
        //   }
        //   let new_payer_name = this.new_payer_name
        //   if(new_payer_name.length < 4 || new_payer_name.length > 32 ) {
        //     this.new_payer_name = random_str
        //     this.$refs.payer_input.blur()
        //     return
        //   }
        //   this.$store.dispatch('act_changePlatPayer', {
        //     plat_id: this.prop_plat_id,
        //     payer_name: capitalizeFirstLetter(new_payer_name)
        //   })
        //   this.new_payer_name = random_str
        //   this.$refs.payer_input.blur()
        // },
        onEditPlatejka(){
          const obj = {
            // addr_indx: this.$store.getters.getAddrIndexByName(this.plat_address),
            plat_id: this.prop_plat_id,
            stroki: this.stroki
          }
          this.act_savePlatejka(obj)
          // console.log('Debounced platejka save', obj)
          this.resetWatcher()
        },
        dataWatcher(){
          this.debouncedSave()
        },
        removePlt(){
          this.dialog_remove_plat = true
        },
        onApplyRecvizitEdit(){
          this.show_edit_recvizits_dialog = false
        },
        resetWatcher(){
          if(this.unwatch){
            this.unwatch()
          }
          this.stroki = _.cloneDeep(this.$store.getters.getStrokiOfPlat(this.prop_plat_id))
          // console.log('Updated stroki:', this.stroki)
          this.unwatch = this.$watch('stroki', this.dataWatcher, {deep: true})
        },
        initPlatejka(){
          this.show_edit_plat_dialog = false
          this.resetWatcher()
        },
        setPayed(evt,  pass_errors_check = false){
          if( document.getElementById("plat_tbl"+this.prop_plat_id)
              .getElementsByClassName('input_empty').length && !pass_errors_check ){
            this.dialog_payed = true
            return
          }
          this.dialog_payed = false
          let dt = new Date()
          this.payed_date = `${dt.getFullYear()}-${dt.getMonth()+1}-${dt.getDate()}`
          this.$nextTick(() => {
            this.setShtampPosition()
          })
          this.$store.dispatch('act_setPayedDate', {plat_id: this.prop_plat_id, payed_date: this.payed_date} )
        },
        onConfirmPayedPlat(){
          this.show_confirm_edit_plat = false
          this.payed_date = ''
          this.$store.dispatch('act_setPayedDate', {plat_id: this.prop_plat_id, payed_date: this.payed_date} )
        },
        setShtampPosition(){
          let el_shtamp = document.getElementById('shtamp' + this.prop_plat_id)
          el_shtamp.style.top = (Math.floor(Math.random() * (+(-130) + 1 - +(-150))) + +(-150)).toString() + 'px'
          el_shtamp.style.left = (Math.floor(Math.random() * (+550 + 1 - +400)) + +400).toString() + 'px'
          el_shtamp.style.transform = 'rotate(' + (Math.floor(Math.random() * (+40 + 1 - +10)) + +10).toString() +'deg)'
        }
      },
        computed: {
            ...mapGetters(['getPayerName', 'getErcCode', 'getPayPeriod']),
            payPeriod(){
              // let m = getPrevMonthName(this.prop_month)
              // let y = (!this.prop_month ? this.prop_year - 1 : this.prop_year)
              // return m+' '+y
              return getMonthYearStr( this.getPayPeriod(this.prop_plat_id), true)
            },
            payedDate(){
              if( !this.payed_date ) return ''
              let dt = new Date(this.payed_date)
              return `${dt.getDate()} ${getMonthNameWhen(dt.getMonth())} ${dt.getFullYear()}`
            },
            getAmount(){
              let amt = 0;
              this.stroki.forEach(stroka => {
                amt += +stroka.pay_amount || 0
              })
              this.$nextTick(()=>{
                this.$emit('amount-updated')
              })
              return +amt.toFixed(2)
            },
            // payerInputSize(){
            //   return this.payerName.length
            // },
            // addrName:{
            //   get() {
            //     if ( this.new_address === random_str ) {
            //       return this.$store.getters.getAddrName( this.prop_plat_id )
            //     }
            //     return this.new_address
            //   },
            //   set(new_addr) {
            //     this.new_address = new_addr
            //   }
            // },
            // payerName:{
            //   get() {
            //     if ( this.new_payer_name === random_str ) {
            //       return this.getPayerName(this.prop_plat_id)
            //     }
            //     return this.new_payer_name
            //   },
            //   set(new_payer_name){
            //     this.new_payer_name = new_payer_name
            //     // console.log(new_payer_name)
            //   }
            // },

        },
        // watch:{
        //   prop_addr_id: function (){
        //     this.initPlatejka()
        //   }
        // },
      created() {
        this.initPlatejka()
        this.debouncedSave = _.debounce(this.onEditPlatejka, 2000)
        //this.debouncedSaveStroka = _.debounce(this.saveStroka, 5000)
        this.plat_address = this.$store.getters.getAddrName( this.prop_plat_id )
        this.payed_date = this.$store.getters.getPlatPayedDate( this.prop_plat_id )
      },
      mounted() {
          // this.unwatch = this.$watch('stroki', this.dataWatcher, {deep: true})
          if( this.payed_date )
            this.setShtampPosition()
        },
    }
</script>

<style scoped>
    .plat_wrap{
      overflow: hidden;
    }
    table{
      table-layout: fixed;
      border-collapse: collapse;
      width: 830px;
    }
    th, td{
        border: solid 1px;
        padding: 3px 15px;
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
        font-weight: bold;
    }
    input{
        width: 100%;
        font-size: inherit;
        color: inherit;
        padding: 0;
        margin: 0;
        text-align: center;
        border-bottom: 2px solid transparent;
    }
    .inputs{
      width: auto;
      height: 20px;
      text-align: left;
      padding: 0 5px;
    }
    .input_empty{
      border-bottom: 2px dashed red;
    }

/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
}

    .plat_divider {
      margin: 35px 0 23px 0;
        color: white;
        background-color: white;
        border: 0;
        height: 0;
        border-top: 1px dashed gray;
    }
    .plat_divider:after {
        content: '\002702';
        display: inline-block;
        position: relative;
        top: -13px;
        left: 20px;
        padding: 0 2px;
        background: white;
        color: gray;
        font-size: 15px;
    }
    .payed_cell{
      height: 25px;
    }
    .shtamp_wrapper{
      height: 0;
    }
    .shtamp{
      position: relative;
      top: -130px;
      left: 550px;
      transform: rotate(0deg);
      opacity: .5;
    }
</style>