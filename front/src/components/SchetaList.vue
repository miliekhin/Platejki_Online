<template>
<div>
  <v-card width="400" class="mt-1 mb-3">
    <v-card-title>Лицевые счета</v-card-title>
    <v-card-subtitle>
      Выберите адрес и введите лицевой счет для каждой услуги ЖКХ чтобы они автоматически заполнялись при добавлении новой платежки.<br>
      Лицевой счёт можно найти в договоре на поставку коммунальной услуги или в счёте за услуги ЖКХ.<br>
      Вводите номера лицевого счета в точном соответствии с указанными в договоре.<br>
      Уберите услуги которые не предоставляются по указанному адресу или добавьте предоставляемые.
    </v-card-subtitle>
    <v-card-text>
      <v-select
                label="Адрес:"
                item-text="name"
                item-value="id"
                :items="$store.getters.getAddresses"
                v-model="selectedAddr"
                return-object
      >
      </v-select>
<!--      <div v-if="getScheta.length">-->
      <div v-if="selectedAddr.scheta.length">
      <v-simple-table dense>
        <template v-slot:default>
          <thead><tr><th class="px-0">Услуги</th><th class="pl-5">Лицевые счета</th></tr></thead>
          <tbody>
<!--            <tr v-for="(sch, i) in getScheta" :key="i">-->
            <tr v-for="(sch, i) in selectedAddr.scheta" :key="i">
              <td class="pa-0 text-no-wrap">{{ $store.getters.getUslugaNameById(sch.usluga.id) + ':' }}</td>
              <td class="pr-1 pl-0 d-flex">
<!--                              :clearable="i === edited_indx"-->
                <v-text-field dense hide-details
                              :solo="i === edited_indx"
                              :readonly="i !== edited_indx"
                              :class="i === edited_indx ? 'px-0 ml-4 align-self-end' : 'px-5'"
                              :id="'sch'+i"
                              v-model.trim="sch.schet"
                              @blur="onBlur(sch)"
                              @keydown.enter="onSave(sch, i)"
                              @keydown.esc="onRevert(sch)"
                              @click="onclickreadOnly(sch, i)"
                              autocomplete="off"
                ></v-text-field>
                <v-hover v-if="i !== edited_indx" v-slot:default="{ hover }">
                  <v-btn icon small tile title="Изменить" class="ml-1 align-self-center" elevation="2" @click="onEdit(sch, i)">
                    <v-icon :color="hover ? 'green' : 'default'">mdi-pencil</v-icon>
                  </v-btn>
                </v-hover>
                <v-btn v-else icon small tile
                       title="Сохранить"
                       class="ml-1 align-self-center"
                       elevation="2"
                       :disabled="false"
                       @mousedown="onSave(sch, i)"
                ><v-icon color="orange">mdi-content-save</v-icon></v-btn>
                <v-hover v-if="i !== edited_indx" v-slot:default="{ hover }">
                  <v-btn elevation="2" icon small tile
                         class="ml-1 align-self-center"
                         title="Удалить"
                         @click.stop="showRemoveDialog(sch)">
                    <v-icon :color="hover ? 'red' : 'default'">mdi-delete</v-icon>
                  </v-btn>
                </v-hover>
                <v-btn v-else icon small tile title="Отмена" class="ml-1 align-self-center" elevation="2" @mousedown="onRevert(sch)"
                ><v-icon>mdi-restore</v-icon></v-btn>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
      <v-divider></v-divider>
      </div>
      <div v-else class="text-subtitle-2">Нажмите "+ ДОБАВИТЬ", чтобы добавить новую услугу ЖКХ для данного адреса.</div>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn small text color="primary" @click="showAddDlg()"><v-icon left>mdi-plus</v-icon>Добавить</v-btn>
    </v-card-actions>
  </v-card>

  <v-dialog persistent v-model="show_new_srvc_dialog" width="400">
    <v-card>
      <v-card-title><span class="headline">Добавление услуги ЖКХ</span></v-card-title>
      <v-card-text>
        <p class="mb-1 pr-3">Введите название новой услуги или выберите из списка.</p>
        <v-combobox v-model.trim="serv_name_selected"
                    @keydown.esc="cancelAdd()"
                    @keyup.enter="addNew()"
                    :items="unused_services"
                    ref="serv_input"
                    id="serv_input"
                    label="Услуга ЖКХ"
                    height="25px"
                    clearable
                    :error-messages="new_serv_error"
                    autocomplete="off"
        ></v-combobox>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="cancelAdd()">Отмена</v-btn>
        <v-btn text color="primary" @click="addNew()">Продолжить</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="dialog_remove" persistent max-width="400">
    <v-card>
      <v-card-title class="headline text-break">Удалить услугу ЖКХ?</v-card-title>
      <v-card-text>Удаленная услуга больше не будет добавляться в новую платежку созданную для указанного адреса. Однако, это удаление никак не повлияет на данные в платежках созданных ранее.</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="default" text @click="cancelRemove()">Отмена</v-btn>
        <v-btn color="error" text @click="applyRemove()">Продолжить</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</div>
