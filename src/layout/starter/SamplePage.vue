<template>
  <div>
    <div>
      <div class="row">
        <base-input alternative
                    class="col-4 ml-auto"
                    v-model="citySearch"
                    :placeholder="$t('home.search.city')"
                    v-on:keyup.enter="searchLocation">
        </base-input>
        <base-input alternative
                    class="col-4 ml-auto"
                    v-model="stateSearch"
                    :placeholder="$t('home.search.state')"
                    v-on:keyup.enter="searchLocation">
        </base-input>
        <base-input alternative
                    class="col-4 ml-auto"
                    v-model="countrySearch"
                    :placeholder="$t('home.search.country')"
                    v-on:keyup.enter="searchLocation">
        </base-input>
      </div>
      <card class="card" :header-classes="{'text-right': isRTL}">
        <h4 slot="header" class="card-title">
          <div class="row app-margin">
            {{tableMode === 'Selling' ? $t('home.table.sellingTable') : $t('home.table.buyingTable')}}

            <!-- button - add listing -->
            <base-button v-if="signedIn"
                         class="app-left-margin app-top-minus-two-margin"
                         type="info"
                         size="sm"
                         app-margin i
                         con
                         @click="activePrompt2 = true">
              <i class="tim-icons icon-simple-add"></i>
            </base-button>

            <!-- dropdown -->
            <div class="col-sm-6 ml-auto">
              <div class="btn-group btn-group-toggle"
                   :class="isRTL ? 'float-left' : 'float-right'"
                   data-toggle="buttons">
                <base-dropdown menu-classes="dropdown-black"
                               title-classes="btn btn-secondary"
                               :title="tableModeTitle">
                  <h6 class="dropdown-header">{{ $t('home.table.listingType') }}</h6>
                  <a class="dropdown-item" @click="selectSellingTable">{{ $t('general.selling') }}</a>
                  <a class="dropdown-item" @click="selectBuyingTable">{{ $t('general.buying') }}</a>
                </base-dropdown>
              </div>
            </div>
            <!-- endof dropdown -->

          </div>
        </h4>

        <base-table :data="selectedListings"
                    :columns="columns">
          <template slot="columns">
            <th>{{ $t('general.name') }}</th>
            <th>{{ $t('general.city') }}</th>
            <th>{{ $t('general.state') }}</th>
            <th>{{ $t('general.country') }}</th>
            <th>{{ $t('general.capacity') }}</th>
            <th>{{ $t('general.currency') }}</th>
            <th class="text-right">{{ $t('general.actions') }}</th>
          </template>
          <template slot-scope="{row}">
            <td>{{row.attrs.name}}</td>
            <td>{{row.attrs.city}}</td>
            <td>{{row.attrs.state}}</td>
            <td>{{row.attrs.country}}</td>
            <td>{{row.attrs.capacity}}</td>
            <td>{{row.attrs.currency}}</td>
            <td class="td-actions text-right">

              <!-- button - view user -->
              <base-button type="info" size="sm" icon @click="loadUser(row.attrs.createdBy)">
                <i class="tim-icons icon-single-02"></i>
              </base-button>

              <!-- button delete listing -->
              <base-button type="danger" size="sm" icon v-if="canDelete(row.attrs.createdBy)" @click="deleteListing(row)">
                <i class="tim-icons icon-simple-remove"></i>
              </base-button>
            </td>
          </template>
        </base-table>
      </card>

      <!-- ListingModal -->
      <div>
        <modal :show.sync="activePrompt2"
               body-classes="p-0"
               modal-classes="modal-dialog-centered modal-sm bottom-25">
          <card type="secondary"
                header-classes="bg-white pb-5"
                body-classes="px-lg-5 py-lg-5"
                class="border-0 mb-0">
            <template>
              <form role="form">
                <base-input alternative
                            class="mb-3"
                            v-model="newListing.city"
                            :placeholder="$t('general.city')">
                </base-input>
                <base-input alternative
                            class="mb-3"
                            v-model="newListing.state"
                            :placeholder="$t('general.state')">
                </base-input>
                <base-input alternative
                            class="mb-3"
                            v-model="newListing.country"
                            :placeholder="$t('general.country')">
                </base-input>
                <base-input alternative
                            class="mb-3"
                            v-model="newListing.capacity"
                            :placeholder="$t('general.capacity')">
                </base-input>
                <base-input v-if="tableMode === 'Buying'"
                            alternative
                            class="mb-3"
                            v-model="newListing.currency"
                            :placeholder="$t('general.currency')">
                </base-input>
                <div class="text-center">
                  <base-button
                    type="primary"
                    class="my-4"
                    @click="acceptAlert">
                    {{tableMode === 'Selling' ?
                    $t('home.table.postSellListing') : $t('home.table.postBuyListing') }}
                  </base-button>
                </div>
              </form>
            </template>
          </card>
        </modal>
      </div>
      <!-- endof ListingModal-->

      <!-- InvoiceModal -->
      <modal :show.sync="popupActive"
             body-classes="p-0"
             modal-classes="modal-dialog-centered modal-sm bottom-25">
        <card type="secondary"
              header-classes="bg-white pb-5"
              body-classes="px-lg-5 py-lg-5"
              class="border-0 mb-0">
          <template>
            <div class="text-center text-white mb-4">
              <canvas
                id="qrcode"
                height="150px"
                width="150px"></canvas>
              <hr />
              {{ $t('home.invoiceModal.savedPayInvoice') }}:
              {{ invoice.payreq }}
            </div>
            <div class="text-center text-muted mb-4">
              <a target="_blank" href="https://btcpay.locallightning.net/embed/GUktQV4Mkvth4iU7oy4XGSvcEiRH2uFad7kxJX5LwsK6/BTC/ln">
                {{ $t('home.invoiceModal.connectToLightningNode') }}
              </a>
            </div>
          </template>
        </card>
      </modal>
      <!-- endof InvoiceModal-->

      <!-- WelcomeModal -->
      <modal :show.sync="showWelcome"
             body-classes="p-0"
             modal-classes="modal-dialog-centered modal-sm bottom-25"
             @close="setViewedWelcome">
        <card type="secondary"
              header-classes="bg-white pb-5"
              body-classes="px-lg-5 py-lg-5"
              class="border-0 mb-0">
          <template>
            <div class="text-center text-white mb-4">
              <h3>⚡️ {{ $t('home.welcome.header') }} ⚡️</h3>
              <h4>
                {{ $t('home.welcome.paragraph1') }}
              </h4>
              <p class="text-center text-white mb-4">
                {{ $t('home.welcome.paragraph2') }}
              </p>
              <p class="text-center text-white mb-4">
                {{ $t('home.welcome.paragraph3') }}
              </p>
              <p class="text-center text-white mb-4">
                {{ $t('home.welcome.learnMore') }}
                <a target="_blank" href="https://coincenter.org/entry/what-is-the-lightning-network">
                  {{ $t('home.welcome.thisArticle') }}
                </a>
              </p>
            </div>
            <div class="text-center text-muted mb-4">
              <a target="_blank" href="https://btcpay.locallightning.net/embed/GUktQV4Mkvth4iU7oy4XGSvcEiRH2uFad7kxJX5LwsK6/BTC/ln">
                {{ $t('home.welcome.optionallyConnectToNode') }}
              </a>
            </div>
            <div class="text-center">
              <base-button
                type="primary"
                class="my-4"
                @click="setViewedWelcome">
                {{ $t('home.welcome.getStarted') }}
              </base-button>
            </div>
          </template>
        </card>
      </modal>
      <!-- endof WelcomeModal -->

    </div>
  </div>
