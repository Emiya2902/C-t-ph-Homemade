<<<<<<< HEAD
/**
 * UI CONTROLLER - Monopoly Richup Sài Gòn
 * Hỗ trợ 2-8 người chơi + màn hình cài đặt luật chơi
 */

document.addEventListener('DOMContentLoaded', () => {
const boardElement = document.getElementById('board');
  const infoCardModal = document.getElementById('property-info-card');
  const buyModal = document.getElementById('buy-modal');
const cardModal = document.getElementById('card-modal');
  const btnAcceptCard = document.getElementById('btn-accept-card');
  const rollBtn = document.getElementById('roll-btn');
  const endTurnBtn = document.getElementById('end-turn-btn');
  const surrenderBtn = document.getElementById('surrender-btn');
  const debtSurrenderBtn = document.getElementById('debt-surrender-btn');
  const surrenderModal = document.getElementById('surrender-confirm-modal');
  const surrenderYesBtn = document.getElementById('surrender-yes-btn');
  const surrenderNoBtn = document.getElementById('surrender-no-btn');
  const surrenderConfirmDesc = document.getElementById('surrender-confirm-desc');
  const debtAlertBanner = document.getElementById('debt-alert-banner');
  const debtAlertText = document.getElementById('debt-alert-text');

// AUCTION MODAL
  const auctionModal = document.getElementById('auction-modal');
  const auctionTimerEl = document.getElementById('auction-timer');
  const auctionHighestToken = document.getElementById('auction-highest-token');
  const auctionAddBtns = document.querySelectorAll('.auction-add-btn');
  const auctionPassBtn = document.getElementById('auction-pass-btn');
  const auctionStatusMsg = document.getElementById('auction-status-msg');
  const tradePlayerModal = document.getElementById('trade-player-modal');
  const tradeOfferModal = document.getElementById('trade-offer-modal');
  const tradeDetailModal = document.getElementById('trade-detail-modal');
  let tradeTargetPlayerId = null;
  const renderedMoney = new Map();
  let activeDetailRequestId = null;
  let auctionTimerInterval = null;

  const settingsOverlay = document.getElementById('settings-overlay');
  const playerMinus = document.getElementById('player-minus');
  const playerPlus = document.getElementById('player-plus');
  const playerCountVal = document.getElementById('player-count-val');
  const startGameBtn = document.getElementById('start-game-btn');

  let selectedTileIndex = null;
  let playerTokens = []; // Mảng quân cờ (tạo động theo số người chơi)
  let localTurnPlayerIndex = null;
  let localTurnHasRolled = false;

  // Thêm Nút Bảo Lãnh Ra Tù
  let bailBtn = document.getElementById('bail-btn');
  if (!bailBtn) {
    bailBtn = document.createElement('button');
    bailBtn.id = 'bail-btn';
    bailBtn.className = 'btn hidden';
    bailBtn.style.cssText = `
      background: linear-gradient(135deg, #e67e22, #d35400);
      color: #fff;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: bold;
      border-radius: 8px;
      border: 1px solid #f39c12;
      cursor: pointer;
      display: none;
      margin: 0 auto 12px auto;
      box-shadow: 0 4px 10px rgba(230, 126, 34, 0.4);
    `;
    bailBtn.innerText = '🔓 Nộp $100 ra tù';
    if (rollBtn && rollBtn.parentNode && rollBtn.parentNode.parentNode) {
      rollBtn.parentNode.parentNode.insertBefore(bailBtn, rollBtn.parentNode);
    }
  }

  function getGridPosition(index) {
    if (index >= 0 && index <= 10) return { row: 11, col: 11 - index, side: 'bottom' };
    if (index >= 11 && index <= 20) return { row: 11 - (index - 10), col: 1, side: 'left' };
    if (index >= 21 && index <= 30) return { row: 1, col: 1 + (index - 20), side: 'top' };
    if (index >= 31 && index <= 39) return { row: 1 + (index - 30), col: 11, side: 'right' };
    // 17 ô hình chữ thập (ở giữa bàn cờ mở rộng)
    // Nánh dọc (cột 6, hàng 2 -> 10, qua tâm hàng 6)
    if (index === 40) return { row: 2, col: 6, side: 'cross-v' };   // Cầu Bình Lợi
    if (index === 41) return { row: 3, col: 6, side: 'cross-v' };   // ĐL Phạm Văn Đồng
    if (index === 42) return { row: 4, col: 6, side: 'cross-v' };   // Ngã tư Hàng Xanh
    if (index === 43) return { row: 5, col: 6, side: 'cross-v' };   // Cầu Sài Gòn
    if (index === 44) return { row: 6, col: 6, side: 'cross-center' }; // TÂM
    if (index === 45) return { row: 7, col: 6, side: 'cross-v' };   // Cầu Kênh Tẻ
    if (index === 46) return { row: 8, col: 6, side: 'cross-v' };   // Ngã tư Bảy Hiền
    if (index === 47) return { row: 9, col: 6, side: 'cross-v' };   // ĐL Nguyễn Văn Linh
    if (index === 48) return { row: 10, col: 6, side: 'cross-v' };  // Cầu Chữ Y
    // Nánh ngang (hàng 6, cột 2 -> 10, trừ cột 6 là tâm)
    if (index === 49) return { row: 6, col: 2, side: 'cross-h' };   // Cầu Nhị Thiên Đường
    if (index === 50) return { row: 6, col: 3, side: 'cross-h' };   // ĐL Võ Văn Kiệt
    if (index === 51) return { row: 6, col: 4, side: 'cross-h' };   // Ngã sáu Cộng Hòa
    if (index === 52) return { row: 6, col: 5, side: 'cross-h' };   // Chợ Kim Biên
    if (index === 53) return { row: 6, col: 7, side: 'cross-h' };   // Hầm Thủ Thiêm
    if (index === 54) return { row: 6, col: 8, side: 'cross-h' };   // Ngã ba Cát Lái
    if (index === 55) return { row: 6, col: 9, side: 'cross-h' };   // ĐL Mai Chí Thọ
    if (index === 56) return { row: 6, col: 10, side: 'cross-h' };  // Cầu Rạch Chiếc
    return { row: 6, col: 6, side: 'cross-center' }; // fallback
  }

  function updateGodDiceControl(player) {
    if (!rollBtn || !rollBtn.parentNode) return;
    const active = !!(player && player.godDiceTurns > 0);
    let control = document.getElementById('god-dice-control');
    if (!active) {
      control?.remove();
      return;
    }
    if (!control) {
      control = document.createElement('label');
      control.id = 'god-dice-control';
      control.innerHTML = '🎯 <span>Chọn bước</span> <select aria-label="Số bước Quyền Năng Thượng Đế"></select>';
      rollBtn.parentNode.insertBefore(control, rollBtn);
      const select = control.querySelector('select');
      for (let steps = 1; steps <= 12; steps++) {
        const option = document.createElement('option');
        option.value = steps;
        option.innerText = steps;
        select.appendChild(option);
      }
    }
    control.hidden = false;
    control.querySelector('span').innerText = `Còn ${player.godDiceTurns} lượt`;
  }

  function positionBuyPrompt(tileIndex) {
    if (!buyModal) return;
    positionPopupNearTile(buyModal, tileIndex);
  }

  function syncTradeModalWidth(modal) {
    if (!modal || !boardElement) return;
    const boardWidth = boardElement.getBoundingClientRect().width;
    const content = modal.querySelector('.modal-content');
    if (content && boardWidth > 0) {
      content.style.setProperty('width', `${boardWidth}px`, 'important');
      content.style.setProperty('max-width', `${boardWidth}px`, 'important');
    }
  }

  function positionPopupNearTile(popup, tileIndex) {
    if (!popup || !boardElement) return;
    popup.classList.remove('hidden');
    popup.style.position = 'absolute';
    popup.style.top = '0px';
    popup.style.left = '0px';
    popup.style.right = 'auto';
    popup.style.bottom = 'auto';
    popup.style.transform = 'none';

    const boardRect = boardElement.getBoundingClientRect();
    const tileElem = document.getElementById(`tile-${tileIndex}`);
    if (!tileElem) {
      popup.style.left = `${Math.max(6, (boardRect.width - popup.offsetWidth) / 2)}px`;
      popup.style.top = `${Math.max(6, (boardRect.height - popup.offsetHeight) / 2)}px`;
      return;
    }

    const tileRect = tileElem.getBoundingClientRect();
    const popupWidth = popup.offsetWidth;
    const popupHeight = popup.offsetHeight;
    const gap = 6;
    const pos = getGridPosition(tileIndex);
    const tileLeft = tileRect.left - boardRect.left;
    const tileTop = tileRect.top - boardRect.top;
    const tileRight = tileRect.right - boardRect.left;
    const tileBottom = tileRect.bottom - boardRect.top;
    const centeredLeft = tileLeft + (tileRect.width - popupWidth) / 2;
    const centeredTop = tileTop + (tileRect.height - popupHeight) / 2;
    const candidates = pos.side === 'bottom'
      ? [[centeredLeft, tileTop - popupHeight - gap], [tileRight + gap, centeredTop], [tileLeft - popupWidth - gap, centeredTop]]
      : pos.side === 'top'
        ? [[centeredLeft, tileBottom + gap], [tileRight + gap, centeredTop], [tileLeft - popupWidth - gap, centeredTop]]
        : pos.side === 'left'
          ? [[tileRight + gap, centeredTop], [centeredLeft, tileTop - popupHeight - gap], [centeredLeft, tileBottom + gap]]
          : pos.side === 'right'
            ? [[tileLeft - popupWidth - gap, centeredTop], [centeredLeft, tileTop - popupHeight - gap], [centeredLeft, tileBottom + gap]]
            : pos.side === 'cross-v'
              ? [[tileRight + gap, centeredTop], [tileLeft - popupWidth - gap, centeredTop], [centeredLeft, tileBottom + gap], [centeredLeft, tileTop - popupHeight - gap]]
              : [[centeredLeft, tileTop - popupHeight - gap], [centeredLeft, tileBottom + gap], [tileRight + gap, centeredTop], [tileLeft - popupWidth - gap, centeredTop]];

    const maxLeft = Math.max(6, boardRect.width - popupWidth - 6);
    const maxTop = Math.max(6, boardRect.height - popupHeight - 6);
    const [left, top] = candidates[0];
    popup.style.left = `${Math.min(maxLeft, Math.max(6, left))}px`;
    popup.style.top = `${Math.min(maxTop, Math.max(6, top))}px`;
  }

  function syncBoardWidth() {
    const boardWidth = boardElement.getBoundingClientRect().width;
    document.documentElement.style.setProperty('--board-width', `${boardWidth}px`);
  }

  window.addEventListener('resize', syncBoardWidth);
  
  // Expose for online.js to use
  window.positionBuyPrompt = positionBuyPrompt;

  // Click ra ngoài để tắt pop-up
  document.addEventListener('click', (e) => {
    if (!infoCardModal.contains(e.target) && !e.target.closest('.tile')) {
      infoCardModal.classList.add('hidden');
    }
  });
  infoCardModal.addEventListener('click', (e) => e.stopPropagation());

  // =========================================================
  // ICON ĐẶC TRƯNG CHO TỪNG Ô BÀN CỜ (PHÓNG TO & NỔI BẬT)
  // =========================================================
  function getTileIconInfo(tile, index) {
    // 1. Ô góc bàn cờ (Corner tiles) - Phóng to nổi bật nhất
    if (tile.type === "GO" || index === 0) {
      return { icon: '🚀', className: 'tile-icon tile-corner-icon' };
    }

    if (tile.type === "JAIL" || index === 10) {
      return { icon: '🔒', className: 'tile-icon tile-corner-icon' };
    }
    if (tile.type === "FREE_PARKING" || index === 20) {
      return { icon: '🅿️', className: 'tile-icon tile-corner-icon' };
    }
    if (tile.type === "GO_TO_JAIL" || index === 30) {
      return { icon: '🚔', className: 'tile-icon tile-corner-icon' };
    }

    // 2. Ô chức năng đặc biệt (Bến xe, Sân bay, Metro, Điện nước, Thuế, Cơ hội, Khí vận)
    if (tile.type === "RAILROAD") {
      const stationIcons = {
        "Đại học Bách Khoa": '🏫',
        "Đại học Kinh Tế": '🎓',
        "Đại học CNKT": '🏛️',
        "Đại học KHTN": '🔬'
      };
      return { icon: stationIcons[tile.name] || '🏫', className: 'tile-icon tile-special-icon' };
    }

    if (tile.type === "UTILITY") {
      const uIcon = (index === 12) ? '⚡' : '💧'; // EVN hoặc SAWACO
      return { icon: uIcon, className: 'tile-icon tile-special-icon' };
    }

    if (tile.type === "SHOP") {
      return { icon: tile.icon || '🛒', className: 'tile-icon tile-special-icon' };
    }

    if (tile.type === "CENTER_BUFF" || tile.isCenterHub) {
      return { icon: '🌟', className: 'tile-icon tile-center-buff-icon' };
    }

    if (tile.type === "TAX" || index === 4 || index === 38) {
      const tIcon = (index === 4) ? '🍂' : '💎'; // Thuế Môi Trường / Thuế Hàng Hiệu
      return { icon: tIcon, className: 'tile-icon tile-special-icon' };
    }

    if (tile.type === "CHANCE" || (tile.name && tile.name.includes("Cơ hội"))) {
      return { icon: '❓', className: 'tile-icon tile-special-icon' };
    }

    if (tile.type === "CHEST" || tile.type === "FORTUNE" || (tile.name && tile.name.includes("Khí vận"))) {
      return { icon: '🎁', className: 'tile-icon tile-special-icon' };
    }

    // 3. Icon đặc trưng theo tính chất từng ô đất quận/huyện Sài Gòn
    const propertyIcons = {
      1: '🌾',  // Hóc Môn (Vườn trầu, lúa ngoại thành)
      3: '🌳',  // Củ Chi (Đất thép, rừng cây sinh thái)
      6: '🏘️',  // Bình Chánh (Đô thị cửa ngõ Tây Nam)
      8: '⚓',  // Nhà Bè (Cảng biển, sông nước)
      9: '🏝️',  // Cần Giờ (Đảo sinh thái biển & rừng ngập mặn)
      11: '🏢', // Quận 12 (Công viên phần mềm Quang Trung)
      13: '🏬', // Bình Tân (Khu thương mại & công nghiệp sầm uất)
      14: '🏙️', // Gò Vấp (Đô thị nhộn nhịp)
      16: '🛍️', // Tân Phú (Phố mua sắm & ẩm thực)
      18: '🏨', // Tân Bình (Khách sạn văn phòng cửa ngõ)
      19: '🌺', // Phú Nhuận (Phố hoa lệ ẩm thực)
      21: '🌉', // Quận 8 (Đô thị kênh rạch sông nước)
      23: '🏮', // Quận 6 (Chợ Lớn - Phố người Hoa cổ kính)
      24: '🍜', // Quận 5 (Ẩm thực & văn hóa Chợ Quán)
      26: '☕', // Quận 10 (Phố cà phê & thương mại)
      27: '🍢', // Quận 4 (Thiên đường ẩm thực đêm Vĩnh Khánh)
      29: '🏛️', // Quận 3 (Biệt thự Pháp cổ & Hồ Con Rùa)
      31: '⛲', // Quận 7 (Phú Mỹ Hưng / Cầu Ánh Sao)
      32: '🍷', // Thảo Điền (Khu biệt thự sang trọng)
      34: '🌆', // Thủ Thiêm (Trung tâm tài chính mới tương lai)
      37: '🏰', // Phố đi bộ Nguyễn Huệ (Trực diện trung tâm tráng lệ)
      39: '👑'  // Đường Đồng Khởi (Vương miện xa xỉ đắt giá nhất)
    };

    const propIcon = propertyIcons[index] || '🏡';
    // Icon cho các ô chữ thập (id 40-56)
    const crossIcons = {
      40: '🌉', 41: '🛣️', 42: '🛒', 43: '🌉', 44: '🌟',
      45: '🌉', 46: '🛒', 47: '🛣️', 48: '🌉',
      49: '🌉', 50: '🛣️', 51: '🎁', 52: '🏪',
      53: '🚇', 54: '❓', 55: '🛣️', 56: '🌉'
    };
    if (index >= 40 && crossIcons[index]) {
      const isCrossChance = tile.type === 'CHANCE' || tile.type === 'SHOP' || tile.type === 'FORTUNE';
      return { icon: crossIcons[index], className: isCrossChance ? 'tile-icon tile-special-icon' : 'tile-icon tile-property-icon' };
    }
    return { icon: propIcon, className: 'tile-icon tile-property-icon' };
  }

  function getDisplayTileName(tile) {
    const name = String(tile?.name || '');
    const shortened = name
      .replace(/\s*\([^)]*\)\s*$/, '')
      .replace('Trạm Khí Tượng', 'Trạm KT')
      .replace('Đường Đồng Khởi', 'Đ. Đồng Khởi');
    return shortened.length > 17 ? `${shortened.slice(0, 16).trim()}…` : shortened;
  }

  // =========================================================
  // DỰNG BÀN CỜ (gọi 1 lần duy nhất sau khi có state)
  // =========================================================
  function buildBoard() {
    boardElement.classList.toggle('cross-board', GameCore.state.board.length > 40);
    syncBoardWidth();
    boardElement.appendChild(infoCardModal);
    boardElement.appendChild(buyModal);
    const notificationList = document.getElementById('game-notifications');
    const centerPanel = document.getElementById('center-panel');
    const centerActions = centerPanel?.querySelector('.center-actions');
    if (notificationList && centerPanel && centerActions) {
      if (GameCore.state.board.length > 40) boardElement.appendChild(notificationList);
      else centerPanel.insertBefore(notificationList, centerActions);
    }
    boardElement.querySelectorAll('.tile').forEach((t) => t.remove());
    GameCore.state.board.forEach((tile, index) => {
      const tileDiv = document.createElement('div');
      tileDiv.className = 'tile';
      tileDiv.id = `tile-${index}`;

      const pos = getGridPosition(index);
      tileDiv.style.gridRow = pos.row;
      tileDiv.style.gridColumn = pos.col;

      let groupBar = null;
      if (tile.group) {
        groupBar = document.createElement('div');
        groupBar.className = `group-bar group-${tile.group}`;
      }

      const contentDiv = document.createElement('div');
      contentDiv.className = 'tile-content';

      const iconInfo = getTileIconInfo(tile, index);
      if (iconInfo && iconInfo.icon) {
        const iconSpan = document.createElement('span');
        iconSpan.className = iconInfo.className;
        iconSpan.innerText = iconInfo.icon;
        contentDiv.appendChild(iconSpan);
      }

      const nameSpan = document.createElement('span');
      nameSpan.className = 'tile-name';
      nameSpan.innerText = getDisplayTileName(tile);
      nameSpan.title = tile.name;
      contentDiv.appendChild(nameSpan);

      if (tile.price) {
        const priceSpan = document.createElement('span');
        priceSpan.className = 'tile-price';
        priceSpan.innerText = `$${tile.price}`;
        contentDiv.appendChild(priceSpan);
      }

      // Tile's side layout
      if (pos.side === 'bottom') {
        tileDiv.classList.add('tile-side-bottom');
        if (groupBar) tileDiv.appendChild(groupBar);
        tileDiv.appendChild(contentDiv);
      } else if (pos.side === 'top') {
        tileDiv.classList.add('tile-side-top');
        tileDiv.appendChild(contentDiv);
        if (groupBar) tileDiv.appendChild(groupBar);
      } else if (pos.side === 'left') {
        tileDiv.classList.add('side-tile', 'tile-side-left');
        tileDiv.appendChild(contentDiv);
        if (groupBar) tileDiv.appendChild(groupBar);
      } else if (pos.side === 'right') {
        tileDiv.classList.add('side-tile', 'tile-side-right');
        if (groupBar) tileDiv.appendChild(groupBar);
        tileDiv.appendChild(contentDiv);
      } else if (pos.side === 'cross-center') {
        tileDiv.classList.add('tile-cross', 'tile-cross-center');
        tileDiv.appendChild(contentDiv);
      } else if (pos.side === 'cross-v') {
        tileDiv.classList.add('tile-cross', 'tile-cross-v');
        tileDiv.appendChild(contentDiv);
        if (groupBar) tileDiv.appendChild(groupBar);
      } else if (pos.side === 'cross-h') {
        tileDiv.classList.add('tile-cross', 'tile-cross-h');
        tileDiv.appendChild(contentDiv);
        if (groupBar) tileDiv.appendChild(groupBar);
      }

      tileDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        if (GameCore.Shop?.handleTileSelection?.(tile.id)) return;
        if (tile.type === 'SHOP') {
          const currentPlayer = GameCore.getCurrentPlayer();
          if (currentPlayer && currentPlayer.position === tile.id && GameCore.Shop) {
            GameCore.Shop.openShop(currentPlayer);
          }
          return;
        }
        if (tile.price && tile.type !== "TAX") {
          openPropertyCard(index);
        }
      });

      boardElement.appendChild(tileDiv);
    });

    const d1 = (GameCore.state && GameCore.state.lastDice) ? GameCore.state.lastDice[0] : 1;
    const d2 = (GameCore.state && GameCore.state.lastDice) ? GameCore.state.lastDice[1] : 1;
    renderDiceFace(document.getElementById('dice-one'), d1);
    renderDiceFace(document.getElementById('dice-two'), d2);
  }

  // =========================================================
  // TẠO QUÂN CỜ & THẺ NGƯỜI CHƠI (động theo số người)
  // =========================================================
  function buildPlayersUI() {
    const players = GameCore.state.players;

    // Tạo mảng quân cờ: hiển thị toàn bộ con vật (không nằm trong khung màu tròn cũ)
    playerTokens = players.map((p, i) => {
      const tok = document.createElement('div');
      tok.className = 'player-token';
      tok.dataset.playerId = p.id;
      // Lấy emoji con vật được chọn hoặc mặc định
      const emoji = p.tokenEmoji || (GameCore.animalTokens[i % GameCore.animalTokens.length] ? GameCore.animalTokens[i % GameCore.animalTokens.length].emoji : '🐊');
      tok.innerText = emoji;
      tok.setAttribute('title', `${p.name} (${emoji})`);
      if (players.length > 4) {
        // Nhiều người chơi -> tự động co kích thước tối ưu
        tok.classList.add('small-token');
      }
      return tok;
    });

    // Dựng danh sách thẻ người chơi bên phải
    const playersList = document.getElementById('players-list');
    playersList.innerHTML = '';
    players
      .slice()
      .sort((first, second) => Number(first.isBankrupt) - Number(second.isBankrupt))
      .forEach((p, i) => {
      const card = document.createElement('div');
      card.className = 'player-card';
      card.id = `card-p${p.id}`;

      const emoji = p.tokenEmoji || (GameCore.animalTokens[i % GameCore.animalTokens.length] ? GameCore.animalTokens[i % GameCore.animalTokens.length].emoji : '🐊');
      const badge = document.createElement('span');
      badge.className = 'player-badge';
      badge.style.borderColor = p.color;
      badge.innerText = emoji;

      const pTag = document.createElement('span');
      pTag.className = `player-order-tag player-order-p${p.id}`;
      pTag.style.backgroundColor = p.color;
      pTag.innerText = `P${p.id}`;

      const name = document.createElement('span');
      name.className = 'player-name';
      name.innerText = p.name;

      const money = document.createElement('span');
      money.className = 'player-money';
      const moneySpan = document.createElement('span');
      moneySpan.id = `p${p.id}-money`;
      moneySpan.innerText = p.money;
      money.appendChild(moneySpan);

      card.appendChild(badge);
      card.appendChild(pTag);
      card.appendChild(name);
      card.appendChild(money);
      playersList.appendChild(card);
      });
  }

  // =========================================================
  // CẬP NHẬT GIAO DIỆN (RENDER)
  // =========================================================
  function renderUI() {
    const { players, currentPlayerIndex, board, logs } = GameCore.state;
    const currentPlayer = players[currentPlayerIndex];
    updateGodDiceControl(currentPlayer);

    // Cập nhật tiền & trạng thái tù cho từng người chơi
    players.forEach((p, i) => {
      const moneyEl = document.getElementById(`p${p.id}-money`);
      if (moneyEl) {
        const previousMoney = renderedMoney.get(p.id);
        if (Number.isFinite(previousMoney) && previousMoney !== p.money && !p.isBankrupt && !p.disconnected) {
          const delta = p.money - previousMoney;
          const deltaEl = document.createElement('span');
          deltaEl.className = `money-delta ${delta >= 0 ? 'money-delta-positive' : 'money-delta-negative'}`;
          deltaEl.textContent = `${delta >= 0 ? '+' : ''}$${delta}`;
          const card = document.getElementById(`card-p${p.id}`);
          if (card) {
            card.appendChild(deltaEl);
            requestAnimationFrame(() => deltaEl.classList.add('money-delta-visible'));
            setTimeout(() => deltaEl.remove(), 1200);
          }
        }
        renderedMoney.set(p.id, Number(p.money));
        if (p.disconnected) {
          const remaining = p.disconnectExpiresAt ? Math.max(0, Math.ceil((p.disconnectExpiresAt - Date.now()) / 1000)) : 120;
          moneyEl.innerHTML = `<span class="disconnect-warn-text">🔌 Mất kết nối (${remaining}s)</span>`;
        } else {
          moneyEl.innerText = p.isBankrupt ? "💀 Phá sản" : (`$${p.money}` + (p.inJail ? " 🔒" : ""));
        }
      }
      const cardEl = document.getElementById(`card-p${p.id}`);
      const shieldState = GameCore.getShieldVisualState(p);
      if (cardEl) {
        cardEl.classList.toggle('active', p.id === currentPlayer.id && !p.isBankrupt);
        cardEl.classList.toggle('bankrupt', !!p.isBankrupt);
        cardEl.classList.toggle('player-disconnected', !!p.disconnected);

        // Hiển thị buff badges (Khiên 🛡️, Giảm giá 🏷️)
        let buffContainer = cardEl.querySelector('.player-buff-badges');
        if (!buffContainer) {
          buffContainer = document.createElement('div');
          buffContainer.className = 'player-buff-badges';
          cardEl.appendChild(buffContainer);
        }
        buffContainer.innerHTML = '';
        if (shieldState.hasShield) {
          const s = document.createElement('span');
          s.className = `buff-badge buff-shield${shieldState.isCenterShield ? ' buff-center-shield' : ''}`;
          s.title = `${shieldState.isCenterShield ? 'Khiên ô trung tâm' : 'Khiên'}: còn ${shieldState.shieldCharges}/3 lần chặn`;
          s.innerText = `${shieldState.isCenterShield ? '✨🛡️' : '🛡️'} ${shieldState.shieldCharges}/3`;
          buffContainer.appendChild(s);
        }
        const activeBuffs = [
          ['midasCharges', 'buff-midas', `👑 Midas ${p.midasCharges} nhà`, 'Đế Chế Midas'],
          ['godDiceTurns', 'buff-god-dice', `🎯 Dice ${p.godDiceTurns} lượt`, 'Quyền Năng Thượng Đế'],
          ['globalTollTurns', 'buff-toll', `💸 Thu phí ${p.globalTollTurns} lượt`, 'Hoàng Tộc Thu Phí']
        ];
        activeBuffs.forEach(([key, className, text, title]) => {
          if (!(Number(p[key]) > 0)) return;
          const buff = document.createElement('span');
          buff.className = `buff-badge ${className}`;
          buff.title = `${title}: còn ${p[key]} lượt`;
          buff.innerText = text;
          buffContainer.appendChild(buff);
        });
        if (p.activeCenterBuff === 'SPECIAL_SHOP' && p.specialShop?.purchasesRemaining > 0) {
          const shopBuff = document.createElement('span');
          shopBuff.className = 'buff-badge buff-special-shop';
          shopBuff.title = `Cửa hàng đặc biệt: còn mua ${p.specialShop.purchasesRemaining} thẻ, đổi ${p.specialShop.refreshesRemaining} lần`;
          shopBuff.innerText = `🛒 Shop ${p.specialShop.purchasesRemaining}/2`;
          buffContainer.appendChild(shopBuff);
        }
        if (p.hasDiscount) {
          const d = document.createElement('span');
          d.className = 'buff-badge buff-discount';
          d.title = 'Giảm 50% tiền mua đất ở lượt kế tiếp';
          d.innerText = '🏷️ -50%';
          buffContainer.appendChild(d);
        }
      }
      if (playerTokens[i]) {
        playerTokens[i].style.display = p.isBankrupt ? 'none' : 'flex';
        const hasActiveCenterBuff = GameCore.isCenterBuffActive(p);
        playerTokens[i].classList.toggle('shield-aura', !p.isBankrupt && shieldState.hasShield);
        playerTokens[i].classList.toggle('center-buff-aura', !p.isBankrupt && hasActiveCenterBuff);
        playerTokens[i].classList.toggle('center-shield-aura', !p.isBankrupt && shieldState.isCenterShield);
        playerTokens[i].classList.toggle('center-midas-aura', !p.isBankrupt && p.activeCenterBuff === 'MIDAS_EMPIRE' && Number(p.midasCharges) > 0);
        playerTokens[i].classList.toggle('center-god-dice-aura', !p.isBankrupt && p.activeCenterBuff === 'GOD_DICE' && Number(p.godDiceTurns) > 0);
        playerTokens[i].classList.toggle('center-toll-aura', !p.isBankrupt && p.activeCenterBuff === 'GLOBAL_TOLL_KING' && Number(p.globalTollTurns) > 0);
        playerTokens[i].classList.toggle('center-special-shop-aura', !p.isBankrupt && p.activeCenterBuff === 'SPECIAL_SHOP' && p.specialShop?.purchasesRemaining > 0);
      }
    });

    const playersList = document.getElementById('players-list');
    if (playersList) {
      players
        .slice()
        .sort((first, second) => Number(first.isBankrupt) - Number(second.isBankrupt))
        .forEach(player => {
          const card = document.getElementById(`card-p${player.id}`);
          if (card) playersList.appendChild(card);
        });
    }

    // Di chuyển quân cờ & phân bổ vị trí
    const byPosition = {};
    players.forEach((p, i) => {
      if (playerTokens[i] && !p.isBankrupt) {
        if (!byPosition[p.position]) byPosition[p.position] = [];
        byPosition[p.position].push(i);
      }
    });

    players.forEach((p, i) => {
      const tileEl = document.getElementById(`tile-${p.position}`);
      if (!tileEl || !playerTokens[i] || p.isBankrupt) return;
      tileEl.appendChild(playerTokens[i]);

      // Xếp chồng quân cờ khi nhiều người cùng đứng trên 1 ô
      const group = byPosition[p.position] || [i];
      const idxInGroup = group.indexOf(i);
      if (group.length > 1) {
        playerTokens[i].classList.add('token-stacked');
        const angle = (idxInGroup / group.length) * 2 * Math.PI - Math.PI / 2;
        const radius = group.length > 3 ? 15 : 12;
        const cx = 50;
        const cy = 50;
        playerTokens[i].style.left = `calc(${cx}% + ${Math.cos(angle) * radius}px)`;
        playerTokens[i].style.top = `calc(${cy}% + ${Math.sin(angle) * radius}px)`;
        playerTokens[i].style.transform = 'translate(-50%, -50%) scale(0.92)';
      } else {
        playerTokens[i].classList.remove('token-stacked');
        playerTokens[i].style.left = '50%';
        playerTokens[i].style.top = '50%';
        playerTokens[i].style.right = '';
        playerTokens[i].style.bottom = '';
        playerTokens[i].style.transform = 'translate(-50%, -50%)';
      }
    });

    // Cập nhật ẩn/hiện nút bảo lãnh ra tù
    if (currentPlayer.inJail && currentPlayer.money >= 100 && !rollBtn.disabled) {
      bailBtn.style.display = 'block';
    } else {
      bailBtn.style.display = 'none';
    }

    // Cập nhật ô đất
    board.forEach((tile, index) => {
      updateTileOwnershipUI(index, tile.owner);
      updateTileBadgeUI(index, tile.houses || 0);
      updateTileMortgageUI(index, !!tile.mortgaged);

      const tileElem = document.getElementById(`tile-${index}`);
      if (tileElem) {
        tileElem.classList.toggle('tile-frozen', !!tile.frozenTurns);
        tileElem.classList.toggle('tile-protected', !!tile.protectedTurns || !!tile.permanentProtection);
        tileElem.classList.toggle('tile-boosted', !!tile.boostTurns || !!tile.rentMultiplier);
        tileElem.classList.toggle('tile-oil-trap', tile.trap === 'SLIDE_OIL');
        if (tile.rentMultiplier && tile.rentMultiplier > 1) {
          tileElem.classList.add('tile-boosted-rent');
          tileElem.setAttribute('data-rent-multiplier', `${tile.rentMultiplier}x`);
        } else {
          tileElem.classList.remove('tile-boosted-rent');
          tileElem.removeAttribute('data-rent-multiplier');
        }
      }
    });

    updateGroupGlowUI();

    // Cập nhật nhật ký trò chơi và tin nhắn chat.
    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML = '';
    logs.forEach(msg => {
      const msgDiv = document.createElement('div');
      msgDiv.className = 'chat-msg';
      msgDiv.innerText = msg;
      chatBox.appendChild(msgDiv);
    });
    const renderedChatIds = new Set();
    (GameCore.state.chatMessages || []).forEach(({ from, text, ts }) => {
      const messageId = ts || `${from}:${text}`;
      if (renderedChatIds.has(messageId)) return;
      renderedChatIds.add(messageId);
      const msgDiv = document.createElement('div');
      msgDiv.className = 'chat-msg';
      msgDiv.innerText = `${from}: ${text}`;
      chatBox.appendChild(msgDiv);
    });
    chatBox.scrollTop = chatBox.scrollHeight;

    const notificationList = document.getElementById('game-notification-list');
    if (notificationList) {
      notificationList.innerHTML = '';
      logs.slice().reverse().forEach((message, index) => {
        const notification = document.createElement('div');
        notification.className = `game-notification game-notification-${index}`;
        notification.innerText = message;
        notificationList.appendChild(notification);
      });

      const refreshNotificationFade = () => {
        const listRect = notificationList.getBoundingClientRect();
        notificationList.querySelectorAll('.game-notification').forEach(notification => {
          const relativeTop = notification.getBoundingClientRect().top - listRect.top;
          const opacity = Math.max(0.18, Math.min(1, 1 - (relativeTop / Math.max(1, listRect.height)) * 0.7));
          notification.style.opacity = opacity.toFixed(2);
        });
      };
      refreshNotificationFade();
      if (!notificationList.dataset.fadeBound) {
        notificationList.addEventListener('scroll', refreshNotificationFade, { passive: true });
        notificationList.dataset.fadeBound = 'true';
      }
    }

    renderInventory();
    renderTradePanel();

    // Cập nhật cảnh báo nợ (khi tiền âm)
    if (debtAlertBanner) {
      if (currentPlayer && !currentPlayer.isBankrupt && currentPlayer.money < 0) {
        debtAlertBanner.classList.remove('hidden');
        if (debtAlertText) {
          const debtAmount = Math.abs(currentPlayer.money);
          if (currentPlayer.lastCreditorId) {
            const creditor = players.find(p => p.id === currentPlayer.lastCreditorId);
            debtAlertText.innerText = `Đang nợ ${creditor ? creditor.name : 'người chơi khác'} $${debtAmount}! Hãy bán nhà, cầm cố đất hoặc giao dịch để trả nợ trước khi kết thúc lượt.`;
          } else {
            debtAlertText.innerText = `Đang nợ Ngân hàng $${debtAmount}! Hãy bán nhà, cầm cố đất hoặc giao dịch để trả nợ trước khi kết thúc lượt.`;
          }
        }
        endTurnBtn.disabled = true;
        if (rollBtn.dataset.action === 'end-turn') rollBtn.disabled = true;
      } else {
        debtAlertBanner.classList.add('hidden');
      }
    }

    // Cập nhật nút đầu hàng / phá sản
    if (surrenderBtn) {
      surrenderBtn.disabled = !currentPlayer || !!currentPlayer.isBankrupt;
    }

    // Kiểm tra phá sản
    checkAndShowBankruptcy();

    // Kiểm tra kết thúc game
    if (GameCore.state.gameOver) {
      showVictoryScreen(GameCore.state.winner, GameCore.state.players);
    }

    // Cập nhật jackpot display (bãi xe)
    const jackpotDisplay = document.getElementById('jackpot-display');
    const jackpotAmountEl = document.getElementById('jackpot-amount');
    if (jackpotDisplay && jackpotAmountEl) {
      const jackpot = GameCore.state.jackpot || 0;
      if (jackpot > 0) {
        jackpotAmountEl.innerText = `$${jackpot}`;
        jackpotDisplay.classList.remove('hidden');
      } else {
        jackpotDisplay.classList.add('hidden');
      }
    }

    // Hiện/ẩn nút Đấu Giá trong buy-popover dựa vào auctionMode và cập nhật nút Mua
    const buyAuctionBtn = document.getElementById('buy-auction-btn');
    const buyYesBtn = document.getElementById('buy-yes-btn');
    const isAuctionMode = GameCore.settings?.auctionMode === true;
    if (buyAuctionBtn) {
      if (isAuctionMode) {
        buyAuctionBtn.classList.remove('hidden');
      } else {
        buyAuctionBtn.classList.add('hidden');
      }
    }

    if (buyYesBtn && GameCore.state.pendingTile) {
      const p = GameCore.getCurrentPlayer();
      const tile = GameCore.state.pendingTile;
      const effectivePrice = (p && p.hasDiscount) ? Math.round(tile.price * 0.5) : (tile.price || 0);
      const canAfford = !!(p && p.money >= effectivePrice);
      buyYesBtn.disabled = !canAfford;
    }
  }

  function closeTradeDetailModal() {
    activeDetailRequestId = null;
    if (tradeDetailModal) tradeDetailModal.classList.add('hidden');
  }

  function renderTradeDetailProps(container, propertyIds) {
    container.innerHTML = '';
    if (!propertyIds || !propertyIds.length) {
      container.innerHTML = '<div class="trade-prop-mini-empty">📦 Không kèm ô đất nào</div>';
      return;
    }

    const groupColors = {
      BROWN: '#8d5524',
      LIGHT_BLUE: '#4fc3f7',
      PINK: '#f06292',
      ORANGE: '#fb8c00',
      RED: '#ef5350',
      YELLOW: '#fdd835',
      GREEN: '#43a047',
      DARK_BLUE: '#3949ab',
      RAILROAD: '#607d8b',
      UTILITY: '#00b894'
    };

    propertyIds.forEach(id => {
      const tile = GameCore.state.board.find(t => t.id === id);
      if (!tile) return;
      const color = groupColors[tile.group] || (tile.type === 'RAILROAD' ? '#607d8b' : '#00b894');
      const icon = tile.type === 'RAILROAD' ? '🚆' : tile.type === 'UTILITY' ? '💡' : '🏠';

      const item = document.createElement('div');
      item.className = 'trade-detail-prop-item';
      item.style.borderLeft = `4px solid ${color}`;

      let houseText = '';
      if (tile.type === 'PROPERTY') {
        if (tile.houses === 5) houseText = '🏨 Khách sạn';
        else if (tile.houses > 0) houseText = `🏠 x${tile.houses}`;
      }
      const mortgageText = tile.mortgaged ? '🏦 Cầm cố' : '';

      item.innerHTML = `
        <div class="prop-item-main">
          <span class="prop-item-icon">${icon}</span>
          <span class="prop-item-name" title="${tile.name}">${tile.name}</span>
        </div>
        <div class="prop-item-sub">
          <span class="prop-item-price">🏷️ $${tile.price || 0}</span>
          ${houseText ? `<span class="prop-item-house">${houseText}</span>` : ''}
          ${mortgageText ? `<span class="prop-item-mortgage">${mortgageText}</span>` : ''}
        </div>
      `;
      container.appendChild(item);
    });
  }

  function renderTradeDetailCards(container, cardIds) {
    if (!container) return;
    const catalog = window.GameCore.Shop?.cardCatalog || [];
    const cards = (cardIds || []).map(cardId => catalog.find(card => card.id === cardId)).filter(Boolean);
    container.innerHTML = cards.length
      ? cards.map(card => `<div class="trade-detail-card-item"><span>${card.title}</span><small>${card.rarity}</small></div>`).join('')
      : '<div class="trade-prop-mini-empty">🃏 Không kèm thẻ bài</div>';
  }

  function openTradeDetailModal(request) {
    if (!request || !tradeDetailModal) return;
    activeDetailRequestId = request.id;
    syncTradeModalWidth(tradeDetailModal);

    const fromP = GameCore.state.players.find(p => p.id === request.fromPlayerId);
    const toP = GameCore.state.players.find(p => p.id === request.toPlayerId);

    const fromBadgeEl = document.getElementById('trade-detail-from-badge');
    const fromNameEl = document.getElementById('trade-detail-from-name');
    const toBadgeEl = document.getElementById('trade-detail-to-badge');
    const toNameEl = document.getElementById('trade-detail-to-name');

    if (fromBadgeEl) {
      fromBadgeEl.innerText = fromP?.tokenEmoji || '👤';
      fromBadgeEl.style.borderColor = fromP?.color || '#ffffff';
    }
    if (fromNameEl) {
      fromNameEl.innerText = `${fromP ? fromP.name : 'Người chơi'} (P${fromP?.id || 1})`;
    }
    if (toBadgeEl) {
      toBadgeEl.innerText = toP?.tokenEmoji || '👤';
      toBadgeEl.style.borderColor = toP?.color || '#ffffff';
    }
    if (toNameEl) {
      toNameEl.innerText = `${toP ? toP.name : 'Người chơi'} (P${toP?.id || 2})`;
    }

    const fromCashEl = document.getElementById('trade-detail-from-cash');
    const toCashEl = document.getElementById('trade-detail-to-cash');
    if (fromCashEl) fromCashEl.innerHTML = `💰 Tiền đưa: <b>$${request.offerCash || 0}</b>`;
    if (toCashEl) toCashEl.innerHTML = `💰 Tiền yêu cầu: <b>$${request.requestCash || 0}</b>`;

    const fromPropsEl = document.getElementById('trade-detail-from-props');
    const toPropsEl = document.getElementById('trade-detail-to-props');
    renderTradeDetailCards(document.getElementById('trade-detail-from-cards'), request.offerCardIds);
    renderTradeDetailCards(document.getElementById('trade-detail-to-cards'), request.requestCardIds);
    if (fromPropsEl) renderTradeDetailProps(fromPropsEl, request.offerPropertyIds);
    if (toPropsEl) renderTradeDetailProps(toPropsEl, request.requestPropertyIds);

    const actionsContainer = document.getElementById('trade-detail-actions');
    if (actionsContainer) {
      actionsContainer.innerHTML = '';
      const online = !!(window.GameOnline && GameOnline.isOnline());
      const playerIndex = online ? GameOnline.myIndex : GameCore.state.currentPlayerIndex;
      const me = GameCore.state.players[playerIndex];

      const isReceiver = me && (request.toPlayerId === me.id || !online);
      const isSender = me && (request.fromPlayerId === me.id);

      if (isReceiver) {
        const acceptBtn = document.createElement('button');
        acceptBtn.className = 'btn btn-buy trade-detail-accept-btn';
        acceptBtn.innerText = '✅ CHẤP NHẬN TRAO ĐỔI';
        acceptBtn.addEventListener('click', () => {
          if (online) {
            GameOnline.sendAction('ACCEPT_TRADE', { requestId: request.id });
          } else {
            GameCore.acceptTrade(request.toPlayerId, request.id);
            renderUI();
          }
          closeTradeDetailModal();
        });
        actionsContainer.appendChild(acceptBtn);

        const declineBtn = document.createElement('button');
        declineBtn.className = 'btn btn-skip trade-detail-decline-btn';
        declineBtn.innerText = '❌ TỪ CHỐI';
        declineBtn.addEventListener('click', () => {
          if (online) {
            GameOnline.sendAction('DECLINE_TRADE', { requestId: request.id });
          } else {
            GameCore.declineTrade(me.id, request.id);
            renderUI();
          }
          closeTradeDetailModal();
        });
        actionsContainer.appendChild(declineBtn);
      } else if (isSender) {
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-skip trade-detail-cancel-btn';
        cancelBtn.innerText = '🗑️ HỦY ĐỀ NGHỊ';
        cancelBtn.addEventListener('click', () => {
          if (online) {
            GameOnline.sendAction('DECLINE_TRADE', { requestId: request.id });
          } else {
            GameCore.declineTrade(me.id, request.id);
            renderUI();
          }
          closeTradeDetailModal();
        });
        actionsContainer.appendChild(cancelBtn);
      }

    }

    tradeDetailModal.classList.remove('hidden');
  }

  function renderTradePanel() {
    const form = document.getElementById('trade-form');
    const requestsBox = document.getElementById('trade-requests');
    if (!form || !requestsBox) return;
    const online = !!(window.GameOnline && GameOnline.isOnline());
    const playerIndex = online ? GameOnline.myIndex : GameCore.state.currentPlayerIndex;
    const me = GameCore.state.players[playerIndex];
    if (!me) return;
    form.innerHTML = '';
    const newTradeBtn = document.createElement('button');
    newTradeBtn.type = 'button'; newTradeBtn.className = 'trade-submit'; newTradeBtn.innerText = '🤝 Tạo đề nghị trao đổi';
    const otherPlayers = GameCore.state.players.filter(player => player.id !== me.id && !player.isBankrupt);
    newTradeBtn.disabled = otherPlayers.length === 0;
    newTradeBtn.addEventListener('click', openTradePlayerModal);
    form.appendChild(newTradeBtn);

    requestsBox.innerHTML = '';
    const requests = GameCore.state.tradeRequests || [];

    // Nếu đang mở popup chi tiết một đề nghị không còn tồn tại -> tự động đóng
    if (activeDetailRequestId) {
      const activeReq = requests.find(r => r.id === activeDetailRequestId);
      if (!activeReq) {
        closeTradeDetailModal();
      }
    }

    if (!requests.length) {
      requestsBox.innerHTML = '<div class="trade-empty">Chưa có đề nghị trao đổi nào.</div>';
      return;
    }

    requests.forEach(request => {
      const fromP = GameCore.state.players.find(player => player.id === request.fromPlayerId);
      const toP = GameCore.state.players.find(player => player.id === request.toPlayerId);
      const fromName = fromP ? fromP.name : 'Người chơi';
      const toName = toP ? toP.name : 'Người chơi';
      const fromEmoji = fromP?.tokenEmoji || '👤';
      const toEmoji = toP?.tokenEmoji || '👤';

      const isMeTo = (me.id === request.toPlayerId);
      const isMeFrom = (me.id === request.fromPlayerId);

      const item = document.createElement('div');
      item.className = 'trade-preview-card';
      if (isMeTo) item.classList.add('incoming-for-me');
      else if (isMeFrom) item.classList.add('outgoing-from-me');

      item.innerHTML = `
        <div class="trade-preview-header">
          <div class="trade-preview-pair">
            <span class="preview-user" title="${fromName}">
              <span class="preview-token">${fromEmoji}</span> ${fromName}
            </span>
            <span class="preview-arrow">➔</span>
            <span class="preview-user" title="${toName}">
              <span class="preview-token">${toEmoji}</span> ${toName}
            </span>
          </div>
        </div>
      `;

      item.addEventListener('click', () => {
        openTradeDetailModal(request);
      });

      requestsBox.appendChild(item);
    });
  }

  function getTradeParticipants() {
    const online = !!(window.GameOnline && GameOnline.isOnline());
    const playerIndex = online ? GameOnline.myIndex : GameCore.state.currentPlayerIndex;
    const me = GameCore.state.players[playerIndex];
    const target = GameCore.state.players.find(player => player.id === tradeTargetPlayerId);
    return { online, me, target };
  }

  function openTradePlayerModal() {
    const { online, me } = getTradeParticipants();
    const select = document.getElementById('trade-player-select');
    if (!me || !select) return;
    const others = GameCore.state.players.filter(player => player.id !== me.id && !player.isBankrupt);
    select.innerHTML = '';
    others.forEach(player => {
      const option = document.createElement('option');
      option.value = player.id; option.innerText = player.name;
      select.appendChild(option);
    });
    tradeTargetPlayerId = Number(select.value) || null;
    syncTradeModalWidth(tradePlayerModal);
    tradePlayerModal.classList.remove('hidden');
  }

  function addTradePropertyOptions(container, properties) {
    container.innerHTML = '';
    if (!properties.length) {
      const empty = document.createElement('div');
      empty.className = 'trade-empty';
      empty.innerHTML = '<span>📦 Không có bất động sản nào</span>';
      container.appendChild(empty);
      return;
    }

    const groupColors = {
      BROWN: '#8d5524',
      LIGHT_BLUE: '#4fc3f7',
      PINK: '#f06292',
      ORANGE: '#fb8c00',
      RED: '#ef5350',
      YELLOW: '#fdd835',
      GREEN: '#43a047',
      DARK_BLUE: '#3949ab',
      RAILROAD: '#607d8b',
      UTILITY: '#00b894'
    };

    properties.forEach(tile => {
      const card = document.createElement('div');
      card.className = 'trade-property-card';
      const color = groupColors[tile.group] || (tile.type === 'RAILROAD' ? '#607d8b' : '#00b894');
      card.style.setProperty('--card-group-color', color);
      card.style.borderLeft = `5px solid ${color}`;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = tile.id;
      checkbox.className = 'trade-prop-checkbox';

      const icon = tile.type === 'RAILROAD' ? '🚆' : tile.type === 'UTILITY' ? '💡' : '🏠';

      // Tính tiền thuê
      let rentText = '';
      if (tile.type === 'RAILROAD') {
        const owned = GameCore.state.board.filter(t => t.type === 'RAILROAD' && t.owner === tile.owner).length;
        rentText = `$${[0, 25, 50, 100, 200][owned] || 0}`;
      } else if (tile.type === 'UTILITY') {
        const owned = GameCore.state.board.filter(t => t.type === 'UTILITY' && t.owner === tile.owner).length;
        rentText = owned === 2 ? '🎲 x10' : '🎲 x4';
      } else {
        const rents = (tile.rent && tile.rent.length >= 6) ? tile.rent : [Math.round((tile.price || 100) * 0.1)];
        let r = rents[tile.houses || 0] || rents[0] || 0;
        const isFullGroup = GameCore.ownsFullGroup ? GameCore.ownsFullGroup(tile) : false;
        if (GameCore.settings.doubleRentOnFullGroup && !tile.houses && isFullGroup) {
          rentText = `$${r * 2} (x2)`;
        } else {
          rentText = `$${r}`;
        }
      }

      const isHotel = tile.houses === 5;
      const housesBadge = tile.type === 'PROPERTY'
        ? (isHotel
            ? '<span class="trade-chip hotel-chip">🏨 Khách sạn</span>'
            : (tile.houses > 0
                ? `<span class="trade-chip house-chip">🏠 x${tile.houses}</span>`
                : '<span class="trade-chip empty-chip">🌱 Đất trống</span>'))
        : '';

      const mortgagedBadge = tile.mortgaged ? '<span class="trade-chip mortgage-chip">🏦 Cầm cố</span>' : '';

      card.innerHTML = `
        <div class="trade-card-top">
          <div class="trade-card-name-wrap">
            <span class="trade-card-icon">${icon}</span>
            <span class="trade-card-name" title="${tile.name}">${tile.name}</span>
          </div>
          <div class="trade-check-indicator">
            <span class="trade-check-mark">✔</span>
          </div>
        </div>
        <div class="trade-card-bottom">
          <span class="trade-chip price-chip">🏷️ $${tile.price || 0}</span>
          <span class="trade-chip rent-chip">💰 Thuê: ${rentText}</span>
          ${housesBadge}
          ${mortgagedBadge}
        </div>
      `;

      card.prepend(checkbox);

      const updateSelected = () => {
        if (checkbox.checked) {
          card.classList.add('selected');
        } else {
          card.classList.remove('selected');
        }
      };

      card.addEventListener('click', (e) => {
        if (e.target !== checkbox) {
          checkbox.checked = !checkbox.checked;
        }
        updateSelected();
      });

      checkbox.addEventListener('change', updateSelected);

      container.appendChild(card);
    });
  }

  function openTradeOfferModal() {
    const select = document.getElementById('trade-player-select');
    tradeTargetPlayerId = Number(select && select.value) || null;
    const { me, target } = getTradeParticipants();
    if (!me || !target) return;
    const offerCashInput = document.getElementById('trade-modal-offer-cash');
    const requestCashInput = document.getElementById('trade-modal-request-cash');
    document.getElementById('trade-offer-title').innerText = `🤝 Trao đổi với ${target.name}`;
    offerCashInput.value = '0';
    requestCashInput.value = '0';
    offerCashInput.max = String(Math.max(0, me.money || 0));
    requestCashInput.max = String(Math.max(0, target.money || 0));
    bindTradeCashLimit(offerCashInput, () => me.money);
    bindTradeCashLimit(requestCashInput, () => target.money);
    addTradePropertyOptions(document.getElementById('trade-modal-offer-properties'), GameCore.state.board.filter(tile => tile.owner === me.id));
    addTradePropertyOptions(document.getElementById('trade-modal-request-properties'), GameCore.state.board.filter(tile => tile.owner === target.id));
    addTradeCardOptions(document.getElementById('trade-modal-offer-cards'), me.shopCards || []);
    addTradeCardOptions(document.getElementById('trade-modal-request-cards'), target.shopCards || []);
    tradePlayerModal.classList.add('hidden');
    syncTradeModalWidth(tradeOfferModal);
    tradeOfferModal.classList.remove('hidden');
  }

  function addTradeCardOptions(container, cardIds) {
    if (!container) return;
    const catalog = window.GameCore.Shop?.cardCatalog || [];
    container.innerHTML = cardIds.length ? cardIds.map((cardId, index) => {
      const card = catalog.find(item => item.id === cardId);
      return card ? `<label class="trade-card-option"><input type="checkbox" value="${card.id}" data-card-index="${index}"><span>${card.title} <small>${card.rarity}</small></span></label>` : '';
    }).join('') : '<div class="trade-empty">Không có thẻ bài</div>';
  }

  function bindTradeCashLimit(input, getAvailableCash) {
    if (!input || input.dataset.tradeCashLimitBound) return;
    input.dataset.tradeCashLimitBound = 'true';
    input.addEventListener('input', () => {
      const availableCash = Math.max(0, Number(getAvailableCash()) || 0);
      const enteredCash = Number(input.value);
      if (!Number.isFinite(enteredCash) || enteredCash < 0) {
        input.value = '0';
      } else if (enteredCash > availableCash) {
        input.value = String(availableCash);
      }
    });
  }

  function submitTradeRequest() {
    const { online, me, target } = getTradeParticipants();
    if (!target || !me) return;
    const ids = selector => [...document.querySelectorAll(`${selector} input:checked`)].map(input => Number(input.value));
    const offerCash = Math.max(0, Number(document.getElementById('trade-modal-offer-cash').value) || 0);
    const requestCash = Math.max(0, Number(document.getElementById('trade-modal-request-cash').value) || 0);
    const offerPropertyIds = ids('#trade-modal-offer-properties');
    const requestPropertyIds = ids('#trade-modal-request-properties');
    const offerCardIds = [...document.querySelectorAll('#trade-modal-offer-cards input:checked')].map(input => input.value);
    const requestCardIds = [...document.querySelectorAll('#trade-modal-request-cards input:checked')].map(input => input.value);
    if (!offerCash && !requestCash && !offerPropertyIds.length && !requestPropertyIds.length && !offerCardIds.length && !requestCardIds.length) {
      alert('Hãy chọn tiền hoặc tài sản để trao đổi.');
      return;
    }
    if (me.money < offerCash) {
      alert(`Bạn chỉ có $${me.money}, không đủ $${offerCash} để đưa.`);
      return;
    }
    if (online) {
      GameOnline.sendAction('CREATE_TRADE', { trade: {
        toPlayerId: target.id, offerCash, requestCash, offerPropertyIds, requestPropertyIds, offerCardIds, requestCardIds
      }});
    } else {
      GameCore.createTrade(me.id, {
        toPlayerId: target.id, offerCash, requestCash, offerPropertyIds, requestPropertyIds, offerCardIds, requestCardIds
      });
      renderUI();
    }
    tradeOfferModal.classList.add('hidden');
  }

  function renderInventory() {
    const inventoryBox = document.getElementById('inventory-box');
    if (!inventoryBox) return;

    const online = !!(window.GameOnline && GameOnline.isOnline());
    const playerIndex = online
      ? GameOnline.myIndex
      : GameCore.state.currentPlayerIndex;
    const player = GameCore.state.players[playerIndex];
    const properties = player
      ? GameCore.state.board.filter(tile => tile.owner === player.id)
      : [];
    const ownedCards = player?.shopCards || [];
    const cardCatalog = window.GameCore.Shop?.cardCatalog || [];

    inventoryBox.innerHTML = '';
    if (!properties.length && !ownedCards.length) {
      const empty = document.createElement('div');
      empty.className = 'inventory-empty';
      empty.innerHTML = '<span>🎒 Chưa sở hữu tài sản nào.</span>';
      inventoryBox.appendChild(empty);
      return;
    }

    ownedCards.forEach(cardId => {
      const card = cardCatalog.find(item => item.id === cardId);
      if (!card) return;
      const item = document.createElement('div');
      item.className = `inventory-item inventory-card rarity-${card.rarity}`;
      item.innerHTML = `<div class="inventory-item-header"><div class="inventory-item-name"><span class="inventory-icon">${card.title.split(' ')[0]}</span><span class="inventory-title-text">${card.title.replace(/^\S+\s*/, '')}</span></div></div><div class="inventory-item-details"><span class="inv-detail-chip">${card.rarity}</span><span class="inv-detail-chip price">🪙 $${card.price}</span></div><div class="inventory-card-description">${card.text}</div><button class="inventory-use-card" type="button">Dùng thẻ</button>`;
      item.querySelector('.inventory-use-card').addEventListener('click', event => {
        event.stopPropagation();
        window.GameCore.Shop.useCard(player, cardId);
      });
      inventoryBox.appendChild(item);
    });

    const groupColors = {
      BROWN: '#8d5524',
      LIGHT_BLUE: '#4fc3f7',
      PINK: '#f06292',
      ORANGE: '#fb8c00',
      RED: '#ef5350',
      YELLOW: '#fdd835',
      GREEN: '#43a047',
      DARK_BLUE: '#3949ab',
      RAILROAD: '#607d8b',
      UTILITY: '#00b894'
    };

    const groupNames = {
      BROWN: 'Nâu',
      LIGHT_BLUE: 'Xanh nhạt',
      PINK: 'Hồng',
      ORANGE: 'Cam',
      RED: 'Đỏ',
      YELLOW: 'Vàng',
      GREEN: 'Xanh lá',
      DARK_BLUE: 'Xanh đậm',
      RAILROAD: 'Nhà Ga',
      UTILITY: 'Công Trình'
    };

    properties.forEach(tile => {
      const tileIdx = GameCore.state.board.findIndex(t => t.id === tile.id);
      const isSelected = (selectedTileIndex === tileIdx);

      const item = document.createElement('div');
      item.className = `inventory-item ${isSelected ? 'selected' : ''}`;
      const color = groupColors[tile.group] || (tile.type === 'RAILROAD' ? '#607d8b' : '#00b894');
      item.style.setProperty('--card-group-color', color);
      item.style.borderLeft = `5px solid ${color}`;

      const icon = tile.type === 'RAILROAD' ? '🚆' : tile.type === 'UTILITY' ? '💡' : '🏠';

      // Tính tiền thuê hiện tại
      let rentText = '';
      if (tile.type === 'RAILROAD') {
        const owned = properties.filter(t => t.type === 'RAILROAD').length;
        rentText = `$${[0, 25, 50, 100, 200][owned] || 0}`;
      } else if (tile.type === 'UTILITY') {
        const owned = properties.filter(t => t.type === 'UTILITY').length;
        rentText = owned === 2 ? '🎲 x10' : '🎲 x4';
      } else {
        const rents = (tile.rent && tile.rent.length >= 6) ? tile.rent : [Math.round((tile.price || 100) * 0.1)];
        let r = rents[tile.houses || 0] || rents[0] || 0;
        const isFullGroup = GameCore.ownsFullGroup ? GameCore.ownsFullGroup(tile) : false;
        if (GameCore.settings.doubleRentOnFullGroup && !tile.houses && isFullGroup) {
          rentText = `$${r * 2} (x2)`;
        } else {
          rentText = `$${r}`;
        }
      }

      const isHotel = tile.houses === 5;
      const housesBadge = tile.type === 'PROPERTY'
        ? (isHotel
            ? '<span class="inv-badge hotel-badge">🏨 Khách sạn</span>'
            : (tile.houses > 0
                ? `<span class="inv-badge house-badge">🏠 x${tile.houses}</span>`
                : '<span class="inv-badge empty-badge">🌱 Đất trống</span>'))
        : '';

      const isFullGroup = (tile.type === 'PROPERTY' && GameCore.ownsFullGroup && GameCore.ownsFullGroup(tile));
      const fullGroupBadge = isFullGroup ? '<span class="inv-badge full-badge">✨ Trọn bộ</span>' : '';
      const mortgageBadge = tile.mortgaged ? '<span class="inv-badge mortgage-badge">🏦 Đang cầm cố</span>' : '';

      item.innerHTML = `
        <div class="inventory-item-header">
          <div class="inventory-item-name">
            <span class="inventory-icon">${icon}</span>
            <span class="inventory-title-text">${tile.name}</span>
          </div>
        </div>
        <div class="inventory-item-details">
          <span class="inv-detail-chip price">🏷️ $${tile.price || 0}</span>
          <span class="inv-detail-chip rent">💰 Thuê: <b>${rentText}</b></span>
        </div>
        <div class="inventory-item-badges">
          ${housesBadge}
          ${fullGroupBadge}
          ${mortgageBadge}
        </div>
      `;

      item.title = 'Bấm để xem chi tiết & quản lý bất động sản';
      item.addEventListener('click', () => {
        if (tileIdx >= 0) {
          openPropertyCard(tileIdx);
          renderInventory();
        }
      });

      inventoryBox.appendChild(item);
    });
  }

  // =========================================================
  // KIỂM TRA PHÁ SẢN & CHIẾN THẮNG
  // =========================================================

  // Track which players we already showed bankruptcy for (avoid repeats)
  const shownBankruptIds = new Set();

  function checkAndShowBankruptcy() {
    GameCore.state.players.forEach(player => {
      if (!player.isBankrupt) return;
      if (shownBankruptIds.has(player.id)) return;
      shownBankruptIds.add(player.id);

      const modal = document.getElementById('bankruptcy-modal');
      const nameEl = document.getElementById('bankruptcy-player-name');
      if (!modal || !nameEl) return;
      nameEl.innerText = `${player.tokenEmoji || '💀'} ${player.name} đã phá sản!`;
      modal.classList.remove('hidden');
    });
  }

  document.getElementById('bankruptcy-close-btn')?.addEventListener('click', () => {
    document.getElementById('bankruptcy-modal')?.classList.add('hidden');
  });

  function launchFireworks(container) {
    const colors = ['#fdcb6e','#f39c12','#ffeaa7','#55efc4','#74b9ff','#fd79a8','#e17055','#a29bfe'];
    const PARTICLE_COUNT = 60;
    container.innerHTML = '';
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = document.createElement('div');
      p.className = 'firework-particle';
      const color = colors[Math.floor(Math.random() * colors.length)];
      const angle = Math.random() * Math.PI * 2;
      const dist = 80 + Math.random() * 200;
      const tx = Math.cos(angle) * dist;
      const ty = -(60 + Math.random() * dist);
      const dur = 0.8 + Math.random() * 1.0;
      const delay = Math.random() * 1.2;
      const startX = 20 + Math.random() * 60; // % from left
      const startY = 20 + Math.random() * 60; // % from top
      p.style.cssText = `
        left:${startX}%;top:${startY}%;
        background:${color};
        --tx:${tx}px;--ty:${ty}px;
        --dur:${dur}s;--delay:${delay}s;
      `;
      container.appendChild(p);
    }
    // Relaunch every 2s for continuous fireworks
    return setInterval(() => launchFireworks(container), 2200);
  }

  let fireworksInterval = null;

  function showVictoryScreen(winner, players) {
    const overlay = document.getElementById('victory-overlay');
    if (!overlay || overlay._shown) return;
    overlay._shown = true;

    // Fill winner info
    document.getElementById('victory-winner-token').innerText = winner?.tokenEmoji || '🏆';
    document.getElementById('victory-winner-name').innerText = winner?.name || 'Không có người chiến thắng';
    const worth = winner?.finalNetWorth ?? (winner ? GameCore.netWorth?.(winner) ?? winner.money : 0);
    document.getElementById('victory-net-worth').innerText = `💰 Tổng tài sản: $${worth.toLocaleString()}`;

    // Build rankings: alive first sorted by net worth desc, then bankrupt sorted by order
    const alive = players.filter(p => !p.isBankrupt).sort((a,b) => (b.finalNetWorth ?? b.money) - (a.finalNetWorth ?? a.money));
    const bankrupt = players.filter(p => p.isBankrupt);
    const ranked = [...alive, ...bankrupt];
    const rankingEl = document.getElementById('victory-rankings');
    rankingEl.innerHTML = '';
    const medals = ['🥇','🥈','🥉'];
    ranked.forEach((p, i) => {
      const row = document.createElement('div');
      row.className = `victory-rank-item${p.isBankrupt ? ' victory-rank-bankrupt' : ''}`;
      const w = p.finalNetWorth ?? p.money;
      row.innerHTML = `
        <span class="victory-rank-pos">${medals[i] || `#${i+1}`}</span>
        <span class="victory-rank-emoji">${p.tokenEmoji || '🎯'}</span>
        <span class="victory-rank-name">${p.name}</span>
        <span class="victory-rank-worth">$${w.toLocaleString()}</span>
      `;
      rankingEl.appendChild(row);
    });

    // Launch fireworks
    const fw = document.getElementById('victory-fireworks');
    if (fw) {
      if (fireworksInterval) clearInterval(fireworksInterval);
      fireworksInterval = launchFireworks(fw);
    }

    overlay.classList.remove('hidden');
  }

  // ---- NÚT CHƠI LẠI / VỀ LOBBY (chỉ cho OFFLINE) ----
  // Online mode: nút này được xử lý hoàn toàn trong online.js (hookButtons)
  document.getElementById('victory-play-again-btn')?.addEventListener('click', () => {
    if (window.GameOnline && GameOnline.isOnline && GameOnline.isOnline()) return; // online.js xử lý
    const overlay = document.getElementById('victory-overlay');
    if (overlay) { overlay.classList.add('hidden'); overlay._shown = false; }
    if (fireworksInterval) { clearInterval(fireworksInterval); fireworksInterval = null; }
    shownBankruptIds.clear();
    // Offline restart
    const currentPlayers = GameCore.state.players.map(p => ({ name: p.name, emoji: p.tokenEmoji, color: p.color }));
    GameCore.initGame({
      playerCount: currentPlayers.length,
      playerTokens: currentPlayers.map(p => ({ name: p.name, emoji: p.emoji, color: p.color })),
      settings: GameCore.settings
    });
    buildBoard();
    buildPlayersUI();
    renderUI();
  });

  document.getElementById('victory-lobby-btn')?.addEventListener('click', () => {
    if (window.GameOnline && GameOnline.isOnline && GameOnline.isOnline()) return; // online.js xử lý
    const overlay = document.getElementById('victory-overlay');
    if (overlay) { overlay.classList.add('hidden'); overlay._shown = false; }
    if (fireworksInterval) { clearInterval(fireworksInterval); fireworksInterval = null; }
    shownBankruptIds.clear();
    // Offline -> về màn hình settings
    const settingsOv = document.getElementById('settings-overlay');
    if (settingsOv) settingsOv.classList.remove('hidden');
  });

  function updateTileOwnershipUI(index, ownerId) {

    const tileElem = document.getElementById(`tile-${index}`);
    if (!tileElem) return;

    // Xoá các class sở hữu cũ
    GameCore.state.players.forEach((p) => {
      tileElem.classList.remove(`owned-p${p.id}`);
    });
    const oldBadge = document.getElementById(`owner-badge-${index}`);
    if (oldBadge) oldBadge.remove();

    if (ownerId === null || ownerId === undefined) return;

    const owner = GameCore.state.players.find((p) => p.id === ownerId);
    if (!owner) return;

    tileElem.classList.add(`owned-p${ownerId}`);
    const badge = document.createElement('div');
    badge.id = `owner-badge-${index}`;
    badge.className = `owner-badge owner-badge-p${ownerId}`;
    badge.style.backgroundColor = owner.color;
    badge.innerText = `🚩 P${ownerId}`;
    tileElem.appendChild(badge);
  }

function updateTileBadgeUI(index, houses) {
    const tileElem = document.getElementById(`tile-${index}`);
    if (!tileElem) return;
    let houseStrip = document.getElementById(`house-strip-${index}`);

    if (houses <= 0) {
      if (houseStrip) houseStrip.remove();
      tileElem.classList.remove('house-strip-active');
      return;
    }

    const groupBar = tileElem.querySelector('.group-bar');
    if (!groupBar) {
      if (houseStrip) houseStrip.remove();
      tileElem.classList.remove('house-strip-active');
      return;
    }

    tileElem.classList.add('house-strip-active');
    if (!houseStrip) {
      houseStrip = document.createElement('div');
      houseStrip.id = `house-strip-${index}`;
      houseStrip.className = 'house-tile-strip';
      const groupStyle = getComputedStyle(groupBar);
      houseStrip.style.background = groupStyle.background;
      const houseBadge = document.createElement('div');
      houseBadge.id = `house-tile-${index}`;
      houseBadge.className = 'house-tile-badge';
      houseStrip.appendChild(houseBadge);
      tileElem.appendChild(houseStrip);
    }
    const houseBadge = houseStrip.querySelector('.house-tile-badge');
    houseBadge.innerText = houses === 5 ? "🏨" : `🏠${houses}`;
  }

  // ĐÁNH DẤU Ô ĐẤT ĐANG BỊ CẦM CỐ
  function updateTileMortgageUI(index, isMortgaged) {
    const tileElem = document.getElementById(`tile-${index}`);
    if (!tileElem) return;

    let mortgageBadge = document.getElementById(`mortgage-badge-${index}`);
    if (!isMortgaged) {
      if (mortgageBadge) mortgageBadge.remove();
      return;
    }
    if (!mortgageBadge) {
      mortgageBadge = document.createElement('div');
      mortgageBadge.id = `mortgage-badge-${index}`;
      mortgageBadge.className = 'mortgage-badge';
      mortgageBadge.innerText = '🔒';
      mortgageBadge.title = 'Đang bị cầm cố';
      tileElem.appendChild(mortgageBadge);
    }
  }

  // HIỆU ỨNG GLOW & VIỀN ĐẬM KHI SỞ HỮU TRỌN NHÓM MÀU (KHÔNG CẦM CỐ)
  function updateGroupGlowUI() {
    const { board, players } = GameCore.state;
    const groups = {};
    board.forEach((tile, index) => {
      if (tile && tile.type === "PROPERTY" && tile.group) {
        if (!groups[tile.group]) groups[tile.group] = [];
        groups[tile.group].push(index);
      }
    });

    const monopolizedGroups = {};
    for (const groupName in groups) {
      const indices = groups[groupName];
      const firstOwner = board[indices[0]].owner;
      const allOwned = indices.every(i => board[i].owner !== null && board[i].owner !== undefined);
      const allSameOwner = indices.every(i => board[i].owner === firstOwner);
      const noneMortgaged = indices.every(i => !board[i].mortgaged);
      if (allOwned && allSameOwner && noneMortgaged && firstOwner !== null) {
        monopolizedGroups[groupName] = firstOwner;
      }
    }

    board.forEach((tile, index) => {
      const tileElem = document.getElementById(`tile-${index}`);
      if (!tileElem) return;

      // Xóa các class glow cũ
      tileElem.classList.remove('tile-full-group', 'group-glow');
      players.forEach(p => {
        tileElem.classList.remove(`group-glow-p${p.id}`);
      });

      if (tile.group && monopolizedGroups[tile.group] !== undefined) {
        const ownerId = monopolizedGroups[tile.group];
        tileElem.classList.add('tile-full-group', 'group-glow', `group-glow-p${ownerId}`);
      }
    });
  }

  // =========================================================
  // MỞ THẺ THÔNG TIN ĐẤT
  // =========================================================
  function openPropertyCard(index) {
    selectedTileIndex = index;
    const tile = GameCore.state.board[index];
    const pos = getGridPosition(index);
    const currentPlayer = GameCore.getCurrentPlayer();

    infoCardModal.classList.remove('weather-info-card');

    document.getElementById('info-card-name').innerText = tile.name;

    const footerHouse = document.getElementById('info-footer-house');
    const footerHotel = document.getElementById('info-footer-hotel');
    for (let i = 0; i <= 5; i++) {
      const rentElem = document.getElementById(`info-rent-${i}`);
      const labelElem = document.getElementById(`info-rent-${i}-label`);
      const row = (rentElem && rentElem.parentElement) || (labelElem && labelElem.parentElement);
      if (row) row.style.display = '';
    }
    if (footerHouse) footerHouse.style.display = '';
    if (footerHotel) footerHotel.style.display = '';

    const isRailroad = tile.type === "RAILROAD";
    const isUtility = tile.type === "UTILITY";

    if (isRailroad) {
      const railroadRents = ['$ 25', '$ 50', '$ 100', '$ 200'];
      const labels = ['Sở hữu 1 ga', 'Sở hữu 2 ga', 'Sở hữu 3 ga', 'Sở hữu 4 ga'];
      for (let i = 0; i <= 5; i++) {
        const rentElem = document.getElementById(`info-rent-${i}`);
        const labelElem = document.getElementById(`info-rent-${i}-label`);
        const row = rentElem ? rentElem.parentElement : (labelElem ? labelElem.parentElement : null);
        if (rentElem) rentElem.innerText = railroadRents[i] || '';
        if (labelElem) labelElem.innerText = labels[i] || '';
        if (row) row.style.display = (i >= 4) ? 'none' : '';
      }
      document.getElementById('info-table-when').innerText = 'Ga';
      document.getElementById('info-table-get').innerText = 'Thuê';
      if (footerHouse) footerHouse.style.display = 'none';
      if (footerHotel) footerHotel.style.display = 'none';
      document.getElementById('info-card-price').innerText = `$ ${tile.price || 0}`;
      document.getElementById('info-card-house').innerText = '$ 0';
      document.getElementById('info-card-hotel').innerText = '$ 0';
    } else if (isUtility) {
      // Check xem có phải Trạm Khí Tượng không
      const isWeatherStation = tile.name && (tile.name.includes('Khí Tượng') || tile.name.includes('Dự Báo'));

      if (isWeatherStation) {
        // === TRẠM KHÍ TƯỢNG: Hiển thị 4 loại thời tiết ===
        infoCardModal.classList.add('weather-info-card');
        const weatherTypes = [
          {
            emoji: '🌧️',
            name: 'Mưa Ngập',
            label: '🌧️ Mưa Ngập (3 lượt)',
            effects: 'Lùi 1 ô · Được xây'
          },
          {
            emoji: '☀️',
            name: 'Nắng Nóng',
            label: '☀️ Nắng Nóng (3 lượt)',
            effects: 'Chủ đất lời hơn'
          },
          {
            emoji: '🌪️',
            name: 'Bão Lớn',
            label: '🌪️ Bão Lớn (2 lượt)',
            effects: 'Hạ 1 cấp mọi ô · Cấm xây'
          },
          {
            emoji: '🍃',
            name: 'Gió Nhẹ',
            label: '🍃 Gió Nhẹ (3 lượt)',
            effects: 'Cộng 2 ô mỗi lượt'
          }
        ];

        for (let i = 0; i <= 5; i++) {
          const rentElem = document.getElementById(`info-rent-${i}`);
          const labelElem = document.getElementById(`info-rent-${i}-label`);
          const row = rentElem ? rentElem.parentElement : (labelElem ? labelElem.parentElement : null);
          
          if (i < weatherTypes.length) {
            const weather = weatherTypes[i];
            if (rentElem) rentElem.innerText = weather.effects;
            if (labelElem) labelElem.innerText = weather.label;
            if (row) row.style.display = '';
          } else {
            if (row) row.style.display = 'none';
          }
        }
        
        document.getElementById('info-table-when').innerText = 'Thời tiết';
        document.getElementById('info-table-get').innerText = 'Hiệu ứng';
        if (footerHouse) footerHouse.style.display = 'none';
        if (footerHotel) footerHotel.style.display = 'none';
        document.getElementById('info-card-price').innerText = `$ ${tile.price || 0}`;
        document.getElementById('info-card-house').innerText = 'Kích hoạt';
        document.getElementById('info-card-hotel').innerText = 'Hiệu ứng';
      } else {
        // === NHÂN CỘNG THƯỜNG (Nhà máy) ===
        const utilityLabels = ['Sở hữu 1 nhà máy', 'Sở hữu 2 nhà máy', '', '', '', ''];
        const utilityValues = ['x4 tiền xúc xắc', 'x10 tiền xúc xắc', '', '', '', ''];
        for (let i = 0; i <= 5; i++) {
          const rentElem = document.getElementById(`info-rent-${i}`);
          const labelElem = document.getElementById(`info-rent-${i}-label`);
          const row = rentElem ? rentElem.parentElement : (labelElem ? labelElem.parentElement : null);
          if (rentElem) rentElem.innerText = utilityValues[i] || '';
          if (labelElem) labelElem.innerText = utilityLabels[i] || '';
          if (row) row.style.display = (i >= 2) ? 'none' : '';
        }
        document.getElementById('info-table-when').innerText = 'Sở hữu';
        document.getElementById('info-table-get').innerText = 'Tiền thuê';
        if (footerHouse) footerHouse.style.display = 'none';
        if (footerHotel) footerHotel.style.display = 'none';
        document.getElementById('info-card-price').innerText = `$ ${tile.price || 0}`;
        document.getElementById('info-card-house').innerText = '$ 0';
        document.getElementById('info-card-hotel').innerText = '$ 0';
      }
    } else {
      const defaultRent = [
        Math.round((tile.price || 100) * 0.08),
        Math.round((tile.price || 100) * 0.4),
        Math.round((tile.price || 100) * 1.2),
        Math.round((tile.price || 100) * 3.2),
        Math.round((tile.price || 100) * 5.5),
        Math.round((tile.price || 100) * 7.5)
      ];
      const rents = (tile.rent && tile.rent.length >= 6) ? tile.rent : defaultRent;

      for (let i = 0; i <= 5; i++) {
        const rentElem = document.getElementById(`info-rent-${i}`);
        const labelElem = document.getElementById(`info-rent-${i}-label`);
        if (rentElem) rentElem.innerText = `$ ${rents[i]}`;
        if (labelElem) labelElem.parentElement.style.display = '';
      }
      document.getElementById('info-table-when').innerText = 'Khi';
      document.getElementById('info-table-get').innerText = 'Nhận';
      if (footerHouse) footerHouse.style.display = '';
      if (footerHotel) footerHotel.style.display = '';

      const houseCost = tile.housePrice || Math.round((tile.price || 100) * 0.75);
      document.getElementById('info-card-price').innerText = `$ ${tile.price || 0}`;
      document.getElementById('info-card-house').innerText = `$ ${houseCost}`;
      document.getElementById('info-card-hotel').innerText = `$ ${houseCost}`;
    }

    // QUẢN LÝ NÚT THAO TÁC
    const controlsDiv = document.getElementById('info-card-controls');
    const btnBuild = document.getElementById('btn-build-house');
    const btnSell = document.getElementById('btn-sell-house');
    const btnMortgage = document.getElementById('btn-mortgage');
    controlsDiv.classList.remove('unavailable-property-controls');

    const isWeatherStationTile = tile.name && (tile.name.includes('Khí Tượng') || tile.name.includes('Dự Báo'));
    if (isWeatherStationTile) controlsDiv.classList.add('hidden');
    else controlsDiv.classList.remove('hidden');

    const online = !!(window.GameOnline && GameOnline.isOnline());
    const localPlayerIndex = online ? GameOnline.myIndex : GameCore.state.currentPlayerIndex;
    const isMyTurn = (online ? (GameOnline.myIndex === GameCore.state.currentPlayerIndex) : true);
    const localPlayer = GameCore.state.players[localPlayerIndex] || currentPlayer;

    if (tile.owner === localPlayer.id) {
      controlsDiv.classList.remove('hidden');
      const houses = tile.houses || 0;
      const houseCost = tile.housePrice || Math.round((tile.price || 100) * 0.75);
      const isMortgaged = !!tile.mortgaged;
      const mortgageVal = Math.round(tile.price / 2);

      const canBuild = !!(GameCore.isBuildableProperty
        ? GameCore.isBuildableProperty(tile)
        : (tile.type === "PROPERTY" && tile.group && tile.price > 0));

      btnBuild.style.display = '';
      btnSell.style.display = '';
      btnBuild.disabled = true;
      btnSell.disabled = true;

      // Nếu đất đang bị CẦM CỐ thì KHÔNG được xây nhà / dỡ nhà nữa
      if (isMortgaged) {
        btnBuild.style.display = '';
        btnSell.style.display = '';
        btnBuild.disabled = true;
        btnBuild.innerText = `🏦 Đang bị cầm cố`;
        btnSell.disabled = true;
        btnSell.innerText = `📉 Dỡ nhà (bị cầm cố)`;
      } else {
        btnBuild.style.display = '';
        btnSell.style.display = '';

        const freeBuild = !!(GameCore.settings && GameCore.settings.freeBuildOnFullGroup);
        const isFullGroup = !!(tile.group && GameCore.ownsFullGroup && GameCore.ownsFullGroup(tile));

        if (!canBuild) {
          btnBuild.innerText = `🏠 Không thể xây tại ô này`;
          btnBuild.title = `Ô này không phải bất động sản có thể xây nhà`;
          btnSell.innerText = `📉 Không thể dỡ nhà`;
          btnMortgage.style.display = '';
        } else if (houses >= 5) {
          btnBuild.disabled = true;
          btnBuild.innerText = `🏨 Đã tối đa`;
          btnBuild.title = `Bất động sản đã đạt cấp Khách sạn tối đa`;
        } else if (freeBuild && !isFullGroup) {
          // Chế độ freeBuildOnFullGroup: chưa đủ trọn bộ màu -> khóa hoàn toàn
          btnBuild.disabled = true;
          btnBuild.innerText = `👑 Cần trọn bộ màu`;
          btnBuild.title = `Cần sở hữu trọn bộ nhóm màu mới được phép xây nhà`;
        } else if (localPlayer.hasBoughtPropertyThisTurn) {
          btnBuild.disabled = true;
          btnBuild.innerText = houses === 4 ? `🏨 Nâng cấp Khách sạn ($${houseCost})` : `🏠 Xây nhà ($${houseCost})`;
          btnBuild.title = `Không được xây nhà trong lượt vừa mua đất`;
        } else if (!isMyTurn) {
          btnBuild.disabled = true;
          btnBuild.innerText = houses === 4 ? `🏨 Chưa đến lượt ($${houseCost})` : `🏠 Chưa đến lượt ($${houseCost})`;
          btnBuild.title = `Chưa đến lượt của bạn`;
        } else if (!freeBuild && localPlayer.hasBuiltHouseThisTurn) {
          btnBuild.disabled = true;
          btnBuild.innerText = `⏳ Đã mua nhà lượt này`;
          btnBuild.title = `Mỗi lượt chỉ được mua nhà 1 lần trên toàn bộ bất động sản`;
        } else if (!freeBuild && tile.lastBuiltPlayerTurn && ((localPlayer.turnCount || 1) - tile.lastBuiltPlayerTurn < 2)) {
          btnBuild.disabled = true;
          btnBuild.innerText = `⏳ Cần cách 1 lượt`;
          btnBuild.title = `Ô đất này cần cách 1 lượt của bạn mới được nâng cấp tiếp`;
        } else if (localPlayer.money < houseCost) {
          btnBuild.disabled = true;
          btnBuild.innerText = houses === 4 ? `🏨 Thiếu tiền ($${houseCost})` : `🏠 Thiếu tiền ($${houseCost})`;
          btnBuild.title = `Bạn không đủ tiền để nâng cấp`;
        } else {
          btnBuild.disabled = false;
          btnBuild.innerText = houses === 4
            ? `🏨 Nâng cấp Khách sạn ($${houseCost})${freeBuild ? ' 👑' : ''}`
            : `🏠 Xây nhà ($${houseCost})${freeBuild ? ' 👑' : ''}`;
          btnBuild.title = freeBuild ? `Trọn bộ màu - Nâng nhà tự do!` : `Nâng cấp bất động sản`;
        }

        if (canBuild && houses > 0) {
          btnSell.disabled = !isMyTurn;
          btnSell.innerText = `📉 Dỡ nhà (+$${Math.round(houseCost / 2)})`;
        } else if (canBuild) {
          btnSell.disabled = true;
          btnSell.innerText = `📉 Dỡ nhà`;
        }
      }

      // Nút Cầm cố / Chuộc lại / Bán
      btnMortgage.disabled = !isMyTurn;
      if (GameCore.settings.mortgageInsteadOfSell) {
        btnMortgage.innerText = isMortgaged
          ? `🔓 Chuộc lại (+$${mortgageVal + Math.round(mortgageVal * 0.1)} = trả $${mortgageVal + Math.round(mortgageVal * 0.1)})`
          : `🏦 Cầm cố (+$${mortgageVal})`;
      } else {
        btnMortgage.innerText = `🏦 Bán hẳn (+$${mortgageVal})`;
      }
    } else {
      btnBuild.style.display = '';
      btnSell.style.display = '';
      btnBuild.disabled = true;
      btnSell.disabled = true;
      btnMortgage.disabled = true;
      controlsDiv.classList.add('unavailable-property-controls');
      btnBuild.innerText = '🏠 Xây nhà';
      btnSell.innerText = '📉 Dỡ nhà';
      btnMortgage.innerText = '🏦 Cầm cố / Bán (50%)';
      btnBuild.title = 'Chỉ chủ sở hữu mới được xây nhà';
      btnSell.title = 'Chỉ chủ sở hữu mới được dỡ nhà';
      btnMortgage.title = 'Chỉ chủ sở hữu mới được cầm cố hoặc bán ô đất';
    }

    // ĐỊNH VỊ POP-UP
    positionPopupNearTile(infoCardModal, index);

  }

  async function showCrossRouteChoice(choice, dice = 0, startPos = null) {
    if (!choice) return;
    let modal = document.getElementById('cross-route-choice');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'cross-route-choice';
      modal.className = 'cross-route-choice';
      document.body.appendChild(modal);
    }

    if (!modal.classList.contains('hidden') && modal.querySelector('.cross-route-dialog')) return;

    const fromName = GameCore.state.board[choice.from]?.name || `Ga #${choice.from}`;
    const toName = GameCore.state.board[choice.to]?.name || `Ga #${choice.to}`;
    modal.innerHTML = `
      <div class="cross-route-dialog">
        <div class="cross-route-title">🚉 Đã đến ${fromName}</div>
        <div class="cross-route-text">Chọn lối đi cho lượt kế tiếp</div>
        <div class="cross-route-destination">Đường trong sẽ đến ${toName}</div>
        <div class="cross-route-actions">
          <button type="button" class="cross-route-inner">✚ Đường trong</button>
          <button type="button" class="cross-route-outer">↻ Vòng ngoài</button>
        </div>
      </div>
    `;
    modal.classList.remove('hidden');

    const close = () => modal.classList.add('hidden');
    modal.querySelector('.cross-route-inner').addEventListener('click', async () => {
      close();
      if (window.GameOnline && GameOnline.isOnline && GameOnline.isOnline()) {
        GameOnline.sendAction('CHOOSE_CROSS_ROUTE', { useInnerRoute: true });
      } else {
        const result = GameCore.chooseCrossRoute(GameCore.getCurrentPlayer(), true);
        if (result && result.movementPath) {
          const playerIndex = GameCore.state.players.findIndex(player => player.id === result.playerId);
          await moveTokenStepByStep(playerTokens[playerIndex], startPos ?? result.startPos, dice, result.movementPath);
        }
        renderUI();
        updateTurnActionButton(false);
        showLandingInteraction(result);
      }
    });
    modal.querySelector('.cross-route-outer').addEventListener('click', async () => {
      close();
      if (window.GameOnline && GameOnline.isOnline && GameOnline.isOnline()) {
        GameOnline.sendAction('CHOOSE_CROSS_ROUTE', { useInnerRoute: false });
      } else {
        const result = GameCore.chooseCrossRoute(GameCore.getCurrentPlayer(), false);
        if (result && result.movementPath) {
          const playerIndex = GameCore.state.players.findIndex(player => player.id === result.playerId);
          await moveTokenStepByStep(playerTokens[playerIndex], startPos ?? result.startPos, dice, result.movementPath);
        }
        renderUI();
        updateTurnActionButton(false);
        showLandingInteraction(result);
      }
    });
  }

  function showLandingInteraction(result) {
    if (!result || result.action !== 'PROMPT_BUY') return;
    const tile = result.tile;
    const effectivePrice = result.effectivePrice !== undefined ? result.effectivePrice : tile.price;
    document.getElementById('modal-tile-name').innerText = tile.name;
    document.getElementById('modal-tile-price').innerText = result.discount
      ? `Giá ưu đãi (50%): $${effectivePrice} (Gốc: $${tile.price})`
      : `Giá: $${tile.price}`;
    const buyYesBtn = document.getElementById('buy-yes-btn');
    if (buyYesBtn) buyYesBtn.disabled = !result.canAfford;
    positionBuyPrompt(tile.id);
    buyModal.classList.remove('hidden');
    endTurnBtn.disabled = true;
  }

  document.addEventListener('game:cross-route-choice', (event) => {
    const detail = event.detail || {};
    showCrossRouteChoice(detail.crossRouteChoice, detail.dice, detail.startPos);
  });

  // =========================================================
  // HOẠT ẢNH DI CHUYỂN QUÂN CỜ
  // =========================================================
  async function moveTokenStepByStep(tokenElem, startPos, steps, movementPath = null) {
    tokenElem.classList.add('moving');
    const path = Array.isArray(movementPath) && movementPath.length > 0
      ? movementPath
      : Array.from({ length: steps }, (_, index) => (startPos + index + 1) % 40);
    for (const currentPos of path) {
      const targetTile = document.getElementById(`tile-${currentPos}`);
      if (targetTile) targetTile.appendChild(tokenElem);
      await new Promise(resolve => setTimeout(resolve, 110));
    }
    tokenElem.classList.remove('moving');
  }

  async function moveTokenWithStationPauses(tokenElem, startPos, movementPath, stationEvents = []) {
    const path = Array.isArray(movementPath) ? movementPath : [];
    let cursor = 0;
    for (const event of Array.isArray(stationEvents) ? stationEvents : []) {
      const stopAt = Math.max(cursor, Number(event.pathIndex) + 1);
      await moveTokenStepByStep(tokenElem, startPos, 0, path.slice(cursor, stopAt));
      const route = event.useInnerRoute
        ? [event.station, ...GameCore.getCrossRoute(event.station)]
        : (() => {
          const stations = [5, 15, 25, 35];
          const nextStation = stations.find(station => station > event.station) || stations[0];
          const distance = (nextStation - event.station + 40) % 40 || 40;
          return [event.station, ...Array.from(
            { length: distance },
            (_, index) => (event.station + index + 1) % 40
          )];
        })();
      await playDiceAnimation(event.roll, [event.roll, 1]);
      showStationRouteArrow(route);
      cursor = stopAt;
      startPos = path[cursor - 1] ?? startPos;
    }
    await moveTokenStepByStep(tokenElem, startPos, 0, path.slice(cursor));
  }

  function showStationRouteArrow(routePath = []) {
    document.querySelectorAll('.station-route-glow').forEach(tile => tile.classList.remove('station-route-glow'));
    if (!Array.isArray(routePath) || routePath.length < 2) return;
    routePath.slice(0, -1).forEach((position, index) => {
      const tile = document.getElementById(`tile-${position}`);
      if (!tile) return;
      tile.classList.add('station-route-glow');
    });
    setTimeout(() => {
      document.querySelectorAll('.station-route-glow').forEach(tile => tile.classList.remove('station-route-glow'));
    }, 2600);
  }

  // =========================================================
  // CỤC XÚC XẮC 2D TRUYỀN THỐNG (2D DICE DOTS)
  // =========================================================
  const DICE_PIP_POSITIONS = {
    1: [[2, 2]],
    2: [[1, 3], [3, 1]],
    3: [[1, 3], [2, 2], [3, 1]],
    4: [[1, 1], [1, 3], [3, 1], [3, 3]],
    5: [[1, 1], [1, 3], [2, 2], [3, 1], [3, 3]],
    6: [[1, 1], [1, 3], [2, 1], [2, 3], [3, 1], [3, 3]]
  };

  function renderDiceFace(elem, value) {
    if (!elem) return;
    const v = Math.max(1, Math.min(6, parseInt(value, 10) || 1));
    elem.dataset.val = v;
    elem.innerHTML = '';
    const pips = DICE_PIP_POSITIONS[v] || DICE_PIP_POSITIONS[1];
    pips.forEach(([row, col]) => {
      const pip = document.createElement('div');
      pip.className = 'dice-pip';
      pip.style.gridRow = row;
      pip.style.gridColumn = col;
      elem.appendChild(pip);
    });
  }

  async function playDiceAnimation(total, dicePair = null) {
    const first = document.getElementById('dice-one');
    const second = document.getElementById('dice-two');
    if (!first || !second) return;
    first.classList.add('rolling');
    second.classList.add('rolling');
    for (let i = 0; i < 7; i++) {
      renderDiceFace(first, Math.floor(Math.random() * 6) + 1);
      renderDiceFace(second, Math.floor(Math.random() * 6) + 1);
      await new Promise(resolve => setTimeout(resolve, 75));
    }
    let d1, d2;
    if (Array.isArray(dicePair) && dicePair.length === 2) {
      d1 = dicePair[0];
      d2 = dicePair[1];
    } else {
      d1 = Math.max(1, Math.min(6, Math.floor((total || 2) / 2)));
      d2 = Math.max(1, Math.min(6, (total || 2) - d1));
    }
    renderDiceFace(first, d1);
    renderDiceFace(second, d2);
    first.classList.remove('rolling');
    second.classList.remove('rolling');
  }

  // =========================================================
  // ĐẤU GIÁ (MỞ / CẬP NHẬT / ĐẶT GIÁ / BỎ LƯỢT)
  // =========================================================
  let selectedOfflineBidderIndex = -1;

  function openAuctionModal() {
    if (!auctionModal) return;
    const a = GameCore.state.auctionState;
    const tile = GameCore.state.auctionTile;
    if (!a || !tile) return;

    const isOnline = !!(window.GameOnline && GameOnline.isOnline && GameOnline.isOnline());
    if (!isOnline) {
      // Offline: Chọn bidder mặc định là người chơi hợp lệ đầu tiên
      const currentPIdx = GameCore.state.currentPlayerIndex;
      const currentP = GameCore.state.players[currentPIdx];
      if (currentP && !currentP.isBankrupt && a.eligibleIds && a.eligibleIds.includes(currentP.id)) {
        selectedOfflineBidderIndex = currentPIdx;
      } else {
        const firstEligibleId = a.eligibleIds && a.eligibleIds[0];
        selectedOfflineBidderIndex = GameCore.state.players.findIndex(p => p.id === firstEligibleId);
      }
    }

    document.getElementById('auction-tile-name').innerText = `🔨 Đấu giá: ${tile.name}`;
    renderAuctionModal();
    auctionModal.classList.remove('hidden');
    endTurnBtn.disabled = true;
    rollBtn.disabled = true;
    startAuctionTimer();
  }

  // Khởi động bộ đếm thời gian đấu giá - cập nhật mỗi 100ms để thanh trượt mượt
  function startAuctionTimer() {
    stopAuctionTimer();
    const a = GameCore.state.auctionState;
    if (!a || !a.active) return;
    // Đảm bảo timerEnd được set đúng khi bắt đầu
    if (!a.timerEnd || a.timerEnd < Date.now()) {
      a.timerEnd = Date.now() + (a.timerDuration || 5) * 1000;
    }
    updateAuctionTimerDisplay();
    auctionTimerInterval = setInterval(() => {
      const cur = GameCore.state.auctionState;
      if (!cur || !cur.active) {
        stopAuctionTimer();
        return;
      }
      updateAuctionTimerDisplay();
      // Hết giờ → kết thúc đấu giá (chỉ offline; online do server xử lý)
      if (Date.now() >= cur.timerEnd) {
        const isOnline = window.GameOnline && window.GameOnline.isOnline && window.GameOnline.isOnline();
        if (!isOnline) {
          stopAuctionTimer();
          GameCore.endAuction();
          handleAuctionEnd();
        }
      }
    }, 100); // 100ms = ~10fps animation mượt
  }

  function stopAuctionTimer() {
    if (auctionTimerInterval) {
      clearInterval(auctionTimerInterval);
      auctionTimerInterval = null;
    }
  }

  function updateAuctionTimerDisplay() {
    const a = GameCore.state.auctionState;
    if (!a || !auctionTimerEl) return;
    const durationMs = (a.timerDuration || 5) * 1000;
    const remaining = Math.max(0, a.timerEnd - Date.now());
    const percentage = Math.min(100, (remaining / durationMs) * 100);
    auctionTimerEl.style.width = `${percentage}%`;
    // Màu thay đổi: xanh → vàng → đỏ khi sắp hết giờ
    if (percentage > 60) {
      auctionTimerEl.style.background = 'linear-gradient(90deg, #00b894, #00cec9)';
    } else if (percentage > 30) {
      auctionTimerEl.style.background = 'linear-gradient(90deg, #fdcb6e, #f39c12)';
    } else {
      auctionTimerEl.style.background = 'linear-gradient(90deg, #ff6b6b, #e74c3c)';
    }
    // Hiển thị số giây còn lại
    const secsLeft = Math.ceil(remaining / 1000);
    const timerTrack = document.getElementById('auction-timer-track');
    if (timerTrack) {
      timerTrack.setAttribute('data-secs', secsLeft > 0 ? `${secsLeft}s` : '0s');
    }
  }

  function renderAuctionModal() {
    const a = GameCore.state.auctionState;
    if (!a) return;
    const highest = a.highestBidder ? `${a.highestBidder.tokenEmoji || ''} ${a.highestBidder.name}` : 'Chưa có';

    const currentBidEl = document.getElementById('auction-current-bid');
    const currentBidderEl = document.getElementById('auction-current-bidder');
    const turnEl = document.getElementById('auction-turn');
    const statusMsgEl = document.getElementById('auction-status-msg');

    if (currentBidEl) currentBidEl.innerHTML = `💰 Giá hiện tại: <b>$${a.currentBid}</b>`;
    if (currentBidderEl) currentBidderEl.innerHTML = `👤 Người trả giá cao nhất: <b>${highest}</b>`;
    if (turnEl) turnEl.innerHTML = `⏳ Thời gian: <b>ai đặt giá cao nhất sau 5s sẽ thắng!</b>`;

    const isOnline = !!(window.GameOnline && GameOnline.isOnline && GameOnline.isOnline());
    const offlineSection = document.getElementById('auction-offline-section');
    const offlineBiddersContainer = document.getElementById('auction-offline-bidders');
    const onlineInfo = document.getElementById('auction-online-info');
    const onlineBadge = document.getElementById('auction-online-player-badge');

    if (isOnline) {
      if (offlineSection) offlineSection.classList.add('hidden');
      if (onlineInfo) onlineInfo.classList.remove('hidden');

      const myIndex = GameOnline.myIndex;
      const me = GameCore.state.players[myIndex];
      const isEligible = !!(me && !me.isBankrupt && a.eligibleIds && a.eligibleIds.includes(me.id));

      if (onlineBadge && me) {
        onlineBadge.innerHTML = `👤 Bạn là: <b>${me.tokenEmoji || ''} ${me.name}</b> (Số dư: <b style="color: #55efc4;">$${me.money}</b>)`;
      }

      if (statusMsgEl) {
        if (!isEligible) {
          statusMsgEl.innerText = '⏭️ Bạn không đủ điều kiện hoặc đã bị loại khỏi đấu giá.';
          statusMsgEl.style.display = 'block';
        } else {
          statusMsgEl.innerText = '';
          statusMsgEl.style.display = 'none';
        }
      }

      // Cập nhật nút bấm cho Online
      auctionAddBtns.forEach(button => {
        const add = parseInt(button.dataset.add, 10) || 0;
        const targetBid = a.currentBid + add;
        const canAfford = isEligible && me && me.money >= targetBid;
        button.disabled = !canAfford;
        button.textContent = `+${add} ($${targetBid})`;
      });
    } else {
      // Offline mode: hiển thị danh sách người chơi chọn nhanh
      if (onlineInfo) onlineInfo.classList.add('hidden');
      if (offlineSection) offlineSection.classList.remove('hidden');

      if (offlineBiddersContainer) {
        offlineBiddersContainer.innerHTML = '';
        const eligiblePlayers = GameCore.state.players.filter(p =>
          !p.isBankrupt && a.eligibleIds && a.eligibleIds.includes(p.id)
        );

        if (selectedOfflineBidderIndex < 0 || !GameCore.state.players[selectedOfflineBidderIndex] || !a.eligibleIds.includes(GameCore.state.players[selectedOfflineBidderIndex].id)) {
          if (eligiblePlayers.length > 0) {
            selectedOfflineBidderIndex = GameCore.state.players.findIndex(p => p.id === eligiblePlayers[0].id);
          }
        }

        eligiblePlayers.forEach(p => {
          const pIdx = GameCore.state.players.findIndex(pl => pl.id === p.id);
          const chip = document.createElement('button');
          chip.type = 'button';
          chip.className = `bidder-chip ${pIdx === selectedOfflineBidderIndex ? 'selected' : ''}`;
          chip.innerHTML = `<span class="bidder-chip-emoji">${p.tokenEmoji || '🐊'}</span>
            <span>${p.name}</span>
            <span class="bidder-chip-money">($${p.money})</span>`;
          chip.addEventListener('click', (e) => {
            e.stopPropagation();
            selectedOfflineBidderIndex = pIdx;
            renderAuctionModal();
          });
          offlineBiddersContainer.appendChild(chip);
        });
      }

      const selectedBidder = GameCore.state.players[selectedOfflineBidderIndex];
      if (statusMsgEl) {
        if (!selectedBidder) {
          statusMsgEl.innerText = '⚠️ Hãy chọn một người chơi để đặt giá.';
          statusMsgEl.style.display = 'block';
        } else {
          statusMsgEl.innerText = '';
          statusMsgEl.style.display = 'none';
        }
      }

      // Cập nhật nút bấm cho Offline theo selectedBidder
      auctionAddBtns.forEach(button => {
        const add = parseInt(button.dataset.add, 10) || 0;
        const targetBid = a.currentBid + add;
        const canAfford = !!(selectedBidder && selectedBidder.money >= targetBid);
        button.disabled = !canAfford;
        button.textContent = `+${add} ($${targetBid})`;
      });
    }

    // Hiển thị quân cờ (token) của người trả giá cao nhất
    if (auctionHighestToken) {
      if (a.highestBidder) {
        auctionHighestToken.innerText = a.highestBidder.tokenEmoji || '🐊';
        auctionHighestToken.style.display = 'inline-block';
      } else {
        auctionHighestToken.style.display = 'none';
      }
    }

    updateAuctionTimerDisplay();

    const passBtn = document.getElementById('auction-pass-btn');
    if (passBtn) {
      passBtn.style.display = 'none';
    }
  }

  function closeAuctionModal() {
    stopAuctionTimer();
    if (auctionModal) auctionModal.classList.add('hidden');
    updateTurnActionButton(false);
    renderUI();
  }

  function handleAuctionEnd() {
    // Kết thúc đấu giá: đóng modal và cập nhật giao diện
    closeAuctionModal();
  }

  // =========================================================
  // SETTINGS: CÀI SỐ NGƯỜI CHƠI & BẮT ĐẦU
  // =========================================================
let chosenPlayerCount = 2;
  function updatePlayerCountDisplay() {
    playerCountVal.innerText = chosenPlayerCount;
  }

  // =========================================================
  // CHỌN NHÂN VẬT (QUÂN CỜ) CHO TỪNG NGƯỜI CHƠI
  // =========================================================
  let chosenTokens = [
    { name: "Sài Gòn Cá Sấu", emoji: "🐊" },
    { name: "Chợ Lớn Mèo", emoji: "🐱" },
    { name: "Hà Nội Chó", emoji: "🐶" },
    { name: "Đà Nẵng Chim", emoji: "🐦" },
    { name: "Cần Thơ Gấu", emoji: "🐻" },
    { name: "Vũng Tàu Thỏ", emoji: "🐰" },
    { name: "Huế Cá Vàng", emoji: "🐠" },
    { name: "Nha Trang Rùa", emoji: "🐢" }
  ];

  // Render khung chọn nhân vật theo số người chơi hiện tại
  function renderCharacterPicker() {
    const container = document.getElementById('character-picker');
    if (!container) return;
    container.innerHTML = '';

    // Chuẩn hoá lại mảng chosenTokens đúng số lượng người chơi (tự động gán con vật mặc định)
    while (chosenTokens.length < chosenPlayerCount) {
      const idx = chosenTokens.length;
      chosenTokens.push(GameCore.animalTokens[idx % GameCore.animalTokens.length] || { name: `Người chơi ${idx + 1}`, emoji: '🐊' });
    }
    chosenTokens.length = chosenPlayerCount;

    // Xác định các nhân vật đang được chọn bởi người khác
    const usedEmojis = chosenTokens.map(t => t.emoji);

    for (let i = 0; i < chosenPlayerCount; i++) {
      const wrapper = document.createElement('div');
      wrapper.className = 'char-picker-player';

      const label = document.createElement('div');
      label.className = 'char-picker-label';
      label.innerHTML = `Người chơi ${i + 1} <small>(${GameCore.playerNames[i] || ''})</small>`;

      const grid = document.createElement('div');
      grid.className = 'char-picker-grid';

      GameCore.animalTokens.forEach((token, ti) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'char-option';
        btn.dataset.emoji = token.emoji;
        btn.innerHTML = `<span class="char-emoji">${token.emoji}</span><span class="char-name">${token.name}</span>`;

        // Đánh dấu nhân vật đang được người chơi này chọn
        const isMine = chosenTokens[i] && chosenTokens[i].emoji === token.emoji;
        // Bị người khác lấy -> khoá
        const takenByOther = usedEmojis.includes(token.emoji) && !isMine;

        if (isMine) btn.classList.add('selected');
        if (takenByOther) btn.classList.add('taken');

        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          // Nếu nhân vật đã bị người khác chọn -> không cho chọn
          const takenBySomeoneElse = usedEmojis.some((em, ei) => em === token.emoji && ei !== i);
          if (takenBySomeoneElse) return;
          chosenTokens[i] = { name: token.name, emoji: token.emoji };
          renderCharacterPicker();
        });

        grid.appendChild(btn);
      });

      wrapper.appendChild(label);
      wrapper.appendChild(grid);
      container.appendChild(wrapper);
    }
  }

  playerMinus.addEventListener('click', () => {
    if (chosenPlayerCount > 2) {
      chosenPlayerCount--;
      updatePlayerCountDisplay();
      renderCharacterPicker();
    }
  });
  playerPlus.addEventListener('click', () => {
    if (chosenPlayerCount < 8) {
      chosenPlayerCount++;
      updatePlayerCountDisplay();
      renderCharacterPicker();
    }
  });
  updatePlayerCountDisplay();
  renderCharacterPicker();

  startGameBtn.addEventListener('click', () => {
    if (chosenPlayerCount < 2) {
      alert('Cần ít nhất 2 người chơi để bắt đầu trò chơi!');
      return;
    }

    const crossBoardEl = document.getElementById('set-cross-board');
    const config = {
      playerCount: chosenPlayerCount,
      initialMoney: parseInt(document.getElementById('set-initial-money').value, 10) || 1500,
      passGoMoney: parseInt(document.getElementById('set-pass-go').value, 10) || 200,
      doubleRentOnFullGroup: document.getElementById('set-double-rent').checked,
      mortgageInsteadOfSell: document.getElementById('set-mortgage').checked,
      jackpotOnFreeParking: document.getElementById('set-jackpot').checked,
      receiveRentWhileJailed: document.getElementById('set-rent-jailed').checked,
      auctionMode: document.getElementById('set-auction').checked,
      freeBuildOnFullGroup: document.getElementById('set-free-build-full-group').checked,
      boardMode: (crossBoardEl && crossBoardEl.checked) ? 'cross' : 'standard',
      chosenTokens: chosenTokens.slice(0, chosenPlayerCount)
    };

// Nếu đang chơi ONLINE -> gửi cài đặt luật lên server
    const isOnline = window.GameOnline && window.GameOnline.isOnline && window.GameOnline.isOnline();
    if (isOnline) {
      settingsOverlay.classList.add('hidden');
      // Broadcast cập nhật luật cho tất cả người chơi trong phòng chờ theo thời gian thực
      const s = (window.Lobby && window.Lobby.socket);
      if (s && window.Lobby && window.Lobby.roomCode) {
        s.emit('room:updateSettings', { code: window.Lobby.roomCode, settings: config });
      }
      if (window.Lobby && window.Lobby.startGame) {
        window.Lobby.startGame(config);
      }
      return; // Server sẽ tạo game & gửi state về -> onGameState dựng bàn cờ
    }

    GameCore.configure(config);
    GameCore.init();
    localTurnPlayerIndex = GameCore.state.currentPlayerIndex;
    localTurnHasRolled = false;

    buildBoard();
    buildPlayersUI();
    settingsOverlay.classList.add('hidden');

    // Cập nhật bảng luật chơi bên phải
    const rulesList = document.getElementById('rules-list');
    rulesList.innerHTML = `<ul>
      <li>• Số người chơi: <b>${chosenPlayerCount}</b></li>
      <li>• Tiền khởi tạo: <b>$${config.initialMoney}</b></li>
      <li>• Lương qua ô Start: <b>$${config.passGoMoney}</b></li>
      <li>• Nhân đôi thuê khi trọn nhóm: <b>${config.doubleRentOnFullGroup ? 'Bật' : 'Tắt'}</b></li>
      <li>• Cầm cố thay vì bán: <b>${config.mortgageInsteadOfSell ? 'Bật' : 'Tắt'}</b></li>
      <li>• Jackpot Bãi xe: <b>${config.jackpotOnFreeParking ? 'Bật' : 'Tắt'}</b></li>
      <li>• Nhận thuê khi ở tù: <b>${config.receiveRentWhileJailed ? 'Bật' : 'Tắt'}</b></li>
      <li>• Chế độ đấu giá: <b>${config.auctionMode ? 'Bật' : 'Tắt'}</b></li>
      <li>• Trọn bộ màu nâng nhà tự do: <b>${config.freeBuildOnFullGroup ? 'Bật' : 'Tắt'}</b></li>
      <li>• 🗺️ Bản đồ: <b>${config.boardMode === 'cross' ? 'Chữ Thập Mở Rộng (57 ô)' : 'Tiêu Chuẩn (40 ô)'}</b></li>
    </ul>`;

    renderUI();
  });

  // =========================================================
  // EVENT LISTENERS TRÒ CHƠI
  // =========================================================
  function updateTurnActionButton(disabled = false) {
    const currentPlayerIndex = GameCore.state.currentPlayerIndex;
    if (localTurnPlayerIndex !== currentPlayerIndex) {
      localTurnPlayerIndex = currentPlayerIndex;
      localTurnHasRolled = false;
    }

    if (!localTurnHasRolled) {
      rollBtn.innerText = 'GIEO XÚC XẮC';
      rollBtn.dataset.action = 'roll';
      rollBtn.disabled = disabled;
      endTurnBtn.disabled = true;
      return;
    }

    const canRollAgain = !!GameCore.state.extraRollPending;
    rollBtn.innerText = canRollAgain ? 'GIEO XÚC XẮC' : 'KẾT THÚC LƯỢT';
    rollBtn.dataset.action = canRollAgain ? 'roll' : 'end-turn';
    rollBtn.disabled = disabled;
    endTurnBtn.disabled = true;
  }

  document.getElementById('close-info-card-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    infoCardModal.classList.add('hidden');
  });

bailBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    // ONLINE: server xử lý -> không chạy cục bộ
    if (window.GameOnline && window.GameOnline.isOnline && window.GameOnline.isOnline()) return;
    if (GameCore.payBail()) renderUI();
  });

  // Xử lý thẻ Cơ hội / Khí vận
  if (btnAcceptCard) {
    btnAcceptCard.addEventListener('click', () => {
      // ONLINE: server xử lý -> không chạy cục bộ
      if (window.GameOnline && window.GameOnline.isOnline && window.GameOnline.isOnline()) return;
      cardModal.classList.add('hidden');
      const cardResult = GameCore.applyCardEffect();

      if (cardResult && (cardResult.action === "GO_TO_JAIL" || cardResult.action === "MOVE_TO" || cardResult.action === "MOVE_STEPS")) {
        const playerIndex = GameCore.state.currentPlayerIndex;
        const tokenElem = playerTokens[playerIndex];
        const targetTile = document.getElementById(`tile-${cardResult.finalPos}`);
        if (targetTile && tokenElem) targetTile.appendChild(tokenElem);
      }

const landing = cardResult ? cardResult.landing : null;
      if (landing && landing.action === "AUCTION") {
        // Thẻ đưa người chơi tới ô đất không đủ tiền mua -> đấu giá
        openAuctionModal();
        return;
      } else if (landing && landing.action === "PROMPT_BUY") {
        document.getElementById('modal-tile-name').innerText = landing.tile.name;
        document.getElementById('modal-tile-price').innerText = `Giá: $${landing.tile.price}`;
        positionBuyPrompt(cardResult.finalPos);
        buyModal.classList.remove('hidden');
        endTurnBtn.disabled = true;
      } else if (landing && landing.action === "DRAW_CARD") {
        const badgeEl = document.getElementById('card-type-badge');
        if (badgeEl) {
          badgeEl.innerText = landing.card.category || landing.card.type;
          badgeEl.classList.toggle('badge-chance', landing.card.type === "CƠ HỘI");
          badgeEl.classList.toggle('badge-fortune', landing.card.type === "KHÍ VẬN");
        }
        document.getElementById('card-title').innerText = landing.card.title;
        document.getElementById('card-text').innerText = landing.card.text;
        cardModal.classList.remove('hidden');
        endTurnBtn.disabled = true;
      } else {
        updateTurnActionButton(false);
      }
      renderUI();
    });
  }

