import type * as v0_8 from '@a2ui-web/lit-core'
import type { SurfaceSnapshot } from '../A2UIRenderer'

/**
 * Generate a serializable snapshot for a given surface.
 * Use on the server to seed A2UIRenderer via the `initialSnapshot` prop.
 */
export function getSurfaceSnapshot(
  processor: InstanceType<typeof v0_8.Data.A2uiMessageProcessor>,
  surfaceId: string,
): SurfaceSnapshot {
  const surface = processor.getSurfaces().get(surfaceId)
  return {
    tree: surface?.componentTree ?? null,
    version: surface?.components.size ?? 0,
    exists: !!surface,
  }
}
