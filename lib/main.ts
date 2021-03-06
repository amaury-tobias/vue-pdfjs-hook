import * as _pdfjs from 'pdfjs-dist'

import { computed, nextTick, readonly, ref, shallowRef, watch } from 'vue'
import {
  PDFDocumentProxy,
  PDFPageProxy,
  DocumentInitParameters,
  PDFOperatorList,
} from 'pdfjs-dist/types/display/api'
import { PageViewport } from 'pdfjs-dist/types/display/display_utils'
import type { PDFHookOptions, PDFHookReturn } from '../main'

// eslint-disable-next-line @typescript-eslint/ban-types
function isFunction(value: unknown): value is Function {
  return typeof value === 'function'
}

type SVGGfx = {
  getSVG: (operatorList: PDFOperatorList, viewport: PageViewport) => Promise<HTMLElement>
}
export const usePDF = (options: PDFHookOptions): PDFHookReturn => {
  const {
    element,
    onDocumentLoadSuccess,
    onDocumentLoadFail,
    onPageLoadSuccess,
    onPageLoadFail,
    onPageRenderSuccess,
    onPageRenderFail,
    onPassword,

    file,
    config,
  } = options

  const svgCache = new Map<string, HTMLElement>()
  const pdfPageCache = new Map<number, PDFPageProxy>()

  const pdfDocument = shallowRef<PDFDocumentProxy>()
  const pdfPage = shallowRef<PDFPageProxy>()
  const svg = shallowRef<HTMLElement>()

  const page = ref(0)
  const scale = ref(1)
  const _rotate = ref(0)
  const rotate = computed({
    get: () => _rotate.value,
    set: (val) => {
      _rotate.value = val % 360
    },
  })

  const viewport = computed(() => {
    const page = pdfPage.value ?? { rotate: 0 }
    const rotation = _rotate.value === 0 ? page.rotate : page.rotate + _rotate.value
    const dpRatio = window.devicePixelRatio
    const adjustedScale = scale.value * dpRatio

    return (
      pdfPage.value?.getViewport({
        scale: adjustedScale,
        rotation,
      }) ?? {
        width: 0,
        height: 0,
      }
    )
  })

  const defaultViewport = computed(
    () => pdfPage.value?.getViewport({ scale: 1.0 }) ?? { height: 0, width: 0 },
  )

  const workerSrc = options.workerSrc ?? `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${_pdfjs.version}/pdf.worker.js`

  _pdfjs.GlobalWorkerOptions.workerSrc = workerSrc

  watch(
    file,
    (_file, _oldFile) => {
      if (!_file || _oldFile === _file) return
      const _config: DocumentInitParameters = {
        url: _file,
      }
      Object.assign(_config, config)
      const documentLoadingTask = _pdfjs.getDocument(_config)

      documentLoadingTask.onPassword = (updatePassword: (password: string) => void, reason: number) => {
        switch (reason) {
          case _pdfjs.PasswordResponses.NEED_PASSWORD:
            if (isFunction(onPassword)) onPassword(updatePassword, 'NEED_PASSWORD')
            break
          case _pdfjs.PasswordResponses.INCORRECT_PASSWORD:
            if (isFunction(onPassword)) onPassword(updatePassword, 'INCORRECT_PASSWORD')
            break
        }
      }

      documentLoadingTask.promise
        .then((loadedPdfDocument) => {
          pdfDocument.value = loadedPdfDocument

          if (isFunction(onDocumentLoadSuccess)) onDocumentLoadSuccess(loadedPdfDocument)
        })
        .catch((err) => {
          if (isFunction(onDocumentLoadFail)) onDocumentLoadFail(err)
        })
    },
    { immediate: true },
  )

  watch(scale, async () => {
    const { width, height } = viewport.value

    svg.value?.setAttribute('width', width.toString())
    svg.value?.setAttribute('height', height.toString())
  })

  watch([page, rotate], async ([_page]) => {
    if (_page === 0) {
      const el = element.value
      if (el && el.firstElementChild) el.removeChild(el.firstElementChild)
      return
    }
    const drawPdfPage = async (_PDFPage: PDFPageProxy) => {
      const rotation = _rotate.value === 0 ? _PDFPage.rotate : _PDFPage.rotate + _rotate.value

      if (svgCache.has(`${_PDFPage.pageNumber}.${rotation}`)) {
        svg.value = svgCache.get(`${_PDFPage.pageNumber}.${rotation}`)
      } else {
        try {
          const operatorList = await _PDFPage.getOperatorList()
          const svgGfx: SVGGfx = new _pdfjs.SVGGraphics(_PDFPage.commonObjs, _PDFPage.objs)
          svg.value = await svgGfx.getSVG(operatorList, viewport.value as PageViewport)
          svgCache.set(`${_PDFPage.pageNumber}.${rotation}`, svg.value)
        } catch (err) {
          if (isFunction(onPageRenderFail)) onPageRenderFail(err)
          return
        }
      }

      const el = element.value
      if (!el || !svg.value) return
      if (el.firstElementChild) el.removeChild(el.firstElementChild)
      if (!el.firstElementChild) el.appendChild(svg.value)
      if (isFunction(onPageRenderSuccess)) onPageRenderSuccess(_PDFPage)
    }

    if (!pdfDocument.value) return

    if (pdfPageCache.has(_page)) {
      pdfPage.value = pdfPageCache.get(_page)
    } else {
      try {
        pdfPage.value = await pdfDocument.value.getPage(_page)
        pdfPageCache.set(_page, pdfPage.value)
        if (isFunction(onPageLoadSuccess)) onPageLoadSuccess(pdfPage.value)
      } catch (err) {
        if (isFunction(onPageLoadFail)) onPageLoadFail(err)
      }
    }

    if (pdfPage.value) drawPdfPage(pdfPage.value)
  })

  watch(pdfDocument, () => {
    page.value = 0
    svgCache.clear()
    pdfPageCache.clear()
    nextTick(() => page.value = 1)
  })

  const rotateCW = () => {
    rotate.value += 90
  }
  const rotateCCW = () => {
    rotate.value += 270
  }
  const scaleIn = () => {
    scale.value += 0.15
  }
  const scaleOut = () => {
    scale.value -= 0.15
  }
  const fitWidth = () => {
    if (!pdfPage.value || !element.value || !element.value.parentElement) return
    const wantedHeight = element.value.parentElement.clientWidth
    const currentHeight
      = _rotate.value === 0 || _rotate.value === 180
        ? defaultViewport.value.width
        : defaultViewport.value.height
    const height = wantedHeight / currentHeight
    scale.value = height
  }
  const fitAuto = () => {
    if (!pdfPage.value || !element.value || !element.value.parentElement) return
    const wantedHeight = element.value.parentElement.clientHeight

    const currentHeight
      = _rotate.value === 0 || _rotate.value === 180
        ? defaultViewport.value.height
        : defaultViewport.value.width

    const height = wantedHeight / currentHeight
    scale.value = height
  }
  const nextPage = () => {
    if (page.value === pdfDocument.value?.numPages) return
    setPage(page.value + 1)
  }
  const prevPage = () => {
    if (page.value === 1) return
    setPage(page.value - 1)
  }
  const setPage = (_page: number) => {
    if (!pdfDocument.value) return
    if (_page > pdfDocument.value.numPages) return
    page.value = _page
  }

  return {
    pdfDocument: readonly(pdfDocument),
    pdfPage: readonly(pdfPage),
    viewport: readonly(defaultViewport),

    page: readonly(page),
    rotate: readonly(rotate),
    scale: readonly(scale),

    rotateCW,
    rotateCCW,
    scaleIn,
    scaleOut,
    fitAuto,
    fitWidth,
    nextPage,
    prevPage,
    setPage,
  }
}
