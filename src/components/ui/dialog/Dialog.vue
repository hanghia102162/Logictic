<script setup lang="ts">
import { watch } from 'vue'
import { X } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  title?: string
  description?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  maxWidth: 'md'
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'close': []
}>()

const close = () => {
  emit('update:open', false)
  emit('close')
}

// Lock scroll when open
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl'
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        @click.self="close"
      >
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 translateY(8px)"
          enter-to-class="opacity-100 scale-100 translateY(0)"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="open"
            :class="cn(
              'relative w-full rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col',
              maxWidthClasses[maxWidth]
            )"
          >
            <!-- Close button -->
            <button
              @click="close"
              class="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <X class="w-5 h-5" />
              <span class="sr-only">Đóng</span>
            </button>

            <!-- Header -->
            <div v-if="title || description" class="mb-4 pr-6">
              <h3 v-if="title" class="text-xl font-bold text-slate-900 tracking-tight">
                {{ title }}
              </h3>
              <p v-if="description" class="mt-1 text-sm text-slate-500">
                {{ description }}
              </p>
            </div>

            <!-- Content Body -->
            <div class="flex-1 overflow-y-auto pr-1">
              <slot />
            </div>

            <!-- Footer -->
            <div v-if="$slots.footer" class="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
