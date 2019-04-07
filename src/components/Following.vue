<template>
  <div class="app-margin">
    <v-layout row>
      Following
      <vs-list
        v-for="seller in followingList"
        :key="seller.name">

        <vs-list-item
          :title="seller.username"
          :subtitle="seller.name">
            <vs-button
              color="primary"
              type="filled"
              @click="loadUser(seller.username)">
              View
            </vs-button>
        </vs-list-item>
      </vs-list>
    </v-layout>
  </div>
</template>

<script>
  const logger = require('heroku-logger')
  var PRIVATE_FRIENDS_LIST = 'private/following.json'
  export default {
    name: 'following',
    props: ['user'],
    data: () => ({
      blockstack: window.blockstack,
      followingList: [],
      loading: true
    }),
    mounted () {
      this.fetchData()
    },
    methods: {
      fetchData () {
        this.$vs.loading()
        const blockstack = this.blockstack
          // Get followingList list
        var userData = blockstack.loadUserData()
        var username = userData.username
        logger.info('Grabbing followingList list', { username: username })
        blockstack.getFile(PRIVATE_FRIENDS_LIST, { decrypt: true })
            .then((followingListJson) => {
              if (followingListJson !== null) {
                logger.info('parsing followingList list: ' + followingListJson)
                var followListParsed = JSON.parse(followingListJson || '[]')
                logger.info(followListParsed.toString())
                this.followingList = followListParsed
                this.$vs.loading.close()
              } else {
                this.$vs.loading.close()
                logger.info('followingList list empty')
              }
            })
          .catch((error) => {
            logger.error('could not get followingList list: ' + error, {username: username})
            this.$vs.loading.close()
          })
      },
      loadUser (username) {
        this.$router.push({ path: `/profile/${username}/` })
      }
    }
  }
</script>

<style scoped>

</style>
