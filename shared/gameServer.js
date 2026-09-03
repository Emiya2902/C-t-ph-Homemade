/**
 * SHARED / SERVER GAME ENGINE - Cờ Tỉ Phú Nhà Làm
 * Authoritative game state & action handling for Node.js server & multiplayer
 */

const path = require('path');
let BOARD = [];
try {
  BOARD = require('../board.js');
} catch (e) {
  try {
    BOARD = require('./board.js');
  } catch (err) {
    console.error('Không nạp được board.js:', err);
  }
}

let BOARD_CROSS = [];
try {
  BOARD_CROSS = require('../board_cross.js');
} catch (e) {
  try {
    BOARD_CROSS = require('./board_cross.js');
  } catch (err) {
    console.error('Không nạp được board_cross.js:', err);
  }
}

const DEFAULT_PLAYER_NAMES = [
  "Sài Gòn Pro", "Chợ Lớn VIP", "Hà Nội Pro", "Đà Nẵng VIP",
  "Cần Thơ Pro", "Vũng Tàu VIP", "Huế Pro", "Nha Trang VIP"
];

const DEFAULT_PLAYER_COLORS = [
  "#ff4757", "#1e90ff", "#2ed573", "#fdcb6e",
  "#e84393", "#00b894", "#a29bfe", "#ff9f43"
];

const DEFAULT_ANIMAL_TOKENS = [
  { name: "Sài Gòn Cá Sấu", emoji: "🐊" },
  { name: "Chợ Lớn Mèo", emoji: "🐱" },
  { name: "Hà Nội Chó", emoji: "🐶" },
  { name: "Đà Nẵng Chim", emoji: "🐦" },
  { name: "Cần Thơ Gấu", emoji: "🐻" },
  { name: "Vũng Tàu Thỏ", emoji: "🐰" },
  { name: "Huế Cá Vàng", emoji: "🐠" },
  { name: "Nha Trang Rùa", emoji: "🐢" }
];

const CHANCE_CARDS = [
  { title: "🎁 Trúng Vé Số", text: "Trúng giải khuyến khích vé số kiến thiết, nhận $150.", action: "MONEY", amount: 150 },
  { title: "💸 Phạt Giao Thông", text: "Đi sai làn đường cầu Sài Gòn, nộp phạt $50.", action: "MONEY", amount: -50 },
  { title: "🚀 Xe Công Nghệ", text: "Bắt xe ôm đi thẳng tới ô Bắt đầu (GO) nhận $200.", action: "MOVE_TO", target: 0, getGoBonus: true },
  { title: "🚔 Bị Tống Vào Tù", text: "Vi phạm quy định trật tự đô thị, vào thẳng Ô Tù (#10).", action: "GO_TO_JAIL" },
  { title: "🚶 Đi Lạc Đường", text: "Đường phố ngoằn ngoèo, bạn bị đi lùi 3 bước.", action: "MOVE_STEPS", steps: -3 },
  { title: "🎂 Sinh Nhật Vui Vẻ", text: "Đến ngày sinh nhật, nhận $50 từ mỗi người chơi khác.", action: "COLLECT_OTHER", amount: 50 },
  { title: "🛡️ Kim Bài Miễn Thuế", text: "Nhận Khiên bảo vệ, miễn trừ 1 lần trả tiền thuê hoặc phạt.", action: "SHIELD" },
  { title: "🏷️ Phiếu Giảm Giá Đất", text: "Nhận voucher giảm 50% tiền mua đất ở lượt mua kế tiếp.", action: "DISCOUNT" },
  { title: "📈 Quy Hoạch Đô Thị", text: "Lần tiếp theo có người đáp vào ô đất đắt nhất của bạn, tiền thuê được nhân 1.5x.", action: "MULTIPLY_LAND_RENT" },
  { title: "🥷 Đạo Tặc Hành Nghề", text: "Cướp ngay $100 từ người chơi giàu nhất bàn cờ.", action: "STEAL_RICHEST", amount: 100 },
  { title: "🧲 Lực Hút Đại Gia", text: "Kéo người chơi giàu nhất tới ô đất đắt nhất của bạn.", action: "PULL_RICHEST_TO_MY_LAND" },
  { title: "🔄 Hoán Đổi Nhà Đất", text: "Tráo ngẫu nhiên 1 ô đất chưa xây nhà với đối thủ.", action: "SWAP_TILE" },
  { title: "☕ Cà Phê Vỉa Hè", text: "Thưởng thức cà phê trứng phố cổ, trả phí $25.", action: "MONEY", amount: -25 },
  { title: "✈️ Du Lịch Tân Sơn Nhất", text: "Bay thẳng đến Sân bay Tân Sơn Nhất (#15).", action: "MOVE_TO", target: 15, getGoBonus: false },
  { title: "⚡ Trúng Thầu Dự Án", text: "Trúng gói thầu công trình xanh, nhận ngay $100 tiền thưởng.", action: "MONEY", amount: 100 }
];

const FORTUNE_CARDS = [
  { title: "🏦 Ngân Hàng Hoàn Thuế", text: "Ngân hàng tính nhầm thuế, hoàn lại cho bạn $100.", action: "MONEY", amount: 100 },
  { title: "🩺 Khám Sức Khỏe", text: "Khám bệnh định kỳ tại Bệnh viện Chợ Rẫy, nộp $50.", action: "MONEY", amount: -50 },
  { title: "🏨 Lợi Nhuận Bất Động Sản", text: "Thị trường khởi sắc, bạn thu về $120 lợi nhuận.", action: "MONEY", amount: 120 },
  { title: "⚡ Tiền Điện Nước", text: "Thanh toán hóa đơn điện lực EVN tháng này $40.", action: "MONEY", amount: -40 },
  { title: "🎟️ Giải Thưởng Hội Chợ", text: "Trúng thưởng phiếu mua sắm Phố đi bộ, nhận $80.", action: "MONEY", amount: 80 },
  { title: "🛡️ Bảo Hiểm Rủi Ro", text: "Trang bị Khiên chắn, miễn 1 lần nộp phạt hoặc trả thuê.", action: "SHIELD" },
  { title: "🏷️ Suất Mua Ưu Đãi", text: "Hưởng ưu đãi giảm 50% tiền mua đất ở lượt kế tiếp.", action: "DISCOUNT" },
  { title: "🏗️ Cơn Sốt Đất Vàng", text: "Lần tiếp theo có người đáp vào ô đất đắt nhất của bạn, tiền thuê tăng 1.5x.", action: "MULTIPLY_LAND_RENT" },
  { title: "💰 Chia Sẻ Tài Sản", text: "Thu $100 tiền hỗ trợ từ người chơi có tổng tài sản lớn nhất.", action: "STEAL_RICHEST", amount: 100 },
  { title: "🤝 Mời Khách Quý", text: "Mời người giàu nhất bước vào bất động sản cao cấp nhất của bạn.", action: "PULL_RICHEST_TO_MY_LAND" },
  { title: "🔁 Đổi Vận Đổi Đất", text: "Hoán đổi ngẫu nhiên 1 ô đất chưa xây nhà với người khác.", action: "SWAP_TILE" },
  { title: "💸 Phí Bảo Trì Xe", text: "Bảo dưỡng xe máy định kỳ chống ngập nước, chi $30.", action: "MONEY", amount: -30 },
  { title: "🏆 Công Dân Gương Mẫu", text: "Được tuyên dương đóng góp cộng đồng, thưởng $60.", action: "MONEY", amount: 60 },
  { title: "🛍️ Mua Sắm Chợ Bến Thành", text: "Mua quà lưu niệm tại Chợ Bến Thành, thanh toán $45.", action: "MONEY", amount: -45 },
  { title: "📦 Cổ Tức Định Kỳ", text: "Nhận tiền chia cổ tức kinh doanh cuối quý $70.", action: "MONEY", amount: 70 }
];

class GameInstance {
  constructor(options = {}) {
    const playerCount = Math.max(2, Math.min(8, options.playerCount || 2));
    const playerNames = options.playerNames || DEFAULT_PLAYER_NAMES;
    const settings = Object.assign({
      doubleRentOnFullGroup: true,
      mortgageInsteadOfSell: true,
      jackpotOnFreeParking: true,
      receiveRentWhileJailed: false,
      auctionMode: false,
      freeBuildOnFullGroup: false,
      boardMode: 'standard',
      initialMoney: 1500,
      passGoMoney: 200
    }, options.settings || {});

    this.playerColors = DEFAULT_PLAYER_COLORS.slice(0, playerCount);
    this.settings = settings;

    // Build fresh board copy based on boardMode
    const rawBoard = (settings.boardMode === 'cross' && Array.isArray(BOARD_CROSS) && BOARD_CROSS.length > 0)
      ? BOARD_CROSS
      : BOARD;

    const boardCopy = JSON.parse(JSON.stringify(rawBoard || [])).map((tile, i) => {
      return {
        ...tile,
        id: tile.id !== undefined ? tile.id : i,
        owner: null,
        houses: 0,
        mortgaged: false
      };
    });

    let rawPlayers = [];
    if (Array.isArray(options.players) && options.players.length >= 2) {
      rawPlayers = options.players.map((p, i) => {
        const defaultToken = DEFAULT_ANIMAL_TOKENS[i % DEFAULT_ANIMAL_TOKENS.length] || { name: `Người chơi ${i + 1}`, emoji: '🐊' };
        return {
          name: p.name || `Người chơi ${i + 1}`,
          tokenName: p.tokenName || (p.token && p.token.name) || defaultToken.name,
          tokenEmoji: p.tokenEmoji || (p.token && p.token.emoji) || defaultToken.emoji,
          socketId: p.socketId || p.id || null
        };
      });
    } else {
      const playerCount = Math.max(2, Math.min(8, options.playerCount || (options.playerNames ? options.playerNames.length : 2)));
      const playerNames = options.playerNames || DEFAULT_PLAYER_NAMES;
      for (let i = 0; i < playerCount; i++) {
        const defaultToken = DEFAULT_ANIMAL_TOKENS[i % DEFAULT_ANIMAL_TOKENS.length] || { name: `Người chơi ${i + 1}`, emoji: '🐊' };
        rawPlayers.push({
          name: playerNames[i] || `Người chơi ${i + 1}`,
          tokenName: defaultToken.name,
          tokenEmoji: defaultToken.emoji,
          socketId: null
        });
      }
    }

    // 🎲 Random thứ tự lượt chơi (Fisher-Yates Shuffle) trên danh sách người chơi thực
    for (let i = rawPlayers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rawPlayers[i], rawPlayers[j]] = [rawPlayers[j], rawPlayers[i]];
    }

