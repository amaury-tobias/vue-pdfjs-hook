# Vue-pdfjs-hook

`import { usePDF } from 'vue-pdfjs-hook'`

```vue
<template>
  <div class="h-full flex overflow-hidden">
    <div class="flex-grow overflow-scroll">
      <section
        ref="element"
        class="block bg-white overflow-hidden mx-auto"
        :style="{
          width: `${viewport.width}px`,
          height: `${viewport.height}px`,
        }"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { usePDF } from 'vue-pdfjs-hook'

export default defineComponent({
  setup() {
    const element = ref<HTMLElement>()
    const file = ref(
      'https://raw.githubusercontent.com/mozilla/pdf.js-sample-files/master/tracemonkey.pdf',
    )
    const numPages = ref(0)

    const { viewport } = usePDF({
      file,
      element,
      onDocumentLoadSuccess: (_document) => (numPages.value = _document.numPages),
    })

    return { element, viewport }
  },
})
</script>

```

## Types
```ts
type PDFHookOptions = {
  element: Ref<HTMLElement | undefined>;
  file: Ref<string>;
  onDocumentLoadSuccess?: (document: PDFDocumentProxy) => void;
  onDocumentLoadFail?: (err: Error) => void;
  onPageLoadSuccess?: (page: PDFPageProxy) => void;
  onPageLoadFail?: (err: Error) => void;
  onPageRenderSuccess?: (page: PDFPageProxy) => void;
  onPageRenderFail?: (err: Error) => void;
  cMapUrl?: string;
  cMapPacked?: boolean;
  workerSrc?: string; // default '//cdnjs.cloudflare.com/ajax/libs/pdf.js/${_pdfjs.version}/pdf.worker.js'
  withCredentials?: boolean;
  password?: string;
  httpHeaders?: Record<string, unknown>;
}
```

```ts
export type PDFHookReturn = {
  pdfDocument: Ref<PDFDocumentProxy>;
  pdfPage: Ref<PDFPageProxy>;
  viewport: DeepReadonly<ComputedRef<PageViewport>>;
  page: DeepReadonly<Ref<number>>;
  rotate: DeepReadonly<Ref<number>>;
  scale: DeepReadonly<Ref<number>>;
  rotateCW: () => void;
  rotateCCW: () => void;
  scaleIn: () => void;
  scaleOut: () => void;
  fitAuto: () => void;
  fitWidth: () => void;
  nextPage: () => void;
  prevPage: () => void;
};
```