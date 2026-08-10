<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import { apiService } from '@/services/api'
import type { AuthUser } from '@/types/auth'
import { LogIn, KeyRound, User, Eye, EyeOff, Sparkles, ShieldCheck, AlertCircle } from 'lucide-vue-next'

const emit = defineEmits<{
  'login-success': [user: AuthUser]
}>()

const username = ref('admin@logistic.vn')
const password = ref('123456')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  if (!username.value.trim() || !password.value.trim()) {
    errorMessage.value = 'Vui lòng nhập Tên đăng nhập và Mật khẩu'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const user = await apiService.login(username.value, password.value)
    emit('login-success', user)
  } catch (err: any) {
    errorMessage.value = err.message || 'Đăng nhập không thành công. Kiểm tra lại thông tin tài khoản!'
  } finally {
    isLoading.value = false
  }
}

// 1-Click One Touch Demo Login
const quickDemoLogin = () => {
  username.value = 'admin@logistic.vn'
  password.value = '123456'
  handleLogin()
}
</script>

<template>
  <div class="min-h-[85vh] flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-200/80 animate-fade-in relative overflow-hidden">
      <!-- Top Decorative Accent -->
      <div class="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <!-- Header Icon & Title -->
      <div class="text-center space-y-2 mb-8">
        <div class="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-3">
          <ShieldCheck class="w-9 h-9" />
        </div>
        <h2 class="text-2xl font-black text-slate-900 tracking-tight">Đăng Nhập Hệ Thống</h2>
        <p class="text-xs text-slate-500 font-medium">
          Quản lý Đơn hàng & Vận đơn mã QR - HoaHong Logistics
        </p>
      </div>

      <!-- Sample Account Highlight Badge (Requested by user) -->
      <div class="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4 mb-6 space-y-2 text-xs">
        <div class="flex items-center justify-between font-bold text-blue-900">
          <span class="flex items-center gap-1.5">
            <Sparkles class="w-4 h-4 text-amber-500" /> Tài khoản mẫu đăng nhập:
          </span>
          <span class="bg-blue-200/60 text-blue-800 text-[10px] px-2 py-0.5 rounded-full uppercase">Demo Ready</span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-slate-700 font-mono text-[11px] pt-1">
          <div class="bg-white p-2 rounded-lg border border-blue-100">
            <span class="text-slate-400 block text-[10px]">Tài khoản / Email:</span>
            <strong class="text-blue-900">admin@logistic.vn</strong>
          </div>
          <div class="bg-white p-2 rounded-lg border border-blue-100">
            <span class="text-slate-400 block text-[10px]">Mật khẩu:</span>
            <strong class="text-blue-900">123456</strong>
          </div>
        </div>

        <button
          type="button"
          @click="quickDemoLogin"
          class="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-xl transition-all shadow-sm hover:shadow text-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <LogIn class="w-3.5 h-3.5" /> 1-Click Đăng Nhập Nhanh Mẫu
        </button>
      </div>

      <!-- Error alert -->
      <div v-if="errorMessage" class="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
        <AlertCircle class="w-4 h-4 shrink-0 text-rose-600" />
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <User class="w-3.5 h-3.5 text-blue-600" /> Tên Đăng Nhập / Email
          </label>
          <Input
            v-model="username"
            placeholder="admin@logistic.vn"
            class="h-11"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <KeyRound class="w-3.5 h-3.5 text-blue-600" /> Mật Khẩu
          </label>
          <div class="relative">
            <Input
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              placeholder="••••••••"
              class="h-11 pr-10"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <EyeOff v-if="showPassword" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <Button
          type="submit"
          variant="default"
          class="w-full h-11 text-base font-bold shadow-md shadow-blue-500/20 mt-2"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="flex items-center gap-2">
            Đang xác thực...
          </span>
          <span v-else class="flex items-center justify-center gap-2">
            <LogIn class="w-4 h-4" /> Đăng Nhập Hệ Thống
          </span>
        </Button>
      </form>
    </div>
  </div>
</template>