</template>

<script>
import {capitalizeFirstLetter} from "@/utils/utils"

export default {
name: "SchetaList",
  //props:['scheta_addr'],
  data: ()=>({
    old_val: '',
    dialog_remove: false,
    wait_to_remove: null,
    action_applied: true,
    edited_indx: -1,
    serv_name_selected: '',
    unused_services: [],
    selected_addr: null,
    show_new_srvc_dialog: false,
    new_serv_error: '',
    //new_item_edited: false,
  }),
  methods:{
    onclickreadOnly(sch, i){
      this.edited_indx = i
      this.old_val = sch.schet || ''
      this.action_applied = false
    },
    cancelAdd(){
      this.show_new_srvc_dialog = false
      this.serv_name_selected = ''
      this.new_serv_error = ''
    },
    onEdit(sch, i){
      this.onclickreadOnly(sch, i)
      document.getElementById('sch' + i).focus()
    },
    onSave( sch ){
      if (this.edited_indx === -1) return
      this.new_item_edited = false
      this.action_applied = true
      this.edited_indx = -1
      // console.log('onsave', this.old_val)
      if( this.old_val.toLowerCase() !== sch.schet.toLowerCase()) {
        this.$emit('crud-event-scheta', {
          cmnd: 'update',
          new_schet: sch.schet,
          // sch_indx: this.$store.getters.getAddrIndexByName(this.selected_addr.name),
          sch_indx: sch.id,
          // serv_indx: i,
        })
      }
    },
    applyRemove(){
      this.dialog_remove = false
      this.$emit('crud-event-scheta', {
        cmnd: 'delete',
        sch_obj: this.wait_to_remove,
        adr_id: this.selectedAddr.id,
      })
      this.wait_to_remove = null
    },
    showAddDlg(){
      this.show_new_srvc_dialog = true
      this.$nextTick(() => {
        document.getElementById('serv_input' ).focus()
      //   this.$refs.serv_input.focus()
      })
      this.unused_services = this.$store.getters.getUnusedServicesNames(this.selectedAddr.id)
    },
    showRemoveDialog(sch){
      this.wait_to_remove = sch
      this.dialog_remove = true
    },
    onRevert(sch){
      if ( this.edited_indx === -1 ) return
      this.action_applied = true
      sch.schet = this.old_val
      this.edited_indx = -1
    },
    onBlur(sch){
      if ( !sch.schet ){
        this.action_applied = true
        this.edited_indx = -1
        return
      }
      if ( !sch.schet.length) return
      if (!this.action_applied) {
        this.onRevert(sch)
        this.action_applied = true
      }
    },
    cancelRemove(){
      this.dialog_remove = false
      this.wait_to_remove = null
    },
    addNew() {
     let val = document.getElementById('serv_input').value
      if ( !val.length ){
        this.new_serv_error = 'Введите название услуги'
        return
      }
      if ( val.length > 24 ){
        this.new_serv_error = 'Название слишком длинное'
        return
      }
      document.getElementById('serv_input').value = ''
      this.unused_services = []
      this.serv_name_selected = ''
      this.show_new_srvc_dialog = false
      // if( this.$store.getters.getSchetaServNamesByAddrName(this.selected_addr.name).some(name => name.toLowerCase() === val.toLowerCase()) )
      if( this.$store.getters.getUslugiNamesFromScheta(this.selectedAddr.id).some(name => name.toLowerCase() === val.toLowerCase()) )
        return

      this.$emit('crud-event-scheta', {
        cmnd: 'create',
        // sch_indx: this.$store.getters.getAddrIndexByName(this.selected_addr.name),
        usluga_name: capitalizeFirstLetter(val),
        adr_id: this.selectedAddr.id,
      })
    }
  },
  computed:{
    // unusedServices(){
    //   return this.$store.getters.getUnusedServicesNames(this.$store.getters.getSchetaServNamesByAddrName(this.selectedAddr.name))
    // },
    selectedAddr:{
      get(){
        if( !this.selected_addr || !this.$store.getters.getAddresses.find(a => a.id === this.selected_addr.id)){
          return this.$store.getters.getAddresses[0]
        }
        return this.selected_addr
      },
      set(adr_obj){
        if( !this.$store.getters.getAddresses.find(a => a.id === adr_obj.id) )
          this.selected_addr = this.$store.getters.getAddresses[0]

        this.selected_addr = adr_obj
      }
    },
    // getScheta(){
    //   return this.$store.getters.getAllScheta[this.$store.getters.getAddrIndexByName(this.selectedAddr.name)]
    // },
  },
  created() {
    this.selected_addr = this.selectedAddr
  }
}
</script>

<style scoped>
  .v-divider{
    margin-top: -1px;
  }
  .padbot{
    padding-bottom: 3px;
  }
  /*.v-card-title{*/
  /*  overflow-wrap: break-word;*/
  /*}*/
</style>