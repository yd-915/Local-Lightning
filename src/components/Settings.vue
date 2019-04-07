<template>
  <div class="app-margin">
    <div class="centerx default-input">
      Public Information:
      <vs-input class="inputx" placeholder="Name" v-model="publicInformation.name"/>
      <vs-input class="inputx" placeholder="Email" v-model="publicInformation.email"/>
      <vs-input class="inputx" placeholder="Description" v-model="publicInformation.description"/>
      <vs-input class="inputx" placeholder="Location (City, State, Country)" v-model="publicInformation.location"/>
      <vs-input class="inputx" placeholder="Node Info (ID@IP:Port)" v-model="publicInformation.nodeInformation"/>
      <vs-button color="primary" type="filled" @click="submitPublic">Save</vs-button>
    </div>
  </div>
</template>

<script>
  const logger = require('heroku-logger')
  // var PRIVATE_STORAGE_FILE = 'private/privateInformation.json'
  var PUBLIC_STORAGE_FILE = 'public/publicInformation.json'

  export default {
    name: 'settings',
    props: ['user'],
    data: () => ({
      blockstack: window.blockstack,
      validPublic: false,
      validPrivate: false,
      nameField_Public: '',
      nameRules: [
        v => !!v || 'Name is required',
        v => (v && v.length <= 10) || 'Name must be less than 10 characters'
      ],
      emailField_Public: '',
      emailRules: [
        v => (v.length === 0 || /.+@.+/.test(v)) || 'E-mail must be valid'
      ],
      descriptionRules: [
        v => (v == null || v.length <= 1000) || 'Description must be less than 1000 characters'
      ],
      bitcoinAddressRules: [
        v => (v == null || v.length <= 42) || 'Max size of a bitcoin public key is 42 characters'
      ],
      publicInformation: {
        name: '',
        email: '',
        description: '',
        location: '',
        nodeInformation: ''
      },
      phoneField_Private: '',
      emailField_Private: '',
      privateInformation: {
        email: '',
        phoneNumber: ''
      }
    }),
    mounted () {
      this.fetchData()
    },
    methods: {
      submitPublic () {
        const blockstack = this.blockstack

        logger.info('Saving public file', { file: PUBLIC_STORAGE_FILE })
        return blockstack.putFile(PUBLIC_STORAGE_FILE, JSON.stringify(this.publicInformation), { encrypt: false })
      },
      clearPublic () {
        this.$refs.publicForm.reset()
      },
/*      submitPrivate () {
        if (this.$refs.privateForm.validate()) {
          const blockstack = this.blockstack

          // encryption is now enabled by default
          logger.info('Saving private file', { file: PRIVATE_STORAGE_FILE })
          return blockstack.putFile(PRIVATE_STORAGE_FILE, JSON.stringify(this.privateInformation), { encrypt: true })
        }
      }, */
/*      clearPrivate () {
        this.$refs.privateForm.reset()
      }, */

      fetchData () {
        const blockstack = this.blockstack
        // Get Public Info
        blockstack.getFile(PUBLIC_STORAGE_FILE, { decrypt: false }) // decryption is enabled by default
          .then((publicInformationJson) => {
            if (publicInformationJson !== null) {
              var publicInformation = JSON.parse(publicInformationJson || '[]')
              this.publicInformation = publicInformation
            }
          })
        // Get Private Info
/*        blockstack.getFile(PRIVATE_STORAGE_FILE, { decrypt: true }) // decryption is enabled by default
          .then((privateInformationJson) => {
            if (privateInformationJson !== null) {
              var privateInformation = JSON.parse(privateInformationJson || '[]')
              this.privateInformation = privateInformation
            }
          }) */
      }
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
</style>
