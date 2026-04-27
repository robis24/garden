<script setup lang="ts">
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const activeTab = ref<'write' | 'preview'>('write')

const rendered = computed(() => parseMarkdown(props.modelValue))

function parseMarkdown(raw: string): string {
  if (!raw.trim()) return ''

  // Escape HTML
  let s = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Inline formatting
  s = s
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

  // Block-level (split on blank lines)
  return s.split(/\n\n+/).map(block => {
    const lines = block.split('\n')

    // Headings
    if (/^#{1,3} /.test(lines[0] ?? '')) {
      return lines.map(line => {
        const m = line.match(/^(#{1,3}) (.+)$/)
        if (!m) return line
        const lvl = m[1]!.length
        return `<h${lvl}>${m[2]}</h${lvl}>`
      }).join('')
    }

    // Unordered list
    if (lines.every(l => /^- /.test(l) || l === '')) {
      const items = lines.filter(l => /^- /.test(l)).map(l => `<li>${l.slice(2)}</li>`)
      return `<ul>${items.join('')}</ul>`
    }

    return `<p>${lines.join('<br>')}</p>`
  }).join('\n')
}
</script>

<template>
  <div class="markdown-editor">
    <div class="markdown-editor__tabs" role="tablist">
      <button
        class="markdown-editor__tab"
        :class="{ 'markdown-editor__tab--active': activeTab === 'write' }"
        type="button"
        role="tab"
        @click="activeTab = 'write'"
      >Write</button>
      <button
        class="markdown-editor__tab"
        :class="{ 'markdown-editor__tab--active': activeTab === 'preview' }"
        type="button"
        role="tab"
        @click="activeTab = 'preview'"
      >Preview</button>
    </div>

    <textarea
      v-if="activeTab === 'write'"
      class="markdown-editor__textarea"
      :value="modelValue"
      placeholder="Add notes, plant details, observations…"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />

    <div
      v-else
      class="markdown-editor__preview"
      v-html="rendered"
    />
  </div>
</template>

<style lang="scss" scoped>
.markdown-editor {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;

  &__tabs {
    display: flex;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-surface);
  }

  &__tab {
    padding: var(--spacing-xs) var(--spacing-md);
    font-size: var(--font-size-sm);
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    color: var(--color-text-muted);
    transition: color var(--transition), border-color var(--transition);

    &--active {
      color: var(--color-text);
      border-color: var(--color-primary);
    }

    &:hover:not(.markdown-editor__tab--active) {
      color: var(--color-text);
    }
  }

  &__textarea {
    display: block;
    width: 100%;
    min-height: 120px;
    padding: var(--spacing-sm);
    background: var(--color-surface-raised);
    border: none;
    color: var(--color-text);
    font-family: 'Courier New', monospace;
    font-size: var(--font-size-sm);
    line-height: 1.6;
    resize: vertical;

    &:focus { outline: none; }

    &::placeholder {
      color: var(--color-text-muted);
      opacity: 0.6;
    }
  }

  &__preview {
    min-height: 120px;
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--color-surface-raised);
    font-size: var(--font-size-sm);
    line-height: 1.7;

    &:empty::before {
      content: 'Nothing to preview';
      color: var(--color-text-muted);
      opacity: 0.5;
      font-style: italic;
    }

    :deep(h1) { font-size: 1.3rem; margin-bottom: 0.5rem; }
    :deep(h2) { font-size: 1.15rem; margin-bottom: 0.4rem; }
    :deep(h3) { font-size: 1rem; margin-bottom: 0.3rem; }
    :deep(p)  { margin-bottom: 0.6rem; color: var(--color-text-muted); }
    :deep(strong) { color: var(--color-text); font-weight: 600; }
    :deep(code) {
      background: rgba(255, 255, 255, 0.1);
      padding: 1px 4px;
      border-radius: 3px;
      font-family: monospace;
      font-size: 0.9em;
    }
    :deep(ul) { padding-left: 1.2rem; margin-bottom: 0.6rem; }
    :deep(li) { margin-bottom: 0.2rem; color: var(--color-text-muted); }
    :deep(a)  { color: var(--color-primary); text-decoration: underline; }
  }
}
</style>
