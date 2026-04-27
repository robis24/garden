<script setup lang="ts">
defineProps<{ showSummer: boolean; showWinter: boolean }>()

// Garden location: Bocholt, Belgium (51.203057°N, 5.559325°E)
const LAT = 51.203057

// Centre of the overlay SVG viewBox: 671.693 -7514.145 3694.586 3508.512
const CX = 671.693 + 3694.586 / 2   // ≈ 2519
const CY = -7514.145 + 3508.512 / 2  // ≈ -5760
const R  = 1800  // radius in SVG user-units

const D = Math.PI / 180

interface Sample { az: number; hour: number }
interface Tick   { x1: number; y1: number; x2: number; y2: number }

function arc(decl: number): Sample[] {
  const φ = LAT  * D
  const δ = decl * D
  const out: Sample[] = []
  for (let h = 0; h <= 24; h += 0.25) {
    const H    = (h - 12) * 15 * D
    const sinα = Math.sin(φ) * Math.sin(δ) + Math.cos(φ) * Math.cos(δ) * Math.cos(H)
    const α    = Math.asin(Math.max(-1, Math.min(1, sinα)))
    if (α <= 0) continue
    const cosA = (Math.sin(δ) - Math.sin(α) * Math.sin(φ)) / (Math.cos(α) * Math.cos(φ))
    let   az   = Math.acos(Math.max(-1, Math.min(1, cosA))) / D
    if (H > 0) az = 360 - az
    out.push({ az, hour: h })
  }
  return out
}

function xy(az: number): [number, number] {
  return [CX + R * Math.sin(az * D), CY - R * Math.cos(az * D)]
}

function pathD(samples: Sample[]): string {
  return samples.map(({ az }, i) => {
    const [x, y] = xy(az)
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
}

function ticks(samples: Sample[], every = 2, len = 55): Tick[] {
  const out: Tick[] = []
  const seen = new Set<number>()
  for (const { az, hour } of samples) {
    const hi = Math.round(hour)
    if (Math.abs(hour - hi) > 0.01 || seen.has(hi) || hi % every !== 0) continue
    seen.add(hi)
    const s = Math.sin(az * D), c = Math.cos(az * D)
    out.push({ x1: CX + (R - len) * s, y1: CY - (R - len) * c,
               x2: CX +  R        * s, y2: CY -  R        * c })
  }
  return out
}

// Pre-compute (static data — inputs are constants)
const summerSamples = arc(23.45)
const winterSamples = arc(-23.45)
const summerPath    = pathD(summerSamples)
const winterPath    = pathD(winterSamples)
const summerTicks   = ticks(summerSamples, 2, 60)
const winterTicks   = ticks(winterSamples, 1, 45)

function endpoints(samples: Sample[]): [[number,number], [number,number]] | null {
  const first = samples[0], last = samples[samples.length - 1]
  if (!first || !last) return null
  return [xy(first.az), xy(last.az)]
}

const summerEnds = endpoints(summerSamples)
const winterEnds = endpoints(winterSamples)

// Label positions: just past the south-point (Az=180°) of each arc
const [, noonY] = xy(180)
</script>

<template>
  <g class="sun-paths" aria-hidden="true">

    <!-- ── Summer solstice (Jun 21, decl +23.45°) ─────────────────────────── -->
    <g v-if="showSummer">
      <path :d="summerPath" class="sun-paths__arc sun-paths__arc--summer" />
      <line
        v-for="(t, i) in summerTicks" :key="i"
        :x1="t.x1" :y1="t.y1" :x2="t.x2" :y2="t.y2"
        class="sun-paths__tick sun-paths__tick--summer"
      />
      <template v-if="summerEnds">
        <circle :cx="summerEnds[0][0]" :cy="summerEnds[0][1]" r="35"
                class="sun-paths__cap sun-paths__cap--summer" />
        <circle :cx="summerEnds[1][0]" :cy="summerEnds[1][1]" r="35"
                class="sun-paths__cap sun-paths__cap--summer" />
      </template>
      <text :x="CX" :y="noonY + 160" class="sun-paths__label sun-paths__label--summer">summer</text>
    </g>

    <!-- ── Winter solstice (Dec 21, decl −23.45°) ─────────────────────────── -->
    <g v-if="showWinter">
      <path :d="winterPath" class="sun-paths__arc sun-paths__arc--winter" />
      <line
        v-for="(t, i) in winterTicks" :key="i"
        :x1="t.x1" :y1="t.y1" :x2="t.x2" :y2="t.y2"
        class="sun-paths__tick sun-paths__tick--winter"
      />
      <template v-if="winterEnds">
        <circle :cx="winterEnds[0][0]" :cy="winterEnds[0][1]" r="35"
                class="sun-paths__cap sun-paths__cap--winter" />
        <circle :cx="winterEnds[1][0]" :cy="winterEnds[1][1]" r="35"
                class="sun-paths__cap sun-paths__cap--winter" />
      </template>
      <text :x="CX" :y="noonY + (showSummer ? 340 : 160)"
            class="sun-paths__label sun-paths__label--winter">winter</text>
    </g>

  </g>
</template>

<style>
.sun-paths__arc {
  fill: none;
  stroke-width: 18;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.sun-paths__arc--summer { stroke: #fbbf24; opacity: 0.9; }
.sun-paths__arc--winter { stroke: #60a5fa; opacity: 0.9; }

.sun-paths__tick {
  stroke-width: 10;
  stroke-linecap: round;
}

.sun-paths__tick--summer { stroke: #f59e0b; }
.sun-paths__tick--winter { stroke: #3b82f6; }

.sun-paths__cap {
  stroke-width: 10;
}

.sun-paths__cap--summer { fill: #fde68a; stroke: #f59e0b; }
.sun-paths__cap--winter { fill: #bfdbfe; stroke: #3b82f6; }

.sun-paths__label {
  font-family: system-ui, sans-serif;
  font-size: 72px;
  font-weight: 700;
  text-anchor: middle;
  text-transform: uppercase;
  letter-spacing: 8px;
  paint-order: stroke;
  stroke: #151515;
  stroke-width: 18px;
  stroke-linejoin: round;
  pointer-events: none;
}

.sun-paths__label--summer { fill: #fbbf24; }
.sun-paths__label--winter { fill: #60a5fa; }
</style>