</template>
<script>
  import Listing from '../../assets/models/Listing'
  import { User } from 'radiks'
  import { requestProvider } from 'webln'
  import QRious from 'qrious'

  var PUBLIC_KEY = 'public/key.json'
  var LISTING_FILE = 'Listing/listings.json'

  var { getPublicKeyFromPrivate } = require('blockstack')
  const logger = require('heroku-logger')

export default {
    name: 'starter-page',
    data: () => ({
      blockstack: window.blockstack,
      tableMode: 'Selling',
      activeItem: 0,
      search: '',
      listingsSelling: '',
      listingsBuying: '',
      selectedListings: '',
      activePrompt: false,
      activePrompt2: false,
      val: '',
      newListing: {
        name: '',
        city: '',
        state: '',
        country: '',
        capacity: '',
        currency: '',
        type: ''
      },
      listing: null,
      paid: false,
      invoice: '',
      popupActive: false,
      showWelcome: false,
      userListings: '',
      selected: '',
      webln: null,
      citySearch: '',
      stateSearch: '',
      countrySearch: '',
      columns: [
      ],
      userData: ''
    }),
    mounted () {
      this.setUpColumns()
      this.checkIfViewedWelcome()
      this.ensurePubKey()
      this.getUser()
      this.loadListings()
      this.getListings()
      this.loadWebln()
    },
    computed: {
      signedIn () {
        return this.blockstack.isUserSignedIn()
      },
      tableModeTitle () {
        return this.tableMode === 'Selling' ? this.$t('general.selling') : this.$t('general.buying')
      }
    },
    methods: {
      searchLocation () {
        this.loadListings()
      },
      loadWebln () {
        requestProvider().then((webln) => {
          console.log('using webln')
          this.webln = webln
        })
        .catch((error) => {
          console.log('not using webln: ' + error)
        })
      },
      loadUser (username) {
        this.$router.push({ path: `/profile/${username}/` })
      },
      getUser () {
        if (this.blockstack.isUserSignedIn()) {
          this.radiksUser = User.currentUser()
          this.userData = this.blockstack.loadUserData()
        }
      },
      ensurePubKey () {
        if (this.blockstack.isUserSignedIn()) {
        // store public key if not currently loaded
          this.blockstack.getFile(PUBLIC_KEY, { decrypt: false }) // decryption is enabled by default
          .then((pubKeyJson) => {
            var pubKeyExists = JSON.parse(pubKeyJson || '')
            if (!pubKeyExists) {
              var pubKey = getPublicKeyFromPrivate(this.blockstack.loadUserData().appPrivateKey)
              logger.info('Saving public key', { publicKey: pubKey })
              this.blockstack.putFile(PUBLIC_KEY, JSON.stringify(pubKey), { encrypt: false })
            }
          })
          .catch(() => {
            var pubKey = getPublicKeyFromPrivate(this.blockstack.loadUserData().appPrivateKey)
            logger.info('Could not detect public key stored, saving..', { publicKey: pubKey })
            this.blockstack.putFile(PUBLIC_KEY, JSON.stringify(pubKey), { encrypt: false })
          })
        }
      },
      getListings () {
        this.blockstack.getFile(LISTING_FILE, { decrypt: false }) // decryption is enabled by default
        .then((listingsJson) => {
          var userListings = JSON.parse(listingsJson || '')
          if (userListings) {
            logger.info('Grabbed user listings')
            this.userListings = userListings
          }
        })
        .catch((error) => {
          console.error('Could not get user listings: ' + error)
        })
      },
      saveListingToUser (listing) {
        if (this.blockstack.isUserSignedIn()) {
          console.log('Adding listing to user\'s file')
          if (this.userListings && this.userListings.length > 0) {
            // this.userListings = [listing]
            this.userListings.push(listing)
          } else {
            this.userListings = [listing]
          }
          this.blockstack.putFile(LISTING_FILE, JSON.stringify(this.userListings), {encrypt: false})
        }
      },
      loadListings () {
        console.log('Attempting to load listingsSelling')
        let sellingListOptions = ''
        sellingListOptions = {
          type: 'Selling',
          city: this.citySearch,
          state: this.stateSearch,
          country: this.countrySearch,
          sort: '-createdAt',
          limit: 100
        }
        Listing.fetchList(sellingListOptions, { decrypt: false })
        .then((listings) => {
          console.log('Listing Sellers grabbed: ' + listings)
          this.listingsSelling = listings
          if (this.tableMode === 'Selling') {
            this.selectedListings = this.listingsSelling
          }
        })

        let buyingListOptions = ''
        buyingListOptions = {
          type: 'Buying',
          city: this.citySearch,
          state: this.stateSearch,
          country: this.countrySearch,
          sort: '-createdAt',
          limit: 100
        }
        Listing.fetchList(buyingListOptions, { decrypt: false })
        .then((listings) => {
          console.log('Listing Buyers grabbed: ' + listings)
          this.listingsBuying = listings
          if (this.tableMode === 'Buying') {
            this.selectedListings = this.listingsBuying
          }
        })
      },
      acceptAlert () {
        this.$vs.loading()
        this.activePrompt2 = false
        const listing = new Listing({
          name: this.radiksUser._id,
          city: this.newListing.city,
          state: this.newListing.state,
          country: this.newListing.country,
          capacity: this.newListing.capacity,
          currency: this.tableMode === 'Selling' ? 'BTC' : this.newListing.currency,
          type: this.tableMode,
          createdBy: this.radiksUser._id
        })

        console.log('creating new listing for: ' + listing.attrs.name + ' id: ' + listing._id)
        console.log(listing)

        listing.save().then((result) => {
          console.log(result)
          this.notifySuccess(this.$t('home.notify.listingSaved'))
          // Listing.addInvoiceStreamListener(result.id, this.newLNListener)
          this.listing = listing
          this.invoice = result
          this.saveListingToUser(this.listing)
          this.$vs.loading.close()
          this.loadListings()
        })
        .catch((error) => {
          console.log('error saving listing: ' + error)
          this.$vs.loading.close()
          this.notifyFailure(this.$t('home.notify.error'), this.$t('home.notify.errorSavingUserStorage'))
        })
      },
      acceptAlertInvoice () {
        this.$vs.loading()
        this.activePrompt2 = false
        const listing = new Listing({
          name: this.radiksUser._id,
          city: this.newListing.city,
          state: this.newListing.state,
          country: this.newListing.country,
          capacity: this.newListing.capacity,
          currency: this.tableMode === 'Selling' ? 'BTC' : this.newListing.currency,
          type: this.tableMode,
          createdBy: this.radiksUser._id
        })

        console.log('creating new listing for: ' + listing.attrs.name + ' id: ' + listing._id)
        console.log(listing)

        listing.saveLN().then((result) => {
          console.log(result)
          this.notifySuccess(this.$t('home.notify.listingSaved'), this.$t('home.notify.listingSavedToYourStorage'))
          Listing.addInvoiceStreamListener(result.id, this.newLNListener)
          this.listing = listing
          this.invoice = result
          this.saveListingToUser(this.listing)
          this.$vs.loading.close()
          this.popupActive = true
          var qr = new QRious({
            element: document.getElementById('qrcode'),
            value: this.invoice.payreq,
            background: 'white', // background color
            foreground: 'black', // foreground color
            backgroundAlpha: 1,
            foregroundAlpha: 1,
            level: 'L', // Error correction level of the QR code (L, M, Q, H)
            mime: 'image/png', // MIME type used to render the image for the QR code
            size: 200, // Size of the QR code in pixels.
            padding: null // padding in pixels
          })
          console.log(qr)

          if (this.webln) {
            this.webln.sendPayment(this.invoice.payreq)
          }
        })
          .catch((error) => {
            console.log('error saving listing: ' + error)
            this.$vs.loading.close()
            this.notifyFailure(this.$t('home.notify.error'), this.$t('home.notify.errorSavingUserStorage'))
          })
      },
      checkIfViewedWelcome () {
        const viewedWelcome = localStorage.getItem('welcome')
        if (!viewedWelcome) {
          this.showWelcome = true
        }
      },
      setViewedWelcome () {
        localStorage.setItem('welcome', true)
        this.showWelcome = false
      },
      newLNListener (invoiceReceived) {
      // const { invoice } = this.state
        console.log(`invoice from ws: ${invoiceReceived}`)
        console.log(`invoice id: ${invoiceReceived.id}`)
        if (invoiceReceived.status === 'paid') {
          // todo why wont these sockets close properly
          // Listing.removeInvoiceStreamListener(this.invoice.id, this.newLNListener)
          this.paid = true
          this.invoice = ''
          this.popupActive = false
          this.notifySuccess(this.$t('home.notify.invoicePaid'), this.$t('home.notify.invoicePaidDesc'))
          this.loadListings()
        }
      },
      handleSelected (tr) {
        console.log('Clicked on user: ' + this.selected.attrs.createdBy)
        this.loadUser(this.selected.attrs.createdBy)
      },
      close () {
        this.notifyFailure(this.$t('home.notify.listingDiscarded'))
      },
      canDelete (createdBy) {
        return (
          this.userData === '' ? false : this.userData.username === createdBy
        )
      },
      deleteListing (listing) {
        listing.destroy().then(() => {
          this.notifySuccess(this.$t('home.notify.deletedListing'))
          this.loadListings()
        })
        .catch((error) => {
          logger.info('failed to delete listing: ' + error)
          this.notifyFailure(this.$t('home.notify.deletedListingFailed'))
        })
      },
      selectSellingTable () {
        this.tableMode = 'Selling'
        this.selectedListings = this.listingsSelling
      },
      selectBuyingTable () {
        this.tableMode = 'Buying'
        this.selectedListings = this.listingsBuying
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
      },
      setUpColumns () {
        this.columns = [
          this.$t('general.name'),
          this.$t('general.city'),
          this.$t('general.state'),
          this.$t('general.country'),
          this.$t('general.capacity'),
          this.$t('general.currency')
        ]
      }
    },
    components: {
    }
}
</script>
<style>
  .app-margin {
    margin: 10px;
  }
  .app-left-margin {
    margin-left: 10px;
  }
  .app-top-minus-two-margin {
    margin-top: -2px;
  }
  .bottom-25 {
    bottom: 25%;
  }
</style>
