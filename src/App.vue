<template>
  <div class="content">
    <div ref="element" class="pdf-element" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, shallowRef } from 'vue'
import { usePDF } from '../dist/vue-pdfjs-hook.es'

export default defineComponent({
  setup() {
    const element = shallowRef<HTMLElement>()
    const file = ref('https://raw.githubusercontent.com/mozilla/pdf.js-sample-files/master/tracemonkey.pdf')

    usePDF({
      file,
      element,
      onDocumentLoadFail: (err: Error) => console.error(err),
      onPageLoadFail: (err: Error) => console.error(err),
      onPageRenderFail: (err: Error) => console.error(err),
    })

    return {
      element,
    }
  },
})
</script>

<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
}
.content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: black;
}
.pdf-element {
  background-color: white;
}
</style>
