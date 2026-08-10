<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import QRCode from 'qrcode'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import QRCodeModal from '@/components/QRCodeModal.vue'
import CustomerFormModal from '@/components/CustomerFormModal.vue'
import DeleteConfirmModal from '@/components/DeleteConfirmModal.vue'
import type { CustomerOrder, OrderStatus } from '@/types/customer'
import { formatDate } from '@/lib/utils'
import { apiService } from '@/services/api'
import {
  Search,
  Plus,
  QrCode,
  Edit2,
  Trash2,
  Filter,
  Download,
  RefreshCw,
  TrendingUp,
  Truck,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Server
} from 'lucide-vue-next'

// Initial fallback sample data
const defaultCustomers: CustomerOrder[] = []

// Auto-increment ID generator (KH001, KH002, KH003...)
const nextAutoId = computed(() => {
  if (!customers.value || customers.value.length === 0) return 'KH001'
  let maxNum = 0
  customers.value.forEach(c => {
    const match = c.id.match(/\d+/)
    if (match) {
      const num = parseInt(match[0], 10)
      if (num > maxNum) maxNum = num
    }
  })
  const nextNum = maxNum + 1
  return 'KH' + nextNum.toString().padStart(3, '0')
})

// Reactive States
const customers = ref<CustomerOrder[]>([])
const isLoading = ref(true)
const searchQuery = ref('')
const selectedStatus = ref<string>('ALL')
const sortKey = ref<'id' | 'customerName' | 'orderDate'>('orderDate')
const sortOrder = ref<'asc' | 'desc'>('desc')

// Modal States
const isQRModalOpen = ref(false)
const selectedQRCustomer = ref<CustomerOrder | null>(null)

const isFormModalOpen = ref(false)
const customerToEdit = ref<CustomerOrder | null>(null)

const isDeleteModalOpen = ref(false)
const customerToDelete = ref<CustomerOrder | null>(null)

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(6)

// Fetch data from Backend API on mount
const fetchOrdersData = async () => {
  isLoading.value = true
  try {
    const data = await apiService.getOrders()
    customers.value = data || []
  } catch (err) {
    console.error('Lỗi khi tải đơn hàng:', err)
    customers.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchOrdersData()
})

// Save backup to LocalStorage
watch(customers, (newVal) => {
  localStorage.setItem('hoahong_customers', JSON.stringify(newVal))
}, { deep: true })

// Filtered & Sorted Records
const filteredCustomers = computed(() => {
  return customers.value.filter(item => {
    // Search query match
    const q = searchQuery.value.toLowerCase().trim()
    const matchesSearch = !q || (
      item.id.toLowerCase().includes(q) ||
      item.customerName.toLowerCase().includes(q) ||
      item.trackingCode.toLowerCase().includes(q) ||
      (item.qrContent && item.qrContent.toLowerCase().includes(q)) ||
      (item.phone && item.phone.includes(q)) ||
      item.orderDate.includes(q)
    )

    // Status filter match
    const matchesStatus = selectedStatus.value === 'ALL' || item.status === selectedStatus.value

    return matchesSearch && matchesStatus
  }).sort((a, b) => {
    let modifier = sortOrder.value === 'asc' ? 1 : -1
    if (sortKey.value === 'orderDate') {
      return (new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime()) * modifier
    }
    if (sortKey.value === 'customerName') {
      return a.customerName.localeCompare(b.customerName, 'vi') * modifier
    }
    return a.id.localeCompare(b.id) * modifier
  })
})

// Paginated Result
const paginatedCustomers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredCustomers.value.slice(start, start + itemsPerPage.value)
})

const totalPages = computed(() => {
  return Math.ceil(filteredCustomers.value.length / itemsPerPage.value) || 1
})

// Reset pagination when search or status changes
watch([searchQuery, selectedStatus], () => {
  currentPage.value = 1
})

// Sorting Toggle
const toggleSort = (key: 'id' | 'customerName' | 'orderDate') => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

// Handlers
const openAddModal = () => {
  customerToEdit.value = null
  isFormModalOpen.value = true
}

const openEditModal = (item: CustomerOrder) => {
  customerToEdit.value = item
  isFormModalOpen.value = true
}

const openQRModal = (item: CustomerOrder) => {
  selectedQRCustomer.value = item
  isQRModalOpen.value = true
}

const openDeleteModal = (item: CustomerOrder) => {
  customerToDelete.value = item
  isDeleteModalOpen.value = true
}