// Gieo xúc xắc
  rollBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    // ONLINE: server là nguồn sự thật -> không chạy logic cục bộ (online.js gửi hành động)
    if (window.GameOnline && window.GameOnline.isOnline && window.GameOnline.isOnline()) return;

    if (rollBtn.dataset.action === 'end-turn') {
      const curPlayer = GameCore.getCurrentPlayer();
      if (curPlayer && curPlayer.money < 0) {
        alert(`⚠️ Bạn đang nợ $${Math.abs(curPlayer.money)}! Hãy bán nhà, cầm cố đất hoặc giao dịch trước khi kết thúc lượt.`);
        return;
      }
      infoCardModal.classList.add('hidden');
      GameCore.endTurn();
      updateTurnActionButton(false);
      renderUI();
      return;
    }

    rollBtn.disabled = true;
    endTurnBtn.disabled = true;

    const godDiceControl = document.getElementById('god-dice-control');
    const godDiceSelect = godDiceControl?.querySelector('select');
    const rollingPlayer = GameCore.getCurrentPlayer();
    const selectedSteps = rollingPlayer?.godDiceTurns > 0 && godDiceSelect
      ? Number(godDiceSelect.value)
      : null;
    const res = GameCore.rollDice(selectedSteps);
    localTurnHasRolled = true;
    if (!res.godDice) await playDiceAnimation(GameCore.state.lastRoll, GameCore.state.lastDice);

    const playerIndex = res.playerId
      ? GameCore.state.players.findIndex(player => player.id === res.playerId)
      : GameCore.state.currentPlayerIndex;
    const tokenElem = playerTokens[playerIndex];

    // Hỏi tuyến ngay sau khi xúc xắc nếu người chơi đã chọn ga ở lượt trước.
    if (res.action === 'CHOOSE_CROSS_ROUTE') {
      rollBtn.disabled = true;
      endTurnBtn.disabled = true;
      await showCrossRouteChoice(res.crossRouteChoice, res.dice, res.startPos);
      return;
    }

    if (res.dice > 0 && res.action !== "STAY_IN_JAIL") {
      await moveTokenWithStationPauses(tokenElem, res.startPos, res.movementPath, res.stationEvents);
      if (res.action === "GO_TO_JAIL") {
        await new Promise(resolve => setTimeout(resolve, 200));
        const jailTile = document.getElementById('tile-10');
        if (jailTile && tokenElem) jailTile.appendChild(tokenElem);
      }
    }
    if (res.action === 'WEATHER_CHANGE' && GameCore.state.pendingWeatherNotification) {
      const weather = GameCore.state.pendingWeatherNotification;
      window.GameEnhancements?.showEffectToast?.(`${weather.emoji} ${weather.name}\n⏱️ ${weather.turns} lượt`, 'warning');
      window.GameEnhancements?.playWeatherSound?.(weather.weather);
      delete GameCore.state.pendingWeatherNotification;
    }

    if (res.action === "OPEN_SHOP") {
      const shopPlayer = GameCore.getCurrentPlayer();
      if (shopPlayer && GameCore.Shop) GameCore.Shop.openShop(shopPlayer);
    }
    if (res.action === "OPEN_SPECIAL_SHOP") {
      const shopPlayer = GameCore.getCurrentPlayer();
      if (shopPlayer && GameCore.Shop) GameCore.Shop.openShop(shopPlayer, true);
    }
    if (res.action === "CENTER_BUFF") {
      const message = GameCore.state.pendingCenterBuffNotification
        || `✨ ${rollingPlayer?.name || 'Người chơi'} nhận buff siêu mạnh giữa bàn!`;
      window.GameEnhancements?.triggerCenterImpact?.(message);
      delete GameCore.state.pendingCenterBuffNotification;
    }

    if (res.action === "PROMPT_BUY") {
      document.getElementById('modal-tile-name').innerText = res.tile.name;
      const effectivePrice = res.effectivePrice !== undefined ? res.effectivePrice : res.tile.price;
      document.getElementById('modal-tile-price').innerText = res.discount ? `Giá ưu đãi (50%): $${effectivePrice} (Gốc: $${res.tile.price})` : `Giá: $${res.tile.price}`;
      
      const buyAuctionBtn = document.getElementById('buy-auction-btn');
      if (buyAuctionBtn) {
        if (GameCore.settings?.auctionMode === true) {
          buyAuctionBtn.classList.remove('hidden');
        } else {
          buyAuctionBtn.classList.add('hidden');
        }
      }
      const buyYesBtn = document.getElementById('buy-yes-btn');
      if (buyYesBtn) {
        buyYesBtn.disabled = !res.canAfford;
      }
      const destinationIndex = Array.isArray(res.movementPath) && res.movementPath.length > 0
        ? res.movementPath[res.movementPath.length - 1]
        : (res.startPos + res.dice) % 40;
      positionBuyPrompt(destinationIndex);
      buyModal.classList.remove('hidden');
      endTurnBtn.disabled = true;
    } else if (res.action === "AUCTION") {
      // Đã bắt đầu đấu giá trong gameCore -> mở modal đấu giá
      openAuctionModal();
      return;
    } else if (res.action === "DRAW_CARD") {
      const badgeEl = document.getElementById('card-type-badge');
      if (badgeEl) {
        badgeEl.innerText = res.card.category || res.card.type;
        badgeEl.classList.toggle('badge-chance', res.card.type === "CƠ HỘI");
        badgeEl.classList.toggle('badge-fortune', res.card.type === "KHÍ VẬN");
      }
      document.getElementById('card-title').innerText = res.card.title;
      document.getElementById('card-text').innerText = res.card.text;
      cardModal.classList.remove('hidden');
    } else {
      updateTurnActionButton(false);
    }

    if (res.crossRouteChoice && (res.action === 'CHOOSE_CROSS_ROUTE' || res.crossRouteChoice.nextTurn)) {
      rollBtn.disabled = true;
      endTurnBtn.disabled = true;
      showCrossRouteChoice(res.crossRouteChoice, res.dice, res.startPos);
    }

    renderUI();
  });

  document.getElementById('trade-player-next-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    openTradeOfferModal();
  });
  document.getElementById('trade-player-cancel-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    tradePlayerModal.classList.add('hidden');
  });
  document.getElementById('trade-offer-cancel-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    tradeOfferModal.classList.add('hidden');
  });
  document.querySelector('.trade-detail-close-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeTradeDetailModal();
  });
  document.getElementById('trade-proceed-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    submitTradeRequest();
  });

  document.getElementById('buy-yes-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    // ONLINE: server xử lý
    if (window.GameOnline && window.GameOnline.isOnline && window.GameOnline.isOnline()) return;
    GameCore.buyPendingProperty();
    buyModal.classList.add('hidden');
    updateTurnActionButton(false);
    renderUI();
  });

  document.getElementById('buy-no-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    // ONLINE: server xử lý
    if (window.GameOnline && window.GameOnline.isOnline && window.GameOnline.isOnline()) return;
    GameCore.skipPendingProperty();
    buyModal.classList.add('hidden');
    updateTurnActionButton(false);
    renderUI();
  });

  document.getElementById('buy-auction-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    // ONLINE: server xử lý
    if (window.GameOnline && window.GameOnline.isOnline && window.GameOnline.isOnline()) {
      GameOnline.sendAction('AUCTION_PROPERTY');
      buyModal.classList.add('hidden');
      return;
    }
    // OFFLINE
    buyModal.classList.add('hidden');
    if (GameCore.auctionPendingProperty()) {
      openAuctionModal();
    }
    renderUI();
  });

  // Event listeners cho các nút bid trong đấu giá
  auctionAddBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.GameOnline && window.GameOnline.isOnline && window.GameOnline.isOnline()) {
        const a = GameCore.state.auctionState;
        if (!a || !a.active) return;
        const add = parseInt(btn.dataset.add, 10) || 10;
        GameOnline.sendAction('PLACE_BID', { amount: a.currentBid + add });
        return;
      }

      // OFFLINE - free-for-all: đặt giá cho người chơi đang được chọn
      const a = GameCore.state.auctionState;
      if (!a || !a.active) return;
      const add = parseInt(btn.dataset.add, 10) || 10;
      const amount = a.currentBid + add;

      if (selectedOfflineBidderIndex < 0 || !GameCore.state.players[selectedOfflineBidderIndex]) {
        alert('Vui lòng chọn một người chơi để đặt giá!');
        return;
      }

      const bidder = GameCore.state.players[selectedOfflineBidderIndex];
      if (bidder.money < amount) {
        alert(`${bidder.name} không đủ tiền ($${bidder.money}) để trả $${amount}!`);
        return;
      }

      if (GameCore.placeBid(selectedOfflineBidderIndex, amount)) {
        renderAuctionModal();
        renderUI();
      }
    });
  });

  // Nút Bỏ qua trong đấu giá (trong free-for-all: ẩn đi nhưng giữ listener phng trường hợp cần)
  const auctionPassBtnEl = document.getElementById('auction-pass-btn');
  if (auctionPassBtnEl) {
    auctionPassBtnEl.style.display = 'none'; // Ẩn trong chế độ free-for-all
    auctionPassBtnEl.addEventListener('click', (e) => {
      e.stopPropagation();
      // Trong free-for-all, nút này không dùng
    });
  }

  // Nút BỎ LƯỢT trong đấu giá
  document.getElementById('btn-build-house').addEventListener('click', (e) => {
    e.stopPropagation();
    // ONLINE: server xử lý
    if (window.GameOnline && window.GameOnline.isOnline && window.GameOnline.isOnline()) return;
    if (selectedTileIndex !== null && GameCore.buildHouse(selectedTileIndex)) {
      renderUI();
      openPropertyCard(selectedTileIndex);
    }
  });

  document.getElementById('btn-sell-house').addEventListener('click', (e) => {
    e.stopPropagation();
    // ONLINE: server xử lý
    if (window.GameOnline && window.GameOnline.isOnline && window.GameOnline.isOnline()) return;
    if (selectedTileIndex !== null && GameCore.sellHouse(selectedTileIndex)) {
      renderUI();
      openPropertyCard(selectedTileIndex);
    }
  });

  document.getElementById('btn-mortgage').addEventListener('click', (e) => {
    e.stopPropagation();
    // ONLINE: server xử lý
    if (window.GameOnline && window.GameOnline.isOnline && window.GameOnline.isOnline()) return;
    if (selectedTileIndex !== null && GameCore.mortgageProperty(selectedTileIndex)) {
      infoCardModal.classList.add('hidden');
      renderUI();
    }
  });

  function openSurrenderModal() {
    const isOnline = window.GameOnline && GameOnline.isOnline && GameOnline.isOnline();
    const playerIndex = isOnline ? GameOnline.myIndex : GameCore.state.currentPlayerIndex;
    const p = GameCore.state.players[playerIndex];
    if (!p || p.isBankrupt) return;

    if (surrenderConfirmDesc) {
      if (p.lastCreditorId) {
        const creditor = GameCore.state.players.find(x => x.id === p.lastCreditorId);
        surrenderConfirmDesc.innerText = `Bạn đang nợ ${creditor ? creditor.name : 'người chơi khác'}. Nếu đầu hàng, toàn bộ tiền mặt và ${GameCore.state.board.filter(t => t.owner === p.id).length} bất động sản của bạn sẽ được chuyển giao cho ${creditor ? creditor.name : 'chủ nợ'}!`;
      } else {
        surrenderConfirmDesc.innerText = `Bạn có chắc chắn muốn tuyên bố phá sản và đầu hàng không? Toàn bộ tài sản sẽ bị thu hồi về Ngân hàng!`;
      }
    }
    if (surrenderModal) surrenderModal.classList.remove('hidden');
  }

  if (surrenderBtn) {
    surrenderBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openSurrenderModal();
    });
  }

  if (debtSurrenderBtn) {
    debtSurrenderBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openSurrenderModal();
    });
  }

  if (surrenderNoBtn) {
    surrenderNoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (surrenderModal) surrenderModal.classList.add('hidden');
    });
  }

  if (surrenderYesBtn) {
    surrenderYesBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (surrenderModal) surrenderModal.classList.add('hidden');
      if (window.GameOnline && GameOnline.isOnline && GameOnline.isOnline()) {
        return; // online.js xử lý gửi socket lên server
      }
      const cur = GameCore.getCurrentPlayer();
      if (cur) {
        GameCore.surrender(cur.id);
        renderUI();
      }
    });
  }

  endTurnBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    // ONLINE: server xử lý
    if (window.GameOnline && window.GameOnline.isOnline && window.GameOnline.isOnline()) return;

    const curPlayer = GameCore.getCurrentPlayer();
    if (curPlayer && curPlayer.money < 0) {
      alert(`⚠️ Bạn đang nợ $${Math.abs(curPlayer.money)}! Hãy bán nhà, cầm cố đất hoặc giao dịch để trả nợ trước khi kết thúc lượt.`);
      return;
    }

    endTurnBtn.disabled = true;
    rollBtn.disabled = false;
    infoCardModal.classList.add('hidden');

    GameCore.endTurn();
    renderUI();
  });

  // =========================================================
  // EXPOSE UI API (cho online.js và các module khác dùng)
  // =========================================================
  window.GameUI = {
    buildBoard,
    buildPlayersUI,
    renderUI,
    openPropertyCard,
    openAuctionModal,
    renderAuctionModal,
    closeAuctionModal,
    handleAuctionEnd,
    moveTokenStepByStep,
    moveTokenWithStationPauses,
    showStationRouteArrow,
    playDiceAnimation,
    renderDiceFace,
    showVictoryScreen,
    clearFireworks: () => {
      if (fireworksInterval) { clearInterval(fireworksInterval); fireworksInterval = null; }
      const fw = document.getElementById('victory-fireworks');
      if (fw) fw.innerHTML = '';
    },
    getCurrentPlayerIndex: () => GameCore.state.currentPlayerIndex,
    get playerTokens() { return playerTokens; },
    setPlayerTokens: (tokens) => { playerTokens = tokens; },
    get selectedTileIndex() { return selectedTileIndex; },
    setSelectedTileIndex: (i) => { selectedTileIndex = i; },
    get isAuctionActive() { return GameCore.isAuctionActive(); }
  };
});
=======
/**
 * UI CONTROLLER - Monopoly Richup Sài Gòn
 * Hỗ trợ 2-8 người chơi + màn hình cài đặt luật chơi
 */

