// Dữ liệu 40 ô cờ phiên bản TP. HỒ CHÍ MINH
const BOARD = [
  // Hàng dưới (Ô 0 -> 10): Khu ngoại thành & ven đô
  { id: 0, name: "Bắt đầu (GO)", type: "GO" },
  { id: 1, name: "Huyện Hóc Môn", type: "PROPERTY", group: "BROWN", price: 60, rent: [2, 10, 30, 90, 160, 250], housePrice: 50, owner: null, houses: 0 },
  { id: 2, name: "Khí vận", type: "CHANCE" },
  { id: 3, name: "Huyện Củ Chi", type: "PROPERTY", group: "BROWN", price: 60, rent: [4, 20, 60, 180, 320, 450], housePrice: 50, owner: null, houses: 0 },
  { id: 4, name: "Thuế Môi Trường", type: "TAX", amount: 200 },
  { id: 5, name: "Bến xe Miền Tây", type: "RAILROAD", price: 200, owner: null },
  { id: 6, name: "Huyện Bình Chánh", type: "PROPERTY", group: "LIGHT_BLUE", price: 100, rent: [6, 30, 90, 270, 400, 550], housePrice: 50, owner: null, houses: 0 },
  { id: 7, name: "Cơ hội", type: "CHANCE" },
  { id: 8, name: "Huyện Nhà Bè", type: "PROPERTY", group: "LIGHT_BLUE", price: 100, rent: [6, 30, 90, 270, 400, 550], housePrice: 50, owner: null, houses: 0 },
  { id: 9, name: "Huyện Cần Giờ", type: "PROPERTY", group: "LIGHT_BLUE", price: 120, rent: [8, 40, 100, 300, 450, 600], housePrice: 50, owner: null, houses: 0 },
  { id: 10, name: "Thăm Tù / Trong Tù", type: "JAIL" },

  // Cột trái (Ô 11 -> 20): Các quận dân cư đông đúc
  { id: 11, name: "Quận 12", type: "PROPERTY", group: "PINK", price: 140, rent: [10, 50, 150, 450, 625, 750], housePrice: 100, owner: null, houses: 0 },
  { id: 12, name: "Điện lực TP.HCM (EVN)", type: "UTILITY", price: 150, owner: null },
  { id: 13, name: "Quận Bình Tân", type: "PROPERTY", group: "PINK", price: 140, rent: [10, 50, 150, 450, 625, 750], housePrice: 100, owner: null, houses: 0 },
  { id: 14, name: "Quận Gò Vấp", type: "PROPERTY", group: "PINK", price: 160, rent: [12, 60, 180, 500, 700, 900], housePrice: 100, owner: null, houses: 0 },
  { id: 15, name: "Sân bay Tân Sơn Nhất", type: "RAILROAD", price: 200, owner: null },
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
  { id: 25, name: "Bến xe Miền Đông", type: "RAILROAD", price: 200, owner: null },
  { id: 26, name: "Quận 10", type: "PROPERTY", group: "YELLOW", price: 260, rent: [22, 110, 330, 800, 975, 1150], housePrice: 150, owner: null, houses: 0 },
  { id: 27, name: "Quận 4", type: "PROPERTY", group: "YELLOW", price: 260, rent: [22, 110, 330, 800, 975, 1150], housePrice: 150, owner: null, houses: 0 },
  { id: 28, name: "Cấp nước Sài Gòn (SAWACO)", type: "UTILITY", price: 150, owner: null },
  { id: 29, name: "Quận 3", type: "PROPERTY", group: "YELLOW", price: 280, rent: [24, 120, 360, 850, 1025, 1200], housePrice: 150, owner: null, houses: 0 },
  { id: 30, name: "Vào Tù", type: "GO_TO_JAIL" },

  // Cột phải (Ô 31 -> 39): Khu đô thị mới & Trung tâm Quận 1
  { id: 31, name: "Quận 7 (Phú Mỹ Hưng)", type: "PROPERTY", group: "GREEN", price: 300, rent: [26, 130, 390, 900, 1100, 1275], housePrice: 200, owner: null, houses: 0 },
  { id: 32, name: "Thảo Điền (TP. Thủ Đức)", type: "PROPERTY", group: "GREEN", price: 300, rent: [26, 130, 390, 900, 1100, 1275], housePrice: 200, owner: null, houses: 0 },
  { id: 33, name: "Khí vận", type: "CHANCE" },
  { id: 34, name: "Khu đô thị Thủ Thiêm", type: "PROPERTY", group: "GREEN", price: 320, rent: [28, 150, 450, 1000, 1200, 1400], housePrice: 200, owner: null, houses: 0 },
  { id: 35, name: "Metro Bến Thành - Suối Tiên", type: "RAILROAD", price: 200, owner: null },
  { id: 36, name: "Cơ hội", type: "CHANCE" },
  { id: 37, name: "Phố đi bộ Nguyễn Huệ", type: "PROPERTY", group: "DARK_BLUE", price: 350, rent: [35, 175, 500, 1100, 1300, 1500], housePrice: 200, owner: null, houses: 0 },
  { id: 38, name: "Thuế Siêu Xe / Hàng Hiệu", type: "TAX", amount: 100 },
  { id: 39, name: "Đường Đồng Khởi (Quận 1)", type: "PROPERTY", group: "DARK_BLUE", price: 400, rent: [50, 200, 600, 1400, 1700, 2000], housePrice: 200, owner: null, houses: 0 }
];

// Thử in ra màn hình kiểm tra
console.log("Đã khởi tạo bàn cờ phiên bản Sài Gòn thành công!");
console.log("Tổng số ô cờ:", BOARD.length);
console.log("Ô đắt đỏ nhất bàn cờ:", BOARD[39]);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BOARD;
}