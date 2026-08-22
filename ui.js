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
  let tradeTargetPlayerId = null;
  let auctionTimerInterval = null;

  const settingsOverlay = document.getElementById('settings-overlay');
  const playerMinus = document.getElementById('player-minus');
  const playerPlus = document.getElementById('player-plus');
  const playerCountVal = document.getElementById('player-count-val');
  const startGameBtn = document.getElementById('start-game-btn');

  let selectedTileIndex = null;
  let playerTokens = []; // Mảng quân cờ (tạo động theo số người chơi)

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
    bailBtn.innerText = '🔓 Nộp $50 ra tù';
    if (rollBtn && rollBtn.parentNode && rollBtn.parentNode.parentNode) {
      rollBtn.parentNode.parentNode.insertBefore(bailBtn, rollBtn.parentNode);
    }
  }

  function getGridPosition(index) {
    if (index >= 0 && index <= 10) return { row: 11, col: 11 - index, side: 'bottom' };
    if (index >= 11 && index <= 20) return { row: 11 - (index - 10), col: 1, side: 'left' };
    if (index >= 21 && index <= 30) return { row: 1, col: 1 + (index - 20), side: 'top' };
    if (index >= 31 && index <= 39) return { row: 1 + (index - 30), col: 11, side: 'right' };
  }

  function positionBuyPrompt(tileIndex) {
    if (!buyModal) return;
    if (tileIndex === undefined || tileIndex === null) {
      buyModal.style.top = '50%';
      buyModal.style.left = '50%';
      buyModal.style.bottom = 'auto';
      buyModal.style.right = 'auto';
      buyModal.style.transform = 'translate(-50%, -50%)';
      return;
    }

    // Reset styles
    buyModal.style.top = 'auto';
    buyModal.style.bottom = 'auto';
    buyModal.style.left = 'auto';
    buyModal.style.right = 'auto';
    buyModal.style.transform = 'none';

    // 1. Ô hàng DƯỚI (0 - 10): Đặt áp sát đáy center-panel, ngay trên ô đất
    if (tileIndex >= 0 && tileIndex <= 10) {
      buyModal.style.bottom = '4px';
      if (tileIndex === 0) {
        buyModal.style.right = '4px';
      } else if (tileIndex === 10) {
        buyModal.style.left = '4px';
      } else {
        const pct = Math.max(20, Math.min(80, ((10 - tileIndex - 0.5) / 9) * 100));
        buyModal.style.left = `${pct}%`;
        buyModal.style.transform = 'translateX(-50%)';
      }
    }
    // 2. Ô cột TRÁI (11 - 20): Đặt áp sát cạnh trái center-panel, ngay bên phải ô đất
    else if (tileIndex >= 11 && tileIndex <= 20) {
      buyModal.style.left = '4px';
      if (tileIndex === 20) {
        buyModal.style.top = '4px';
      } else {
        const pct = Math.max(20, Math.min(80, ((20 - tileIndex - 0.5) / 9) * 100));
        buyModal.style.top = `${pct}%`;
        buyModal.style.transform = 'translateY(-50%)';
      }
    }
    // 3. Ô hàng TRÊN (21 - 30): Đặt áp sát mép trên center-panel, ngay dưới ô đất
    else if (tileIndex >= 21 && tileIndex <= 30) {
      buyModal.style.top = '4px';
      if (tileIndex === 30) {
        buyModal.style.right = '4px';
      } else {
        const pct = Math.max(20, Math.min(80, ((tileIndex - 20 - 0.5) / 9) * 100));
        buyModal.style.left = `${pct}%`;
        buyModal.style.transform = 'translateX(-50%)';
      }
    }
    // 4. Ô cột PHẢI (31 - 39): Đặt áp sát cạnh phải center-panel, ngay bên trái ô đất
    else if (tileIndex >= 31 && tileIndex <= 39) {
      buyModal.style.right = '4px';
      const pct = Math.max(20, Math.min(80, ((tileIndex - 30 - 0.5) / 9) * 100));
      buyModal.style.top = `${pct}%`;
      buyModal.style.transform = 'translateY(-50%)';
    }
  }
  
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
      let rIcon = '🚆';
      if (index === 5) rIcon = '🚌';       // Bến xe Miền Tây
      else if (index === 15) rIcon = '🛫';  // Sân bay Tân Sơn Nhất
      else if (index === 25) rIcon = '🚎';  // Bến xe Miền Đông
      else if (index === 35) rIcon = '🚇';  // Metro Bến Thành
      return { icon: rIcon, className: 'tile-icon tile-special-icon' };
    }

    if (tile.type === "UTILITY") {
      const uIcon = (index === 12) ? '⚡' : '💧'; // EVN hoặc SAWACO
      return { icon: uIcon, className: 'tile-icon tile-special-icon' };
    }

    if (tile.type === "TAX" || index === 4 || index === 38) {
      const tIcon = (index === 4) ? '🍂' : '💎'; // Thuế Môi Trường / Thuế Hàng Hiệu
      return { icon: tIcon, className: 'tile-icon tile-special-icon' };
    }

    if (tile.type === "CHANCE" || (tile.name && tile.name.includes("Cơ hội"))) {
      return { icon: '❓', className: 'tile-icon tile-special-icon' };
    }

    if (tile.type === "CHEST" || (tile.name && tile.name.includes("Khí vận"))) {
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
    return { icon: propIcon, className: 'tile-icon tile-property-icon' };
  }

  // =========================================================
  // DỰNG BÀN CỜ (gọi 1 lần duy nhất sau khi có state)
  // =========================================================
  function buildBoard() {
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
      }

      tileDiv.addEventListener('click', (e) => {
        e.stopPropagation();
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
    players.forEach((p, i) => {
      const card = document.createElement('div');
      card.className = 'player-card';
      card.id = `card-p${p.id}`;

      const emoji = p.tokenEmoji || (GameCore.animalTokens[i % GameCore.animalTokens.length] ? GameCore.animalTokens[i % GameCore.animalTokens.length].emoji : '🐊');
      const badge = document.createElement('span');
      badge.className = 'player-badge';
      badge.style.borderColor = p.color;
      badge.innerText = emoji;

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

    // Cập nhật tiền & trạng thái tù cho từng người chơi
    players.forEach((p, i) => {
      const moneyEl = document.getElementById(`p${p.id}-money`);
      if (moneyEl) {
        if (p.disconnected) {
          const remaining = p.disconnectExpiresAt ? Math.max(0, Math.ceil((p.disconnectExpiresAt - Date.now()) / 1000)) : 120;
          moneyEl.innerHTML = `<span class="disconnect-warn-text">🔌 Mất kết nối (${remaining}s)</span>`;
        } else {
          moneyEl.innerText = p.isBankrupt ? "💀 Phá sản" : (p.money + (p.inJail ? " 🔒" : ""));
        }
      }
      const cardEl = document.getElementById(`card-p${p.id}`);
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
        if (p.hasShield) {
          const s = document.createElement('span');
          s.className = 'buff-badge buff-shield';
          s.title = 'Có Khiên bảo vệ: Miễn 1 lần trả tiền thuê/thuế';
          s.innerText = '🛡️ Khiên';
          buffContainer.appendChild(s);
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
      }
    });

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
    if (currentPlayer.inJail && currentPlayer.money >= 50 && !rollBtn.disabled) {
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

    // Hiện/ẩn nút Đấu Giá trong buy-popover dựa vào auctionMode
    const buyAuctionBtn = document.getElementById('buy-auction-btn');
    if (buyAuctionBtn) {
      if (GameCore.settings && GameCore.settings.auctionMode) {
        buyAuctionBtn.classList.remove('hidden');
      } else {
        buyAuctionBtn.classList.add('hidden');
      }
    }
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
    if (!requests.length) {
      requestsBox.innerHTML = '<div class="trade-empty">Chưa có đề nghị trao đổi nào.</div>';
      return;
    }
    const playerName = id => GameCore.state.players.find(player => player.id === id)?.name || 'Người chơi';
    const propertyNames = ids => ids.map(id => GameCore.state.board.find(tile => tile.id === id)?.name).filter(Boolean).join(', ');
    requests.forEach(request => {
      const item = document.createElement('div'); item.className = 'trade-request';
      const title = document.createElement('div'); title.className = 'trade-request-title';
      title.innerText = `${playerName(request.fromPlayerId)} ➔ ${playerName(request.toPlayerId)}`;
      const detail = document.createElement('div'); detail.className = 'trade-request-detail';
      const offered = [request.offerCash ? `$${request.offerCash}` : '', propertyNames(request.offerPropertyIds)].filter(Boolean).join(' + ') || 'Không có';
      const wanted = [request.requestCash ? `$${request.requestCash}` : '', propertyNames(request.requestPropertyIds)].filter(Boolean).join(' + ') || 'Không có';
      detail.innerText = `Đưa: ${offered} | Nhận: ${wanted}`;
      item.append(title, detail);

      const canAct = online ? (request.toPlayerId === me.id || request.fromPlayerId === me.id) : true;
      if (canAct) {
        const actions = document.createElement('div'); actions.className = 'trade-actions';
        if (request.toPlayerId === me.id || !online) {
          const accept = document.createElement('button'); accept.className = 'trade-action'; accept.innerText = 'Chấp nhận';
          accept.addEventListener('click', () => {
            if (online) {
              GameOnline.sendAction('ACCEPT_TRADE', { requestId: request.id });
            } else {
              GameCore.acceptTrade(request.toPlayerId, request.id);
              renderUI();
            }
          });
          actions.appendChild(accept);
        }
        if (request.toPlayerId === me.id || request.fromPlayerId === me.id || !online) {
          const decline = document.createElement('button'); decline.className = 'trade-action decline';
          decline.innerText = (request.fromPlayerId === me.id && online) ? 'Hủy' : 'Từ chối';
          decline.addEventListener('click', () => {
            if (online) {
              GameOnline.sendAction('DECLINE_TRADE', { requestId: request.id });
            } else {
              GameCore.declineTrade(me.id, request.id);
              renderUI();
            }
          });
          actions.appendChild(decline);
        }
        item.appendChild(actions);
      }
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
    document.getElementById('trade-offer-title').innerText = `🤝 Trao đổi với ${target.name}`;
    document.getElementById('trade-modal-offer-cash').value = '0';
    document.getElementById('trade-modal-request-cash').value = '0';
    addTradePropertyOptions(document.getElementById('trade-modal-offer-properties'), GameCore.state.board.filter(tile => tile.owner === me.id));
    addTradePropertyOptions(document.getElementById('trade-modal-request-properties'), GameCore.state.board.filter(tile => tile.owner === target.id));
    tradePlayerModal.classList.add('hidden');
    tradeOfferModal.classList.remove('hidden');
  }

  function submitTradeRequest() {
    const { online, me, target } = getTradeParticipants();
    if (!target || !me) return;
    const ids = selector => [...document.querySelectorAll(`${selector} input:checked`)].map(input => Number(input.value));
    const offerCash = Math.max(0, Number(document.getElementById('trade-modal-offer-cash').value) || 0);
    const requestCash = Math.max(0, Number(document.getElementById('trade-modal-request-cash').value) || 0);
    const offerPropertyIds = ids('#trade-modal-offer-properties');
    const requestPropertyIds = ids('#trade-modal-request-properties');
    if (!offerCash && !requestCash && !offerPropertyIds.length && !requestPropertyIds.length) {
      alert('Hãy chọn tiền hoặc tài sản để trao đổi.');
      return;
    }
    if (me.money < offerCash) {
      alert(`Bạn chỉ có $${me.money}, không đủ $${offerCash} để đưa.`);
      return;
    }
    if (online) {
      GameOnline.sendAction('CREATE_TRADE', { trade: {
        toPlayerId: target.id, offerCash, requestCash, offerPropertyIds, requestPropertyIds
      }});
    } else {
      GameCore.createTrade(me.id, {
        toPlayerId: target.id, offerCash, requestCash, offerPropertyIds, requestPropertyIds
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

    inventoryBox.innerHTML = '';
    if (!properties.length) {
      const empty = document.createElement('div');
      empty.className = 'inventory-empty';
      empty.innerHTML = '<span>🎒 Chưa sở hữu tài sản nào.</span>';
      inventoryBox.appendChild(empty);
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
          <span class="inventory-group-tag" style="background:${color}22; color:${color}; border: 1px solid ${color}66;">
            ${groupNames[tile.group] || tile.group || tile.type}
          </span>
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

      const canBuild = (tile.type === "PROPERTY");

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

        if (!canBuild) {
          btnMortgage.style.display = '';
        } else if (houses >= 5) {
          btnBuild.disabled = true;
          btnBuild.innerText = `🏨 Đã tối đa`;
          btnBuild.title = `Bất động sản đã đạt cấp Khách sạn tối đa`;
        } else if (!isMyTurn) {
          btnBuild.disabled = true;
          btnBuild.innerText = houses === 4 ? `🏨 Chưa đến lượt ($${houseCost})` : `🏠 Chưa đến lượt ($${houseCost})`;
          btnBuild.title = `Chưa đến lượt của bạn`;
        } else if (localPlayer.hasBuiltHouseThisTurn) {
          btnBuild.disabled = true;
          btnBuild.innerText = `⏳ Đã mua nhà lượt này`;
          btnBuild.title = `Mỗi lượt chỉ được mua nhà 1 lần trên toàn bộ bất động sản`;
        } else if (tile.lastBuiltPlayerTurn && ((localPlayer.turnCount || 1) - tile.lastBuiltPlayerTurn < 2)) {
          btnBuild.disabled = true;
          btnBuild.innerText = `⏳ Cần cách 1 lượt`;
          btnBuild.title = `Ô đất này cần cách 1 lượt của bạn mới được nâng cấp tiếp`;
        } else if (localPlayer.money < houseCost) {
          btnBuild.disabled = true;
          btnBuild.innerText = houses === 4 ? `🏨 Thiếu tiền ($${houseCost})` : `🏠 Thiếu tiền ($${houseCost})`;
          btnBuild.title = `Bạn không đủ tiền để nâng cấp`;
        } else {
          btnBuild.disabled = false;
          btnBuild.innerText = houses === 4 ? `🏨 Nâng cấp Khách sạn ($${houseCost})` : `🏠 Xây nhà ($${houseCost})`;
          btnBuild.title = `Nâng cấp bất động sản`;
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
    infoCardModal.classList.remove('hidden');

    const tileElem = document.getElementById(`tile-${index}`);
    const centerPanel = document.getElementById('center-panel');
    const centerRect = centerPanel.getBoundingClientRect();
    const cardRect = infoCardModal.getBoundingClientRect();

    infoCardModal.style.top = 'auto';
    infoCardModal.style.bottom = 'auto';
    infoCardModal.style.left = 'auto';
    infoCardModal.style.right = 'auto';

    if (window.innerWidth <= 900) {
      infoCardModal.style.position = 'fixed';
      infoCardModal.style.left = '50%';
      infoCardModal.style.top = '50%';
      infoCardModal.style.transform = 'translate(-50%, -50%)';
      infoCardModal.style.zIndex = '1000';
    } else {
      infoCardModal.style.position = 'absolute';
      infoCardModal.style.transform = 'none';
      infoCardModal.style.zIndex = '50';

      if (tileElem) {
        const tRect = tileElem.getBoundingClientRect();
        const gap = 8;
        const cardW = cardRect.width || 190;
        const cardH = cardRect.height || 200;

        if (pos.side === 'bottom') {
          infoCardModal.style.left = `${tRect.left - centerRect.left}px`;
          infoCardModal.style.top = `${tRect.top - centerRect.top - cardH - gap}px`;
        } else if (pos.side === 'top') {
          infoCardModal.style.left = `${tRect.left - centerRect.left}px`;
          infoCardModal.style.top = `${tRect.bottom - centerRect.top + gap}px`;
        } else if (pos.side === 'left') {
          infoCardModal.style.left = `${tRect.right - centerRect.left + gap}px`;
          infoCardModal.style.top = `${tRect.top - centerRect.top}px`;
        } else if (pos.side === 'right') {
          infoCardModal.style.left = `${tRect.left - centerRect.left - cardW - gap}px`;
          infoCardModal.style.top = `${tRect.top - centerRect.top}px`;
        }

        const boardRect = boardElement.getBoundingClientRect();
        const cardBox = infoCardModal.getBoundingClientRect();

        let curTop = parseInt(infoCardModal.style.top, 10) || 0;
        let curLeft = parseInt(infoCardModal.style.left, 10) || 0;

        const overBottom = cardBox.bottom - boardRect.bottom;
        if (overBottom > 0) curTop -= (overBottom + 8);
        const overRight = cardBox.right - boardRect.right;
        if (overRight > 0) curLeft -= (overRight + 8);
        const overTop = boardRect.top - cardBox.top;
        if (overTop > 0) curTop += (overTop + 8);
        const overLeft = boardRect.left - cardBox.left;
        if (overLeft > 0) curLeft += (overLeft + 8);

        infoCardModal.style.left = `${Math.max(0, curLeft)}px`;
        infoCardModal.style.top = `${Math.max(0, curTop)}px`;
      }
    }

    infoCardModal.classList.remove('hidden');
  }

  // =========================================================
  // HOẠT ẢNH DI CHUYỂN QUÂN CỜ
  // =========================================================
async function moveTokenStepByStep(tokenElem, startPos, steps) {
    tokenElem.classList.add('moving');
    let currentPos = startPos;
    for (let i = 0; i < steps; i++) {
      currentPos = (currentPos + 1) % 40;
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
function openAuctionModal() {
    if (!auctionModal) return;
    const a = GameCore.state.auctionState;
    const tile = GameCore.state.auctionTile;
    if (!a || !tile) return;

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
    // Màu thay đổi: xanh → vàng → đỏ khi sắc cạn
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
    const highest = a.highestBidder ? a.highestBidder.name : 'Chưa có';

    document.getElementById('auction-current-bid').innerHTML = `💰 Giá hiện tại: <b>$${a.currentBid}</b>`;
    document.getElementById('auction-current-bidder').innerHTML = `👤 Người trả giá cao nhất: <b>${highest}</b>`;
    // Trong free-for-all, không có "đến lượt" cụ thể
    document.getElementById('auction-turn').innerHTML = `⏳ Thời gian: <b>ai đặt giá cao nhất sau 5s sẽ thắng!</b>`;

    const online = window.GameOnline && GameOnline.isOnline && GameOnline.isOnline();
    const localPlayerIndex = online ? GameOnline.myIndex : GameCore.state.currentPlayerIndex;
    const localPlayer = GameCore.state.players[localPlayerIndex];

    const statusMsgEl = document.getElementById('auction-status-msg');
    if (statusMsgEl) {
      if (localPlayer && a.excludedPlayerId === localPlayer.id) {
        statusMsgEl.innerText = '⚠️ Bạn đã bỏ qua mua ô này nên không thể tham gia đấu giá.';
        statusMsgEl.style.display = 'block';
      } else if (localPlayer && a.eligibleIds && !a.eligibleIds.includes(localPlayer.id)) {
        statusMsgEl.innerText = '⏭️ Bạn không đủ điều kiện tham gia đấu giá này.';
        statusMsgEl.style.display = 'block';
      } else {
        statusMsgEl.innerText = '';
        statusMsgEl.style.display = 'none';
      }
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

    // Free-for-all: bật nút bid cho bất kỳ người đủ điều kiện (không theo lượt)
    // Free-for-all: bật nút bid nếu có ít nhất một người đủ tiền để đặt giá
    const anyEligible = a.eligibleIds && a.eligibleIds.some(id => {
      const pl = GameCore.state.players.find(p => p.id === id);
      return pl && pl.money > a.currentBid;
    });
    const canBid = !!anyEligible;
    auctionAddBtns.forEach(button => {
      button.disabled = !canBid;
      // Hiển thị giá bid thực tế sử lên
      const add = parseInt(button.dataset.add, 10) || 0;
      button.textContent = `+${add} ($${a.currentBid + add})`;
    });
    const passBtn = document.getElementById('auction-pass-btn');
    if (passBtn) {
      // Nút bỏ qua được ẩn trong free-for-all (không có lượt)
      passBtn.style.display = 'none';
    }
  }

  function closeAuctionModal() {
    stopAuctionTimer();
    if (auctionModal) auctionModal.classList.add('hidden');
    endTurnBtn.disabled = false;
    rollBtn.disabled = false;
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

    const config = {
      playerCount: chosenPlayerCount,
      initialMoney: parseInt(document.getElementById('set-initial-money').value, 10) || 1500,
      passGoMoney: parseInt(document.getElementById('set-pass-go').value, 10) || 200,
      doubleRentOnFullGroup: document.getElementById('set-double-rent').checked,
      mortgageInsteadOfSell: document.getElementById('set-mortgage').checked,
      jackpotOnFreeParking: document.getElementById('set-jackpot').checked,
      receiveRentWhileJailed: document.getElementById('set-rent-jailed').checked,
      auctionMode: document.getElementById('set-auction').checked,
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
    </ul>`;

    renderUI();
  });

  // =========================================================
  // EVENT LISTENERS TRÒ CHƠI
  // =========================================================
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
        endTurnBtn.disabled = false;
      }
      renderUI();
    });
  }

// Gieo xúc xắc
  rollBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    // ONLINE: server là nguồn sự thật -> không chạy logic cục bộ (online.js gửi hành động)
    if (window.GameOnline && window.GameOnline.isOnline && window.GameOnline.isOnline()) return;
    rollBtn.disabled = true;
    endTurnBtn.disabled = true;

    const res = GameCore.rollDice();
    await playDiceAnimation(GameCore.state.lastRoll, GameCore.state.lastDice);

    const playerIndex = GameCore.state.currentPlayerIndex;
    const tokenElem = playerTokens[playerIndex];

    if (res.dice > 0 && res.action !== "STAY_IN_JAIL") {
      await moveTokenStepByStep(tokenElem, res.startPos, res.dice);
      if (res.action === "GO_TO_JAIL") {
        await new Promise(resolve => setTimeout(resolve, 200));
        const jailTile = document.getElementById('tile-10');
        if (jailTile && tokenElem) jailTile.appendChild(tokenElem);
      }
    }

    if (res.action === "PROMPT_BUY") {
      document.getElementById('modal-tile-name').innerText = res.tile.name;
      const effectivePrice = res.effectivePrice !== undefined ? res.effectivePrice : res.tile.price;
      document.getElementById('modal-tile-price').innerText = res.discount ? `Giá ưu đãi (50%): $${effectivePrice} (Gốc: $${res.tile.price})` : `Giá: $${res.tile.price}`;
      positionBuyPrompt(res.startPos + res.dice > 39 ? (res.startPos + res.dice) % 40 : res.startPos + res.dice);
      buyModal.classList.remove('hidden');
    } else if (res.action === "AUCTION") {
      // Đã bắt đầu đấu giá trong gameCore (không đủ tiền mua) -> mở modal đấu giá
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
      endTurnBtn.disabled = false;
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
    endTurnBtn.disabled = false;
    renderUI();
  });

document.getElementById('buy-no-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    // ONLINE: server xử lý
    if (window.GameOnline && window.GameOnline.isOnline && window.GameOnline.isOnline()) return;
    // Lưu lại ô đất TRƯỚC khi skip (vì skipPendingProperty sẽ xoá pendingTile)
    const skippedTile = GameCore.state.pendingTile;
    GameCore.skipPendingProperty();
    buyModal.classList.add('hidden');
    // Nếu bật chế độ đấu giá và ô đất vẫn chưa có chủ -> tiến hành đấu giá
    if (GameCore.settings.auctionMode && skippedTile && (skippedTile.owner === null || skippedTile.owner === undefined)) {
      GameCore.startAuction(skippedTile, GameCore.getCurrentPlayer().id);
      openAuctionModal();
      return;
    }
endTurnBtn.disabled = false;
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

  // Event listeners cho các nút bid trong đấu giá (free-for-all: bất kỳ ai cũng có thể bid)
  auctionAddBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.GameOnline && window.GameOnline.isOnline && window.GameOnline.isOnline()) {
        // ONLINE: gửi đến server
        const a = GameCore.state.auctionState;
        if (!a || !a.active) return;
        const add = parseInt(btn.dataset.add, 10) || 10;
        GameOnline.sendAction('PLACE_BID', { amount: a.currentBid + add });
        return;
      }
      // OFFLINE - free-for-all: tìm người chơi nào đang muốn bid
      const a = GameCore.state.auctionState;
      if (!a || !a.active) return;
      const add = parseInt(btn.dataset.add, 10) || 10;
      const amount = a.currentBid + add;

      // Trong offline (pass-and-play), tìm người eligible đủ tiền
      const eligiblePlayers = GameCore.state.players.filter(p =>
        !p.isBankrupt && a.eligibleIds && a.eligibleIds.includes(p.id) && p.money >= amount
      );
      if (!eligiblePlayers.length) {
        alert(`Không có người chơi nào đủ tiền để trả $${amount}!`);
        return;
      }

      let bidderIndex;
      if (eligiblePlayers.length === 1) {
        // Chỉ có 1 người đủ điều kiện → tự động chọn
        bidderIndex = GameCore.state.players.findIndex(p => p.id === eligiblePlayers[0].id);
      } else {
        // Nhiều người → hỏi ai muốn bid
        const names = eligiblePlayers.map((p, i) => `${i + 1}. ${p.tokenEmoji || ''} ${p.name} ($${p.money})`).join('\n');
        const choice = prompt(`Ai muốn trả giá $${amount}?\n${names}\n\nNhập số thứ tự (1-${eligiblePlayers.length}):`);
        const choiceNum = parseInt(choice, 10);
        if (!choiceNum || choiceNum < 1 || choiceNum > eligiblePlayers.length) return;
        bidderIndex = GameCore.state.players.findIndex(p => p.id === eligiblePlayers[choiceNum - 1].id);
      }

      if (GameCore.placeBid(bidderIndex, amount)) {
        renderAuctionModal();
        renderUI();
      } else {
        alert('Không thể đặt giá! Hãy kiểm tra lại.');
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
