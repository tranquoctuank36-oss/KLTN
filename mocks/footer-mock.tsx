import { HelpCircle, MessageSquare, Phone, Mail } from "lucide-react";
import { type SupportItem, type FooterGroup } from "@/types/footer";

export const SUPPORT_ITEMS: SupportItem[] = [
  {
    icon: <HelpCircle className="h-6 w-6 flex-shrink-0 text-white" />,
    title: "Trung Tâm Trợ Giúp",
    desc: "Tìm câu trả lời cho câu hỏi của bạn.",
  },
  {
    icon: <Phone className="h-6 w-6 flex-shrink-0 text-white" />,
    title: "Gọi Cho Chúng Tôi",
    desc: "Mỗi ngày từ 07:00 đến 20:00",
  },
  {
    icon: <Mail className="h-6 w-6 flex-shrink-0 text-white" />,
    title: "Email Cho Chúng Tôi",
    desc: "cskh.glassesshop@gmail.com",
  },
];

export const FOOTER_LINKS: FooterGroup[] = [
  {
    title: "Sản Phẩm",
    links: [
      { label: "Gọng kính Nam", href: "#" },
      { label: "Gọng kính Nữ", href: "#" },
      { label: "Gọng kính Unisex", href: "#" },
      { label: "Gọng kính Trẻ Em", href: "#" },
      { label: "Kính mát Nam", href: "#" },
      { label: "Kính mát Nữ", href: "#" },
      { label: "Kính mát Unisex", href: "#" },
      { label: "Kính mát Trẻ Em", href: "#" },
    ],
  },
  {
    title: "Thương Hiệu",
    links: [
      { label: "Kính Adidas", href: "#" },
      { label: "Kính Oakley", href: "#" },
      { label: "Kính Gucci", href: "#" },
      { label: "Kính Tom Ford", href: "#" },
      { label: "Kính Michael Kors", href: "#" },
      { label: "Kính Versace", href: "#" },
      { label: "Kính Prada", href: "#" },
      { label: "Tất Cả Thương Hiệu", href: "#" },
    ],
  },
  // {
  //   title: "Khám Phá",
  //   links: [
  //     { label: "Kính FSA/HSA", href: "#" },
  //     { label: "Chương Trình Liên Kết", href: "#" },
  //     { label: "Chương Trình Đại Sứ", href: "#" },
  //     { label: "Chiết Khấu Sinh Viên", href: "#" },
  //   ],
  // },
  {
    title: "Thông tin cá nhân",
    links: [
      { label: "Tài Khoản Của Tôi", href: "#" },
      { label: "Theo Dõi Đơn Hàng", href: "#" },
      { label: "Hoàn Trả", href: "#" },
      { label: "Đánh giá", href: "#" },
    ],
  },
  // {
  //   title: "Về Chúng Tôi",
  //   links: [
  //     { label: "Giới Thiệu", href: "#" },
  //     { label: "Tác Động Của Chúng Tôi", href: "#" },
  //     { label: "Phòng Báo Chí", href: "#" },
  //     { label: "Tuyển Dụng", href: "#" },
  //   ],
  // },
];
