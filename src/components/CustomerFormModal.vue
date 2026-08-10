<script setup lang="ts">
import { ref, watch } from 'vue'
import QRCode from 'qrcode'
import Dialog from '@/components/ui/dialog/Dialog.vue'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import type { CustomerOrder } from '@/types/customer'
import {
  Sparkles,
  User,
  Package,
  Calendar,
  Phone,
  MapPin,
  DollarSign,
  Image as ImageIcon,
  Upload,
  X,
  QrCode,
} from 'lucide-vue-next'

interface Props {
  open: boolean
  customerToEdit: CustomerOrder | null
  nextAutoId?: string
}

const props = withDefaults(defineProps<Props>(), {
  nextAutoId: 'KH001'
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [customer: CustomerOrder]
}>()

const getTodayString = (): string => {
  const parts = new Date().toISOString().split('T')
  return parts[0] || '2026-08-10'
}

const form = ref<CustomerOrder>({
  id: '',
  customerName: '',
  trackingCode: '',
  qrImage: '',
  qrContent: '',
  orderDate: getTodayString(),
  phone: '',
  address: '',
  status: 'Pending',
  amount: undefined,
})

const errors = ref<Record<string, string>>({})
const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

const generateRandomTracking = () => {
  const prefixes = ['SPX', 'GHTK', 'GHN', 'VTP', 'VNPOST']
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const randomDigits = Math.floor(100000000 + Math.random() * 900000000)
  form.value.trackingCode = `${randomPrefix}${randomDigits}`
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processImageFile(file)
  }
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) {
    processImageFile(file)
  }
}

const processImageFile = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    form.value.qrImage = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const removeQRImage = () => {
  form.value.qrImage = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

// Auto generate QR code image if user doesn't upload a file
const autoGenerateQRImage = async () => {
  const payload = JSON.stringify({
    id: form.value.id || 'KH001',
    name: form.value.customerName || 'Khách Hàng',
    tracking: form.value.trackingCode || 'SPX12345678',
  })
  try {
    form.value.qrImage = await QRCode.toDataURL(payload, { width: 300, margin: 1 })
    form.value.qrContent = `QR-${form.value.id}-${form.value.trackingCode || 'CODE'}`
  } catch (err) {
    console.error('Lỗi sinh ảnh QR:', err)
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      errors.value = {}
      if (props.customerToEdit) {
        form.value = { ...props.customerToEdit }
      } else {
        // Clear all default values for fresh entry, set auto-increment ID
        form.value = {
          id: props.nextAutoId || 'KH001',
          customerName: '',
          trackingCode: '',
          qrImage: '',
          qrContent: '',
          orderDate: getTodayString(),
          phone: '',
          address: '',
          status: 'Pending',
          amount: undefined,
        }
      }
    }
  },
)

const validate = (): boolean => {
  const errs: Record<string, string> = {}
  if (!form.value.id.trim()) {
    errs.id = 'Mã ID khách hàng không được để trống'
  }
  if (!form.value.customerName.trim()) {
    errs.customerName = 'Vui lòng nhập Tên Khách Hàng'
  }
  if (!form.value.trackingCode.trim()) {
    errs.trackingCode = 'Vui lòng nhập hoặc tạo ngẫu nhiên Mã Vận Đơn'
  }
  if (!form.value.orderDate) {
    errs.orderDate = 'Vui lòng chọn Ngày Đặt Hàng'
  }

  errors.value = errs
  return Object.keys(errs).length === 0
}

const handleSubmit = async () => {
  if (!validate()) return
  // If user didn't upload an image, generate a default QR image
  if (!form.value.qrImage) {
    await autoGenerateQRImage()
  }
  emit('save', { ...form.value })
  emit('update:open', false)
}
</script>

