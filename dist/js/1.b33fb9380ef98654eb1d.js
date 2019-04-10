webpackJsonp([1],{

/***/ 1002:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "wrapper"
  }, [_c('side-bar', [_c('template', {
    slot: "links"
  }, [_c('sidebar-link', {
    attrs: {
      "to": "/dashboard",
      "name": _vm.$t('sidebar.dashboard'),
      "icon": "tim-icons icon-chart-pie-36"
    }
  }), _vm._v(" "), _c('sidebar-link', {
    attrs: {
      "to": "/following",
      "name": _vm.$t('sidebar.following'),
      "icon": "tim-icons icon-chart-pie-36"
    }
  }), _vm._v(" "), _c('sidebar-link', {
    attrs: {
      "to": "/settings",
      "name": _vm.$t('sidebar.settings'),
      "icon": "tim-icons icon-chart-pie-36"
    }
  })], 1)], 2), _vm._v(" "), _c('div', {
    staticClass: "main-panel"
  }, [_c('top-navbar'), _vm._v(" "), _c('div', {
    staticClass: "content"
  }, [_c('user-card', {
    attrs: {
      "user": _vm.personInfo
    }
  })], 1), _vm._v(" "), _c('content-footer')], 1)], 1)
},staticRenderFns: []}

/***/ }),

/***/ 982:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(997)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(991),
  /* template */
  __webpack_require__(1002),
  /* styles */
  injectStyle,
  /* scopeId */
  "data-v-8431c3e8",
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 984:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_json_stringify__ = __webpack_require__(138);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_json_stringify___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_json_stringify__);



var logger = __webpack_require__(43);
var PRIVATE_FOLLOW_LIST = 'private/following.json';
/* harmony default export */ __webpack_exports__["default"] = ({
  props: ['user'],
  data: function data() {
    return {
      blockstack: window.blockstack
    };
  },
  computed: {
    userEmail: function userEmail() {
      if (this.user && this.user.publicInformation && this.user.publicInformation.email) {
        return this.user.publicInformation.email;
      }
      return '';
    },
    userLocation: function userLocation() {
      if (this.user && this.user.publicInformation && this.user.publicInformation.location) {
        return this.user.publicInformation.location;
      }
      return '';
    },
    userDescription: function userDescription() {
      if (this.user && this.user.publicInformation && this.user.publicInformation.description) {
        return this.user.publicInformation.description;
      }
      return '';
    },
    userNodeInfo: function userNodeInfo() {
      if (this.user && this.user.publicInformation && this.user.publicInformation.nodeInformation) {
        return this.user.publicInformation.nodeInformation;
      }
      return '';
    }
  },
  methods: {
    addFollow: function addFollow() {
      var _this = this;

      var blockstack = this.blockstack;
      logger.info('Grabbing followingList list');
      blockstack.getFile(PRIVATE_FOLLOW_LIST, { decrypt: true }).then(function (followListJson) {
        var updateFollowList = false;
        var followList = [];
        var storeToFollow = { username: _this.user.username, name: _this.user.person.name(), avatar: _this.user.person.avatarUrl() };
        if (followListJson) {
          logger.info('followingList list: ' + followListJson);
          followList = JSON.parse(followListJson || '[]');

          var alreadyFollowing = followList.find(function (f) {
            return f.username === _this.user.username;
          });
          if (!alreadyFollowing) {
            followList.push(storeToFollow);
            updateFollowList = true;
          } else {
            logger.info('store already following');
          }
        } else {
          logger.info('followingList list empty');
          followList = [storeToFollow];
          updateFollowList = true;
        }
        if (updateFollowList) {
          logger.info('Saving private file', { file: PRIVATE_FOLLOW_LIST });
          blockstack.putFile(PRIVATE_FOLLOW_LIST, __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_json_stringify___default()(followList), { encrypt: true });
        }
      }).catch(function (error) {
        logger.error('could not get/save followingList list: ' + error);
      });
    },
    emailUser: function emailUser() {
      window.location.href = 'mailto:' + this.user.publicInformation.email;
    }
  }
});

/***/ }),

/***/ 985:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(978)(true);
// imports


// module
exports.push([module.i, "", "", {"version":3,"sources":[],"names":[],"mappings":"","file":"UserCard.vue","sourceRoot":""}]);

// exports


/***/ }),

/***/ 986:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(985);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(979)("701e3402", content, true, {});

/***/ }),

/***/ 987:
/***/ (function(module, exports, __webpack_require__) {

function injectStyle (ssrContext) {
  __webpack_require__(986)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(984),
  /* template */
  __webpack_require__(988),
  /* styles */
  injectStyle,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 988:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('card', {
    attrs: {
      "type": "user"
    }
  }, [_c('p', {
    staticClass: "card-text"
  }), _vm._v(" "), _c('div', {
    staticClass: "author"
  }, [_c('div', {
    staticClass: "block block-one"
  }), _vm._v(" "), _c('div', {
    staticClass: "block block-two"
  }), _vm._v(" "), _c('div', {
    staticClass: "block block-three"
  }), _vm._v(" "), _c('div', {
    staticClass: "block block-four"
  }), _vm._v(" "), _c('img', {
    staticClass: "avatar",
    attrs: {
      "src": "avatar-placeholder.png",
      "alt": "..."
    }
  }), _vm._v(" "), _c('h5', {
    staticClass: "title"
  }, [_vm._v("\n      " + _vm._s(_vm.user.person ? _vm.user.person.name() ? _vm.user.person.name() : _vm.user.username : "Nameless Person") + "'s Profile\n    ")]), _vm._v(" "), _c('p', {
    staticClass: "description"
  }, [_vm._v("\n      " + _vm._s(_vm.userEmail) + "\n    ")]), _vm._v(" "), _c('p', {
    staticClass: "description"
  }, [_vm._v("\n      " + _vm._s(_vm.userLocation) + "\n    ")])]), _vm._v(" "), _c('p'), _vm._v(" "), _c('div', {
    staticClass: "text-center"
  }, [_c('p', {
    staticClass: "card-description"
  }, [_vm._v("\n      " + _vm._s(_vm.userNodeInfo) + "\n    ")]), _vm._v(" "), _c('p', {
    staticClass: "card-description"
  }, [_vm._v("\n      " + _vm._s(_vm.userDescription) + "\n    ")])]), _vm._v(" "), _c('div', {
    staticClass: "button-container",
    attrs: {
      "slot": "footer"
    },
    slot: "footer"
  }, [_c('base-button', {
    attrs: {
      "round": ""
    },
    on: {
      "click": _vm.addFollow
    }
  }, [_vm._v("\n      Follow\n    ")]), _vm._v(" "), _c('base-button', {
    attrs: {
      "round": ""
    },
    on: {
      "click": _vm.emailUser
    }
  }, [_vm._v("\n      Email\n    ")])], 1)])
},staticRenderFns: []}

/***/ }),

