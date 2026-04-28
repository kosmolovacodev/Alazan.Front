import { ref } from 'vue';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export function boletaPrintCSS(elementId: string, zoom: number): string {
  return `<style>
  @page { size: A4 portrait; margin: 10mm 12mm; }
  body { margin: 0; background: white; }
  #${elementId} { max-width: 186mm !important; box-shadow: none !important; border: none !important; zoom: ${zoom}; margin: 0 auto; }
  .no-print { display: none !important; }
  .overflow-hidden { overflow: visible !important; }
  .bg-grey-3 { background: #f5f5f5 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .bg-grey-2 { background: transparent !important; }
  img { display: none !important; }
  table { table-layout: auto !important; }
  /* q-item layout: force flex-row so label and value stay side-by-side */
  .q-item { display: flex !important; flex-direction: row !important; align-items: center !important; padding: 4px 16px !important; }
  .q-item__section { display: flex !important; flex-direction: column !important; justify-content: center !important; }
  .q-item__section--main { flex: 1 1 auto !important; min-width: 0 !important; }
  .q-item__section--side { flex: 0 0 auto !important; }
  /* Hide icon/spinner elements — they render as CJK glyphs when Material Icons font is absent */
  .q-field__append, .q-field__prepend { display: none !important; }
  .q-field__bottom { display: none !important; }
  /* q-inputs WITH label (preliquidacion): static label above value, no border */
  .q-field--labeled { padding: 0 0 6px 0 !important; }
  .q-field--labeled .q-field__inner { position: static !important; }
  .q-field--labeled .q-field__control { position: static !important; min-height: 0 !important; height: auto !important; padding: 0 !important; }
  .q-field--labeled .q-field__control:before, .q-field--labeled .q-field__control:after { display: none !important; }
  .q-field--labeled .q-field__control-container { position: static !important; display: flex !important; flex-direction: column !important; }
  .q-field--labeled .q-field__label { position: static !important; display: block !important; font-size: 9px !important; color: #555 !important; transform: none !important; line-height: 1.2 !important; margin-bottom: 1px !important; text-transform: uppercase !important; letter-spacing: 0.3px !important; }
  .q-field--labeled .q-field__native, .q-field--labeled .q-field__input { font-weight: 600 !important; padding: 0 !important; min-height: 0 !important; line-height: 1.5 !important; font-size: 13px !important; font-family: Arial, Helvetica, sans-serif !important; }
  /* q-inputs WITHOUT label (analysis table): keep outlined box */
  .q-field--outlined:not(.q-field--labeled) .q-field__control:before { border: 1px solid #bbb !important; }
  .q-field--outlined:not(.q-field--labeled) .q-field__control:after { display: none !important; }
  .q-field:not(.q-field--labeled) .q-field__native, .q-field:not(.q-field--labeled) .q-field__input { font-weight: 600 !important; font-family: Arial, Helvetica, sans-serif !important; }
  /* <input> elements are replaced with <span class="q-field__native"> by buildPrintContent */
  span.q-field__native { display: block !important; width: 100% !important; }
</style>`;
}

// Vue 3 sets input.value as a DOM property, not an HTML attribute.
// outerHTML only serializes attributes, so values would be blank in the iframe.
// Call this before el.outerHTML to sync property → attribute.
export function syncInputValues(el: HTMLElement): void {
  el.querySelectorAll<HTMLInputElement>('input').forEach((inp) => {
    const val = inp.value;
    if (inp.type === 'number') inp.setAttribute('type', 'text');
    inp.setAttribute('value', val);
  });
  el.querySelectorAll<HTMLTextAreaElement>('textarea').forEach((ta) => {
    ta.textContent = ta.value;
  });
}

