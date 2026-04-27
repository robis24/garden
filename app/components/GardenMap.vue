<script setup lang="ts">
import type { GardenElement } from '~/composables/useGardenStore'
import { useGardenStore, SIZE_RADII } from '~/composables/useGardenStore'

const store = useGardenStore()
// Unwrap the computed so the template v-for gets a plain typed array
const elements = computed<GardenElement[]>(() => store.elements.value)

// ── Refs ──────────────────────────────────────────────────────────────────────
const containerEl = ref<HTMLElement>()
const overlayRef   = ref<SVGSVGElement>()
const addDialogRef = ref<{ open: (x: number, y: number, element?: GardenElement) => void }>()

const showSummer = ref(false)
const showWinter = ref(false)

const draggedId = ref<string | null>(null)
let dragItemStartX = 0, dragItemStartY = 0
let dragMouseStartX = 0, dragMouseStartY = 0
let dragHasMoved = false

function onMarkerMouseDown(e: MouseEvent, el: GardenElement) {
  if (e.button !== 0) return
  e.stopPropagation()
  draggedId.value = el.id
  const { x, y } = screenToSVG(e.clientX, e.clientY)
  dragMouseStartX = x
  dragMouseStartY = y
  dragItemStartX = el.x
  dragItemStartY = el.y
  dragHasMoved = false
  isDragging.value = true
}

function onMarkerClick(e: MouseEvent, el: GardenElement) {
  e.stopPropagation()
  if (!dragHasMoved) {
    addDialogRef.value?.open(el.x, el.y, el)
  }
}

// ── Pan / zoom state ──────────────────────────────────────────────────────────
const panX  = ref(0)
const panY  = ref(0)
const zoom  = ref(1)
const MIN_ZOOM = 0.05
const MAX_ZOOM = 20
const isDragging = ref(false)
const rotation = ref(0)  // degrees, clockwise = east

const canvasStyle = computed(() => ({
  transform: `translate(${panX.value}px, ${panY.value}px) scale(${zoom.value})`,
  transformOrigin: '0 0',
}))

const rotateWrapperStyle = computed(() => ({
  transform: `rotate(${rotation.value}deg)`,
}))

// ── Mouse pan ─────────────────────────────────────────────────────────────────
let dragStartX = 0, dragStartY = 0, dragStartPanX = 0, dragStartPanY = 0

function onMouseDown(e: MouseEvent) {
  if (e.button !== 0) return
  isDragging.value = true
  dragStartX = e.clientX; dragStartY = e.clientY
  dragStartPanX = panX.value; dragStartPanY = panY.value
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging.value) return
  
  if (draggedId.value) {
    const { x, y } = screenToSVG(e.clientX, e.clientY)
    const dx = x - dragMouseStartX
    const dy = y - dragMouseStartY
    if (Math.hypot(dx, dy) > 2) dragHasMoved = true
    
    const el = elements.value.find(i => i.id === draggedId.value)
    if (el) {
      el.x = dragItemStartX + dx
      el.y = dragItemStartY + dy
    }
    return
  }

  const dx = e.clientX - dragStartX
  const dy = e.clientY - dragStartY
  const r  = rotation.value * Math.PI / 180
  panX.value = dragStartPanX + dx * Math.cos(r) + dy * Math.sin(r)
  panY.value = dragStartPanY - dx * Math.sin(r) + dy * Math.cos(r)
}

async function onMouseUp() {
  if (draggedId.value) {
    const el = elements.value.find(i => i.id === draggedId.value)
    if (el && dragHasMoved) {
      await store.updateElement(el.id, { x: el.x, y: el.y })
    }
    draggedId.value = null
  }
  isDragging.value = false
}

// ── Wheel zoom (centred on cursor) ────────────────────────────────────────────
function onWheel(e: WheelEvent) {
  const factor   = e.deltaY < 0 ? 1.1 : 1 / 1.1
  const newZoom  = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom.value * factor))
  const rect     = containerEl.value!.getBoundingClientRect()
  // Rotate cursor position into canvas space
  const r        = rotation.value * Math.PI / 180
  const cx       = e.clientX - rect.left - rect.width  / 2
  const cy       = e.clientY - rect.top  - rect.height / 2
  const mx       = rect.width  / 2 + cx * Math.cos(r) + cy * Math.sin(r)
  const my       = rect.height / 2 - cx * Math.sin(r) + cy * Math.cos(r)
  const ratio    = newZoom / zoom.value
  panX.value     = mx - (mx - panX.value) * ratio
  panY.value     = my - (my - panY.value) * ratio
  zoom.value     = newZoom
}

// ── Right-click ───────────────────────────────────────────────────────────────
function onContextMenu(e: MouseEvent) { triggerAdd(e.clientX, e.clientY) }

