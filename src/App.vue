<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CustomerTable from '@/components/CustomerTable.vue'
import DeveloperModal from '@/components/DeveloperModal.vue'
import { QrCode, ShieldCheck, Sparkles, UserCheck, HeartHandshake } from 'lucide-vue-next'

const isDevModalOpen = ref(false)

const openDevModal = () => {
  isDevModalOpen.value = true
}

// Auto open developer info modal immediately on page load (Vercel link click)
onMounted(() => {
  setTimeout(() => {
    isDevModalOpen.value = true
  }, 400)
})
</script>

<template>
  <div
    class="min-h-screen bg-slate-100/70 font-sans text-slate-900 selection:bg-blue-600 selection:text-white pb-16"
  >
    <!-- Top Navigation Header -->
    <header
      class="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs"
    >
      <div class="w-full px-4 sm:px-6 lg:px-8 xl:px-12 h-16 flex items-center justify-between">
        <!-- Logo & Brand Title -->
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-xl shadow-md flex items-center justify-center font-black cursor-pointer"
            @click="openDevModal"
          >
            <QrCode class="w-6 h-6" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-lg font-extrabold tracking-tight text-slate-900">
                <span class="text-blue-600">QR Logistics Manager</span>
              </h1>
              <span
                class="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200"
              >
                v1.0 Shadcn UI
              </span>
            </div>
            <p class="text-xs text-slate-500 hidden sm:block">
              Hệ thống Quản lý Khách Hàng & Vận Đơn Mã QR Tự Động
            </p>
          </div>
        </div>

        <!-- Quick System Status & Developer Link -->
        <div class="flex items-center gap-3">
          <!-- Clickable Developer Link Button (Requested by User) -->
          <button
            @click="openDevModal"
            class="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm hover:shadow-md hover:scale-105 transition-all cursor-pointer"
          >
            <Sparkles class="w-3.5 h-3.5 text-amber-300" />
            <span>Hà Trọng Nghĩa (Nhận Làm Web)</span>
          </button>

          <div
            class="hidden md:flex items-center gap-2 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full"
          >
            <span class="relative flex h-2 w-2">
              <span
                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
              ></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span class="font-medium">Hệ thống đang hoạt động</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Container - Fullscreen Width on Desktop -->
    <main class="w-full px-4 sm:px-6 lg:px-8 xl:px-12 pt-6">
      <!-- Main Customer Management Table -->
      <CustomerTable />
    </main>

    <!-- Footer with Clickable Developer Credit -->
    <footer
      class="w-full px-4 sm:px-6 lg:px-8 xl:px-12 mt-16 pt-6 border-t border-slate-200 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2"
    >
      <p>© 2026 HoaHong QR Logistics Manager. Phát triển với Vue 3, Tailwind CSS & Shadcn/Vue.</p>
      
      <button
        @click="openDevModal"
        class="text-blue-600 hover:text-blue-800 font-bold underline underline-offset-4 flex items-center gap-1 transition-colors cursor-pointer"
      >
        <HeartHandshake class="w-3.5 h-3.5 text-blue-600" />
        <span>Hà Trọng Nghĩa nhận làm hộ web theo yêu cầu (Nhấp để xem)</span>
      </button>
    </footer>

    <!-- Developer Info Modal -->
    <DeveloperModal v-model:open="isDevModalOpen" />
  </div>
</template>
