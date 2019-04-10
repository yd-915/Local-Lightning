<template>
  <div class="wrapper">
    <side-bar>
      <template slot="links">
        <sidebar-link to="/dashboard" :name="$t('sidebar.dashboard')" icon="tim-icons icon-chart-pie-36"/>
        <sidebar-link to="/following" :name="$t('sidebar.following')" icon="tim-icons icon-chart-pie-36"/>
        <sidebar-link to="/settings" :name="$t('sidebar.settings')" icon="tim-icons icon-chart-pie-36"/>
      </template>
    </side-bar>
    <div class="main-panel">
      <top-navbar></top-navbar>

      <div class="content">
        <user-card :user="personInfo"></user-card>
      </div>
      <content-footer></content-footer>
    </div>
  </div>
</template>

<script>
  const logger = require('heroku-logger')
  import {
    Person,
    lookupProfile
  } from 'blockstack'
  var PUBLIC_STORAGE_FILE = 'public/publicInformation.json'
  var LISTING_FILE = 'Listing/listings.json'
  import UserCard from './Profile/UserCard'
  import TopNavbar from '../layout/starter/SampleNavbar.vue'
  import ContentFooter from '../layout/starter/SampleFooter.vue'
  import DashboardContent from '../layout/starter/Content.vue'
  import MobileMenu from '../layout/starter/MobileMenu'

  export default {
    name: 'profile',
    components: {
      TopNavbar,
      ContentFooter,
      DashboardContent,
      MobileMenu,
      UserCard
    },
    props: ['user'],
    data: () => ({
      blockstack: window.blockstack,
      publicInformation: {
        name: '',
        email: ''
      },
      person: '',
      personInfo: '',
      username: '',
      userNotFound: false,
      loading: true,
      userListings: ''
    }),
    mounted () {
      this.fetchData()
      this.getListings()
    },
    created () {
      this.profileId = this.$route.params.id
    },
    methods: {
      fetchData () {
        this.$vs.loading()
        const blockstack = this.blockstack
        const username = this.profileId

        logger.info('looking up profile', { username: username })
        lookupProfile(username)
          .then((profile) => {
            logger.info('found profile', { username: username })
            this.person = new Person(profile)
            this.username = username
          })
          .catch((error) => {
            logger.error('could not resolve profile: ' + error)
            this.userNotFound = true
            this.loading = false
            this.$vs.loading.close()
          })

        // get store info
        // const options = { username: username, decrypt: false, zoneFileLookupURL: 'https://core.blockstack.org/v1/names/'}
        const options = { username: username, decrypt: false, verify: false }
        blockstack.getFile(PUBLIC_STORAGE_FILE, options)
          .then((publicInformationJson) => {
            logger.info('grabbed public information file for user', { username: username })
            this.loading = false
            if (publicInformationJson !== null) {
              var publicInformation = JSON.parse(publicInformationJson || '[]')
              this.publicInformation = publicInformation
              this.personInfo = {
                username: this.username,
                person: this.person,
                publicInformation: this.publicInformation
              }
              this.$vs.loading.close()
            }
          })
          .catch((publicInfoError) => {
            console.error('could not resolve public info: ' + publicInfoError)
            this.loading = false
            this.$vs.loading.close()
          })
      },
      getListings () {
        this.$vs.loading()
        const username = this.profileId
        const options = { username: username, decrypt: false, verify: false }
        this.blockstack.getFile(LISTING_FILE, options) // decryption is enabled by default
          .then((listingsJson) => {
            var userListings = JSON.parse(listingsJson || '')
            if (userListings) {
              logger.info('Grabbed user listings')
              this.userListings = userListings
              this.$vs.loading.close()
            }
          })
          .catch(() => {
            logger.info('Could not get user listings')
            this.$vs.loading.close()
          })
      }
    }
  }
</script>

<style scoped>

</style>
