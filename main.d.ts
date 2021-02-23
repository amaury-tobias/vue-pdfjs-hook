import type { ComputedRef, DeepReadonly, Ref } from "vue";
import type {
  DocumentInitParameters,
  PDFDocumentProxy,
  PDFPageProxy,
} from "pdfjs-dist/types/display/api";
import type { PageViewport } from "pdfjs-dist/types/display/display_utils";

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
  setPage: (page: number) => void;
};

export type PDFHookOptions = {
  element: Ref<HTMLElement | undefined>;
  file: Ref<string>;

  onDocumentLoadSuccess?: (document: PDFDocumentProxy) => void;
  onDocumentLoadFail?: (err: Error) => void;
  onPageLoadSuccess?: (page: PDFPageProxy) => void;
  onPageLoadFail?: (err: Error) => void;
  onPageRenderSuccess?: (page: PDFPageProxy) => void;
  onPageRenderFail?: (err: Error) => void;
  onPassword?: (callback: (password: string) => void, reason: 'NEED_PASSWORD' | 'INCORRECT_PASSWORD') => void

  workerSrc?: string;
  config?: DocumentInitParameters
};

export const usePDF: (options: PDFHookOptions) => PDFHookReturn;
