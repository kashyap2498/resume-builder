// =============================================================================
// PDF Font Registry - Register @fontsource fonts with @react-pdf/renderer
// =============================================================================

import { FONT_OPTIONS } from '@/constants/fonts'

let registered = false

export async function ensurePdfFontsRegistered(): Promise<void> {
  if (registered) return
  registered = true

  const { Font } = await import('@react-pdf/renderer')

  const [
    interR, interB, interI,
    robotoR, robotoB, robotoI,
    latoR, latoB, latoI,
    opensansR, opensansB, opensansI,
    montserratR, montserratB, montserratI,
    poppinsR, poppinsB, poppinsI,
    ralewayR, ralewayB, ralewayI,
    nunitoR, nunitoB, nunitoI,
    playfairR, playfairB, playfairI,
    merriweatherR, merriweatherB, merriweatherI,
    garamondR, garamondB, garamondI,
    sourcecodeR, sourcecodeB, sourcecodeI,
  ] = await Promise.all([
    import('@fontsource/inter/files/inter-latin-400-normal.woff?url'),
    import('@fontsource/inter/files/inter-latin-700-normal.woff?url'),
    import('@fontsource/inter/files/inter-latin-400-italic.woff?url'),
    import('@fontsource/roboto/files/roboto-latin-400-normal.woff?url'),
    import('@fontsource/roboto/files/roboto-latin-700-normal.woff?url'),
    import('@fontsource/roboto/files/roboto-latin-400-italic.woff?url'),
    import('@fontsource/lato/files/lato-latin-400-normal.woff?url'),
    import('@fontsource/lato/files/lato-latin-700-normal.woff?url'),
    import('@fontsource/lato/files/lato-latin-400-italic.woff?url'),
    import('@fontsource/open-sans/files/open-sans-latin-400-normal.woff?url'),
    import('@fontsource/open-sans/files/open-sans-latin-700-normal.woff?url'),
    import('@fontsource/open-sans/files/open-sans-latin-400-italic.woff?url'),
    import('@fontsource/montserrat/files/montserrat-latin-400-normal.woff?url'),
    import('@fontsource/montserrat/files/montserrat-latin-700-normal.woff?url'),
    import('@fontsource/montserrat/files/montserrat-latin-400-italic.woff?url'),
    import('@fontsource/poppins/files/poppins-latin-400-normal.woff?url'),
    import('@fontsource/poppins/files/poppins-latin-700-normal.woff?url'),
    import('@fontsource/poppins/files/poppins-latin-400-italic.woff?url'),
    import('@fontsource/raleway/files/raleway-latin-400-normal.woff?url'),
    import('@fontsource/raleway/files/raleway-latin-700-normal.woff?url'),
    import('@fontsource/raleway/files/raleway-latin-400-italic.woff?url'),
    import('@fontsource/nunito/files/nunito-latin-400-normal.woff?url'),
    import('@fontsource/nunito/files/nunito-latin-700-normal.woff?url'),
    import('@fontsource/nunito/files/nunito-latin-400-italic.woff?url'),
    import('@fontsource/playfair-display/files/playfair-display-latin-400-normal.woff?url'),
    import('@fontsource/playfair-display/files/playfair-display-latin-700-normal.woff?url'),
    import('@fontsource/playfair-display/files/playfair-display-latin-400-italic.woff?url'),
    import('@fontsource/merriweather/files/merriweather-latin-400-normal.woff?url'),
    import('@fontsource/merriweather/files/merriweather-latin-700-normal.woff?url'),
    import('@fontsource/merriweather/files/merriweather-latin-400-italic.woff?url'),
    import('@fontsource/eb-garamond/files/eb-garamond-latin-400-normal.woff?url'),
    import('@fontsource/eb-garamond/files/eb-garamond-latin-700-normal.woff?url'),
    import('@fontsource/eb-garamond/files/eb-garamond-latin-400-italic.woff?url'),
    import('@fontsource/source-code-pro/files/source-code-pro-latin-400-normal.woff?url'),
    import('@fontsource/source-code-pro/files/source-code-pro-latin-700-normal.woff?url'),
    import('@fontsource/source-code-pro/files/source-code-pro-latin-400-italic.woff?url'),
  ])

  const families = [
    { name: 'Inter', r: interR, b: interB, i: interI },
    { name: 'Roboto', r: robotoR, b: robotoB, i: robotoI },
    { name: 'Lato', r: latoR, b: latoB, i: latoI },
    { name: 'Open Sans', r: opensansR, b: opensansB, i: opensansI },
    { name: 'Montserrat', r: montserratR, b: montserratB, i: montserratI },
    { name: 'Poppins', r: poppinsR, b: poppinsB, i: poppinsI },
    { name: 'Raleway', r: ralewayR, b: ralewayB, i: ralewayI },
    { name: 'Nunito', r: nunitoR, b: nunitoB, i: nunitoI },
    { name: 'Playfair Display', r: playfairR, b: playfairB, i: playfairI },
    { name: 'Merriweather', r: merriweatherR, b: merriweatherB, i: merriweatherI },
    { name: 'EB Garamond', r: garamondR, b: garamondB, i: garamondI },
    { name: 'Source Code Pro', r: sourcecodeR, b: sourcecodeB, i: sourcecodeI },
  ]

  for (const f of families) {
    Font.register({
      family: f.name,
      fonts: [
        { src: f.r.default },
        { src: f.b.default, fontWeight: 700 },
        { src: f.i.default, fontStyle: 'italic' },
      ],
    })
  }
}

/**
 * Convert a CSS font-family string (e.g. "Inter, system-ui, sans-serif")
 * to the @react-pdf registered family name (e.g. "Inter").
 * Falls back to "Helvetica" (built-in PDF font) if not found.
 */
export function resolvePdfFontFamily(cssFamily: string): string {
  const option = FONT_OPTIONS.find((f) => f.family === cssFamily)
  if (option) return option.name

  const firstName = cssFamily.split(',')[0].trim().replace(/['"]/g, '')
  const byName = FONT_OPTIONS.find((f) => f.name === firstName)
  if (byName) return byName.name

  return 'Helvetica'
}
