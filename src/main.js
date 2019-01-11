import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'

axios.defaults.baseURL = 'https://vue-vuex-features.firebaseio.com'
axios.defaults.headers.common['Authorization'] = 'Some authorization header'
axios.defaults.headers.get['Accept'] = 'application/json'

const requestInterceptor = axios.interceptors.request.use(config => {
    console.log('Request Interceptor', config)
    return config
})
/* перехватчики = middleware функции, обязательно должны возвращать что то 
иначе будут блочить выполнение программы */
const responseInterceptor = axios.interceptors.response.use(response => {
    console.log('Response Interceptor', response)
    return response
})
//прекращают работу перехватчиков
axios.interceptors.request.eject(requestInterceptor)
axios.interceptors.response.eject(responseInterceptor)

new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
})