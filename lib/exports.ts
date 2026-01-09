/**
 * Export utilities for PDF/DOCX generation.
 * 
 * Client-side export using browser APIs.
 */

export interface ExportOptions {
  title: string
  content: string
  type: "pdf" | "docx"
}

/**
 * Export document as PDF (client-side using browser print API).
 * 
 * Note: For better PDF quality, consider using a library like jsPDF or react-pdf.
 */
export async function exportToPDF(title: string, content: string): Promise<void> {
  // Create a new window for printing
  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    throw new Error("Popup blocked. Please allow popups to export PDF.")
  }

  // Convert markdown to HTML (simple conversion)
  const htmlContent = markdownToHTML(content)

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          @media print {
            @page {
              margin: 1in;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              font-size: 12pt;
              line-height: 1.6;
              color: #000;
              max-width: 8.5in;
              margin: 0 auto;
            }
            h1 { font-size: 24pt; margin-top: 0; }
            h2 { font-size: 18pt; margin-top: 1em; }
            h3 { font-size: 14pt; margin-top: 0.8em; }
            p { margin: 0.5em 0; }
            ul, ol { margin: 0.5em 0; padding-left: 2em; }
            code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; font-family: 'Courier New', monospace; }
            pre { background: #f4f4f4; padding: 1em; border-radius: 4px; overflow-x: auto; }
            blockquote { border-left: 4px solid #ccc; padding-left: 1em; margin: 1em 0; color: #666; }
          }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        ${htmlContent}
      </body>
    </html>
  `)
  printWindow.document.close()

  // Wait for content to load, then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print()
      // Close window after printing (optional)
      // printWindow.close()
    }, 250)
  }
}

/**
 * Convert markdown to HTML (basic implementation).
 * 
 * For production, consider using a library like marked or remark.
 */
function markdownToHTML(markdown: string): string {
  let html = markdown

  // Headings
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>")
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>")
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>")

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

  // Italic
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>")

  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")

  // Inline code
  html = html.replace(/`(.*?)`/g, "<code>$1</code>")

  // Blockquotes
  html = html.replace(/^> (.*$)/gim, "<blockquote>$1</blockquote>")

  // Bullet lists
  html = html.replace(/^- (.*$)/gim, "<li>$1</li>")
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>")

  // Numbered lists
  html = html.replace(/^\d+\. (.*$)/gim, "<li>$1</li>")
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, "<ol>$1</ol>")

  // Line breaks
  html = html.replace(/\n\n/g, "</p><p>")
  html = html.replace(/\n/g, "<br>")

  // Wrap in paragraphs
  if (!html.startsWith("<h") && !html.startsWith("<ul") && !html.startsWith("<ol")) {
    html = "<p>" + html + "</p>"
  }

  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, "")
  html = html.replace(/<p><br><\/p>/g, "")

  return html
}

/**
 * Escape HTML to prevent XSS.
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

/**
 * Export document as DOCX (requires a library like docx.js).
 * 
 * Note: This is a placeholder. For full DOCX support, install and use 'docx' library.
 */
export async function exportToDOCX(title: string, content: string): Promise<void> {
  // TODO: Implement DOCX export using 'docx' library
  throw new Error(
    "DOCX export is not yet implemented. Please use PDF export or install 'docx' library."
  )
}
