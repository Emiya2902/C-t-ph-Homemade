/**
 * GAME CORE LOGIC - Cờ Tỉ Phú Nhà Làm (Fixed Edition)
 */

window.GameCore = {
  // DANH SÁCH THẺ CƠ HỘI (15 THẺ)
  chanceCards: [
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
    { title: "⚡ Trúng Thầu Dự Án", text: "Trúng gói thầu công trình xanh, nhận ngay $100 tiền thưởng.", action: "MONEY", amount: 100 },
    { title: "❄️ Đóng Băng Đất Địch", text: "Đóng băng ô đất đắt nhất của đối thủ trong 2 lượt.", action: "FREEZE_ENEMY_TILE" },
    { title: "🛡️ Bảo Vệ Lãnh Địa", text: "Bảo vệ ô đất của bạn khỏi phá nhà và tráo đất trong 2 lượt.", action: "PROTECT_MY_LAND" },
    { title: "🔥 Tăng Giá Thuê", text: "Tăng 1.5x tiền thuê ô đất đắt nhất của bạn trong 2 lượt.", action: "BOOST_RENT_TEMP" },
    { title: "🏠 Nâng Cấp Miễn Phí", text: "Nâng miễn phí một cấp nhà trên ô đất rẻ nhất của bạn.", action: "UPGRADE_MY_TILE" },
    { title: "📉 Phá Nhà Địch", text: "Hạ một cấp nhà trên ô đất đắt nhất của người giàu nhất.", action: "DEMOLISH_ENEMY_HOUSE" }
  ],

  // DANH SÁCH THẺ KHÍ VẬN (15 THẺ)
  fortuneCards: [
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
    { title: "📦 Cổ Tức Định Kỳ", text: "Nhận tiền chia cổ tức kinh doanh cuối quý $70.", action: "MONEY", amount: 70 },
    { title: "❄️ Đóng Băng Đất Địch", text: "Đóng băng ô đất đắt nhất của đối thủ trong 2 lượt.", action: "FREEZE_ENEMY_TILE" },
    { title: "🛡️ Bảo Vệ Lãnh Địa", text: "Bảo vệ ô đất của bạn khỏi phá nhà và tráo đất trong 2 lượt.", action: "PROTECT_MY_LAND" },
    { title: "🔥 Tăng Giá Thuê", text: "Tăng 1.5x tiền thuê ô đất đắt nhất của bạn trong 2 lượt.", action: "BOOST_RENT_TEMP" },
    { title: "🏠 Nâng Cấp Miễn Phí", text: "Nâng miễn phí một cấp nhà trên ô đất rẻ nhất của bạn.", action: "UPGRADE_MY_TILE" },
    { title: "📉 Phá Nhà Địch", text: "Hạ một cấp nhà trên ô đất đắt nhất của người giàu nhất.", action: "DEMOLISH_ENEMY_HOUSE" }
  ],

  // CÀI ĐẶT LUẬT CHƠI
  settings: {
    doubleRentOnFullGroup: true,   // Nhân đôi tiền thuê khi sở hữu trọn nhóm
    mortgageInsteadOfSell: true,   // Cầm cố thay vì bán đất
    jackpotOnFreeParking: true,    // Jackpot ở ô Bãi xe tự do
    receiveRentWhileJailed: false, // Vẫn nhận tiền thuê khi ở tù
    auctionMode: false,            // Chế độ đấu giá
    freeBuildOnFullGroup: false,   // Đủ trọn bộ màu mới được nâng nhà tự do (chưa đủ không cho mua)
    boardMode: 'standard',         // Chế độ bản đồ: 'standard' (40 ô) | 'cross' (57 ô)
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
    { name: "Cá Sấu", emoji: "🐊" },
    { name: "Mèo", emoji: "🐱" },
    { name: "Chó", emoji: "🐶" },
    { name: "Chim", emoji: "🐦" },
    { name: "Gấu", emoji: "🐻" },
    { name: "Thỏ", emoji: "🐰" },
    { name: "Cá Vàng", emoji: "🐠" },
    { name: "Rùa", emoji: "🐢" }
  ],

  centerBuffTypes: [
    'TRIPLE_AEGIS_SHIELD',
    'MIDAS_EMPIRE',
    'GOD_DICE',
    'GLOBAL_TOLL_KING',
    'DISCOUNT_50'
  ],

  state: {
    players: [],
    currentPlayerIndex: 0,
    board: [],
    pendingTile: null,
    pendingCard: null,
    lastRoll: 0,
    lastDice: [1, 1],
    extraRollPending: false,
    logs: [],
    jackpot: 0,
    auctionTile: null,
    auctionState: null,
    tradeRequests: [],
    gameOver: false,
    winner: null,
    weather: 'CLEAR', weatherTurns: 0, weatherMoveBonus: 0, canBuild: true,
    crossRoute: null,
    crossRouteChoice: null,
    pendingCrossRouteRoll: null
  },

  updateTurnCounters(gameState = this.state) {
    if (gameState.weatherTurns > 0) gameState.weatherTurns -= 1;
    if (gameState.weatherTurns <= 0) { gameState.weather = 'CLEAR'; gameState.canBuild = true; gameState.weatherTurns = 0; gameState.weatherMoveBonus = 0; }
    (gameState.board || []).forEach(tile => ['frozenTurns', 'protectedTurns', 'boostTurns'].forEach(key => {
      if (tile[key] > 0) tile[key] -= 1;
      if (tile[key] <= 0) delete tile[key];
    }));
    (gameState.players || []).forEach(player => {
      if (player.reverseTurns > 0) player.reverseTurns -= 1;
      if (!player.reverseTurns) player.moveDirection = 1;
      ['godDiceTurns', 'globalTollTurns'].forEach(key => {
        if (player[key] > 0) player[key] -= 1;
        if (player[key] <= 0) delete player[key];
      });
    });
    window.GameEnhancements?.renderWeatherUI?.(gameState);
    return gameState;
  },

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

    window.GameEnhancements?.renderWeatherUI?.(gameState);

    return effect;
  },

  configure(options = {}) {
    const s = this.settings;
    if (typeof options.doubleRentOnFullGroup === 'boolean') s.doubleRentOnFullGroup = options.doubleRentOnFullGroup;
    if (typeof options.mortgageInsteadOfSell === 'boolean') s.mortgageInsteadOfSell = options.mortgageInsteadOfSell;
    if (typeof options.jackpotOnFreeParking === 'boolean') s.jackpotOnFreeParking = options.jackpotOnFreeParking;
    if (typeof options.receiveRentWhileJailed === 'boolean') s.receiveRentWhileJailed = options.receiveRentWhileJailed;
    if (typeof options.auctionMode === 'boolean') s.auctionMode = options.auctionMode;
    if (typeof options.freeBuildOnFullGroup === 'boolean') s.freeBuildOnFullGroup = options.freeBuildOnFullGroup;
    if (typeof options.boardMode === 'string') s.boardMode = options.boardMode;
    if (typeof options.initialMoney === 'number' && options.initialMoney > 0) s.initialMoney = options.initialMoney;
    if (typeof options.passGoMoney === 'number' && options.passGoMoney >= 0) s.passGoMoney = options.passGoMoney;
    if (typeof options.playerCount === 'number' && options.playerCount >= 2 && options.playerCount <= 8) s.playerCount = options.playerCount;
    if (Array.isArray(options.chosenTokens)) s.chosenTokens = options.chosenTokens;
  },

  init() {
    // Chọn bàn cờ theo boardMode: cross dùng BOARD_CROSS (57 ô), standard dùng BOARD (40 ô)
    const isCrossMode = (this.settings.boardMode === 'cross');
    let sourceBoard;
    if (isCrossMode && typeof BOARD_CROSS !== 'undefined' && Array.isArray(BOARD_CROSS) && BOARD_CROSS.length > 40) {
      sourceBoard = BOARD_CROSS;
    } else {
      sourceBoard = (typeof BOARD !== 'undefined') ? BOARD : [];
    }
    this.state.board = JSON.parse(JSON.stringify(sourceBoard));
    this.state.currentPlayerIndex = 0;
    this.state.pendingTile = null;
    this.state.pendingCard = null;
    this.state.logs = [];
    this.state.lastDice = [1, 1];
    this.state.extraRollPending = false;
    this.state.jackpot = 0;
    this.state.auctionTile = null;
    this.state.auctionState = null;
    this.state.tradeRequests = [];
    this.state.gameOver = false;
    this.state.winner = null;
    this.state.crossRoute = null;
    this.state.crossRouteChoice = null;
    this.state.pendingCrossRouteRoll = null;

    const count = this.settings.playerCount || 2;
    const chosen = this.settings.chosenTokens || [];
    const rawPlayers = [];

    for (let i = 0; i < count; i++) {
      const defaultToken = this.animalTokens[i % this.animalTokens.length] || { name: this.playerNames[i], emoji: '🐊' };
      const token = (chosen && chosen[i] && chosen[i].emoji) ? chosen[i] : defaultToken;
      rawPlayers.push({
        name: this.playerNames[i] || `Người chơi ${i + 1}`,
        tokenName: token.name || defaultToken.name,
        tokenEmoji: token.emoji || defaultToken.emoji
      });
    }

    // 🎲 Random thứ tự lượt chơi (Fisher-Yates Shuffle)
    for (let i = rawPlayers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rawPlayers[i], rawPlayers[j]] = [rawPlayers[j], rawPlayers[i]];
    }

    // Gán thứ tự P1..PN (id: 1..N) theo thứ tự gieo xúc xắc
    this.state.players = rawPlayers.map((rp, i) => ({
      id: i + 1,
      name: rp.name,
      color: this.playerColors[i] || '#ffffff',
      tokenName: rp.tokenName,
      tokenEmoji: rp.tokenEmoji,
      position: 0,
      money: this.settings.initialMoney,
      inJail: false,
      jailTurns: 0,
      isBankrupt: false,
      turnCount: i === 0 ? 1 : 0,
      hasBuiltHouseThisTurn: false,
      lastCreditorId: null,
      hasShield: false,
      shieldCharges: 0,
      midasCharges: 0,
      godDiceTurns: 0,
      globalTollTurns: 0,
      hasDiscount: false,
      shopCards: []
    }));

    this.state.currentPlayerIndex = 0;
    const firstPlayer = this.state.players[0];

    this.addLog("🎮 Trò chơi Cờ Tỉ Phú bắt đầu!");
    if (firstPlayer) {
      this.addLog(`🎲 Thứ tự ngẫu nhiên: ${firstPlayer.tokenEmoji || ''} ${firstPlayer.name} (P1) gieo xúc xắc đầu tiên!`);
    }
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

  grantTripleShield(player) {
    if (!player) return false;
    player.shieldCharges = 3;
    player.hasShield = player.shieldCharges > 0;
    this.addLog(`🛡️ ${player.name} nhận Khiên Tối Thượng (${player.shieldCharges}/3 lần chặn).`);
    window.GameEnhancements?.showEffectToast?.(`🛡️ ${player.name} nhận Khiên Tối Thượng ${player.shieldCharges}/3!`, 'success');
    return player.shieldCharges;
  },

  interceptAttack(attacker, targetPlayer, attackPayload = {}) {
    if (!targetPlayer) return false;
    if ((Number(targetPlayer.shieldCharges) || 0) <= 0 && targetPlayer.hasShield) targetPlayer.shieldCharges = 1;
    if (targetPlayer.shieldCharges <= 0) return false;
    targetPlayer.shieldCharges -= 1;
    targetPlayer.hasShield = targetPlayer.shieldCharges > 0;
    const message = `🛡️ ${targetPlayer.name} đã chặn đứng đòn tấn công! (Còn ${targetPlayer.shieldCharges}/3 lần khiên)`;
    this.addLog(message);
    window.GameEnhancements?.showEffectToast?.(message, 'success');
    return true;
  },

  activateCenterBuff(player) {
    const buff = this.centerBuffTypes[Math.floor(Math.random() * this.centerBuffTypes.length)];
    const totalPlayers = this.state.players.length;
    player.shieldCharges = 0;
    player.hasShield = false;
    player.midasCharges = 0;
    player.godDiceTurns = 0;
    player.globalTollTurns = 0;
    player.hasDiscount = false;
    player.activeCenterBuff = buff;
    switch (buff) {
      case 'TRIPLE_AEGIS_SHIELD':
        player.shieldCharges = 3;
        player.hasShield = true;
        break;
      case 'MIDAS_EMPIRE':
        player.midasCharges = 3;
        break;
      case 'GOD_DICE':
        player.godDiceTurns = 2;
        break;
      case 'GLOBAL_TOLL_KING':
        player.globalTollTurns = totalPlayers * 2;
        break;
      case 'DISCOUNT_50':
        player.hasDiscount = true;
        break;
      default:
        break;
    }
    const labels = {
      TRIPLE_AEGIS_SHIELD: `🛡️ Khiên Tối Thượng (3 lần chặn)`,
      MIDAS_EMPIRE: `👑 Đế Chế Midas (3 nhà)`,
      GOD_DICE: `🎯 Quyền Năng Thượng Đế (3 lượt)`,
      GLOBAL_TOLL_KING: `💸 Hoàng Tộc Thu Phí (${totalPlayers * 2} lượt)`,
      DISCOUNT_50: `🏷️ Phiếu Giảm Giá 50%`
    };
    const message = `✨ ${player.name} nhận buff ${labels[buff]}!`;
    this.addLog(message);
    window.GameEnhancements?.showEffectToast?.(message, 'success');
    return buff;
  },

  getActiveBuffLabel(player) {
    if (!player) return '';
    const labels = {
      TRIPLE_AEGIS_SHIELD: `🛡️ ${player.shieldCharges || 0}/3`,
      MIDAS_EMPIRE: `👑 Midas ${player.midasCharges || 0} nhà`,
      GOD_DICE: `🎯 Thần Dice ${player.godDiceTurns || 0}`,
      GLOBAL_TOLL_KING: `💸 Thu phí ${player.globalTollTurns || 0}`,
      DISCOUNT_50: '🏷️ Giảm 50%'
    };
    return labels[player.activeCenterBuff] || '';
  },

  processMovementPasses(player, movementPath = []) {
    movementPath.forEach(position => {
      const tile = this.state.board[position];
      if (!tile) return;

      if (player.midasCharges > 0 && tile.owner === player.id && tile.type === 'PROPERTY') {
        const previousHouses = tile.houses || 0;
        if (previousHouses < 5) {
          tile.houses = previousHouses + 1;
          player.midasCharges -= 1;
          if (player.midasCharges <= 0) delete player.midasCharges;
          this.addLog(`👑 ${player.name} đi qua [${tile.name}] và nâng nhà miễn phí lên cấp ${tile.houses}.`);
        }
      }

      if (tile.owner && tile.owner !== player.id) {
        this.state.players.forEach(holder => {
          if (holder.id === player.id || holder.globalTollTurns <= 0) return;
          player.money -= 20;
          holder.money += 20;
          this.addLog(`💸 ${player.name} trả $20 phí đường cho ${holder.name} khi đi qua [${tile.name}].`);
        });
      }
    });
  },

  isBuildableProperty(tile) {
    return !!(tile && tile.type === 'PROPERTY' && tile.group && tile.price > 0);
  },

  getCrossRoute(station) {
    if (this.state.board.length <= 40) return null;
    const routes = {
      5: [48, 47, 46, 45, 44, 52, 51, 50, 49, 15],
      15: [49, 50, 51, 52, 44, 43, 42, 41, 40, 25],
      25: [40, 41, 42, 43, 44, 53, 54, 55, 56, 35],
      35: [56, 55, 54, 53, 44, 45, 46, 47, 48, 5]
    };
    return routes[station] || null;
  },

  getMovementPath(player, steps) {
    const path = [];
    let remaining = steps;
    let position = player.position;
    let crossedToStation = false;

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
      if (cursor >= route.length - 1) {
        this.state.crossRoute = null;
        crossedToStation = true;
      }
    }

    while (remaining > 0) {
      const direction = player.moveDirection === -1 ? -1 : 1;
      position = (position + direction + 40) % 40;
      path.push(position);
      remaining -= 1;
    }

    return { path, position, crossedToStation };
  },

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
    this.processMovementPasses(player, movement.path);
    return { ...this.processTileLanding(player, {
      startPos: pendingRoll.startPos,
      dice: pendingRoll.dice,
      movementPath: movement.path
    }), playerId: player.id };
  },

  addLog(msg) {
    this.state.logs.push(msg);
  },

  ownsFullGroup(tile) {
    if (!tile || !tile.group) return false;
    const groupTiles = this.state.board.filter(t => t.group === tile.group);
    return groupTiles.length > 0 && groupTiles.every(t => t.owner === tile.owner && !t.mortgaged);
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

    // Nếu ô bị đóng băng, không thu tiền thuê
    if (tile.frozenTurns && tile.frozenTurns > 0) return 0;

    // Nếu ô được bảo vệ, không thu tiền thuê
    if (tile.protectedTurns && tile.protectedTurns > 0) return 0;

    // Áp dụng boost (tăng 1.5x)
    if (tile.boostTurns && tile.boostTurns > 0) {
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

    if (payer.midasCharges > 0) {
      this.addLog(`👑 ${payer.name} dùng Đế Chế Midas và được miễn $${rent} tiền thuê cho ${owner.name}.`);
      return 0;
    }

    if (this.interceptAttack(owner, payer, { type: 'RENT', tile })) {
      return 0;
    }

    payer.money -= rent;
    owner.money += rent;
    if (payer.money < 0) {
      payer.lastCreditorId = owner.id;
      this.addLog(`💸 ${payer.name} trả tiền thuê cho ${owner.name} và đang nợ $${Math.abs(payer.money)}! Hãy bán/cầm cố tài sản trước khi kết thúc lượt.`);
    } else {
      payer.lastCreditorId = null;
      this.addLog(`💸 ${payer.name} trả $${rent} tiền thuê cho ${owner.name}`);
    }
    return rent;
  },

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
      timerDuration: 5,
      timerEnd: Date.now() + 5000,
      excludedPlayerId: excludedPlayerId
    };
    this.addLog(`🔨 Đấu giá ô [${tile.name}]! Giá khởi điểm $0. Ai trả giá cao nhất sau 5s sẽ thắng!`);
    return true;
  },

  getCurrentAuctionBidder() {
    // Free-for-all: không có khái niệm "đến lượt" — trả về null (tất cả đều có thể bid)
    return null;
  },

  // Bất kỳ người chơi nào đủ điều kiện đều có thể placeBid bất lúc nào
  placeBid(playerIndex, amount) {
    const p = this.state.players[playerIndex];
    const a = this.state.auctionState;
    if (!p || !a || !a.active) return false;
    // Kiểm tra người này có được phép tham gia không
    if (!a.eligibleIds || !a.eligibleIds.includes(p.id)) return false;
    if (p.isBankrupt) return false;
    // Phải cao hơn bid hiện tại
    if (amount <= a.currentBid) return false;
    // Không được vượt quá túi tiền
    if (amount > p.money) return false;

    a.currentBid = amount;
    a.highestBidder = p;
    a.highestBidderIndex = playerIndex;
    // Reset timer 5s từ lúc đặt giá mới nhất
    a.timerEnd = Date.now() + (a.timerDuration * 1000);
    this.addLog(`🔨 ${p.tokenEmoji || ''} ${p.name} đặt giá $${amount}!`);
    return true;
  },

  // Không còn hàm passBid theo lượt; timer hết là kết thúc tự động
  passBid(playerIndex) {
    return false; // Không dùng trong chế độ free-for-all
  },

  advanceAuction() {
    // Không dùng trong chế độ free-for-all
  },

  endAuction() {
    const a = this.state.auctionState;
    const tile = this.state.auctionTile;
    if (!a || !tile) return null;

    if (a.highestBidder && a.currentBid > 0) {
      a.highestBidder.money -= a.currentBid;
      tile.owner = a.highestBidder.id;
      tile.mortgaged = false;
      tile.lastBuiltPlayerTurn = null;
      this.addLog(`🏆 ${a.highestBidder.tokenEmoji || ''} ${a.highestBidder.name} thắng đấu giá [${tile.name}] với $${a.currentBid}!`);
    } else {
      this.addLog(`⭕ Không ai trả giá, ô [${tile.name}] vẫn chưa có chủ.`);
    }

    const result = a.highestBidder ? { winner: a.highestBidder, amount: a.currentBid } : null;
    this.state.auctionTile = null;
    this.state.auctionState = null;
    this.state.pendingTile = null;
    return result;
  },

  // Kiểm tra xem timer đã hết chưa (dùng để tự động kết thúc offline)
  checkAuctionTimeout() {
    const a = this.state.auctionState;
    if (!a || !a.active) return false;
    if (Date.now() >= a.timerEnd) {
      this.endAuction();
      return true;
    }
    return false;
  },

  isAuctionActive() {
    return !!(this.state.auctionState && this.state.auctionState.active);
  },

  payBail() {
    const p = this.getCurrentPlayer();
    if (p.inJail && p.money >= 100) {
      p.money -= 100;
      p.inJail = false;
      p.jailTurns = 0;
      p.jailRolls = 0;
      this.addLog(`🔓 ${p.name} nộp $100 tiền bảo lãnh và đã RA TÙ! Không được đi tiếp lượt này.`);
      return true;
    }
    return false;
  },

  rollDice(stepsOverride = null) {
    const p = this.getCurrentPlayer();
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const hasGodDice = p.godDiceTurns > 0 && Number.isFinite(Number(stepsOverride));
    const dice = hasGodDice ? Math.max(1, Math.min(12, Math.floor(Number(stepsOverride)))) : d1 + d2;
    const isDouble = !hasGodDice && (d1 === d2);
    const earnsExtraRoll = isDouble || (d1 === 6 && d2 === 1) || (d1 === 1 && d2 === 6);
    this.state.lastRoll = dice;
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
    }

    this.state.extraRollPending = earnsExtraRoll;

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

    const oldPos = p.position;
    const movement = this.getMovementPath(p, dice + (this.state.weatherMoveBonus || 0));
    p.position = movement.position;
    this.processMovementPasses(p, movement.path);

    if (movement.path.some((position, index) => position < 40 && position < (movement.path[index - 1] ?? oldPos)) && !p.inJail) {
      const goBonus = this.settings.passGoMoney;
      p.money += goBonus;
      this.addLog(`💵 ${p.name} qua ô Bắt đầu (+ $${goBonus})`);
    }

    const result = this.processTileLanding(p, { startPos, dice, movementPath: movement.path });
    const landedOnStation = movement.path.every(position => position < 40) && [5, 15, 25, 35].includes(p.position);
    const crossRoute = landedOnStation ? this.getCrossRoute(p.position) : null;
    if (crossRoute) {
      this.state.crossRouteChoice = { playerId: p.id, station: p.position, path: crossRoute };
      result.crossRouteChoice = { from: p.position, to: crossRoute[crossRoute.length - 1] };
      this.addLog(`🚉 ${p.name} đáp đúng ga #${p.position}. Hãy chọn đường trong hoặc vòng ngoài cho lượt kế tiếp.`);
    }
    if (result.action === "GO_TO_JAIL") {
      result.playerId = p.id;
      result.turnEnded = true;
      this.endTurn();
    }
    return result;
  },

  processTileLanding(p, info = {}) {
    const tile = this.state.board[p.position];
    if (!tile) return { action: "END_ROLL", tile: null, ...info };

    if (tile.isCenterHub || tile.id === 44) {
      this.activateCenterBuff(p);
    }

    if (p.isGhosting) {
      p.isGhosting = false;
      this.addLog(`👻 ${p.name} đi xuyên qua [${tile.name}] mà không kích hoạt hiệu ứng.`);
      return { action: "END_ROLL", tile, ghosted: true, ...info };
    }

    if (tile.trap === 'SLIDE_OIL') {
      if (this.interceptAttack(null, p, { type: 'TRAP', tile })) {
        delete tile.trap;
        return { action: "END_ROLL", tile, blocked: true, ...info };
      }
      delete tile.trap;
      p.position = (p.position + 3) % this.state.board.length;
      this.addLog(`🛢️ ${p.name} dẫm bẫy dầu tại [${tile.name}] và trượt thêm 3 ô.`);
      return this.processTileLanding(p, { ...info, slidFrom: tile.id });
    }

    // 1. Ô VÀO TÙ
    if (p.position === 30 || tile.type === "GOTO_JAIL") {
      p.position = 10;
      p.inJail = true;
      p.jailTurns = 0;
      p.jailRolls = 0;
      this.state.extraRollPending = false;
      this.addLog(`🚔 ${p.name} đỗ vào ô [Vào Tù]! Bị tống ngay vào Ô Tù (#10).`);
      return { action: "GO_TO_JAIL", tile, ...info };
    }

    if (tile.type === 'UTILITY' || tile.name === 'Trạm Dự Báo Thời Tiết') {
      this.triggerWeatherEffect(this.state);
      return { action: 'WEATHER_CHANGE', weather: this.state.weather, weatherTurns: this.state.weatherTurns, tile, ...info };
    }

    // 2. Ô CƠ HỘI & KHÍ VẬN
    const tileName = tile.name ? tile.name.toLowerCase() : "";
    const tileType = tile.type ? tile.type.toUpperCase() : "";

    if (tileType === "SHOP") {
      return { action: "OPEN_SHOP", tile, ...info };
    }

    const isChance = tileType === "CHANCE" || tileType === "CO_HOI" || tileName.includes("cơ hội");
    const isFortune = tileType === "FORTUNE" || tileType === "KHI_VAN" || tileType === "COMMUNITY" || tileName.includes("khí vận");

    if (isChance || isFortune) {
      const deck = isChance ? this.chanceCards : this.fortuneCards;
      const card = deck[Math.floor(Math.random() * deck.length)];
      this.state.pendingCard = { ...card, type: isChance ? "CƠ HỘI" : "KHÍ VẬN" };
      return { action: "DRAW_CARD", card: this.state.pendingCard, ...info };
    }

    // 3. Ô THUẾ — Luôn tích tiền vào jackpot pool (bất kể setting)
    if (p.position === 4 || tileType === "TAX") {
      const taxAmount = p.position === 4 ? Math.round(p.money * 0.10) : 100;
      if (this.interceptAttack(null, p, { type: 'TAX', tile })) {
        return { action: "PAID_TAX", taxAmount: 0, jackpot: this.state.jackpot, ...info };
      }
      p.money -= taxAmount;
      // Luôn tích vào jackpot pool (xả ở bãi xe tùy setting)
      this.state.jackpot = (this.state.jackpot || 0) + taxAmount;
      this.addLog(`💸 ${p.name} đỗ vào [${tile.name || "Thuế"}] -> Nộp $${taxAmount} (Jackpot pool: $${this.state.jackpot})`);
      return { action: "PAID_TAX", taxAmount, jackpot: this.state.jackpot, ...info };
    }

    // 4. Ô BÃI XE TỰ DO — Luôn mất 1 lượt; xả jackpot nếu setting bật
    if (p.position === 20 || tileType === "FREE_PARKING") {
      let winAmount = 0;
      if (this.settings.jackpotOnFreeParking && this.state.jackpot > 0) {
        winAmount = this.state.jackpot;
        p.money += winAmount;
        this.addLog(`🎉 ${p.name} đỗ vào Bãi Xe và hốt sạch Jackpot $${winAmount}!`);
        this.state.jackpot = 0;
      } else if (this.state.jackpot > 0) {
        this.addLog(`🅿️ ${p.name} đỗ vào Bãi Xe (Jackpot $${this.state.jackpot} đang tích lũy, chưa xả vì setting tắt)`);
      }
      p.skipTurns = (p.skipTurns || 0) + 1;
      this.addLog(`🅿️ ${p.name} dừng chân tại Bãi Xe Tự Do -> Mất 1 lượt kế tiếp!`);
      return { action: "FREE_PARKING", amount: winAmount, skipTurn: true, jackpot: this.state.jackpot, ...info };
    }

    // 5. Ô ĐẤT / GA / NHÀ MÁY
    if (tile.price && tile.type !== "TAX") {
      if (tile.owner === null || tile.owner === undefined) {
        const effectivePrice = p.hasDiscount ? Math.round(tile.price * 0.5) : tile.price;
        this.state.pendingTile = tile;
        const canAfford = p.money >= effectivePrice;
        if (!canAfford) {
          this.addLog(`💡 ${p.name} đỗ vào [${tile.name}] (Giá: $${effectivePrice} - Số dư: $${p.money}).`);
        }
        return {
          action: "PROMPT_BUY",
          tile,
          discount: p.hasDiscount,
          effectivePrice,
          canAfford,
          ...info
        };
      } else if (tile.owner !== p.id) {
        if (tile.mortgaged) {
          this.addLog(`🏦 [${tile.name}] đang bị cầm cố nên ${p.name} không phải trả tiền thuê.`);
          return { action: "END_ROLL", tile, ...info };
        }
        // Gọi hàm thu tiền thuê chuẩn xác
        this.collectRent(p, tile);
      }
      if (tile.rentMultiplier && tile.rentMultiplier !== 1) {
        delete tile.rentMultiplier;
        this.addLog(`📈 Hiệu ứng tăng 1.5x trên [${tile.name}] đã được sử dụng.`);
      }
    }

    return { action: "END_ROLL", tile, ...info };
  },

  applyCardEffect() {
    const card = this.state.pendingCard;
    if (!card) return null;

    const p = this.getCurrentPlayer();
    this.addLog(`🎴 ${p.name} rút thẻ [${card.type}]: ${card.title}`);

    switch (card.action) {
      case "MONEY": {
        const amount = card.amount || 0;
        p.money += amount;
        if (p.money >= 0) p.lastCreditorId = null;
        else p.lastCreditorId = null; // nợ ngân hàng
        this.addLog(`  -> ${p.name} ${amount >= 0 ? '+' : ''}$${amount}`);
        break;
      }

      case "COLLECT_OTHER": {
        const amount = card.amount || 0;
        const others = this.getOtherPlayers(p);
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
        break;
      }
      case "UPGRADE_MY_TILE": {
        const target = this.state.board.filter(t => t.owner === p.id && t.type === 'PROPERTY' && (t.houses || 0) < 5).sort((a, b) => a.price - b.price)[0];
        if (target) { target.houses = (target.houses || 0) + 1; this.addLog(`🏠 Nâng miễn phí [${target.name}] lên cấp ${target.houses}.`); }
        break;
      }
      case "DEMOLISH_ENEMY_HOUSE": {
        const richest = this.state.players.filter(x => x.id !== p.id && !x.isBankrupt).sort((a, b) => this.netWorth(b) - this.netWorth(a))[0];
        const target = richest && this.state.board.filter(t => t.owner === richest.id && t.type === 'PROPERTY' && t.houses > 0).sort((a, b) => b.price - a.price)[0];
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
        const myTiles = this.state.board.filter(t => t.owner === p.id && t.price);
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
        const rivals = this.getOtherPlayers(p);
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
        const myTiles = this.state.board.filter(t => t.owner === p.id && t.price);
        const rivals = this.getOtherPlayers(p);
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
        p.position = card.target;
        if (card.getGoBonus) p.money += this.settings.passGoMoney;
        this.addLog(`  -> ${p.name} di chuyển đến ô #${card.target}`);
        break;
      }

      case "MOVE_STEPS": {
        p.position = (p.position + card.steps + 40) % 40;
        this.addLog(`  -> ${p.name} dịch chuyển ${card.steps} bước (về ô #${p.position})`);
        break;
      }

      default:
        this.addLog(`  -> Thao tác thẻ: ${card.title}`);
        break;
    }

    const resultCard = { ...card, finalPos: p.position };

    if (card.action === "MOVE_TO" || card.action === "MOVE_STEPS") {
      resultCard.landing = this.processTileLanding(p, { startPos: resultCard.finalPos });
    }

    this.state.pendingCard = null;
    return resultCard;
  },

  buyPendingProperty() {
    const p = this.getCurrentPlayer();
    const tile = this.state.pendingTile;
    if (!tile) return false;

    const price = p.hasDiscount ? Math.round(tile.price * 0.5) : tile.price;
    if (p.money >= price) {
      p.money -= price;
      tile.owner = p.id;
      tile.lastBuiltPlayerTurn = null;
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
  },

  skipPendingProperty() {
    const p = this.getCurrentPlayer();
    const tile = this.state.pendingTile;
    if (tile) {
      this.addLog(`⏭️ ${p.name} BỎ QUA không mua [${tile.name}]`);
    }
    this.state.pendingTile = null;
  },

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
  },

  buildHouse(index) {
    const p = this.getCurrentPlayer();
    const tile = this.state.board[index];
    if (!tile || tile.owner !== p.id || !this.isBuildableProperty(tile) || this.state.canBuild === false) return false;

    const isFullGroup = this.ownsFullGroup(tile);

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

    const houseCost = tile.housePrice || Math.round((tile.price || 100) * 0.75);
    if (p.money < houseCost) return false;

    p.money -= houseCost;
    tile.houses = houses + 1;
    p.hasBuiltHouseThisTurn = true;
    tile.lastBuiltPlayerTurn = p.turnCount || 1;

    const isHotel = tile.houses === 5;
    this.addLog(`🏠 ${p.tokenEmoji || ''} ${p.name} ${isHotel ? 'xây khách sạn' : 'xây nhà'} tại [${tile.name}] (-$${houseCost})${this.settings.freeBuildOnFullGroup ? ' 👑 [Trọn bộ màu: Nâng tự do]' : ''}`);
    return true;
  },

  sellHouse(index) {
    const p = this.getCurrentPlayer();
    const tile = this.state.board[index];
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
  },

  // =========================================================
  // KIỂM TRA PHÁ SẢN & KẾT THÚC GAME (offline engine)
  // =========================================================

  netWorth(player) {
    let total = player.money;
    this.state.board.forEach(tile => {
      if (tile.owner !== player.id) return;
      const value = tile.mortgaged ? 0 : Math.round((tile.price || 0) / 2);
      total += value + (tile.houses || 0) * Math.round((tile.housePrice || 0) / 2);
    });
    return total;
  },

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
        tile.owner = creditor.id; // Chuyển toàn bộ bất động sản sang chủ nợ
      } else {
        tile.owner = null; // Ngân hàng thu hồi
        tile.mortgaged = false;
        tile.houses = 0;
      }
    });

    this.state.tradeRequests = this.state.tradeRequests.filter(r =>
      r.fromPlayerId !== player.id && r.toPlayerId !== player.id
    );

    if (creditor) {
      this.addLog(`💀 ${player.name} đã PHÁ SẢN (ĐẦU HÀNG) do nợ ${creditor.name}! Toàn bộ tài sản (${transferredCount} ô đất) đã được chuyển giao cho ${creditor.name}.`);
    } else {
      this.addLog(`💀 ${player.name} đã PHÁ SẢN (ĐẦU HÀNG)! Toàn bộ tài sản bị thu hồi về Ngân hàng.`);
    }

    this.checkGameOver();
    return true;
  },

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
        this.addLog(`🔄 Chuyển lượt sang ${nextP.name}`);
      }
    }
    return true;
  },

  checkGameOver() {
    const alive = this.state.players.filter(p => !p.isBankrupt);
    if (alive.length <= 1) {
      this.state.gameOver = true;
      this.state.winner = alive[0] || null;
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
  },

  endTurn() {
    if (this.state.gameOver) return false;

    const curPlayer = this.getCurrentPlayer();
    if (curPlayer && !curPlayer.isBankrupt && curPlayer.money < 0) {
      this.addLog(`⚠️ ${curPlayer.name} đang nợ $${Math.abs(curPlayer.money)}! Hãy bán/cầm cố tài sản hoặc đầu hàng trước khi kết thúc lượt.`);
      return false;
    }

    this.updateTurnCounters(this.state);
    const total = this.state.players.length;
    let next = this.state.currentPlayerIndex;
    let safety = 0;
    while (safety < total) {
      next = (next + 1) % total;
      const nextP = this.state.players[next];
      if (!nextP.isBankrupt) {
        if (nextP.skipTurns && nextP.skipTurns > 0) {
          nextP.skipTurns--;
          this.addLog(`🛑 ${nextP.name} bị mất 1 lượt (do đỗ ở Bãi xe) và phải chờ lượt sau!`);
          safety++;
          continue;
        }
        break;
      }
      safety++;
    }

    this.state.currentPlayerIndex = next;
    this.state.extraRollPending = false;
    const p = this.getCurrentPlayer();
    p.turnCount = (p.turnCount || 0) + 1;
    p.hasBuiltHouseThisTurn = false;
    this.addLog(`🔄 Chuyển lượt sang ${p.name}`);
    return true;
  },


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

    const fromOwns = offerPropertyIds.every(id => this.state.board.find(t => t.id === id)?.owner === fromPlayer.id);
    const toOwns = requestPropertyIds.every(id => this.state.board.find(t => t.id === id)?.owner === toPlayer.id);
    if (!fromOwns || !toOwns) return null;
    if (fromPlayer.money < offerCash) return null;
    const ownsCards = (player, cardIds) => cardIds.every(cardId => {
      const cards = Array.isArray(player.shopCards) ? player.shopCards : [];
      const required = cardIds.filter(id => id === cardId).length;
      return cards.filter(id => id === cardId).length >= required;
    });
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
  },

  acceptTrade(toPlayerId, requestId) {
    const reqIndex = this.state.tradeRequests.findIndex(r => r.id === requestId);
    if (reqIndex === -1) return false;
    const req = this.state.tradeRequests[reqIndex];
    if (req.toPlayerId !== toPlayerId) return false;

    const fromPlayer = this.state.players.find(p => p.id === req.fromPlayerId);
    const toPlayer = this.state.players.find(p => p.id === req.toPlayerId);
    if (!fromPlayer || !toPlayer) return false;

    if (fromPlayer.money < req.offerCash || toPlayer.money < req.requestCash) {
      this.addLog(`❌ Trao đổi thất bại do không đủ tiền.`);
      this.state.tradeRequests.splice(reqIndex, 1);
      return false;
    }

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

    fromPlayer.money -= req.offerCash;
    toPlayer.money += req.offerCash;
    toPlayer.money -= req.requestCash;
    fromPlayer.money += req.requestCash;

    if (fromPlayer.money >= 0) fromPlayer.lastCreditorId = null;
    if (toPlayer.money >= 0) toPlayer.lastCreditorId = null;

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
  },

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
};
