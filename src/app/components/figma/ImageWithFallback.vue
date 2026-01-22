<template>
  <!-- Fallback cuando falla la carga -->
  <div
    v-if="didError"
    :class="['inline-block bg-grey-2 text-center align-middle', klass]"
    :style="styleAttr"
  >
    <div class="row items-center justify-center full-width full-height">
      <img
        :src="ERROR_IMG_SRC"
        alt="Error loading image"
        v-bind="passthroughAttrs"
        :data-original-url="src"
      />
    </div>
  </div>

  <!-- Imagen normal -->
  <img
    v-else
    :src="src"
    :alt="alt"
    :class="klass"
    :style="styleAttr"
    v-bind="passthroughAttrs"
    @error="handleError"
  />
</template>

<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue'

/**
 * Equivalente al ERROR_IMG_SRC del TSX
 */
const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

/**
 * Props explícitas (lo importante en React era src/alt/className/style + rest)
 * En Vue, lo demás se recibe como attrs con useAttrs()
 */
const props = defineProps<{
  src?: string
  alt?: string
  class?: string | string[] | Record<string, boolean>
  style?: string | Record<string, string | number> | Array<Record<string, string | number>>
}>()

const attrs = useAttrs()
const didError = ref(false)

function handleError() {
  didError.value = true
}

/**
 * En React:
 * - className/style se aplican al img (normal) o al div (fallback).
 * - ...rest se pasa al img.
 *
 * En Vue:
 * - attrs contiene también class/style si el usuario los pone en el componente,
 *   pero preferimos respetar props.class/props.style si se pasan.
 */
const klass = computed(() => props.class)
const styleAttr = computed(() => props.style)

/**
 * Passthrough: todos los attrs EXCEPTO class/style (ya los manejamos arriba)
 */
const passthroughAttrs = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { class: _c, style: _s, ...rest } = attrs as Record<string, unknown>
  return rest
})
</script>
