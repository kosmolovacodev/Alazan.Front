import * as pdfjs from 'pdfjs-dist';
import { recognize } from 'tesseract.js';

// Configuración compatible con Vite/Quasar para el Worker local
// Esto importa el worker como un Asset de Vite
import PDFWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = PDFWorker;

export async function ocrPDFToText(
  data: Uint8Array,
  lang = 'spa',
  onProgress?: (pct: number) => void,
): Promise<string> {
  // Cargamos el documento
  const loadingTask = pdfjs.getDocument({
    data,
    useWorkerFetch: true,
    isEvalSupported: false,
  });

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const textos: string[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    // Escala 2 para mejorar la resolución del OCR
    const viewport = page.getViewport({ scale: 2.0 });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) continue;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Renderizado de la página al canvas
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      canvas: canvas, // <--- Esta es la propiedad que faltaba
    };

    await page.render(renderContext).promise;
    // OCR sobre el canvas resultante
    const result = await recognize(canvas, lang, {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          // Calculamos progreso global basado en páginas
          const progress = ((i - 1 + m.progress) / numPages) * 100;
          onProgress(Math.round(progress));
        }
      },
    });

    textos.push(result.data.text);

    // Limpieza de memoria del canvas
    canvas.remove();
  }

  return textos.join('\n\n');
}