<template>
  <Dialog
    :open="open"
    @update:open="(val) => emit('update:open', val)"
    :title="customerToEdit ? 'Chỉnh Sửa Đơn Hàng' : 'Thêm Mới Khách Hàng / Đơn Hàng'"
    description="Nhập thông tin khách hàng mới (Mã ID tự động tăng)"
    max-width="lg"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4 pt-2">
      <!-- Grid 2 columns for ID & Customer Name -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- ID (Auto-incremented, disabled editing for new items) -->
        <div>
          <label
            class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between"
          >
            <span class="flex items-center gap-1">
              <span class="text-blue-600">#</span> Mã ID Khách Hàng
              <span class="text-rose-500">*</span>
            </span>
            <span class="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">Tự tăng</span>
          </label>
          <Input
            v-model="form.id"
            placeholder="KH001"
            class="bg-slate-100 font-mono font-bold text-blue-800"
            :class="errors.id ? 'border-rose-400 focus-visible:ring-rose-400' : ''"
          />
          <p v-if="errors.id" class="mt-1 text-xs text-rose-500 font-medium">{{ errors.id }}</p>
        </div>

        <!-- Customer Name -->
        <div>
          <label
            class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1"
          >
            <User class="w-3.5 h-3.5 text-blue-600" /> Tên Khách Hàng
            <span class="text-rose-500">*</span>
          </label>
          <Input
            v-model="form.customerName"
            placeholder="Nhập tên khách hàng..."
            :class="errors.customerName ? 'border-rose-400 focus-visible:ring-rose-400' : ''"
          />
          <p v-if="errors.customerName" class="mt-1 text-xs text-rose-500 font-medium">
            {{ errors.customerName }}
          </p>
        </div>
      </div>

      <!-- Tracking Code with Auto Generate Button -->
      <div>
        <div class="flex items-center justify-between mb-1.5">
          <label
            class="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1"
          >
            <Package class="w-3.5 h-3.5 text-blue-600" /> Mã Vận Đơn
            <span class="text-rose-500">*</span>
          </label>
          <button
            type="button"
            @click="generateRandomTracking"
            class="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 transition-colors"
          >
            <Sparkles class="w-3.5 h-3.5" /> Tạo mã ngẫu nhiên
          </button>
        </div>
        <Input
          v-model="form.trackingCode"
          placeholder="Nhập mã vận đơn (VD: SPX84920194)..."
          class="font-mono uppercase font-bold text-blue-900"
          :class="errors.trackingCode ? 'border-rose-400 focus-visible:ring-rose-400' : ''"
        />
        <p v-if="errors.trackingCode" class="mt-1 text-xs text-rose-500 font-medium">
          {{ errors.trackingCode }}
        </p>
      </div>

      <!-- Image Input area for QR Khách Hàng -->
      <div>
        <div class="flex items-center justify-between mb-1.5">
          <label
            class="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1"
          >
            <ImageIcon class="w-3.5 h-3.5 text-blue-600" /> Tải Lên Ảnh QR Khách Hàng
          </label>
          <button
            type="button"
            @click="autoGenerateQRImage"
            class="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 transition-colors"
          >
            <QrCode class="w-3.5 h-3.5" /> Tạo ảnh QR mẫu
          </button>
        </div>

        <!-- File Upload Drag and Drop Container -->
        <div
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
          :class="[
            'border-2 border-dashed rounded-xl p-4 transition-all flex flex-col items-center justify-center text-center cursor-pointer',
            isDragging
              ? 'border-blue-500 bg-blue-50/60'
              : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 hover:border-slate-300',
          ]"
          @click="fileInputRef?.click()"
        >
          <!-- Hidden file input -->
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileUpload"
          />

          <!-- Preview if image exists -->
          <div v-if="form.qrImage" class="relative group/img flex flex-col items-center">
            <img
              :src="form.qrImage"
              alt="QR Khách Hàng Preview"
              class="w-32 h-32 object-contain bg-white rounded-lg p-2 border border-slate-200 shadow-sm"
            />
            <button
              type="button"
              @click.stop="removeQRImage"
              class="mt-2 text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200"
            >
              <X class="w-3.5 h-3.5" /> Xóa ảnh QR này
            </button>
          </div>

          <!-- Empty state upload prompt -->
          <div v-else class="py-3 flex flex-col items-center text-slate-500">
            <div
              class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2"
            >
              <Upload class="w-5 h-5" />
            </div>
            <p class="text-xs font-bold text-slate-800">
              Nhấp để chọn ảnh hoặc kéo thả file ảnh QR vào đây
            </p>
            <p class="text-[11px] text-slate-400 mt-0.5">
              Hỗ trợ file PNG, JPG, WEBP, VietQR...
            </p>
          </div>
        </div>
      </div>

      <!-- Order Date & Status -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Order Date -->
        <div>
          <label
            class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1"
          >
            <Calendar class="w-3.5 h-3.5 text-blue-600" /> Ngày Đặt Hàng
            <span class="text-rose-500">*</span>
          </label>
          <Input
            type="date"
            v-model="form.orderDate"
            :class="errors.orderDate ? 'border-rose-400 focus-visible:ring-rose-400' : ''"
          />
          <p v-if="errors.orderDate" class="mt-1 text-xs text-rose-500 font-medium">
            {{ errors.orderDate }}
          </p>
        </div>

        <!-- Status -->
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Trạng Thái Đơn Hàng
          </label>
          <select
            v-model="form.status"
            class="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all font-medium"
          >
            <option value="Pending">Chờ xử lý</option>
            <option value="Shipping">Đang vận chuyển</option>
            <option value="Delivered">Đã giao thành công</option>
            <option value="Cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      <!-- Phone & Amount -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1"
          >
            <Phone class="w-3.5 h-3.5 text-blue-600" /> Số Điện Thoại
          </label>
          <Input v-model="form.phone" placeholder="Nhập SĐT khách hàng..." />
        </div>

        <div>
          <label
            class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1"
          >
            <DollarSign class="w-3.5 h-3.5 text-blue-600" /> Giá Trị Đơn (VNĐ)
          </label>
          <Input type="number" v-model.number="form.amount" placeholder="Nhập số tiền..." />
        </div>
      </div>

      <!-- Address -->
      <div>
        <label
          class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1"
        >
          <MapPin class="w-3.5 h-3.5 text-blue-600" /> Địa Chỉ Giao Hàng
        </label>
        <Input v-model="form.address" placeholder="Nhập địa chỉ giao hàng..." />
      </div>

      <!-- Footer Buttons -->
      <div class="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-6">
        <Button type="button" variant="outline" @click="emit('update:open', false)">
          Hủy Bỏ
        </Button>
        <Button type="submit" variant="default">
          {{ customerToEdit ? 'Lưu Thay Đổi' : 'Tạo Đơn Hàng Mới' }}
        </Button>
      </div>
    </form>
  </Dialog>
</template>
