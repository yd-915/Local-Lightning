<template>
  <div class="wrapper">
    <side-bar title="Local Lightning">
      <template slot="links">
        <sidebar-link to="/home" :name="$t('sidebar.listings')" icon="tim-icons icon-paper"/>
        <sidebar-link to="/following" :name="$t('sidebar.following')" icon="tim-icons icon-single-02"/>
        <sidebar-link to="/settings" :name="$t('sidebar.settings')" icon="tim-icons icon-settings"/>
      </template>
    </side-bar>
    <div class="main-panel">
      <top-navbar v-bind:user=user></top-navbar>

      <dashboard-content @click.native="toggleSidebar">

      </dashboard-content>

      <content-footer></content-footer>
    </div>
  </div>
</template>
<style lang="scss">
</style>
<script>
  import TopNavbar from './SampleNavbar.vue'
import ContentFooter from './SampleFooter.vue'
import DashboardContent from './Content.vue'
import MobileMenu from './MobileMenu'
export default {
    props: ['user'],
    components: {
      TopNavbar,
      ContentFooter,
      DashboardContent,
      MobileMenu
    },
    methods: {
      toggleSidebar () {
        if (this.$sidebar.showSidebar) {
          this.$sidebar.displaySidebar(false)
        }
      }
    }
  }
</script>
