const fontImportMap: Record<string, () => Promise<unknown>> = {
  // @ts-expect-error CSS-only module without type declarations
  inter: () => import('@fontsource/inter'),
  // @ts-expect-error CSS-only module without type declarations
  roboto: () => import('@fontsource/roboto'),
  // @ts-expect-error CSS-only module without type declarations
  lato: () => import('@fontsource/lato'),
  // @ts-expect-error CSS-only module without type declarations
  opensans: () => import('@fontsource/open-sans'),
  // @ts-expect-error CSS-only module without type declarations
  montserrat: () => import('@fontsource/montserrat'),
  // @ts-expect-error CSS-only module without type declarations
  poppins: () => import('@fontsource/poppins'),
  // @ts-expect-error CSS-only module without type declarations
  raleway: () => import('@fontsource/raleway'),
  // @ts-expect-error CSS-only module without type declarations
  nunito: () => import('@fontsource/nunito'),
  // @ts-expect-error CSS-only module without type declarations
  playfair: () => import('@fontsource/playfair-display'),
  // @ts-expect-error CSS-only module without type declarations
  merriweather: () => import('@fontsource/merriweather'),
  // @ts-expect-error CSS-only module without type declarations
  garamond: () => import('@fontsource/eb-garamond'),
  // @ts-expect-error CSS-only module without type declarations
  sourcecodepro: () => import('@fontsource/source-code-pro'),
}

const loadedFonts = new Set<string>()

export function loadFont(fontId: string): void {
  if (loadedFonts.has(fontId)) return
  const importer = fontImportMap[fontId]
  if (importer) {
    loadedFonts.add(fontId)
    importer().catch((err) => {
      console.warn(`Failed to load font "${fontId}":`, err)
      loadedFonts.delete(fontId)
    })
  }
}

export function loadAllFonts(): void {
  for (const fontId of Object.keys(fontImportMap)) {
    loadFont(fontId)
  }
}
