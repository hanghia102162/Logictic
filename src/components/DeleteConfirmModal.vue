<script setup lang="ts">
import Dialog from '@/components/ui/dialog/Dialog.vue'
import Button from '@/components/ui/button/Button.vue'
import type { CustomerOrder } from '@/types/customer'
import { AlertTriangle } from 'lucide-vue-next'

interface Props {
  open: boolean
  customer: CustomerOrder | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'confirm': [id: string]
}>()

const handleConfirm = () => {
  if (props.customer) {
    emit('confirm', props.customer.id)
    emit('update:open', false)
  }
}
</script>

<template>
  <Dialog
    :open="open"
    @update:open="val => emit('update:open', val)"
    title="Xác Nhận Xóa Đơn Hàng"
    max-width="md"
  >
    <div v-if="customer" class="space-y-4 pt-1">
      <div class="flex items-center gap-3 p-4 bg-rose-50 rounded-xl border border-rose-100 text-rose-800">
        <AlertTriangle class="w-8 h-8 text-rose-600 shrink-0" />
        <div class="text-sm">
          <p class="font-bold">Hành động này không thể hoàn tác!</p>
          <p class="mt-0.5 text-rose-700">
            Bạn có chắc chắn muốn xóa khách hàng <span class="font-bold underline">{{ customer.customerName }}</span> (Mã vận đơn: <code class="font-mono font-bold">{{ customer.trackingCode }}</code>)?
          </p>
        </div>
      </div>
    </div>

    <template #footer>
      <Button variant="ghost" @click="emit('update:open', false)">
        Hủy
      </Button>
      <Button variant="destructive" @click="handleConfirm">
        Xóa Bản Ghi
      </Button>
    </template>
  </Dialog>
</template>
