<template>
  <div
  id="g-recaptcha"
  class="g-recaptcha"
  :data-sitekey="sitekey">
  </div>
</template>

<script>
import Vue from "vue"

export default {
  data () {
    return {
      sitekey: '',
      widgetId: 0
    }
  },
  methods: {
    execute () {
        window.grecaptcha.execute(this.widgetId)
    },
    resetRC() {
      window.grecaptcha.reset(this.widgetId)
    },
    renderRC () {
        this.widgetId = window.grecaptcha.render('g-recaptcha', {
          sitekey: this.sitekey,
          size: 'invisible',
          // the callback executed when the user solve the recaptcha
          callback: (response) => {
            // emit an event called verify with the response as payload
            this.$emit('verify', response)
            // reset the recaptcha widget so you can execute it again
            this.resetRC()
          }
        })
    },

  },
  created() {
    this.sitekey = this.$store.getters.getRecaptchaSiteKey
  },
  mounted () {
    if (!Vue.config.devtools){ // скрытие значка рекапчи на проде
      const style = document.createElement('style')
      style.textContent = '.grecaptcha-badge {opacity:0 !important;}'
      document.head.append(style)
    }

    if( window.grecaptcha ) {
      this.renderRC()
    }
    // function checkGrecaptcha(t) {
    //   if( !window.grecaptcha ) {
    //     console.log('Wait for recaptcha script...')
    //     window.setTimeout(checkGrecaptcha(t), 1000)
    //   } else {
    //     // render the recaptcha widget when the component is mounted
    //     t.renderRC()
    //   }
    // }
    // checkGrecaptcha(this)
  },
}
</script>