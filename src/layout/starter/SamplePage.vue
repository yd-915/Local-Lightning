<template>
  <div>
    <div>
      <div class="row">
        <base-input alternative
                    class="col-4 ml-auto"
                    v-model="citySearch"
                    placeholder="Search City"
                    v-on:keyup.enter="searchLocation">
        </base-input>
        <base-input alternative
                    class="col-4 ml-auto"
                    v-model="stateSearch"
                    placeholder="Search State"
                    v-on:keyup.enter="searchLocation">
        </base-input>
        <base-input alternative
                    class="col-4 ml-auto"
                    v-model="countrySearch"
                    placeholder="Search Country"
                    v-on:keyup.enter="searchLocation">
        </base-input>
      </div>
      <card class="card" :header-classes="{'text-right': isRTL}">
        <h4 slot="header" class="card-title">
          <div class="row app-margin">
            {{tableMode === 'Selling' ? $t('dashboard.sellingTable') : $t('dashboard.buyingTable')}}

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
                               :title="tableMode">
                  <h6 class="dropdown-header">Listing Type</h6>
                  <a class="dropdown-item" @click="selectSellingTable">Selling</a>
                  <a class="dropdown-item" @click="selectBuyingTable">Buying</a>
                </base-dropdown>
              </div>
            </div>
            <!-- endof dropdown -->
          </div>
        </h4>
        <base-table :data="selectedListings"
                    :columns="columns">
          <template slot="columns">
            <th>Name</th>
            <th>City</th>
            <th>State</th>
            <th>Country</th>
            <th>Capacity</th>
            <th>Currency</th>
            <th class="text-right">Actions</th>
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
               modal-classes="modal-dialog-centered modal-sm">
          <card type="secondary"
                header-classes="bg-white pb-5"
                body-classes="px-lg-5 py-lg-5"
                class="border-0 mb-0">
            <template>
              <form role="form">
                <base-input alternative
                            class="mb-3"
                            v-model="newListing.city"
                            placeholder="City">
                </base-input>
                <base-input alternative
                            class="mb-3"
                            v-model="newListing.state"
                            placeholder="State">
                </base-input>
                <base-input alternative
                            class="mb-3"
                            v-model="newListing.country"
                            placeholder="Country">
                </base-input>
                <base-input alternative
                            class="mb-3"
                            v-model="newListing.capacity"
                            placeholder="Capacity">
                </base-input>
                <base-input v-if="tableMode === 'Buying'"
                            alternative
                            class="mb-3"
                            v-model="newListing.currency"
                            placeholder="Currency">
                </base-input>
                <div class="text-center">
                  <base-button type="primary" class="my-4" @click="acceptAlert">Post {{tableMode === 'Selling' ? 'Sell' : 'Buy'}} Listing</base-button>
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
             modal-classes="modal-dialog-centered modal-sm">
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
              Saved to user's storage, pay invoice to post to listing feed:
              {{invoice.payreq}}
            </div>
            <div class="text-center text-muted mb-4">
              <a target="_blank" href="https://btcpay.locallightning.net/embed/GUktQV4Mkvth4iU7oy4XGSvcEiRH2uFad7kxJX5LwsK6/BTC/ln">Connect to LocalLightning's Lightning Node</a>
            </div>
          </template>
        </card>
      </modal>
      <!-- endof InvoiceModal-->
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
      userListings: '',
      selected: '',
      webln: null,
      citySearch: '',
      stateSearch: '',
      countrySearch: '',
      columns: ['name', 'city', 'state', 'country', 'capacity', 'currency'],
      userData: ''
    }),
    mounted () {
      this.ensurePubKey()
      this.getUser()
      this.loadListings()
      this.getListings()
      this.loadWebln()
    },
    computed: {
      signedIn () {
        return this.blockstack.isUserSignedIn()
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
          this.notifySuccess('Listing Saved')
          // Listing.addInvoiceStreamListener(result.id, this.newLNListener)
          this.listing = listing
          this.invoice = result
          this.saveListingToUser(this.listing)
          this.$vs.loading.close()
/*          this.popupActive = true
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
          } */

          this.loadListings()
        })
        .catch((error) => {
          console.log('error saving listing: ' + error)
          this.$vs.loading.close()
          this.notifyFailure('Did not save Listing', 'Error saving listing to user\'s storage')
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
          this.notifySuccess('Saved Listing', 'Listing saved to your storage')
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
            this.notifyFailure('Did not save Listing', 'Error saving listing to user\'s storage')
          })
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
          this.notifySuccess('Invoice Paid', 'Listing posted to the listing feed')
          this.loadListings()
        }
      },
      handleSelected (tr) {
        console.log('Clicked on user: ' + this.selected.attrs.createdBy)
        this.loadUser(this.selected.attrs.createdBy)
      },
      close () {
        this.notifyFailure('Listing Discarded', null)
      },
      bigLineChartCategories () {
        return this.$t('dashboard.chartCategories')
      },
      canDelete (createdBy) {
        return (
          this.userData === '' ? false : this.userData.username === createdBy
        )
      },
      deleteListing (listing) {
        listing.destroy().then(() => {
          this.notifySuccess('Deleted Listing', null)
          this.loadListings()
        })
        .catch((error) => {
          logger.info('failed to delete listing: ' + error)
          this.notifyFailure('Failed To Delete Listing', null)
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
      }
    },
    components: {
    }
}
</script>
<style>
</style>
