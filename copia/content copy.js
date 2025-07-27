(() => {
  const MARGIN = 10; const SPACING = 5;
  let selecting = false, mode = 'multi';
  const selected = new Set();
  const cards = Array.from(document.querySelectorAll('.card-body'));
  let selectedType = null;

  function blobToDataURL(blob) {
    return new Promise(res => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.readAsDataURL(blob);
    });
  }

  function getCalledID() {
    const idInput = document.querySelector('input[name="items_id"]');
    return idInput ? idInput.value.trim() : 'ID';
  }

  function getRawTitle() {
    const h = document.querySelector('.timeline-content .card-title.card-header');
    return h ? h.textContent.trim().replace(/[\\/:*?"<>|]/g, '_') : 'export';
  }

  function detectRealType() {
    const title = getRawTitle().toUpperCase();
    if (title.includes("KCOR")) return "kcor";
    if (title.includes("TECSIDEL")) return "tecsidel";
    return "padrao";
  }

  function extractPdfTitle() {
    const id = getCalledID();
    let rawTitle = getRawTitle();

    if (selectedType === 'tecsidel') {
      rawTitle = rawTitle.replace(/tecsidel\s*[:-]*/i, '').trim();
      return `${id} - TECSIDEL: ${rawTitle}`;
    }
    if (selectedType === 'kcor') {
      rawTitle = rawTitle.replace(/kcor\s*[:-]*/i, '').trim();
      return `${id} - KCOR: ${rawTitle}`;
    }
    return `${id} - ${rawTitle}`;
  }



  function showInstructions() {
    const box = document.createElement('div');
    box.id = 'pdf-instructions';
    Object.assign(box.style, {
      position: 'fixed', top: '20px', right: '20px',
      background: '#fff', border: '2px solid #007bff',
      padding: '15px', borderRadius: '8px',
      zIndex: 9999, maxWidth: '280px', color: '#333',
      fontSize: '14px', lineHeight: '1.4',
      boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
    });
    box.innerHTML = `
      <strong>Instruções:</strong>
      <ul style="padding-left:18px; margin:8px 0;">
        <li>Clique nos cards que deseja baixar (contorno <span style="color:#28a745;">verde</span>).</li>
        <li>Os não selecionados ficam com contorno <span style="color:#dc3545;">vermelho</span>.</li>
        <li>Ao terminar, clique em <strong>“Baixar PDF”</strong>.</li>
      </ul>
    `;
    document.body.appendChild(box);
  }

  function initSelection() {
    showInstructions();
    cards.forEach(c => {
      c.style.outline = '2px dashed #dc3545';
      c.style.cursor = 'pointer';
      c.addEventListener('click', onCardClick);
    });
    const btn = document.createElement('button');
    btn.id = 'pdf-export-button';
    btn.textContent = 'Baixar PDF';
    Object.assign(btn.style, {
      position: 'fixed', bottom: '20px', right: '20px',
      padding: '12px 24px', background: '#28a745',
      color: '#fff', border: 'none', borderRadius: '4px',
      cursor: 'pointer', zIndex: 9999
    });
    btn.onclick = downloadSelected;
    document.body.appendChild(btn);
  }

  function onCardClick(e) {
    e.stopPropagation();
    const idx = cards.indexOf(e.currentTarget);
    if (selected.has(idx)) {
      selected.delete(idx);
      e.currentTarget.style.outline = '2px dashed #dc3545';
    } else {
      selected.add(idx);
      e.currentTarget.style.outline = '2px solid #28a745';
    }
  }

  function startSelection() {
    if (selecting) return;
    selecting = true;
    initSelection();
  }

  async function processAttachments(pdf, card, currentY) {
    const links = Array.from(card.querySelectorAll('a[href*="document.send.php"]'));
    for (const link of links) {
      try {
        const resp = await fetch(link.href);
        const blob = await resp.blob();
        const ext = (link.title || new URL(link.href).pathname).split('.').pop().toLowerCase();

        const isImage = blob.type.startsWith('image/') ||
          (blob.type === 'application/octet-stream' && ['png', 'jpg', 'jpeg', 'bmp', 'gif', 'webp', 'tiff'].includes(ext));

        const isPdf = blob.type === 'application/pdf' || ext === 'pdf';

        if (isImage) {
          const dataUrl = await blobToDataURL(blob);
          const props = pdf.getImageProperties(dataUrl);
          const w = pdf.internal.pageSize.getWidth() - 2 * MARGIN;
          const h = (props.height * w) / props.width;
          if (currentY + h > pdf.internal.pageSize.getHeight() - MARGIN) {
            pdf.addPage();
            currentY = MARGIN;
          }
          pdf.addImage(dataUrl, 'PNG', MARGIN, currentY, w, h);
          currentY += h + SPACING;

        } else if (isPdf) {
          const pdfjsLib = window['pdfjsLib'] || window['pdfjs-dist/build/pdf'];
          pdfjsLib.GlobalWorkerOptions.workerSrc = '/libs/pdfjs/pdf.worker.min.js';

          const arrayBuffer = await blob.arrayBuffer();
          const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

          for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
            const page = await pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: 2 });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport: viewport }).promise;
            const imgData = canvas.toDataURL('image/png');

            const props = pdf.getImageProperties(imgData);
            const w = pdf.internal.pageSize.getWidth() - 2 * MARGIN;
            const h = (props.height * w) / props.width;

            if (currentY + h > pdf.internal.pageSize.getHeight() - MARGIN) {
              pdf.addPage();
              currentY = MARGIN;
            }

            pdf.addImage(imgData, 'PNG', MARGIN, currentY, w, h);
            currentY += h + SPACING;
          }
        }

      } catch (e) {
        console.error('Erro ao processar anexo', link.href, e);
      }
    }
    return currentY;
  }

  function cleanup() {
  cards.forEach(c => {
    c.style.outline = '';
    c.style.cursor = '';
    c.removeEventListener('click', onCardClick);
  });
  const btn = document.getElementById('pdf-export-button');
  if (btn) btn.remove();
  const box = document.getElementById('pdf-instructions');
  if (box) box.remove();
  selecting = false;
  selected.clear();
}

  async function downloadSelected() {
  const btn = document.getElementById('pdf-export-button');
  btn.textContent = 'Exportando...';
  btn.style.background = '#6c757d';
  btn.disabled = true;

  const indices = Array.from(selected);
  if (!indices.length) {
    alert('Selecione ao menos um card.');
    return;
  }

  const dateMap = {};
  for (const idx of indices) {
    const span = cards[idx].querySelector('span[data-bs-original-title]');
    if (span) {
      const [d, t] = span.getAttribute('data-bs-original-title').split(' ');
      const [day, mo, yr] = d.split('-').map(Number);
      const [hr, mi] = t.split(':').map(Number);
      dateMap[idx] = new Date(yr, mo - 1, day, hr, mi);
    } else {
      dateMap[idx] = new Date(0);
    }
  }

  const sorted = indices.slice().sort((a, b) => dateMap[a] - dateMap[b]);
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pw = pdf.internal.pageSize.getWidth();
  const ph = pdf.internal.pageSize.getHeight();
  let y = MARGIN;

  for (const idx of sorted) {
    const card = cards[idx];

    // 🔍 Detecta se o card tem anexo PDF
    const hasPdfAttachment = !!card.querySelector('a[href*="document.send.php"][title$=".pdf"]');

    // 📸 Se NÃO tiver PDF, renderiza print do card
    if (!hasPdfAttachment) {
      const canvas = await html2canvas(card, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const props = pdf.getImageProperties(imgData);
      const w = pw - 2 * MARGIN;
      const h = (props.height * w) / props.width;
      if (y + h > ph - MARGIN) {
        pdf.addPage();
        y = MARGIN;
      }
      pdf.addImage(imgData, 'PNG', MARGIN, y, w, h);
      y += h + SPACING;
    }

    // 📎 Processa os anexos normalmente (imagens ou PDFs)
    if (card.querySelector('div.row.align-items-center a[href*="document.send.php"]')) {
      y = await processAttachments(pdf, card, y);
    }
  }

  // 📄 Numeração de páginas
  const total = pdf.getNumberOfPages();
  pdf.setFontSize(10);
  for (let i = 1; i <= total; i++) {
    pdf.setPage(i);
    pdf.text(`${i} / ${total}`, pw - MARGIN, ph - 5, { align: 'right' });
  }

  // 💾 Salva
  pdf.save(`${extractPdfTitle()}.pdf`);
  cleanup();
}

const startBtn = document.createElement('button');
startBtn.textContent = 'Exportar PDF';
Object.assign(startBtn.style, {
  position: 'fixed', bottom: '20px', right: '20px',
  padding: '12px 24px', background: '#17a2b8',
  color: '#fff', border: 'none', borderRadius: '4px',
  cursor: 'pointer', zIndex: 9999
});
startBtn.onclick = () => {
  selectedType = detectRealType(); // detecta automaticamente
  startSelection(); // inicia sem prompt
};
document.body.appendChild(startBtn);
  }) ();

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
