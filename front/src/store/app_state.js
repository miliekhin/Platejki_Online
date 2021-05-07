import axios from 'axios'
import Vue from 'vue'
import {getNewID} from "@/utils/utils"
// const pre_path = 'api/v1/'

function platInitializer(plat_obj){
    sortStroki(plat_obj)
    setPayPeriod(plat_obj)
}

function setPayPeriod(plat_obj){
    if ( !plat_obj.pay_period ){
        let m = plat_obj.pmonth
        let y = plat_obj.pyear
        if(!m) {
            m = 12
            y--
        }
        m = m.toString()
        if(m.length < 2)
            m = m.padStart(2, '0')
        plat_obj.pay_period = `${y}-${m}`
        // console.log('paaap', plat_obj.pay_period)
    }
}

function sortStroki(plat_obj){
    plat_obj.stroka.sort((a, b) => {
        let nameA=a.srvc_name.toLowerCase(), nameB=b.srvc_name.toLowerCase()
        if (nameA < nameB) //сортируем строки по возрастанию
            return -1
        if (nameA > nameB)
            return 1
        return 0 // Никакой сортировки
    })
}

export default ({
  state: {
      appState: {
          username: '',
          email: '',
          id: 0,
          adres: [],
          payer: [],
          erc: [],
          platejka: [],
          settings: [],
          usluga: [],
          zametka: [],
      },
  },
  mutations: {
      mut_copyPlat(state, in_obj){
          console.log('mut_copyPlat in_obj: ', in_obj)
          in_obj.forEach(plat_obj => {
              sortStroki(plat_obj)
              state.appState.platejka.push(plat_obj)
          })
      },
      mut_savePlatejka(state, in_obj){
          // console.log('mut_savePlatejka in_obj: ', in_obj)
          let plat_obj = state.appState.platejka.find(pl => pl.id === in_obj.plat_id)
          in_obj.stroki.forEach(in_str => {
              let state_stroka = plat_obj.stroka.find(pl_str => pl_str.id === in_str.id)
              for(const key in in_str){
                  if (key === 'id') continue
                  state_stroka[key] = in_str[key] || ''
                  //console.log(key, in_str[key])
                  if (key === 'schet'){
                      updateGlobalSchet(state_stroka.srvc_name, in_str[key], plat_obj.addr)
                  }
              }
          })

          function updateGlobalSchet(usluga_name, new_schet, adr_name){
              // console.log('Usluga changed:', usluga_name, new_schet, adr_name)
              let usl_obj = state.appState.usluga.find(u => u.name === usluga_name)
              if( !usl_obj ) return
              const adr_obj = state.appState.adres.find(adr => adr.name === adr_name)
              if( !adr_obj ) return
              let sch_obj = adr_obj.scheta.find(sch => sch.usluga.id === usl_obj.id)
              if( !sch_obj ) return
              sch_obj.schet = new_schet || ''
          }
      },
      mut_setState(state, data){
          // console.log('Global app state:', data)
          //Сортируем строки платежки по имени услуги
          data.platejka.forEach(pl => platInitializer(pl))
          state.appState = data
      },
      // editListItem(state, in_obj){
      //     let itm = state.appState[in_obj.arr_name].find(i => in_obj.id === i.id)
      //     Vue.set(itm, 'wait_for_update', true)
      // },
      createListItem(state, in_obj){
          // console.log(in_obj.arr_name)
          let itm = {id: getNewID(state.appState[in_obj.arr_name]), name: ''}
          // if( in_obj.arr_name === 'adres' )
          itm.wait_for_update = true
          state.appState[in_obj.arr_name].push(itm)
      },
      mut_updateListItem(state, in_obj){
          let new_obj = {}
          new_obj.name = in_obj.new_name
          let itm = state.appState[in_obj.arr_name].find(s => s.id === in_obj.itm_id)
          Vue.set(itm, 'name', in_obj.new_name)
          // console.log('resp_data:', in_obj.resp_data)
          if( in_obj.resp_data )
            Vue.set(itm, 'id', in_obj.resp_data.id)
          if( in_obj.arr_name === 'adres' ) {
              if( in_obj.resp_data )
                Vue.set(itm, 'scheta', in_obj.resp_data.scheta)
          }
          delete itm.wait_for_update
      },
      deleteListItem(state, in_obj){
          let i = state.appState[in_obj.arr_name].findIndex(s => s.id === in_obj.itm_id)
          state.appState[in_obj.arr_name].splice(i, 1)
          if ( in_obj.arr_name === 'usluga' ){
              let adr_indx
              state.appState.adres.forEach(adr=> {
                  adr_indx = adr.scheta.findIndex(sch => sch.usluga.id === in_obj.itm_id)
                  adr.scheta.splice(adr_indx, 1)
              })
          }
      },

      // updateSchet(state, in_obj){
      //   state.plat_state.settings.scheta[in_obj.sch_indx][in_obj.serv_indx].schet = in_obj.new_schet
      // },
      deleteSchet(state, in_obj){
          let adr_i = state.appState.adres.findIndex(a => a.id === in_obj.adr_id)
          let sch_i = state.appState.adres[adr_i].scheta.findIndex(s => s.id === in_obj.sch_obj.id)
          //console.log(state.appState.adres[adr_i].scheta[sch_i])
          state.appState.adres[adr_i].scheta.splice(sch_i, 1)
      },
      createSchet(state, in_obj){
          // console.log('Create schet response:', in_obj)
          let usl_i = state.appState.usluga.findIndex(u => u.name === in_obj.usluga_name)
          if (usl_i < 0)
              state.appState.usluga.push({id: in_obj.response.usluga.id, name: in_obj.usluga_name })
          let adr_i = state.appState.adres.findIndex(a => a.id === in_obj.adr_id)
          state.appState.adres[adr_i].scheta.push(in_obj.response)
      },
      showZomedko(state, is_show_note){
          state.appState.zametka[0].show = is_show_note
      },
      saveZomedkoText(state, text){
          state.appState.zametka[0].zametka = text
      },
      saveZomedkoSize(state, zomedko_size){
          console.log('zomedko_size', zomedko_size)
          state.appState.zametka[0].width = zomedko_size.width
          state.appState.zametka[0].height = zomedko_size.height
      },
      mut_saveZomedkoPosition(state, zomedko_pos){
          state.appState.zametka[0].top = zomedko_pos.top
          state.appState.zametka[0].left = zomedko_pos.left
      },
      mut_firstPlatejkaCreated(state){
          state.appState.settings[0].first_platejka_created = true
      },
      mut_addNewPayer(state, response_data){
          // let obj = {id: response_data.id, name: response_data.name}
          state.appState.payer.push(response_data)
      },
      mut_addNewERC(state, response_data){
          state.appState.erc.push(response_data)
      },
      addNewAdres(state, response_data){
          // let obj = {id: response_data.id, name: response_data.name}
          state.appState.adres.push(response_data)
      },
      mut_addNewPlatejka(state, in_obj){
          console.log('New Platejka data:', in_obj)
          state.appState.platejka.push(in_obj)
      },
      platejkaRemoved(state, plat_id){
          let i = state.appState.platejka.findIndex(pl => pl.id === plat_id);
          // console.log( 'platejkaRemoved', indx, i)
          state.appState.platejka.splice( i, 1)
      },
      mut_setPayedDate(state, in_obj){
          state.appState.platejka.find(pa => pa.id === in_obj.plat_id).pay_date = in_obj.payed_date
      },
      mut_sevicesEdited(state, in_obj){
          // Изменить саму платежку
          console.log(in_obj)
          let stroki_platejki_arr = this.getters.getStrokiOfPlat(in_obj.trans_obj.plat_id)
          in_obj.trans_obj.removed_serv_names.forEach(sname => {
              let i = stroki_platejki_arr.findIndex(s => s.srvc_name === sname)
              // Удаление услуг из платежки
              stroki_platejki_arr.splice(i, 1)
          })
          let plat_obj = this.getters.getPlatejkaByID(in_obj.trans_obj.plat_id)
          // Добавление строки в платежку
          in_obj.resp_obj.new_stroki.forEach(new_stroka_obj => {
              plat_obj.stroka.push( new_stroka_obj )
          })
          // Добавление новой услуги в общий список услуг
          in_obj.resp_obj.new_uslugi.forEach(new_usluga_obj => {
              state.appState.usluga.push(new_usluga_obj)
          })
          // Добавление нового счета в общий список счетов
          in_obj.resp_obj.new_scheta.forEach(new_schet_obj => {
              this.getters.getAllSchetaByPlatID(in_obj.trans_obj.plat_id).push(new_schet_obj)
          })
      },
      mut_setPlatNewPayer(state, in_obj){
          state.appState.platejka.find(pl => pl.id === in_obj.plat_id).payer = in_obj.payer_name
      },
      mut_setPlatNewERC(state, in_obj){
          state.appState.platejka.find(pl => pl.id === in_obj.plat_id).erc = in_obj.erc
      },
      mut_setPlatNewPayPeriod(state, in_obj){
          console.log('mut_setPlatNewPayPeriod', in_obj.pay_period)
          state.appState.platejka.find(pl => pl.id === in_obj.plat_id).pay_period = in_obj.pay_period
      },
  },
  actions: {
      deleteAccount({rootState}){
          return axios.delete(rootState.pre_path + 'del_account/')
      },
      async act_fetchState({commit, rootState}) {
          axios.defaults.headers.common['Authorization'] = 'Bearer ' + rootState.authModule.tokens.access
          let resp = await axios.get(rootState.pre_path + 'user/' + rootState.authModule.user.id + '/')
          commit("mut_setState", resp.data)
      },
      async act_updateListItem({commit, rootState}, in_obj){
          let send_obj = {'name': in_obj.new_name, 'owner': rootState.authModule.user.id}
          let resp
          // console.log('Updating item:', in_obj)
          if( in_obj.is_created ) {
              // send_obj.owner = (in_obj.arr_name === 'usluga' ? [uid] : uid)
              resp = await axios.post(rootState.pre_path + in_obj.arr_name + '/', send_obj)
          }else{
              resp = await axios.patch(rootState.pre_path + in_obj.arr_name + '/' + in_obj.itm_id + '/', send_obj)
          }
          // in_obj.new_id = resp.data.id
          in_obj.resp_data = resp.data
          commit('mut_updateListItem', in_obj)
      },
      async deleteListItem({commit, rootState}, in_obj){
          // let send_obj = {}
          // if ( in_obj.arr_name === 'usluga' ){
          //     send_obj.data = {'owner': rootState.authModule.user.id}
          //     //console.log('Deleting usluga...', send_obj)
          // }
          // await axios.delete(rootState.pre_path + in_obj.arr_name + '/' + in_obj.itm_id + '/', send_obj)
          await axios.delete(rootState.pre_path + in_obj.arr_name + '/' + in_obj.itm_id + '/')
          commit('deleteListItem', in_obj)
      },

      async updateSchet({rootState}, in_obj){
          // console.log(in_obj)
          await axios.patch(rootState.pre_path + 'schet/' + in_obj.sch_indx + '/', {'schet': in_obj.new_schet})
          //commit('updateSchet', in_obj)
      },
      async deleteSchet({commit, rootState}, in_obj){
          //console.log(in_obj)
          await axios.delete(rootState.pre_path + 'schet/' + in_obj.sch_obj.id + '/')
          commit('deleteSchet', in_obj)
      },
      async createSchet({commit, rootState}, in_obj){
          let send_obj = {
              // 'owner': rootState.authModule.user.id,
              'usluga_name': in_obj.usluga_name,
              'adr_id': in_obj.adr_id,
          }
          // console.log('Create schet object:', send_obj)
          let resp = await axios.post(rootState.pre_path + 'schet/', send_obj)
          in_obj.response = resp.data
          commit('createSchet', in_obj)
      },
      async showZomedko({commit, state, rootState}, is_show_note){
          await axios.patch(rootState.pre_path + 'zametka/' + state.appState.zametka[0].id + '/', {'show': is_show_note})
          commit('showZomedko', is_show_note)
      },
      async saveZomedkoText({commit, state, rootState}, text){
          await axios.patch(rootState.pre_path + 'zametka/' + state.appState.zametka[0].id + '/', {'zametka': text})
          commit('saveZomedkoText', text)
      },
      async saveZomedkoSize({commit, state, rootState}, zomedko_size){
          await axios.patch(rootState.pre_path + 'zametka/' + state.appState.zametka[0].id + '/', zomedko_size)
          commit('saveZomedkoSize', zomedko_size)
      },
      async act_saveZomedkoPosition({commit, state, rootState}, zomedko_pos){
          //console.log('zomedko_pos:', zomedko_pos)
          await axios.patch(rootState.pre_path + 'zametka/' + state.appState.zametka[0].id + '/', zomedko_pos)
          commit('mut_saveZomedkoPosition', zomedko_pos)
      },

  },
  getters: {
      // getState: state => {
      //     return state.appState
      // },
      getERC: state => {
        return state.appState.erc
      },
      getErcNames: (state, getters) => {
        return getters.getERC.map(p=>p.name)
      },
      getPayers: state => {
        return state.appState.payer
      },
      getPayerNames: (state, getters) => {
          return getters.getPayers.map(p=>p.name)
      },
      getServices: state => {
        return state.appState.usluga
      },
      getAdresObjByName: state => adr_name =>{
          return state.appState.adres.find(adr => adr.name === adr_name)
      },
      getAllSchetaByPlatID: (state, getters) => plat_id => {
          let addr_name = state.appState.platejka.find(pl => pl.id === plat_id).addr
          return getters.getAdresObjByName(addr_name).scheta
      },
      getAddresses: state => {
          return state.appState.adres
      },
      adresaReady: state => {
          return Boolean(state.appState.adres.length && !state.appState.adres[0].wait_for_update)
          // console.log('adresaReady', ret)
          // return ret
      },
      getUslugaNameById: (state) => serv_id =>{
          try {
            return state.appState.usluga.find(s => s.id === serv_id).name
          }catch (e) {
              console.error('Try to get ID:', serv_id)
          }
      },
      getUnusedServicesNames: (state) => adr_id => {
          // console.log(adr_id)
          let adr_obj = state.appState.adres.find(adr => adr.id === adr_id)
          let used_usl = adr_obj.scheta.map(sch => state.appState.usluga.find(u => u.id === sch.usluga.id).name)
          let all_usl = state.appState.usluga.map(u => u.name)
          // console.log(used_usl, all_usl, unused_usl)
          //Возврат имен неиспользуемых услуг
          return  all_usl.filter(uu => !used_usl.includes(uu))
      },
      getUslugiNamesFromScheta: (state) => adr_id =>{
          let adr_obj = state.appState.adres.find(adr => adr.id === adr_id)
          //Возврат имен используемых услуг
          return adr_obj.scheta.map(sch => state.appState.usluga.find(u => u.id === sch.usluga.id).name)
      },
      getZomedkoData: state => {
          return state.appState.zametka[0]
      },
      isNameExists: (state) => in_obj => {
          // const usl_arr = state.appState[in_obj.arr_name].map(u => {
          //     if ( !u.wait_for_update )
          //       return u.name.toLowerCase()
          // })
          // let is_exists = usl_arr.includes(in_obj.name.toLowerCase())
          const usl_arr = state.appState[in_obj.arr_name].filter(itm =>
              !itm.wait_for_update && in_obj.name.toLowerCase() === itm.name.toLowerCase())
          return in_obj.is_new_item ? usl_arr.length > 0 : usl_arr.length > 1
          // console.log(usl_arr, in_obj.name.toLowerCase(), is_exists)
          // return is_exists
      },
      oplataZaGod: (state) => year =>{
          let amount = 0
          state.appState.platejka.forEach(pl => {
              // if (pl.pay_date && pl.pyear === year) // Учитывать пометку "Оплачено" в pl.pay_date
              if (pl.pyear === year)
                  pl.stroka.forEach(stroka => {
                      amount += parseFloat(stroka.pay_amount) || 0
                  })
          })
          // console.log('OplataZaGod:', year, amount)
          return amount.toFixed(2)
      }
  },
})