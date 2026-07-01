// HERA — Instagram feed. Real posts pulled from @heragoddesstn.
// Images are downloaded locally to /public/hera/ig so they don't rely on
// Instagram's expiring CDN links. To refresh: re-download and update `file`.

export const IG_HANDLE = 'heragoddesstn'
export const IG_URL = `https://www.instagram.com/${IG_HANDLE}/`
export const IG_FOLLOWERS = '47,2K'

const post = (code, file, caption) => ({
  code,
  file: `/hera/ig/${file}`,
  caption,
  permalink: `https://www.instagram.com/p/${code}/`,
})

export const IG_FEED = [
  post('DZSLz-_tBDD', 'ig-01.jpg', 'Évasion estivale'),
  post('DZAqPHWDaK_', 'ig-04.jpg', 'Service Citrus Brandani'),
  post('DYSim87DQUC', 'ig-06.jpg', 'Table de printemps'),
  post('DX3_4-yDWEG', 'ig-09.jpg', 'Collection Garden Joy'),
  post('DZSLrB9NqyF', 'ig-02.jpg', 'Évasion estivale'),
  post('DZAoxOgjT7H', 'ig-05.jpg', 'Service Citrus Brandani'),
  post('DYSiKeBt20t', 'ig-07.jpg', 'Présentoirs en verre'),
  post('DX3_ipojcgY', 'ig-10.jpg', 'Collection Garden Joy'),
  post('DZSLdXmtZLu', 'ig-03.jpg', 'Évasion estivale'),
  post('DYSiI_FDdMq', 'ig-08.jpg', 'Table de printemps'),
]
