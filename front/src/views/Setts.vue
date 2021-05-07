<template>
  <div class="d-flex flex-wrap justify-space-around">
    <div>
      <edit-list :in_prop="services_data" @crud-event="onCrud"/>
      <scheta-list
          v-if="$store.getters.adresaReady"
          @crud-event-scheta="onCrudScheta"
      ></scheta-list>
      <edit-list :in_prop="erc_data" @crud-event="onCrud"/>
    </div>
    <div>
      <edit-list :in_prop="addresses_data" @crud-event="onCrud"/>
      <edit-list :in_prop="payers_data" @crud-event="onCrud"/>
      <text-note/>
      <account-editor/>
    </div>
  </div>
</template>

<script>
import EditList from "@/components/EditList"
import SchetaList from "@/components/SchetaList"
import TextNote from "@/components/TextNote";
import AccountEditor from "../components/AccountEditor";
// import {capitalizeFirstLetter} from "@/utils/utils";
export default {
  name: "Setts",
  components: {AccountEditor, EditList, SchetaList, TextNote},
  data: ()=>({
    scheta_addr: null,
    services_data: {
      arr: [],
      arr_name: 'usluga',
      title: 'Услуги ЖКХ',
      subtitle: 'Все услуги ЖКХ которые можно будет добавить в платежки',
      delete_header: 'Удалить услугу?',
      delete_text: 'Эта услуга также будет удалена из списка лицевых счетов. Однако, удаление услуг никак не влияет на данные в платежках созданные ранее.',
      null_text: 'Нажмите "+ ДОБАВИТЬ", чтобы добавить новую услугу ЖКХ.',
      exixsts_text: 'Такая услуга уже есть в списке.',
    },
    payers_data: {
      arr: [],
      // arr_name: 'payers',
      arr_name: 'payer',
      title: 'Плательщики',
      subtitle: 'Фамилия и инициалы лиц которые можно указать в платёжке как Плательщик',
      delete_header: 'Удалить плательщика?',
      delete_text: 'Удаление плательщика никак не влияет на данные в платежках созданных ранее.',
      null_text: 'Нажмите "+ ДОБАВИТЬ", чтобы добавить нового плательщика.',
      exixsts_text: 'Такой плательщик уже есть в списке.',
    },
    addresses_data: {
      arr: [],
      arr_name: 'adres',
      title: 'Адреса',
      subtitle: 'Адреса объектов для которых оплачиваются услуги ЖКХ',
      delete_header: 'Удалить адрес?',
      delete_text: 'Больше нельзя будет создать платежки для удаляемого адреса. Также, будут удалены услуги и лицевые счета привязанные к этому адресу. Однако, удаление адреса никак не влияет на платежки созданные ранее.',
      null_text: 'Нажмите "+ ДОБАВИТЬ", чтобы добавить новый адрес.',
      exixsts_text: 'Такой адрес уже есть в списке.',
    },
    erc_data: {
      arr: [],
      arr_name: 'erc',
      title: 'Коды ЕРЦ',
      subtitle: 'Коды единого расчетного центра',
      delete_header: 'Удалить код ЕРЦ?',
      delete_text: 'Удаление кода ЕРЦ никак не повлияет на данные в платежках созданных ранее.',
      null_text: 'Нажмите "+ ДОБАВИТЬ", чтобы добавить новый код ЕРЦ.',
      exixsts_text: 'Такой код ЕРЦ уже есть в списке.',
    },
  }),
  computed:{
  },
  methods:{
    onCrud(in_obj){
      //console.log(in_obj)
      if( in_obj.cmnd ==='update' ){
        // if (in_obj.arr_name === 'usluga')
        //   in_obj.new_name = capitalizeFirstLetter(in_obj.new_name)
        this.$store.dispatch('act_updateListItem', in_obj)
        return
      }
      if( in_obj.cmnd.includes('delete')){
        // if (in_obj.arr_name === 'servss')
        //   this.$store.dispatch('deleteServsFromAllScheta', in_obj.itm_id)
        // if (in_obj.arr_name === 'addrss'){
        //   this.$store.dispatch('deleteAddrsFromScheta', in_obj.itm_id)
        // }

        // this.$store.dispatch('deleteListItem', in_obj)
        if ( in_obj.del_new )
          this.$store.commit('deleteListItem', in_obj)
        else
          this.$store.dispatch('deleteListItem', in_obj)
        return
      }
      if( in_obj.cmnd.includes('create')){
        //this.$store.dispatch('createSettsListItem', in_obj)
        this.$store.commit('createListItem', in_obj)
      }
    },
    onCrudScheta(in_obj){
      if( in_obj.cmnd ==='update' ){
        this.$store.dispatch('updateSchet', in_obj)
        return
      }
      if( in_obj.cmnd ==='delete' ){
        this.$store.dispatch('deleteSchet', in_obj)
        return
      }
      if( in_obj.cmnd ==='create' ){
        this.$store.dispatch('createSchet', in_obj)
      }

    },
  },
  created() {
    // this.services_data.arr = this.$store.getters.getAllServices
    this.services_data.arr = this.$store.getters.getServices
    //this.payers_data.arr = this.$store.getters.getAllPayers
    this.payers_data.arr = this.$store.getters.getPayers
    this.erc_data.arr = this.$store.getters.getERC
    // this.addresses_data.arr = this.$store.getters.getAllAddresses
    this.addresses_data.arr = this.$store.getters.getAddresses
  }

}
</script>

<style scoped>

</style>