<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default'
})

const badgeClasses = computed(() => {
  const base = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"

  const variants = {
    default: "bg-blue-100 text-blue-800 border border-blue-200",
    secondary: "bg-slate-100 text-slate-800 border border-slate-200",
    outline: "border border-slate-300 text-slate-700 bg-white",
    success: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    warning: "bg-amber-100 text-amber-800 border border-amber-200",
    danger: "bg-rose-100 text-rose-800 border border-rose-200"
  }

  return cn(base, variants[props.variant], props.class)
})
</script>

<template>
  <span :class="badgeClasses">
    <slot />
  </span>
</template>