const handleSaveCustomer = async (savedCustomer: CustomerOrder) => {
  const index = customers.value.findIndex(c => c.id === savedCustomer.id)
  if (index >= 0) {
    customers.value[index] = savedCustomer
    await apiService.updateOrder(savedCustomer.id, savedCustomer)
  } else {
    customers.value.unshift(savedCustomer)
    await apiService.createOrder(savedCustomer)
  }
  generateMiniQR(savedCustomer, true)
}

const handleDeleteCustomer = async (id: string) => {
  customers.value = customers.value.filter(c => c.id !== id)
  await apiService.deleteOrder(id)
}

const resetData = () => {
  fetchOrdersData()
}

// Export CSV
const exportToCSV = () => {
  const headers = ['ID', 'Tên Khách Hàng', 'Mã Vận Đơn', 'Nội Dung QR', 'Ngày Đặt Hàng', 'Số Điện Thoại', 'Trạng Thái', 'Giá Trị']
  const rows = filteredCustomers.value.map(c => [
    `"${c.id}"`,
    `"${c.customerName}"`,
    `"${c.trackingCode}"`,
    `"${c.qrContent || ''}"`,
    `"${c.orderDate}"`,
    `"${c.phone || ''}"`,
    `"${c.status}"`,
    c.amount || 0
  ])
  
  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `Danh_Sach_Don_Hang_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Dashboard Stat Counters
const stats = computed(() => {
  const total = customers.value.length
  const pending = customers.value.filter(c => c.status === 'Pending').length
  const shipping = customers.value.filter(c => c.status === 'Shipping').length
  const delivered = customers.value.filter(c => c.status === 'Delivered').length
  const revenue = customers.value.reduce((acc, c) => acc + (c.amount || 0), 0)
  return { total, pending, shipping, delivered, revenue }
})

// QR Canvas Generator cache for table thumbnails
const miniQRCache = ref<Record<string, string>>({})

const generateMiniQR = async (item: CustomerOrder, force = false) => {
  if (item.qrImage) {
    miniQRCache.value[item.id] = item.qrImage
    return item.qrImage
  }
  if (!force && miniQRCache.value[item.id]) return miniQRCache.value[item.id]
  try {
    const payload = item.qrContent || JSON.stringify({
      id: item.id,
      name: item.customerName,
      tracking: item.trackingCode
    })
    const url = await QRCode.toDataURL(payload, { width: 80, margin: 1 })
    miniQRCache.value[item.id] = url
    return url
  } catch {
    return ''
  }
}

watch(customers, () => {
  customers.value.forEach(item => generateMiniQR(item))
}, { immediate: true })

const getStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case 'Delivered':
      return { variant: 'success' as const, label: 'Đã giao' }
    case 'Shipping':
      return { variant: 'default' as const, label: 'Đang vận chuyển' }
    case 'Pending':
      return { variant: 'warning' as const, label: 'Chờ xử lý' }
    case 'Cancelled':
      return { variant: 'danger' as const, label: 'Đã hủy' }
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Top Dashboard Summary Stat Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng Đơn Hàng</p>
          <p class="text-2xl font-extrabold text-slate-900 mt-1">{{ stats.total }}</p>
        </div>
        <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
          <TrendingUp class="w-6 h-6" />
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold text-amber-600 uppercase tracking-wider">Chờ Xử Lý</p>
          <p class="text-2xl font-extrabold text-slate-900 mt-1">{{ stats.pending }}</p>
        </div>
        <div class="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
          <Clock class="w-6 h-6" />
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold text-blue-600 uppercase tracking-wider">Đang Đội Giao</p>
          <p class="text-2xl font-extrabold text-slate-900 mt-1">{{ stats.shipping }}</p>
        </div>
        <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
          <Truck class="w-6 h-6" />
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Đã Giao Thành Công</p>
          <p class="text-2xl font-extrabold text-slate-900 mt-1">{{ stats.delivered }}</p>
        </div>
        <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
          <CheckCircle2 class="w-6 h-6" />
        </div>
      </div>
    </div>

    <!-- Main Table Card Container -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xl overflow-hidden">
      <!-- Toolbar & Action Bar -->
      <div class="p-5 border-b border-slate-100 bg-slate-50/50 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              Bảng Đơn Hàng & QR Khách Hàng
              <span class="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Server class="w-3 h-3" /> REST API Backend Connected
              </span>
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">
              Đồng bộ dữ liệu thời gian thực từ Express Backend Server API
            </p>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" @click="resetData" title="Tải lại từ Express Server">
              <RefreshCw class="w-4 h-4 mr-1.5" /> Đồng Bộ Server
            </Button>

            <Button variant="outline" size="sm" @click="exportToCSV">
              <Download class="w-4 h-4 mr-1.5" /> Xuất CSV
            </Button>

            <Button variant="default" size="default" @click="openAddModal">
              <Plus class="w-4.5 h-4.5 mr-1.5" /> Thêm Đơn Hàng Mới
            </Button>
          </div>
        </div>

        <!-- Filter & Search Controls -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
          <!-- Search input (Required by User prompt: Tìm kiếm) -->
          <div class="md:col-span-7 relative">
            <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              v-model="searchQuery"
              placeholder="Tìm kiếm theo Tên Khách Hàng, Mã Vận Đơn, ID..."
              class="pl-10 pr-9 bg-white"
            />
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full w-5 h-5 flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          <!-- Filter Status Tabs -->
          <div class="md:col-span-5 flex items-center gap-1 overflow-x-auto bg-slate-200/60 p-1 rounded-lg">
            <button
              @click="selectedStatus = 'ALL'"
              :class="[
                'flex-1 text-xs font-bold px-2.5 py-1.5 rounded-md transition-all whitespace-nowrap',
                selectedStatus === 'ALL' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              ]"
            >
              Tất cả
            </button>
            <button
              @click="selectedStatus = 'Pending'"
              :class="[
                'flex-1 text-xs font-bold px-2.5 py-1.5 rounded-md transition-all whitespace-nowrap',
                selectedStatus === 'Pending' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              ]"
            >
              Chờ xử lý
            </button>
            <button
              @click="selectedStatus = 'Shipping'"
              :class="[
                'flex-1 text-xs font-bold px-2.5 py-1.5 rounded-md transition-all whitespace-nowrap',
                selectedStatus === 'Shipping' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              ]"
            >
              Đang giao
            </button>
            <button
              @click="selectedStatus = 'Delivered'"
              :class="[
                'flex-1 text-xs font-bold px-2.5 py-1.5 rounded-md transition-all whitespace-nowrap',
                selectedStatus === 'Delivered' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              ]"
            >
              Đã giao
            </button>
          </div>
        </div>
      </div>

      <!-- Main Data Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-200 bg-slate-100/70 text-slate-700 text-xs font-bold uppercase tracking-wider select-none">
              <th class="py-3.5 px-4 cursor-pointer hover:bg-slate-200/60 transition-colors" @click="toggleSort('id')">
                <div class="flex items-center gap-1">
                  ID <ArrowUpDown class="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th class="py-3.5 px-4 cursor-pointer hover:bg-slate-200/60 transition-colors" @click="toggleSort('customerName')">
                <div class="flex items-center gap-1">
                  Tên Khách Hàng <ArrowUpDown class="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th class="py-3.5 px-4">
                Mã Vận Đơn
              </th>
              <th class="py-3.5 px-4 text-center">
                QR Khách Hàng
              </th>
              <th class="py-3.5 px-4 cursor-pointer hover:bg-slate-200/60 transition-colors" @click="toggleSort('orderDate')">
                <div class="flex items-center gap-1">
                  Ngày Đặt Hàng <ArrowUpDown class="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th class="py-3.5 px-4">
                Trạng Thái
              </th>
              <th class="py-3.5 px-4 text-right">
                Thao Tác
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm">
            <template v-if="paginatedCustomers.length > 0">
              <tr
                v-for="item in paginatedCustomers"
                :key="item.id"
                class="hover:bg-blue-50/40 transition-colors group"
              >
                <!-- Column 1: ID -->
                <td class="py-3.5 px-4 font-mono font-bold text-slate-900">
                  <span class="inline-block px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md text-xs">
                    {{ item.id }}
                  </span>
                </td>

                <!-- Column 2: Tên Khách Hàng -->
                <td class="py-3.5 px-4">
                  <div class="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {{ item.customerName }}
                  </div>
                  <div v-if="item.phone" class="text-xs text-slate-400">
                    {{ item.phone }}
                  </div>
                </td>

                <!-- Column 3: Mã Vận Đơn -->
                <td class="py-3.5 px-4">
                  <div class="flex flex-col gap-1">
                    <span class="font-mono font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/60 text-xs w-fit">
                      {{ item.trackingCode }}
                    </span>
                  </div>
                </td>

                <!-- Column 4: QR Khách Hàng (Interactive Thumbnail Image + Click to open Modal) -->
                <td class="py-3.5 px-4 text-center">
                  <button
                    @click="openQRModal(item)"
                    class="relative inline-flex items-center justify-center p-1 bg-white border border-slate-200 hover:border-blue-500 rounded-xl shadow-sm hover:shadow transition-all group/qr cursor-pointer overflow-hidden"
                    title="Nhấp để xem phóng to ảnh mã QR Khách Hàng"
                  >
                    <img
                      v-if="item.qrImage || miniQRCache[item.id]"
                      :src="item.qrImage || miniQRCache[item.id]"
                      alt="QR Code"
                      class="w-10 h-10 object-contain rounded"
                    />
                    <div v-else class="w-10 h-10 bg-slate-100 animate-pulse rounded flex items-center justify-center text-slate-400">
                      <QrCode class="w-5 h-5" />
                    </div>
                    <div class="absolute inset-0 bg-blue-600/80 rounded-xl opacity-0 group-hover/qr:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <QrCode class="w-5 h-5" />
                    </div>
                  </button>
                </td>

                <!-- Column 5: Ngày Đặt Hàng -->
                <td class="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                  {{ formatDate(item.orderDate) }}
                </td>

                <!-- Status Badge -->
                <td class="py-3.5 px-4">
                  <Badge :variant="getStatusBadge(item.status).variant">
                    {{ getStatusBadge(item.status).label }}
                  </Badge>
                </td>

                <!-- Actions: Sửa & Xóa -->
                <td class="py-3.5 px-4 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <!-- Phóng to QR button -->
                    <Button
                      variant="ghost"
                      size="icon"
                      @click="openQRModal(item)"
                      class="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      title="Xem Mã QR"
                    >
                      <QrCode class="w-4 h-4" />
                    </Button>

                    <!-- Sửa button -->
                    <Button
                      variant="ghost"
                      size="icon"
                      @click="openEditModal(item)"
                      class="text-slate-600 hover:text-blue-600 hover:bg-slate-100"
                      title="Chỉnh sửa đơn hàng"
                    >
                      <Edit2 class="w-4 h-4" />
                    </Button>

                    <!-- Xóa button -->
                    <Button
                      variant="ghost"
                      size="icon"
                      @click="openDeleteModal(item)"
                      class="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Xóa bản ghi"
                    >
                      <Trash2 class="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            </template>

            <tr v-else>
              <td colspan="7" class="py-12 text-center">
                <div class="flex flex-col items-center justify-center text-slate-400">
                  <Search class="w-10 h-10 mb-2 text-slate-300" />
                  <p class="font-bold text-slate-600">Không tìm thấy đơn hàng phù hợp</p>
                  <p class="text-xs text-slate-400 mt-1">Thử thay đổi từ khóa tìm kiếm hoặc lọc trạng thái</p>
                  <Button variant="outline" size="sm" class="mt-4" @click="searchQuery = ''; selectedStatus = 'ALL'">
                    Xóa Bộ Lọc
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div v-if="filteredCustomers.length > 0" class="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          Hiển thị <span class="font-bold text-slate-900">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> đến
          <span class="font-bold text-slate-900">{{ Math.min(currentPage * itemsPerPage, filteredCustomers.length) }}</span> trên tổng số
          <span class="font-bold text-slate-900">{{ filteredCustomers.length }}</span> kết quả
        </div>

        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            <ChevronLeft class="w-4 h-4 mr-1" /> Trước
          </Button>

          <span class="font-bold text-slate-700 px-2">
            Trang {{ currentPage }} / {{ totalPages }}
          </span>

          <Button
            variant="outline"
            size="sm"
            :disabled="currentPage >= totalPages"
            @click="currentPage++"
          >
            Sau <ChevronRight class="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <QRCodeModal
      v-model:open="isQRModalOpen"
      :customer="selectedQRCustomer"
    />

    <CustomerFormModal
      v-model:open="isFormModalOpen"
      :customer-to-edit="customerToEdit"
      :next-auto-id="nextAutoId"
      @save="handleSaveCustomer"
    />

    <DeleteConfirmModal
      v-model:open="isDeleteModalOpen"
      :customer="customerToDelete"
      @confirm="handleDeleteCustomer"
    />
  </div>
</template>
