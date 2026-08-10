<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CustomerTable from '@/components/CustomerTable.vue'
import DeveloperModal from '@/components/DeveloperModal.vue'
import LoginForm from '@/components/LoginForm.vue'
import type { AuthUser } from '@/types/auth'
import { QrCode, ShieldCheck, Sparkles, UserCheck, HeartHandshake, LogOut, User as UserIcon } from 'lucide-vue-next'

const currentUser = ref<AuthUser | null>(null)
const isDevModalOpen = ref(false)

const openDevModal = () => {
  isDevModalOpen.value = true
}

const handleLoginSuccess = (user: AuthUser) => {
  currentUser.value = user
  localStorage.setItem('hoahong_auth_user', JSON.stringify(user))
  // Auto open developer info modal immediately after successful login
  setTimeout(() => {
    isDevModalOpen.value = true
  }, 300)
}

const handleLogout = () => {
  if (confirm('Bạn có muốn đăng xuất khỏi hệ thống không?')) {
    currentUser.value = null
    localStorage.removeItem('hoahong_auth_user')
  }
}

onMounted(() => {
  // Check for active login session in localStorage
  const savedUser = localStorage.getItem('hoahong_auth_user')
  if (savedUser) {
    try {
      currentUser.value = JSON.parse(savedUser)
    } catch {
      currentUser.value = null
    }
  }
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
                Auth Secured
              </span>
            </div>
            <p class="text-xs text-slate-500 hidden sm:block">
              Hệ thống Quản lý Khách Hàng & Vận Đơn Mã QR Tự Động
            </p>
          </div>
        </div>

        <!-- Quick System Status, User Avatar & Developer Link -->
        <div class="flex items-center gap-3">
          <!-- Clickable Developer Link Button -->
          <button
            @click="openDevModal"
            class="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm hover:shadow-md hover:scale-105 transition-all cursor-pointer"
          >
            <Sparkles class="w-3.5 h-3.5 text-amber-300" />
            <span>Hà Trọng Nghĩa (Nhận Làm Web)</span>
          </button>

          <!-- User Logged-in Info & Logout -->
          <div v-if="currentUser" class="flex items-center gap-2">
            <div class="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200/80 text-xs">
              <div class="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                {{ currentUser.username.charAt(0).toUpperCase() }}
              </div>
              <div class="hidden md:flex flex-col text-left leading-tight">
                <span class="font-bold text-slate-900">{{ currentUser.name }}</span>
                <span class="text-[10px] text-slate-500">{{ currentUser.email }}</span>
              </div>
            </div>

            <button
              @click="handleLogout"
              class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              title="Đăng xuất khỏi hệ thống"
            >
              <LogOut class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Container - Login Screen or Dashboard -->
    <main class="w-full px-4 sm:px-6 lg:px-8 xl:px-12 pt-6">
      <!-- Show Login Form if not logged in -->
      <LoginForm
        v-if="!currentUser"
        @login-success="handleLoginSuccess"
      />

      <!-- Show Dashboard Table if logged in -->
      <CustomerTable v-else />
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