// ── Touch: single-finger pan + long-press, two-finger pinch ──────────────────
let singleTouchId    = -1
let tDragStartX      = 0, tDragStartY  = 0
let tDragStartPanX   = 0, tDragStartPanY = 0
let pinchStartDist   = 0, pinchStartZoom = 0
let pinchMidX        = 0, pinchMidY     = 0
let pinchStartPanX   = 0, pinchStartPanY = 0
let longPressTimer: ReturnType<typeof setTimeout> | null = null
let longPressX = 0, longPressY = 0

function onTouchStart(e: TouchEvent) {
  if (e.touches.length === 1) {
    const t = e.touches[0]!
    singleTouchId  = t.identifier
    tDragStartX    = t.clientX; tDragStartY = t.clientY
    tDragStartPanX = panX.value; tDragStartPanY = panY.value
    longPressX = t.clientX; longPressY = t.clientY
    longPressTimer = setTimeout(() => triggerAdd(longPressX, longPressY), 500)
  } else if (e.touches.length >= 2) {
    cancelLongPress()
    singleTouchId = -1
    const t1 = e.touches[0]!
    const t2 = e.touches[1]!
    pinchStartDist  = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
    pinchStartZoom  = zoom.value
    // Rotate pinch midpoint into canvas space so the focal point stays fixed
    const rect = containerEl.value!.getBoundingClientRect()
    const r    = rotation.value * Math.PI / 180
    const rmx  = (t1.clientX + t2.clientX) / 2
    const rmy  = (t1.clientY + t2.clientY) / 2
    const cx   = rmx - rect.left - rect.width  / 2
    const cy   = rmy - rect.top  - rect.height / 2
    pinchMidX       = rect.width  / 2 + cx * Math.cos(r) + cy * Math.sin(r)
    pinchMidY       = rect.height / 2 - cx * Math.sin(r) + cy * Math.cos(r)
    pinchStartPanX  = panX.value
    pinchStartPanY  = panY.value
  }
}

function onTouchMove(e: TouchEvent) {
  if (e.touches.length === 1 && singleTouchId !== -1) {
    const t = Array.from(e.touches).find(t => t.identifier === singleTouchId)
    if (!t) return
    const dx = t.clientX - tDragStartX
    const dy = t.clientY - tDragStartY
    if (Math.hypot(dx, dy) > 10) cancelLongPress()
    const r  = rotation.value * Math.PI / 180
    panX.value = tDragStartPanX + dx * Math.cos(r) + dy * Math.sin(r)
    panY.value = tDragStartPanY - dx * Math.sin(r) + dy * Math.cos(r)
  } else if (e.touches.length >= 2) {
    const t1 = e.touches[0]!
    const t2 = e.touches[1]!
    const dist     = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
    if (pinchStartDist === 0) return
    const newZoom  = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, pinchStartZoom * (dist / pinchStartDist)))
    const ratio    = newZoom / pinchStartZoom
    panX.value     = pinchMidX - (pinchMidX - pinchStartPanX) * ratio
    panY.value     = pinchMidY - (pinchMidY - pinchStartPanY) * ratio
    zoom.value     = newZoom
  }
}

function onTouchEnd(e: TouchEvent) {
  cancelLongPress()
  if (e.touches.length < 2) pinchStartDist = 0
  if (e.touches.length < 1) singleTouchId = -1
}

function cancelLongPress() {
  if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null }
}

// ── Compass drag ──────────────────────────────────────────────────────────────
const compassRef = ref<SVGSVGElement>()
let compassDragging = false

function compassAngle(clientX: number, clientY: number): number {
  const el = compassRef.value
  if (!el) return 0
  const rect = el.getBoundingClientRect()
  const cx = rect.left + rect.width  / 2
  const cy = rect.top  + rect.height / 2
  return Math.atan2(clientX - cx, -(clientY - cy)) * 180 / Math.PI
}

function onCompassPointerDown(e: PointerEvent) {
  compassDragging = true
  ;(e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId)
}

function onCompassPointerMove(e: PointerEvent) {
  if (!compassDragging) return
  rotation.value = compassAngle(e.clientX, e.clientY)
}

function onCompassPointerUp(e: PointerEvent) {
  compassDragging = false
  ;(e.currentTarget as SVGSVGElement).releasePointerCapture(e.pointerId)
}

function resetRotation() { rotation.value = 0 }

// ── SVG coordinate conversion ─────────────────────────────────────────────────
function screenToSVG(clientX: number, clientY: number) {
  const svg = overlayRef.value
  if (!svg) return { x: 0, y: 0 }
  const pt    = svg.createSVGPoint()
  pt.x        = clientX
  pt.y        = clientY
  const svgPt = pt.matrixTransform(svg.getScreenCTM()!.inverse())
  return { x: svgPt.x, y: svgPt.y }
}

