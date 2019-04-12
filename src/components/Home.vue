<template>
  <div class="app-margin">
    <!-- Selling Table -->
    <vs-input
      class="header-table vs-table--header app-justify-right"

      icon="search"
      placeholder="Location Search"
      v-model="locationSearch"
      v-on:keyup.enter="searchLocation"/>

    <vs-table
      max-items="10"
      pagination
      stripe
      v-model="selected"
      @selected="handleSelected"
      :data="listingsSelling">
      <template slot="header">
        <div>
        <h3>
          Selling via Lightning
          <vs-button
            @click="activePrompt2 = true"
            color="primary"
            type="border">Add</vs-button>
        </h3>
        </div>
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
        <vs-tr :data="tr" :key="indextr" v-for="(tr, indextr) in data" >
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

    <!-- Buying Table -->
    <vs-table
      max-items="10"
      pagination
      stripe
      v-model="selected"
      @selected="handleSelected"
      :data="listingsBuying">
      <template slot="header">
        <h3>
          Buying via Lightning
          <vs-button
            @click="activePrompt2 = true"
            color="primary"
            type="border">Add</vs-button>
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
        <vs-tr :data="tr" :key="indextr" v-for="(tr, indextr) in data" >
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

    <!-- Adding Dialog -->
    <vs-prompt
      @vs-cancel="newListing.name='',newListing.location='',newListing.capacity='',newListing.currency='',newListing.type=''"
      @vs-accept="acceptAlert"
      @vs-close="close"
      :vs-is-valid="validForm"
      :vs-active.sync="activePrompt2">
      <div class="con-exemple-prompt">
        Enter listing info and hit <b>accept</b> to save.
        <vs-input placeholder="Name" v-model="newListing.name"/>
        <vs-input placeholder="Location" v-model="newListing.location"/>
        <vs-input placeholder="Capacity" v-model="newListing.capacity"/>
        <vs-input placeholder="Currency" v-model="newListing.currency"/>
        <vs-input placeholder="Type" v-model="newListing.type"/>

        <vs-alert :vs-active="!validForm" color="danger" vs-icon="new_releases" >
          Fields can not be empty.
        </vs-alert>
      </div>
    </vs-prompt>

    <!-- Lightning Payment Popup -->
    <vs-popup class="holamundo"  title="Pay Invoice" :active.sync="popupActive">
      <canvas
        id="qrcode"
        height="150px"
        width="150px"></canvas>
      <p>
        Listing saved to user's storage, pay invoice to post to listing feed:
        {{invoice.payreq}}
      </p>
    </vs-popup>

  </div>
</template>

<script>
  import Listing from '../assets/models/Listing'
  import { User } from 'radiks'
  import { requestProvider } from 'webln'
  import QRious from 'qrious'

  var PUBLIC_KEY = 'public/key.json'
  var LISTING_FILE = 'Listing/listings.json'

  var { getPublicKeyFromPrivate } = require('blockstack')
  const logger = require('heroku-logger')
  export default {
    name: 'home',
    props: ['user'],
    data: () => ({
      blockstack: window.blockstack,
      activeItem: 0,
      search: '',
      listingsSelling: '',
      listingsBuying: '',
      activePrompt: false,
      activePrompt2: false,
      val: '',
      newListing: {
        name: '',
        location: '',
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
      locationSearch: ''
    }),
    mounted () {
      this.ensurePubKey()
      this.getUser()
      this.loadListings()
      this.getListings()
      this.loadWebln()
    },
    computed: {
      validForm () {
        return (
          this.newListing.name.length > 0 &&
          this.newListing.location.length > 0 &&
          this.newListing.capacity.length > 0 &&
          this.newListing.currency.length > 0 &&
          this.newListing.type.length > 0
        )
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
        this.radiksUser = User.currentUser()
      },
      ensurePubKey () {
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
        console.log('Adding listing to user\'s file')
        if (this.userListings && this.userListings.length > 0) {
          this.userListings.push(listing)
        } else {
          this.userListings = [listing]
        }
        this.blockstack.putFile(LISTING_FILE, JSON.stringify(this.userListings), { encrypt: false })
      },
      loadListings () {
        console.log('Attempting to load listingsSelling')
        let sellingListOptions = ''
        if (this.locationSearch) {
          sellingListOptions = {
            type: 'Selling',
            location: this.locationSearch,
            sort: '-createdAt',
            limit: 100
          }
        } else {
          sellingListOptions = {
            type: 'Selling',
            sort: '-createdAt',
            limit: 100
          }
        }
        Listing.fetchList(sellingListOptions, { decrypt: false })
          .then((listings) => {
            console.log('Listing Sellers grabbed: ' + listings)
            this.listingsSelling = listings
          })

        let buyingListOptions = ''
        if (this.locationSearch) {
          buyingListOptions = {
            type: 'Buying',
            location: this.locationSearch,
            sort: '-createdAt',
            limit: 100
          }
        } else {
          buyingListOptions = {
            type: 'Buying',
            sort: '-createdAt',
            limit: 100
          }
        }
        Listing.fetchList(buyingListOptions, { decrypt: false })
          .then((listings) => {
            console.log('Listing Buyers grabbed: ' + listings)
            this.listingsBuying = listings
          })
      },
      acceptAlert () {
        this.$vs.loading()
        const listing = new Listing({
          name: this.newListing.name,
          location: this.newListing.location,
          capacity: this.newListing.capacity,
          currency: this.newListing.currency,
          type: this.newListing.type,
          createdBy: this.radiksUser._id
        })

        console.log('creating new listing for: ' + listing.attrs.name + ' id: ' + listing._id)

        listing.saveLN().then((result) => {
          console.log(result)
          // console.log(result.payreq)
          // console.log(result.id)
          Listing.addInvoiceStreamListener(result.id, this.newLNListener.bind(this))
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
          })

        this.$vs.notify({
          color: 'success',
          title: 'Saved Listing',
          text: 'Listing saved to your storage'
        })
      },
      newLNListener (invoiceReceived) {
        // const { invoice } = this.state
        console.log(`invoice from ws: ${invoiceReceived}`)
        console.log(`invoice id: ${invoiceReceived.id}`)
        if (invoiceReceived.status === 'paid') {
          this.paid = true
          this.invoice = ''
          this.popupActive = false
          this.$vs.notify({
            color: 'success',
            title: 'Invoice Paid',
            text: 'Listing posted to the listing feed'
          })
          this.loadListings()
        }
      },
      handleSelected (tr) {
        console.log('Clicked on user: ' + this.selected.attrs.createdBy)
        this.loadUser(this.selected.attrs.createdBy)
      },
      close () {
        this.$vs.notify({
          color: 'danger',
          title: 'Listing Discarded',
          text: ':('
        })
      }
    },
    components: {
    }
  }
</script>

<style scoped>
  .app-justify-right {
    height: 100%;
    display: flex;
    align-items: center;
    float: right;
    right: 0px;
  }


</style>
