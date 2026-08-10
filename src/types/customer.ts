export type OrderStatus = 'Pending' | 'Shipping' | 'Delivered' | 'Cancelled'

export interface CustomerOrder {
  id: string              // ID Khách hàng / Đơn hàng
  customerName: string    // Tên Khách Hàng
  trackingCode: string    // Mã vận đơn
  qrImage?: string        // File ảnh QR Khách Hàng (Data URL base64 hoặc URL ảnh)
  qrContent?: string      // Nội dung mã QR
  orderDate: string       // Ngày đặt hàng (YYYY-MM-DD)
  phone: string           // Số điện thoại
  status: OrderStatus     // Trạng thái đơn hàng
  amount?: number         // Giá trị đơn hàng (VND)
  note?: string           // Ghi chú
}

export interface CustomerFilter {
  searchQuery: string
  statusFilter: string
  startDate: string
  endDate: string
}