function triggerAdd(clientX: number, clientY: number) {
  const { x, y } = screenToSVG(clientX, clientY)
  addDialogRef.value?.open(x, y)
}

// ── Zoom control buttons ───────────────────────────────────────────────────────
function adjustZoom(factor: number) {
  if (!containerEl.value) return
  const rect  = containerEl.value.getBoundingClientRect()
  const cx    = rect.width / 2
  const cy    = rect.height / 2
  const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom.value * factor))
  const ratio = newZoom / zoom.value
  panX.value  = cx - (cx - panX.value) * ratio
  panY.value  = cy - (cy - panY.value) * ratio
  zoom.value  = newZoom
}

function resetView() {
  panX.value = 0; panY.value = 0; zoom.value = 1
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function diamondPoints(cx: number, cy: number, r: number) {
  return `${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`
}
</script>

<template>
  <div
    class="garden-map"
    :class="{ 'garden-map--dragging': isDragging }"
    ref="containerEl"
    @wheel.prevent="onWheel"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
    @mouseleave="onMouseUp"
    @contextmenu.prevent="onContextMenu"
    @touchstart="onTouchStart"
    @touchmove.prevent="onTouchMove"
    @touchend="onTouchEnd"
    @touchcancel="onTouchEnd"
  >
    <div class="garden-map__rotate-wrapper" :style="rotateWrapperStyle">
      <div class="garden-map__canvas" :style="canvasStyle">
        <!-- Base garden SVG -->
        <GardenSvg class="garden-map__base" aria-hidden="true" />

        <!-- Overlay SVG: same viewBox, used for coordinate conversion + markers -->
        <svg
          class="garden-map__overlay"
          ref="overlayRef"
          viewBox="671.693 -7514.145 3694.586 3508.512"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <SunPathOverlay :show-summer="showSummer" :show-winter="showWinter" />
          <template v-for="el in elements" :key="el.id">
            <g
              class="garden-map__marker-group"
              :class="[
                { 'garden-map__marker-group--dragging': draggedId === el.id },
                `garden-map__marker-group--${el.category || 'perennial'}`
              ]"
              @mousedown="onMarkerMouseDown($event, el)"
              @click="onMarkerClick($event, el)"
            >
              <circle
                v-if="el.shape === 'circle'"
                :cx="el.x" :cy="el.y" :r="SIZE_RADII[el.size]"
                class="garden-map__marker garden-map__marker--circle"
              />
              <rect
                v-else-if="el.shape === 'rect'"
                :x="el.x - SIZE_RADII[el.size]"
                :y="el.y - SIZE_RADII[el.size]"
                :width="SIZE_RADII[el.size] * 2"
                :height="SIZE_RADII[el.size] * 2"
                class="garden-map__marker garden-map__marker--rect"
              />
              <polygon
                v-else-if="el.shape === 'diamond'"
                :points="diamondPoints(el.x, el.y, SIZE_RADII[el.size])"
                class="garden-map__marker garden-map__marker--diamond"
              />
              <text
                :x="el.x"
                :y="el.y - SIZE_RADII[el.size] - 20"
                class="garden-map__marker-label"
              >{{ el.title }}</text>
            </g>
          </template>
        </svg>
      </div>
    </div>

    <!-- Compass -->
    <svg
      class="garden-map__compass"
      ref="compassRef"
      viewBox="-24 -24 48 48"
      xmlns="http://www.w3.org/2000/svg"
      :style="{ transform: `rotate(${-rotation}deg)` }"
      aria-label="Compass — drag to rotate map, double-click to reset north"
      role="img"
      @pointerdown.stop="onCompassPointerDown"
      @pointermove.stop="onCompassPointerMove"
      @pointerup.stop="onCompassPointerUp"
      @pointercancel.stop="onCompassPointerUp"
      @dblclick.stop="resetRotation"
    >
      <!-- Bezel ring -->
      <circle r="22" class="garden-map__compass-ring" />
      <!-- Cardinal labels -->
      <text y="-14" class="garden-map__compass-cardinal">N</text>
      <text y="17"  class="garden-map__compass-cardinal">S</text>
      <text x="-14" class="garden-map__compass-cardinal">W</text>
      <text x="14"  class="garden-map__compass-cardinal">E</text>
      <!-- Needle: north half red, south half white -->
      <polygon points="0,-13 3,0 -3,0"   class="garden-map__compass-needle-n" />
      <polygon points="0, 13 3,0 -3,0"   class="garden-map__compass-needle-s" />
      <!-- Centre dot -->
      <circle r="2.5" class="garden-map__compass-center" />
    </svg>

    <!-- Zoom and layer controls -->
    <div class="garden-map__controls" aria-label="Map controls">
      <button
        class="garden-map__control-btn"
        :class="{ 'garden-map__control-btn--active': showSummer }"
        type="button"
        title="Toggle summer sun path"
        @click="showSummer = !showSummer"
      >☀️</button>
      <button
        class="garden-map__control-btn"
        :class="{ 'garden-map__control-btn--active': showWinter }"
        type="button"
        title="Toggle winter sun path"
        @click="showWinter = !showWinter"
      >❄️</button>
      <hr class="garden-map__control-sep" />
      <button class="garden-map__control-btn" type="button" aria-label="Zoom in"  @click="adjustZoom(1.25)">+</button>
      <button class="garden-map__control-btn" type="button" aria-label="Zoom out" @click="adjustZoom(0.8)">−</button>
      <button class="garden-map__control-btn" type="button" aria-label="Reset view" title="Reset view" @click="resetView">⌂</button>
    </div>

    <p class="garden-map__hint">Right-click or long-press to place</p>

    <AddPlantDialog ref="addDialogRef" />
  </div>