// html2canvas does not reliably render text inside <input> elements.
// This function clones el, reads live values from the real DOM, then
// replaces every <input> in the clone with a <span> so values render
// as plain text — no truncation, no font-fallback glyphs.
// Does NOT mutate the live DOM.
export function buildPrintContent(el: HTMLElement): string {
  const liveInputs = Array.from(el.querySelectorAll<HTMLInputElement>('input'));
  const liveValues = liveInputs.map((inp) => inp.value);
  const liveTextareas = Array.from(el.querySelectorAll<HTMLTextAreaElement>('textarea'));
  const liveTextareaValues = liveTextareas.map((ta) => ta.value);

  const clone = el.cloneNode(true) as HTMLElement;

  Array.from(clone.querySelectorAll<HTMLInputElement>('input')).forEach((inp, i) => {
    const span = document.createElement('span');
    span.textContent = liveValues[i] ?? '';
    span.className = inp.className;
    span.style.cssText = inp.style.cssText;
    inp.replaceWith(span);
  });

  Array.from(clone.querySelectorAll<HTMLTextAreaElement>('textarea')).forEach((ta, i) => {
    ta.textContent = liveTextareaValues[i] ?? '';
  });

  return clone.outerHTML;
}

export function usePdfDescarga() {
  const descargando = ref(false);

  async function descargarDesdeHTML(htmlContent: string, filename: string) {
    descargando.value = true;

    // 1033px body → element (max-width 703px) appears at 703/1033 ≈ 68% scale.
    const BODY_W = 1033;

    const iframe = document.createElement('iframe');
    iframe.style.cssText =
      `position:fixed;top:0;left:0;width:${BODY_W}px;height:1px;` +
      'border:none;visibility:hidden;pointer-events:none;';
    document.body.appendChild(iframe);

    try {
      await new Promise<void>((resolve) => {
        iframe.onload = () => resolve();
        const doc = iframe.contentDocument!;
        doc.open();
        doc.write(htmlContent);
        doc.close();
      });

      // Let fonts, icons and Quasar components fully render
      await new Promise((r) => setTimeout(r, 1000));

      const iframeDoc = iframe.contentDocument!;
      const body     = iframeDoc.body;

      // Reset height constraints, force body to BODY_W so scrollWidth is reliable
      const fix = iframeDoc.createElement('style');
      fix.textContent =
        `html,body{` +
        `height:auto!important;min-height:0!important;` +
        `overflow:visible!important;` +
        `min-width:${BODY_W}px!important;` +
        `margin:0!important;padding:0!important;}`;
      iframeDoc.head.appendChild(fix);

      body.querySelectorAll('img').forEach(
        (el) => ((el as HTMLElement).style.display = 'none'),
      );
      body.querySelectorAll('.no-print').forEach(
        (el) => ((el as HTMLElement).style.display = 'none'),
      );

      // Allow reflow after hiding elements
      await new Promise((r) => setTimeout(r, 200));

      // ── Capture ────────────────────────────────────────────────────────────
      const canvas = await html2canvas(body, {
        scale:       2,
        useCORS:     true,
        logging:     false,
        windowWidth: BODY_W,
      });

      // ── Compute EXACT page dimensions from the actual canvas ───────────────
      // This eliminates ALL estimation — the page is always exactly 1 page.
      const MARGIN_LR  = 12; // mm left + right
      const MARGIN_TB  = 10; // mm top + bottom
      const PAGE_W_MM  = 210;
      const contentW   = PAGE_W_MM - 2 * MARGIN_LR; // 186 mm
      const contentH   = (canvas.height / canvas.width) * contentW;
      const pageH      = contentH + 2 * MARGIN_TB;

      // ── Build PDF ──────────────────────────────────────────────────────────
      const pdf = new jsPDF({
        unit:        'mm',
        format:      [PAGE_W_MM, pageH],
        orientation: 'portrait',
        compress:    true,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.97);
      pdf.addImage(imgData, 'JPEG', MARGIN_LR, MARGIN_TB, contentW, contentH);
      pdf.save(`${filename}.pdf`);

    } finally {
      document.body.removeChild(iframe);
      descargando.value = false;
    }
  }

  return { descargarDesdeHTML, descargando };
}
