import axios from 'axios'
import Vue from "vue";

export default ({
  state: {
      tokens: {},
      user: {},
      isLogInProcess: false,
  },
  mutations: {
      logOut(state){
          console.log('LogOut...')
          state.tokens = {}
          state.user = {}
          delete axios.defaults.headers.common["Authorization"]
      },
      setTokens(state, data) {
          console.log('setTokens:', data)
          Vue.set(state.tokens, 'access', data.access)
          // state.tokens.access = data.access
          if ( data.refresh)
            // state.tokens.refresh = 'BadToken'
            // state.tokens.refresh = data.refresh
              Vue.set(state.tokens, 'refresh', data.refresh)
      },
      deleteTokens(state){
          console.log('Deleting tokens...')
          state.tokens = {}
      },
      resetLogInProcess(state){
          state.isLogInProcess = false
      },
      setLogInProcess(state){
          state.isLogInProcess = true
      },
      setUser(state, data){
          state.user = data
          console.log('User data:', data)
      }
  },
  actions: {
      async startLogIn({dispatch, commit, state}, creds) {
          if ( !creds && !state.tokens.access ){
              console.log('No tokens for login')
              return Promise.reject('No tokens for login')
          }
          //console.log(creds)
          commit("setLogInProcess")
          if( creds ) { // Даем логин и пароль чтобы получить токены
              console.log('Create tokens with credentials...')
              let resp = await axios.post(`auth/jwt/create/`, {username: creds.username, password: creds.password})
              commit("setTokens", resp.data)
          } else { // Входим по токену доступа
              console.log('Verify token:', state.tokens.access)
              await axios.post(`auth/jwt/verify/`, {token: state.tokens.access})
          }
          //console.log('Set Bearer...')
          axios.defaults.headers.common['Authorization'] = 'Bearer ' + state.tokens.access
          await dispatch('fetchUser')
      },
      async act_socialLogIn({commit, dispatch, state}, in_obj){
          let resp = await axios.post('/auth/login/social/jwt-pair/', in_obj)
          // console.log('Oauth response', resp)
          commit("setTokens", {'access': resp.data.token, 'refresh': resp.data.refresh})
          axios.defaults.headers.common['Authorization'] = 'Bearer ' + state.tokens.access
          await dispatch('fetchUser')
      },

      async refreshTokens({commit, state}){
          if ( !state.tokens.refresh ){
              console.log('No tokens for refresh')
              return
          }
          // console.log('Refreshing token:', state.tokens.refresh)
          let resp = await axios.post(`auth/jwt/refresh/`, {refresh: state.tokens.refresh}) // возвращает только access token
          commit("setTokens", resp.data)
          console.log('New access token:', state.tokens.access)
          axios.defaults.headers.common['Authorization'] = 'Bearer ' + state.tokens.access
      },
      async fetchUser({commit}){
          console.log('Fetching user...')
          let resp = await axios.get(`auth/users/me/`)
          commit("setUser", resp.data)
          commit('resetLogInProcess')
      },
      // async changeUserName({commit}, new_name){
      //   await axios.patch( `auth/users/me/`, new_name)
      //   commit
      // },

  },
  getters: {
      isTokensPresent: state => {
          return Boolean(state.tokens.access)
      },
      isLoggedIn: state => {
          return Boolean(state.user.username)
      },
      getUser: state => {
          return state.user
      },
      isLogInProcess: state => {
          return state.isLogInProcess
      },
      getAccessToken: state => {
          return state.tokens.access
      },
  },
})