document.addEventListener('DOMContentLoaded', () => {
const boardElement = document.getElementById('board');
  const infoCardModal = document.getElementById('property-info-card');
  const buyModal = document.getElementById('buy-modal');
const cardModal = document.getElementById('card-modal');
  const btnAcceptCard = document.getElementById('btn-accept-card');
  const rollBtn = document.getElementById('roll-btn');
  const endTurnBtn = document.getElementById('end-turn-btn');
  const surrenderBtn = document.getElementById('surrender-btn');
  const debtSurrenderBtn = document.getElementById('debt-surrender-btn');
  const surrenderModal = document.getElementById('surrender-confirm-modal');
  const surrenderYesBtn = document.getElementById('surrender-yes-btn');
  const surrenderNoBtn = document.getElementById('surrender-no-btn');
  const surrenderConfirmDesc = document.getElementById('surrender-confirm-desc');
  const debtAlertBanner = document.getElementById('debt-alert-banner');
  const debtAlertText = document.getElementById('debt-alert-text');

// AUCTION MODAL
  const auctionModal = document.getElementById('auction-modal');
  const auctionTimerEl = document.getElementById('auction-timer');
  const auctionHighestToken = document.getElementById('auction-highest-token');
  const auctionAddBtns = document.querySelectorAll('.auction-add-btn');
  const auctionPassBtn = document.getElementById('auction-pass-btn');
  const auctionStatusMsg = document.getElementById('auction-status-msg');
  const tradePlayerModal = document.getElementById('trade-player-modal');
  const tradeOfferModal = document.getElementById('trade-offer-modal');
  const tradeDetailModal = document.getElementById('trade-detail-modal');
  let tradeTargetPlayerId = null;
  let activeDetailRequestId = null;
  let auctionTimerInterval = null;

  const settingsOverlay = document.getElementById('settings-overlay');
  const playerMinus = document.getElementById('player-minus');
  const playerPlus = document.getElementById('player-plus');
  const playerCountVal = document.getElementById('player-count-val');
  const startGameBtn = document.getElementById('start-game-btn');

  let selectedTileIndex = null;
  let playerTokens = []; // Mảng quân cờ (tạo động theo số người chơi)
  let localTurnPlayerIndex = null;
  let localTurnHasRolled = false;

  // Thêm Nút Bảo Lãnh Ra Tù
  let bailBtn = document.getElementById('bail-btn');
  if (!bailBtn) {
    bailBtn = document.createElement('button');
    bailBtn.id = 'bail-btn';
    bailBtn.className = 'btn hidden';
    bailBtn.style.cssText = `
      background: linear-gradient(135deg, #e67e22, #d35400);
      color: #fff;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: bold;
      border-radius: 8px;
      border: 1px solid #f39c12;
      cursor: pointer;
      display: none;
      margin: 0 auto 12px auto;
      box-shadow: 0 4px 10px rgba(230, 126, 34, 0.4);
    `;
    bailBtn.innerText = '🔓 Nộp $100 ra tù';
    if (rollBtn && rollBtn.parentNode && rollBtn.parentNode.parentNode) {
      rollBtn.parentNode.parentNode.insertBefore(bailBtn, rollBtn.parentNode);
    }
  }

  function getGridPosition(index) {
    if (index >= 0 && index <= 10) return { row: 11, col: 11 - index, side: 'bottom' };
    if (index >= 11 && index <= 20) return { row: 11 - (index - 10), col: 1, side: 'left' };
    if (index >= 21 && index <= 30) return { row: 1, col: 1 + (index - 20), side: 'top' };
    if (index >= 31 && index <= 39) return { row: 1 + (index - 30), col: 11, side: 'right' };
    // 17 ô hình chữ thập (ở giữa bàn cờ mở rộng)
    // Nánh dọc (cột 6, hàng 2 -> 10, qua tâm hàng 6)
    if (index === 40) return { row: 2, col: 6, side: 'cross-v' };   // Cầu Bình Lợi
    if (index === 41) return { row: 3, col: 6, side: 'cross-v' };   // ĐL Phạm Văn Đồng
    if (index === 42) return { row: 4, col: 6, side: 'cross-v' };   // Ngã tư Hàng Xanh
    if (index === 43) return { row: 5, col: 6, side: 'cross-v' };   // Cầu Sài Gòn
    if (index === 44) return { row: 6, col: 6, side: 'cross-center' }; // TÂM
    if (index === 45) return { row: 7, col: 6, side: 'cross-v' };   // Cầu Kênh Tẻ
    if (index === 46) return { row: 8, col: 6, side: 'cross-v' };   // Ngã tư Bảy Hiền
    if (index === 47) return { row: 9, col: 6, side: 'cross-v' };   // ĐL Nguyễn Văn Linh
    if (index === 48) return { row: 10, col: 6, side: 'cross-v' };  // Cầu Chữ Y
    // Nánh ngang (hàng 6, cột 2 -> 10, trừ cột 6 là tâm)
    if (index === 49) return { row: 6, col: 2, side: 'cross-h' };   // Cầu Nhị Thiên Đường
    if (index === 50) return { row: 6, col: 3, side: 'cross-h' };   // ĐL Võ Văn Kiệt
    if (index === 51) return { row: 6, col: 4, side: 'cross-h' };   // Ngã sáu Cộng Hòa
    if (index === 52) return { row: 6, col: 5, side: 'cross-h' };   // Chợ Kim Biên
    if (index === 53) return { row: 6, col: 7, side: 'cross-h' };   // Hầm Thủ Thiêm
    if (index === 54) return { row: 6, col: 8, side: 'cross-h' };   // Ngã ba Cát Lái
    if (index === 55) return { row: 6, col: 9, side: 'cross-h' };   // ĐL Mai Chí Thọ
    if (index === 56) return { row: 6, col: 10, side: 'cross-h' };  // Cầu Rạch Chiếc
    return { row: 6, col: 6, side: 'cross-center' }; // fallback
  }

  function updateGodDiceControl(player) {
    if (!rollBtn || !rollBtn.parentNode) return;
    const active = !!(player && player.godDiceTurns > 0);
    let control = document.getElementById('god-dice-control');
    if (!active) {
      control?.remove();
      return;
    }
    if (!control) {
      control = document.createElement('label');
      control.id = 'god-dice-control';
      control.innerHTML = '🎯 <span>Chọn bước</span> <select aria-label="Số bước Quyền Năng Thượng Đế"></select>';
      rollBtn.parentNode.insertBefore(control, rollBtn);
      const select = control.querySelector('select');
      for (let steps = 1; steps <= 12; steps++) {
        const option = document.createElement('option');
        option.value = steps;
        option.innerText = steps;
        select.appendChild(option);
      }
    }
    control.hidden = false;
    control.querySelector('span').innerText = `Còn ${player.godDiceTurns} lượt`;
  }

  function positionBuyPrompt(tileIndex) {
    if (!buyModal) return;
    positionPopupNearTile(buyModal, tileIndex);
  }

  function syncTradeModalWidth(modal) {
    if (!modal || !boardElement) return;
    const boardWidth = boardElement.getBoundingClientRect().width;
    const content = modal.querySelector('.modal-content');
    if (content && boardWidth > 0) {
      content.style.setProperty('width', `${boardWidth}px`, 'important');
      content.style.setProperty('max-width', `${boardWidth}px`, 'important');
    }
  }

  function positionPopupNearTile(popup, tileIndex) {
    if (!popup || !boardElement) return;
    popup.classList.remove('hidden');
    popup.style.position = 'absolute';
    popup.style.top = '0px';
    popup.style.left = '0px';
    popup.style.right = 'auto';
    popup.style.bottom = 'auto';
    popup.style.transform = 'none';

    const boardRect = boardElement.getBoundingClientRect();
    const tileElem = document.getElementById(`tile-${tileIndex}`);
    if (!tileElem) {
      popup.style.left = `${Math.max(6, (boardRect.width - popup.offsetWidth) / 2)}px`;
      popup.style.top = `${Math.max(6, (boardRect.height - popup.offsetHeight) / 2)}px`;
      return;
    }

    const tileRect = tileElem.getBoundingClientRect();
    const popupWidth = popup.offsetWidth;
    const popupHeight = popup.offsetHeight;
    const gap = 6;
    const pos = getGridPosition(tileIndex);
    const tileLeft = tileRect.left - boardRect.left;
    const tileTop = tileRect.top - boardRect.top;
    const tileRight = tileRect.right - boardRect.left;
    const tileBottom = tileRect.bottom - boardRect.top;
    const centeredLeft = tileLeft + (tileRect.width - popupWidth) / 2;
    const centeredTop = tileTop + (tileRect.height - popupHeight) / 2;
    const candidates = pos.side === 'bottom'
      ? [[centeredLeft, tileTop - popupHeight - gap], [tileRight + gap, centeredTop], [tileLeft - popupWidth - gap, centeredTop]]
      : pos.side === 'top'
        ? [[centeredLeft, tileBottom + gap], [tileRight + gap, centeredTop], [tileLeft - popupWidth - gap, centeredTop]]
        : pos.side === 'left'
          ? [[tileRight + gap, centeredTop], [centeredLeft, tileTop - popupHeight - gap], [centeredLeft, tileBottom + gap]]
          : pos.side === 'right'
            ? [[tileLeft - popupWidth - gap, centeredTop], [centeredLeft, tileTop - popupHeight - gap], [centeredLeft, tileBottom + gap]]
            : pos.side === 'cross-v'
              ? [[tileRight + gap, centeredTop], [tileLeft - popupWidth - gap, centeredTop], [centeredLeft, tileBottom + gap], [centeredLeft, tileTop - popupHeight - gap]]
              : [[centeredLeft, tileTop - popupHeight - gap], [centeredLeft, tileBottom + gap], [tileRight + gap, centeredTop], [tileLeft - popupWidth - gap, centeredTop]];

    const maxLeft = Math.max(6, boardRect.width - popupWidth - 6);
    const maxTop = Math.max(6, boardRect.height - popupHeight - 6);
    const [left, top] = candidates[0];
    popup.style.left = `${Math.min(maxLeft, Math.max(6, left))}px`;
    popup.style.top = `${Math.min(maxTop, Math.max(6, top))}px`;
  }

  function syncBoardWidth() {
    const boardWidth = boardElement.getBoundingClientRect().width;
    document.documentElement.style.setProperty('--board-width', `${boardWidth}px`);
  }

  window.addEventListener('resize', syncBoardWidth);
  
  // Expose for online.js to use
  window.positionBuyPrompt = positionBuyPrompt;

  // Click ra ngoài để tắt pop-up
  document.addEventListener('click', (e) => {
    if (!infoCardModal.contains(e.target) && !e.target.closest('.tile')) {
      infoCardModal.classList.add('hidden');
    }
  });
  infoCardModal.addEventListener('click', (e) => e.stopPropagation());

  // =========================================================
  // ICON ĐẶC TRƯNG CHO TỪNG Ô BÀN CỜ (PHÓNG TO & NỔI BẬT)
  // =========================================================
  function getTileIconInfo(tile, index) {
    // 1. Ô góc bàn cờ (Corner tiles) - Phóng to nổi bật nhất
    if (tile.type === "GO" || index === 0) {
      return { icon: '🚀', className: 'tile-icon tile-corner-icon' };
    }
    if (tile.type === "JAIL" || index === 10) {
      return { icon: '🔒', className: 'tile-icon tile-corner-icon' };
    }
    if (tile.type === "FREE_PARKING" || index === 20) {
      return { icon: '🅿️', className: 'tile-icon tile-corner-icon' };
    }
    if (tile.type === "GO_TO_JAIL" || index === 30) {
      return { icon: '🚔', className: 'tile-icon tile-corner-icon' };
    }

    // 2. Ô chức năng đặc biệt (Bến xe, Sân bay, Metro, Điện nước, Thuế, Cơ hội, Khí vận)
    if (tile.type === "RAILROAD") {
      const stationIcons = {
        "Đại học Bách Khoa": '🏫',
        "Đại học Kinh Tế": '🎓',
        "Đại học CNKT": '🏛️',
        "Đại học KHTN": '🔬'
      };
      return { icon: stationIcons[tile.name] || '🏫', className: 'tile-icon tile-special-icon' };
    }

    if (tile.type === "UTILITY") {
      const uIcon = (index === 12) ? '⚡' : '💧'; // EVN hoặc SAWACO
      return { icon: uIcon, className: 'tile-icon tile-special-icon' };
    }

    if (tile.type === "SHOP") {
      return { icon: tile.icon || '🛒', className: 'tile-icon tile-special-icon' };
    }

    if (tile.type === "TAX" || index === 4 || index === 38) {
      const tIcon = (index === 4) ? '🍂' : '💎'; // Thuế Môi Trường / Thuế Hàng Hiệu
      return { icon: tIcon, className: 'tile-icon tile-special-icon' };
    }

    if (tile.type === "CHANCE" || (tile.name && tile.name.includes("Cơ hội"))) {
      return { icon: '❓', className: 'tile-icon tile-special-icon' };
    }

    if (tile.type === "CHEST" || tile.type === "FORTUNE" || (tile.name && tile.name.includes("Khí vận"))) {
      return { icon: '🎁', className: 'tile-icon tile-special-icon' };
    }

    // 3. Icon đặc trưng theo tính chất từng ô đất quận/huyện Sài Gòn
    const propertyIcons = {
      1: '🌾',  // Hóc Môn (Vườn trầu, lúa ngoại thành)
      3: '🌳',  // Củ Chi (Đất thép, rừng cây sinh thái)
      6: '🏘️',  // Bình Chánh (Đô thị cửa ngõ Tây Nam)
      8: '⚓',  // Nhà Bè (Cảng biển, sông nước)
      9: '🏝️',  // Cần Giờ (Đảo sinh thái biển & rừng ngập mặn)
      11: '🏢', // Quận 12 (Công viên phần mềm Quang Trung)
      13: '🏬', // Bình Tân (Khu thương mại & công nghiệp sầm uất)
      14: '🏙️', // Gò Vấp (Đô thị nhộn nhịp)
      16: '🛍️', // Tân Phú (Phố mua sắm & ẩm thực)
      18: '🏨', // Tân Bình (Khách sạn văn phòng cửa ngõ)
      19: '🌺', // Phú Nhuận (Phố hoa lệ ẩm thực)
      21: '🌉', // Quận 8 (Đô thị kênh rạch sông nước)
      23: '🏮', // Quận 6 (Chợ Lớn - Phố người Hoa cổ kính)
      24: '🍜', // Quận 5 (Ẩm thực & văn hóa Chợ Quán)
      26: '☕', // Quận 10 (Phố cà phê & thương mại)
      27: '🍢', // Quận 4 (Thiên đường ẩm thực đêm Vĩnh Khánh)
      29: '🏛️', // Quận 3 (Biệt thự Pháp cổ & Hồ Con Rùa)
      31: '⛲', // Quận 7 (Phú Mỹ Hưng / Cầu Ánh Sao)
      32: '🍷', // Thảo Điền (Khu biệt thự sang trọng)
      34: '🌆', // Thủ Thiêm (Trung tâm tài chính mới tương lai)
      37: '🏰', // Phố đi bộ Nguyễn Huệ (Trực diện trung tâm tráng lệ)
      39: '👑'  // Đường Đồng Khởi (Vương miện xa xỉ đắt giá nhất)
    };

    const propIcon = propertyIcons[index] || '🏡';
    // Icon cho các ô chữ thập (id 40-56)
    const crossIcons = {
      40: '🌉', 41: '🛣️', 42: '🛒', 43: '🌉', 44: '🌟',
      45: '🌉', 46: '🛒', 47: '🛣️', 48: '🌉',
      49: '🌉', 50: '🛣️', 51: '🎁', 52: '🏪',
      53: '🚇', 54: '❓', 55: '🛣️', 56: '🌉'
    };
    if (index >= 40 && crossIcons[index]) {
      const isCrossChance = tile.type === 'CHANCE' || tile.type === 'SHOP' || tile.type === 'FORTUNE';
      return { icon: crossIcons[index], className: isCrossChance ? 'tile-icon tile-special-icon' : 'tile-icon tile-property-icon' };
    }
    return { icon: propIcon, className: 'tile-icon tile-property-icon' };
  }

  // =========================================================
  // DỰNG BÀN CỜ (gọi 1 lần duy nhất sau khi có state)
  // =========================================================
  function buildBoard() {
    boardElement.classList.toggle('cross-board', GameCore.state.board.length > 40);
    syncBoardWidth();
    boardElement.appendChild(infoCardModal);
    boardElement.appendChild(buyModal);
    const notificationList = document.getElementById('game-notifications');
    const centerPanel = document.getElementById('center-panel');
    const centerActions = centerPanel?.querySelector('.center-actions');
    if (notificationList && centerPanel && centerActions) {
      if (GameCore.state.board.length > 40) boardElement.appendChild(notificationList);
      else centerPanel.insertBefore(notificationList, centerActions);
    }
    boardElement.querySelectorAll('.tile').forEach((t) => t.remove());
    GameCore.state.board.forEach((tile, index) => {
      const tileDiv = document.createElement('div');
      tileDiv.className = 'tile';
      tileDiv.id = `tile-${index}`;

      const pos = getGridPosition(index);
      tileDiv.style.gridRow = pos.row;
      tileDiv.style.gridColumn = pos.col;

      let groupBar = null;
      if (tile.group) {
        groupBar = document.createElement('div');
        groupBar.className = `group-bar group-${tile.group}`;
      }

      const contentDiv = document.createElement('div');
      contentDiv.className = 'tile-content';

      const iconInfo = getTileIconInfo(tile, index);
      if (iconInfo && iconInfo.icon) {
        const iconSpan = document.createElement('span');
        iconSpan.className = iconInfo.className;
        iconSpan.innerText = iconInfo.icon;
        contentDiv.appendChild(iconSpan);
      }

      const nameSpan = document.createElement('span');
      nameSpan.className = 'tile-name';
      nameSpan.innerText = tile.name;
      contentDiv.appendChild(nameSpan);

      if (tile.price) {
        const priceSpan = document.createElement('span');
        priceSpan.className = 'tile-price';
        priceSpan.innerText = `$${tile.price}`;
        contentDiv.appendChild(priceSpan);
      }

      // Tile's side layout
      if (pos.side === 'bottom') {
        if (groupBar) tileDiv.appendChild(groupBar);
        tileDiv.appendChild(contentDiv);
      } else if (pos.side === 'top') {
        tileDiv.appendChild(contentDiv);
        if (groupBar) tileDiv.appendChild(groupBar);
      } else if (pos.side === 'left') {
        tileDiv.classList.add('side-tile');
        tileDiv.appendChild(contentDiv);
        if (groupBar) tileDiv.appendChild(groupBar);
      } else if (pos.side === 'right') {
        tileDiv.classList.add('side-tile');
        if (groupBar) tileDiv.appendChild(groupBar);
        tileDiv.appendChild(contentDiv);
      } else if (pos.side === 'cross-center') {
        tileDiv.classList.add('tile-cross', 'tile-cross-center');
        tileDiv.appendChild(contentDiv);
      } else if (pos.side === 'cross-v') {
        tileDiv.classList.add('tile-cross', 'tile-cross-v');
        tileDiv.appendChild(contentDiv);
        if (groupBar) tileDiv.appendChild(groupBar);
      } else if (pos.side === 'cross-h') {
        tileDiv.classList.add('tile-cross', 'tile-cross-h');
        tileDiv.appendChild(contentDiv);
        if (groupBar) tileDiv.appendChild(groupBar);
      }

      tileDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        if (GameCore.Shop?.handleTileSelection?.(tile.id)) return;
        if (tile.price && tile.type !== "TAX") {
          openPropertyCard(index);
        }
      });

      boardElement.appendChild(tileDiv);
    });

    const d1 = (GameCore.state && GameCore.state.lastDice) ? GameCore.state.lastDice[0] : 1;
    const d2 = (GameCore.state && GameCore.state.lastDice) ? GameCore.state.lastDice[1] : 1;
    renderDiceFace(document.getElementById('dice-one'), d1);
    renderDiceFace(document.getElementById('dice-two'), d2);
  }

  // =========================================================
  // TẠO QUÂN CỜ & THẺ NGƯỜI CHƠI (động theo số người)
  // =========================================================
  function buildPlayersUI() {
    const players = GameCore.state.players;

    // Tạo mảng quân cờ: hiển thị toàn bộ con vật (không nằm trong khung màu tròn cũ)
    playerTokens = players.map((p, i) => {
      const tok = document.createElement('div');
      tok.className = 'player-token';
      tok.dataset.playerId = p.id;
      // Lấy emoji con vật được chọn hoặc mặc định
      const emoji = p.tokenEmoji || (GameCore.animalTokens[i % GameCore.animalTokens.length] ? GameCore.animalTokens[i % GameCore.animalTokens.length].emoji : '🐊');
      tok.innerText = emoji;
      tok.setAttribute('title', `${p.name} (${emoji})`);
      if (players.length > 4) {
        // Nhiều người chơi -> tự động co kích thước tối ưu
        tok.classList.add('small-token');
      }
      return tok;
    });

    // Dựng danh sách thẻ người chơi bên phải
    const playersList = document.getElementById('players-list');
    playersList.innerHTML = '';
    players
      .slice()
      .sort((first, second) => Number(first.isBankrupt) - Number(second.isBankrupt))
      .forEach((p, i) => {
      const card = document.createElement('div');
      card.className = 'player-card';
      card.id = `card-p${p.id}`;

      const emoji = p.tokenEmoji || (GameCore.animalTokens[i % GameCore.animalTokens.length] ? GameCore.animalTokens[i % GameCore.animalTokens.length].emoji : '🐊');
      const badge = document.createElement('span');
      badge.className = 'player-badge';
      badge.style.borderColor = p.color;
      badge.innerText = emoji;

      const pTag = document.createElement('span');
      pTag.className = `player-order-tag player-order-p${p.id}`;
      pTag.style.backgroundColor = p.color;
      pTag.innerText = `P${p.id}`;

      const name = document.createElement('span');
      name.className = 'player-name';
      name.innerText = p.name;

      const money = document.createElement('span');
      money.className = 'player-money';
      const moneySpan = document.createElement('span');
      moneySpan.id = `p${p.id}-money`;
      moneySpan.innerText = p.money;
      money.appendChild(moneySpan);

      card.appendChild(badge);
      card.appendChild(pTag);
      card.appendChild(name);
      card.appendChild(money);
      playersList.appendChild(card);
      });
  }

  // =========================================================
  // CẬP NHẬT GIAO DIỆN (RENDER)
  // =========================================================
  function renderUI() {
    const { players, currentPlayerIndex, board, logs } = GameCore.state;
    const currentPlayer = players[currentPlayerIndex];
    updateGodDiceControl(currentPlayer);

    // Cập nhật tiền & trạng thái tù cho từng người chơi
    players.forEach((p, i) => {
      const moneyEl = document.getElementById(`p${p.id}-money`);
      if (moneyEl) {
        if (p.disconnected) {
          const remaining = p.disconnectExpiresAt ? Math.max(0, Math.ceil((p.disconnectExpiresAt - Date.now()) / 1000)) : 120;
          moneyEl.innerHTML = `<span class="disconnect-warn-text">🔌 Mất kết nối (${remaining}s)</span>`;
        } else {
          moneyEl.innerText = p.isBankrupt ? "💀 Phá sản" : (`$${p.money}` + (p.inJail ? " 🔒" : ""));
        }
      }
      const cardEl = document.getElementById(`card-p${p.id}`);
      const shieldState = GameCore.getShieldVisualState(p);
      if (cardEl) {
        cardEl.classList.toggle('active', p.id === currentPlayer.id && !p.isBankrupt);
        cardEl.classList.toggle('bankrupt', !!p.isBankrupt);
        cardEl.classList.toggle('player-disconnected', !!p.disconnected);

        // Hiển thị buff badges (Khiên 🛡️, Giảm giá 🏷️)
        let buffContainer = cardEl.querySelector('.player-buff-badges');
        if (!buffContainer) {
          buffContainer = document.createElement('div');
          buffContainer.className = 'player-buff-badges';
          cardEl.appendChild(buffContainer);
        }
        buffContainer.innerHTML = '';
        if (shieldState.hasShield) {
          const s = document.createElement('span');
          s.className = `buff-badge buff-shield${shieldState.isCenterShield ? ' buff-center-shield' : ''}`;
          s.title = `${shieldState.isCenterShield ? 'Khiên ô trung tâm' : 'Khiên'}: còn ${shieldState.shieldCharges}/3 lần chặn`;
          s.innerText = `${shieldState.isCenterShield ? '✨🛡️' : '🛡️'} ${shieldState.shieldCharges}/3`;
          buffContainer.appendChild(s);
        }
        const activeBuffs = [
          ['midasCharges', 'buff-midas', `👑 Midas ${p.midasCharges} nhà`, 'Đế Chế Midas'],
          ['godDiceTurns', 'buff-god-dice', `🎯 Dice ${p.godDiceTurns} lượt`, 'Quyền Năng Thượng Đế'],
          ['globalTollTurns', 'buff-toll', `💸 Thu phí ${p.globalTollTurns} lượt`, 'Hoàng Tộc Thu Phí']
        ];
        activeBuffs.forEach(([key, className, text, title]) => {
          if (!(Number(p[key]) > 0)) return;
          const buff = document.createElement('span');
          buff.className = `buff-badge ${className}`;
          buff.title = `${title}: còn ${p[key]} lượt`;
          buff.innerText = text;
          buffContainer.appendChild(buff);
        });
        if (p.activeCenterBuff === 'SPECIAL_SHOP' && p.specialShop?.purchasesRemaining > 0) {
          const shopBuff = document.createElement('span');
          shopBuff.className = 'buff-badge buff-special-shop';
          shopBuff.title = `Cửa hàng đặc biệt: còn mua ${p.specialShop.purchasesRemaining} thẻ, đổi ${p.specialShop.refreshesRemaining} lần`;
          shopBuff.innerText = `🛒 Shop ${p.specialShop.purchasesRemaining}/2`;
          buffContainer.appendChild(shopBuff);
        }
        if (p.hasDiscount) {
          const d = document.createElement('span');
          d.className = 'buff-badge buff-discount';
          d.title = 'Giảm 50% tiền mua đất ở lượt kế tiếp';
          d.innerText = '🏷️ -50%';
          buffContainer.appendChild(d);
        }
      }
      if (playerTokens[i]) {
        playerTokens[i].style.display = p.isBankrupt ? 'none' : 'flex';
        const hasActiveCenterBuff = GameCore.isCenterBuffActive(p);
        playerTokens[i].classList.toggle('shield-aura', !p.isBankrupt && shieldState.hasShield);
        playerTokens[i].classList.toggle('center-buff-aura', !p.isBankrupt && hasActiveCenterBuff);
        playerTokens[i].classList.toggle('center-shield-aura', !p.isBankrupt && shieldState.isCenterShield);
        playerTokens[i].classList.toggle('center-midas-aura', !p.isBankrupt && p.activeCenterBuff === 'MIDAS_EMPIRE' && Number(p.midasCharges) > 0);
        playerTokens[i].classList.toggle('center-god-dice-aura', !p.isBankrupt && p.activeCenterBuff === 'GOD_DICE' && Number(p.godDiceTurns) > 0);
        playerTokens[i].classList.toggle('center-toll-aura', !p.isBankrupt && p.activeCenterBuff === 'GLOBAL_TOLL_KING' && Number(p.globalTollTurns) > 0);
        playerTokens[i].classList.toggle('center-special-shop-aura', !p.isBankrupt && p.activeCenterBuff === 'SPECIAL_SHOP' && p.specialShop?.purchasesRemaining > 0);
      }
    });

    const playersList = document.getElementById('players-list');
    if (playersList) {
      players
        .slice()
        .sort((first, second) => Number(first.isBankrupt) - Number(second.isBankrupt))
        .forEach(player => {
          const card = document.getElementById(`card-p${player.id}`);
          if (card) playersList.appendChild(card);
        });
    }

    // Di chuyển quân cờ & phân bổ vị trí
    const byPosition = {};
    players.forEach((p, i) => {
      if (playerTokens[i] && !p.isBankrupt) {
        if (!byPosition[p.position]) byPosition[p.position] = [];
        byPosition[p.position].push(i);
      }
    });

    players.forEach((p, i) => {
      const tileEl = document.getElementById(`tile-${p.position}`);
      if (!tileEl || !playerTokens[i] || p.isBankrupt) return;
      tileEl.appendChild(playerTokens[i]);

      // Xếp chồng quân cờ khi nhiều người cùng đứng trên 1 ô
      const group = byPosition[p.position] || [i];
      const idxInGroup = group.indexOf(i);
      if (group.length > 1) {
        playerTokens[i].classList.add('token-stacked');
        const angle = (idxInGroup / group.length) * 2 * Math.PI - Math.PI / 2;
        const radius = group.length > 3 ? 15 : 12;
        const cx = 50;
        const cy = 50;
        playerTokens[i].style.left = `calc(${cx}% + ${Math.cos(angle) * radius}px)`;
        playerTokens[i].style.top = `calc(${cy}% + ${Math.sin(angle) * radius}px)`;
        playerTokens[i].style.transform = 'translate(-50%, -50%) scale(0.92)';
      } else {
        playerTokens[i].classList.remove('token-stacked');
        playerTokens[i].style.left = '50%';
        playerTokens[i].style.top = '50%';
        playerTokens[i].style.right = '';
        playerTokens[i].style.bottom = '';
        playerTokens[i].style.transform = 'translate(-50%, -50%)';
      }
    });

    // Cập nhật ẩn/hiện nút bảo lãnh ra tù
    if (currentPlayer.inJail && currentPlayer.money >= 100 && !rollBtn.disabled) {
      bailBtn.style.display = 'block';
    } else {
      bailBtn.style.display = 'none';
    }

    // Cập nhật ô đất
    board.forEach((tile, index) => {
      updateTileOwnershipUI(index, tile.owner);
      updateTileBadgeUI(index, tile.houses || 0);
      updateTileMortgageUI(index, !!tile.mortgaged);

      const tileElem = document.getElementById(`tile-${index}`);
      if (tileElem) {
        tileElem.classList.toggle('tile-frozen', !!tile.frozenTurns);
        tileElem.classList.toggle('tile-protected', !!tile.protectedTurns || !!tile.permanentProtection);
        tileElem.classList.toggle('tile-boosted', !!tile.boostTurns || !!tile.rentMultiplier);
        tileElem.classList.toggle('tile-oil-trap', tile.trap === 'SLIDE_OIL');
        if (tile.rentMultiplier && tile.rentMultiplier > 1) {
          tileElem.classList.add('tile-boosted-rent');
          tileElem.setAttribute('data-rent-multiplier', `${tile.rentMultiplier}x`);
        } else {
          tileElem.classList.remove('tile-boosted-rent');
          tileElem.removeAttribute('data-rent-multiplier');
        }
      }
    });

    updateGroupGlowUI();

    // Cập nhật nhật ký trò chơi và tin nhắn chat.
    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML = '';
    logs.forEach(msg => {
      const msgDiv = document.createElement('div');
      msgDiv.className = 'chat-msg';
      msgDiv.innerText = msg;
      chatBox.appendChild(msgDiv);
    });
    const renderedChatIds = new Set();
    (GameCore.state.chatMessages || []).forEach(({ from, text, ts }) => {
      const messageId = ts || `${from}:${text}`;
      if (renderedChatIds.has(messageId)) return;
      renderedChatIds.add(messageId);
      const msgDiv = document.createElement('div');
      msgDiv.className = 'chat-msg';
      msgDiv.innerText = `${from}: ${text}`;
      chatBox.appendChild(msgDiv);
    });
    chatBox.scrollTop = chatBox.scrollHeight;

    const notificationList = document.getElementById('game-notification-list');
    if (notificationList) {
      notificationList.innerHTML = '';
      logs.slice().reverse().forEach((message, index) => {
        const notification = document.createElement('div');
        notification.className = `game-notification game-notification-${index}`;
        notification.innerText = message;
        notificationList.appendChild(notification);
      });

      const refreshNotificationFade = () => {
        const listRect = notificationList.getBoundingClientRect();
        notificationList.querySelectorAll('.game-notification').forEach(notification => {
          const relativeTop = notification.getBoundingClientRect().top - listRect.top;
          const opacity = Math.max(0.18, Math.min(1, 1 - (relativeTop / Math.max(1, listRect.height)) * 0.7));
          notification.style.opacity = opacity.toFixed(2);
        });
      };
      refreshNotificationFade();
      if (!notificationList.dataset.fadeBound) {
        notificationList.addEventListener('scroll', refreshNotificationFade, { passive: true });
        notificationList.dataset.fadeBound = 'true';
      }
    }

    renderInventory();
    renderTradePanel();

    // Cập nhật cảnh báo nợ (khi tiền âm)
    if (debtAlertBanner) {
      if (currentPlayer && !currentPlayer.isBankrupt && currentPlayer.money < 0) {
        debtAlertBanner.classList.remove('hidden');
        if (debtAlertText) {
          const debtAmount = Math.abs(currentPlayer.money);
          if (currentPlayer.lastCreditorId) {
            const creditor = players.find(p => p.id === currentPlayer.lastCreditorId);
            debtAlertText.innerText = `Đang nợ ${creditor ? creditor.name : 'người chơi khác'} $${debtAmount}! Hãy bán nhà, cầm cố đất hoặc giao dịch để trả nợ trước khi kết thúc lượt.`;
          } else {
            debtAlertText.innerText = `Đang nợ Ngân hàng $${debtAmount}! Hãy bán nhà, cầm cố đất hoặc giao dịch để trả nợ trước khi kết thúc lượt.`;
          }
        }
        endTurnBtn.disabled = true;
        if (rollBtn.dataset.action === 'end-turn') rollBtn.disabled = true;
      } else {
        debtAlertBanner.classList.add('hidden');
      }
    }

    // Cập nhật nút đầu hàng / phá sản
    if (surrenderBtn) {
      surrenderBtn.disabled = !currentPlayer || !!currentPlayer.isBankrupt;
    }

    // Kiểm tra phá sản
    checkAndShowBankruptcy();

    // Kiểm tra kết thúc game
    if (GameCore.state.gameOver) {
      showVictoryScreen(GameCore.state.winner, GameCore.state.players);
    }

    // Cập nhật jackpot display (bãi xe)
    const jackpotDisplay = document.getElementById('jackpot-display');
    const jackpotAmountEl = document.getElementById('jackpot-amount');
    if (jackpotDisplay && jackpotAmountEl) {
      const jackpot = GameCore.state.jackpot || 0;
      if (jackpot > 0) {
        jackpotAmountEl.innerText = `$${jackpot}`;
        jackpotDisplay.classList.remove('hidden');
      } else {
        jackpotDisplay.classList.add('hidden');
      }
    }

    // Hiện/ẩn nút Đấu Giá trong buy-popover dựa vào auctionMode và cập nhật nút Mua
    const buyAuctionBtn = document.getElementById('buy-auction-btn');
    const buyYesBtn = document.getElementById('buy-yes-btn');
    const isAuctionMode = GameCore.settings?.auctionMode === true;
    if (buyAuctionBtn) {
      if (isAuctionMode) {
        buyAuctionBtn.classList.remove('hidden');
      } else {
        buyAuctionBtn.classList.add('hidden');
      }
    }

    if (buyYesBtn && GameCore.state.pendingTile) {
      const p = GameCore.getCurrentPlayer();
      const tile = GameCore.state.pendingTile;
      const effectivePrice = (p && p.hasDiscount) ? Math.round(tile.price * 0.5) : (tile.price || 0);
      const canAfford = !!(p && p.money >= effectivePrice);
      buyYesBtn.disabled = !canAfford;
    }
  }

  function closeTradeDetailModal() {
    activeDetailRequestId = null;
    if (tradeDetailModal) tradeDetailModal.classList.add('hidden');
  }

  function renderTradeDetailProps(container, propertyIds) {
    container.innerHTML = '';
    if (!propertyIds || !propertyIds.length) {
      container.innerHTML = '<div class="trade-prop-mini-empty">📦 Không kèm ô đất nào</div>';
      return;
    }

    const groupColors = {
      BROWN: '#8d5524',
      LIGHT_BLUE: '#4fc3f7',
      PINK: '#f06292',
      ORANGE: '#fb8c00',
      RED: '#ef5350',
      YELLOW: '#fdd835',
      GREEN: '#43a047',
      DARK_BLUE: '#3949ab',
      RAILROAD: '#607d8b',
      UTILITY: '#00b894'
    };

    propertyIds.forEach(id => {
      const tile = GameCore.state.board.find(t => t.id === id);
      if (!tile) return;
      const color = groupColors[tile.group] || (tile.type === 'RAILROAD' ? '#607d8b' : '#00b894');
      const icon = tile.type === 'RAILROAD' ? '🚆' : tile.type === 'UTILITY' ? '💡' : '🏠';

      const item = document.createElement('div');
      item.className = 'trade-detail-prop-item';
      item.style.borderLeft = `4px solid ${color}`;

      let houseText = '';
      if (tile.type === 'PROPERTY') {
        if (tile.houses === 5) houseText = '🏨 Khách sạn';
        else if (tile.houses > 0) houseText = `🏠 x${tile.houses}`;
      }
      const mortgageText = tile.mortgaged ? '🏦 Cầm cố' : '';

      item.innerHTML = `
        <div class="prop-item-main">
          <span class="prop-item-icon">${icon}</span>
          <span class="prop-item-name" title="${tile.name}">${tile.name}</span>
        </div>
        <div class="prop-item-sub">
          <span class="prop-item-price">🏷️ $${tile.price || 0}</span>
          ${houseText ? `<span class="prop-item-house">${houseText}</span>` : ''}
          ${mortgageText ? `<span class="prop-item-mortgage">${mortgageText}</span>` : ''}
        </div>
      `;
      container.appendChild(item);
    });
  }

  function renderTradeDetailCards(container, cardIds) {
    if (!container) return;
    const catalog = window.GameCore.Shop?.cardCatalog || [];
    const cards = (cardIds || []).map(cardId => catalog.find(card => card.id === cardId)).filter(Boolean);
    container.innerHTML = cards.length
      ? cards.map(card => `<div class="trade-detail-card-item"><span>${card.title}</span><small>${card.rarity}</small></div>`).join('')
      : '<div class="trade-prop-mini-empty">🃏 Không kèm thẻ bài</div>';
  }

  function openTradeDetailModal(request) {
    if (!request || !tradeDetailModal) return;
    activeDetailRequestId = request.id;
    syncTradeModalWidth(tradeDetailModal);

    const fromP = GameCore.state.players.find(p => p.id === request.fromPlayerId);
    const toP = GameCore.state.players.find(p => p.id === request.toPlayerId);

    const fromBadgeEl = document.getElementById('trade-detail-from-badge');
    const fromNameEl = document.getElementById('trade-detail-from-name');
    const toBadgeEl = document.getElementById('trade-detail-to-badge');
    const toNameEl = document.getElementById('trade-detail-to-name');

    if (fromBadgeEl) {
      fromBadgeEl.innerText = fromP?.tokenEmoji || '👤';
      fromBadgeEl.style.borderColor = fromP?.color || '#ffffff';
    }
    if (fromNameEl) {
      fromNameEl.innerText = `${fromP ? fromP.name : 'Người chơi'} (P${fromP?.id || 1})`;
    }
    if (toBadgeEl) {
      toBadgeEl.innerText = toP?.tokenEmoji || '👤';
      toBadgeEl.style.borderColor = toP?.color || '#ffffff';
    }
    if (toNameEl) {
      toNameEl.innerText = `${toP ? toP.name : 'Người chơi'} (P${toP?.id || 2})`;
    }

    const fromCashEl = document.getElementById('trade-detail-from-cash');
    const toCashEl = document.getElementById('trade-detail-to-cash');
    if (fromCashEl) fromCashEl.innerHTML = `💰 Tiền đưa: <b>$${request.offerCash || 0}</b>`;
    if (toCashEl) toCashEl.innerHTML = `💰 Tiền yêu cầu: <b>$${request.requestCash || 0}</b>`;

    const fromPropsEl = document.getElementById('trade-detail-from-props');
    const toPropsEl = document.getElementById('trade-detail-to-props');
    renderTradeDetailCards(document.getElementById('trade-detail-from-cards'), request.offerCardIds);
    renderTradeDetailCards(document.getElementById('trade-detail-to-cards'), request.requestCardIds);
    if (fromPropsEl) renderTradeDetailProps(fromPropsEl, request.offerPropertyIds);
    if (toPropsEl) renderTradeDetailProps(toPropsEl, request.requestPropertyIds);

    const actionsContainer = document.getElementById('trade-detail-actions');
    if (actionsContainer) {
      actionsContainer.innerHTML = '';
      const online = !!(window.GameOnline && GameOnline.isOnline());
      const playerIndex = online ? GameOnline.myIndex : GameCore.state.currentPlayerIndex;
      const me = GameCore.state.players[playerIndex];

      const isReceiver = me && (request.toPlayerId === me.id || !online);
      const isSender = me && (request.fromPlayerId === me.id);

      if (isReceiver) {
        const acceptBtn = document.createElement('button');
        acceptBtn.className = 'btn btn-buy trade-detail-accept-btn';
        acceptBtn.innerText = '✅ CHẤP NHẬN TRAO ĐỔI';
        acceptBtn.addEventListener('click', () => {
          if (online) {
            GameOnline.sendAction('ACCEPT_TRADE', { requestId: request.id });
          } else {
            GameCore.acceptTrade(request.toPlayerId, request.id);
            renderUI();
          }
          closeTradeDetailModal();
        });
        actionsContainer.appendChild(acceptBtn);

        const declineBtn = document.createElement('button');
        declineBtn.className = 'btn btn-skip trade-detail-decline-btn';
        declineBtn.innerText = '❌ TỪ CHỐI';
        declineBtn.addEventListener('click', () => {
          if (online) {
            GameOnline.sendAction('DECLINE_TRADE', { requestId: request.id });
          } else {
            GameCore.declineTrade(me.id, request.id);
            renderUI();
          }
          closeTradeDetailModal();
        });
        actionsContainer.appendChild(declineBtn);
      } else if (isSender) {
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-skip trade-detail-cancel-btn';
        cancelBtn.innerText = '🗑️ HỦY ĐỀ NGHỊ';
        cancelBtn.addEventListener('click', () => {
          if (online) {
            GameOnline.sendAction('DECLINE_TRADE', { requestId: request.id });
          } else {
            GameCore.declineTrade(me.id, request.id);
            renderUI();
          }
          closeTradeDetailModal();
        });
        actionsContainer.appendChild(cancelBtn);
      }

    }

    tradeDetailModal.classList.remove('hidden');
  }

  function renderTradePanel() {
    const form = document.getElementById('trade-form');
    const requestsBox = document.getElementById('trade-requests');
    if (!form || !requestsBox) return;
    const online = !!(window.GameOnline && GameOnline.isOnline());
    const playerIndex = online ? GameOnline.myIndex : GameCore.state.currentPlayerIndex;
    const me = GameCore.state.players[playerIndex];
    if (!me) return;
    form.innerHTML = '';
    const newTradeBtn = document.createElement('button');
    newTradeBtn.type = 'button'; newTradeBtn.className = 'trade-submit'; newTradeBtn.innerText = '🤝 Tạo đề nghị trao đổi';
    const otherPlayers = GameCore.state.players.filter(player => player.id !== me.id && !player.isBankrupt);
    newTradeBtn.disabled = otherPlayers.length === 0;
    newTradeBtn.addEventListener('click', openTradePlayerModal);
    form.appendChild(newTradeBtn);

    requestsBox.innerHTML = '';
    const requests = GameCore.state.tradeRequests || [];

    // Nếu đang mở popup chi tiết một đề nghị không còn tồn tại -> tự động đóng
    if (activeDetailRequestId) {
      const activeReq = requests.find(r => r.id === activeDetailRequestId);
      if (!activeReq) {
        closeTradeDetailModal();
      }
    }

    if (!requests.length) {
      requestsBox.innerHTML = '<div class="trade-empty">Chưa có đề nghị trao đổi nào.</div>';
      return;
    }

    requests.forEach(request => {
      const fromP = GameCore.state.players.find(player => player.id === request.fromPlayerId);
      const toP = GameCore.state.players.find(player => player.id === request.toPlayerId);
      const fromName = fromP ? fromP.name : 'Người chơi';
      const toName = toP ? toP.name : 'Người chơi';
      const fromEmoji = fromP?.tokenEmoji || '👤';
      const toEmoji = toP?.tokenEmoji || '👤';

      const isMeTo = (me.id === request.toPlayerId);
      const isMeFrom = (me.id === request.fromPlayerId);

      const item = document.createElement('div');
      item.className = 'trade-preview-card';
      if (isMeTo) item.classList.add('incoming-for-me');
      else if (isMeFrom) item.classList.add('outgoing-from-me');

      item.innerHTML = `
        <div class="trade-preview-header">
          <div class="trade-preview-pair">
            <span class="preview-user" title="${fromName}">
              <span class="preview-token">${fromEmoji}</span> ${fromName}
            </span>
            <span class="preview-arrow">➔</span>
            <span class="preview-user" title="${toName}">
              <span class="preview-token">${toEmoji}</span> ${toName}
            </span>
          </div>
        </div>
      `;

      item.addEventListener('click', () => {
        openTradeDetailModal(request);
      });

      requestsBox.appendChild(item);
    });
  }

  function getTradeParticipants() {
    const online = !!(window.GameOnline && GameOnline.isOnline());
    const playerIndex = online ? GameOnline.myIndex : GameCore.state.currentPlayerIndex;
    const me = GameCore.state.players[playerIndex];
    const target = GameCore.state.players.find(player => player.id === tradeTargetPlayerId);
    return { online, me, target };
  }

  function openTradePlayerModal() {
    const { online, me } = getTradeParticipants();
    const select = document.getElementById('trade-player-select');
    if (!me || !select) return;
    const others = GameCore.state.players.filter(player => player.id !== me.id && !player.isBankrupt);
    select.innerHTML = '';
    others.forEach(player => {
      const option = document.createElement('option');
      option.value = player.id; option.innerText = player.name;
      select.appendChild(option);
    });
    tradeTargetPlayerId = Number(select.value) || null;
    syncTradeModalWidth(tradePlayerModal);
    tradePlayerModal.classList.remove('hidden');
  }

  function addTradePropertyOptions(container, properties) {
    container.innerHTML = '';
    if (!properties.length) {
      const empty = document.createElement('div');
      empty.className = 'trade-empty';
      empty.innerHTML = '<span>📦 Không có bất động sản nào</span>';
      container.appendChild(empty);
      return;
    }

    const groupColors = {
      BROWN: '#8d5524',
      LIGHT_BLUE: '#4fc3f7',
      PINK: '#f06292',
      ORANGE: '#fb8c00',
      RED: '#ef5350',
      YELLOW: '#fdd835',
      GREEN: '#43a047',
      DARK_BLUE: '#3949ab',
      RAILROAD: '#607d8b',
      UTILITY: '#00b894'
    };

    properties.forEach(tile => {
      const card = document.createElement('div');
      card.className = 'trade-property-card';
      const color = groupColors[tile.group] || (tile.type === 'RAILROAD' ? '#607d8b' : '#00b894');
      card.style.setProperty('--card-group-color', color);
      card.style.borderLeft = `5px solid ${color}`;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = tile.id;
      checkbox.className = 'trade-prop-checkbox';

      const icon = tile.type === 'RAILROAD' ? '🚆' : tile.type === 'UTILITY' ? '💡' : '🏠';

      // Tính tiền thuê
      let rentText = '';
      if (tile.type === 'RAILROAD') {
        const owned = GameCore.state.board.filter(t => t.type === 'RAILROAD' && t.owner === tile.owner).length;
        rentText = `$${[0, 25, 50, 100, 200][owned] || 0}`;
      } else if (tile.type === 'UTILITY') {
        const owned = GameCore.state.board.filter(t => t.type === 'UTILITY' && t.owner === tile.owner).length;
        rentText = owned === 2 ? '🎲 x10' : '🎲 x4';
      } else {
        const rents = (tile.rent && tile.rent.length >= 6) ? tile.rent : [Math.round((tile.price || 100) * 0.1)];
        let r = rents[tile.houses || 0] || rents[0] || 0;
        const isFullGroup = GameCore.ownsFullGroup ? GameCore.ownsFullGroup(tile) : false;
        if (GameCore.settings.doubleRentOnFullGroup && !tile.houses && isFullGroup) {
          rentText = `$${r * 2} (x2)`;
        } else {
          rentText = `$${r}`;
        }
      }

      const isHotel = tile.houses === 5;
      const housesBadge = tile.type === 'PROPERTY'
        ? (isHotel
            ? '<span class="trade-chip hotel-chip">🏨 Khách sạn</span>'
            : (tile.houses > 0
                ? `<span class="trade-chip house-chip">🏠 x${tile.houses}</span>`
                : '<span class="trade-chip empty-chip">🌱 Đất trống</span>'))
        : '';

      const mortgagedBadge = tile.mortgaged ? '<span class="trade-chip mortgage-chip">🏦 Cầm cố</span>' : '';

      card.innerHTML = `
        <div class="trade-card-top">
          <div class="trade-card-name-wrap">
            <span class="trade-card-icon">${icon}</span>
            <span class="trade-card-name" title="${tile.name}">${tile.name}</span>
          </div>
          <div class="trade-check-indicator">
            <span class="trade-check-mark">✔</span>
          </div>
        </div>
        <div class="trade-card-bottom">
          <span class="trade-chip price-chip">🏷️ $${tile.price || 0}</span>
          <span class="trade-chip rent-chip">💰 Thuê: ${rentText}</span>
          ${housesBadge}
          ${mortgagedBadge}
        </div>
      `;

      card.prepend(checkbox);

      const updateSelected = () => {
        if (checkbox.checked) {
          card.classList.add('selected');
        } else {
          card.classList.remove('selected');
        }
      };

      card.addEventListener('click', (e) => {
        if (e.target !== checkbox) {
          checkbox.checked = !checkbox.checked;
        }
        updateSelected();
      });

      checkbox.addEventListener('change', updateSelected);

      container.appendChild(card);
    });
  }

  function openTradeOfferModal() {
    const select = document.getElementById('trade-player-select');
    tradeTargetPlayerId = Number(select && select.value) || null;
    const { me, target } = getTradeParticipants();
    if (!me || !target) return;
    const offerCashInput = document.getElementById('trade-modal-offer-cash');
    const requestCashInput = document.getElementById('trade-modal-request-cash');
    document.getElementById('trade-offer-title').innerText = `🤝 Trao đổi với ${target.name}`;
    offerCashInput.value = '0';
    requestCashInput.value = '0';
    offerCashInput.max = String(Math.max(0, me.money || 0));
    requestCashInput.max = String(Math.max(0, target.money || 0));
    bindTradeCashLimit(offerCashInput, () => me.money);
    bindTradeCashLimit(requestCashInput, () => target.money);
    addTradePropertyOptions(document.getElementById('trade-modal-offer-properties'), GameCore.state.board.filter(tile => tile.owner === me.id));
    addTradePropertyOptions(document.getElementById('trade-modal-request-properties'), GameCore.state.board.filter(tile => tile.owner === target.id));
    addTradeCardOptions(document.getElementById('trade-modal-offer-cards'), me.shopCards || []);
    addTradeCardOptions(document.getElementById('trade-modal-request-cards'), target.shopCards || []);
    tradePlayerModal.classList.add('hidden');
    syncTradeModalWidth(tradeOfferModal);
    tradeOfferModal.classList.remove('hidden');
  }

  function addTradeCardOptions(container, cardIds) {
    if (!container) return;
    const catalog = window.GameCore.Shop?.cardCatalog || [];
    container.innerHTML = cardIds.length ? cardIds.map((cardId, index) => {
      const card = catalog.find(item => item.id === cardId);
      return card ? `<label class="trade-card-option"><input type="checkbox" value="${card.id}" data-card-index="${index}"><span>${card.title} <small>${card.rarity}</small></span></label>` : '';
    }).join('') : '<div class="trade-empty">Không có thẻ bài</div>';
  }

  function bindTradeCashLimit(input, getAvailableCash) {
    if (!input || input.dataset.tradeCashLimitBound) return;
    input.dataset.tradeCashLimitBound = 'true';
    input.addEventListener('input', () => {
      const availableCash = Math.max(0, Number(getAvailableCash()) || 0);
      const enteredCash = Number(input.value);
      if (!Number.isFinite(enteredCash) || enteredCash < 0) {
        input.value = '0';
      } else if (enteredCash > availableCash) {
        input.value = String(availableCash);
      }
    });
  }

  function submitTradeRequest() {
    const { online, me, target } = getTradeParticipants();
    if (!target || !me) return;
    const ids = selector => [...document.querySelectorAll(`${selector} input:checked`)].map(input => Number(input.value));
    const offerCash = Math.max(0, Number(document.getElementById('trade-modal-offer-cash').value) || 0);
    const requestCash = Math.max(0, Number(document.getElementById('trade-modal-request-cash').value) || 0);
    const offerPropertyIds = ids('#trade-modal-offer-properties');
    const requestPropertyIds = ids('#trade-modal-request-properties');
    const offerCardIds = [...document.querySelectorAll('#trade-modal-offer-cards input:checked')].map(input => input.value);
    const requestCardIds = [...document.querySelectorAll('#trade-modal-request-cards input:checked')].map(input => input.value);
    if (!offerCash && !requestCash && !offerPropertyIds.length && !requestPropertyIds.length && !offerCardIds.length && !requestCardIds.length) {
      alert('Hãy chọn tiền hoặc tài sản để trao đổi.');
      return;
    }
    if (me.money < offerCash) {
      alert(`Bạn chỉ có $${me.money}, không đủ $${offerCash} để đưa.`);
      return;
    }
    if (online) {
      GameOnline.sendAction('CREATE_TRADE', { trade: {
        toPlayerId: target.id, offerCash, requestCash, offerPropertyIds, requestPropertyIds, offerCardIds, requestCardIds
      }});
    } else {
      GameCore.createTrade(me.id, {
        toPlayerId: target.id, offerCash, requestCash, offerPropertyIds, requestPropertyIds, offerCardIds, requestCardIds
      });
      renderUI();
    }
    tradeOfferModal.classList.add('hidden');
  }

  function renderInventory() {
    const inventoryBox = document.getElementById('inventory-box');
    if (!inventoryBox) return;

    const online = !!(window.GameOnline && GameOnline.isOnline());
    const playerIndex = online
      ? GameOnline.myIndex
      : GameCore.state.currentPlayerIndex;
    const player = GameCore.state.players[playerIndex];
    const properties = player
      ? GameCore.state.board.filter(tile => tile.owner === player.id)
      : [];
    const ownedCards = player?.shopCards || [];
    const cardCatalog = window.GameCore.Shop?.cardCatalog || [];

    inventoryBox.innerHTML = '';
    if (!properties.length && !ownedCards.length) {
      const empty = document.createElement('div');
      empty.className = 'inventory-empty';
      empty.innerHTML = '<span>🎒 Chưa sở hữu tài sản nào.</span>';
      inventoryBox.appendChild(empty);
      return;
    }

    ownedCards.forEach(cardId => {
      const card = cardCatalog.find(item => item.id === cardId);
      if (!card) return;
      const item = document.createElement('div');
      item.className = `inventory-item inventory-card rarity-${card.rarity}`;
      item.innerHTML = `<div class="inventory-item-header"><div class="inventory-item-name"><span class="inventory-icon">${card.title.split(' ')[0]}</span><span class="inventory-title-text">${card.title.replace(/^\S+\s*/, '')}</span></div></div><div class="inventory-item-details"><span class="inv-detail-chip">${card.rarity}</span><span class="inv-detail-chip price">🪙 $${card.price}</span></div><div class="inventory-card-description">${card.text}</div><button class="inventory-use-card" type="button">Dùng thẻ</button>`;
      item.querySelector('.inventory-use-card').addEventListener('click', event => {
        event.stopPropagation();
        window.GameCore.Shop.useCard(player, cardId);
      });
      inventoryBox.appendChild(item);
    });

    const groupColors = {
      BROWN: '#8d5524',
      LIGHT_BLUE: '#4fc3f7',
      PINK: '#f06292',
      ORANGE: '#fb8c00',
      RED: '#ef5350',
      YELLOW: '#fdd835',
      GREEN: '#43a047',
      DARK_BLUE: '#3949ab',
      RAILROAD: '#607d8b',
      UTILITY: '#00b894'
    };

    const groupNames = {
      BROWN: 'Nâu',
      LIGHT_BLUE: 'Xanh nhạt',
      PINK: 'Hồng',
      ORANGE: 'Cam',
      RED: 'Đỏ',
      YELLOW: 'Vàng',
      GREEN: 'Xanh lá',
      DARK_BLUE: 'Xanh đậm',
      RAILROAD: 'Nhà Ga',
      UTILITY: 'Công Trình'
    };

    properties.forEach(tile => {
      const tileIdx = GameCore.state.board.findIndex(t => t.id === tile.id);
      const isSelected = (selectedTileIndex === tileIdx);

      const item = document.createElement('div');
      item.className = `inventory-item ${isSelected ? 'selected' : ''}`;
      const color = groupColors[tile.group] || (tile.type === 'RAILROAD' ? '#607d8b' : '#00b894');
      item.style.setProperty('--card-group-color', color);
      item.style.borderLeft = `5px solid ${color}`;

      const icon = tile.type === 'RAILROAD' ? '🚆' : tile.type === 'UTILITY' ? '💡' : '🏠';

      // Tính tiền thuê hiện tại
      let rentText = '';
      if (tile.type === 'RAILROAD') {
        const owned = properties.filter(t => t.type === 'RAILROAD').length;
        rentText = `$${[0, 25, 50, 100, 200][owned] || 0}`;
      } else if (tile.type === 'UTILITY') {
        const owned = properties.filter(t => t.type === 'UTILITY').length;
        rentText = owned === 2 ? '🎲 x10' : '🎲 x4';
      } else {
        const rents = (tile.rent && tile.rent.length >= 6) ? tile.rent : [Math.round((tile.price || 100) * 0.1)];
        let r = rents[tile.houses || 0] || rents[0] || 0;
        const isFullGroup = GameCore.ownsFullGroup ? GameCore.ownsFullGroup(tile) : false;
        if (GameCore.settings.doubleRentOnFullGroup && !tile.houses && isFullGroup) {
          rentText = `$${r * 2} (x2)`;
        } else {
          rentText = `$${r}`;
        }
      }

      const isHotel = tile.houses === 5;
      const housesBadge = tile.type === 'PROPERTY'
        ? (isHotel
            ? '<span class="inv-badge hotel-badge">🏨 Khách sạn</span>'
            : (tile.houses > 0
                ? `<span class="inv-badge house-badge">🏠 x${tile.houses}</span>`
                : '<span class="inv-badge empty-badge">🌱 Đất trống</span>'))
        : '';

      const isFullGroup = (tile.type === 'PROPERTY' && GameCore.ownsFullGroup && GameCore.ownsFullGroup(tile));
      const fullGroupBadge = isFullGroup ? '<span class="inv-badge full-badge">✨ Trọn bộ</span>' : '';
      const mortgageBadge = tile.mortgaged ? '<span class="inv-badge mortgage-badge">🏦 Đang cầm cố</span>' : '';

      item.innerHTML = `
        <div class="inventory-item-header">
          <div class="inventory-item-name">
            <span class="inventory-icon">${icon}</span>
            <span class="inventory-title-text">${tile.name}</span>
          </div>
        </div>
        <div class="inventory-item-details">
          <span class="inv-detail-chip price">🏷️ $${tile.price || 0}</span>
          <span class="inv-detail-chip rent">💰 Thuê: <b>${rentText}</b></span>
        </div>
        <div class="inventory-item-badges">
          ${housesBadge}
          ${fullGroupBadge}
          ${mortgageBadge}
        </div>
      `;

      item.title = 'Bấm để xem chi tiết & quản lý bất động sản';
      item.addEventListener('click', () => {
        if (tileIdx >= 0) {
          openPropertyCard(tileIdx);
          renderInventory();
        }
      });

      inventoryBox.appendChild(item);
    });
  }

  // =========================================================
  // KIỂM TRA PHÁ SẢN & CHIẾN THẮNG
  // =========================================================

  // Track which players we already showed bankruptcy for (avoid repeats)
  const shownBankruptIds = new Set();

  function checkAndShowBankruptcy() {
    GameCore.state.players.forEach(player => {
      if (!player.isBankrupt) return;
      if (shownBankruptIds.has(player.id)) return;
      shownBankruptIds.add(player.id);

      const modal = document.getElementById('bankruptcy-modal');
      const nameEl = document.getElementById('bankruptcy-player-name');
      if (!modal || !nameEl) return;
      nameEl.innerText = `${player.tokenEmoji || '💀'} ${player.name} đã phá sản!`;
      modal.classList.remove('hidden');
    });
  }

  document.getElementById('bankruptcy-close-btn')?.addEventListener('click', () => {
    document.getElementById('bankruptcy-modal')?.classList.add('hidden');
  });

  function launchFireworks(container) {
    const colors = ['#fdcb6e','#f39c12','#ffeaa7','#55efc4','#74b9ff','#fd79a8','#e17055','#a29bfe'];
    const PARTICLE_COUNT = 60;
    container.innerHTML = '';
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = document.createElement('div');
      p.className = 'firework-particle';
      const color = colors[Math.floor(Math.random() * colors.length)];
      const angle = Math.random() * Math.PI * 2;
      const dist = 80 + Math.random() * 200;
      const tx = Math.cos(angle) * dist;
      const ty = -(60 + Math.random() * dist);
      const dur = 0.8 + Math.random() * 1.0;
      const delay = Math.random() * 1.2;
      const startX = 20 + Math.random() * 60; // % from left
      const startY = 20 + Math.random() * 60; // % from top
      p.style.cssText = `
        left:${startX}%;top:${startY}%;
        background:${color};
        --tx:${tx}px;--ty:${ty}px;
        --dur:${dur}s;--delay:${delay}s;
      `;
      container.appendChild(p);
    }
    // Relaunch every 2s for continuous fireworks
    return setInterval(() => launchFireworks(container), 2200);
  }

  let fireworksInterval = null;

  function showVictoryScreen(winner, players) {
    const overlay = document.getElementById('victory-overlay');
    if (!overlay || overlay._shown) return;
    overlay._shown = true;

    // Fill winner info
    document.getElementById('victory-winner-token').innerText = winner?.tokenEmoji || '🏆';
    document.getElementById('victory-winner-name').innerText = winner?.name || 'Không có người chiến thắng';
    const worth = winner?.finalNetWorth ?? (winner ? GameCore.netWorth?.(winner) ?? winner.money : 0);
    document.getElementById('victory-net-worth').innerText = `💰 Tổng tài sản: $${worth.toLocaleString()}`;

    // Build rankings: alive first sorted by net worth desc, then bankrupt sorted by order
    const alive = players.filter(p => !p.isBankrupt).sort((a,b) => (b.finalNetWorth ?? b.money) - (a.finalNetWorth ?? a.money));
    const bankrupt = players.filter(p => p.isBankrupt);
    const ranked = [...alive, ...bankrupt];
    const rankingEl = document.getElementById('victory-rankings');
    rankingEl.innerHTML = '';
    const medals = ['🥇','🥈','🥉'];
    ranked.forEach((p, i) => {
      const row = document.createElement('div');
      row.className = `victory-rank-item${p.isBankrupt ? ' victory-rank-bankrupt' : ''}`;
      const w = p.finalNetWorth ?? p.money;
      row.innerHTML = `
        <span class="victory-rank-pos">${medals[i] || `#${i+1}`}</span>
        <span class="victory-rank-emoji">${p.tokenEmoji || '🎯'}</span>
        <span class="victory-rank-name">${p.name}</span>
        <span class="victory-rank-worth">$${w.toLocaleString()}</span>
      `;
      rankingEl.appendChild(row);
    });

    // Launch fireworks
    const fw = document.getElementById('victory-fireworks');
    if (fw) {
      if (fireworksInterval) clearInterval(fireworksInterval);
      fireworksInterval = launchFireworks(fw);
    }

    overlay.classList.remove('hidden');
  }

  // ---- NÚT CHƠI LẠI / VỀ LOBBY (chỉ cho OFFLINE) ----
  // Online mode: nút này được xử lý hoàn toàn trong online.js (hookButtons)
  document.getElementById('victory-play-again-btn')?.addEventListener('click', () => {
    if (window.GameOnline && GameOnline.isOnline && GameOnline.isOnline()) return; // online.js xử lý
    const overlay = document.getElementById('victory-overlay');
    if (overlay) { overlay.classList.add('hidden'); overlay._shown = false; }
    if (fireworksInterval) { clearInterval(fireworksInterval); fireworksInterval = null; }
    shownBankruptIds.clear();
    // Offline restart
    const currentPlayers = GameCore.state.players.map(p => ({ name: p.name, emoji: p.tokenEmoji, color: p.color }));
    GameCore.initGame({
      playerCount: currentPlayers.length,
      playerTokens: currentPlayers.map(p => ({ name: p.name, emoji: p.emoji, color: p.color })),
      settings: GameCore.settings
    });
    buildBoard();
    buildPlayersUI();
    renderUI();
  });

  document.getElementById('victory-lobby-btn')?.addEventListener('click', () => {
    if (window.GameOnline && GameOnline.isOnline && GameOnline.isOnline()) return; // online.js xử lý
    const overlay = document.getElementById('victory-overlay');
    if (overlay) { overlay.classList.add('hidden'); overlay._shown = false; }
    if (fireworksInterval) { clearInterval(fireworksInterval); fireworksInterval = null; }
    shownBankruptIds.clear();
    // Offline -> về màn hình settings
    const settingsOv = document.getElementById('settings-overlay');
    if (settingsOv) settingsOv.classList.remove('hidden');
  });

  function updateTileOwnershipUI(index, ownerId) {

    const tileElem = document.getElementById(`tile-${index}`);
    if (!tileElem) return;

    // Xoá các class sở hữu cũ
    GameCore.state.players.forEach((p) => {
      tileElem.classList.remove(`owned-p${p.id}`);
    });
    const oldBadge = document.getElementById(`owner-badge-${index}`);
    if (oldBadge) oldBadge.remove();

    if (ownerId === null || ownerId === undefined) return;

    const owner = GameCore.state.players.find((p) => p.id === ownerId);
    if (!owner) return;

    tileElem.classList.add(`owned-p${ownerId}`);
    const badge = document.createElement('div');
    badge.id = `owner-badge-${index}`;
    badge.className = `owner-badge owner-badge-p${ownerId}`;
    badge.style.backgroundColor = owner.color;
    badge.innerText = `🚩 P${ownerId}`;
    tileElem.appendChild(badge);
  }

function updateTileBadgeUI(index, houses) {
    const tileElem = document.getElementById(`tile-${index}`);
    if (!tileElem) return;
    let houseBadge = document.getElementById(`house-tile-${index}`);

    if (houses <= 0) {
      if (houseBadge) houseBadge.remove();
      return;
    }

    // Đặt icon nhà NẰM TRONG thanh màu (group-bar) của ô đất
    const groupBar = tileElem.querySelector('.group-bar');
    if (!groupBar) {
      if (houseBadge) houseBadge.remove();
      return;
    }

    if (!houseBadge) {
      houseBadge = document.createElement('div');
      houseBadge.id = `house-tile-${index}`;
      houseBadge.className = 'house-tile-badge';
      groupBar.appendChild(houseBadge);
    }
    houseBadge.innerText = houses === 5 ? "🏨" : `🏠${houses}`;
  }

  // ĐÁNH DẤU Ô ĐẤT ĐANG BỊ CẦM CỐ
  function updateTileMortgageUI(index, isMortgaged) {
    const tileElem = document.getElementById(`tile-${index}`);
    if (!tileElem) return;

    let mortgageBadge = document.getElementById(`mortgage-badge-${index}`);
    if (!isMortgaged) {
      if (mortgageBadge) mortgageBadge.remove();
      return;
    }
    if (!mortgageBadge) {
      mortgageBadge = document.createElement('div');
      mortgageBadge.id = `mortgage-badge-${index}`;
      mortgageBadge.className = 'mortgage-badge';
      mortgageBadge.innerText = '🔒';
      mortgageBadge.title = 'Đang bị cầm cố';
      tileElem.appendChild(mortgageBadge);
    }
  }

  // HIỆU ỨNG GLOW & VIỀN ĐẬM KHI SỞ HỮU TRỌN NHÓM MÀU (KHÔNG CẦM CỐ)
  function updateGroupGlowUI() {
    const { board, players } = GameCore.state;
    const groups = {};
    board.forEach((tile, index) => {
      if (tile && tile.type === "PROPERTY" && tile.group) {
        if (!groups[tile.group]) groups[tile.group] = [];
        groups[tile.group].push(index);
      }
    });

    const monopolizedGroups = {};
    for (const groupName in groups) {
      const indices = groups[groupName];
      const firstOwner = board[indices[0]].owner;
      const allOwned = indices.every(i => board[i].owner !== null && board[i].owner !== undefined);
      const allSameOwner = indices.every(i => board[i].owner === firstOwner);
      const noneMortgaged = indices.every(i => !board[i].mortgaged);
      if (allOwned && allSameOwner && noneMortgaged && firstOwner !== null) {
        monopolizedGroups[groupName] = firstOwner;
      }
    }

    board.forEach((tile, index) => {
      const tileElem = document.getElementById(`tile-${index}`);
      if (!tileElem) return;

      // Xóa các class glow cũ
      tileElem.classList.remove('tile-full-group', 'group-glow');
      players.forEach(p => {
        tileElem.classList.remove(`group-glow-p${p.id}`);
      });

      if (tile.group && monopolizedGroups[tile.group] !== undefined) {
        const ownerId = monopolizedGroups[tile.group];
        tileElem.classList.add('tile-full-group', 'group-glow', `group-glow-p${ownerId}`);
      }
    });
  }

  // =========================================================
  // MỞ THẺ THÔNG TIN ĐẤT
  // =========================================================
  function openPropertyCard(index) {
    selectedTileIndex = index;
    const tile = GameCore.state.board[index];
    const pos = getGridPosition(index);
    const currentPlayer = GameCore.getCurrentPlayer();

    infoCardModal.classList.remove('weather-info-card');

    document.getElementById('info-card-name').innerText = tile.name;

    const footerHouse = document.getElementById('info-footer-house');
    const footerHotel = document.getElementById('info-footer-hotel');
    for (let i = 0; i <= 5; i++) {
      const rentElem = document.getElementById(`info-rent-${i}`);
      const labelElem = document.getElementById(`info-rent-${i}-label`);
      const row = (rentElem && rentElem.parentElement) || (labelElem && labelElem.parentElement);
      if (row) row.style.display = '';
    }
    if (footerHouse) footerHouse.style.display = '';
    if (footerHotel) footerHotel.style.display = '';

    const isRailroad = tile.type === "RAILROAD";
    const isUtility = tile.type === "UTILITY";

    if (isRailroad) {
      const railroadRents = ['$ 25', '$ 50', '$ 100', '$ 200'];
      const labels = ['Sở hữu 1 ga', 'Sở hữu 2 ga', 'Sở hữu 3 ga', 'Sở hữu 4 ga'];
      for (let i = 0; i <= 5; i++) {
        const rentElem = document.getElementById(`info-rent-${i}`);
        const labelElem = document.getElementById(`info-rent-${i}-label`);
        const row = rentElem ? rentElem.parentElement : (labelElem ? labelElem.parentElement : null);
        if (rentElem) rentElem.innerText = railroadRents[i] || '';
        if (labelElem) labelElem.innerText = labels[i] || '';
        if (row) row.style.display = (i >= 4) ? 'none' : '';
      }
      document.getElementById('info-table-when').innerText = 'Ga';
      document.getElementById('info-table-get').innerText = 'Thuê';
      if (footerHouse) footerHouse.style.display = 'none';
      if (footerHotel) footerHotel.style.display = 'none';
      document.getElementById('info-card-price').innerText = `$ ${tile.price || 0}`;
      document.getElementById('info-card-house').innerText = '$ 0';
      document.getElementById('info-card-hotel').innerText = '$ 0';
    } else if (isUtility) {
      // Check xem có phải Trạm Khí Tượng không
      const isWeatherStation = tile.name && (tile.name.includes('Khí Tượng') || tile.name.includes('Dự Báo'));

      if (isWeatherStation) {
        // === TRẠM KHÍ TƯỢNG: Hiển thị 4 loại thời tiết ===
        infoCardModal.classList.add('weather-info-card');
        const weatherTypes = [
          {
            emoji: '🌧️',
            name: 'Mưa Ngập',
            label: '🌧️ Mưa Ngập (3 lượt)',
            effects: 'Lùi 1 ô · Được xây'
          },
          {
            emoji: '☀️',
            name: 'Nắng Nóng',
            label: '☀️ Nắng Nóng (3 lượt)',
            effects: 'Chủ đất lời hơn'
          },
          {
            emoji: '🌪️',
            name: 'Bão Lớn',
            label: '🌪️ Bão Lớn (2 lượt)',
            effects: 'Hạ 1 cấp mọi ô · Cấm xây'
          },
          {
            emoji: '🍃',
            name: 'Gió Nhẹ',
            label: '🍃 Gió Nhẹ (3 lượt)',
            effects: 'Cộng 2 ô mỗi lượt'
          }
        ];

        for (let i = 0; i <= 5; i++) {
          const rentElem = document.getElementById(`info-rent-${i}`);
          const labelElem = document.getElementById(`info-rent-${i}-label`);
          const row = rentElem ? rentElem.parentElement : (labelElem ? labelElem.parentElement : null);
          
          if (i < weatherTypes.length) {
            const weather = weatherTypes[i];
            if (rentElem) rentElem.innerText = weather.effects;
            if (labelElem) labelElem.innerText = weather.label;
            if (row) row.style.display = '';
          } else {
            if (row) row.style.display = 'none';
          }
        }
        
        document.getElementById('info-table-when').innerText = 'Thời tiết';
        document.getElementById('info-table-get').innerText = 'Hiệu ứng';
        if (footerHouse) footerHouse.style.display = 'none';
        if (footerHotel) footerHotel.style.display = 'none';
        document.getElementById('info-card-price').innerText = `$ ${tile.price || 0}`;
        document.getElementById('info-card-house').innerText = 'Kích hoạt';
        document.getElementById('info-card-hotel').innerText = 'Hiệu ứng';
      } else {
        // === NHÂN CỘNG THƯỜNG (Nhà máy) ===
        const utilityLabels = ['Sở hữu 1 nhà máy', 'Sở hữu 2 nhà máy', '', '', '', ''];
        const utilityValues = ['x4 tiền xúc xắc', 'x10 tiền xúc xắc', '', '', '', ''];
        for (let i = 0; i <= 5; i++) {
          const rentElem = document.getElementById(`info-rent-${i}`);
          const labelElem = document.getElementById(`info-rent-${i}-label`);
          const row = rentElem ? rentElem.parentElement : (labelElem ? labelElem.parentElement : null);
          if (rentElem) rentElem.innerText = utilityValues[i] || '';
          if (labelElem) labelElem.innerText = utilityLabels[i] || '';
          if (row) row.style.display = (i >= 2) ? 'none' : '';
        }
        document.getElementById('info-table-when').innerText = 'Sở hữu';
        document.getElementById('info-table-get').innerText = 'Tiền thuê';
        if (footerHouse) footerHouse.style.display = 'none';
        if (footerHotel) footerHotel.style.display = 'none';
        document.getElementById('info-card-price').innerText = `$ ${tile.price || 0}`;
        document.getElementById('info-card-house').innerText = '$ 0';
        document.getElementById('info-card-hotel').innerText = '$ 0';
      }
    } else {
      const defaultRent = [
        Math.round((tile.price || 100) * 0.08),
        Math.round((tile.price || 100) * 0.4),
        Math.round((tile.price || 100) * 1.2),
        Math.round((tile.price || 100) * 3.2),
        Math.round((tile.price || 100) * 5.5),
        Math.round((tile.price || 100) * 7.5)
      ];
      const rents = (tile.rent && tile.rent.length >= 6) ? tile.rent : defaultRent;

      for (let i = 0; i <= 5; i++) {
        const rentElem = document.getElementById(`info-rent-${i}`);
        const labelElem = document.getElementById(`info-rent-${i}-label`);
        if (rentElem) rentElem.innerText = `$ ${rents[i]}`;
        if (labelElem) labelElem.parentElement.style.display = '';
      }
      document.getElementById('info-table-when').innerText = 'Khi';
      document.getElementById('info-table-get').innerText = 'Nhận';
      if (footerHouse) footerHouse.style.display = '';
      if (footerHotel) footerHotel.style.display = '';

      const houseCost = tile.housePrice || Math.round((tile.price || 100) * 0.75);
      document.getElementById('info-card-price').innerText = `$ ${tile.price || 0}`;
      document.getElementById('info-card-house').innerText = `$ ${houseCost}`;
      document.getElementById('info-card-hotel').innerText = `$ ${houseCost}`;
    }

    // QUẢN LÝ NÚT THAO TÁC
    const controlsDiv = document.getElementById('info-card-controls');
    const btnBuild = document.getElementById('btn-build-house');
    const btnSell = document.getElementById('btn-sell-house');
    const btnMortgage = document.getElementById('btn-mortgage');

    const isWeatherStationTile = tile.name && (tile.name.includes('Khí Tượng') || tile.name.includes('Dự Báo'));
    if (isWeatherStationTile) controlsDiv.classList.add('hidden');

    const online = !!(window.GameOnline && GameOnline.isOnline());
    const localPlayerIndex = online ? GameOnline.myIndex : GameCore.state.currentPlayerIndex;
    const isMyTurn = (online ? (GameOnline.myIndex === GameCore.state.currentPlayerIndex) : true);
    const localPlayer = GameCore.state.players[localPlayerIndex] || currentPlayer;

    if (tile.owner === localPlayer.id) {
      controlsDiv.classList.remove('hidden');
      const houses = tile.houses || 0;
      const houseCost = tile.housePrice || Math.round((tile.price || 100) * 0.75);
      const isMortgaged = !!tile.mortgaged;
      const mortgageVal = Math.round(tile.price / 2);

      const canBuild = !!(GameCore.isBuildableProperty
        ? GameCore.isBuildableProperty(tile)
        : (tile.type === "PROPERTY" && tile.group && tile.price > 0));

      // Nếu đất đang bị CẦM CỐ thì KHÔNG được xây nhà / dỡ nhà nữa
      if (isMortgaged) {
        btnBuild.style.display = '';
        btnSell.style.display = '';
        btnBuild.disabled = true;
        btnBuild.innerText = `🏦 Đang bị cầm cố`;
        btnSell.disabled = true;
        btnSell.innerText = `📉 Dỡ nhà (bị cầm cố)`;
      } else {
        btnBuild.style.display = canBuild ? '' : 'none';
        btnSell.style.display = canBuild ? '' : 'none';

        const freeBuild = !!(GameCore.settings && GameCore.settings.freeBuildOnFullGroup);
        const isFullGroup = !!(tile.group && GameCore.ownsFullGroup && GameCore.ownsFullGroup(tile));

        if (!canBuild) {
          btnMortgage.style.display = '';
        } else if (houses >= 5) {
          btnBuild.disabled = true;
          btnBuild.innerText = `🏨 Đã tối đa`;
          btnBuild.title = `Bất động sản đã đạt cấp Khách sạn tối đa`;
        } else if (freeBuild && !isFullGroup) {
          // Chế độ freeBuildOnFullGroup: chưa đủ trọn bộ màu -> khóa hoàn toàn
          btnBuild.disabled = true;
          btnBuild.innerText = `👑 Cần trọn bộ màu`;
          btnBuild.title = `Cần sở hữu trọn bộ nhóm màu mới được phép xây nhà`;
        } else if (!isMyTurn) {
          btnBuild.disabled = true;
          btnBuild.innerText = houses === 4 ? `🏨 Chưa đến lượt ($${houseCost})` : `🏠 Chưa đến lượt ($${houseCost})`;
          btnBuild.title = `Chưa đến lượt của bạn`;
        } else if (!freeBuild && localPlayer.hasBuiltHouseThisTurn) {
          btnBuild.disabled = true;
          btnBuild.innerText = `⏳ Đã mua nhà lượt này`;
          btnBuild.title = `Mỗi lượt chỉ được mua nhà 1 lần trên toàn bộ bất động sản`;
        } else if (!freeBuild && tile.lastBuiltPlayerTurn && ((localPlayer.turnCount || 1) - tile.lastBuiltPlayerTurn < 2)) {
          btnBuild.disabled = true;
          btnBuild.innerText = `⏳ Cần cách 1 lượt`;
          btnBuild.title = `Ô đất này cần cách 1 lượt của bạn mới được nâng cấp tiếp`;
        } else if (localPlayer.money < houseCost) {
          btnBuild.disabled = true;
          btnBuild.innerText = houses === 4 ? `🏨 Thiếu tiền ($${houseCost})` : `🏠 Thiếu tiền ($${houseCost})`;
          btnBuild.title = `Bạn không đủ tiền để nâng cấp`;
        } else {
          btnBuild.disabled = false;
          btnBuild.innerText = houses === 4
            ? `🏨 Nâng cấp Khách sạn ($${houseCost})${freeBuild ? ' 👑' : ''}`
            : `🏠 Xây nhà ($${houseCost})${freeBuild ? ' 👑' : ''}`;
          btnBuild.title = freeBuild ? `Trọn bộ màu - Nâng nhà tự do!` : `Nâng cấp bất động sản`;
        }

        if (canBuild && houses > 0) {
          btnSell.disabled = !isMyTurn;
          btnSell.innerText = `📉 Dỡ nhà (+$${Math.round(houseCost / 2)})`;
        } else if (canBuild) {
          btnSell.disabled = true;
          btnSell.innerText = `📉 Dỡ nhà`;
        }
      }

      // Nút Cầm cố / Chuộc lại / Bán
      btnMortgage.disabled = !isMyTurn;
      if (GameCore.settings.mortgageInsteadOfSell) {
        btnMortgage.innerText = isMortgaged
          ? `🔓 Chuộc lại (+$${mortgageVal + Math.round(mortgageVal * 0.1)} = trả $${mortgageVal + Math.round(mortgageVal * 0.1)})`
          : `🏦 Cầm cố (+$${mortgageVal})`;
      } else {
        btnMortgage.innerText = `🏦 Bán hẳn (+$${mortgageVal})`;
      }
    } else {
      controlsDiv.classList.add('hidden');
    }

    // ĐỊNH VỊ POP-UP
    positionPopupNearTile(infoCardModal, index);

  }

  async function showCrossRouteChoice(choice, dice = 0, startPos = null) {
    if (!choice) return;
    let modal = document.getElementById('cross-route-choice');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'cross-route-choice';
      modal.className = 'cross-route-choice';
      document.body.appendChild(modal);
    }

    if (!modal.classList.contains('hidden') && modal.querySelector('.cross-route-dialog')) return;

    const fromName = GameCore.state.board[choice.from]?.name || `Ga #${choice.from}`;
    const toName = GameCore.state.board[choice.to]?.name || `Ga #${choice.to}`;
    modal.innerHTML = `
      <div class="cross-route-dialog">
        <div class="cross-route-title">🚉 Đã đến ${fromName}</div>
        <div class="cross-route-text">Chọn lối đi cho lượt kế tiếp</div>
        <div class="cross-route-destination">Đường trong sẽ đến ${toName}</div>
        <div class="cross-route-actions">
          <button type="button" class="cross-route-inner">✚ Đường trong</button>
          <button type="button" class="cross-route-outer">↻ Vòng ngoài</button>
        </div>
      </div>
    `;
    modal.classList.remove('hidden');

    const close = () => modal.classList.add('hidden');
    modal.querySelector('.cross-route-inner').addEventListener('click', async () => {
      close();
      if (window.GameOnline && GameOnline.isOnline && GameOnline.isOnline()) {
        GameOnline.sendAction('CHOOSE_CROSS_ROUTE', { useInnerRoute: true });
      } else {
        const result = GameCore.chooseCrossRoute(GameCore.getCurrentPlayer(), true);
        if (result && result.movementPath) {
          const playerIndex = GameCore.state.players.findIndex(player => player.id === result.playerId);
          await moveTokenStepByStep(playerTokens[playerIndex], startPos ?? result.startPos, dice, result.movementPath);
        }
        renderUI();
        updateTurnActionButton(false);
        showLandingInteraction(result);
      }
    });
    modal.querySelector('.cross-route-outer').addEventListener('click', async () => {
      close();
      if (window.GameOnline && GameOnline.isOnline && GameOnline.isOnline()) {
        GameOnline.sendAction('CHOOSE_CROSS_ROUTE', { useInnerRoute: false });
      } else {
        const result = GameCore.chooseCrossRoute(GameCore.getCurrentPlayer(), false);
        if (result && result.movementPath) {
          const playerIndex = GameCore.state.players.findIndex(player => player.id === result.playerId);
          await moveTokenStepByStep(playerTokens[playerIndex], startPos ?? result.startPos, dice, result.movementPath);
        }
        renderUI();
        updateTurnActionButton(false);
        showLandingInteraction(result);
      }
    });
  }

  function showLandingInteraction(result) {
    if (!result || result.action !== 'PROMPT_BUY') return;
    const tile = result.tile;
    const effectivePrice = result.effectivePrice !== undefined ? result.effectivePrice : tile.price;
    document.getElementById('modal-tile-name').innerText = tile.name;
    document.getElementById('modal-tile-price').innerText = result.discount
      ? `Giá ưu đãi (50%): $${effectivePrice} (Gốc: $${tile.price})`
      : `Giá: $${tile.price}`;
    const buyYesBtn = document.getElementById('buy-yes-btn');
    if (buyYesBtn) buyYesBtn.disabled = !result.canAfford;
    positionBuyPrompt(tile.id);
    buyModal.classList.remove('hidden');
    endTurnBtn.disabled = true;
  }

  document.addEventListener('game:cross-route-choice', (event) => {
    const detail = event.detail || {};
    showCrossRouteChoice(detail.crossRouteChoice, detail.dice, detail.startPos);
  });

  // =========================================================
  // HOẠT ẢNH DI CHUYỂN QUÂN CỜ
  // =========================================================
  async function moveTokenStepByStep(tokenElem, startPos, steps, movementPath = null) {
    tokenElem.classList.add('moving');
    const path = Array.isArray(movementPath) && movementPath.length > 0
      ? movementPath
      : Array.from({ length: steps }, (_, index) => (startPos + index + 1) % 40);
    for (const currentPos of path) {
      const targetTile = document.getElementById(`tile-${currentPos}`);
      if (targetTile) targetTile.appendChild(tokenElem);
      await new Promise(resolve => setTimeout(resolve, 110));
    }
    tokenElem.classList.remove('moving');
  }

  // =========================================================
  // CỤC XÚC XẮC 2D TRUYỀN THỐNG (2D DICE DOTS)
  // =========================================================
  const DICE_PIP_POSITIONS = {
    1: [[2, 2]],
    2: [[1, 3], [3, 1]],
    3: [[1, 3], [2, 2], [3, 1]],
    4: [[1, 1], [1, 3], [3, 1], [3, 3]],
    5: [[1, 1], [1, 3], [2, 2], [3, 1], [3, 3]],
    6: [[1, 1], [1, 3], [2, 1], [2, 3], [3, 1], [3, 3]]
  };

  function renderDiceFace(elem, value) {
    if (!elem) return;
    const v = Math.max(1, Math.min(6, parseInt(value, 10) || 1));
    elem.dataset.val = v;
    elem.innerHTML = '';
    const pips = DICE_PIP_POSITIONS[v] || DICE_PIP_POSITIONS[1];
    pips.forEach(([row, col]) => {
      const pip = document.createElement('div');
      pip.className = 'dice-pip';
      pip.style.gridRow = row;
      pip.style.gridColumn = col;
      elem.appendChild(pip);
    });
  }

  async function playDiceAnimation(total, dicePair = null) {
    const first = document.getElementById('dice-one');
    const second = document.getElementById('dice-two');
    if (!first || !second) return;
    first.classList.add('rolling');
    second.classList.add('rolling');
    for (let i = 0; i < 7; i++) {
      renderDiceFace(first, Math.floor(Math.random() * 6) + 1);
      renderDiceFace(second, Math.floor(Math.random() * 6) + 1);
      await new Promise(resolve => setTimeout(resolve, 75));
    }
    let d1, d2;
    if (Array.isArray(dicePair) && dicePair.length === 2) {
      d1 = dicePair[0];
      d2 = dicePair[1];
    } else {
      d1 = Math.max(1, Math.min(6, Math.floor((total || 2) / 2)));
      d2 = Math.max(1, Math.min(6, (total || 2) - d1));
    }
    renderDiceFace(first, d1);
    renderDiceFace(second, d2);
    first.classList.remove('rolling');
    second.classList.remove('rolling');
  }

  // =========================================================
  // ĐẤU GIÁ (MỞ / CẬP NHẬT / ĐẶT GIÁ / BỎ LƯỢT)
  // =========================================================
  let selectedOfflineBidderIndex = -1;

  function openAuctionModal() {
    if (!auctionModal) return;
    const a = GameCore.state.auctionState;
    const tile = GameCore.state.auctionTile;
    if (!a || !tile) return;

    const isOnline = !!(window.GameOnline && GameOnline.isOnline && GameOnline.isOnline());
    if (!isOnline) {
      // Offline: Chọn bidder mặc định là người chơi hợp lệ đầu tiên
      const currentPIdx = GameCore.state.currentPlayerIndex;
      const currentP = GameCore.state.players[currentPIdx];
      if (currentP && !currentP.isBankrupt && a.eligibleIds && a.eligibleIds.includes(currentP.id)) {
        selectedOfflineBidderIndex = currentPIdx;
      } else {
        const firstEligibleId = a.eligibleIds && a.eligibleIds[0];
        selectedOfflineBidderIndex = GameCore.state.players.findIndex(p => p.id === firstEligibleId);
      }
    }

    document.getElementById('auction-tile-name').innerText = `🔨 Đấu giá: ${tile.name}`;
    renderAuctionModal();
    auctionModal.classList.remove('hidden');
    endTurnBtn.disabled = true;
    rollBtn.disabled = true;
    startAuctionTimer();
  }

  // Khởi động bộ đếm thời gian đấu giá - cập nhật mỗi 100ms để thanh trượt mượt
  function startAuctionTimer() {
    stopAuctionTimer();
    const a = GameCore.state.auctionState;
    if (!a || !a.active) return;
    // Đảm bảo timerEnd được set đúng khi bắt đầu
    if (!a.timerEnd || a.timerEnd < Date.now()) {
      a.timerEnd = Date.now() + (a.timerDuration || 5) * 1000;
    }
    updateAuctionTimerDisplay();
    auctionTimerInterval = setInterval(() => {
      const cur = GameCore.state.auctionState;
      if (!cur || !cur.active) {
        stopAuctionTimer();
        return;
      }
      updateAuctionTimerDisplay();
      // Hết giờ → kết thúc đấu giá (chỉ offline; online do server xử lý)
      if (Date.now() >= cur.timerEnd) {
        const isOnline = window.GameOnline && window.GameOnline.isOnline && window.GameOnline.isOnline();
        if (!isOnline) {
          stopAuctionTimer();
          GameCore.endAuction();
          handleAuctionEnd();
        }
      }
    }, 100); // 100ms = ~10fps animation mượt
  }

  function stopAuctionTimer() {
    if (auctionTimerInterval) {
      clearInterval(auctionTimerInterval);
      auctionTimerInterval = null;
    }
  }

  function updateAuctionTimerDisplay() {
    const a = GameCore.state.auctionState;
    if (!a || !auctionTimerEl) return;
    const durationMs = (a.timerDuration || 5) * 1000;
    const remaining = Math.max(0, a.timerEnd - Date.now());
    const percentage = Math.min(100, (remaining / durationMs) * 100);
    auctionTimerEl.style.width = `${percentage}%`;
    // Màu thay đổi: xanh → vàng → đỏ khi sắp hết giờ
    if (percentage > 60) {
      auctionTimerEl.style.background = 'linear-gradient(90deg, #00b894, #00cec9)';
    } else if (percentage > 30) {
      auctionTimerEl.style.background = 'linear-gradient(90deg, #fdcb6e, #f39c12)';
    } else {
      auctionTimerEl.style.background = 'linear-gradient(90deg, #ff6b6b, #e74c3c)';
    }
    // Hiển thị số giây còn lại
    const secsLeft = Math.ceil(remaining / 1000);
    const timerTrack = document.getElementById('auction-timer-track');
    if (timerTrack) {
      timerTrack.setAttribute('data-secs', secsLeft > 0 ? `${secsLeft}s` : '0s');
    }
  }

  function renderAuctionModal() {
    const a = GameCore.state.auctionState;
    if (!a) return;
    const highest = a.highestBidder ? `${a.highestBidder.tokenEmoji || ''} ${a.highestBidder.name}` : 'Chưa có';

    const currentBidEl = document.getElementById('auction-current-bid');
    const currentBidderEl = document.getElementById('auction-current-bidder');
    const turnEl = document.getElementById('auction-turn');
    const statusMsgEl = document.getElementById('auction-status-msg');

    if (currentBidEl) currentBidEl.innerHTML = `💰 Giá hiện tại: <b>$${a.currentBid}</b>`;
    if (currentBidderEl) currentBidderEl.innerHTML = `👤 Người trả giá cao nhất: <b>${highest}</b>`;
    if (turnEl) turnEl.innerHTML = `⏳ Thời gian: <b>ai đặt giá cao nhất sau 5s sẽ thắng!</b>`;

    const isOnline = !!(window.GameOnline && GameOnline.isOnline && GameOnline.isOnline());
    const offlineSection = document.getElementById('auction-offline-section');
    const offlineBiddersContainer = document.getElementById('auction-offline-bidders');
    const onlineInfo = document.getElementById('auction-online-info');
    const onlineBadge = document.getElementById('auction-online-player-badge');

    if (isOnline) {
      if (offlineSection) offlineSection.classList.add('hidden');
      if (onlineInfo) onlineInfo.classList.remove('hidden');

      const myIndex = GameOnline.myIndex;
      const me = GameCore.state.players[myIndex];
      const isEligible = !!(me && !me.isBankrupt && a.eligibleIds && a.eligibleIds.includes(me.id));

      if (onlineBadge && me) {
        onlineBadge.innerHTML = `👤 Bạn là: <b>${me.tokenEmoji || ''} ${me.name}</b> (Số dư: <b style="color: #55efc4;">$${me.money}</b>)`;
      }

      if (statusMsgEl) {
        if (!isEligible) {
          statusMsgEl.innerText = '⏭️ Bạn không đủ điều kiện hoặc đã bị loại khỏi đấu giá.';
          statusMsgEl.style.display = 'block';
        } else {
          statusMsgEl.innerText = '';
          statusMsgEl.style.display = 'none';
        }
      }

      // Cập nhật nút bấm cho Online
      auctionAddBtns.forEach(button => {
        const add = parseInt(button.dataset.add, 10) || 0;
        const targetBid = a.currentBid + add;
        const canAfford = isEligible && me && me.money >= targetBid;
        button.disabled = !canAfford;
        button.textContent = `+${add} ($${targetBid})`;
      });
    } else {
      // Offline mode: hiển thị danh sách người chơi chọn nhanh
      if (onlineInfo) onlineInfo.classList.add('hidden');
      if (offlineSection) offlineSection.classList.remove('hidden');

      if (offlineBiddersContainer) {
        offlineBiddersContainer.innerHTML = '';
        const eligiblePlayers = GameCore.state.players.filter(p =>
          !p.isBankrupt && a.eligibleIds && a.eligibleIds.includes(p.id)
        );

        if (selectedOfflineBidderIndex < 0 || !GameCore.state.players[selectedOfflineBidderIndex] || !a.eligibleIds.includes(GameCore.state.players[selectedOfflineBidderIndex].id)) {
          if (eligiblePlayers.length > 0) {
            selectedOfflineBidderIndex = GameCore.state.players.findIndex(p => p.id === eligiblePlayers[0].id);
          }
        }

        eligiblePlayers.forEach(p => {
          const pIdx = GameCore.state.players.findIndex(pl => pl.id === p.id);
          const chip = document.createElement('button');
          chip.type = 'button';
          chip.className = `bidder-chip ${pIdx === selectedOfflineBidderIndex ? 'selected' : ''}`;
          chip.innerHTML = `<span class="bidder-chip-emoji">${p.tokenEmoji || '🐊'}</span>
            <span>${p.name}</span>
            <span class="bidder-chip-money">($${p.money})</span>`;
          chip.addEventListener('click', (e) => {
            e.stopPropagation();
            selectedOfflineBidderIndex = pIdx;
            renderAuctionModal();
          });
          offlineBiddersContainer.appendChild(chip);
        });
      }

      const selectedBidder = GameCore.state.players[selectedOfflineBidderIndex];
      if (statusMsgEl) {
        if (!selectedBidder) {
          statusMsgEl.innerText = '⚠️ Hãy chọn một người chơi để đặt giá.';
          statusMsgEl.style.display = 'block';
        } else {
          statusMsgEl.innerText = '';
          statusMsgEl.style.display = 'none';
        }
      }

      // Cập nhật nút bấm cho Offline theo selectedBidder
      auctionAddBtns.forEach(button => {
        const add = parseInt(button.dataset.add, 10) || 0;
        const targetBid = a.currentBid + add;
        const canAfford = !!(selectedBidder && selectedBidder.money >= targetBid);
        button.disabled = !canAfford;
        button.textContent = `+${add} ($${targetBid})`;
      });
    }

    // Hiển thị quân cờ (token) của người trả giá cao nhất
    if (auctionHighestToken) {
      if (a.highestBidder) {
        auctionHighestToken.innerText = a.highestBidder.tokenEmoji || '🐊';
        auctionHighestToken.style.display = 'inline-block';
      } else {
        auctionHighestToken.style.display = 'none';
      }
    }

    updateAuctionTimerDisplay();

    const passBtn = document.getElementById('auction-pass-btn');
    if (passBtn) {
      passBtn.style.display = 'none';
    }
  }

  function closeAuctionModal() {
    stopAuctionTimer();
    if (auctionModal) auctionModal.classList.add('hidden');
    updateTurnActionButton(false);
    renderUI();
  }

  function handleAuctionEnd() {
    // Kết thúc đấu giá: đóng modal và cập nhật giao diện
    closeAuctionModal();
  }

  // =========================================================
  // SETTINGS: CÀI SỐ NGƯỜI CHƠI & BẮT ĐẦU
  // =========================================================
let chosenPlayerCount = 2;
  function updatePlayerCountDisplay() {
    playerCountVal.innerText = chosenPlayerCount;
  }

  // =========================================================
  // CHỌN NHÂN VẬT (QUÂN CỜ) CHO TỪNG NGƯỜI CHƠI
  // =========================================================
  let chosenTokens = [
    { name: "Sài Gòn Cá Sấu", emoji: "🐊" },
    { name: "Chợ Lớn Mèo", emoji: "🐱" },
    { name: "Hà Nội Chó", emoji: "🐶" },
    { name: "Đà Nẵng Chim", emoji: "🐦" },
    { name: "Cần Thơ Gấu", emoji: "🐻" },
    { name: "Vũng Tàu Thỏ", emoji: "🐰" },
    { name: "Huế Cá Vàng", emoji: "🐠" },
    { name: "Nha Trang Rùa", emoji: "🐢" }
  ];

  // Render khung chọn nhân vật theo số người chơi hiện tại
  function renderCharacterPicker() {
    const container = document.getElementById('character-picker');
    if (!container) return;
    container.innerHTML = '';

    // Chuẩn hoá lại mảng chosenTokens đúng số lượng người chơi (tự động gán con vật mặc định)
    while (chosenTokens.length < chosenPlayerCount) {
      const idx = chosenTokens.length;
      chosenTokens.push(GameCore.animalTokens[idx % GameCore.animalTokens.length] || { name: `Người chơi ${idx + 1}`, emoji: '🐊' });
    }
    chosenTokens.length = chosenPlayerCount;

    // Xác định các nhân vật đang được chọn bởi người khác
    const usedEmojis = chosenTokens.map(t => t.emoji);

    for (let i = 0; i < chosenPlayerCount; i++) {
      const wrapper = document.createElement('div');
      wrapper.className = 'char-picker-player';

      const label = document.createElement('div');
      label.className = 'char-picker-label';
      label.innerHTML = `Người chơi ${i + 1} <small>(${GameCore.playerNames[i] || ''})</small>`;

      const grid = document.createElement('div');
      grid.className = 'char-picker-grid';

      GameCore.animalTokens.forEach((token, ti) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'char-option';
        btn.dataset.emoji = token.emoji;
        btn.innerHTML = `<span class="char-emoji">${token.emoji}</span><span class="char-name">${token.name}</span>`;

        // Đánh dấu nhân vật đang được người chơi này chọn
        const isMine = chosenTokens[i] && chosenTokens[i].emoji === token.emoji;
        // Bị người khác lấy -> khoá
        const takenByOther = usedEmojis.includes(token.emoji) && !isMine;

        if (isMine) btn.classList.add('selected');
        if (takenByOther) btn.classList.add('taken');

        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          // Nếu nhân vật đã bị người khác chọn -> không cho chọn
          const takenBySomeoneElse = usedEmojis.some((em, ei) => em === token.emoji && ei !== i);
          if (takenBySomeoneElse) return;
          chosenTokens[i] = { name: token.name, emoji: token.emoji };
          renderCharacterPicker();
        });

        grid.appendChild(btn);
      });

      wrapper.appendChild(label);
      wrapper.appendChild(grid);
      container.appendChild(wrapper);
    }
  }

  playerMinus.addEventListener('click', () => {
    if (chosenPlayerCount > 2) {
      chosenPlayerCount--;
      updatePlayerCountDisplay();
      renderCharacterPicker();
    }
  });
  playerPlus.addEventListener('click', () => {
    if (chosenPlayerCount < 8) {
      chosenPlayerCount++;
      updatePlayerCountDisplay();
      renderCharacterPicker();
    }
  });
  updatePlayerCountDisplay();
  renderCharacterPicker();

  startGameBtn.addEventListener('click', () => {
    if (chosenPlayerCount < 2) {
      alert('Cần ít nhất 2 người chơi để bắt đầu trò chơi!');
      return;
    }

    const crossBoardEl = document.getElementById('set-cross-board');
    const config = {
      playerCount: chosenPlayerCount,
      initialMoney: parseInt(document.getElementById('set-initial-money').value, 10) || 1500,
      passGoMoney: parseInt(document.getElementById('set-pass-go').value, 10) || 200,
      doubleRentOnFullGroup: document.getElementById('set-double-rent').checked,
      mortgageInsteadOfSell: document.getElementById('set-mortgage').checked,
      jackpotOnFreeParking: document.getElementById('set-jackpot').checked,
      receiveRentWhileJailed: document.getElementById('set-rent-jailed').checked,
      auctionMode: document.getElementById('set-auction').checked,
      freeBuildOnFullGroup: document.getElementById('set-free-build-full-group').checked,
      boardMode: (crossBoardEl && crossBoardEl.checked) ? 'cross' : 'standard',
      chosenTokens: chosenTokens.slice(0, chosenPlayerCount)
    };

// Nếu đang chơi ONLINE -> gửi cài đặt luật lên server
    const isOnline = window.GameOnline && window.GameOnline.isOnline && window.GameOnline.isOnline();
    if (isOnline) {
      settingsOverlay.classList.add('hidden');
      // Broadcast cập nhật luật cho tất cả người chơi trong phòng chờ theo thời gian thực
      const s = (window.Lobby && window.Lobby.socket);
      if (s && window.Lobby && window.Lobby.roomCode) {
        s.emit('room:updateSettings', { code: window.Lobby.roomCode, settings: config });
      }
      if (window.Lobby && window.Lobby.startGame) {
        window.Lobby.startGame(config);
      }
      return; // Server sẽ tạo game & gửi state về -> onGameState dựng bàn cờ
    }

    GameCore.configure(config);
    GameCore.init();
    localTurnPlayerIndex = GameCore.state.currentPlayerIndex;
    localTurnHasRolled = false;

    buildBoard();
    buildPlayersUI();
    settingsOverlay.classList.add('hidden');

    // Cập nhật bảng luật chơi bên phải
    const rulesList = document.getElementById('rules-list');
    rulesList.innerHTML = `<ul>
      <li>• Số người chơi: <b>${chosenPlayerCount}</b></li>
      <li>• Tiền khởi tạo: <b>$${config.initialMoney}</b></li>
      <li>• Lương qua ô Start: <b>$${config.passGoMoney}</b></li>
      <li>• Nhân đôi thuê khi trọn nhóm: <b>${config.doubleRentOnFullGroup ? 'Bật' : 'Tắt'}</b></li>
      <li>• Cầm cố thay vì bán: <b>${config.mortgageInsteadOfSell ? 'Bật' : 'Tắt'}</b></li>
      <li>• Jackpot Bãi xe: <b>${config.jackpotOnFreeParking ? 'Bật' : 'Tắt'}</b></li>
      <li>• Nhận thuê khi ở tù: <b>${config.receiveRentWhileJailed ? 'Bật' : 'Tắt'}</b></li>
      <li>• Chế độ đấu giá: <b>${config.auctionMode ? 'Bật' : 'Tắt'}</b></li>
      <li>• Trọn bộ màu nâng nhà tự do: <b>${config.freeBuildOnFullGroup ? 'Bật' : 'Tắt'}</b></li>
      <li>• 🗺️ Bản đồ: <b>${config.boardMode === 'cross' ? 'Chữ Thập Mở Rộng (57 ô)' : 'Tiêu Chuẩn (40 ô)'}</b></li>
    </ul>`;

    renderUI();
  });

  // =========================================================
  // EVENT LISTENERS TRÒ CHƠI
  // =========================================================
  function updateTurnActionButton(disabled = false) {
    const currentPlayerIndex = GameCore.state.currentPlayerIndex;
    if (localTurnPlayerIndex !== currentPlayerIndex) {
      localTurnPlayerIndex = currentPlayerIndex;
      localTurnHasRolled = false;
    }

    if (!localTurnHasRolled) {
      rollBtn.innerText = 'GIEO XÚC XẮC';
      rollBtn.dataset.action = 'roll';
      rollBtn.disabled = disabled;
      endTurnBtn.disabled = true;
      return;
    }

    const canRollAgain = !!GameCore.state.extraRollPending;
    rollBtn.innerText = canRollAgain ? 'GIEO XÚC XẮC' : 'KẾT THÚC LƯỢT';
    rollBtn.dataset.action = canRollAgain ? 'roll' : 'end-turn';
    rollBtn.disabled = disabled;
    endTurnBtn.disabled = true;
  }

  document.getElementById('close-info-card-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    infoCardModal.classList.add('hidden');
  });

bailBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    // ONLINE: server xử lý -> không chạy cục bộ
    if (window.GameOnline && window.GameOnline.isOnline && window.GameOnline.isOnline()) return;
    if (GameCore.payBail()) renderUI();
  });

  // Xử lý thẻ Cơ hội / Khí vận
  if (btnAcceptCard) {
    btnAcceptCard.addEventListener('click', () => {
      // ONLINE: server xử lý -> không chạy cục bộ
      if (window.GameOnline && window.GameOnline.isOnline && window.GameOnline.isOnline()) return;
      cardModal.classList.add('hidden');
      const cardResult = GameCore.applyCardEffect();

      if (cardResult && (cardResult.action === "GO_TO_JAIL" || cardResult.action === "MOVE_TO" || cardResult.action === "MOVE_STEPS")) {
        const playerIndex = GameCore.state.currentPlayerIndex;
        const tokenElem = playerTokens[playerIndex];
        const targetTile = document.getElementById(`tile-${cardResult.finalPos}`);
        if (targetTile && tokenElem) targetTile.appendChild(tokenElem);
      }

const landing = cardResult ? cardResult.landing : null;
      if (landing && landing.action === "AUCTION") {
        // Thẻ đưa người chơi tới ô đất không đủ tiền mua -> đấu giá
        openAuctionModal();
        return;
      } else if (landing && landing.action === "PROMPT_BUY") {
        document.getElementById('modal-tile-name').innerText = landing.tile.name;
        document.getElementById('modal-tile-price').innerText = `Giá: $${landing.tile.price}`;
        positionBuyPrompt(cardResult.finalPos);
        buyModal.classList.remove('hidden');
        endTurnBtn.disabled = true;
      } else if (landing && landing.action === "DRAW_CARD") {
        const badgeEl = document.getElementById('card-type-badge');
        if (badgeEl) {
          badgeEl.innerText = landing.card.type;
          badgeEl.classList.toggle('badge-chance', landing.card.type === "CƠ HỘI");
          badgeEl.classList.toggle('badge-fortune', landing.card.type === "KHÍ VẬN");
        }
        document.getElementById('card-title').innerText = landing.card.title;
        document.getElementById('card-text').innerText = landing.card.text;
        cardModal.classList.remove('hidden');
        endTurnBtn.disabled = true;
      } else {
        updateTurnActionButton(false);
      }
      renderUI();
    });
  }

