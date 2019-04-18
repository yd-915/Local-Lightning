<template>
  <div>
    <card class="card" :header-classes="{'text-right': isRTL}">
      <h4 slot="header" class="card-title">{{$t('dashboard.followingList')}}</h4>
      <base-table :data="followingList"
                  :columns="columns">
        <template slot="columns">
          <th>Name</th>
          <th>Username</th>
          <th class="text-right">Actions</th>
        </template>
        <template slot-scope="{row}">
          <td>{{row.name}}</td>
          <td>{{row.username}}</td>
          <td class="td-actions text-right">
            <base-button type="info" size="sm" icon @click="loadUser(row.username)">
              <i class="tim-icons icon-single-02"></i>
            </base-button>
            <base-button type="danger" size="sm" icon @click="deleteUser(row)">
              <i class="tim-icons icon-simple-remove"></i>
            </base-button>
          </td>
        </template>
      </base-table>
    </card>
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
      loading: true,
      columns: ['name', 'username']
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
      },
      deleteUser (user) {
        const index = this.followingList.indexOf(user)

        confirm('Are you sure you want to stop following this user?') &&
        this.followingList.splice(index, 1) &&
        this.updateFollowingList()
      },
      updateFollowingList () {
        this.blockstack.putFile(PRIVATE_FRIENDS_LIST, JSON.stringify(this.followingList), {encrypt: true})
          .then(() => {
            this.notifySuccess('Removed', 'Removed user from following list')
          })
          .catch((error) => {
            this.notifyFailure('Failure To Remove', error)
          })
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

</style>
