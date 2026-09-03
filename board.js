// Dữ liệu bàn cờ TP. HỒ CHÍ MINH
// 1. BẢN ĐỒ CHUẨN 40 Ô (Outer Loop Standard)
const BOARD = [
  // Hàng dưới (Ô 0 -> 10): Khu ngoại thành & ven đô
  { id: 0, name: "Bắt đầu (GO)", type: "GO" },
  { id: 1, name: "Huyện Hóc Môn", type: "PROPERTY", group: "BROWN", price: 60, rent: [2, 10, 30, 90, 160, 250], housePrice: 50, owner: null, houses: 0 },
  { id: 2, name: "Khí vận", type: "CHANCE" },
  { id: 3, name: "Huyện Củ Chi", type: "PROPERTY", group: "BROWN", price: 60, rent: [4, 20, 60, 180, 320, 450], housePrice: 50, owner: null, houses: 0 },
  { id: 4, name: "Thuế Môi Trường", type: "TAX", amount: 200 },
  { id: 5, name: "Đại học Bách Khoa", type: "RAILROAD", price: 200, owner: null },
  { id: 6, name: "Huyện Bình Chánh", type: "PROPERTY", group: "LIGHT_BLUE", price: 100, rent: [6, 30, 90, 270, 400, 550], housePrice: 50, owner: null, houses: 0 },
  { id: 7, name: "Cơ hội", type: "CHANCE" },
  { id: 8, name: "Huyện Nhà Bè", type: "PROPERTY", group: "LIGHT_BLUE", price: 100, rent: [6, 30, 90, 270, 400, 550], housePrice: 50, owner: null, houses: 0 },
  { id: 9, name: "Huyện Cần Giờ", type: "PROPERTY", group: "LIGHT_BLUE", price: 120, rent: [8, 40, 100, 300, 450, 600], housePrice: 50, owner: null, houses: 0 },
  { id: 10, name: "Thăm Tù / Trong Tù", type: "JAIL" },

  // Cột trái (Ô 11 -> 20): Các quận dân cư đông đúc
  { id: 11, name: "Quận 12", type: "PROPERTY", group: "PINK", price: 140, rent: [10, 50, 150, 450, 625, 750], housePrice: 100, owner: null, houses: 0 },
  { id: 12, name: "📡 Trạm Khí Tượng Thủ Đức", type: "UTILITY", price: 150, owner: null, description: "Kích hoạt hiệu ứng thời tiết ngẫu nhiên" },
  { id: 13, name: "Quận Bình Tân", type: "PROPERTY", group: "PINK", price: 140, rent: [10, 50, 150, 450, 625, 750], housePrice: 100, owner: null, houses: 0 },
  { id: 14, name: "Quận Gò Vấp", type: "PROPERTY", group: "PINK", price: 160, rent: [12, 60, 180, 500, 700, 900], housePrice: 100, owner: null, houses: 0 },
  { id: 15, name: "Đại học Kinh Tế", type: "RAILROAD", price: 200, owner: null },
  { id: 16, name: "Quận Tân Phú", type: "PROPERTY", group: "ORANGE", price: 180, rent: [14, 70, 200, 550, 750, 950], housePrice: 100, owner: null, houses: 0 },
  { id: 17, name: "Khí vận", type: "CHANCE" },
  { id: 18, name: "Quận Tân Bình", type: "PROPERTY", group: "ORANGE", price: 180, rent: [14, 70, 200, 550, 750, 950], housePrice: 100, owner: null, houses: 0 },
  { id: 19, name: "Quận Phú Nhuận", type: "PROPERTY", group: "ORANGE", price: 200, rent: [16, 80, 220, 600, 800, 1000], housePrice: 100, owner: null, houses: 0 },
  { id: 20, name: "Bãi giữ xe Miễn phí", type: "FREE_PARKING" },

  // Hàng trên (Ô 21 -> 30): Khu kinh doanh truyền thống & nội thành
  { id: 21, name: "Quận 8", type: "PROPERTY", group: "RED", price: 220, rent: [18, 90, 250, 700, 875, 1050], housePrice: 150, owner: null, houses: 0 },
  { id: 22, name: "Cơ hội", type: "CHANCE" },
  { id: 23, name: "Quận 6 (Chợ Lớn)", type: "PROPERTY", group: "RED", price: 220, rent: [18, 90, 250, 700, 875, 1050], housePrice: 150, owner: null, houses: 0 },
  { id: 24, name: "Quận 5", type: "PROPERTY", group: "RED", price: 240, rent: [20, 100, 300, 750, 925, 1100], housePrice: 150, owner: null, houses: 0 },
  { id: 25, name: "Đại học CNKT", type: "RAILROAD", price: 200, owner: null },
  { id: 26, name: "Quận 10", type: "PROPERTY", group: "YELLOW", price: 260, rent: [22, 110, 330, 800, 975, 1150], housePrice: 150, owner: null, houses: 0 },
  { id: 27, name: "Quận 4", type: "PROPERTY", group: "YELLOW", price: 260, rent: [22, 110, 330, 800, 975, 1150], housePrice: 150, owner: null, houses: 0 },
  { id: 28, name: "📡 Trạm Khí Tượng Quận 1", type: "UTILITY", price: 150, owner: null, description: "Kích hoạt hiệu ứng thời tiết ngẫu nhiên" },
  { id: 29, name: "Quận 3", type: "PROPERTY", group: "YELLOW", price: 280, rent: [24, 120, 360, 850, 1025, 1200], housePrice: 150, owner: null, houses: 0 },
  { id: 30, name: "Vào Tù", type: "GO_TO_JAIL" },

  // Cột phải (Ô 31 -> 39): Khu đô thị mới & Trung tâm Quận 1
  { id: 31, name: "Quận 7 (Phú Mỹ Hưng)", type: "PROPERTY", group: "GREEN", price: 300, rent: [26, 130, 390, 900, 1100, 1275], housePrice: 200, owner: null, houses: 0 },
  { id: 32, name: "Thảo Điền (TP. Thủ Đức)", type: "PROPERTY", group: "GREEN", price: 300, rent: [26, 130, 390, 900, 1100, 1275], housePrice: 200, owner: null, houses: 0 },
  { id: 33, name: "Khí vận", type: "CHANCE" },
  { id: 34, name: "Khu đô thị Thủ Thiêm", type: "PROPERTY", group: "GREEN", price: 320, rent: [28, 150, 450, 1000, 1200, 1400], housePrice: 200, owner: null, houses: 0 },
  { id: 35, name: "Đại học KHTN", type: "RAILROAD", price: 200, owner: null },
  { id: 36, name: "Cơ hội", type: "CHANCE" },
  { id: 37, name: "Phố đi bộ Nguyễn Huệ", type: "PROPERTY", group: "DARK_BLUE", price: 350, rent: [35, 175, 500, 1100, 1300, 1500], housePrice: 200, owner: null, houses: 0 },
  { id: 38, name: "Thuế Siêu Xe / Hàng Hiệu", type: "TAX", amount: 100 },
  { id: 39, name: "Đường Đồng Khởi (Quận 1)", type: "PROPERTY", group: "DARK_BLUE", price: 400, rent: [50, 200, 600, 1400, 1700, 2000], housePrice: 200, owner: null, houses: 0 }
];