    // Gán thứ tự P1..PN (id: 1..N), màu sắc và khởi tạo state người chơi
    const players = rawPlayers.map((rp, i) => ({
      id: i + 1,
      name: rp.name,
      color: DEFAULT_PLAYER_COLORS[i] || '#ffffff',
      tokenName: rp.tokenName,
      tokenEmoji: rp.tokenEmoji,
      socketId: rp.socketId,
      position: 0,
      money: settings.initialMoney,
      inJail: false,
      jailTurns: 0,
      jailRolls: 0,
      jailReleaseWait: false,
      bonusRollStreak: 0,
      isBankrupt: false,
      turnCount: i === 0 ? 1 : 0,
      hasBuiltHouseThisTurn: false,
<<<<<<< HEAD
      hasBoughtPropertyThisTurn: false,
=======
>>>>>>> 814147eb7059fe1f3a8102216959befd1818b784
      lastCreditorId: null,
      shieldCharges: 0,
      hasShield: false,
      hasDiscount: false,
      shopCards: [],
      specialShop: null,
      disconnected: false,
      disconnectExpiresAt: null
    }));

    this.playerColors = players.map(p => p.color);
    const firstPlayer = players[0];

    this.state = {
      board: boardCopy,
      players,
      currentPlayerIndex: 0,
      pendingTile: null,
      pendingCard: null,
      lastRoll: 0,
      lastDice: [1, 1],
      extraRollPending: false,
      logs: [
        "🎮 Trò chơi Cờ Tỉ Phú Nhà Làm bắt đầu!",
        `🎲 Thứ tự ngẫu nhiên: ${(firstPlayer && firstPlayer.tokenEmoji) || ''} ${(firstPlayer && firstPlayer.name) || ''} (P1) gieo xúc xắc đầu tiên!`
      ],
      jackpot: 0,
      auctionTile: null,
      auctionState: null,
      tradeRequests: [],
      gameOver: false,
      winner: null,
      weather: 'CLEAR',
      weatherTurns: 0,
      weatherMoveBonus: 0,
      canBuild: true,
      crossRoute: null,
      crossRouteChoice: null,
      pendingCrossRouteRoll: null,
<<<<<<< HEAD
      lastStationRoll: null,
      lastStationRoutePath: [],
      stationEvents: [],
=======
>>>>>>> 814147eb7059fe1f3a8102216959befd1818b784
      lastMovementPath: [],
      lastRollWasGodDice: false,
      lastAnnouncement: null,
      settings: this.settings
    };
  }

  addLog(msg) {
    this.state.logs.push(msg);
    if (this.state.logs.length > 100) {
      this.state.logs.shift();
    }
  }

  getCurrentPlayer() {
    return this.state.players[this.state.currentPlayerIndex];
  }

  activateCenterBuff(player) {
    const buffTypes = ['TRIPLE_AEGIS_SHIELD', 'MIDAS_EMPIRE', 'GOD_DICE', 'GLOBAL_TOLL_KING', 'SPECIAL_SHOP'];
    const buff = buffTypes[Math.floor(Math.random() * buffTypes.length)];
    const totalPlayers = this.state.players.length;
    player.shieldCharges = 0;
    player.hasShield = false;
    player.midasCharges = 0;
    player.godDiceTurns = 0;
    player.globalTollTurns = 0;
    player.hasDiscount = false;
    player.specialShop = null;
    player.activeCenterBuff = buff;
    if (buff === 'TRIPLE_AEGIS_SHIELD') { player.shieldCharges = 3; player.hasShield = true; }
    if (buff === 'MIDAS_EMPIRE') player.midasCharges = 3;
    if (buff === 'GOD_DICE') player.godDiceTurns = 2;
    if (buff === 'GLOBAL_TOLL_KING') player.globalTollTurns = totalPlayers * 2;
    if (buff === 'SPECIAL_SHOP') player.specialShop = { refreshesRemaining: 2, purchasesRemaining: 2 };
    const message = `✨ ${player.name} nhận buff ${buff === 'MIDAS_EMPIRE' ? 'MIDAS_EMPIRE (3 nhà)' : buff === 'GOD_DICE' ? 'GOD_DICE (2 lượt)' : buff}.`;
    this.addLog(message);
    this.state.lastAnnouncement = { id: Date.now(), message, type: 'center' };
    return buff;
  }

  processMovementPasses(player, movementPath = []) {
    movementPath.forEach(position => {
      const tile = this.state.board[position];
      if (!tile) return;
      if (player.activeCenterBuff === 'MIDAS_EMPIRE' && player.midasCharges > 0 && tile.owner === player.id && tile.type === 'PROPERTY' && (tile.houses || 0) < 5) {
        tile.houses = (tile.houses || 0) + 1;
        player.midasCharges -= 1;
        if (player.midasCharges <= 0) delete player.midasCharges;
      }
      this.state.players.forEach(holder => {
        if (holder.id !== player.id && holder.activeCenterBuff === 'GLOBAL_TOLL_KING' && holder.globalTollTurns > 0) {
          player.money -= 20;
          holder.money += 20;
        }
      });
    });
  }

<<<<<<< HEAD
  movePlayerOuter(player, targetPosition) {
    const boardLength = Math.min(40, this.state.board.length);
    const startPos = Number(player.position) || 0;
    const target = ((Number(targetPosition) % boardLength) + boardLength) % boardLength;
    const distance = (target - startPos + boardLength) % boardLength;
    const path = Array.from({ length: distance }, (_, index) => (startPos + index + 1) % boardLength);
    player.position = target;
    this.processMovementPasses(player, path);
    if (path.includes(0)) {
      player.money += this.settings.passGoMoney;
      this.addLog(`💵 ${player.name} qua ô Bắt đầu (+ $${this.settings.passGoMoney})`);
    }
    return { startPos, movementPath: path };
  }

=======
>>>>>>> 814147eb7059fe1f3a8102216959befd1818b784
  interceptAttack(attacker, targetPlayer, attackPayload = {}) {
    if (!targetPlayer) return false;
    if (!Object.prototype.hasOwnProperty.call(targetPlayer, 'shieldCharges') && targetPlayer.hasShield) {
      targetPlayer.shieldCharges = 1;
    }
    if ((Number(targetPlayer.shieldCharges) || 0) <= 0) {
      targetPlayer.hasShield = false;
      return false;
    }
    targetPlayer.shieldCharges -= 1;
    targetPlayer.hasShield = targetPlayer.shieldCharges > 0;
    this.addLog(`🛡️ ${targetPlayer.name} đã chặn đứng đòn tấn công! (Còn ${targetPlayer.shieldCharges}/3 lần khiên)`);
    return true;
  }

  canActivateCenterBuff(player, tile) {
    return !!player && !!tile && !player.isGhosting && tile.isCenterHub === true && this.state.board[player.position] === tile;
  }

  isCenterBuffActive(player) {
    if (!player) return false;
    return player.activeCenterBuff === 'TRIPLE_AEGIS_SHIELD' && (Number(player.shieldCharges) || 0) > 0
      || player.activeCenterBuff === 'MIDAS_EMPIRE' && (Number(player.midasCharges) || 0) > 0
      || player.activeCenterBuff === 'GOD_DICE' && (Number(player.godDiceTurns) || 0) > 0
      || player.activeCenterBuff === 'GLOBAL_TOLL_KING' && (Number(player.globalTollTurns) || 0) > 0
      || player.activeCenterBuff === 'SPECIAL_SHOP' && (Number(player.specialShop?.purchasesRemaining) || 0) > 0;
  }

  getPlayersMeta() {
    return this.state.players.map((p) => ({
      id: p.id,
      name: p.name,
      color: p.color,
      token: { name: p.tokenName, emoji: p.tokenEmoji }
    }));
  }

  exportState() {
    return {
      board: this.state.board,
      players: this.state.players,
      currentPlayerIndex: this.state.currentPlayerIndex,
      pendingTile: this.state.pendingTile ? this.state.pendingTile.id : null,
      pendingCard: this.state.pendingCard,
      lastRoll: this.state.lastRoll,
      lastDice: this.state.lastDice || [Math.max(1, Math.min(6, Math.floor(this.state.lastRoll / 2))), Math.max(1, Math.min(6, this.state.lastRoll - Math.floor(this.state.lastRoll / 2)))],
      extraRollPending: !!this.state.extraRollPending,
      logs: this.state.logs,
      jackpot: this.state.jackpot,
      auctionTile: this.state.auctionTile ? this.state.auctionTile.id : null,
      auctionState: this.state.auctionState,
      tradeRequests: this.state.tradeRequests,
      gameOver: this.state.gameOver,
      winner: this.state.winner,
      weather: this.state.weather,
      weatherTurns: this.state.weatherTurns,
      canBuild: this.state.canBuild,
      crossRoute: this.state.crossRoute,
      crossRouteChoice: this.state.crossRouteChoice,
      pendingCrossRouteRoll: this.state.pendingCrossRouteRoll,
<<<<<<< HEAD
      lastStationRoll: this.state.lastStationRoll,
      lastMovementPath: this.state.lastMovementPath || [],
      lastStationRoutePath: this.state.lastStationRoutePath || [],
      stationEvents: this.state.stationEvents || [],
=======
      lastMovementPath: this.state.lastMovementPath || [],
>>>>>>> 814147eb7059fe1f3a8102216959befd1818b784
      lastRollWasGodDice: !!this.state.lastRollWasGodDice,
      lastAnnouncement: this.state.lastAnnouncement,
      settings: this.settings
    };
  }

  ownsFullGroup(tile) {
    if (!tile || !tile.group) return false;
    const groupTiles = this.state.board.filter(t => t.group === tile.group);
    return groupTiles.length > 0 && groupTiles.every(t => t.owner === tile.owner && !t.mortgaged);
  }

  isBuildableProperty(tile) {
    return !!(tile && tile.type === 'PROPERTY' && tile.group && tile.price > 0);
  }

  getCrossRoute(station) {
    if (this.state.board.length <= 40) return null;
    const routes = {
      5: [48, 47, 46, 45, 44, 52, 51, 50, 49, 15],
      15: [49, 50, 51, 52, 44, 43, 42, 41, 40, 25],
      25: [40, 41, 42, 43, 44, 53, 54, 55, 56, 35],
      35: [56, 55, 54, 53, 44, 45, 46, 47, 48, 5]
    };
    return routes[station] || null;
  }

<<<<<<< HEAD
  applyStationRoute(player, station, path, remaining, stationEvents = []) {
    const route = this.getCrossRoute(station);
    if (!route) return remaining;
    const stationRoll = Math.floor(Math.random() * 6) + 1;
    this.state.lastStationRoll = stationRoll;
    const useInnerRoute = stationRoll % 2 === 1;
    this.state.lastStationRoutePath = useInnerRoute ? [station, ...route] : [];
    stationEvents.push({ pathIndex: path.length - 1, station, roll: stationRoll, useInnerRoute });
    this.state.crossRouteChoice = null;
    if (!useInnerRoute) {
      this.state.crossRoute = null;
      return remaining;
    }

    if (remaining === 0) {
      this.state.crossRoute = { playerId: player.id, path: route, cursor: -1 };
      return 0;
    }

    let cursor = -1;
    while (remaining > 0 && cursor < route.length - 1) {
      cursor += 1;
      path.push(route[cursor]);
      remaining -= 1;
    }
    this.state.crossRoute = cursor < route.length - 1
      ? { playerId: player.id, path: route, cursor }
      : null;
    return remaining;
  }

