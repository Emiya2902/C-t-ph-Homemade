/**
 * GAME CORE LOGIC - Cờ Tỉ Phú Nhà Làm (Fixed Edition)
 */

window.GameCore = {
  // DANH SÁCH THẺ CƠ HỘI
  chanceCards: [
    { title: "🎁 Trúng Vé Số", text: "Bạn trúng giải khuyến khích vé số kiến thiết!", action: "MONEY", amount: 150 },
    { title: "💸 Phạt Vi Phạm Giao Thông", text: "Bạn đi sai làn đường trên cầu Sài Gòn. Bị phạt $50.", action: "MONEY", amount: -50 },
    { title: "🚀 Xe Bỏ Lượt", text: "Bắt xe ôm công nghệ đi thẳng tới ô Bắt đầu (GO)! Nhận $200.", action: "MOVE_TO", target: 0, getGoBonus: true },
    { title: "🚔 Bị Tống Vào Tù", text: "Bạn bị phát hiện vi phạm pháp luật! Bị tống ngay vào Ô Tù (#10).", action: "GO_TO_JAIL" },
    { title: "🚶 Lầm Đường Lạc Lối", text: "Đường Sài Gòn quá ngoằn ngoèo! Bạn bị đi lùi 3 bước.", action: "MOVE_STEPS", steps: -3 },
    { title: "🎂 Sinh Nhật Bất Ngờ", text: "Đến sinh nhật bạn! Nhận $50 mừng từ người chơi còn lại.", action: "COLLECT_OTHER", amount: 50 }
  ],

  // DANH SÁCH THẺ KHÍ VẬN
  fortuneCards: [
    { title: "🏦 Ngân Hàng Hoàn Thuế", text: "Ngân hàng tính nhầm tiền thuế. Bạn được hoàn lại $100.", action: "MONEY", amount: 100 },
    { title: "🩺 Khám Sức Khỏe", text: "Khám sức khỏe định kỳ tại Bệnh viện Chợ Rẫy. Nộp $50.", action: "MONEY", amount: -50 },
    { title: "🏨 Lợi Nhuận Bất Động Sản", text: "Đất đai tăng giá mạnh! Bạn thu về $120 tiền lời.", action: "MONEY", amount: 120 },
    { title: "⚡ Hóa Đơn Điện Nước", text: "Nộp tiền điện EVN tháng này. Nộp $40.", action: "MONEY", amount: -40 },
    { title: "🎟️ Trúng Thưởng Hội Chợ", text: "Trúng giải thưởng mua sắm tại Phố đi bộ Nguyễn Huệ! Nhận $80.", action: "MONEY", amount: 80 }
  ],

  // CÀI ĐẶT LUẬT CHƠI
  settings: {
    doubleRentOnFullGroup: true,   // Nhân đôi tiền thuê khi sở hữu trọn nhóm
    mortgageInsteadOfSell: true,   // Cầm cố thay vì bán đất
    jackpotOnFreeParking: true,    // Jackpot ở ô Bãi xe tự do
    receiveRentWhileJailed: false, // Vẫn nhận tiền thuê khi ở tù
    auctionMode: false,            // Chế độ đấu giá
    initialMoney: 1500,            // Tiền khởi tạo
    passGoMoney: 200,              // Tiền khi đi qua ô "Bắt đầu"
    playerCount: 2,                // Số người chơi (2 - 8)
    chosenTokens: []               // Nhân vật mỗi người chơi đã chọn
  },

  // TÊN & MÀU MẶC ĐỊNH CHO NGƯỜI CHƠI (tối đa 8 người)
  playerNames: ["Sài Gòn Pro", "Chợ Lớn VIP", "Hà Nội Pro", "Đà Nẵng VIP", "Cần Thơ Pro", "Vũng Tàu VIP", "Huế Pro", "Nha Trang VIP"],
  playerColors: ["#ff4757", "#1e90ff", "#2ed573", "#fdcb6e", "#e84393", "#00b894", "#a29bfe", "#ff9f43"],

  // DANH SÁCH NHÂN VẬT (QUÂN CỜ)
  animalTokens: [
    { name: "Sài Gòn Cá Sấu", emoji: "🐊" },
    { name: "Chợ Lớn Mèo", emoji: "🐱" },
    { name: "Hà Nội Chó", emoji: "🐶" },
    { name: "Đà Nẵng Chim", emoji: "🐦" },
    { name: "Cần Thơ Gấu", emoji: "🐻" },
    { name: "Vũng Tàu Thỏ", emoji: "🐰" },
    { name: "Huế Cá Vàng", emoji: "🐠" },
    { name: "Nha Trang Rùa", emoji: "🐢" }
  ],

  state: {
    players: [],
    currentPlayerIndex: 0,
    board: [],
    pendingTile: null,
    pendingCard: null,
    lastRoll: 0,
    logs: [],
    jackpot: 0,
    auctionTile: null,
    auctionState: null
  },

  configure(options = {}) {
    const s = this.settings;
    if (typeof options.doubleRentOnFullGroup === 'boolean') s.doubleRentOnFullGroup = options.doubleRentOnFullGroup;
    if (typeof options.mortgageInsteadOfSell === 'boolean') s.mortgageInsteadOfSell = options.mortgageInsteadOfSell;
    if (typeof options.jackpotOnFreeParking === 'boolean') s.jackpotOnFreeParking = options.jackpotOnFreeParking;
    if (typeof options.receiveRentWhileJailed === 'boolean') s.receiveRentWhileJailed = options.receiveRentWhileJailed;
    if (typeof options.auctionMode === 'boolean') s.auctionMode = options.auctionMode;
    if (typeof options.initialMoney === 'number' && options.initialMoney > 0) s.initialMoney = options.initialMoney;
    if (typeof options.passGoMoney === 'number' && options.passGoMoney >= 0) s.passGoMoney = options.passGoMoney;
    if (typeof options.playerCount === 'number' && options.playerCount >= 2 && options.playerCount <= 8) s.playerCount = options.playerCount;
    if (Array.isArray(options.chosenTokens)) s.chosenTokens = options.chosenTokens;
  },

  init() {
    const sourceBoard = (typeof BOARD !== 'undefined') ? BOARD : [];
    this.state.board = JSON.parse(JSON.stringify(sourceBoard));
    this.state.currentPlayerIndex = 0;
    this.state.pendingTile = null;
    this.state.pendingCard = null;
    this.state.logs = [];
    this.state.jackpot = 0;
    this.state.auctionTile = null;
    this.state.auctionState = null;

    const count = this.settings.playerCount || 2;
    const chosen = this.settings.chosenTokens || [];
    this.state.players = [];

    for (let i = 0; i < count; i++) {
      const token = chosen[i] || this.animalTokens[i] || { name: this.playerNames[i], emoji: '🎯' };
      this.state.players.push({
        id: i + 1,
        name: this.playerNames[i] || `Người chơi ${i + 1}`,
        color: this.playerColors[i] || '#ffffff',
        tokenName: token.name || this.playerNames[i],
        tokenEmoji: token.emoji || '🎯',
        position: 0,
        money: this.settings.initialMoney,
        inJail: false,
        jailTurns: 0,
        isBankrupt: false
      });
    }

    this.addLog("🎮 Trò chơi bắt đầu!");
    return this.state;
  },

  getCurrentPlayer() {
    return this.state.players[this.state.currentPlayerIndex];
  },

  getOtherPlayer() {
    return this.state.players.find((_, idx) => idx !== this.state.currentPlayerIndex && !this.state.players[idx].isBankrupt) || this.state.players[0];
  },

  getOtherPlayers(p) {
    return this.state.players.filter(x => x.id !== p.id && !x.isBankrupt);
  },

  addLog(msg) {
    this.state.logs.push(msg);
  },

  ownsFullGroup(tile) {
    if (!tile || !tile.group) return false;
    const groupTiles = this.state.board.filter(t => t.group === tile.group);
    return groupTiles.length > 0 && groupTiles.every(t => t.owner === tile.owner);
  },

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
    return rent;
  },

  collectRent(payer, tile) {
    const owner = this.state.players.find(pl => pl.id === tile.owner);
    if (!owner) return 0;
    if (owner.inJail && !this.settings.receiveRentWhileJailed) {
      this.addLog(`🏛️ ${owner.name} đang ở tù nên không thể thu tiền thuê.`);
      return 0;
    }
    const rent = this.calculateRent(tile, owner);
    if (rent <= 0) return 0;
    payer.money -= rent;
    owner.money += rent;
    this.addLog(`💸 ${payer.name} trả $${rent} tiền thuê cho ${owner.name}`);
    return rent;
  },

  startAuction(tile, excludedPlayerId = null) {
    this.state.auctionTile = tile;
    const bidders = this.state.players.filter(p => !p.isBankrupt && p.money > 0 && p.id !== excludedPlayerId);
    if (!bidders.length) {
      this.state.auctionTile = null;
      this.state.auctionState = null;
      this.addLog(`⚪ Không có người chơi đủ điều kiện đấu giá [${tile.name}].`);
      return;
    }
    this.state.auctionState = {
      currentBid: 0,
      highestBidder: null,
      highestBidderIndex: -1,
      active: true,
      round: 0,
      bidders: bidders.map(p => p.id),
      currentBidderIndex: 0,
      passedCount: 0,
      timerDuration: 5,
      timerEnd: Date.now() + 5000
    };

    const currentIdx = bidders.findIndex(b => b.id === this.state.players[this.state.currentPlayerIndex].id);
    if (currentIdx !== -1) {
      this.state.auctionState.currentBidderIndex = (currentIdx + 1) % bidders.length;
    }

    this.addLog(`🔨 Đấu giá ô [${tile.name}]! Giá khởi điểm $0.`);
  },

  getCurrentAuctionBidder() {
    const a = this.state.auctionState;
    if (!a || !a.active) return null;
    const id = a.bidders[a.currentBidderIndex];
    return this.state.players.find(p => p.id === id) || null;
  },

  placeBid(playerIndex, amount) {
    const p = this.state.players[playerIndex];
    const a = this.state.auctionState;
    if (!p || !a || !a.active) return false;
    if (this.getCurrentAuctionBidder()?.id !== p.id) return false;
    if (amount <= a.currentBid) return false;
    if (amount > p.money) return false;

    a.currentBid = amount;
    a.highestBidder = p;
    a.highestBidderIndex = playerIndex;
    a.timerEnd = Date.now() + (a.timerDuration * 1000);
    this.addLog(`🔨 ${p.name} đặt giá $${amount}`);
    this.advanceAuction();
    return true;
  },

  passBid(playerIndex) {
    const a = this.state.auctionState;
    if (!a || !a.active) return false;
    const p = this.state.players[playerIndex];
    if (!p) return false;
    if (this.getCurrentAuctionBidder()?.id !== p.id) return false;

    a.bidders.splice(a.currentBidderIndex, 1);
    a.passedCount++;
    this.addLog(`⏭️ ${p.name} bỏ lượt trong cuộc đấu giá.`);

    if (a.bidders.length <= 0 || (a.bidders.length === 1 && a.highestBidder)) {
      this.endAuction();
      return true;
    }

    if (a.currentBidderIndex >= a.bidders.length) a.currentBidderIndex = 0;
    a.timerEnd = Date.now() + (a.timerDuration * 1000);
    return true;
  },

  advanceAuction() {
    const a = this.state.auctionState;
    if (!a || !a.active) return;
    if (a.bidders.length === 1 && a.highestBidder) {
      this.endAuction();
      return;
    }
    a.currentBidderIndex = (a.currentBidderIndex + 1) % a.bidders.length;
  },

  endAuction() {
    const a = this.state.auctionState;
    const tile = this.state.auctionTile;
    if (!a || !tile) return null;

    if (a.highestBidder && a.currentBid > 0) {
      a.highestBidder.money -= a.currentBid;
      tile.owner = a.highestBidder.id;
      tile.mortgaged = false;
      this.addLog(`🏆 ${a.highestBidder.name} thắng đấu giá [${tile.name}] với $${a.currentBid}!`);
    } else {
      this.addLog(`⭕ Không ai trả giá, ô [${tile.name}] vẫn chưa có chủ.`);
    }

    const result = a.highestBidder ? { winner: a.highestBidder, amount: a.currentBid } : null;
    this.state.auctionTile = null;
    this.state.auctionState = null;
    return result;
  },

  isAuctionActive() {
    return !!(this.state.auctionState && this.state.auctionState.active);
  },

  payBail() {
    const p = this.getCurrentPlayer();
    if (p.inJail && p.money >= 50) {
      p.money -= 50;
      p.inJail = false;
      p.jailTurns = 0;
      this.addLog(`🔓 ${p.name} nộp $50 tiền bảo lãnh và đã RA TÙ!`);
      return true;
    }
    return false;
  },

  rollDice() {
    const p = this.getCurrentPlayer();
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const dice = d1 + d2;
    const isDouble = (d1 === d2);
    this.state.lastRoll = dice;

    const startPos = p.position;

    if (p.inJail) {
      if (isDouble) {
        p.inJail = false;
        p.jailTurns = 0;
        this.addLog(`🎲 ${p.name} gieo được đôi (${d1}-${d2}) -> 🔓 RA TÙ MIỄN PHÍ và di chuyển ${dice} bước!`);
      } else {
        p.jailTurns += 1;
        if (p.jailTurns >= 3) {
          p.money -= 50;
          p.inJail = false;
          p.jailTurns = 0;
          this.addLog(`🎲 ${p.name} gieo (${d1}-${d2}). Đã hết 3 lượt tù -> 🏛️ Trừ $50 bảo lãnh bắt buộc và đi ${dice} bước!`);
        } else {
          this.addLog(`🔒 ${p.name} gieo (${d1}-${d2}), không phải đôi. Tiếp tục ở trong tù (${p.jailTurns}/3 lượt).`);
          return { action: "STAY_IN_JAIL", startPos, dice: 0 };
        }
      }
    } else {
      this.addLog(`🎲 ${p.name} gieo được ${dice} điểm (${d1} + ${d2})`);
    }

    const oldPos = p.position;
    p.position = (p.position + dice) % 40;

    if (p.position < oldPos && !p.inJail) {
      const goBonus = this.settings.passGoMoney;
      p.money += goBonus;
      this.addLog(`💵 ${p.name} qua ô Bắt đầu (+ $${goBonus})`);
    }

    return this.processTileLanding(p, { startPos, dice });
  },

  processTileLanding(p, info = {}) {
    const tile = this.state.board[p.position];
    if (!tile) return { action: "END_ROLL", tile: null, ...info };

    // 1. Ô VÀO TÙ
    if (p.position === 30 || tile.type === "GOTO_JAIL") {
      p.position = 10;
      p.inJail = true;
      p.jailTurns = 0;
      this.addLog(`🚔 ${p.name} đỗ vào ô [Vào Tù]! Bị tống ngay vào Ô Tù (#10).`);
      return { action: "GO_TO_JAIL", tile, ...info };
    }

    // 2. Ô CƠ HỘI & KHÍ VẬN
    const tileName = tile.name ? tile.name.toLowerCase() : "";
    const tileType = tile.type ? tile.type.toUpperCase() : "";

    const isChance = tileType === "CHANCE" || tileType === "CO_HOI" || tileName.includes("cơ hội");
    const isFortune = tileType === "FORTUNE" || tileType === "KHI_VAN" || tileType === "COMMUNITY" || tileName.includes("khí vận");

    if (isChance || isFortune) {
      const deck = isChance ? this.chanceCards : this.fortuneCards;
      const card = deck[Math.floor(Math.random() * deck.length)];
      this.state.pendingCard = { ...card, type: isChance ? "CƠ HỘI" : "KHÍ VẬN" };
      return { action: "DRAW_CARD", card: this.state.pendingCard, ...info };
    }

    // 3. Ô THUẾ
    if (p.position === 4 || tileType === "TAX") {
      const taxAmount = p.position === 4 ? Math.round(p.money * 0.10) : 100;
      p.money -= taxAmount;
      if (this.settings.jackpotOnFreeParking) {
        this.state.jackpot += taxAmount;
      }
      this.addLog(`💸 ${p.name} đỗ vào [${tile.name || "Thuế"}] -> Nộp $${taxAmount}`);
      return { action: "PAID_TAX", taxAmount, ...info };
    }

    // 4. Ô BÃI XE TỰ DO (JACKPOT)
    if (p.position === 20 || tileType === "FREE_PARKING") {
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
      if (tile.owner === null || tile.owner === undefined) {
        if (p.money >= tile.price) {
          this.state.pendingTile = tile;
          return { action: "PROMPT_BUY", tile, ...info };
        } else {
          this.addLog(`💡 ${p.name} đỗ vào [${tile.name}] nhưng không đủ $${tile.price} để mua.`);
          if (this.settings.auctionMode) {
            this.startAuction(tile);
            return { action: "AUCTION", tile, ...info };
          }
        }
      } else if (tile.owner !== p.id) {
        if (tile.mortgaged) {
          this.addLog(`🏦 [${tile.name}] đang bị cầm cố nên ${p.name} không phải trả tiền thuê.`);
          return { action: "END_ROLL", tile, ...info };
        }
        // Gọi hàm thu tiền thuê chuẩn xác
        this.collectRent(p, tile);
      }
    }

    return { action: "END_ROLL", tile, ...info };
  },

  applyCardEffect() {
    const card = this.state.pendingCard;
    if (!card) return null;

    const p = this.getCurrentPlayer();
    this.addLog(`🎴 ${p.name} rút thẻ [${card.type}]: ${card.title}`);

    if (card.action === "MONEY") {
      p.money += card.amount;
      this.addLog(`  -> ${p.name} ${card.amount >= 0 ? '+' : ''}$${card.amount}`);
    } else if (card.action === "COLLECT_OTHER") {
      const others = this.getOtherPlayers(p);
      let totalCollected = 0;
      others.forEach(other => {
        other.money -= card.amount;
        totalCollected += card.amount;
      });
      p.money += totalCollected;
      this.addLog(`  -> ${p.name} nhận $${card.amount} từ mỗi người chơi (Tổng nhận: $${totalCollected})`);
    } else if (card.action === "GO_TO_JAIL") {
      p.position = 10;
      p.inJail = true;
      p.jailTurns = 0;
      this.addLog(`  -> ${p.name} bị áp giải vào Tù (#10)!`);
    } else if (card.action === "MOVE_TO") {
      p.position = card.target;
      if (card.getGoBonus) p.money += this.settings.passGoMoney;
      this.addLog(`  -> ${p.name} di chuyển đến ô #${card.target}`);
    } else if (card.action === "MOVE_STEPS") {
      p.position = (p.position + card.steps + 40) % 40;
      this.addLog(`  -> ${p.name} dịch chuyển ${card.steps} bước (về ô #${p.position})`);
    }

    const resultCard = { ...card, finalPos: p.position };

    if (card.action === "MOVE_TO" || card.action === "MOVE_STEPS") {
      resultCard.landing = this.processTileLanding(p, { startPos: card.finalPos });
    }

    this.state.pendingCard = null;
    return resultCard;
  },

  buyPendingProperty() {
    const p = this.getCurrentPlayer();
    const tile = this.state.pendingTile;
    if (tile && p.money >= tile.price) {
      p.money -= tile.price;
      tile.owner = p.id;
      this.addLog(`🛒 ${p.name} mua [${tile.name}] (-$${tile.price})`);
      this.state.pendingTile = null;
      return true;
    }
    return false;
  },

  skipPendingProperty() {
    const p = this.getCurrentPlayer();
    const tile = this.state.pendingTile;
    if (tile) {
      this.addLog(`⏭️ ${p.name} BỎ QUA không mua [${tile.name}]`);
      if (this.settings.auctionMode) {
        this.startAuction(tile);
      }
    }
    this.state.pendingTile = null;
  },

  buildHouse(index) {
    const p = this.getCurrentPlayer();
    const tile = this.state.board[index];
    if (!tile || tile.owner !== p.id || tile.type !== "PROPERTY") return false;

    const houses = tile.houses || 0;
    if (houses >= 5) return false;

    const houseCost = tile.housePrice || Math.round((tile.price || 100) * 0.75);
    if (p.money < houseCost) return false;

    p.money -= houseCost;
    tile.houses = houses + 1;

    const isHotel = tile.houses === 5;
    this.addLog(`🏠 ${p.name} ${isHotel ? 'xây khách sạn' : 'xây nhà'} tại [${tile.name}] (-$${houseCost})`);
    return true;
  },

  sellHouse(index) {
    const p = this.getCurrentPlayer();
    const tile = this.state.board[index];
    if (!tile || tile.owner !== p.id || tile.type !== "PROPERTY") return false;

    const houses = tile.houses || 0;
    if (houses <= 0) return false;

    const houseCost = tile.housePrice || Math.round((tile.price || 100) * 0.75);
    const refund = Math.round(houseCost / 2);

    p.money += refund;
    tile.houses = houses - 1;

    this.addLog(`📉 ${p.name} dỡ bớt 1 nhà tại [${tile.name}] (+$${refund})`);
    return true;
  },

  mortgageProperty(index) {
    const p = this.getCurrentPlayer();
    const tile = this.state.board[index];
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
      this.addLog(`🏦 ${p.name} cầm cố [${tile.name}] (+$${value}) — đất vẫn thuộc về ${p.name}`);
      return true;
    }

    p.money += value;
    tile.owner = null;
    tile.houses = 0;
    tile.mortgaged = false;
    this.addLog(`🏦 ${p.name} bán hẳn [${tile.name}] (+$${value})`);
    return true;
  },

  endTurn() {
    const total = this.state.players.length;
    let next = this.state.currentPlayerIndex;
    for (let i = 0; i < total; i++) {
      next = (next + 1) % total;
      if (!this.state.players[next].isBankrupt) break;
    }
    this.state.currentPlayerIndex = next;
    const p = this.getCurrentPlayer();
    this.addLog(`🔄 Chuyển lượt sang ${p.name}`);
  }
};
