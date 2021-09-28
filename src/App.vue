<template>
  <div class="butons">
    <button @click="rotateCW">
      CW
    </button>
    <button @click="rotateCCW">
      CCW
    </button>
    <button @click="scaleIn">
      scaleIn
    </button>
    <button @click="scaleOut">
      scaleOut
    </button>
    <button @click="fitAuto">
      fitAuto
    </button>
    <button @click="fitWidth">
      fitWidth
    </button>
    <button @click="nextPage">
      nextPage
    </button>
    <button @click="prevPage">
      prevPage
    </button>
  </div>
  <div class="content">
    <canvas ref="element" v-bind="canvasAttributes" />
    <!-- <div ref="element" class="pdf-element" /> -->
  </div>
</template>

<script lang="ts">
import { ref, shallowRef, defineComponent } from 'vue'
import { usePDF } from '../lib/main'

export default defineComponent({
  setup() {
    const element = shallowRef<HTMLCanvasElement>()
    const file = ref(
      'https://raw.githubusercontent.com/mozilla/pdf.js-sample-files/master/tracemonkey.pdf',
    )

    const {
      rotateCW,
      rotateCCW,
      scaleIn,
      scaleOut,
      fitAuto,
      fitWidth,
      nextPage,
      prevPage,
      canvasAttributes,
    } = usePDF({
      renderType: 'canvas',
      file,
      element,
      onPageRenderSuccess: p => console.log('[PAGE_RENDER_SUCCESS]', p._pageInfo),
    })

    return {
      canvasAttributes,
      element,
      rotateCW,
      rotateCCW,
      scaleIn,
      scaleOut,
      fitAuto,
      fitWidth,
      nextPage,
      prevPage,

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
.butons {
  position: absolute;
  z-index: 2;
}
</style>
