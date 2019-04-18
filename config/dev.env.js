var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  VUE_APP_APP_URI: '"http://localhost:8090"',
  VUE_APP_RADIKS_URI: '"http://localhost:1260"'
})
