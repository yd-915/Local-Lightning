<template>
  <div>
    <div>
      <card class="card" :header-classes="{'text-right': isRTL}">
        <h4 slot="header" class="card-title">{{$t('dashboard.sellingTable')}}</h4>
        <base-table :data="listingsSelling"
                    :columns="columns">
          <template slot="columns">
            <th>Name</th>
            <th>Location</th>
            <th>Capacity</th>
            <th>Currency</th>
            <th class="text-right">Actions</th>
          </template>
          <template slot-scope="{row}">
            <td>{{row.attrs.name}}</td>
            <td>{{row.attrs.location}}</td>
            <td>{{row.attrs.capacity}}</td>
            <td>{{row.attrs.currency}}</td>
            <td class="td-actions text-right">
              <base-button type="info" size="sm" icon>
                <i class="tim-icons icon-single-02"></i>
              </base-button>
              <base-button type="success" size="sm" icon>
                <i class="tim-icons icon-settings"></i>
              </base-button>
              <base-button type="danger" size="sm" icon>
                <i class="tim-icons icon-simple-remove"></i>
              </base-button>
            </td>
          </template>
        </base-table>
      </card>
    </div>
  </div>
</template>
<script>
  import Listing from '../../assets/models/Listing'
  import { User } from 'ln-radiks'
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
      locationSearch: '',
      columns: ['name', 'location', 'capacity', 'currency']
    }),
    mounted () {
      this.ensurePubKey()
      this.getUser()
      this.loadListings()
      this.getListings()
      this.loadWebln()
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
<style></style>
