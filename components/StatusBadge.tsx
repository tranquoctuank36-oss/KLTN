interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md" | "lg";
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    PENDING: {
      label: "Pending",
      className: "bg-yellow-100 text-yellow-800"
    },
    PAID: {
      label: "Paid",
      className: "bg-blue-100 text-blue-800"
    },
    PROCESSING: {
      label: "Processing",
      className: "bg-purple-100 text-purple-800"
    },
    SHIPPED: {
      label: "Shipped",
      className: "bg-indigo-100 text-indigo-800"
    },
    DELIVERED: {
      label: "Delivered",
      className: "bg-teal-100 text-teal-800"
    },
    COMPLETED: {
      label: "Completed",
      className: "bg-green-100 text-green-800"
    },
    CANCELLED: {
      label: "Cancelled",
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