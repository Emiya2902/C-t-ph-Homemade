
// Dữ liệu 57 ô cờ phiên bản TP. HỒ CHÍ MINH MỞ RỘNG (40 ô chuẩn + 17 ô hình chữ thập)
// Hoạt động ở cả Browser (window.BOARD_CROSS) và Node.js (module.exports)

const CROSS_TILES = [
  // === Nhánh Dọc Bắc - Nam (Cột 6, Hàng 2 -> 10, qua Tâm Hàng 6) ===
  { id: 40, name: "Cầu Bình Lợi", type: "PROPERTY", group: "CROSS_NORTH", price: 100, rent: [6, 30, 90, 270, 400, 550], housePrice: 50, owner: null, houses: 0 },
  { id: 41, name: "ĐL Phạm Văn Đồng", type: "PROPERTY", group: "CROSS_NORTH", price: 160, rent: [16, 80, 240, 650, 850, 1050], housePrice: 100, owner: null, houses: 0 },
  { id: 42, name: "Cửa hàng Hàng Xanh", type: "SHOP", icon: "🛒" },
  { id: 43, name: "Cầu Sài Gòn", type: "PROPERTY", group: "CROSS_NORTH", price: 120, rent: [8, 40, 100, 300, 450, 600], housePrice: 50, owner: null, houses: 0 },

  // Tâm giao điểm (Cột 6, Hàng 6) — Ô đặc biệt
  { id: 44, name: "Vòng xoay Dân Chủ", type: "CHANCE" },

  // Nhánh Dọc phía Nam
  { id: 45, name: "Cầu Kênh Tẻ", type: "PROPERTY", group: "CROSS_SOUTH", price: 140, rent: [10, 50, 150, 450, 625, 750], housePrice: 100, owner: null, houses: 0 },
  { id: 46, name: "Cửa hàng Bảy Hiền", type: "SHOP", icon: "🛒" },
  { id: 47, name: "ĐL Nguyễn Văn Linh", type: "PROPERTY", group: "CROSS_SOUTH", price: 140, rent: [10, 50, 150, 450, 625, 750], housePrice: 100, owner: null, houses: 0 },
  { id: 48, name: "Cầu Chữ Y", type: "PROPERTY", group: "CROSS_SOUTH", price: 160, rent: [12, 60, 180, 500, 700, 900], housePrice: 100, owner: null, houses: 0 },

  // === Nhánh Ngang Tây - Đông (Hàng 6, Cột 2 -> 10, trừ Cột 6 đã là Tâm) ===
  { id: 49, name: "Cầu Nhị Thiên Đường", type: "PROPERTY", group: "CROSS_WEST", price: 180, rent: [14, 70, 200, 550, 750, 950], housePrice: 100, owner: null, houses: 0 },
  { id: 50, name: "ĐL Võ Văn Kiệt", type: "PROPERTY", group: "CROSS_WEST", price: 180, rent: [14, 70, 200, 550, 750, 950], housePrice: 100, owner: null, houses: 0 },
  { id: 51, name: "Khí vận Cộng Hòa", type: "FORTUNE", icon: "🎁" },
  { id: 52, name: "Chợ Kim Biên", type: "PROPERTY", group: "CROSS_WEST", price: 200, rent: [16, 80, 220, 600, 800, 1000], housePrice: 100, owner: null, houses: 0 },

  // Nhánh Ngang phía Đông
  { id: 53, name: "Hầm Thủ Thiêm", type: "PROPERTY", group: "CROSS_EAST", price: 260, rent: [22, 110, 330, 800, 975, 1150], housePrice: 150, owner: null, houses: 0 },
  { id: 54, name: "Ngã ba Cát Lái", type: "CHANCE" },
  { id: 55, name: "ĐL Mai Chí Thọ", type: "PROPERTY", group: "CROSS_EAST", price: 260, rent: [22, 110, 330, 800, 975, 1150], housePrice: 150, owner: null, houses: 0 },
  { id: 56, name: "Cầu Rạch Chiếc", type: "PROPERTY", group: "CROSS_EAST", price: 280, rent: [24, 120, 360, 850, 1025, 1200], housePrice: 150, owner: null, houses: 0 }
];

// Lấy 40 ô bàn cờ tiêu chuẩn (Node.js: require, Browser: window.BOARD)
(function buildCrossBoard() {
  let standardBoard;
  if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    try { standardBoard = require('./board.js'); } catch (e) { standardBoard = []; }
    const BOARD_CROSS = [
      ...(Array.isArray(standardBoard) ? standardBoard : []).map(tile => ({ ...tile })),
      ...CROSS_TILES.map(tile => ({ ...tile }))
    ];
    module.exports = BOARD_CROSS;
  } else {
    // Browser environment — wait for BOARD to be available
    const buildFromStandard = () => {
      const src = (typeof BOARD !== 'undefined' && Array.isArray(BOARD)) ? BOARD : [];
      const BOARD_CROSS = [
        ...src.map(tile => Object.assign({}, tile)),
        ...CROSS_TILES.map(tile => Object.assign({}, tile))
      ];
      window.BOARD_CROSS = BOARD_CROSS;
    };
    // BOARD from board.js should already be defined when this script loads
    buildFromStandard();
  }
})();
