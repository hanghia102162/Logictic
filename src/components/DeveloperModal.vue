<script setup lang="ts">
import Dialog from '@/components/ui/dialog/Dialog.vue'
import Button from '@/components/ui/button/Button.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import { UserCheck, Code2, Globe, Phone, Mail, Sparkles, CheckCircle2, HeartHandshake } from 'lucide-vue-next'

interface Props {
  open: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()
</script>

<template>
  <Dialog
    :open="open"
    @update:open="val => emit('update:open', val)"
    title="Dịch Vụ Thiết Kế & Lập Trình Web"
    description="Thông tin tác giả & nhận làm website theo yêu cầu"
    max-width="md"
  >
    <div class="space-y-5 pt-2">
      <!-- Profile Card Banner -->
      <div class="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
        <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
        <div class="flex items-center gap-4 relative z-10">
          <div class="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/30 text-2xl font-black shadow-inner shrink-0">
            HTN
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-xl font-extrabold tracking-tight">Hà Trọng Nghĩa</h3>
              <Badge variant="success" class="bg-emerald-500/30 text-emerald-100 border-emerald-300/40 text-[10px]">
                Active Developer
              </Badge>
            </div>
            <p class="text-xs text-blue-100 font-medium mt-0.5 flex items-center gap-1">
              <Sparkles class="w-3.5 h-3.5 text-amber-300" /> Nhận làm hộ Website / App / Web Bot theo yêu cầu
            </p>
          </div>
        </div>
      </div>

      <!-- Services List -->
      <div class="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2.5 text-xs text-slate-700">
        <p class="font-bold text-slate-900 text-sm flex items-center gap-1.5 pb-1 border-b border-slate-200/60">
          <Code2 class="w-4 h-4 text-blue-600" /> Các dịch vụ nhận hỗ trợ & lập trình:
        </p>

        <div class="flex items-start gap-2">
          <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span><strong>Thiết Kế Web Theo Yêu Cầu</strong>: Web quản lý bán hàng, logistics, trang giới thiệu, landing page.</span>
        </div>

        <div class="flex items-start gap-2">
          <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span><strong>Giao Diện Hiện Đại</strong>: Chuẩn Shadcn UI, Vue 3, React, Tailwind CSS, tối ưu trên di động & máy tính.</span>
        </div>

        <div class="flex items-start gap-2">
          <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span><strong>Backend & REST API</strong>: Node.js, Express, Python FastAPI, tích hợp QR Code, Zalo Pay, VietQR.</span>
        </div>
      </div>

      <!-- Contact Info Section -->
      <div class="bg-blue-50/70 p-4 rounded-xl border border-blue-100 space-y-2 text-xs">
        <p class="font-bold text-blue-900 text-sm flex items-center gap-1.5">
          <HeartHandshake class="w-4 h-4 text-blue-600" /> Liên hệ trực tiếp:
        </p>

        <div class="flex items-center justify-between text-slate-700 pt-1">
          <span class="flex items-center gap-1.5 font-semibold">
            <UserCheck class="w-4 h-4 text-blue-600" /> Lập trình viên:
          </span>
          <span class="font-extrabold text-blue-900">Hà Trọng Nghĩa</span>
        </div>

        <div class="flex items-center justify-between text-slate-700">
          <span class="flex items-center gap-1.5 font-semibold">
            <Globe class="w-4 h-4 text-blue-600" /> Dự án:
          </span>
          <span class="font-bold text-slate-800">HoaHong QR Logistics Manager</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between w-full">
        <span class="text-[11px] text-slate-400">© Hà Trọng Nghĩa Web Service</span>
        <Button variant="default" @click="emit('update:open', false)">
          Đã Hiểu
        </Button>
      </div>
    </template>
  </Dialog>
</template>
