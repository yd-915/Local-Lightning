import Vue from 'vue'
import Router from 'vue-router'
import Landing from '@/components/Landing'
import DashboardLayout from '../layout/starter/SampleLayout.vue'
import Starter from '../layout/starter/SamplePage.vue'
const EditProfile = () => import(/* webpackChunkName: "common" */ '@/pages/EditProfile.vue')
const Following = () => import(/* webpackChunkName: "common" */ '@/pages/Following.vue')
const Profile = () => import(/* webpackChunkName: "common" */ '@/pages/Profile.vue')

Vue.use(Router)

let router = new Router({
  routes: [
/*    {
      path: '/',
      name: 'Home',
      component: require('@/views/HomeView')
    }, */
    {
      path: '/',
      name: 'home',
      redirect: '/dashboard',
      component: DashboardLayout,
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          components: { default: Starter }
        },
        {
          path: 'settings',
          name: 'Settings',
          component: EditProfile
        },
        {
          path: 'following',
          name: 'Following',
          component: Following
        }
      ]
    },
    {
      path: '/login',
      name: 'Landing',
      component: Landing
    },
    {
      path: '/profile/:id',
      name: 'Profile',
      component: Profile
    },
    {
      path: '/following',
      name: 'Following',
      component: require('@/views/FollowingView')
    },
    {
      path: '/settings',
      name: 'Settings',
      component: require('@/views/SettingsView')
    } /* ,
    {
      path: '/profile/:id/item/:itemId',
      name: 'ViewItem',
      component: require('@/views/ViewItemView')
    },
    {
      path: '/additem',
      name: 'AddItem',
      component: require('@/views/AddItemView')
    },
    {
      path: '/cart',
      name: 'Cart',
      component: require('@/views/CartView')
    },
    {
      path: '/orders',
      name: 'Orders',
      component: require('@/views/OrdersView')
    },
    {
      path: '/storeorders',
      name: 'StoreOrders',
      component: require('@/views/StoreOrdersView')
    },
    {
      path: '/importorder',
      name: 'ImportOrder',
      component: require('@/views/ImportOrderView')
    },
    {
      path: '/storeitems',
      name: 'StoreItems',
      component: require('@/views/StoreItemsView')
    } */
  ]
})

export default router
