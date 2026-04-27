<script setup lang="ts">
import type { GardenElement, GardenCategory } from '~/composables/useGardenStore'
import { useGardenStore } from '~/composables/useGardenStore'

const store = useGardenStore()

const dialogEl = ref<HTMLDialogElement>()
let pendingX = 0
let pendingY = 0
const editingId = ref<string | null>(null)

const title = ref('')
const category = ref<GardenCategory>('perennial')
const shape = ref<'circle' | 'rect' | 'diamond'>('circle')
const size = ref<'xs' | 's' | 'm' | 'l' | 'xl'>('m')
const description = ref('')
const titleError = ref(false)
const isSubmitting = ref(false)

const SHAPES = [
  { value: 'circle',  label: 'Circle',  icon: '●' },
  { value: 'rect',    label: 'Square',  icon: '■' },
  { value: 'diamond', label: 'Diamond', icon: '◆' },
] as const

const CATEGORIES: { value: GardenCategory, label: string }[] = [
  { value: 'perennial', label: 'Vaste plant' },
  { value: 'biennial', label: '2-jarig' },
  { value: 'other', label: 'Overig' }
]

async function open(x: number, y: number, element?: GardenElement) {
  pendingX = x
  pendingY = y
  
  if (element) {
    editingId.value = element.id
    title.value = element.title
    category.value = element.category || 'perennial'
    shape.value = element.shape
    size.value = element.size
    description.value = await store.getMarkdown(element.id)
  } else {
    editingId.value = null
    title.value = ''
    category.value = 'perennial'
    shape.value = 'circle'
    size.value = 'm'
    description.value = ''
  }
  
  titleError.value = false
  dialogEl.value?.showModal()
}

async function onSubmit() {
  if (!title.value.trim()) {
    titleError.value = true
    return
  }
  
  isSubmitting.value = true
  try {
    if (editingId.value) {
      await store.updateElement(editingId.value, {
        title: title.value.trim(),
        category: category.value,
        shape: shape.value,
        size: size.value
      })
      await store.setMarkdown(editingId.value, description.value)
    } else {
      const id = await store.addElement({
        x: pendingX,
        y: pendingY,
        title: title.value.trim(),
        category: category.value,
        shape: shape.value,
        size: size.value,
      })
      await store.setMarkdown(id, description.value)
    }
    dialogEl.value?.close()
  } finally {
    isSubmitting.value = false
  }
}

async function onDelete() {
  if (!editingId.value || !confirm('Are you sure you want to remove this?')) return
  
  isSubmitting.value = true
  try {
    await store.removeElement(editingId.value)
    dialogEl.value?.close()
  } finally {
    isSubmitting.value = false
  }
}

function onCancel() {
  dialogEl.value?.close()
}

// Close on backdrop click
function onDialogClick(e: MouseEvent) {
  const rect = dialogEl.value!.getBoundingClientRect()
  if (
    e.clientX < rect.left || e.clientX > rect.right ||
    e.clientY < rect.top  || e.clientY > rect.bottom
  ) {
    dialogEl.value?.close()
  }
}

defineExpose({ open })
</script>