</template>

<style lang="scss">
/* Unscoped: rules must reach v-html content and SVG children */
.garden-map {
  position: relative;
  width: 100vw;
  height: 100dvh;
  overflow: hidden;
  background: var(--color-bg);
  cursor: grab;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;

  &--dragging { cursor: grabbing; }

  &__canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform-origin: 0 0;
    will-change: transform;
  }

  &__base {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: visible;
  }

  &__marker-group {
    pointer-events: all;
    cursor: grab;
    transition: opacity 150ms ease;

    &:active { cursor: grabbing; }

    &--dragging {
      opacity: 0.6;
      cursor: grabbing;
    }
  }

  &__marker {
    fill: var(--marker-fill, rgba(37, 200, 100, 0.8));
    stroke: #fff;
    stroke-width: 8;
    transition: fill 150ms ease;

    .garden-map__marker-group--perennial & {
      --marker-fill: rgba(34, 197, 94, 0.8);
      &:hover { --marker-fill: rgba(34, 197, 94, 1); }
    }

    .garden-map__marker-group--biennial & {
      --marker-fill: rgba(245, 158, 11, 0.8);
      &:hover { --marker-fill: rgba(245, 158, 11, 1); }
    }

    .garden-map__marker-group--other & {
      --marker-fill: rgba(168, 85, 247, 0.8);
      &:hover { --marker-fill: rgba(168, 85, 247, 1); }
    }

    .garden-map__marker-group:hover & {
      filter: brightness(1.2);
    }
  }

  &__marker-label {
    font-family: system-ui, sans-serif;
    font-size: 60px;
    fill: #fff;
    paint-order: stroke;
    stroke: #151515;
    stroke-width: 14px;
    stroke-linejoin: round;
    text-anchor: middle;
    pointer-events: none;
  }

  &__controls {
    position: absolute;
    bottom: var(--spacing-xl);
    right: var(--spacing-md);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    z-index: 10;
  }

  &__control-btn {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    color: var(--color-text);
    font-size: 1.25rem;
    transition: background var(--transition);

    &:hover  { background: var(--color-surface-raised); }
    &:active { background: #3a3a3a; }

    &--active {
      background: var(--color-surface-raised);
      border-color: var(--color-primary, #4ade80);
      box-shadow: 0 0 0 1px var(--color-primary, #4ade80);
    }
  }

  &__control-sep {
    border: 0;
    border-top: 1px solid var(--color-border);
    margin: 4px 0;
  }

  &__hint {
    position: absolute;
    bottom: var(--spacing-md);
    left: 50%;
    transform: translateX(-50%);
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    background: rgba(0, 0, 0, 0.55);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-md);
    pointer-events: none;
    white-space: nowrap;
  }

  &__rotate-wrapper {
    position: absolute;
    inset: 0;
    transform-origin: 50% 50%;
    will-change: transform;
  }

  &__compass {
    position: absolute;
    top: var(--spacing-md);
    right: var(--spacing-md);
    width: 64px;
    height: 64px;
    cursor: grab;
    z-index: 10;
    touch-action: none;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));

    &:active { cursor: grabbing; }
  }

  &__compass-ring {
    fill: var(--color-surface);
    stroke: var(--color-border);
    stroke-width: 1.5;
  }

  &__compass-cardinal {
    font-family: system-ui, sans-serif;
    font-size: 6px;
    font-weight: 700;
    fill: var(--color-text-muted);
    text-anchor: middle;
    dominant-baseline: middle;
    pointer-events: none;
    user-select: none;
  }

  &__compass-needle-n {
    fill: #e53e3e;
    stroke: #fff;
    stroke-width: 0.5;
    stroke-linejoin: round;
  }

  &__compass-needle-s {
    fill: #f0f0f0;
    stroke: #888;
    stroke-width: 0.5;
    stroke-linejoin: round;
  }

  &__compass-center {
    fill: var(--color-surface);
    stroke: var(--color-border);
    stroke-width: 1;
  }
}
</style>
