export function normalizeUrlForLink(input: string): URL {
  if (input.startsWith('http://') || input.startsWith('https://')) {
    return new URL(input)
  }
  return new URL(`https://${input}`)
}

function canLoadLinkImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    const timerId = setTimeout(() => {
      img.src = ''
      resolve(false)
    }, 3000)

    img.onload = () => {
      clearTimeout(timerId)
      resolve(true)
    }
    img.onerror = () => {
      clearTimeout(timerId)
      resolve(false)
    }
    img.src = url
  })
}

export async function scrapeLinkFavicon(url: string): Promise<string | null> {
  try {
    const parsedUrl = normalizeUrlForLink(url)
    const directIcon = `${parsedUrl.origin}/favicon.ico`

    if (await canLoadLinkImage(directIcon)) {
      return directIcon
    }

    return `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=64`
  } catch {
    return null
  }
}

export function urlsEffectivelyEqual(a: string, b: string): boolean {
  try {
    return normalizeUrlForLink(a.trim()).href === normalizeUrlForLink(b.trim()).href
  } catch {
    return a.trim() === b.trim()
  }
}