// 2. BẢN ĐỒ MỚI 57 Ô (Bản đồ chuẩn + 17 ô Trục Chữ Thập Trung Tâm nối 4 Station)
const BOARD_CROSS_LEGACY = [
  // 40 ô chuẩn vòng ngoài (0 -> 39)
  ...BOARD,

  // 17 Ô HÌNH CHỮ THẬP TRUNG TÂM (40 -> 56)
  // --- NHÁNH DỌC BẮC - NAM (Nối Bến xe Miền Đông #25 <-> Bến xe Miền Tây #5) ---
  { id: 40, name: "Đại lộ Phạm Văn Đồng", type: "PROPERTY", group: "TEAL", price: 180, rent: [14, 70, 200, 550, 750, 950], housePrice: 100, owner: null, houses: 0 },
  { id: 41, name: "Khí vận Trục Bắc", type: "CHANCE" },
  { id: 42, name: "Đường Hoàng Văn Thụ", type: "PROPERTY", group: "TEAL", price: 200, rent: [16, 80, 220, 600, 800, 1000], housePrice: 100, owner: null, houses: 0 },
  { id: 43, name: "Trạm Trung Chuyển Bắc", type: "TAX", amount: 100 },
<<<<<<< HEAD
  { id: 44, name: "Ngã Tư Trung Tâm Sài Gòn", type: "CENTER_BUFF", isCenterHub: true },
=======
  { id: 44, name: "Ngã Tư Trung Tâm Sài Gòn", type: "CHANCE", isCenterHub: true },
>>>>>>> 814147eb7059fe1f3a8102216959befd1818b784
  { id: 45, name: "Trạm Trung Chuyển Nam", type: "TAX", amount: 100 },
  { id: 46, name: "Đại lộ Nguyễn Văn Linh", type: "PROPERTY", group: "TEAL", price: 220, rent: [18, 90, 250, 700, 875, 1050], housePrice: 100, owner: null, houses: 0 },
  { id: 47, name: "Cơ hội Trục Nam", type: "CHANCE" },
  { id: 48, name: "Đại lộ Võ Văn Kiệt", type: "PROPERTY", group: "TEAL", price: 240, rent: [20, 100, 300, 750, 925, 1100], housePrice: 100, owner: null, houses: 0 },

  // --- NHÁNH NGANG TÂY - ĐÔNG (Nối Sân bay Tân Sơn Nhất #15 <-> Metro Bến Thành #35) ---
  { id: 49, name: "Đường Cộng Hòa", type: "PROPERTY", group: "INDIGO", price: 180, rent: [14, 70, 200, 550, 750, 950], housePrice: 100, owner: null, houses: 0 },
  { id: 50, name: "Khí vận Trục Tây", type: "CHANCE" },
  { id: 51, name: "Đường Cách Mạng Tháng 8", type: "PROPERTY", group: "INDIGO", price: 200, rent: [16, 80, 220, 600, 800, 1000], housePrice: 100, owner: null, houses: 0 },
  { id: 52, name: "Trạm Thu Phí Trục Đông-Tây", type: "TAX", amount: 100 },
  { id: 53, name: "Hầm Thủ Thiêm Vượt Sông", type: "PROPERTY", group: "INDIGO", price: 220, rent: [18, 90, 250, 700, 875, 1050], housePrice: 100, owner: null, houses: 0 },
  { id: 54, name: "Cơ hội Trục Đông", type: "CHANCE" },
  { id: 55, name: "Đại lộ Mai Chí Thọ", type: "PROPERTY", group: "INDIGO", price: 240, rent: [20, 100, 300, 750, 925, 1100], housePrice: 100, owner: null, houses: 0 },
  { id: 56, name: "Xa lộ Hà Nội", type: "PROPERTY", group: "INDIGO", price: 260, rent: [22, 110, 330, 800, 975, 1150], housePrice: 100, owner: null, houses: 0 }
];

console.log("Đã khởi tạo bàn cờ phiên bản Sài Gòn thành công!");
console.log("Bản đồ Chuẩn:", BOARD.length, "ô | Bản đồ Chữ Thập:", BOARD_CROSS_LEGACY.length, "ô");

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BOARD;
  module.exports.BOARD = BOARD;
  module.exports.BOARD_STANDARD = BOARD;
  module.exports.BOARD_CROSS = BOARD_CROSS_LEGACY;
}