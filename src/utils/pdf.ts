import type { TextItem } from 'pdfjs-dist/types/src/display/api';

let pdfjsPromise: Promise<typeof import('pdfjs-dist')> | null = null;

async function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url,
      ).toString();
      return pdfjs;
    })();
  }
  return pdfjsPromise;
}

export async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await loadPdfjs();
  const buffer = await file.arrayBuffer();
  const document = await pdfjs.getDocument({ data: buffer }).promise;

  const lines: string[] = [];
  for (let i = 1; i <= document.numPages; i += 1) {
    const page = await document.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => (item as TextItem).str)
      .filter(Boolean)
      .join(' ');
    lines.push(text);
  }

  return lines.join('\n').trim();
}
