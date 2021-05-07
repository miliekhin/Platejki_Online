<template>
<div>
  <v-card width="400" class="mb-3">
    <v-card-title>{{in_prop.title}}</v-card-title>
    <v-card-subtitle>{{in_prop.subtitle}}</v-card-subtitle>
    <v-card-text v-if="in_prop.arr.length">
      <div v-for="(itm, i) in in_prop.arr" :key="i" class="d-flex align-start">
<!--        :clearable="itm.id === edited_id"-->
<!--                      :solo="itm.id === edited_id"-->

        <v-text-field dense
                      :hide-details="itm.id !== edited_id || !err_msg.length > 0"
                      :error-messages="itm.id === edited_id ? err_msg : ''"
                      :readonly="itm.id !== edited_id"
                      :class="itm.id === edited_id ? 'mt-1' : ''"
                      v-model.trim="itm.name"
                      :title="(!itm.name || itm.name.length > 42) && itm.name"
                      :id="in_prop.arr_name + itm.id.toString()"
                      @blur="onBlur(itm, i)"
                      @keydown.enter="onSave(itm)"
                      @keydown.esc="onRevert(itm, i)"
                      @click="onclickreadOnly(itm)"
                      autocomplete="off"
        />
        <v-hover v-if="itm.id !== edited_id" v-slot:default="{ hover }">
          <v-btn icon small tile title="Изменить" class="ml-1 bbtn" elevation="2" @click="onEdit(itm)">
            <v-icon :color="hover ? 'green' : 'default'">mdi-pencil</v-icon>
          </v-btn>
        </v-hover>
        <v-btn v-else icon small tile
               title="Сохранить"
               class="ml-1 bbtn"
               elevation="2"
               :disabled="!itm.name || !itm.name.length"
               @mousedown="onSave(itm)"
        ><v-icon color="orange">mdi-content-save</v-icon></v-btn>
        <v-hover v-if="itm.id !== edited_id || new_item_edited" v-slot:default="{ hover }">
          <v-btn elevation="2" icon small tile
                 class="ml-1 bbtn"
                 title="Удалить"
                 @click.stop="showRemoveDialog(i)">
            <v-icon :color="hover ? 'red' : 'default'">mdi-delete</v-icon>
          </v-btn>
        </v-hover>
        <v-btn v-else icon small tile title="Отмена" class="ml-1 bbtn" elevation="2" @mousedown="onRevert(itm, i)"
        ><v-icon>mdi-restore</v-icon></v-btn>

      </div>
    </v-card-text>
    <v-card-text v-else class="text-subtitle-2">{{ in_prop.null_text }}</v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn small text color="primary"
             :disabled="new_item_edited"
             @click="addNew()">
        <v-icon left>mdi-plus</v-icon>Добавить
      </v-btn>
    </v-card-actions>
  </v-card>

  <v-dialog v-model="dialog_remove" persistent max-width="400">
    <v-card>
      <v-card-title class="headline">{{in_prop.delete_header}}</v-card-title>
      <v-card-text>{{in_prop.delete_text}}</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="default" text @click="cancelRemove()">Отмена</v-btn>
        <v-btn color="error" text @click="applyRemove()">Продолжить</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

<!--  <v-snackbar-->
<!--    v-model="show_snackbar"-->
<!--    :timeout="4000"-->
<!--    color="warning"-->
<!--    top-->
<!--    content-class="white&#45;&#45;text text-subtitle-1"-->
<!--  >-->
<!--    {{ in_prop.exixsts_text }}-->

<!--    <template v-slot:action="{ attrs }">-->
<!--      <v-btn-->
<!--          fab-->
<!--          outlined-->
<!--          x-small-->
<!--        v-bind="attrs"-->
<!--        @click="show_snackbar = false"-->
<!--      >-->
<!--        <v-icon>mdi-close</v-icon>-->
<!--      </v-btn>-->
<!--    </template>-->
<!--  </v-snackbar>-->

</div>
</template>

<script>
import {capitalizeFirstLetter} from '@/utils/utils'

