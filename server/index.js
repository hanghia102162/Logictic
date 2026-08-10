import express from 'express'
import cors from 'cors'
import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Directories setup
const dataDir = path.join(__dirname, 'data')
const uploadsDir = path.join(__dirname, 'uploads')
const dataFilePath = path.join(dataDir, 'orders.json')

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Serve uploaded QR images statically
app.use('/uploads', express.static(uploadsDir))

// Multer storage for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png'
    const uniqueName = `qr_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`
    cb(null, uniqueName)
  }
})
const upload = multer({ storage })

// Helpers for reading/writing JSON DB
function readOrders() {
  try {
    if (!fs.existsSync(dataFilePath)) return []
    const content = fs.readFileSync(dataFilePath, 'utf-8')
    return JSON.parse(content || '[]')
  } catch (err) {
    console.error('Lỗi đọc database orders.json:', err)
    return []
  }
}

function writeOrders(orders) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(orders, null, 2), 'utf-8')
  } catch (err) {
    console.error('Lỗi ghi database orders.json:', err)
  }
}

// --- API ENDPOINTS ---

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'HoaHong Logistics API Server is running' })
})

// GET /api/orders - Fetch all orders
app.get('/api/orders', (req, res) => {
  const orders = readOrders()
  res.json(orders)
})

// GET /api/orders/:id - Fetch single order
app.get('/api/orders/:id', (req, res) => {
  const orders = readOrders()
  const order = orders.find(o => o.id === req.params.id)
  if (!order) {
    return res.status(404).json({ error: 'Không tìm thấy đơn hàng' })
  }
  res.json(order)
})

// POST /api/orders - Create new order
app.post('/api/orders', (req, res) => {
  const newOrder = req.body
  if (!newOrder.id || !newOrder.customerName || !newOrder.trackingCode) {
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc (ID, Tên Khách Hàng, Mã Vận Đơn)' })
  }

  const orders = readOrders()
  const exists = orders.some(o => o.id === newOrder.id)
  if (exists) {
    return res.status(400).json({ error: `Mã ID ${newOrder.id} đã tồn tại` })
  }

  orders.unshift(newOrder)
  writeOrders(orders)
  res.status(201).json(newOrder)
})

// PUT /api/orders/:id - Update existing order
app.put('/api/orders/:id', (req, res) => {
  const orders = readOrders()
  const index = orders.findIndex(o => o.id === req.params.id)
  if (index === -1) {
    return res.status(404).json({ error: 'Không tìm thấy đơn hàng để cập nhật' })
  }

  orders[index] = { ...orders[index], ...req.body, id: req.params.id }
  writeOrders(orders)
  res.json(orders[index])
})

// DELETE /api/orders/:id - Delete order
app.delete('/api/orders/:id', (req, res) => {
  const orders = readOrders()
  const filtered = orders.filter(o => o.id !== req.params.id)
  if (orders.length === filtered.length) {
    return res.status(404).json({ error: 'Không tìm thấy đơn hàng để xóa' })
  }

  writeOrders(filtered)
  res.json({ success: true, message: `Đã xóa đơn hàng ${req.params.id}` })
})

// POST /api/upload - Upload QR Image file
app.post('/api/upload', upload.single('qrImage'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Không tìm thấy file ảnh tải lên' })
  }
  const imageUrl = `/uploads/${req.file.filename}`
  res.json({ success: true, imageUrl })
})

// Export Express App for Vercel Serverless Function compatibility
export default app

// Start Express Server locally
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 HoaHong Logistics Backend API Server running at http://localhost:${PORT}`)
  })
}
