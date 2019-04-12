<template>
  <card>
    <h5 slot="header" class="title">Edit Profile</h5>
    <div class="row">
      <div class="col-md-3 px-md-1">
        <base-input label="Name"
                  placeholder="Name"
                  v-model="publicInformation.name">
        </base-input>
      </div>
      <div class="col-md-4 pl-md-1">
        <base-input label="Email address"
                  type="email"
                  placeholder="Email"
                  v-model="publicInformation.email">
        </base-input>
      </div>
      <div class="col-md-6 pr-md-1">
        <base-input label="Location"
                    v-model="publicInformation.location"
                    placeholder="Location">
        </base-input>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <base-input label="Node Information"
                  v-model="publicInformation.nodeInformation"
                  placeholder="Node Information">
        </base-input>
      </div>
    </div>
<!--    <div class="row">
      <div class="col-md-4 pr-md-1">
        <base-input label="City"
                  v-model="model.city"
                  placeholder="City">
        </base-input>
      </div>
      <div class="col-md-4 px-md-1">
        <base-input label="Country"
                  v-model="model.country"
                  placeholder="Country">
        </base-input>
      </div>
      <div class="col-md-4 pl-md-1">
        <base-input label="Postal Code"
                  placeholder="ZIP Code">
        </base-input>
      </div>
    </div>-->
    <div class="row">
      <div class="col-md-8">
        <base-input>
          <label>About Me</label>
          <textarea rows="4" cols="80"
                    class="form-control"
                    placeholder="Here can be your description"
                    v-model="publicInformation.description">
              </textarea>
        </base-input>
      </div>
    </div>
    <base-button slot="footer" type="primary" fill @click="submitPublic">Save</base-button>
  </card>
</template>
<script>
  const logger = require('heroku-logger')
  // var PRIVATE_STORAGE_FILE = 'private/privateInformation.json'
  var PUBLIC_STORAGE_FILE = 'public/publicInformation.json'

  export default {
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
      }
    }
  }
</script>
<style>
</style>
