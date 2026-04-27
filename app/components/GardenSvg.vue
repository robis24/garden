<template>
  <svg
    id="svg1"
    xmlns="http://www.w3.org/2000/svg"
    version="1.1"
    viewBox="671.693 -7514.145 3694.586 3508.512"
  >
    <g id="garden-layout">
      <g id="garden-areas">
        <path id="path68"              d="m1833.483-6197.02-74.856 301.41 163.374 144.305 23.835-29.631 96.218 83.158 164.662-196.153z"/>
        <path id="path69"              d="m1313.138-6617.303-413.275 449.406 194.22 200.658 56.714-43.803L1543.62-5659.3l218.442-238.16 83.264-308.586z"/>
        <path id="areas-0"             d="M2455.13-6395.547c148.9-196.594 238.48-349.598 384.51-548.329l-652.896-560.885-511.87 501.533z"/>
        <path id="areas-1"             d="m1555.398-6888.092 509.773 406.729-230.42 281.977-519.779-426.82z"/>
        <path id="areas-2"             d="m1290.144-5379.523 467.903-509.666 823.115 706.31-482.774 543.772z"/>
        <path id="areas-3"             d="m2047.576-5690.3 162.847-211.183 75.981 44.526 205.03-292.713 776.122 596.384-330.462 573.338z"/>
        <path id="areas-4"             d="m1619.477-6943.863 55.465-56.597 774.71 590.385-51.696 63.282z"/>
        <path id="areas-5"             d="m2485.088-6338.316-28.881 28.411 660.916 520.668 39.483-56.243z"/>
        <path id="areas-fruit-trees"   d="m2589.002-5185.455-500.28 546.976 691.844 590.63 97.108-84.807-140.518-116.795 217.256-209.406 124.107 121.406 237.625-231.818z"/>
        <path id="areas-behind-garage" d="m677.953-5927.309 116.868-116.877 154.438 205.552-44.723 63.871 410.242 335.764-47.142 71.068z"/>
        <path id="areas-wall"          d="m3610.39-5012.296 30.632 54.216 722.038-805.06-64.835-33.308z"/>
        <path id="areas-tarres"        d="m3833.48-5394.95 22.303 20.467-284.11 338.384-29.62-17.254z"/>
        <path id="path58"              d="m3475.405-5499.877 77.851-90.703-352.896-315.249-89.333 113.523z"/>
        <path id="path63"              d="m3011.984-4848.973-47.852-22.71 142.922-229.205 54.46-94.083L3294.799-5305l-73.887-52.77 129.721-120.942 47.896 47.51-86.49 98.737 17.025 112.69z"/>
        <path id="path65"              d="m2062.476-6479.057-56.94 72.874 364.606 286.465 58.164-69.54z"/>
      </g>
      <g id="garden-paths">
        <path id="path55" d="m2909.154-6897.285-71.415-63.574-440.482 611.796 61.313 48.515zm563.756 1400.02L1612.82-6944.39l-58.397 60.616 1860.783 1446.527z"/>
        <path id="path60" d="m788.827-6041.059 175.95 208.34 137.264-138.443-203.026-194.506z"/>
        <path id="path62" d="m2910.049-4929.083 354.008-608.474 85.989 61.387-125.76 123.269 84.457 35.875-151.395 121.891-193.553 320.993z"/>
        <path id="path72" d="m3706.21-5767.993-384.22 438.584 28.884 129.24 176.57 153.29 441.956-511.777z"/>
        <path id="path79" d="m4096.156-5729.14 87.464 73.817-577.947 657.613-41.005-47.005 305.236-332.661-43.213-27.104z"/>
        <path id="path80" d="m2223.777-5903.914 64.529 39.373 204.543-292.19-75.402-41.227z"/>
      </g>
      <path id="garden-greenhouse" d="m1825.71-6203.128 178.92-209.106 354.877 288.509-161.451 211.193z"/>
      <path id="garden-wall"       d="m2908.699-4940.302-979.828-802.624 15.704-28.485L2929.717-4967z"/>
      <g id="garden-buildings">
        <path id="buildings-house"   d="m2906.606-6902.036-412.49 575.48 650.652 465.476 214.734-209.06 618.228 510.764 128.85-136.586 54.882 34.966 138.402-151.327z"/>
        <path id="buildings-serre"   d="m3204.95-5905.422 146.172-155.777 355.387 277.333-145.589 179.668z"/>
        <path id="buildings-garage"  d="m912.962-5789.945 236.18-229.65 371.56 346.76-191.198 246.494z"/>
        <path id="buildings-carport" d="m3011.945-4840.607 334.922-360.685 313.67 249.5-357.577 396.451z"/>
        <path id="building-shed"     d="m2962.288-4438.932-204.955 176.24 111 110.15 198.377-181.098z"/>
      </g>
    </g>
  </svg>
</template>

<style>
/* ─── SVG design tokens ──────────────────────────────────────────────────── */
:root {
  --color-area:       #25ff88;
  --color-path:       #ffffff;
  --color-building:   #e50a20;
  --color-greenhouse: #25c1ff;
  --color-wall:       #000000;
  --color-stroke:     #151515;

  --color-plant-healthy:  #2d6a2d;
  --color-plant-stressed: #b5a000;
  --color-plant-diseased: #8b2500;
  --color-plant-dormant:  #8c8c6e;
}

/* ─── Shared stroke baseline ─────────────────────────────────────────────── */
#garden-layout path {
  stroke:            var(--color-stroke);
  stroke-width:      4;
  stroke-linecap:    square;
  stroke-linejoin:   miter;
  stroke-miterlimit: 2.7;
}

/* ─── Layer fills ────────────────────────────────────────────────────────── */
#garden-areas path {
  fill:         var(--color-area);
  fill-opacity: 0.946;
}

#garden-paths path {
  fill: var(--color-path);
}

#garden-buildings path {
  fill:         var(--color-building);
  fill-opacity: 0.974;
}

#garden-greenhouse {
  fill:         var(--color-greenhouse);
  fill-opacity: 0.435;
  stroke:       none;
}

#garden-wall {
  fill:         var(--color-wall);
  fill-opacity: 0.946;
}

/* ─── Plant type classes (applied dynamically via JS) ────────────────────── */
.plant-tree        { fill: var(--color-plant-healthy); }
.plant-shrub       { fill: #5a9e3a; }
.plant-herb        { fill: #a8d08d; }
.plant-groundcover { fill: #d4edda; }
.plant-vine        { fill: #7fb069; }

.plant-tree.stressed,
.plant-shrub.stressed,
.plant-herb.stressed   { fill: var(--color-plant-stressed); }

.plant-tree.diseased,
.plant-shrub.diseased,
.plant-herb.diseased   { fill: var(--color-plant-diseased); }

.plant-tree.dormant,
.plant-shrub.dormant,
.plant-herb.dormant    { fill: var(--color-plant-dormant); }
</style>