<template>
  <dialog
    ref="dialogEl"
    class="add-plant-dialog"
    @click="onDialogClick"
  >
    <form class="add-plant-dialog__form" @submit.prevent="onSubmit">
      <h2 class="add-plant-dialog__title">{{ editingId ? 'Edit' : 'Add to map' }}</h2>

      <!-- Title -->
      <div class="add-plant-dialog__field">
        <label class="add-plant-dialog__label" for="apd-title">Title *</label>
        <input
          id="apd-title"
          v-model="title"
          class="add-plant-dialog__input"
          :aria-invalid="titleError || undefined"
          type="text"
          placeholder="e.g. Comfrey patch"
          autocomplete="off"
          @input="titleError = false"
          :disabled="isSubmitting"
        />
        <span v-if="titleError" class="add-plant-dialog__error">Title is required</span>
      </div>

      <!-- Category -->
      <div class="add-plant-dialog__field">
        <label class="add-plant-dialog__label" for="apd-category">Category</label>
        <select id="apd-category" v-model="category" class="add-plant-dialog__select" :disabled="isSubmitting">
          <option v-for="cat in CATEGORIES" :key="cat.value" :value="cat.value">
            {{ cat.label }}
          </option>
        </select>
      </div>

      <!-- Shape -->
      <div class="add-plant-dialog__field">
        <span class="add-plant-dialog__label">Shape</span>
        <div class="add-plant-dialog__shapes">
          <label
            v-for="s in SHAPES"
            :key="s.value"
            class="add-plant-dialog__shape"
            :class="{ 'add-plant-dialog__shape--active': shape === s.value }"
          >
            <input type="radio" v-model="shape" :value="s.value" />
            <span class="add-plant-dialog__shape-icon">{{ s.icon }}</span>
            <span class="add-plant-dialog__shape-name">{{ s.label }}</span>
          </label>
        </div>
      </div>

      <!-- Size -->
      <div class="add-plant-dialog__field">
        <label class="add-plant-dialog__label" for="apd-size">Size</label>
        <select id="apd-size" v-model="size" class="add-plant-dialog__select" :disabled="isSubmitting">
          <option value="xs">XS — tiny herb</option>
          <option value="s">S — small shrub</option>
          <option value="m">M — medium</option>
          <option value="l">L — large tree</option>
          <option value="xl">XL — canopy</option>
        </select>
      </div>

      <!-- Description (optional markdown) -->
      <div class="add-plant-dialog__field">
        <span class="add-plant-dialog__label">
          Description
          <span class="add-plant-dialog__optional">optional · markdown</span>
        </span>
        <MarkdownEditor v-model="description" />
      </div>

      <div class="add-plant-dialog__actions">
        <button
          v-if="editingId"
          type="button"
          class="add-plant-dialog__btn add-plant-dialog__btn--danger"
          @click="onDelete"
          :disabled="isSubmitting"
        >
          Remove
        </button>
        <div style="flex: 1" />
        <button
          type="button"
          class="add-plant-dialog__btn add-plant-dialog__btn--cancel"
          @click="onCancel"
          :disabled="isSubmitting"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="add-plant-dialog__btn add-plant-dialog__btn--primary"
          :disabled="isSubmitting"
        >
          {{ editingId ? 'Save' : 'Add' }}
        </button>
      </div>
    </form>
  </dialog>
</template>

<style lang="scss" scoped>
.add-plant-dialog {
  width: min(92vw, 520px);
  max-height: 90dvh;
  overflow-y: auto;
  overscroll-behavior: contain;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  color: var(--color-text);
  outline: none;

  &::backdrop {
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
  }

  &__title {
    font-size: var(--font-size-lg);
    font-weight: 600;
    margin: 0 0 var(--spacing-lg);
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  &__label {
    font-size: var(--font-size-sm);
    font-weight: 500;
    color: var(--color-text-muted);
  }

  &__optional {
    margin-left: var(--spacing-xs);
    font-size: var(--font-size-xs);
    font-weight: 400;
    opacity: 0.7;
  }

  &__input,
  &__select {
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    color: var(--color-text);
    font-size: var(--font-size-md);
    font-family: inherit;
    transition: border-color var(--transition);

    &:focus {
      outline: none;
      border-color: var(--color-primary);
    }

    &[aria-invalid] {
      border-color: var(--color-danger);
    }

    &:disabled { opacity: 0.6; cursor: not-allowed; }
  }

  &__select {
    appearance: none;
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right var(--spacing-sm) center;
    padding-right: var(--spacing-xl);
  }

  &__shapes {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-sm);
  }

  &__shape {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-xs);
    background: var(--color-surface-raised);
    border: 2px solid var(--color-border);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: border-color var(--transition), background var(--transition);

    input { display: none; }

    &--active {
      border-color: var(--color-primary);
      background: var(--color-primary-dim);
    }

    &:hover:not(&--active) {
      border-color: rgba(255, 255, 255, 0.25);
    }
  }

  &__shape-icon {
    font-size: 1.4rem;
    line-height: 1;
    color: var(--color-primary);
  }

  &__shape-name {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
  }

  &__error {
    font-size: var(--font-size-xs);
    color: var(--color-danger);
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding-top: var(--spacing-sm);
  }

  &__btn {
    padding: var(--spacing-sm) var(--spacing-lg);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-md);
    font-weight: 500;
    border: 1px solid transparent;
    transition: background var(--transition), opacity var(--transition);
    cursor: pointer;

    &--cancel {
      background: transparent;
      border-color: var(--color-border);
      color: var(--color-text-muted);

      &:hover {
        background: var(--color-surface-raised);
        color: var(--color-text);
      }
    }

    &--primary {
      background: var(--color-primary);
      color: #000;
      font-weight: 600;

      &:hover { opacity: 0.88; }
    }

    &--danger {
      background: transparent;
      border-color: var(--color-danger);
      color: var(--color-danger);

      &:hover:not(:disabled) {
        background: var(--color-danger);
        color: #fff;
      }

      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }
}
</style>
