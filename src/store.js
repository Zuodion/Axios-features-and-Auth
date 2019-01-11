import Vue from 'vue'
import Vuex from 'vuex'
import axiosInstance from './axios-auth';
import axios from 'axios'
import router from './router'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        idToken: null,
        userId: null,
        user: null
    },
    mutations: {
        authUser(state, userData) {
            state.idToken = userData.token
            state.userId = userData.userId
        },
        writeUser(state, user) {
            state.user = user
        },
        clearAuthData(state) {
            state.idToken = null;
            state.userId = null;
        }
    },
    actions: {
        setLogoutTimer({
            commit
        }, expirationTime) {
            setTimeout(() => {
                commit('clearAuthData')
            }, expirationTime * 1000)
        },
        signup({
            commit,
            dispatch
        }, authData) {
            axiosInstance
                .post('/signupNewUser?key=AIzaSyD81vEerSGC47XJ0dhqCOCJD70lQ2x1eQY', {
                    email: authData.email,
                    password: authData.password,
                    returnSecureToken: true
                })
                .then(response => {
                    commit('authUser', {
                        token: response.data.idToken,
                        userId: response.data.localId
                    })
                    const now = new Date()
                    const expirationDate = new Date(now.getTime() + response.data.expiresIn * 1000)
                    localStorage.setItem('token', response.data.idToken)
                    localStorage.setItem('userId', response.data.localId)
                    localStorage.setItem('expiresIn', expirationDate)
                    localStorage.setItem('email', response.data.email)
                    console.log(response.data)
                    dispatch('writeUser', authData)
                    dispatch('setLogoutTimer', response.data.expiresIn)
                })
                .catch(error => console.log(error))
        },
        login({
            commit,
            dispatch
        }, authData) {
            axiosInstance
                .post(
                    "/verifyPassword?key=AIzaSyD81vEerSGC47XJ0dhqCOCJD70lQ2x1eQY", {
                        email: authData.email,
                        password: authData.password,
                        returnSecureToken: true
                    }
                )
                .then(response => {
                    const now = new Date()
                    const expirationDate = new Date(now.getTime() + response.data.expiresIn * 1000)
                    localStorage.setItem('token', response.data.idToken)
                    localStorage.setItem('userId', response.data.localId)
                    localStorage.setItem('expirationDate', expirationDate)
                    localStorage.setItem('email', response.data.email)
                    console.log(response.data)
                    commit('authUser', {
                        token: response.data.idToken,
                        userId: response.data.localId
                    })
                    dispatch('setLogoutTimer', response.data.expiresIn)
                })
                .catch(error => console.log(error));
        },
        tryAutoLogin({
            commit
        }) {
            const token = localStorage.getItem('token')
            if (!token) return;
            const expirationDate = localStorage.getItem('expirationDate')
            const now = new Date()
            if (now > expirationDate) return;
            const userId = localStorage.getItem('userId')
            commit('authUser', {
                token: token,
                userId: userId
            })

        },
        logout({
            commit
        }) {
            commit('clearAuthData')
            localStorage.removeItem('expirationDate')
            localStorage.removeItem('token')
            localStorage.removeItem('userId')
            router.replace('/signin')
        },
        storeUser({
            state
        }, userData) {
            if (!state.idToken) return;
            axios.post('/users.json' + '?auth=' + state.idToken, userData)
        },
        fetchUser({
            commit,
            state
        }) {
            if (!state.idToken) return;
            axios.get('/users.json' + '?auth=' + state.idToken)
                .then(response => {
                    const data = response.data
                    let user = ''
                    const userEmail = localStorage.getItem('email')
                    for (let key in data) {
                        if (data[key].email === userEmail) {
                            user = data[key]
                        }
                    }
                    commit('writeUser', user)
                })
        }
    },
    getters: {
        user: state => state.user,
        isAuthenticated(state) {
            return state.idToken !== null
        }
    }
})