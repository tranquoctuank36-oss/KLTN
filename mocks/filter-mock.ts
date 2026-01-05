export const FILTER_OPTIONS = {
  color: {
    label: "Màu Sắc",
    options: [
      { id: "black", label: "Đen", count: 45, hexCode: "#000000" },
      { id: "brown", label: "Nâu", count: 38, hexCode: "#8B4513" },
      { id: "gold", label: "Vàng", count: 32, hexCode: "#FFD700" },
      { id: "silver", label: "Bạc", count: 28, hexCode: "#C0C0C0" },
    ],
  },
  price: {
    label: "Giá",
    options: [
      { id: "under50", label: "Dưới 50$", count: 120 },
      { id: "50to100", label: "50$ - 100$", count: 85 },
      { id: "100to200", label: "100$ - 200$", count: 65 },
      { id: "above200", label: "Trên 200$", count: 40 },
    ],
  },
  shape: {
    label: "Hình Dáng",
    options: [
      { id: "round", label: "Tròn", count: 55 },
      { id: "square", label: "Vuông", count: 48 },
      { id: "oval", label: "Hình Bầu Dục", count: 42 },
      { id: "cat-eye", label: "Mắt Mèo", count: 38 },
    ],
  },
};
