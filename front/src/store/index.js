import Vue from 'vue'
import Vuex from 'vuex'
import platModule from '@/store/platejki'
import settsModule from '@/store/settings'
import authModule from '@/store/auth'
import stateModule from '@/store/app_state'
import createPersistedState from "vuex-persistedstate"
import axios from "axios";
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
      pre_path: 'api/v1/',
      alert_error_txt: '',
      page_title: 'МОИ ПЛАТЕЖКИ онлайн',
      recaptcha_site_key: (Vue.config.devtools ?
          '6Lfqu6wUAAAAAAwMD4yrFR-qge3iz8itJLemnARR' : //localhost
          '6LeJcCgaAAAAAC5uZu74_22E6mhrcUBKUSpWdNaA'),
      soc_names: ['Гугл', 'Вконтакте', 'Одноклассники', ],
  },
  mutations: {
      mut_alertError(state, txt){
          state.alert_error_txt = txt
          state.authModule.isLogInProcess = false
      },

    // createSettsListItem(state, in_obj){
    //   state.plat_state.settings[in_obj.arr_name].push({id: getNewID(state.plat_state.settings[in_obj.arr_name]), name: ''})
    //   //localStorage.setItem('plat_state', JSON.stringify(state.plat_state))
    // },
    // deleteSettsListItem(state, in_obj){
    //   let i = state.plat_state.settings[in_obj.arr_name].findIndex(s => s.id === in_obj.itm_id)
    //   state.plat_state.settings[in_obj.arr_name].splice(i, 1)
    //   //localStorage.setItem('plat_state', JSON.stringify(state.plat_state))
    // },
    // updateSettsListItem(state, in_obj){
    //     let i = state.plat_state.settings[in_obj.arr_name].findIndex(s => s.id === in_obj.itm_id)
    //     if (in_obj.arr_name === 'addrss' && in_obj.is_created){
    //       let scheta_arr = state.plat_state.settings.servss.map(serv => ({serv_id: serv.id, schet: ''}))
    //       state.plat_state.settings.scheta.push(scheta_arr);
    //     }
    //     state.plat_state.settings[in_obj.arr_name][i].name = in_obj.new_name
    //     //localStorage.setItem('plat_state', JSON.stringify(state.plat_state))
    // },
    // deleteServsFromAllScheta(state, serv_id){
    //     state.plat_state.settings.scheta.forEach(scheta => {
    //         let i = scheta.findIndex(s => s.serv_id === serv_id)
    //         if( i > -1)
    //             scheta.splice(i, 1)
    //     })
    //     //localStorage.setItem('plat_state', JSON.stringify(state.plat_state))
    // },
    // deleteAddrsFromScheta(state, addr_id){
    //     state.plat_state.settings.scheta.splice(state.plat_state.settings.addrss.findIndex(a => a.id === addr_id), 1)
    //     //localStorage.setItem('plat_state', JSON.stringify(state.plat_state))
    // },

      // updateSchet(state, in_obj){
      //   state.plat_state.settings.scheta[in_obj.sch_indx][in_obj.serv_indx].schet = in_obj.new_schet
      //   //localStorage.setItem('plat_state', JSON.stringify(state.plat_state))
      // },
      // deleteSchet(state, in_obj){
      //   state.plat_state.settings.scheta[in_obj.sch_indx].splice(in_obj.serv_indx, 1)
      //   //localStorage.setItem('plat_state', JSON.stringify(state.plat_state))
      // },
      // createSchet(state, in_obj){
      //   let serv = state.plat_state.settings.servss.find(serv => serv.name === in_obj.serv_name)
      //   let serv_id = 0
      //   if( serv ){
      //     serv_id = serv.id
      //   } else{
      //     serv_id = getNewID(state.plat_state.settings.servss)
      //     state.plat_state.settings.servss.push({id: serv_id, name: in_obj.serv_name })
      //   }
      //   state.plat_state.settings.scheta[in_obj.sch_indx].push({serv_id: serv_id, schet: ''})
      //   //localStorage.setItem('plat_state', JSON.stringify(state.plat_state))
      // },


    // mut_savePlatejka(state, plat_obj){
    //   let plat = state.plat_state.platejki_all.find(pl => pl.id === plat_obj.plat_id);
    //   if ( plat_obj.is_schet_edited ){
    //       plat_obj.scheta.forEach(sch => {
    //           let srv = state.plat_state.settings.servss.find(s => s.name === sch.srvc_name)
    //           if ( srv ){
    //               let sserv = state.plat_state.settings.scheta[plat_obj.addr_indx].find(ss => ss.serv_id === srv.id)
    //               if(sserv){
    //                   Vue.set(sserv, 'schet', sch.srvc_schet)
    //               }
    //           }
    //       })
    //   }
    //   plat.scheta = _.cloneDeep(plat_obj.scheta)
    //   //localStorage.setItem('plat_state', JSON.stringify(state.plat_state));
    // },
    // mut_copyPlat(state, curr_date_str){
    //     let pl_arr = this.getters.getPrevMonthPlatsCanBeAdded(curr_date_str)
    //     let y_m = y_m_Obj(curr_date_str)
    //     pl_arr.forEach(pl => {
    //         let new_pl = _.cloneDeep(pl)
    //         new_pl.pmonth = y_m.m
    //         new_pl.pyear = y_m.y
    //         new_pl.payed_date = ''
    //         new_pl.id = getNewID(state.plat_state.platejki_all)
    //         new_pl.scheta.forEach(s => {
    //             s.counter_prev = s.counter_curr
    //             s.counter_curr = ''
    //         })
    //         state.plat_state.platejki_all.push(new_pl)
    //     })
    //     //localStorage.setItem('plat_state', JSON.stringify(state.plat_state))
    // },
    // saveNoteSwitch(state, is_show_note){
    //     state.plat_state.settings.text_note.show = is_show_note
    //     //localStorage.setItem('plat_state', JSON.stringify(state.plat_state))
    // },
    // saveNoteText(state, note_text){
    //     console.log('note saved')
    //     state.plat_state.settings.text_note.text = note_text
    //     //localStorage.setItem('plat_state', JSON.stringify(state.plat_state))
    // },
    // saveNoteSize(state, note_size){
    //     state.plat_state.settings.text_note.width = note_size.width
    //     state.plat_state.settings.text_note.height = note_size.height
    //     //localStorage.setItem('plat_state', JSON.stringify(state.plat_state))
    // },
    // saveNotePosition(state, note_pos){
    //     state.plat_state.settings.text_note.top = note_pos.top
    //     state.plat_state.settings.text_note.left = note_pos.left
    //     //localStorage.setItem('plat_state', JSON.stringify(state.plat_state))
    // },
    // addAddrsFromPlat(state, in_obj){
    //   let scht_arr = in_obj.scheta.map(s => ({
    //           serv_id: state.plat_state.settings.servss.find(serv => serv.name === s.srvc_name).id,
    //           schet: s.srvc_schet}))
    //   let addr_obj = {id: getNewID(state.plat_state.settings.addrss), name: in_obj.new_addr}
    //   state.plat_state.settings.addrss.push(addr_obj)
    //   state.plat_state.settings.scheta.push(scht_arr)
    //   state.plat_state.platejki_all.find(pl => pl.id === in_obj.plat_id).addr_name = in_obj.new_addr
    //   //localStorage.setItem('plat_state', JSON.stringify(state.plat_state))
    // },
  },
  actions: {
    async act_sendMessageFromLanding({state}, in_obj) {
      await axios.post(state.pre_path + 'support_form/', in_obj)
    },
  },
  getters: {
      getRecaptchaSiteKey: state =>{
        return state.recaptcha_site_key
      },
      getPageTitle: state => {
          return state.page_title
      },
      getSocNameGoogle: state => {
          return state.soc_names[0]
      },
      getSocNameVK: state => {
          return state.soc_names[1]
      },
      getSocNameOK: state => {
          return state.soc_names[2]
      },
  },
  modules: {
    platModule, settsModule, authModule, stateModule
  },
    plugins: [createPersistedState()]
})