=======
>>>>>>> 814147eb7059fe1f3a8102216959befd1818b784
  getMovementPath(player, steps) {
    const path = [];
    let remaining = steps;
    let position = player.position;
<<<<<<< HEAD
    const stationEvents = [];
    const handledStations = new Set();
=======
>>>>>>> 814147eb7059fe1f3a8102216959befd1818b784

    if (this.state.crossRoute && this.state.crossRoute.playerId === player.id) {
      const route = this.state.crossRoute.path;
      let cursor = this.state.crossRoute.cursor;
      while (remaining > 0 && cursor < route.length - 1) {
        cursor += 1;
        position = route[cursor];
        path.push(position);
        remaining -= 1;
      }
      this.state.crossRoute.cursor = cursor;
      if (cursor >= route.length - 1) this.state.crossRoute = null;
<<<<<<< HEAD
      if (cursor >= route.length - 1) handledStations.add(route[route.length - 1]);
=======
>>>>>>> 814147eb7059fe1f3a8102216959befd1818b784
    }

    while (remaining > 0) {
      const direction = player.moveDirection === -1 ? -1 : 1;
      position = (position + direction + 40) % 40;
      path.push(position);
      remaining -= 1;
<<<<<<< HEAD
      if (this.state.board.length > 40 && [5, 15, 25, 35].includes(position) && !handledStations.has(position)) {
        handledStations.add(position);
        remaining = this.applyStationRoute(player, position, path, remaining, stationEvents);
        if (path.length) position = path[path.length - 1];
      }
    }

    return { path, position, stationEvents };
=======
    }

    return { path, position };
