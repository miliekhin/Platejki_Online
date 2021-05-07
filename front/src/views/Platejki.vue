<template>
  <div>
<!--    <modal-box v-if="modal_data"-->
<!--               :modal_props="modal_data"-->
<!--               @close-modal="modal_data = null"-->
<!--               >-->
<!--    </modal-box>-->
<!--    <v-select v-model="current_year" :items="plat_years" label="Год оплат" filled></v-select>-->
    <flying-note v-if="$store.getters.getZomedkoData.show"></flying-note>
    <v-toolbar flat>
      <v-menu offset-y v-if="$store.getters.getYears.length > 1">
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs" v-on="on" text outlined x-large class="text-h4 font-weight-black">
            {{ currentYear }}
            <v-icon right> mdi-chevron-down </v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item-group v-model="currentYear" color="primary">
            <v-list-item v-for="y in $store.getters.getYears" :key="y" :value="y">{{ y }}</v-list-item>
          </v-list-item-group>
        </v-list>
      </v-menu>

      <v-btn v-else text outlined x-large class=" text-h4 font-weight-black">
        {{ currentYear }}
      </v-btn>
      <add-plat class="ml-4"></add-plat>
      <print-plat v-if="$store.getters.platejkiAll.length" class="ml-4"></print-plat>
<!--      <v-spacer/>-->
<!--      <div class="text">{{getUser.username}}</div>-->

    </v-toolbar>

    <div v-if="getPlatejkiForYear( currentYear ).length">
      <month-platejka
          v-for="(m, i) in getPlatejkiForYear( currentYear )"
          :key="m.pmnth"
          :class="i > 0 ? 'mt-5' : ''"
          :prop_plid_arr="m.pl_arr"
          :prop_year="currentYear"
          :prop_month="m.pmnth"
      />
<!--        <h2 class="text-right">{{ getMonthName(m.pmnth) }}, {{currentYear}}</h2>-->
<!--        <hr class="mb-4">-->
<!--        <platejka v-for="(plid, i) in m.pl_arr" :key="plid"-->
<!--                  :prop_plat_id="plid"-->
<!--                  :prop_month="m.pmnth"-->
<!--                  :prop_year="currentYear"-->
<!--                  :prop_is_last_plat="m.pl_arr.length-1 === i"-->
<!--        ></platejka>-->
      <hr>
      <div class="text-right">Всего оплачено за {{ currentYear }} год: {{ yearTotal }}</div>
    </div>
    <div v-else>
      <hr class="mb-4">
      <p class="text-center mt-16">Здесь пока нет ни одной пплатежки. <br>Чтобы добавить первую, нажмите "Добавить платежку".</p>
    </div>

  <v-dialog v-model="dialog_first_plat" persistent max-width="400">
    <v-card>
      <v-card-title class="headline text-break">Перед началом работы</v-card-title>
      <v-card-text class="text--primary">
        <div class="font-weight-bold mb-4">Поздравляем! Вы добавили первую платежку.</div>
        В ней уже есть список услуг ЖКХ которые обычно оплачиваются за квартиру.
        <br><br>
        Теперь нужно внести все данные как и в обычную платежку: лицевые счета, показания счетчика, сумму оплаты.
        <br><br>
        Нажмите на пустой ячейке чтобы начать вводить данные. Однако, примите во внимание, что некоторые ячейки нельзя изменить.
        <br><br>
        Красный пунктир в ячейке говорит о том что её необходимо заполнить или исправить значения в других ячейках.
        <br><br>
        Чтобы убрать ненужные, или добавить новые услуги ЖКХ, нажмите команду меню &laquo;Изменить платежку&raquo;.
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="dialog_first_plat = false">Продолжить</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
//  import MonthPlat from "@/components/MonthPlat";
//  import Platejka from "@/components/Platejka"
  import AddPlat from "@/components/modal/AddPlat"
  import FlyingNote from "@/components/FlyingNote";
  import MonthPlatejka from "@/components/MonthPlatejka";
  import PrintPlat from "@/components/modal/PrintPlat"
  export default {
    name: "Platejki",
    //mixins: [validationMixin],
    components:{
      //MonthPlat,
      //ModalBox,
      FlyingNote,
      AddPlat,
      PrintPlat,
      MonthPlatejka,
    },
    data: ()=>({
      current_year: 0,
      dialog_first_plat: false,
    }),
    methods:{
    },
    computed:{
      ...mapGetters(['getPlatejkiForYear', 'getYears', 'oplataZaGod', 'getUser' ]),
      // yearPlats(){
      //   return this.getPlatejkiForYear(this.current_year)
      // },
      // monthes(){
      //   let last_month = 12
      //   if( this.current_year === new Date().getFullYear() ){
      //     last_month = new Date().getMonth()+1
      //   }
      //   let mnths = []
      //   mnths = [...Array(last_month).keys()]
      //   return mnths.reverse()
      // },
      yearTotal(){
        return this.oplataZaGod(this.currentYear)
      },
      currentYear:{
        get(){
          if( !this.$store.getters.platejkiAll.length ){
            return new Date().getFullYear()
          }
          if( !this.getYears.includes(this.current_year)){
            return this.$store.getters.getLatestYear
          }
          return this.current_year
        },
        set(val){
          this.current_year = val
          //console.log('curr year: ', val)
        }
      },
    },
    // beforeCreate() {
    //   console.log('platejki', this.$store.getters.platejkiAll.length)
    // },
    created() {
      this.$store.subscribe(mutation =>{
            if( mutation.type === 'mut_firstPlatejkaCreated' ){
                this.dialog_first_plat = true
            }
            if( mutation.type === 'mut_savePlatejka' ){
                this.yearTotal
            }
        })
      },

  }
</script>

<style scoped>
</style>