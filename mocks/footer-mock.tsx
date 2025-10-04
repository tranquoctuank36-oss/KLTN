import { HelpCircle, MessageSquare, Phone, Mail } from "lucide-react";
import { type SupportItem, type FooterGroup } from "@/types/footer";

export const SUPPORT_ITEMS: SupportItem[] = [
  {
    icon: <HelpCircle className="h-6 w-6 flex-shrink-0 text-white" />,
    title: "Help Center",
    desc: "Find answers to all your questions.",
    href: "/help-center",
  },
  {
    icon: <MessageSquare className="h-6 w-6 flex-shrink-0 text-white" />,
    title: "Live Chat",
    desc: "Our agents are available 24-7",
    href: "/live-chat",
  },
  {
    icon: <Phone className="h-6 w-6 flex-shrink-0 text-white" />,
    title: "Call Us",
    desc: "Every day 7am – midnight VN time",
    href: "/contact/phone",
  },
  {
    icon: <Mail className="h-6 w-6 flex-shrink-0 text-white" />,
    title: "Email Us",
    desc: "service@glassesshop.com",
    href: "mailto:service@glassesshop.com",
  },
];

export const FOOTER_LINKS: FooterGroup[] = [
  {
    title: "Shop",
    links: [
      { label: "Men's Eyeglasses", href: "/products/mens" },
      { label: "Women's Eyeglasses", href: "/products/womens" },
      { label: "Kids' Glasses", href: "/products/kids" },
      { label: "Transitions Lenses", href: "/products/transitions" },
      { label: "Progressive Lenses", href: "/products/progressive" },
      { label: "Prescription Sunglasses", href: "/products/sunglasses" },
      { label: "Blue Light Glasses", href: "/products/blue-light" },
      { label: "Sports Glasses", href: "/products/sports" },
      { label: "Safety Glasses", href: "/products/safety" },
      { label: "Contact Lens", href: "/products/contact-lens" },
    ],
  },
  {
    title: "Shop Brands",
    links: [
      { label: "Ray-Ban Glasses", href: "/brands/rayban" },
      { label: "Oakley Glasses", href: "/brands/oakley" },
      { label: "Gucci Glasses", href: "/brands/gucci" },
      { label: "Tom Ford Glasses", href: "/brands/tom-ford" },
      { label: "Michael Kors Glasses", href: "/brands/michael-kors" },
      { label: "Versace Glasses", href: "/brands/versace" },
      { label: "Prada Glasses", href: "/brands/prada" },
      { label: "Costa Sunglasses", href: "/brands/costa" },
      { label: "Designer Glasses", href: "/brands/designer" },
      { label: "All Brands", href: "/brands" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "FSA/HSA Glasses", href: "/explore/fsa-hsa" },
      { label: "Affiliate Program", href: "/explore/affiliate" },
      { label: "Ambassadors Program", href: "/explore/ambassadors" },
      { label: "Student Discount", href: "/explore/student-discount" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "My Account", href: "/account" },
      { label: "Track Your Order", href: "/orders/track" },
      { label: "Returns", href: "/returns" },
      { label: "Help Center", href: "/help-center" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Our Impact", href: "/about/impact" },
      { label: "Pressroom", href: "/about/press" },
      { label: "Careers", href: "/about/careers" },
    ],
  },
];
