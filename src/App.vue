<template>
  <div id="app">
    <!-- <landing v-if="! blockstack.isUserSignedIn() && ! blockstack.isSignInPending()"></landing> -->
    <!-- <landing v-if="! userSession.isUserSignedIn() && ! userSession.isSignInPending()"></landing> -->
    <!--<dashboard v-if="user" :user="user"></dashboard>-->
    <!-- <router-view :key="$route.fullPath" :user="user" v-if="blockstack.isUserSignedIn()"></router-view> -->
    <router-view
      :key="$route.fullPath"
      :user="user"
      :logged-in="userSession.isUserSignedIn()"></router-view>
  </div>
</template>

<script>

import Landing from './components/Landing.vue'
import Home from './components/Home.vue'
import { User, configure } from 'radiks'
import { UserSession, AppConfig } from 'blockstack'
// import Raven from 'raven-js'
const logger = require('heroku-logger')
const appConfig = new AppConfig(['store_write', 'publish_data'], process.env.VUE_APP_APP_URI)
const userSession = new UserSession({ appConfig })

export default {
  name: 'app',
  components: {Landing, Home},
  beforeMount () {
    this.radiksLogin()
  },
  data () {
    return {
      blockstack: window.blockstack,
      userSession: userSession,
      user: this.user,
      radiksUser: this.radiksUser
    }
  },
  methods: {
    blockstackLogin () {
      const blockstack = this.blockstack
      // const { userSession } = getConfig()

      if (blockstack.isUserSignedIn()) {
        logger.info('user already signed in')
        this.userData = blockstack.loadUserData()
        this.user = new blockstack.Person(this.userData.profile)
        this.user.username = this.userData.username

        logger.info('user logged in', { username: this.user.username })

        // radiks specific stuff
        User.createWithCurrentUser()
      } else if (blockstack.isSignInPending()) {
        logger.info('user sign in pending')
        blockstack.handlePendingSignIn()
          .then((userData) => {
            this.user = new blockstack.Person(userData.profile)
            this.user.username = userData.username

            logger.info('user logged in', { username: this.user.username })

            // radiks specific stuff
            // this.radiksUser = userSession.handlePendingSignIn()
            User.createWithCurrentUser()
            window.location = window.location.origin
          })
          .catch((error) => {
            logger.error('error with pending sign in: ' + error)
          })
      } else {
        logger.info('user not signed in and sign in not pending')
        this.$router.push('/login')
      }
    },
    radiksLogin () {
      configure({
        apiServer: process.env.VUE_APP_RADIKS_URI,
        userSession
      })

      if (userSession.isUserSignedIn()) {
        logger.info('user already signed in')
        User.createWithCurrentUser()
        const currentUser = userSession.loadUserData()
        this.user = currentUser
        // this.radiksUser = currentUser
      } else if (userSession.isSignInPending()) {
        logger.info('user sign in pending')
        userSession.handlePendingSignIn()
          .then((userData) => {
            User.createWithCurrentUser()
            this.user = userSession.loadUserData()
            window.location = window.location.origin
          })
        // this.radiksUser = currentUser
      }
    }
  }
}
</script>

<style src="./assets/sass/app.scss" lang="scss"></style>