export default {
name: "EditList",
  data: ()=>({
    old_val: '',
    edited_id: 0,
    dialog_remove: false,
    wait_to_remove: -1,
    action_applied: true,
    new_item_edited: false,
    // show_snackbar: false,
    err_msg: '',
  }),
  props: ['in_prop',],
  methods:{
    onclickreadOnly(itm){
      this.err_msg = ''
      this.old_val = itm.name
      this.edited_id = itm.id
      this.action_applied = false
    },
    onBlur(itm, i){
      //console.log('Blurred')
      if (this.err_msg.length) return
      if (this.new_item_edited && !itm.length) {
        //console.log('removed on blur')
        this.showRemoveDialog(i)
      }
      if ( !this.action_applied ) {
        this.onRevert(itm, 0)
        this.action_applied = true
      }
      // console.log('blured')
    },

    onEdit(itm){
      this.onclickreadOnly(itm)
      document.getElementById(this.in_prop.arr_name + itm.id.toString()).focus()
    },

    onSave(itm){
      this.err_msg = ''
      if (!this.edited_id || !itm.name.length)
        return
      // console.log('Save pressed', this.new_item_edited, this.old_val.toLowerCase() !== itm.name.toLowerCase())
      if( !this.new_item_edited && this.old_val.toLowerCase() === itm.name.toLowerCase()){
        this.action_applied = true
        this.edited_id = 0
        return
      }

     // this.$store.commit('editListItem', {id: itm.id, arr_name: this.in_prop.arr_name})
     //  console.log('Saving item:', itm)
      if ( this.$store.getters.isNameExists({name: itm.name, arr_name: this.in_prop.arr_name, is_new_item: this.new_item_edited}) ){
        // this.show_snackbar = true
        this.err_msg = this.in_prop.exixsts_text
        console.log('Item exists', this.err_msg)
        return
      }
      // console.log(this.old_val, itm.name)
      // capitalizeFirstLetter(itm.name)
      this.action_applied = true
      this.edited_id = 0

      if ( this.in_prop.arr_name === 'usluga') {
        itm.name = capitalizeFirstLetter(itm.name)
      }
      this.$emit('crud-event', {
        itm_id: itm.id,
        new_name: itm.name,
        cmnd: 'update',
        arr_name: this.in_prop.arr_name,
        is_created: this.new_item_edited,
      })
      this.new_item_edited = false
      // console.log('Item sended')
    },

    onRevert(itm, i){
      if (this.new_item_edited) {
        //console.log('removed on revert')
        this.showRemoveDialog(i)
      }
      if (!this.edited_id) return
      this.action_applied = true
      this.edited_id = 0
      itm.name = this.old_val
      // console.log('reverted', itm)
    },
    showRemoveDialog(i){
      this.wait_to_remove = i
      if (this.new_item_edited){
        //this.in_prop.arr.splice( i, 1 )
        this.new_item_edited = false
        this.applyRemove( true )
        return
      }
      this.dialog_remove = true
    },
    applyRemove( del_new = false){
      this.dialog_remove = false
      this.err_msg = ''
      let obj = {
        itm_id: this.in_prop.arr[this.wait_to_remove].id,
        cmnd: 'delete', arr_name: this.in_prop.arr_name,
        del_new
      }
      this.$emit('crud-event', obj)
      //this.in_prop.arr.splice(this.wait_to_remove ,1)
    },
    cancelRemove(){
      this.dialog_remove = false
      this.wait_to_remove = -1
    },
    addNew() {
      this.err_msg = ''
      this.$emit('crud-event', {cmnd: 'create', arr_name: this.in_prop.arr_name})
      this.new_item_edited = true

      this.$nextTick(() => {
        let new_id = this.in_prop.arr[this.in_prop.arr.length-1].id
        this.edited_id = new_id
        //console.log(this.in_prop.arr_name + this.edited_id.toString())
        document.getElementById(this.in_prop.arr_name + this.edited_id).focus()
      })
    }
  },
}
</script>

<style scoped>
  .bbtn{
    margin-top: 2px;
  }
</style>