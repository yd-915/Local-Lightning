<template>
  <div class="row">
    <div class="col-md-8">
      <edit-profile-form :user="user">
      </edit-profile-form>
    </div>
  </div>
</template>
<script>
  import EditProfileForm from './Profile/EditProfileForm'
  import UserCard from './Profile/UserCard'
  export default {
    components: {
      EditProfileForm,
      UserCard
    },
    props: ['user'],
    data () {
      return {
      }
    }
  }
</script>
<style>
</style>
