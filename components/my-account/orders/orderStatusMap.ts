// Map trạng thái đơn hàng từ tiếng Anh sang tiếng Việt
export const ORDER_STATUS_DISPLAY: Record<string, string> = {
  pending: "Chờ xác nhận",
  processing: "Đang xử lý",
  shipping: "Đang giao",
  delivered: "Đã giao",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
  return_requested: "Yêu cầu trả hàng",
  returning: "Đang trả hàng",
  returned: "Đã trả hàng",
};

// Map ngược từ tiếng Việt sang tiếng Anh (để gửi API)
export const ORDER_STATUS_API_MAP: Record<string, string> = {
  "CHỜ XÁC NHẬN": "pending",
  "ĐANG XỬ LÝ": "processing",
  "ĐANG GIAO": "shipping",
  "ĐÃ GIAO": "delivered",
  "HOÀN THÀNH": "completed",
  "ĐÃ HỦY": "cancelled",
  "YÊU CẦU TRẢ HÀNG": "return_requested",
  "ĐANG TRẢ HÀNG": "returning",
  "ĐÃ TRẢ HÀNG": "returned",
};

// Danh sách các trạng thái để hiển thị trong dropdown
export const ORDER_STATUS_OPTIONS = [
  "Tất cả trạng thái",
  "Chờ xác nhận",
  "Đang xử lý",
  "Đang giao",
  "Đã giao",
  "Hoàn thành",
  "Đã hủy",
  "Yêu cầu trả hàng",
  "Đang trả hàng",
  "Đã trả hàng",
];

// Map màu sắc cho từng trạng thái
export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-purple-100 text-purple-800",
  shipping: "bg-indigo-100 text-indigo-800",
  delivered: "bg-teal-100 text-teal-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  return_requested: "bg-orange-100 text-orange-800",
  returning: "bg-orange-100 text-orange-800",
  returned: "bg-orange-100 text-orange-800",
};

// Map trạng thái trả hàng
export const RETURN_STATUS_DISPLAY: Record<string, string> = {
  requested: "Yêu cầu",
  approved: "Đã duyệt",
  waiting_item: "Chờ hàng hoàn",
  received_at_warehouse: "Đã nhận",
  completed: "Hoàn thành",
  rejected: "Từ chối",
  canceled: "Đã hủy",
};

export const RETURN_STATUS_API_MAP: Record<string, string> = {
  "YÊU CẦU": "requested",
  "ĐÃ DUYỆT": "approved",
  "CHỜ HÀNG HOÀN": "waiting_item",
  "ĐÃ NHẬN": "received_at_warehouse",
  "HOÀN THÀNH": "completed",
  "TỪ CHỐI": "rejected",
  "ĐÃ HỦY": "canceled",
};

export const RETURN_STATUS_OPTIONS = [
  "Tất cả trạng thái",
  "Yêu cầu",
  "Đã duyệt",
  "Chờ hàng hoàn",
  "Đã nhận",
  "Hoàn thành",
  "Từ chối",
  "Đã hủy",
];

export const RETURN_STATUS_COLORS: Record<string, string> = {
  requested: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-800",
  waiting_item: "bg-orange-100 text-orange-800",
  received_at_warehouse: "bg-teal-100 text-teal-800",
  completed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  canceled: "bg-gray-100 text-gray-800",
};
