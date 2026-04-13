import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

/**
 * Export all .paper elements visible in the DOM to a PDF.
 * Caller should deselect elements before calling.
 */
export async function exportToPDF() {
  const papers = document.querySelectorAll('.paper')
  if (!papers.length) throw new Error('No pages found')

  const { jsPDF: PDF } = await import('jspdf')
  const pdf = new PDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  for (let i = 0; i < papers.length; i++) {
    const canvas = await html2canvas(papers[i], {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })
    const imgData = canvas.toDataURL('image/jpeg', 0.95)
    if (i > 0) pdf.addPage()
    const pw = pdf.internal.pageSize.getWidth()
    const ph = pdf.internal.pageSize.getHeight()
    const ar = canvas.width / canvas.height
    let iw = pw, ih = pw / ar
    if (ih > ph) { ih = ph; iw = ph * ar }
    pdf.addImage(imgData, 'JPEG', (pw - iw) / 2, (ph - ih) / 2, iw, ih)
  }

  pdf.save('NNT_Document.pdf')
}

/**
 * Export document state as a self-contained HTML file.
 */
export function exportToHTML(state, docTitles) {
  const { doc, paper, bg, pages } = state
  const dt = new Date()
  const ds = `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`
  const ref = 'NNT-' + String(Math.floor(Date.now() / 1000)).slice(-6)

  function mkTbl(el) {
    const { rows, cols, cells = [], hdr = true, zebra } = el
    let h = '<table style="border-collapse:collapse;width:100%">'
    for (let r = 0; r < rows; r++) {
      const rs = zebra && r > 0 && r % 2 === 0 ? 'background:#f8f6f0' : ''
      h += `<tr style="${rs}">`
      for (let c = 0; c < cols; c++) {
        const txt = cells[r]?.[c] ?? ''
        const tag = hdr && r === 0 ? 'th' : 'td'
        h += `<${tag} style="border:1px solid #d0ccc5;padding:5px 9px;font-size:12px${hdr && r===0?';background:#1a2744;color:#fff;font-weight:500;font-size:10px;text-transform:uppercase':''}">${txt}</${tag}>`
      }
      h += '</tr>'
    }
    return h + '</table>'
  }

  let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>NNT Document</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<style>
body{font-family:'DM Sans',sans-serif;background:#c8c4bc;padding:30px;margin:0}
.page{width:660px;min-height:930px;background:#fff;margin:0 auto 30px;border:1px solid #bbb;position:relative;page-break-after:always}
.lht{background:#1a2744;padding:0 34px;display:flex;align-items:center;justify-content:space-between;height:86px}
.llogo{width:50px;height:50px;border:2px solid #c9a227;display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:17px;font-weight:700;color:#c9a227;letter-spacing:2px}
.lname{font-family:'Playfair Display',serif;font-size:19px;font-weight:600;color:#fff}.ltag{font-size:9px;color:rgba(255,255,255,.5);letter-spacing:2px;text-transform:uppercase}
.lcon{text-align:right;color:rgba(255,255,255,.6);font-size:10px;line-height:1.9}
.lbar{height:3px;background:#c9a227}.lban{padding:9px 34px;background:#f8f6f0;border-bottom:1px solid #e8e4dc;display:flex;align-items:center;justify-content:space-between}
.ldt{font-family:'Playfair Display',serif;font-size:15px;font-weight:600;color:#1a2744;letter-spacing:1px;text-transform:uppercase}
.ldm{font-size:10px;color:#888;line-height:1.9;text-align:right}
.pbody{position:relative;min-height:740px}
.cv{position:absolute}
.lft{background:#1a2744;padding:7px 34px;display:flex;align-items:center;justify-content:space-between}
.lftx{font-size:9px;color:rgba(255,255,255,.5)}.lfg{color:#c9a227;font-weight:600}
img{max-width:100%;object-fit:contain}
@media print{body{background:#fff;padding:0}.page{border:none;margin:0}}
</style></head><body>`

  pages.forEach((pg, pi) => {
    const blank = paper === 'blank'
    const bgSt = bg ? `background-image:url(${bg});background-size:cover;background-position:top center;` : ''
    let hdr = ''
    if (!blank) {
      hdr = `<div class="lht"><div style="display:flex;align-items:center;gap:13px"><div class="llogo">NNT</div><div><div class="lname">NNT Business Solutions</div><div class="ltag">Excellence in Every Transaction</div></div></div><div class="lcon">123 Business Avenue, Dhaka, Bangladesh<br>Tel: +880 1234-567890<br>info@nnt.com.bd</div></div><div class="lbar"></div><div class="lban"><div class="ldt">${docTitles[doc] || 'Document'}</div><div class="ldm">Date: ${ds}<br>Ref: ${ref}</div></div>`
    }
    html += `<div class="page">${hdr}<div class="pbody" style="${bgSt}">`
    pg.els.forEach(el => {
      const st = `position:absolute;left:${el.x}px;top:${el.y}px;width:${el.w}px;${el.h ? `height:${el.h}px;` : ''}opacity:${(el.op || 100) / 100};z-index:${el.z || 1};`
      if (el.type === 'text')
        html += `<div class="cv" style="${st}font-family:${el.ff || 'DM Sans'};font-size:${el.fs || 12}px;color:${el.fc || '#1a2744'}">${el.content || ''}</div>`
      else if (el.type === 'table')
        html += `<div class="cv" style="${st}">${mkTbl(el)}</div>`
      else if (el.type === 'image')
        html += `<div class="cv" style="${st}"><img src="${el.src}" style="width:100%;height:100%;object-fit:contain"></div>`
    })
    html += `</div><div class="lft"><span class="lftx">NNT Business Solutions · Dhaka</span><span class="lftx"><span class="lfg">NNT</span> © ${new Date().getFullYear()}</span><span class="lftx">Page ${pi + 1} / ${pages.length}</span></div></div>`
  })

  html += '</body></html>'
  const blob = new Blob([html], { type: 'text/html' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'NNT_Document.html'
  a.click()
}
