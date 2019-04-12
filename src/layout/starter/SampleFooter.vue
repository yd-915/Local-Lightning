<template>
  <footer class="footer">
    <div class="container-fluid">
      <div class="copyright">
        © {{year}} made with ⚡️ by
        <a href="https://twitter.com/cycryptr" target="_blank" rel="noopener">Cycryptr</a>
      </div>
    </div>
  </footer>
</template>
<script>
  export default {
    data () {
      return {
        year: new Date().getFullYear()
      }
    }
  }
</script>
<style>
</style>
