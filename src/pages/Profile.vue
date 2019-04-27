<template>
  <div class="wrapper">
    <side-bar title="Local Lightning">
      <template slot="links">
        <sidebar-link to="/home" :name="$t('sidebar.listings')" icon="tim-icons icon-paper"/>
        <sidebar-link v-if="signedIn" to="/following" :name="$t('sidebar.following')" icon="tim-icons icon-single-02"/>
        <sidebar-link v-if="signedIn" to="/settings" :name="$t('sidebar.settings')" icon="tim-icons icon-settings"/>
      </template>
    </side-bar>
    <div class="main-panel">
      <top-navbar></top-navbar>

      <div class="content">
        <user-card :user="personInfo"></user-card>

        <!-- Table -->
        <card class="card" :header-classes="{'text-right': isRTL}">
          <h4 slot="header" class="card-title">
            <div class="row app-margin">
              Listings
            </div>
          </h4>
          <base-table :data="userListings"
                      :columns="columns">
            <template slot="columns">
              <th>Name</th>
              <th>City</th>
              <th>State</th>
              <th>Country</th>
              <th>Capacity</th>
              <th>Currency</th>
            </template>
            <template slot-scope="{row}">
              <td>{{row.attrs.name}}</td>
              <td>{{row.attrs.city}}</td>
              <td>{{row.attrs.state}}</td>
              <td>{{row.attrs.country}}</td>
              <td>{{row.attrs.capacity}}</td>
              <td>{{row.attrs.currency}}</td>
              <td  v-if="canDelete(row.attrs.createdBy)"
                   class="td-actions text-right">

                <!-- button delete listing -->
                <base-button type="danger" size="sm" icon @click="deleteListing(row)">
                  <i class="tim-icons icon-simple-remove"></i>
                </base-button>
              </td>
            </template>
          </base-table>
        </card>
        <!-- endof Table-->
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
  import { User } from 'radiks'
  import Listing from '../assets/models/Listing'
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
      userListings: '',
      userData: ''
    }),
    mounted () {
      this.fetchData()
      this.getListings()
      this.getUser()
    },
    created () {
      this.profileId = this.$route.params.id
    },
    computed: {
      signedIn () {
        return this.blockstack.isUserSignedIn()
      }
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
            this.notifyFailure('User Not Found')
            this.$vs.loading.close()
          })

        // get store info
        // const options = { username: username, decrypt: false, zoneFileLookupURL: 'https://core.blockstack.org/v1/names/'}
        const options = { username: username, decrypt: false, verify: false }
        blockstack.getFile(PUBLIC_STORAGE_FILE, options)
          .then((publicInformationJson) => {
            logger.info('grabbed public information file for user', { username: username })
            this.$vs.loading.close()
            if (publicInformationJson !== null) {
              var publicInformation = JSON.parse(publicInformationJson || '[]')
              this.publicInformation = publicInformation
              this.personInfo = {
                username: this.username,
                person: this.person,
                publicInformation: this.publicInformation
              }
            }
          })
          .catch((publicInfoError) => {
            console.error('could not resolve public info: ' + publicInfoError)
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
      },
      deleteListing (listing) {
        const listingToDelete = listing
        const index = this.userListings.indexOf(listingToDelete)
        confirm('Are you sure you want to delete this listing?') &&
        this.userListings.splice(index, 1) &&
        this.updateListings()

        Listing.findById(listingToDelete._id)
          .then((radiksListing) => {
            radiksListing.destroy().then(() => {
              // this.notifySuccess('Deleted Listing from Radiks', null)
              this.loadListings()
            })
          })
          .catch((error) => {
            logger.info('failed to delete listing from server: ' + error)
            this.notifyFailure('Failed To Delete Listing from server', null)
          })
      },
      updateListings () {
        this.blockstack.putFile(LISTING_FILE, JSON.stringify(this.userListings), {encrypt: false})
          .then(() => {
            this.notifySuccess('Removed', 'Removed listing')
          })
          .catch((error) => {
            this.notifyFailure('Failure To Delete Listing from your storage', error)
          })
      },
      getUser () {
        if (this.blockstack.isUserSignedIn()) {
          this.radiksUser = User.currentUser()
          this.userData = this.blockstack.loadUserData()
        }
      },
      canDelete (createdBy) {
        return (
          this.userData === '' ? false : this.userData.username === createdBy
        )
      },
      notifySuccess (title, text) {
        this.$vs.notify({
          color: 'success',
          title: title,
          text: text
        })
      },
      notifyFailure (title, text) {
        this.$vs.notify({
          color: 'danger',
          title: title,
          text: text
        })
      }
    }
  }
</script>

<style scoped>
  .app-margin {
    margin: 10px;
  }
  .app-left-margin {
    margin-left: 10px;
  }
  .app-top-minus-two-margin {
    margin-top: -2px;
  }
</style>
