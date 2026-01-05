interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md" | "lg";
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    PENDING: {
      label: "Chờ xử lý",
      className: "bg-yellow-100 text-yellow-800"
    },
    PAID: {
      label: "Đã thanh toán",
      className: "bg-blue-100 text-blue-800"
    },
    PROCESSING: {
      label: "Đang xử lý",
      className: "bg-purple-100 text-purple-800"
    },
    SHIPPED: {
      label: "Đã gửi",
      className: "bg-indigo-100 text-indigo-800"
    },
    DELIVERED: {
      label: "Đã giao",
      className: "bg-teal-100 text-teal-800"
    },
    COMPLETED: {
      label: "Hoàn tất",
      className: "bg-green-100 text-green-800"
    },
    CANCELLED: {
      label: "Đã hủy",
      className: "bg-red-100 text-red-800"
    }
  };

  const config = statusConfig[status] || {
    label: status,
    className: "bg-gray-100 text-gray-800"
  };

  const sizeClasses = {
    sm: "px-3 py-1 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <span
      className={`inline-block rounded-full font-semibold ${config.className} ${sizeClasses[size]}`}
    >
      {config.label}
    </span>
  );
}