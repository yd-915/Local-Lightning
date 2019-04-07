<template>
  <div class="hello">
    <div>
      <h1>Local Lightning</h1>
      <p>A lightning app built on <a href="https://blockstack.org" target="_blank">Blockstack</a></p>
      <button class="btn btn-default" @click.prevent="radiksSignIn">Sign In With Blockstack</button>
    </div>
  </div>
</template>

<script>
import { getConfig } from 'ln-radiks'
const logger = require('heroku-logger')

export default {
  name: 'landing',
  data () {
    return {
      blockstack: window.blockstack
    }
  },

  methods: {
    signIn () {
      logger.info('Sign in to blockstack request')
      const blockstack = this.blockstack
      blockstack.redirectToSignIn(window.location.origin, window.location.origin + '/manifest.json', ['store_write', 'publish_data'])
    },
    radiksSignIn () {
      const { userSession } = getConfig()
      userSession.redirectToSignIn()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.hello {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
