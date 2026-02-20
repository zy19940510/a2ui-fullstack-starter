/**
 * PostCSS plugin to keep only prefixed utilities/theme and remove base layer
 * This makes Tailwind v4 CSS compatible with Tailwind v3 projects
 */
export default function removeLayersPlugin() {
  return {
    postcssPlugin: 'postcss-remove-layers',
    AtRule: {
      layer(atRule) {
        const layerName = atRule.params

        // Remove base and properties layers completely (宿主项目已经有了)
        if (layerName === 'base' || layerName === 'properties') {
          atRule.remove()
          return
        }

        // Keep theme, utilities and components, but remove the @layer wrapper
        if (layerName === 'theme' || layerName === 'utilities' || layerName === 'components') {
          const nodes = atRule.nodes
          if (nodes && nodes.length > 0) {
            atRule.replaceWith(nodes)
          } else {
            atRule.remove()
          }
        }
      },
      property(atRule) {
        // Remove @property declarations (CSS Houdini, not needed for compatibility)
        atRule.remove()
      }
    }
  }
}

removeLayersPlugin.postcss = true
