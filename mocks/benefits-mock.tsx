import { Truck, BadgeDollarSign, Sparkles, ShieldCheck } from "lucide-react";
import { ComponentType } from "react";

export interface Benefit {
  icon: ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}

export const BENEFITS: Benefit[] = [
  {
    icon: Truck,
    title: "Miễn Phí Vận Chuyển Và Trả Hàng",
    desc: "Tận hưởng vận chuyển miễn phí và trả hàng trên tất cả các loại kính và gọng kính trong nước.",
  },
  {
    icon: BadgeDollarSign,
    title: "Bảo Hành Hoàn Tiền 100%",
    desc: "Trả lại kính của bạn trong 45 ngày đầu để hoàn tiền nếu có lỗi từ nhà sản xuất.",
  },
  {
    icon: Sparkles,
    title: "Gọng Kính Hiện Đại",
    desc: "Gọng kính chất lượng cao của chúng tôi được chế tác chuyên nghiệp từ các vật liệu cao cấp.",
  },
  {
    icon: ShieldCheck,
    title: "Nhà Bán Lẻ Được Phép",
    desc: "Tất cả các thương hiệu và kính mắt thiết kế trên trang web của chúng tôi đều xác thực 100%.",
  },
];