// Gieo xúc xắc
  rollBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    // ONLINE: server là nguồn sự thật -> không chạy logic cục bộ (online.js gửi hành động)
    if (window.GameOnline && window.GameOnline.isOnline && window.GameOnline.isOnline()) return;

    if (rollBtn.dataset.action === 'end-turn') {
      const curPlayer = GameCore.getCurrentPlayer();
      if (curPlayer && curPlayer.money < 0) {
        alert(`⚠️ Bạn đang nợ $${Math.abs(curPlayer.money)}! Hãy bán nhà, cầm cố đất hoặc giao dịch trước khi kết thúc lượt.`);
        return;
      }
      infoCardModal.classList.add('hidden');
      GameCore.endTurn();
      updateTurnActionButton(false);
      renderUI();
      return;
    }

    rollBtn.disabled = true;
    endTurnBtn.disabled = true;

    const godDiceControl = document.getElementById('god-dice-control');
    const godDiceSelect = godDiceControl?.querySelector('select');
    const rollingPlayer = GameCore.getCurrentPlayer();
    const selectedSteps = rollingPlayer?.godDiceTurns > 0 && godDiceSelect
      ? Number(godDiceSelect.value)
      : null;
    const res = GameCore.rollDice(selectedSteps);
    localTurnHasRolled = true;
    if (!res.godDice) await playDiceAnimation(GameCore.state.lastRoll, GameCore.state.lastDice);

    const playerIndex = res.playerId
      ? GameCore.state.players.findIndex(player => player.id === res.playerId)
      : GameCore.state.currentPlayerIndex;
    const tokenElem = playerTokens[playerIndex];

    // Hỏi tuyến ngay sau khi xúc xắc nếu người chơi đã chọn ga ở lượt trước.
    if (res.action === 'CHOOSE_CROSS_ROUTE') {
      rollBtn.disabled = true;
      endTurnBtn.disabled = true;
      await showCrossRouteChoice(res.crossRouteChoice, res.dice, res.startPos);
      return;
    }

    if (res.dice > 0 && res.action !== "STAY_IN_JAIL") {
      await moveTokenStepByStep(tokenElem, res.startPos, res.dice, res.movementPath);
      if (res.action === "GO_TO_JAIL") {
        await new Promise(resolve => setTimeout(resolve, 200));
        const jailTile = document.getElementById('tile-10');
        if (jailTile && tokenElem) jailTile.appendChild(tokenElem);
      }
    }

    if (res.action === "OPEN_SHOP") {
      const shopPlayer = GameCore.getCurrentPlayer();
      if (shopPlayer && GameCore.Shop) GameCore.Shop.openShop(shopPlayer);
    }
    if (res.action === "OPEN_SPECIAL_SHOP") {
      const shopPlayer = GameCore.getCurrentPlayer();
      if (shopPlayer && GameCore.Shop) GameCore.Shop.openShop(shopPlayer, true);
    }

    if (res.action === "PROMPT_BUY") {
      document.getElementById('modal-tile-name').innerText = res.tile.name;
      const effectivePrice = res.effectivePrice !== undefined ? res.effectivePrice : res.tile.price;
      document.getElementById('modal-tile-price').innerText = res.discount ? `Giá ưu đãi (50%): $${effectivePrice} (Gốc: $${res.tile.price})` : `Giá: $${res.tile.price}`;
      
      const buyAuctionBtn = document.getElementById('buy-auction-btn');
      if (buyAuctionBtn) {
        if (GameCore.settings?.auctionMode === true) {
          buyAuctionBtn.classList.remove('hidden');
        } else {
          buyAuctionBtn.classList.add('hidden');
        }
      }
      const buyYesBtn = document.getElementById('buy-yes-btn');
      if (buyYesBtn) {
        buyYesBtn.disabled = !res.canAfford;
      }
      const destinationIndex = Array.isArray(res.movementPath) && res.movementPath.length > 0
        ? res.movementPath[res.movementPath.length - 1]
        : (res.startPos + res.dice) % 40;
      positionBuyPrompt(destinationIndex);
      buyModal.classList.remove('hidden');
      endTurnBtn.disabled = true;
    } else if (res.action === "AUCTION") {
      // Đã bắt đầu đấu giá trong gameCore -> mở modal đấu giá
      openAuctionModal();
      return;
    } else if (res.action === "DRAW_CARD") {
      const badgeEl = document.getElementById('card-type-badge');
      if (badgeEl) {
        badgeEl.innerText = res.card.type;
        badgeEl.classList.toggle('badge-chance', res.card.type === "CƠ HỘI");
        badgeEl.classList.toggle('badge-fortune', res.card.type === "KHÍ VẬN");
      }
      document.getElementById('card-title').innerText = res.card.title;
      document.getElementById('card-text').innerText = res.card.text;
      cardModal.classList.remove('hidden');
    } else {
      updateTurnActionButton(false);
    }

    if (res.crossRouteChoice && (res.action === 'CHOOSE_CROSS_ROUTE' || res.crossRouteChoice.nextTurn)) {
      rollBtn.disabled = true;
      endTurnBtn.disabled = true;
      showCrossRouteChoice(res.crossRouteChoice, res.dice, res.startPos);
    }

    renderUI();
  });

  document.getElementById('trade-player-next-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    openTradeOfferModal();
  });
  document.getElementById('trade-player-cancel-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    tradePlayerModal.classList.add('hidden');
  });
  document.getElementById('trade-offer-cancel-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    tradeOfferModal.classList.add('hidden');
  });
  document.querySelector('.trade-detail-close-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeTradeDetailModal();
  });
  document.getElementById('trade-proceed-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    submitTradeRequest();
  });

  document.getElementById('buy-yes-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    // ONLINE: server xử lý
    if (window.GameOnline && window.GameOnline.isOnline && window.GameOnline.isOnline()) return;
    GameCore.buyPendingProperty();
    buyModal.classList.add('hidden');
    updateTurnActionButton(false);
    renderUI();
  });

  document.getElementById('buy-no-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    // ONLINE: server xử lý
    if (window.GameOnline && window.GameOnline.isOnline && window.GameOnline.isOnline()) return;
    GameCore.skipPendingProperty();
    buyModal.classList.add('hidden');
    updateTurnActionButton(false);
    renderUI();
  });

  document.getElementById('buy-auction-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    // ONLINE: server xử lý
    if (window.GameOnline && window.GameOnline.isOnline && window.GameOnline.isOnline()) {
      GameOnline.sendAction('AUCTION_PROPERTY');
      buyModal.classList.add('hidden');
      return;
    }
    // OFFLINE
    buyModal.classList.add('hidden');
    if (GameCore.auctionPendingProperty()) {
      openAuctionModal();
    }
    renderUI();
  });

  // Event listeners cho các nút bid trong đấu giá
  auctionAddBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.GameOnline && window.GameOnline.isOnline && window.GameOnline.isOnline()) {
        const a = GameCore.state.auctionState;
        if (!a || !a.active) return;
        const add = parseInt(btn.dataset.add, 10) || 10;
        GameOnline.sendAction('PLACE_BID', { amount: a.currentBid + add });
        return;
      }

      // OFFLINE - free-for-all: đặt giá cho người chơi đang được chọn
      const a = GameCore.state.auctionState;
      if (!a || !a.active) return;
      const add = parseInt(btn.dataset.add, 10) || 10;
      const amount = a.currentBid + add;

      if (selectedOfflineBidderIndex < 0 || !GameCore.state.players[selectedOfflineBidderIndex]) {
        alert('Vui lòng chọn một người chơi để đặt giá!');
        return;
      }

      const bidder = GameCore.state.players[selectedOfflineBidderIndex];
      if (bidder.money < amount) {
        alert(`${bidder.name} không đủ tiền ($${bidder.money}) để trả $${amount}!`);
        return;
      }

      if (GameCore.placeBid(selectedOfflineBidderIndex, amount)) {
        renderAuctionModal();
        renderUI();
      }
    });
  });

  // Nút Bỏ qua trong đấu giá (trong free-for-all: ẩn đi nhưng giữ listener phng trường hợp cần)
  const auctionPassBtnEl = document.getElementById('auction-pass-btn');
  if (auctionPassBtnEl) {
    auctionPassBtnEl.style.display = 'none'; // Ẩn trong chế độ free-for-all
    auctionPassBtnEl.addEventListener('click', (e) => {
      e.stopPropagation();
      // Trong free-for-all, nút này không dùng
    });
  }

  // Nút BỎ LƯỢT trong đấu giá
  document.getElementById('btn-build-house').addEventListener('click', (e) => {
    e.stopPropagation();
    // ONLINE: server xử lý
    if (window.GameOnline && window.GameOnline.isOnline && window.GameOnline.isOnline()) return;
    if (selectedTileIndex !== null && GameCore.buildHouse(selectedTileIndex)) {
      renderUI();
      openPropertyCard(selectedTileIndex);
    }
  });

  document.getElementById('btn-sell-house').addEventListener('click', (e) => {
    e.stopPropagation();
    // ONLINE: server xử lý
    if (window.GameOnline && window.GameOnline.isOnline && window.GameOnline.isOnline()) return;
    if (selectedTileIndex !== null && GameCore.sellHouse(selectedTileIndex)) {
      renderUI();
      openPropertyCard(selectedTileIndex);
    }
  });

  document.getElementById('btn-mortgage').addEventListener('click', (e) => {
    e.stopPropagation();
    // ONLINE: server xử lý
    if (window.GameOnline && window.GameOnline.isOnline && window.GameOnline.isOnline()) return;
    if (selectedTileIndex !== null && GameCore.mortgageProperty(selectedTileIndex)) {
      infoCardModal.classList.add('hidden');
      renderUI();
    }
  });

  function openSurrenderModal() {
    const isOnline = window.GameOnline && GameOnline.isOnline && GameOnline.isOnline();
    const playerIndex = isOnline ? GameOnline.myIndex : GameCore.state.currentPlayerIndex;
    const p = GameCore.state.players[playerIndex];
    if (!p || p.isBankrupt) return;

    if (surrenderConfirmDesc) {
      if (p.lastCreditorId) {
        const creditor = GameCore.state.players.find(x => x.id === p.lastCreditorId);
        surrenderConfirmDesc.innerText = `Bạn đang nợ ${creditor ? creditor.name : 'người chơi khác'}. Nếu đầu hàng, toàn bộ tiền mặt và ${GameCore.state.board.filter(t => t.owner === p.id).length} bất động sản của bạn sẽ được chuyển giao cho ${creditor ? creditor.name : 'chủ nợ'}!`;
      } else {
        surrenderConfirmDesc.innerText = `Bạn có chắc chắn muốn tuyên bố phá sản và đầu hàng không? Toàn bộ tài sản sẽ bị thu hồi về Ngân hàng!`;
      }
    }
    if (surrenderModal) surrenderModal.classList.remove('hidden');
  }

  if (surrenderBtn) {
    surrenderBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openSurrenderModal();
    });
  }

  if (debtSurrenderBtn) {
    debtSurrenderBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openSurrenderModal();
    });
  }

  if (surrenderNoBtn) {
    surrenderNoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (surrenderModal) surrenderModal.classList.add('hidden');
    });
  }

  if (surrenderYesBtn) {
    surrenderYesBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (surrenderModal) surrenderModal.classList.add('hidden');
      if (window.GameOnline && GameOnline.isOnline && GameOnline.isOnline()) {
        return; // online.js xử lý gửi socket lên server
      }
      const cur = GameCore.getCurrentPlayer();
      if (cur) {
        GameCore.surrender(cur.id);
        renderUI();
      }
    });
  }

  endTurnBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    // ONLINE: server xử lý
    if (window.GameOnline && window.GameOnline.isOnline && window.GameOnline.isOnline()) return;

    const curPlayer = GameCore.getCurrentPlayer();
    if (curPlayer && curPlayer.money < 0) {
      alert(`⚠️ Bạn đang nợ $${Math.abs(curPlayer.money)}! Hãy bán nhà, cầm cố đất hoặc giao dịch để trả nợ trước khi kết thúc lượt.`);
      return;
    }

    endTurnBtn.disabled = true;
    rollBtn.disabled = false;
    infoCardModal.classList.add('hidden');

    GameCore.endTurn();
    renderUI();
  });

  // =========================================================
  // EXPOSE UI API (cho online.js và các module khác dùng)
  // =========================================================
  window.GameUI = {
    buildBoard,
    buildPlayersUI,
    renderUI,
    openPropertyCard,
    openAuctionModal,
    renderAuctionModal,
    closeAuctionModal,
    handleAuctionEnd,
    moveTokenStepByStep,
    playDiceAnimation,
    renderDiceFace,
    showVictoryScreen,
    clearFireworks: () => {
      if (fireworksInterval) { clearInterval(fireworksInterval); fireworksInterval = null; }
      const fw = document.getElementById('victory-fireworks');
      if (fw) fw.innerHTML = '';
    },
    getCurrentPlayerIndex: () => GameCore.state.currentPlayerIndex,
    get playerTokens() { return playerTokens; },
    setPlayerTokens: (tokens) => { playerTokens = tokens; },
    get selectedTileIndex() { return selectedTileIndex; },
    setSelectedTileIndex: (i) => { selectedTileIndex = i; },
    get isAuctionActive() { return GameCore.isAuctionActive(); }
  };
});
>>>>>>> 814147eb7059fe1f3a8102216959befd1818b784