>>>>>>> 814147eb7059fe1f3a8102216959befd1818b784
  }

  chooseCrossRoute(player, useInnerRoute) {
    const choice = this.state.crossRouteChoice;
    if (!choice || choice.playerId !== player.id) return false;
    this.state.crossRouteChoice = null;
    this.state.crossRoute = useInnerRoute
      ? { playerId: player.id, path: choice.path, cursor: -1 }
      : null;
    this.addLog(useInnerRoute
      ? `🛤️ ${player.name} chọn đi đường trong đến ga #${choice.path[choice.path.length - 1]}.`
      : `🛣️ ${player.name} chọn đi theo vòng ngoài.`);
    const pendingRoll = this.state.pendingCrossRouteRoll;
    this.state.pendingCrossRouteRoll = null;
    if (!pendingRoll) return true;
    const movement = this.getMovementPath(player, pendingRoll.dice);
    player.position = movement.position;
    this.state.lastMovementPath = movement.path;
    this.processMovementPasses(player, movement.path);
    return { ...this.processTileLanding(player, {
      startPos: pendingRoll.startPos,
      dice: pendingRoll.dice,
      movementPath: movement.path
    }), playerId: player.id };
  }

  calculateRent(tile, owner) {
    let rent = 0;
    if (tile.type === "RAILROAD") {
      const owned = this.state.board.filter(t => t.type === "RAILROAD" && t.owner === owner.id).length;
      rent = [0, 25, 50, 100, 200][owned] || 0;
    } else if (tile.type === "UTILITY") {
      const owned = this.state.board.filter(t => t.type === "UTILITY" && t.owner === owner.id).length;
      const dice = this.state.lastRoll || 7;
      rent = owned === 2 ? dice * 10 : dice * 4;
    } else {
      const rents = tile.rent || [Math.round((tile.price || 100) * 0.1)];
      rent = rents[tile.houses || 0] || rents[0] || 0;
      if (this.settings.doubleRentOnFullGroup && !tile.houses && this.ownsFullGroup(tile)) {
        rent *= 2;
      }
    }

    // Nếu ô bị đóng băng, không thu tiền thuê
<<<<<<< HEAD
    if (tile.frozenTurns) return 0;

    // Nếu ô được bảo vệ, không thu tiền thuê
    if (tile.protectedTurns) return 0;

    // Áp dụng boost (tăng 1.5x)
    if (tile.boostTurns) {
=======
    if (tile.frozenTurns && tile.frozenTurns > 0) return 0;

    // Nếu ô được bảo vệ, không thu tiền thuê
    if (tile.protectedTurns && tile.protectedTurns > 0) return 0;

    // Áp dụng boost (tăng 1.5x)
    if (tile.boostTurns && tile.boostTurns > 0) {
>>>>>>> 814147eb7059fe1f3a8102216959befd1818b784
      rent = Math.round(rent * 1.5);
    }
    if (tile.rentMultiplier && tile.rentMultiplier !== 1) {
      rent = Math.round(rent * tile.rentMultiplier);
    }

    // Áp dụng hiệu ứng thời tiết
    if (this.state.weatherRentMultiplier && this.state.weatherRentMultiplier !== 1.0) {
      rent = Math.round(rent * this.state.weatherRentMultiplier);
    } else if (this.state.weather === 'FLOOD') {
      rent = Math.round(rent * 0.7);
    } else if (this.state.weather === 'HEATWAVE') {
      rent = Math.round(rent * 1.5);
    }

    return Math.max(rent, 0);
  }

  updateTurnCounters(gameState = this.state) {
    if (gameState.weatherTurns > 0) gameState.weatherTurns -= 1;
    if (gameState.weatherTurns <= 0) { gameState.weather = 'CLEAR'; gameState.canBuild = true; gameState.weatherTurns = 0; gameState.weatherMoveBonus = 0; }
<<<<<<< HEAD
=======
    (gameState.board || []).forEach(tile => ['frozenTurns', 'protectedTurns', 'boostTurns'].forEach(key => {
      if (tile[key] > 0) tile[key] -= 1;
      if (tile[key] <= 0) delete tile[key];
    }));
>>>>>>> 814147eb7059fe1f3a8102216959befd1818b784
    (gameState.players || []).forEach(player => {
      if (player.reverseTurns > 0) player.reverseTurns -= 1;
      if (!player.reverseTurns) player.moveDirection = 1;
      ['godDiceTurns', 'globalTollTurns'].forEach(key => {
        if (player[key] > 0) player[key] -= 1;
        if (player[key] <= 0) delete player[key];
      });
      if (player.activeCenterBuff && !this.isCenterBuffActive(player)) delete player.activeCenterBuff;
    });
    return gameState;
  }

  triggerWeatherEffect(gameState = this.state) {
    const weatherEffects = [
      {
        weather: 'FLOOD',
        emoji: '🌧️',
        name: 'Mưa Ngập',
        turns: 3,
        canBuild: true,
        rentMultiplier: 0.7,
        description: '🌊 Đường phố ngập lụt! Mưa to gây khó khăn cho giao thông.',
        effects: [
          '📝 Tiền thuê tất cả ô đất GIẢM 30%',
          '🚶 Người chơi qua ô bị lùi 1 bước',
          '💰 Kinh doanh BĐS khó khăn, doanh thu sụt giảm',
          '🏠 Vẫn có thể xây dựng thêm nhà'
        ]
      },
<<<<<<< HEAD

=======
>>>>>>> 814147eb7059fe1f3a8102216959befd1818b784
      {
        weather: 'HEATWAVE',
        emoji: '☀️',
        name: 'Nắng Nóng',
        turns: 3,
        canBuild: true,
        rentMultiplier: 1.5,
        description: '🔥 Nắng nóng kỷ lục! Mỗi người cần đi vào nhà để tránh nắng.',
        effects: [
          '💰 Tiền thuê tất cả ô đất TĂNG 1.5 lần',
          '🏠 Mỗi người ưu tiên tìm nơi nghỉ trong nhà',
          '📈 Chủ nhà kiếm lợi nhuận khủng',
          '🏗️ Xây dựng thêm nhà giúp tăng lợi thế'
        ]
      },
      {
        weather: 'STORM',
        emoji: '🌪️',
        name: 'Bão Lớn',
        turns: 2,
        canBuild: false,
        rentMultiplier: 1.0,
        description: '⛈️ Bão lớn! Tất cả hoạt động xây dựng bị đóng băng tạm thời.',
        effects: [
          '🚫 KHÔNG thể xây dựng hoặc nâng cấp nhà',
          '⛈️ Tất cả công trình xây dựng bị tạm dừng',
          '💼 Những nhà đã xây trước đó vẫn tính tiền thuê bình thường',
          '⏱️ Sau 2 lượt, bão sẽ qua, có thể tiếp tục xây dựng'
        ]
      },
      {
        weather: 'LIGHT_WIND',
        emoji: '🍃',
        name: 'Gió Nhẹ',
        turns: 3,
        canBuild: true,
        rentMultiplier: 1.0,
        moveBonus: 2,
        description: '🍃 Gió thuận đường! Người chơi di chuyển nhanh hơn.',
        effects: [
          '🎲 Mỗi người được cộng 2 ô mỗi lượt',
          '🏗️ Có thể xây dựng bình thường'
        ]
      }
    ];

    const availableEffects = weatherEffects.filter(effect => effect.weather !== gameState.weather);
    const effect = availableEffects[Math.floor(Math.random() * availableEffects.length)];

    Object.assign(gameState, {
      weather: effect.weather,
      weatherTurns: effect.turns,
      canBuild: effect.canBuild,
      weatherRentMultiplier: effect.rentMultiplier,
      weatherMoveBonus: effect.moveBonus || 0,
      weatherName: effect.name,
      weatherEmoji: effect.emoji
    });

    if (effect.weather === 'STORM') {
      (gameState.board || []).forEach(tile => {
        if (tile.type === 'PROPERTY' && tile.houses > 0) tile.houses -= 1;
      });
      this.addLog('🌪️ Bão Lớn hạ 1 cấp nhà trên mọi ô đất đang có nhà.');
    }

    const effectsSummary = effect.effects?.join('\n') || '';
    this.addLog(
      `${effect.emoji} **Thời tiết đổi thành: ${effect.name}**\n` +
      `${effect.description}\n\n` +
      `📋 **Các hiệu ứng:**\n` +
      effectsSummary +
      `\n⏱️ Kéo dài **${effect.turns} lượt**`
    );

    return effect;
  }

  collectRent(payer, tile) {
    const owner = this.state.players.find(pl => pl.id === tile.owner);
    if (!owner) return 0;
<<<<<<< HEAD
    const recipient = tile.hijackPlayerId
      ? this.state.players.find(pl => pl.id === tile.hijackPlayerId) || owner
      : owner;
    if (recipient.inJail && !this.settings.receiveRentWhileJailed) {
      this.addLog(`🏛️ ${recipient.name} đang ở tù nên không thể thu tiền thuê.`);
=======
    if (owner.inJail && !this.settings.receiveRentWhileJailed) {
      this.addLog(`🏛️ ${owner.name} đang ở tù nên không thể thu tiền thuê.`);
>>>>>>> 814147eb7059fe1f3a8102216959befd1818b784
      return 0;
    }
    const rent = this.calculateRent(tile, owner);
    if (rent <= 0) return 0;

    let payableRent = rent;
    if (payer.shopRentReduction > 0) {
      payableRent = Math.round(rent * (1 - payer.shopRentReduction));
      delete payer.shopRentReduction;
    }

    if (payer.midasCharges > 0) {
<<<<<<< HEAD
      this.addLog(`👑 ${payer.name} dùng Đế Chế Midas và được miễn $${rent} tiền thuê cho ${recipient.name}.`);
      return 0;
    }

    if (this.interceptAttack(recipient, payer, { type: 'RENT', tile })) {
=======
      this.addLog(`👑 ${payer.name} dùng Đế Chế Midas và được miễn $${rent} tiền thuê cho ${owner.name}.`);
      return 0;
    }

    if (this.interceptAttack(owner, payer, { type: 'RENT', tile })) {
>>>>>>> 814147eb7059fe1f3a8102216959befd1818b784
      return 0;
    }

    payer.money -= payableRent;
<<<<<<< HEAD
    recipient.money += payableRent;
    if (payer.money < 0) {
      payer.lastCreditorId = recipient.id;
      this.addLog(`💸 ${payer.name} trả tiền thuê cho ${recipient.name} và đang nợ $${Math.abs(payer.money)}! Hãy bán/cầm cố tài sản trước khi kết thúc lượt.`);
    } else {
      payer.lastCreditorId = null;
      this.addLog(`💸 ${payer.name} trả $${payableRent} tiền thuê cho ${recipient.name}`);
=======
    owner.money += payableRent;
    if (payer.money < 0) {
      payer.lastCreditorId = owner.id;
      this.addLog(`💸 ${payer.name} trả tiền thuê cho ${owner.name} và đang nợ $${Math.abs(payer.money)}! Hãy bán/cầm cố tài sản trước khi kết thúc lượt.`);
    } else {
      payer.lastCreditorId = null;
      this.addLog(`💸 ${payer.name} trả $${payableRent} tiền thuê cho ${owner.name}`);
>>>>>>> 814147eb7059fe1f3a8102216959befd1818b784
    }
    return payableRent;
  }

  startAuction(tile, excludedPlayerId = null) {
    this.state.auctionTile = tile;
    const eligible = this.state.players.filter(p => !p.isBankrupt && p.money > 0 && p.id !== excludedPlayerId);
    if (!eligible.length) {
      this.state.auctionTile = null;
      this.state.auctionState = null;
      this.addLog(`⚪ Không có người chơi đủ điều kiện đấu giá [${tile.name}].`);
      return false;
    }
    this.state.auctionState = {
      currentBid: 0,
      highestBidder: null,
      highestBidderIndex: -1,
      active: true,
      eligibleIds: eligible.map(p => p.id),
      bidders: eligible.map(p => p.id),
      timerDuration: 5,
      timerEnd: Date.now() + 5000,
      excludedPlayerId: excludedPlayerId
    };

    this.addLog(`🔨 Đấu giá ô [${tile.name}]! Giá khởi điểm $0. Ai trả giá cao nhất sau 5s sẽ thắng!`);
    return true;
  }

  getCurrentAuctionBidder() {
    // Free-for-all: Tất cả người chơi đủ điều kiện đều có thể đặt giá
    return null;
  }

  placeBid(playerIndex, amount) {
    const p = this.state.players[playerIndex];
    const a = this.state.auctionState;
    if (!p || !a || !a.active) return false;
    if (p.isBankrupt) return false;
    if (a.eligibleIds && !a.eligibleIds.includes(p.id)) return false;
    if (amount <= a.currentBid) return false;
    if (amount > p.money) return false;

    a.currentBid = amount;
    a.highestBidder = {
      id: p.id,
      name: p.name,
      color: p.color,
      tokenEmoji: p.tokenEmoji,
      tokenName: p.tokenName
    };
    a.highestBidderIndex = playerIndex;
    a.timerEnd = Date.now() + (a.timerDuration * 1000);
    this.addLog(`🔨 ${p.tokenEmoji || ''} ${p.name} đặt giá $${amount}!`);
    return true;
  }

  passBid(playerIndex) {
    const a = this.state.auctionState;
    if (!a || !a.active) return false;
    const p = this.state.players[playerIndex];
    if (!p) return false;

    if (a.eligibleIds) {
      a.eligibleIds = a.eligibleIds.filter(id => id !== p.id);
    }
    this.addLog(`⏭️ ${p.tokenEmoji || ''} ${p.name} bỏ lượt trong cuộc đấu giá.`);

    if (a.eligibleIds && (a.eligibleIds.length === 0 || (a.eligibleIds.length === 1 && a.highestBidder && a.eligibleIds[0] === a.highestBidder.id))) {
      this.endAuction();
      return true;
    }
    return true;
  }

  advanceAuction() {
    // Free-for-all: không dùng bước chuyển lượt cứng
  }

  endAuction() {
    const a = this.state.auctionState;
    const tile = this.state.auctionTile;
    if (!a || !tile) return null;

    if (a.highestBidder && a.currentBid > 0) {
      const winner = this.state.players.find(p => p.id === a.highestBidder.id);
      if (winner) {
        winner.money -= a.currentBid;
        tile.owner = winner.id;
        tile.mortgaged = false;
        tile.lastBuiltPlayerTurn = null;
        this.addLog(`🏆 ${winner.tokenEmoji || ''} ${winner.name} thắng đấu giá [${tile.name}] với $${a.currentBid}!`);
      }
    } else {
      this.addLog(`⭕ Không ai trả giá, ô [${tile.name}] vẫn chưa có chủ.`);
    }

    const result = a.highestBidder ? { winner: a.highestBidder, amount: a.currentBid } : null;
    this.state.auctionTile = null;
    this.state.auctionState = null;
    this.state.pendingTile = null;
    return result;
  }

  processTileLanding(p, info = {}) {
    const tile = this.state.board[p.position];
    const finish = result => ({ ...result, finalPos: p.position });
    if (!tile) return finish({ action: "END_ROLL", tile: null, ...info });

    if (p.isGhosting) {
      p.isGhosting = false;
      this.addLog(`👻 ${p.name} đi xuyên qua [${tile.name}] mà không kích hoạt hiệu ứng.`);
      return finish({ action: "END_ROLL", tile, ghosted: true, ...info });
    }

    if (this.canActivateCenterBuff(p, tile)) {
<<<<<<< HEAD
      const buff = this.activateCenterBuff(p);
      if (p.specialShop) return { action: 'OPEN_SPECIAL_SHOP', tile, finalPos: p.position, ...info };
      return { action: 'CENTER_BUFF', buff, tile, finalPos: p.position, ...info };
=======
      this.activateCenterBuff(p);
      if (p.specialShop) return { action: 'OPEN_SPECIAL_SHOP', tile, finalPos: p.position, ...info };
>>>>>>> 814147eb7059fe1f3a8102216959befd1818b784
    }
    if (tile.trap === 'SLIDE_OIL') {
      if (this.interceptAttack(null, p, { type: 'TRAP', tile })) {
        delete tile.trap;
        return { action: "END_ROLL", tile, blocked: true, finalPos: p.position, ...info };
      }
      delete tile.trap;
      p.position = (p.position + 3) % this.state.board.length;
      this.addLog(`🛢️ ${p.name} dẫm bẫy dầu tại [${tile.name}] và trượt thêm 3 ô.`);
      return this.processTileLanding(p, { ...info, slidFrom: tile.id });
    }

    // 1. Ô VÀO TÙ
    if (p.position === 30 || tile.type === "GO_TO_JAIL" || tile.type === "GOTO_JAIL") {
      p.position = 10;
      p.inJail = true;
      p.jailTurns = 0;
      p.jailRolls = 0;
      this.state.extraRollPending = false;
      p.jailRolls = 0;
      this.state.extraRollPending = false;
      this.addLog(`🚔 ${p.name} đỗ vào ô [Vào Tù]! Bị tống ngay vào Ô Tù (#10).`);
      return { action: "GO_TO_JAIL", tile, finalPos: p.position, ...info };
    }

    if (tile.type === 'UTILITY' || tile.name === 'Trạm Dự Báo Thời Tiết') {
      this.triggerWeatherEffect(this.state);
      return { action: 'WEATHER_CHANGE', weather: this.state.weather, weatherTurns: this.state.weatherTurns, tile, finalPos: p.position, ...info };
    }

    // 2. Ô CƠ HỘI & KHÍ VẬN
    const tileName = (tile.name || "").toLowerCase();
    const tileType = (tile.type || "").toUpperCase();
    if (tileType === "SHOP") {
      return { action: "OPEN_SHOP", tile, finalPos: p.position, ...info };
    }
    const isChance = tileType === "CHANCE" || tileType === "CO_HOI" || tileName.includes("cơ hội");
    const isFortune = tileType === "FORTUNE" || tileType === "KHI_VAN" || tileType === "COMMUNITY" || tileName.includes("khí vận");

    if (isChance || isFortune) {
      const deck = isChance ? CHANCE_CARDS : FORTUNE_CARDS;
      const card = deck[Math.floor(Math.random() * deck.length)];
<<<<<<< HEAD
      this.state.pendingCard = {
        ...card,
        type: isChance ? "CƠ HỘI" : "KHÍ VẬN",
        source: isChance ? 'CHANCE' : 'FORTUNE',
        category: isChance ? 'THẺ CƠ HỘI' : 'THẺ KHÍ VẬN'
      };
=======
      this.state.pendingCard = { ...card, type: isChance ? "CƠ HỘI" : "KHÍ VẬN" };
>>>>>>> 814147eb7059fe1f3a8102216959befd1818b784
      return { action: "DRAW_CARD", card: this.state.pendingCard, finalPos: p.position, ...info };
    }

    // 3. Ô THUẾ
    if (p.position === 4 || tileType === "TAX") {
      const taxAmount = p.position === 4 ? Math.round(p.money * 0.10) : (tile.amount || 100);
      if (p.shopFreeParking) {
        delete p.shopFreeParking;
        this.addLog(`🅿️ ${p.name} dùng Vé miễn phạt và được hoàn lại $${taxAmount}.`);
        return { action: "PAID_TAX", taxAmount: 0, refunded: taxAmount, finalPos: p.position, ...info };
      }
      if (this.interceptAttack(null, p, { type: 'TAX', tile })) {
        return { action: "PAID_TAX", taxAmount: 0, ...info };
      }
      p.money -= taxAmount;
      if (this.settings.jackpotOnFreeParking) {
        this.state.jackpot += taxAmount;
      }
      this.addLog(`💸 ${p.name} đỗ vào [${tile.name || "Thuế"}] -> Nộp $${taxAmount}`);
      return { action: "PAID_TAX", taxAmount, ...info };
    }

    // 4. BÃI XE TỰ DO (JACKPOT)
    if (p.position === 20 || tileType === "FREE_PARKING") {
      if (p.shopFreeParking) {
        delete p.shopFreeParking;
        this.addLog(`🅿️ ${p.name} dùng Vé miễn phạt tại Bãi xe và được hoàn tiền.`);
        return { action: "FREE_PARKING", amount: 0, refunded: true, finalPos: p.position, ...info };
      }
      if (this.settings.jackpotOnFreeParking && this.state.jackpot > 0) {
        const winAmount = this.state.jackpot;
        p.money += winAmount;
        this.addLog(`🎉 ${p.name} đỗ vào Bãi Xe Tự Do và hốt sạch Jackpot $${winAmount}!`);
        this.state.jackpot = 0;
        return { action: "WIN_JACKPOT", amount: winAmount, ...info };
      }
    }

    // 5. Ô ĐẤT / GA / NHÀ MÁY
    if (tile.price && tile.type !== "TAX") {
<<<<<<< HEAD
      const clearTileEffects = () => {
        delete tile.frozenTurns;
        delete tile.protectedTurns;
        delete tile.boostTurns;
        delete tile.hijackPlayerId;
      };
=======
>>>>>>> 814147eb7059fe1f3a8102216959befd1818b784
      if (tile.owner === null || tile.owner === undefined) {
        const effectivePrice = p.hasDiscount ? Math.round(tile.price * 0.5) : tile.price;
        this.state.pendingTile = tile;
        const canAfford = p.money >= effectivePrice;
        if (!canAfford) {
          this.addLog(`💡 ${p.name} đỗ vào [${tile.name}] (Giá: $${effectivePrice} - Số dư: $${p.money}).`);
        }
<<<<<<< HEAD
        const result = {
=======
        return {
>>>>>>> 814147eb7059fe1f3a8102216959befd1818b784
          action: "PROMPT_BUY",
          tile,
          discount: p.hasDiscount,
          effectivePrice,
          canAfford,
          finalPos: p.position,
          ...info
        };
<<<<<<< HEAD
        clearTileEffects();
        return result;
      } else if (tile.owner !== p.id) {
        if (tile.mortgaged) {
          this.addLog(`🏦 [${tile.name}] đang bị cầm cố nên ${p.name} không phải trả tiền thuê.`);
          clearTileEffects();
=======
      } else if (tile.owner !== p.id) {
        if (tile.mortgaged) {
          this.addLog(`🏦 [${tile.name}] đang bị cầm cố nên ${p.name} không phải trả tiền thuê.`);
>>>>>>> 814147eb7059fe1f3a8102216959befd1818b784
          return { action: "END_ROLL", tile, ...info };
        }
        this.collectRent(p, tile);
      }
      if (tile.rentMultiplier && tile.rentMultiplier !== 1) {
        delete tile.rentMultiplier;
        this.addLog(`📈 Hiệu ứng tăng 1.5x trên [${tile.name}] đã được sử dụng.`);
      }
<<<<<<< HEAD
      clearTileEffects();
=======
>>>>>>> 814147eb7059fe1f3a8102216959befd1818b784
    }

    return { action: "END_ROLL", tile, finalPos: p.position, ...info };
  }

  rollDice(stepsOverride = null) {
    const p = this.getCurrentPlayer();
<<<<<<< HEAD
    this.state.lastStationRoll = null;
=======
>>>>>>> 814147eb7059fe1f3a8102216959befd1818b784
    if (p.jailReleaseWait) {
      p.jailReleaseWait = false;
      this.state.extraRollPending = false;
      this.addLog(`⏳ ${p.name} đã ra tù từ lượt trước và phải chờ hết lượt này mới được di chuyển.`);
      const result = { action: 'WAIT_AFTER_JAIL', startPos: p.position, dice: 0, playerId: p.id, turnEnded: true };
      this.endTurn();
      return result;
    }
    const d1 = Math.floor(Math.random() * 6) + 1;
    let d2 = Math.floor(Math.random() * 6) + 1;
    if (p.shopEvenDice) {
      if ((d1 + d2) % 2 !== 0) d2 = d2 < 6 ? d2 + 1 : d2 - 1;
      delete p.shopEvenDice;
    }
    const hasGodDice = p.activeCenterBuff === 'GOD_DICE' && p.godDiceTurns > 0 && Number.isFinite(Number(stepsOverride));
    const dice = hasGodDice ? Math.max(1, Math.min(12, Math.floor(Number(stepsOverride)))) : d1 + d2;
    const isDouble = !hasGodDice && (d1 === d2);
    const earnsExtraRoll = isDouble || (d1 === 6 && d2 === 1) || (d1 === 1 && d2 === 6);
    this.state.lastRoll = dice;
    this.state.lastRollWasGodDice = hasGodDice;
    this.state.lastDice = hasGodDice ? [Math.min(6, dice), Math.max(1, dice - Math.min(6, dice))] : [d1, d2];
    if (hasGodDice) {
      p.godDiceTurns -= 1;
      if (p.godDiceTurns <= 0) delete p.godDiceTurns;
      this.addLog(`🎯 ${p.name} dùng Quyền Năng Thượng Đế: chọn đi chính xác ${dice} bước.`);
    }

    const startPos = p.position;

    if (p.inJail) {
      p.jailRolls = (p.jailRolls || 0) + 1;
      p.jailTurns = p.jailRolls;
      if (isDouble) {
        p.inJail = false;
        p.jailTurns = 0;
        p.jailRolls = 0;
        p.jailReleaseWait = true;
        this.state.extraRollPending = false;
        this.addLog(`🎲 ${p.name} gieo được đôi (${d1}-${d2}) -> 🔓 RA TÙ MIỄN PHÍ, không di chuyển.`);
        const result = { action: "RELEASE_FROM_JAIL", startPos, dice: 0, playerId: p.id, turnEnded: true };
        this.endTurn();
        return result;
      } else {
        const rollsLeft = 3 - p.jailRolls;
        this.state.extraRollPending = rollsLeft > 0;
        this.addLog(`🔒 ${p.name} gieo (${d1}-${d2}), không phải đôi. Còn ${rollsLeft} lần thử ra tù.`);
        if (rollsLeft === 0) {
          const result = { action: "STAY_IN_JAIL", startPos, dice: 0, rollsLeft, playerId: p.id, turnEnded: true };
          this.endTurn();
          return result;
        }
        return { action: "STAY_IN_JAIL", startPos, dice: 0, rollsLeft };
      }
    } else {
      this.addLog(`🎲 ${p.name} gieo được ${dice} điểm (${d1} + ${d2})`);
      if (earnsExtraRoll) {
        p.bonusRollStreak = (p.bonusRollStreak || 0) + 1;
        if (p.bonusRollStreak >= 3) {
          p.position = 10;
          p.inJail = true;
          p.jailRolls = 0;
          p.bonusRollStreak = 0;
          this.state.extraRollPending = false;
          this.addLog(`🚔 ${p.name} đạt chuỗi lần thứ 3 (${d1}-${d2}) -> vào thẳng Tù và hết lượt.`);
          const result = { action: 'THREE_BONUS_ROLLS_JAIL', startPos, dice: 0, playerId: p.id, turnEnded: true };
          this.endTurn();
          return result;
        }
      } else {
        p.bonusRollStreak = 0;
      }
    }

    this.state.extraRollPending = earnsExtraRoll;

<<<<<<< HEAD
=======
    if (this.state.crossRouteChoice && this.state.crossRouteChoice.playerId === p.id) {
      this.state.pendingCrossRouteRoll = { playerId: p.id, startPos, dice: dice + (this.state.weatherMoveBonus || 0) };
      return {
        action: 'CHOOSE_CROSS_ROUTE',
        playerId: p.id,
        startPos,
        dice: dice + (this.state.weatherMoveBonus || 0),
        crossRouteChoice: {
          from: this.state.crossRouteChoice.station,
          to: this.state.crossRouteChoice.path[this.state.crossRouteChoice.path.length - 1]
        }
      };
    }

>>>>>>> 814147eb7059fe1f3a8102216959befd1818b784
    const oldPos = p.position;
    const movement = this.getMovementPath(p, dice + (this.state.weatherMoveBonus || 0));
    p.position = movement.position;
    this.state.lastMovementPath = movement.path;
<<<<<<< HEAD
    this.state.stationEvents = movement.stationEvents || [];
=======
>>>>>>> 814147eb7059fe1f3a8102216959befd1818b784
    this.processMovementPasses(p, movement.path);

    if (movement.path.some((position, index) => position < 40 && position < (movement.path[index - 1] ?? oldPos)) && !p.inJail) {
      const goBonus = this.settings.passGoMoney;
      p.money += goBonus;
      this.addLog(`💵 ${p.name} qua ô Bắt đầu (+ $${goBonus})`);
    }

    const result = this.processTileLanding(p, { startPos, dice, movementPath: movement.path });
    result.godDice = hasGodDice;
<<<<<<< HEAD
    result.stationRoll = this.state.lastStationRoll;
    result.stationRoutePath = this.state.lastStationRoutePath;
    result.stationEvents = movement.stationEvents || [];
=======
    const landedDirectlyOnStation = movement.path.every(position => position < 40) && [5, 15, 25, 35].includes(p.position);
    const crossRoute = landedDirectlyOnStation ? this.getCrossRoute(p.position) : null;
    if (crossRoute) {
      this.state.crossRouteChoice = { playerId: p.id, station: p.position, path: crossRoute };
      result.crossRouteChoice = { from: p.position, to: crossRoute[crossRoute.length - 1] };
      this.addLog(`🚉 ${p.name} đáp đúng ga #${p.position}. Hãy chọn đường trong hoặc vòng ngoài cho lượt kế tiếp.`);
    }
>>>>>>> 814147eb7059fe1f3a8102216959befd1818b784
    if (result.action === "GO_TO_JAIL") {
      result.playerId = p.id;
      result.turnEnded = true;
      this.endTurn();
    }
    return result;
  }

  applyCardEffect() {
    const card = this.state.pendingCard;
    if (!card) return null;

    const p = this.getCurrentPlayer();
<<<<<<< HEAD
    let cardMovementStart = p.position;
    let cardMovementPath = [];
=======
>>>>>>> 814147eb7059fe1f3a8102216959befd1818b784
    this.addLog(`🎴 ${p.name} rút thẻ [${card.type}]: ${card.title}`);

    switch (card.action) {
      case "MONEY": {
        const amount = card.amount || 0;
        p.money += amount;
        if (p.money >= 0) p.lastCreditorId = null;
        else p.lastCreditorId = null;
        this.addLog(`  -> ${p.name} ${amount >= 0 ? '+' : ''}$${amount}`);
        break;
      }

      case "COLLECT_OTHER": {
        const amount = card.amount || 0;
        const others = this.state.players.filter(x => x.id !== p.id && !x.isBankrupt);
        let totalCollected = 0;
        others.forEach(other => {
          if (this.interceptAttack(p, other, { type: 'COLLECT_OTHER', amount })) return;
          other.money -= amount;
          if (other.money < 0) {
            other.lastCreditorId = p.id;
          } else {
            other.lastCreditorId = null;
          }
          totalCollected += amount;
        });
        p.money += totalCollected;
        if (p.money >= 0) p.lastCreditorId = null;
        this.addLog(`  -> ${p.name} nhận $${amount} từ mỗi người chơi (Tổng nhận: $${totalCollected})`);
        break;
      }

      case "SHIELD": {
        this.grantTripleShield(p);
        break;
      }

      case "FREEZE_ENEMY_TILE": {
<<<<<<< HEAD
        const target = this.state.board.filter(t => t.type === 'PROPERTY' && t.owner && t.owner !== p.id && t.price).sort((a, b) => b.price - a.price)[0];
        if (target) { target.frozenTurns = true; this.addLog(`❄️ [${target.name}] bị đóng băng cho đến khi có người đáp vào ô.`); }
        break;
      }
      case "PROTECT_MY_LAND": {
        const target = this.state.board.filter(t => t.type === 'PROPERTY' && t.owner === p.id && t.price).sort((a, b) => b.price - a.price)[0];
        if (target) { target.protectedTurns = true; this.addLog(`🛡️ [${target.name}] được bảo vệ cho đến khi có người đáp vào ô.`); }
        break;
      }
      case "BOOST_RENT_TEMP": {
        const target = this.state.board.filter(t => t.type === 'PROPERTY' && t.owner === p.id && t.price).sort((a, b) => b.price - a.price)[0];
        if (target) { target.boostTurns = true; this.addLog(`🔥 [${target.name}] tăng tiền thuê cho đến khi có người đáp vào ô.`); }
=======
        const target = this.state.board.filter(t => t.owner && t.owner !== p.id && t.price).sort((a, b) => b.price - a.price)[0];
        if (target) { target.frozenTurns = 2; this.addLog(`❄️ [${target.name}] bị đóng băng 2 lượt.`); }
        break;
      }
      case "PROTECT_MY_LAND": {
        const target = this.state.board.filter(t => t.owner === p.id && t.price).sort((a, b) => b.price - a.price)[0];
        if (target) { target.protectedTurns = 2; this.addLog(`🛡️ [${target.name}] được bảo vệ 2 lượt.`); }
        break;
      }
      case "BOOST_RENT_TEMP": {
        const target = this.state.board.filter(t => t.owner === p.id && t.price).sort((a, b) => b.price - a.price)[0];
        if (target) { target.boostTurns = 2; this.addLog(`🔥 [${target.name}] tăng tiền thuê 2 lượt.`); }
>>>>>>> 814147eb7059fe1f3a8102216959befd1818b784
        break;
      }
      case "UPGRADE_MY_TILE": {
        const target = this.state.board.filter(t => t.owner === p.id && t.type === 'PROPERTY' && (t.houses || 0) < 5).sort((a, b) => a.price - b.price)[0];
        if (target) { target.houses = (target.houses || 0) + 1; this.addLog(`🏠 Nâng miễn phí [${target.name}] lên cấp ${target.houses}.`); }
        break;
      }
      case "DEMOLISH_ENEMY_HOUSE": {
        const richest = this.state.players.filter(x => x.id !== p.id && !x.isBankrupt).sort((a, b) => this.netWorth(b) - this.netWorth(a))[0];
<<<<<<< HEAD
        const target = richest && this.state.board.filter(t => t.type === 'PROPERTY' && t.owner === richest.id && t.houses > 0).sort((a, b) => b.price - a.price)[0];
=======
        const target = richest && this.state.board.filter(t => t.owner === richest.id && t.type === 'PROPERTY' && t.houses > 0).sort((a, b) => b.price - a.price)[0];
>>>>>>> 814147eb7059fe1f3a8102216959befd1818b784
        if (target && !target.protectedTurns && !this.interceptAttack(p, richest, { type: 'DEMOLISH', tile: target })) {
          target.houses -= 1;
          this.addLog(`📉 Hạ một cấp nhà trên [${target.name}].`);
        }
        break;
      }

      case "DISCOUNT": {
        p.hasDiscount = true;
        this.addLog(`  -> 🏷️ ${p.name} nhận được PHIẾU GIẢM GIÁ 50% cho lần mua đất kế tiếp!`);
        break;
      }

      case "MULTIPLY_LAND_RENT": {
<<<<<<< HEAD
        const myTiles = this.state.board.filter(t => t.type === 'PROPERTY' && t.owner === p.id && t.price);
=======
        const myTiles = this.state.board.filter(t => t.owner === p.id && t.price);
>>>>>>> 814147eb7059fe1f3a8102216959befd1818b784
        if (myTiles.length > 0) {
          myTiles.sort((a, b) => (b.price || 0) - (a.price || 0));
          const targetTile = myTiles[0];
          targetTile.rentMultiplier = 1.5;
          this.addLog(`  -> 📈 Ô đất giá trị nhất [${targetTile.name}] của ${p.name} đã được tăng 1.5x tiền thuê!`);
        } else {
          this.addLog(`  -> ⚠️ ${p.name} chưa sở hữu ô đất nào để tăng tiền thuê.`);
        }
        break;
      }

      case "STEAL_RICHEST": {
        const stealAmount = card.amount || 100;
        const rivals = this.state.players.filter(x => x.id !== p.id && !x.isBankrupt);
        if (rivals.length > 0) {
          rivals.sort((a, b) => this.netWorth(b) - this.netWorth(a));
          const richest = rivals[0];
          if (this.interceptAttack(p, richest, { type: 'STEAL', amount: stealAmount })) break;
          const actualSteal = Math.min(Math.max(0, richest.money), stealAmount);
          richest.money -= actualSteal;
          p.money += actualSteal;
          if (richest.money < 0) richest.lastCreditorId = p.id;
          this.addLog(`  -> 🥷 ${p.name} đã cướp $${actualSteal} từ người chơi giàu nhất (${richest.name})!`);
        } else {
          this.addLog(`  -> ⚪ Không có đối thủ phù hợp để cướp tiền.`);
        }
        break;
      }

      case "PULL_RICHEST_TO_MY_LAND": {
<<<<<<< HEAD
        const myTiles = this.state.board.filter(t => t.type === 'PROPERTY' && t.owner === p.id && t.price);
=======
        const myTiles = this.state.board.filter(t => t.owner === p.id && t.price);
>>>>>>> 814147eb7059fe1f3a8102216959befd1818b784
        const rivals = this.state.players.filter(x => x.id !== p.id && !x.isBankrupt);
        if (myTiles.length > 0 && rivals.length > 0) {
          myTiles.sort((a, b) => (b.price || 0) - (a.price || 0));
          const expensiveTile = myTiles[0];
          rivals.sort((a, b) => this.netWorth(b) - this.netWorth(a));
          const richest = rivals[0];
          const targetTileIndex = this.state.board.findIndex(t => t.id === expensiveTile.id);

          if (targetTileIndex !== -1) {
            if (this.interceptAttack(p, richest, { type: 'FORCED_MOVE', tile: expensiveTile })) break;
            const oldPos = richest.position;
            richest.position = targetTileIndex;
            this.addLog(`  -> 🧲 Đã kéo đại gia ${richest.name} từ ô #${oldPos} đến ô [${expensiveTile.name}] (#${targetTileIndex}) của ${p.name}!`);
            this.processTileLanding(richest, { startPos: oldPos });
          }
        } else {
          this.addLog(`  -> ⚪ Không đủ điều kiện kích hoạt lực hút (cần sở hữu đất và có đối thủ còn sống).`);
        }
        break;
      }

      case "SWAP_TILE": {
        const mySwappable = this.state.board.filter(t => t.owner === p.id && (!t.houses || t.houses === 0) && t.price);
        const rivalSwappable = this.state.board.filter(t => t.owner && t.owner !== p.id && (!t.houses || t.houses === 0) && t.price);

        if (mySwappable.length > 0 && rivalSwappable.length > 0) {
          const myTile = mySwappable[Math.floor(Math.random() * mySwappable.length)];
          const rivalTile = rivalSwappable[Math.floor(Math.random() * rivalSwappable.length)];
          const rivalPlayer = this.state.players.find(x => x.id === rivalTile.owner);

          if (this.interceptAttack(p, rivalPlayer, { type: 'LAND_SWAP', tile: rivalTile })) break;

          const tempOwner = myTile.owner;
          myTile.owner = rivalTile.owner;
          rivalTile.owner = tempOwner;
          myTile.lastBuiltPlayerTurn = null;
          rivalTile.lastBuiltPlayerTurn = null;

          this.addLog(`  -> 🔄 Tráo đổi đất thành công! ${p.name} nhận [${rivalTile.name}] và ${rivalPlayer ? rivalPlayer.name : "Đối thủ"} nhận [${myTile.name}].`);
        } else {
          this.addLog(`  -> ⚠️ Không thể tráo đổi ô đất (cả hai bên phải có ít nhất 1 ô đất chưa xây nhà).`);
        }
        break;
      }

      case "GO_TO_JAIL": {
        p.position = 10;
        p.inJail = true;
        p.jailTurns = 0;
        this.addLog(`  -> 🚔 ${p.name} bị áp giải vào Tù (#10)!`);
        break;
      }

      case "MOVE_TO": {
<<<<<<< HEAD
        const movement = this.movePlayerOuter(p, card.target);
        cardMovementStart = movement.startPos;
        cardMovementPath = movement.movementPath;
        if (card.getGoBonus && !movement.movementPath.includes(0)) p.money += this.settings.passGoMoney;
=======
        p.position = card.target;
        if (card.getGoBonus) p.money += this.settings.passGoMoney;
>>>>>>> 814147eb7059fe1f3a8102216959befd1818b784
        this.addLog(`  -> ${p.name} di chuyển đến ô #${card.target}`);
        break;
      }

      case "MOVE_STEPS": {
<<<<<<< HEAD
        const steps = Number(card.steps) || 0;
        if (steps > 0) {
          const movement = this.movePlayerOuter(p, p.position + steps);
          cardMovementStart = movement.startPos;
          cardMovementPath = movement.movementPath;
        }
        else p.position = (p.position + steps + 40) % 40;
=======
        p.position = (p.position + card.steps + 40) % 40;
>>>>>>> 814147eb7059fe1f3a8102216959befd1818b784
        this.addLog(`  -> ${p.name} dịch chuyển ${card.steps} bước (về ô #${p.position})`);
        break;
      }

      default:
        this.addLog(`  -> Thao tác thẻ: ${card.title}`);
        break;
    }

<<<<<<< HEAD
    const resultCard = { ...card, finalPos: p.position, startPos: cardMovementStart, movementPath: cardMovementPath };

    if (card.action === "MOVE_TO" || card.action === "MOVE_STEPS") {
      resultCard.landing = this.processTileLanding(p, {
        startPos: resultCard.startPos,
        movementPath: resultCard.movementPath
      });
=======
    const resultCard = { ...card, finalPos: p.position };

    if (card.action === "MOVE_TO" || card.action === "MOVE_STEPS") {
      resultCard.landing = this.processTileLanding(p, { startPos: resultCard.finalPos });
>>>>>>> 814147eb7059fe1f3a8102216959befd1818b784
      resultCard.finalPos = resultCard.landing.finalPos;
    }

    this.state.pendingCard = null;
    return resultCard;
  }

  buyPendingProperty() {
    const p = this.getCurrentPlayer();
    const tile = this.state.pendingTile;
    if (!tile) return false;

    const price = p.hasDiscount ? Math.round(tile.price * 0.5) : tile.price;
    if (p.money >= price) {
      p.money -= price;
      tile.owner = p.id;
      tile.lastBuiltPlayerTurn = null;
<<<<<<< HEAD
      p.hasBoughtPropertyThisTurn = true;
=======
>>>>>>> 814147eb7059fe1f3a8102216959befd1818b784
      if (p.hasDiscount) {
        this.addLog(`🛒 ${p.name} dùng PHIẾU GIẢM GIÁ 50% mua [${tile.name}] với giá $${price} (giá gốc: $${tile.price})`);
        p.hasDiscount = false;
      } else {
        this.addLog(`🛒 ${p.name} mua [${tile.name}] (-$${price})`);
      }
      this.state.pendingTile = null;
      return true;
    }
    return false;
  }

  skipPendingProperty() {
    const p = this.getCurrentPlayer();
    const tile = this.state.pendingTile;
    if (tile) {
      this.addLog(`⏭️ ${p.name} BỎ QUA không mua [${tile.name}]`);
    }
    this.state.pendingTile = null;
    return true;
  }

  auctionPendingProperty() {
    const p = this.getCurrentPlayer();
    const tile = this.state.pendingTile;
    if (tile) {
      this.addLog(`🔨 ${p.name} chọn đưa [${tile.name}] ra ĐẤU GIÁ cho tất cả mọi người!`);
      const started = this.startAuction(tile);
      this.state.pendingTile = null;
      return started;
    }
    return false;
  }

  buildHouse(tileId) {
    const p = this.getCurrentPlayer();
    const tile = this.state.board.find(t => t.id === tileId);
    if (!tile || tile.owner !== p.id || !this.isBuildableProperty(tile) || this.state.canBuild === false) return false;

    const isFullGroup = this.ownsFullGroup(tile);

<<<<<<< HEAD
    if (p.hasBoughtPropertyThisTurn) {
      this.addLog(`⚠️ ${p.name} không được xây nhà trong lượt vừa mua đất!`);
      return false;
    }

=======
>>>>>>> 814147eb7059fe1f3a8102216959befd1818b784
    if (this.settings.freeBuildOnFullGroup) {
      if (!isFullGroup) {
        this.addLog(`⚠️ ${p.name} cần sở hữu trọn bộ màu mới được phép xây nhà!`);
        return false;
      }
      // Khi đã đủ trọn bộ nhóm màu: cho phép nâng nhà tự do (bỏ giới hạn 1 nhà/lượt & cách lượt)
    } else {
      // Luật 1: Mỗi lượt chỉ cho phép mua nhà 1 lần bất kể ô đất
      if (p.hasBuiltHouseThisTurn) {
        this.addLog(`⚠️ ${p.name} chỉ được mua nhà 1 lần trong mỗi lượt!`);
        return false;
      }

      // Luật 2: Đối với cùng 1 ô đất, chỉ cho cách 1 lượt mua 1 lần
      const curTurn = p.turnCount || 1;
      if (tile.lastBuiltPlayerTurn && (curTurn - tile.lastBuiltPlayerTurn < 2)) {
        this.addLog(`⚠️ [${tile.name}] cần cách 1 lượt mới được xây tiếp!`);
        return false;
      }
    }

    const houses = tile.houses || 0;
    if (houses >= 5) return false;

    const baseHouseCost = tile.housePrice || Math.round((tile.price || 100) * 0.75);
    const houseCost = p.hasDiscount ? Math.round(baseHouseCost * 0.5) : baseHouseCost;
    if (p.money < houseCost) return false;

    p.money -= houseCost;
    if (p.hasDiscount) delete p.hasDiscount;
    tile.houses = houses + 1;
    p.hasBuiltHouseThisTurn = true;
    tile.lastBuiltPlayerTurn = p.turnCount || 1;

    const isHotel = tile.houses === 5;
    this.addLog(`🏠 ${p.tokenEmoji || ''} ${p.name} ${isHotel ? 'xây khách sạn' : 'xây nhà'} tại [${tile.name}] (-$${houseCost})${this.settings.freeBuildOnFullGroup ? ' 👑 [Trọn bộ màu: Nâng tự do]' : ''}`);
    return true;
  }

  sellHouse(tileId) {
    const p = this.getCurrentPlayer();
    const tile = this.state.board.find(t => t.id === tileId);
    if (!tile || tile.owner !== p.id || !this.isBuildableProperty(tile)) return false;

    const houses = tile.houses || 0;
    if (houses <= 0) return false;

    const houseCost = tile.housePrice || Math.round((tile.price || 100) * 0.75);
    const refund = Math.round(houseCost / 2);

    p.money += refund;
    tile.houses = houses - 1;
    if (p.money >= 0) {
      p.lastCreditorId = null;
    }

    this.addLog(`📉 ${p.name} dỡ bớt 1 nhà tại [${tile.name}] (+$${refund})`);
    return true;
  }

  mortgageProperty(tileId) {
    const p = this.getCurrentPlayer();
    const tile = this.state.board.find(t => t.id === tileId);
    if (!tile || tile.owner !== p.id) return false;

    const price = tile.price || 0;
    const value = Math.round(price / 2);

    if (this.settings.mortgageInsteadOfSell) {
      if (tile.mortgaged) {
        const redeemCost = value + Math.round(value * 0.1);
        if (p.money < redeemCost) {
          this.addLog(`❌ ${p.name} không đủ $${redeemCost} để chuộc lại [${tile.name}].`);
          return false;
        }
        p.money -= redeemCost;
        tile.mortgaged = false;
        this.addLog(`🔓 ${p.name} chuộc lại [${tile.name}] (trả $${redeemCost})`);
        return true;
      }

      p.money += value;
      tile.mortgaged = true;
      if (p.money >= 0) {
        p.lastCreditorId = null;
      }
      this.addLog(`🏦 ${p.name} cầm cố [${tile.name}] (+$${value}) — đất vẫn thuộc về ${p.name}`);
      return true;
    }

    p.money += value;
    tile.owner = null;
    tile.houses = 0;
    tile.mortgaged = false;
    tile.lastBuiltPlayerTurn = null;
    if (p.money >= 0) {
      p.lastCreditorId = null;
    }
    this.addLog(`🏦 ${p.name} bán hẳn [${tile.name}] (+$${value})`);
    return true;
  }

  payBail() {
    const p = this.getCurrentPlayer();
    if (p.inJail && p.money >= 100) {
      p.money -= 100;
      p.inJail = false;
      p.jailTurns = 0;
      p.jailRolls = 0;
      p.jailReleaseWait = true;
      this.addLog(`🔓 ${p.name} nộp $100 tiền bảo lãnh và đã RA TÙ! Không được đi tiếp lượt này.`);
      return true;
    }
    return false;
  }

  // =========================================================
  // KIỂM TRA PHÁ SẢN & KẾT THÚC GAME
  // =========================================================

  /**
   * Tính tổng tài sản thuần của 1 người chơi (tiền mặt + giá trị đất có thể bán/cầm cố).
   */
  netWorth(player) {
    let total = player.money;
    this.state.board.forEach(tile => {
      if (tile.owner !== player.id) return;
      const value = tile.mortgaged
        ? 0                                              // đã cầm cố rồi, không tính thêm
        : Math.round((tile.price || 0) / 2);            // giá trị cầm cố / bán
      total += value + (tile.houses || 0) * Math.round((tile.housePrice || 0) / 2);
    });
    return total;
  }

  /**
   * Khai báo phá sản cho 1 người chơi: chuyển toàn bộ tài sản về ngân hàng hoặc chủ nợ.
   */
  declareBankrupt(player, creditorId = null) {
    if (!player || player.isBankrupt) return false;
    player.isBankrupt = true;

    const effectiveCreditorId = creditorId || player.lastCreditorId || null;
    const creditor = effectiveCreditorId ? this.state.players.find(p => p.id === effectiveCreditorId && !p.isBankrupt && p.id !== player.id) : null;

    const remainingCash = Math.max(0, player.money);
    player.money = 0;
    player.lastCreditorId = null;

    // Nếu người chơi đầu hàng khi nợ người khác, người nhận vẫn nhận toàn bộ tiền và tài sản
    if (creditor && remainingCash > 0) {
      creditor.money += remainingCash;
    }

    let transferredCount = 0;
    this.state.board.forEach(tile => {
      if (tile.owner !== player.id) return;
      transferredCount++;
      tile.lastBuiltPlayerTurn = null;
      if (creditor) {
        tile.owner = creditor.id;          // chủ nợ thừa kế đất
      } else {
        tile.owner = null;               // ngân hàng tiếp quản
        tile.mortgaged = false;
        tile.houses = 0;
      }
    });

    // Hủy toàn bộ đề nghị trao đổi liên quan
    this.state.tradeRequests = this.state.tradeRequests.filter(r =>
      r.fromPlayerId !== player.id && r.toPlayerId !== player.id
    );

    if (creditor) {
      this.addLog(`💀 ${player.name} đã PHÁ SẢN (ĐẦU HÀNG) do nợ ${creditor.name}! Toàn bộ tài sản (${transferredCount} ô đất) đã được chuyển giao cho ${creditor.name}.`);
    } else {
      this.addLog(`💀 ${player.name} đã PHÁ SẢN (ĐẦU HÀNG)! Toàn bộ tài sản bị tịch thu về Ngân hàng.`);
    }

    this.checkGameOver();
    return true;
  }

  surrender(playerId) {
    const p = this.state.players.find(pl => pl.id === playerId);
    if (!p || p.isBankrupt) return false;
    const isCurTurn = (this.state.players[this.state.currentPlayerIndex]?.id === p.id);
    this.declareBankrupt(p, p.lastCreditorId || null);
    if (isCurTurn && !this.state.gameOver) {
      const total = this.state.players.length;
      let next = this.state.currentPlayerIndex;
      for (let i = 0; i < total; i++) {
        next = (next + 1) % total;
        if (!this.state.players[next].isBankrupt) break;
      }
      this.state.currentPlayerIndex = next;
      const nextP = this.getCurrentPlayer();
      if (nextP && !nextP.isBankrupt) {
        nextP.turnCount = (nextP.turnCount || 0) + 1;
        nextP.hasBuiltHouseThisTurn = false;
<<<<<<< HEAD
        nextP.hasBoughtPropertyThisTurn = false;
=======
>>>>>>> 814147eb7059fe1f3a8102216959befd1818b784
        this.addLog(`🔄 Chuyển lượt sang ${nextP.name}`);
      }
    }
    return true;
  }

  checkGameOver() {
    const alive = this.state.players.filter(p => !p.isBankrupt);
    if (alive.length <= 1) {
      this.state.gameOver = true;
      this.state.winner = alive[0] || null;
      // Xóa sạch mọi pending state để game dừng hẳn
      this.state.pendingTile = null;
      this.state.pendingCard = null;
      this.state.auctionState = null;
      this.state.auctionTile = null;
      this.state.tradeRequests = [];
      if (this.state.winner) {
        this.state.winner.finalNetWorth = this.netWorth(this.state.winner);
        this.addLog(`🏆 ${this.state.winner.name} đã CHIẾN THẮNG với tổng tài sản $${this.state.winner.finalNetWorth}!`);
      } else {
        this.addLog(`🤝 Ván chơi kết thúc hoà!`);
      }
    }
  }

  endTurn() {
    if (this.state.gameOver) return false;

    const curPlayer = this.getCurrentPlayer();
    if (curPlayer && !curPlayer.isBankrupt && curPlayer.money < 0) {
      this.addLog(`⚠️ ${curPlayer.name} đang nợ $${Math.abs(curPlayer.money)}! Hãy bán/cầm cố tài sản hoặc đầu hàng trước khi kết thúc lượt.`);
      return false;
    }

    const total = this.state.players.length;
    let next = this.state.currentPlayerIndex;
    for (let i = 0; i < total; i++) {
      next = (next + 1) % total;
      if (!this.state.players[next].isBankrupt) break;
    }
    this.state.currentPlayerIndex = next;
    this.state.extraRollPending = false;
    const p = this.getCurrentPlayer();
    p.turnCount = (p.turnCount || 0) + 1;
    p.hasBuiltHouseThisTurn = false;
<<<<<<< HEAD
    p.hasBoughtPropertyThisTurn = false;
=======
>>>>>>> 814147eb7059fe1f3a8102216959befd1818b784
    this.addLog(`🔄 Chuyển lượt sang ${p.name}`);
    return true;
  }


  createTrade(fromPlayerId, tradeData) {
    const fromPlayer = this.state.players.find(p => p.id === fromPlayerId);
    const toPlayer = this.state.players.find(p => p.id === tradeData.toPlayerId);
    if (!fromPlayer || !toPlayer || fromPlayer.id === toPlayer.id) return null;

    const offerCash = Math.max(0, Number(tradeData.offerCash) || 0);
    const requestCash = Math.max(0, Number(tradeData.requestCash) || 0);
    const offerPropertyIds = Array.isArray(tradeData.offerPropertyIds) ? tradeData.offerPropertyIds : [];
    const requestPropertyIds = Array.isArray(tradeData.requestPropertyIds) ? tradeData.requestPropertyIds : [];
    const offerCardIds = Array.isArray(tradeData.offerCardIds) ? tradeData.offerCardIds : [];
    const requestCardIds = Array.isArray(tradeData.requestCardIds) ? tradeData.requestCardIds : [];

    // Validate properties ownership
    const fromOwns = offerPropertyIds.every(id => {
      const tile = this.state.board.find(t => t.id === id);
      return tile && tile.owner === fromPlayer.id;
    });
    const toOwns = requestPropertyIds.every(id => {
      const tile = this.state.board.find(t => t.id === id);
      return tile && tile.owner === toPlayer.id;
    });

    if (!fromOwns || !toOwns) return null;
    if (fromPlayer.money < offerCash) return null;
    const ownsCards = (player, cardIds) => cardIds.every(cardId => (player.shopCards || []).filter(id => id === cardId).length >= cardIds.filter(id => id === cardId).length);
    if (!ownsCards(fromPlayer, offerCardIds) || !ownsCards(toPlayer, requestCardIds)) return null;

    const req = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      fromPlayerId: fromPlayer.id,
      toPlayerId: toPlayer.id,
      offerCash,
      requestCash,
      offerPropertyIds,
      requestPropertyIds,
      offerCardIds,
      requestCardIds,
      status: 'pending',
      ts: Date.now()
    };

    this.state.tradeRequests.push(req);
    this.addLog(`🤝 ${fromPlayer.name} gửi đề nghị trao đổi cho ${toPlayer.name}`);
    return req;
  }

  acceptTrade(toPlayerId, requestId) {
    const reqIndex = this.state.tradeRequests.findIndex(r => r.id === requestId);
    if (reqIndex === -1) return false;
    const req = this.state.tradeRequests[reqIndex];
    if (req.toPlayerId !== toPlayerId) return false;

    const fromPlayer = this.state.players.find(p => p.id === req.fromPlayerId);
    const toPlayer = this.state.players.find(p => p.id === req.toPlayerId);
    if (!fromPlayer || !toPlayer) return false;

    // Check funds
    if (fromPlayer.money < req.offerCash || toPlayer.money < req.requestCash) {
      this.addLog(`❌ Trao đổi thất bại do không đủ tiền.`);
      this.state.tradeRequests.splice(reqIndex, 1);
      return false;
    }

    // Check properties
    const fromOwns = req.offerPropertyIds.every(id => this.state.board.find(t => t.id === id)?.owner === fromPlayer.id);
    const toOwns = req.requestPropertyIds.every(id => this.state.board.find(t => t.id === id)?.owner === toPlayer.id);
    if (!fromOwns || !toOwns) {
      this.addLog(`❌ Trao đổi thất bại do tài sản đã đổi chủ.`);
      this.state.tradeRequests.splice(reqIndex, 1);
      return false;
    }
    const ownsCards = (player, cardIds) => cardIds.every(cardId => (player.shopCards || []).filter(id => id === cardId).length >= cardIds.filter(id => id === cardId).length);
    if (!ownsCards(fromPlayer, req.offerCardIds || []) || !ownsCards(toPlayer, req.requestCardIds || [])) {
      this.addLog(`❌ Trao đổi thất bại do thẻ bài đã được sử dụng.`);
      this.state.tradeRequests.splice(reqIndex, 1);
      return false;
    }

    // Execute cash transfer
    fromPlayer.money -= req.offerCash;
    toPlayer.money += req.offerCash;
    toPlayer.money -= req.requestCash;
    fromPlayer.money += req.requestCash;

    if (fromPlayer.money >= 0) fromPlayer.lastCreditorId = null;
    if (toPlayer.money >= 0) toPlayer.lastCreditorId = null;

    // Execute property transfer
    req.offerPropertyIds.forEach(id => {
      const tile = this.state.board.find(t => t.id === id);
      if (tile) {
        tile.owner = toPlayer.id;
        tile.lastBuiltPlayerTurn = null;
      }
    });
    req.requestPropertyIds.forEach(id => {
      const tile = this.state.board.find(t => t.id === id);
      if (tile) {
        tile.owner = fromPlayer.id;
        tile.lastBuiltPlayerTurn = null;
      }
    });
    const transferCards = (from, to, cardIds) => {
      from.shopCards = Array.isArray(from.shopCards) ? from.shopCards : [];
      to.shopCards = Array.isArray(to.shopCards) ? to.shopCards : [];
      cardIds.forEach(cardId => {
        const index = from.shopCards.indexOf(cardId);
        if (index >= 0) {
          from.shopCards.splice(index, 1);
          to.shopCards.push(cardId);
        }
      });
    };
    transferCards(fromPlayer, toPlayer, req.offerCardIds || []);
    transferCards(toPlayer, fromPlayer, req.requestCardIds || []);

    this.state.tradeRequests.splice(reqIndex, 1);
    this.addLog(`✅ ${toPlayer.name} đã chấp nhận trao đổi với ${fromPlayer.name}!`);
    return true;
  }

  declineTrade(playerId, requestId) {
    const reqIndex = this.state.tradeRequests.findIndex(r => r.id === requestId);
    if (reqIndex === -1) return false;
    const req = this.state.tradeRequests[reqIndex];
    if (req.toPlayerId !== playerId && req.fromPlayerId !== playerId) return false;

    const fromPlayer = this.state.players.find(p => p.id === req.fromPlayerId);
    const toPlayer = this.state.players.find(p => p.id === req.toPlayerId);
    this.state.tradeRequests.splice(reqIndex, 1);
    this.addLog(`🚫 Đề nghị trao đổi giữa ${fromPlayer?.name || 'P1'} và ${toPlayer?.name || 'P2'} đã bị hủy/từ chối.`);
    return true;
  }
}

function createGame(options = {}) {
  return new GameInstance(options);
}

function applyAction(game, playerIdx, action) {
  if (!game || !action || !action.type) return null;
  const type = action.type;
  const p = game.state.players[playerIdx];
  if (!p) return null;

  switch (type) {
    case 'ROLL_DICE':
      if (game.state.currentPlayerIndex !== playerIdx) return null;
      return game.rollDice(action.steps);

    case 'BUY_PROPERTY':
      if (game.state.currentPlayerIndex !== playerIdx) return null;
      return game.buyPendingProperty();

    case 'SKIP_PROPERTY':
      if (game.state.currentPlayerIndex !== playerIdx) return null;
      return game.skipPendingProperty();

    case 'AUCTION_PROPERTY':
      if (game.state.currentPlayerIndex !== playerIdx) return null;
      return game.auctionPendingProperty();

    case 'APPLY_CARD':
      if (game.state.currentPlayerIndex !== playerIdx) return null;
      return game.applyCardEffect();

    case 'PLACE_BID':
      return game.placeBid(playerIdx, Number(action.amount));

    case 'PASS_BID':
      return game.passBid(playerIdx);

    case 'END_TURN':
      if (game.state.currentPlayerIndex !== playerIdx) return null;
      game.endTurn();
      return true;

    case 'CHOOSE_CROSS_ROUTE':
      if (game.state.currentPlayerIndex !== playerIdx) return null;
      return game.chooseCrossRoute(p, action.useInnerRoute === true);

    case 'PAY_BAIL':
      if (game.state.currentPlayerIndex !== playerIdx) return null;
      return game.payBail();

    case 'BUILD_HOUSE':
      if (game.state.currentPlayerIndex !== playerIdx) return null;
      return game.buildHouse(action.tileId);

    case 'SELL_HOUSE':
      if (game.state.currentPlayerIndex !== playerIdx) return null;
      return game.sellHouse(action.tileId);

    case 'MORTGAGE':
      if (game.state.currentPlayerIndex !== playerIdx) return null;
      return game.mortgageProperty(action.tileId);

    case 'CREATE_TRADE':
      return game.createTrade(p.id, action.trade || {});

    case 'ACCEPT_TRADE':
      return game.acceptTrade(p.id, action.requestId);

    case 'DECLINE_TRADE':
      return game.declineTrade(p.id, action.requestId);

    case 'DECLARE_BANKRUPT':
    case 'SURRENDER':
      return game.surrender(p.id);

    default:
      console.warn(`Hành động không xác định: ${type}`);
      return null;
  }
}

module.exports = {
  createGame,
  applyAction,
  GameInstance
};
