<template>
  <card>
    <h5 slot="header" class="title">{{ $t('editProfile.editProfile') }}</h5>
    <div class="row">
      <div class="col-md-3 px-md-1">
        <base-input :label="$t('general.name')"
                    :placeholder="$t('general.name')"
                    v-model="publicInformation.name">
        </base-input>
      </div>
      <div class="col-md-4 pl-md-1">
        <base-input :label="$t('general.email')"
                    type="email"
                    :placeholder="$t('general.email')"
                    v-model="publicInformation.email">
        </base-input>
      </div>
      <div class="col-md-6 pr-md-1">
        <base-input :label="$t('general.location')"
                    v-model="publicInformation.location"
                    :placeholder="$t('general.location')" >
        </base-input>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <base-input :label="$t('general.nodeInformation')"
                  v-model="publicInformation.nodeInformation"
                  :placeholder="$t('general.nodeInformation')">
        </base-input>
      </div>
    </div>
    <div class="row">
      <div class="col-md-8">
        <base-input>
          <label>{{ $t('general.aboutMe') }}</label>
          <textarea rows="4" cols="80"
                    class="form-control"
                    v-model="publicInformation.description"
                    :placeholder="$t('general.description')">
              </textarea>
        </base-input>
      </div>
    </div>
    <base-button slot="footer" type="primary" fill @click="submitPublic">
      {{ $t('general.save') }}
    </base-button>
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
      emailField_Public: '',
      publicInformation: {
        name: '',
        email: '',
        description: '',
        location: '',
        nodeInformation: ''
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
          .then(() => {
            this.notifySuccess(this.$t('editProfile.alerts.savedProfile'), null)
          })
          .catch((error) => {
            this.notifyFailure(this.$t('editProfile.alerts.failedSavedProfile'), error.message)
          })
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
<style>
</style>
