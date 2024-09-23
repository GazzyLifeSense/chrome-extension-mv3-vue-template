export function injectScript(url: string) {
  const script = document.createElement('script')
  script.src = url
  document.head.appendChild(script)
}

export function injectRawScript(text: string) {
  const script = document.createElement('script')
  script.type = 'text/javascript'
  try {
    script.appendChild(document.createTextNode(text))
  } catch {
    script.text = text
  }
  document.head.appendChild(script)
}

export function injectStyle(url: string) {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.type = 'text/css'
  link.href = url
  document.head.appendChild(link)
}

export function injectRawStyle(text: string) {
  const style = document.createElement('style')
  style.appendChild(document.createTextNode(text))
  document.head.appendChild(style)
}