/***/ 991:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_blockstack__ = __webpack_require__(32);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_blockstack___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_blockstack__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Profile_UserCard__ = __webpack_require__(987);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Profile_UserCard___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__Profile_UserCard__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__layout_starter_SampleNavbar_vue__ = __webpack_require__(386);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__layout_starter_SampleNavbar_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__layout_starter_SampleNavbar_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__layout_starter_SampleFooter_vue__ = __webpack_require__(385);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__layout_starter_SampleFooter_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__layout_starter_SampleFooter_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__layout_starter_Content_vue__ = __webpack_require__(383);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__layout_starter_Content_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__layout_starter_Content_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__layout_starter_MobileMenu__ = __webpack_require__(384);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__layout_starter_MobileMenu___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__layout_starter_MobileMenu__);


var logger = __webpack_require__(43);

var PUBLIC_STORAGE_FILE = 'public/publicInformation.json';
var LISTING_FILE = 'Listing/listings.json';






/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'profile',
  components: {
    TopNavbar: __WEBPACK_IMPORTED_MODULE_2__layout_starter_SampleNavbar_vue___default.a,
    ContentFooter: __WEBPACK_IMPORTED_MODULE_3__layout_starter_SampleFooter_vue___default.a,
    DashboardContent: __WEBPACK_IMPORTED_MODULE_4__layout_starter_Content_vue___default.a,
    MobileMenu: __WEBPACK_IMPORTED_MODULE_5__layout_starter_MobileMenu___default.a,
    UserCard: __WEBPACK_IMPORTED_MODULE_1__Profile_UserCard___default.a
  },
  props: ['user'],
  data: function data() {
    return {
      blockstack: window.blockstack,
      publicInformation: {
        name: '',
        email: ''
      },
      person: '',
      personInfo: '',
      username: '',
      userNotFound: false,
      loading: true,
      userListings: ''
    };
  },
  mounted: function mounted() {
    this.fetchData();
    this.getListings();
  },
  created: function created() {
    this.profileId = this.$route.params.id;
  },

  methods: {
    fetchData: function fetchData() {
      var _this = this;

      this.$vs.loading();
      var blockstack = this.blockstack;
      var username = this.profileId;

      logger.info('looking up profile', { username: username });
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0_blockstack__["lookupProfile"])(username).then(function (profile) {
        logger.info('found profile', { username: username });
        _this.person = new __WEBPACK_IMPORTED_MODULE_0_blockstack__["Person"](profile);
        _this.username = username;
      }).catch(function (error) {
        logger.error('could not resolve profile: ' + error);
        _this.userNotFound = true;
        _this.loading = false;
        _this.$vs.loading.close();
      });

      var options = { username: username, decrypt: false, verify: false };
      blockstack.getFile(PUBLIC_STORAGE_FILE, options).then(function (publicInformationJson) {
        logger.info('grabbed public information file for user', { username: username });
        _this.loading = false;
        if (publicInformationJson !== null) {
          var publicInformation = JSON.parse(publicInformationJson || '[]');
          _this.publicInformation = publicInformation;
          _this.personInfo = {
            username: _this.username,
            person: _this.person,
            publicInformation: _this.publicInformation
          };
          _this.$vs.loading.close();
        }
      }).catch(function (publicInfoError) {
        console.error('could not resolve public info: ' + publicInfoError);
        _this.loading = false;
        _this.$vs.loading.close();
      });
    },
    getListings: function getListings() {
      var _this2 = this;

      this.$vs.loading();
      var username = this.profileId;
      var options = { username: username, decrypt: false, verify: false };
      this.blockstack.getFile(LISTING_FILE, options).then(function (listingsJson) {
        var userListings = JSON.parse(listingsJson || '');
        if (userListings) {
          logger.info('Grabbed user listings');
          _this2.userListings = userListings;
          _this2.$vs.loading.close();
        }
      }).catch(function () {
        logger.info('Could not get user listings');
        _this2.$vs.loading.close();
      });
    }
  }
});

/***/ }),

/***/ 993:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(978)(true);
// imports


// module
exports.push([module.i, "", "", {"version":3,"sources":[],"names":[],"mappings":"","file":"Profile.vue","sourceRoot":""}]);

// exports


/***/ }),

/***/ 997:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(993);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(979)("8487c9e2", content, true, {});

/***/ })

});
//# sourceMappingURL=1.b33fb9380ef98654eb1d.js.map