<template>
  <footer class="footer">
    <div class="container-fluid">
      <div class="copyright">
        © {{year}} made with ⚡️ by
        <a href="https://twitter.com/cycryptr" target="_blank" rel="noopener">Cycryptr</a>

        <div class="text-muted small">
          Version: {{version}}
        </div>
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
    },
    computed: {
      version () {
        return (
          JSON.parse(unescape(process.env.PACKAGE_JSON || '%7Bversion%3A0%7D')).version
        )
      }
    }
  }
</script>
<style>
</style>
