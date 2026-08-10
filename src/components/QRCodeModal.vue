<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import QRCode from 'qrcode'
import Dialog from '@/components/ui/dialog/Dialog.vue'
import Button from '@/components/ui/button/Button.vue'
import type { CustomerOrder } from '@/types/customer'
import { formatDate } from '@/lib/utils'
import { Download, Printer, QrCode as QrIcon, CheckCircle2, User, Package, Calendar, MapPin, Phone, ImageIcon } from 'lucide-vue-next'

interface Props {
  open: boolean
  customer: CustomerOrder | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const qrCanvasRef = ref<HTMLCanvasElement | null>(null)
const qrDataUrl = ref<string>('')
const isCopied = ref(false)

const generateQR = async () => {
  if (!props.customer) return
  
  // If user provided a uploaded QR image data URL
  if (props.customer.qrImage) {
    qrDataUrl.value = props.customer.qrImage
    return
  }

  const qrPayload = props.customer.qrContent || JSON.stringify({
    id: props.customer.id,
    name: props.customer.customerName,
    tracking: props.customer.trackingCode,
    date: props.customer.orderDate,
    phone: props.customer.phone
  })

  try {
    await nextTick()
    if (qrCanvasRef.value) {
      await QRCode.toCanvas(qrCanvasRef.value, qrPayload, {
        width: 240,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      })
    }
    qrDataUrl.value = await QRCode.toDataURL(qrPayload, {
      width: 600,
      margin: 2,
      errorCorrectionLevel: 'H'
    })
  } catch (err) {
    console.error('Lỗi tạo mã QR:', err)
  }
}

watch(() => props.open, (isOpen) => {
  if (isOpen && props.customer) {
    generateQR()
  }
})

watch(() => props.customer, () => {
  if (props.open && props.customer) {
    generateQR()
  }
})

const downloadQR = () => {
  if (!qrDataUrl.value || !props.customer) return
  const link = document.createElement('a')
  link.href = qrDataUrl.value
  link.download = `QR_${props.customer.id}_${props.customer.trackingCode}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const printLabel = () => {
  window.print()
}

const copyTracking = () => {
  if (!props.customer) return
  navigator.clipboard.writeText(props.customer.trackingCode)
  isCopied.value = true
  setTimeout(() => {
    isCopied.value = false
  }, 2000)
}
</script>

<template>
  <Dialog
    :open="open"
    @update:open="val => emit('update:open', val)"
    title="Thông Tin Mã QR Khách Hàng"
    description="Ảnh mã QR Khách Hàng phục vụ quét mã giao nhận & thanh toán"
    max-width="lg"
  >
    <div v-if="customer" class="space-y-6 pt-2">
      <!-- Direct Print Container for Clean Shipping Label Output -->
      <div id="printable-qr-area" class="bg-gradient-to-b from-slate-50 to-blue-50/30 p-6 rounded-2xl border border-slate-200/80 shadow-inner flex flex-col items-center">
        <!-- QR Display: Custom uploaded image OR generated canvas -->
        <div class="relative bg-white p-4 rounded-2xl shadow-md border border-slate-100 group">
          <img
            v-if="customer.qrImage"
            :src="customer.qrImage"
            alt="QR Code Khách Hàng"
            class="w-56 h-56 object-contain rounded-lg"
          />
          <canvas v-else ref="qrCanvasRef" class="w-56 h-56 rounded-lg"></canvas>
          <div class="absolute -top-3 -right-3 bg-blue-600 text-white rounded-full p-2 shadow-lg">
            <QrIcon class="w-5 h-5" />
          </div>
        </div>

        <p class="mt-3 text-xs font-medium text-slate-500 flex items-center gap-1">
          <span>Quét bằng ứng dụng để xem thông tin giao nhận / mã QR thanh toán</span>
        </p>

        <!-- Information Card Grid -->
        <div class="w-full mt-5 bg-white rounded-xl p-4 border border-slate-200/70 shadow-sm space-y-3 text-sm">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <span class="text-slate-500 flex items-center gap-2">
              <User class="w-4 h-4 text-blue-600" /> Tên Khách Hàng:
            </span>
            <span class="font-bold text-slate-900">{{ customer.customerName }}</span>
          </div>

          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <span class="text-slate-500 flex items-center gap-2">
              <Package class="w-4 h-4 text-blue-600" /> Mã Vận Đơn:
            </span>
            <div class="flex items-center gap-2">
              <code class="bg-slate-100 px-2 py-0.5 rounded font-mono font-bold text-blue-700">{{ customer.trackingCode }}</code>
              <button @click="copyTracking" class="text-slate-400 hover:text-blue-600 text-xs transition-colors" title="Sao chép">
                <CheckCircle2 v-if="isCopied" class="w-4 h-4 text-emerald-600" />
                <span v-else class="text-xs text-blue-600 underline cursor-pointer">Copy</span>
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <span class="text-slate-500 flex items-center gap-2">
              <Calendar class="w-4 h-4 text-blue-600" /> Ngày Đặt Hàng:
            </span>
            <span class="font-medium text-slate-800">{{ formatDate(customer.orderDate) }}</span>
          </div>

          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <span class="text-slate-500 flex items-center gap-2">
              <Phone class="w-4 h-4 text-blue-600" /> Số Điện Thoại:
            </span>
            <span class="font-medium text-slate-800">{{ customer.phone || 'Chưa cập nhật' }}</span>
          </div>

          <div v-if="customer.address" class="flex items-start justify-between">
            <span class="text-slate-500 flex items-center gap-2 shrink-0">
              <MapPin class="w-4 h-4 text-blue-600" /> Địa Chỉ:
            </span>
            <span class="font-medium text-slate-800 text-right max-w-[220px]">{{ customer.address }}</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between w-full">
        <Button variant="ghost" @click="emit('update:open', false)">
          Đóng
        </Button>
        <div class="flex items-center gap-2">
          <Button variant="outline" @click="printLabel">
            <Printer class="w-4 h-4 mr-2" /> In Tem Vận Đơn
          </Button>
          <Button variant="default" @click="downloadQR">
            <Download class="w-4 h-4 mr-2" /> Tải Mã QR (PNG)
          </Button>
        </div>
      </div>
    </template>
  </Dialog>
</template>
