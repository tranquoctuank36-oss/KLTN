import { HelpCircle, MessageSquare, Phone, Mail } from "lucide-react";
import { type SupportItem, type FooterGroup } from "@/types/footer";

export const SUPPORT_ITEMS: SupportItem[] = [
  {
    icon: <HelpCircle className="h-6 w-6 flex-shrink-0 text-white" />,
    title: "Trung Tâm Trợ Giúp",
    desc: "Tìm câu trả lời cho câu hỏi của bạn.",
    href: "#",
  },
  {
    icon: <MessageSquare className="h-6 w-6 flex-shrink-0 text-white" />,
    title: "Trò Chuyện Trực Tiếp",
    desc: "Các đại lý của chúng tôi có sẵn 24/7",
    href: "#",
  },
  {
    icon: <Phone className="h-6 w-6 flex-shrink-0 text-white" />,
    title: "Gọi Cho Chúng Tôi",
    desc: "Mỗi ngày 7am – 10pm giờ VN",
    href: "#",
  },
  {
    icon: <Mail className="h-6 w-6 flex-shrink-0 text-white" />,
    title: "Email Cho Chúng Tôi",
    desc: "service@glassesshop.com",
    href: "#",
  },
];

export const FOOTER_LINKS: FooterGroup[] = [
  {
    title: "Sản Phẩm",
    links: [
      { label: "Gọng kính Nam", href: "#" },
      { label: "Gọng kính Nữ", href: "#" },
      { label: "Gọng kính Trẻ Em", href: "#" },
      { label: "Kính Chuyển Ống", href: "#" },
      { label: "Kính Tiến Bộ", href: "#" },
      { label: "Kính Mát Có Độ", href: "#" },
      { label: "Kính Chống Ánh Sáng Xanh", href: "#" },
      { label: "Kính Thể Thao", href: "#" },
      { label: "Kính Bảo Vệ", href: "#" },
      { label: "Lens Tiếp Xúc", href: "#" },
    ],
  },
  {
    title: "Thương Hiệu",
    links: [
      { label: "Kính Ray-Ban", href: "#" },
      { label: "Kính Oakley", href: "#" },
      { label: "Kính Gucci", href: "#" },
      { label: "Kính Tom Ford", href: "#" },
      { label: "Kính Michael Kors", href: "#" },
      { label: "Kính Versace", href: "#" },
      { label: "Kính Prada", href: "#" },
      { label: "Kính Mát Costa", href: "#" },
      { label: "Kính Thiết Kế", href: "#" },
      { label: "Tất Cả Thương Hiệu", href: "#" },
    ],
  },
  {
    title: "Khám Phá",
    links: [
      { label: "Kính FSA/HSA", href: "#" },
      { label: "Chương Trình Liên Kết", href: "#" },
      { label: "Chương Trình Đại Sứ", href: "#" },
      { label: "Chiết Khấu Sinh Viên", href: "#" },
    ],
  },
  {
    title: "Chăm Sóc Khách Hàng",
    links: [
      { label: "Tài Khoản Của Tôi", href: "#" },
      { label: "Theo Dõi Đơn Hàng", href: "#" },
      { label: "Hoàn Trả", href: "#" },
      { label: "Trung Tâm Trợ Giúp", href: "#" },
    ],
  },
  {
    title: "Về Chúng Tôi",
    links: [
      { label: "Giới Thiệu", href: "#" },
      { label: "Tác Động Của Chúng Tôi", href: "#" },
      { label: "Phòng Báo Chí", href: "#" },
      { label: "Tuyển Dụng", href: "#" },
    ],
  },
];
