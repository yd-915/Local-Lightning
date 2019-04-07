<template>
  <div class="app-margin">
    <div class="container">
      <div class="row">
        <div class="text-xs-center"
             v-if="loading">
        </div>
        <div class="col-md-8 col-md-offset-2" v-if="!userNotFound && !loading">
          <h2 class="user-info">
            <small>
              <p>{{ person ? person.name() ? person.name() : this.username : "Nameless Person" }}'s Profile</p>
              <p>{{this.publicInformation.email ? this.publicInformation.email : ''}}</p>
              <p>{{this.publicInformation.description ? this.publicInformation.description : ''}}</p>
              <p>{{this.publicInformation.location ? this.publicInformation.location : ''}}</p>
              <p>{{this.publicInformation.nodeInformation ? this.publicInformation.nodeInformation : ''}}</p>
            </small>

            <vs-button color="primary" type="filled"
              @click="addFollow">
                Follow
            </vs-button>


            <vs-button color="primary" type="filled"
                       :href="`mailto:${publicInformation.email}`">
              Email
            </vs-button>

          </h2>
        </div>
        <div>
          <!-- Buying Table -->
          <vs-table max-items="10" stripe pagination :data="userListings">
            <template slot="header">
              <h3>
                Listings for this user
              </h3>
            </template>
            <template slot="thead">
              <vs-th>
                Name
              </vs-th>
              <vs-th>
                Location
              </vs-th>
              <vs-th>
                Capacity
              </vs-th>
              <vs-th>
                Currency
              </vs-th>
            </template>

            <template slot-scope="{data}">
              <vs-tr :key="indextr" v-for="(tr, indextr) in data" >
                <vs-td :data="data[indextr].attrs.name">
                  {{data[indextr].attrs.name}}
                </vs-td>

                <vs-td :data="data[indextr].attrs.location">
                  {{data[indextr].attrs.location}}
                </vs-td>

                <vs-td :data="data[indextr].attrs.capacity">
                  {{data[indextr].attrs.capacity}}
                </vs-td>

                <vs-td :data="data[indextr].attrs.currency">
                  {{data[indextr].attrs.currency}}
                </vs-td>
              </vs-tr>
            </template>
          </vs-table>
        </div>
        <div v-if="userNotFound" align="center">
          <img src="../assets/pictures/user-does-not-exist.jpg">
        </div>
      </div>
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
  var PRIVATE_FOLLOW_LIST = 'private/following.json' // TODO globalize
  var LISTING_FILE = 'Listing/listings.json'

  export default {
    name: 'profile',
    props: ['user'],
    data: () => ({
      blockstack: window.blockstack,
      publicInformation: {
        name: '',
        email: ''
      },
      person: '',
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
              this.$vs.loading.close()
            }
          })
          .catch((publicInfoError) => {
            console.error('could not resolve public info: ' + publicInfoError)
            this.loading = false
            this.$vs.loading.close()
          })
      },
      addFollow () {
        // first grab follow list
        const blockstack = this.blockstack
        var userData = blockstack.loadUserData()
        var username = userData.username
        logger.info('Grabbing followingList list', { username: username })
        blockstack.getFile(PRIVATE_FOLLOW_LIST, { decrypt: true })
          .then((followListJson) => {
            var updateFollowList = false
            var followList = []
            var storeToFollow = {username: this.username, name: this.person.name(), avatar: this.person.avatarUrl()}
            if (followListJson) {
              logger.info('followingList list: ' + followListJson)
              followList = JSON.parse(followListJson || '[]')
              // check if user is already a friend
              var alreadyFollowing = followList.find(f => f.username === this.username)
              if (!alreadyFollowing) {
                followList.push(storeToFollow)
                updateFollowList = true
              } else {
                logger.info('store already following')
              }
            } else {
              logger.info('followingList list empty')
              followList = [ storeToFollow ]
              updateFollowList = true
            }
            if (updateFollowList) {
              logger.info('Saving private file', {file: PRIVATE_FOLLOW_LIST})
              blockstack.putFile(PRIVATE_FOLLOW_LIST, JSON.stringify(followList), {encrypt: true})
            }
          })
          .catch((error) => {
            logger.error('could not get/save followingList list: ' + error, {username: username})
            // todo throw error
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
    },
    components: {
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>

  input::placeholder {
    color: grey;
  }

  label {
    margin-bottom: 0;
    // width: 100%;
    cursor: pointer;
    input[type="checkbox"] {
      margin-right: 5px;
    }
  }
  .custom-avatar {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .list-group-item {
    &.completed label {
      text-decoration: line-through;
    }

    .delete {
      display: none;
    }

    &:hover .delete {
      display: inline;
      color: grey;
      &:hover {
        text-decoration: none;
        color: red;
      }
    }
  }

  .store-item-card {
    margin: 10px
  }
</style>

