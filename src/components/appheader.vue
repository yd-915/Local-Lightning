<template>
  <div>
    <vs-navbar type="border" v-model="activeItem" class="nabarx">
      <div slot="title">
        <vs-navbar-title>
          Local Lightning
        </vs-navbar-title>
      </div>
      <vs-navbar-item index="0">
        <router-link :to="{name: 'Home'}">Home</router-link>
      </vs-navbar-item>
      <vs-navbar-item index="1">
        <router-link :to="{name: 'Following'}">Following</router-link>
      </vs-navbar-item>
      <vs-navbar-item index="2">
        <router-link :to="{name: 'Settings'}">Settings</router-link>
      </vs-navbar-item>
      <vs-navbar-item index="3">
        <a @click="signOut">Log Out</a>
      </vs-navbar-item>

      <vs-input
        icon="search"
        placeholder="User Search"
        v-model="search"
        v-on:keyup.enter="searchUser"/>

    </vs-navbar>
  </div>
</template>

<script>
  const logger = require('heroku-logger')
  import { getConfig } from 'ln-radiks'

  export default {
    name: 'header',
    props: ['user', 'radiksUser'],
    data: () => ({
      blockstack: window.blockstack,
      userSearch: '',
      activeItem: 5,
      search: ''
    }),
    created () {
    },
    methods: {
      searchUser () {
        logger.info('searching for user: ' + this.search)
        this.$router.push({ path: `/profile/${this.search}/` })
      },
      signOut () {
        this.blockstack.signUserOut(window.location.href)
        const { userSession } = getConfig()
        userSession.signUserOut()
        // this.user = null
        // this.radiksUser = null
        this.$router.push('/login')
      }
    }
  }
</script>

<style scoped>

</style>
