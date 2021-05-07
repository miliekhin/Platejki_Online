import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from '@/plugins/vuetify'
import axios from 'axios'
import AOS from 'aos'
import 'aos/dist/aos.css'

// import './registerServiceWorker'
import VueAxios from "vue-axios"
// import * as VueReCaptcha from 'vue-recaptcha-v3'

Vue.config.productionTip = false
Vue.prototype.$hostname = (!Vue.config.devtools) ? 'https://moiplatejki.online/' : 'http://localhost:8765/'
axios.defaults.baseURL = (!Vue.config.devtools) ? 'https://moiplatejki.online/' : 'http://localhost:8765/'
// axios.defaults.baseURL = 'api'

axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.xsrfCookieName = 'csrftoken'
// axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*'
// Vue.prototype.$pre_path = 'api/v1/'
// https://stackoverflow.com/questions/37367588/what-is-the-best-way-to-declare-global-variable-in-vue-js

//axios.defaults.withCredentials = true

Vue.use(VueAxios, axios)

window.onafterprint = function() {
  // router.replace({name: 'Platejki'})
  store.commit('setPrintMode', false)
  router.go(-1)
}

// axios.interceptors.request.use( undefined, function (error) {
//   if (error) {
//     // Do something with request error
//     console.log('ERRORROO')
//     store.commit('errorNetwork', error)
//     return Promise.reject(error)
//   }
// })

let is_REFRESH_TOKEN_REFRESHING = false
const serv_errs = [404, 405, 406, 422, 500, 501, 502]
// HTTP_422_UNPROCESSABLE_ENTITY Слишком много сущностей уже создано в БД

// let isAlreadyFetchingAccessToken = false
// let subscribers = []
//
// function onAccessTokenFetched(access_token) {
//   subscribers = subscribers.filter(callback => callback(access_token))
// }
//
// function addSubscriber(callback) {
//   subscribers.push(callback)
// }
//
// axios.interceptors.response.use(function (response) {
//   return response
// }, async function (error) {
//   const { config, response } = error
//   const originalRequest = config
//
//   if (response && response.status === 401) {
//     if (!isAlreadyFetchingAccessToken) {
//       isAlreadyFetchingAccessToken = true
//       store.dispatch('refreshTokens').then((access_token) => {
//         isAlreadyFetchingAccessToken = false
//         onAccessTokenFetched(access_token)
//       })
//     }
//
//     const retryOriginalRequest = new Promise((resolve) => {
//       addSubscriber(access_token => {
//         originalRequest.headers.Authorization = 'Bearer ' + access_token
//         resolve(axios(originalRequest))
//       })
//     })
//
//     return retryOriginalRequest
//   }
//   return Promise.reject(error)
// })

axios.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  }, async function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    if (error.response) {
      console.log('Interceptor response error:', error.response)
      if( serv_errs.includes( error.response.status ) ){ //400 - Bad request
        store.commit('mut_alertError', `Сервер вернул ошибку ${error.response.status}. Пожалуйста, попробуйте обновить страницу и повторить действие заново, или обратитесь в службу поддержки с описанием проблемы.`)
      }
      if(error.response.status === 401 || error.response.status === 403){ // 401 - Unauthorized 403 - Forbidden
        console.log('Interceptor: isTokensPresent:', store.getters.isTokensPresent )
        if ( store.getters.isTokensPresent ){ // Токен доступа уже есть
          if ( is_REFRESH_TOKEN_REFRESHING ){ // Если рефреш токен был запущен на обновление, но оказался просрочен
            is_REFRESH_TOKEN_REFRESHING = false
            console.log('Interceptor: Refresh token expired.', 'Route name: ', router.currentRoute.name)
            // store.commit('logOut')
            if( router.currentRoute.name !== 'Home' )
              // await router.replace({name: 'Home'})
              await router.replace({name: 'HomeLogin'})
          }else {
            is_REFRESH_TOKEN_REFRESHING = true
            await store.dispatch('refreshTokens')
            // console.log('Interceptor: Retry original request with updated token:', axios.defaults.headers.common['Authorization'], error.config.url)
            error.config.headers.Authorization = 'Bearer ' + store.getters.getAccessToken
            console.log('Interceptor: Retry original request:', error.config)
            //axios.defaults.headers.common['Authorization'] = 'Bearer ' + store.getters.getAccessToken
            let resp = await axios(error.config) // Выполняем оригинальный запрос еще раз
            is_REFRESH_TOKEN_REFRESHING = false
            return resp
          }
        }
      }
      if(error.response.status === 429){
        await router.push({name: 'ThrottleRestrictor'})
      }
    }else if (error.request){
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log('Request error:', error)
      store.commit('mut_alertError', 'Сервер недоступен. Проверьте интернет-соединение или повторите попытку позже.')
    }else{
      console.log('Axios config error:', error)
      store.commit('mut_alertError', 'Внутренняя ошибка приложения. Пожалуйста, обратитесь в службу поддержки с описанием проблемы.')
    }

    //console.log('Interceptor return error:', error.response.status)
    return Promise.reject(error)
});


// axios.interceptors.response.use(undefined, function(error) {
//   if (error) {
//     console.log('ERRORZZ')
//     const originalRequest = error.config;
//     if (error.response.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       //store.dispatch("LogOut");
//       console.log('ERRORROO')
//       return router.push("/login");
//     }
//       console.log('ERRORRO1')
//       store.commit('errorNetwork', error)
//       return Promise.reject(error)
//   }
// })

new Vue({
  router,
  store,
  vuetify,
  axios,
  render: h => h(App),
  created() {
    AOS.init()
  }
}).$mount('#app')
