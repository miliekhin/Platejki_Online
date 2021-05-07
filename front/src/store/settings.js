export default ({
  state: {
    print_mode: false,
    print_double: false,
  },
  mutations: {
    setPrintMode(state, val){
      state.print_mode = val
    },
    mut_printDouble(state, val){
      state.print_double = val
    },

  },
  actions: {
    // createSettsListItem({commit}, in_obj){
    //   commit('createSettsListItem', in_obj)
    // },
    // deleteSettsListItem({commit}, in_obj){
    //   commit('deleteSettsListItem', in_obj)
    // },
    // updateSettsListItem({commit}, in_obj){
    //   commit('updateSettsListItem', in_obj)
    // },

    // deleteServsFromAllScheta({commit}, serv_id){
    //   commit('deleteServsFromAllScheta', serv_id)
    // },
    // deleteAddrsFromScheta({commit}, addr_id){
    //   commit('deleteAddrsFromScheta', addr_id)
    // },

    // updateSchet({commit}, in_obj){
    //   commit('updateSchet', in_obj)
    // },
    // deleteSchet({commit}, in_obj){
    //   commit('deleteSchet', in_obj)
    // },
    // createSchet({commit}, in_obj){
    //   commit('createSchet', in_obj)
    // },
  },
  getters: {
    getPrintMode: state => {
      return state.print_mode
    },
    getPrintDouble: state => {
      return state.print_double
    },
    // getAllServicesNames: (state, getters, rootState) => {
    //     return rootState.plat_state.settings.servss.map(s => s.name)
    // },
    // getAllServices: (state, getters, rootState) => {
    //     return rootState.plat_state.settings.servss
    // },
    // getAllPayers: (state, getters, rootState) => {
    //     return rootState.plat_state.settings.payers
    // },
    // getAllAddresses: (state, getters, rootState) => {
    //   return rootState.plat_state.settings.addrss
    // },
    // getAllScheta: (state, getters, rootState) => {
    //     return rootState.plat_state.settings.scheta
    // },
    // getAllAddressesNames: (state, getters, rootState) => {
    //     return rootState.plat_state.settings.addrss.map(a => a.name)
    // },
  },
})