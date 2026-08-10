<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  class?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'default',
  type: 'button',
  disabled: false
})

const buttonClasses = computed(() => {
  const base = "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer"
  
  const variants = {
    default: "bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow shadow-blue-500/20",
    destructive: "bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow shadow-red-500/20",
    outline: "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:text-slate-900 shadow-sm",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200/80",
    ghost: "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
    link: "text-blue-600 underline-offset-4 hover:underline"
  }

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-11 rounded-lg px-8 text-base",
    icon: "h-10 w-10 p-0"
  }

  return cn(base, variants[props.variant], sizes[props.size], props.class)
})
</script>

<template>
  <button :type="type" :class="buttonClasses" :disabled="disabled">
    <slot />
  </button>
</template>
