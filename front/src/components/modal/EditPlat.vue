<template>
<span>
    <v-dialog persistent v-model="show_edit_plat_dialog" width="400"
              @keydown.esc.prevent="cancelEditPlat()">
<!--      <template v-slot:activator="{ on, attrs }">-->
<!--        <v-btn elevation="2" small v-bind="attrs" v-on="on" @click="onShow()">-->
<!--          <v-icon left>mdi-format-list-bulleted-type</v-icon>-->
<!--          Изменить услуги-->
<!--        </v-btn>-->
<!--      </template>-->

      <v-card>
        <v-card-title>
          <span class="headline">Редактор услуг платежки</span>
        </v-card-title>

        <v-card-text>
          <span class="body-1">Выберите услуги которые нужно убрать из платежки и нажмите "Убрать":</span>
          <v-list max-height="200" class="overflow-y-auto" id="serv_select" :disabled="is_server_response_waiting">
            <v-list-item-group multiple v-model="selected_services" >
              <template v-for="(item, i) in plat_services">
                <v-list-item class="pl-1" :key="`item-${i}`" :value="item" active-class="blue--text text--accent-4">
                  <template v-slot:default="{ active }">
                    <v-list-item-content>
                      <v-list-item-title v-text="item"></v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-checkbox :input-value="active" color="blue accent-4"></v-checkbox>
                    </v-list-item-action>
                  </template>
                </v-list-item>
              </template>
            </v-list-item-group>
          </v-list>
          <v-card-actions flat class="pr-0 mb-2">
            <div v-if="!plat_services.length" class="red--text">Добавьте хотя бы одну услугу или нажмите "Отмена"</div>
            <v-spacer></v-spacer>
            <v-btn elevation="2" small @click="onRemove()" :disabled="!plat_services.length || is_server_response_waiting">
              <v-icon left>mdi-playlist-remove</v-icon>
              Убрать
            </v-btn>
          </v-card-actions>

          <div class="body-1">Введите название услуги и нажмите "Добавить":</div>
<!--Чтобы очищалось поле после клика по Добавить добавлена строка @input.native="serv_selected = $event.target.value"-->
          <v-combobox v-model.trim="serv_selected"
                      @keyup.enter.prevent="onAdd()"
                      :items="unused_services"
                      class="py-0"
                      height="25px"
                      hide-details="true"
                      id="serv_input"
                      maxlength="32"
                      :disabled="is_server_response_waiting"
                      ></v-combobox>
          <v-card-actions flat class="pr-0 pb-0"> <v-spacer></v-spacer>
            <v-btn elevation="2"
                   small
                   @click="onAdd()"
                   :disabled="is_server_response_waiting"
            >
              <v-icon left>mdi-playlist-plus</v-icon>
              Добавить
            </v-btn>
          </v-card-actions>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              :disabled="is_server_response_waiting"
              text
              @click="cancelEditPlat()"
          >
            Отмена</v-btn>
          <v-btn
              text
              color="primary"
              @click="applyEditPlat()"
              :disabled="!plat_services.length"
              :loading="is_server_response_waiting"
          >
            Применить</v-btn>
        </v-card-actions>
      </v-card>

    </v-dialog>
</span>
</template>

<script>
import {capitalizeFirstLetter} from '@/utils/utils'
export default {
name: "EditPlat",
  props:['prop_plat_id', ],
  data: ()=>({
    serv_selected: '',
    show_edit_plat_dialog: false,
    plat_services: [],
    selected_services: [],
    unused_services: [],
    is_server_response_waiting: false,

  }),
  computed:{
  },
  methods:{
    async applyEditPlat(){
      this.is_server_response_waiting = true
      let plat_scheta = this.$store.getters.getStrokiOfPlat(this.prop_plat_id)
      let removed_serv_names = plat_scheta.filter(s => !this.plat_services.includes(s.srvc_name) ).map(s => s.srvc_name)
      let new_serv_names = this.plat_services.filter(sn => plat_scheta.find(s => s.srvc_name === sn) === undefined)
      if( !removed_serv_names.length && !new_serv_names.length ) {
        this.show_edit_plat_dialog = false
        this.$emit('services-list-canceled')
        return
      }
      let obj = {
        plat_id: this.prop_plat_id,
        new_serv_names: new_serv_names,
        removed_serv_names: removed_serv_names
      }
      await this.$store.dispatch('act_sevicesEdited', obj)
      // console.log('act_sevicesEdited OK')
      this.is_server_response_waiting = false
      this.show_edit_plat_dialog = false
      this.$emit('services-list-updated')
    },
    cancelEditPlat(){
      this.show_edit_plat_dialog = false
      this.$emit('services-list-canceled')
    },
    onRemove(){
      // console.log('removed serv')
      this.selected_services.forEach(itm => {
        this.plat_services.splice( this.plat_services.indexOf(itm), 1 )
      })
      this.unused_services = this.$store.getters.getUnusedPlatejkaServicesNames(this.plat_services)
      this.selected_services = []
    },

    onAdd(){
      let val = document.getElementById('serv_input').value.trim()
      document.getElementById('serv_input').value = ''
      //document.getElementById('serv_input').blur()
      if ( !val.length )
        return
      val = val.trim()
      if( this.plat_services.some(itm => itm.toLowerCase() === val.toLowerCase()) ){
        this.serv_selected = ''
        return
      }
      this.plat_services.push( capitalizeFirstLetter(val) )
      this.$nextTick(() => {
        document.getElementById ( "serv_select" ).scrollTop = 1000
      })
      this.unused_services = this.$store.getters.getUnusedPlatejkaServicesNames(this.plat_services)
      this.serv_selected = ''
    },

  },
  created() {
    this.show_edit_plat_dialog = true
  },
  mounted() {
      this.plat_services = this.$store.getters.getServiceNamesOfPlat( this.prop_plat_id )
      this.selected_services = []
      this.unused_services = this.$store.getters.getUnusedPlatejkaServicesNames(this.plat_services)
      this.serv_selected = ''
  }
}
</script>

<style scoped>
</style>