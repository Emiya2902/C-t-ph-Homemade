/**
 * ONLINE MODE - Đồng bộ trạng thái từ server và gửi hành động
 *
 * Khi chơi online, server là nguồn sự thật (authoritative). Client:
 *  - Nhận 'game:state' từ server -> cập nhật GameCore.state -> render UI
 *  - Gửi các hành động ('game:action') lên server khi người chơi thao tác
 */
(function () {
  'use strict';

  let mode = 'lobby'; // 'lobby' | 'offline' | 'online'
  let myIndex = 0;    // Index của người chơi này trong trận
  let isSpectator = false; // Có phải là khán giả đang xem không
  let roomCode = null;
  let socket = null;
  let gameStarted = false;
  let myTurnRolled = false;          // Đã gieo xúc xắc trong lượt của mình chưa
  let lastCurrentPlayerIndex = -1;   // Theo dõi lượt hiện tại để reset trạng thái

  function $(id) { return document.getElementById(id); }

  function setMode(m) {
    mode = m;
    window.GameMode = m;
    const chatInput = $('chat-input');
    const chatSendBtn = $('chat-send-btn');
    const enabled = m === 'online';
    if (chatInput) chatInput.disabled = !enabled;
    if (chatSendBtn) chatSendBtn.disabled = !enabled;
  }

  function isOnline() { return mode === 'online'; }

  function getSocket() {
    if (socket) return socket;
    if (window.LobbySocket) { socket = window.LobbySocket; return socket; }
    if (window.Lobby) return window.Lobby.socket;
    return null;
  }

  // Gửi một hành động lên server
  function sendAction(type, payload) {
    if (isSpectator) return; // Khán giả không được gửi hành động game
    const s = getSocket();
    if (!s || !roomCode) return;
    s.emit('game:action', {
      code: roomCode,
      action: Object.assign({ type }, payload || {})
    }, (res) => {
      if (res && res.ok === false && res.error) {
        console.warn('Hành động bị từ chối:', res.error);
      }
      if (res?.ok && res.result?.action === 'CHOOSE_CROSS_ROUTE') {
        document.dispatchEvent(new CustomEvent('game:cross-route-choice', { detail: res.result }));
      }
      if (res?.ok && res.result?.action === 'OPEN_SHOP' && window.GameCore?.Shop) {
        const player = GameCore.state.players[myIndex];
        if (player) GameCore.Shop.openShop(player);
      }
    });
  }

  // =========================================================
  // ĐỒNG BỘ TRẠNG THÁI TỪ SERVER
  // =========================================================
  function syncState(serverState) {
    if (!GameCore || !GameCore.state) return;

    // Đồng bộ board (bản sao sâu)
    GameCore.state.board = JSON.parse(JSON.stringify(serverState.board || []));

    // Đồng bộ players
    GameCore.state.players = JSON.parse(JSON.stringify(serverState.players || []));

    GameCore.state.currentPlayerIndex = serverState.currentPlayerIndex || 0;
    GameCore.state.logs = (serverState.logs || []).slice();
    GameCore.state.lastRoll = serverState.lastRoll || 0;
    GameCore.state.lastDice = serverState.lastDice || [
      Math.max(1, Math.min(6, Math.floor((serverState.lastRoll || 2) / 2))),
      Math.max(1, Math.min(6, (serverState.lastRoll || 2) - Math.floor((serverState.lastRoll || 2) / 2)))
    ];
    GameCore.state.extraRollPending = !!serverState.extraRollPending;
    GameCore.state.lastMovementPath = Array.isArray(serverState.lastMovementPath)
      ? serverState.lastMovementPath.slice()
      : [];

    // pendingCard (thẻ cơ hội/khí vận)
    GameCore.state.pendingCard = serverState.pendingCard || null;

    // pendingTile (ô đang chờ mua) - sync id
    const pendingTileId = serverState.pendingTile;
    GameCore.state.pendingTile = pendingTileId != null
      ? GameCore.state.board.find(t => t.id === pendingTileId) || null
      : null;

    // auction
    const auctionTileId = serverState.auctionTile;
    GameCore.state.auctionTile = auctionTileId != null
      ? GameCore.state.board.find(t => t.id === auctionTileId) || null
      : null;
    GameCore.state.auctionState = serverState.auctionState || null;
    GameCore.state.tradeRequests = serverState.tradeRequests || [];

    // Thêm timer nếu đấu giá đang hoạt động
    if (GameCore.state.auctionState && GameCore.state.auctionState.active) {
      if (!GameCore.state.auctionState.timerEnd) {
        GameCore.state.auctionState.timerEnd = Date.now() + 5000;
      }
    }

    GameCore.state.gameOver = serverState.gameOver || false;
    GameCore.state.winner = serverState.winner || null;

    // Đồng bộ settings (luật chơi) từ server
    if (serverState.settings) {
      GameCore.state.settings = serverState.settings;
      GameCore.settings = Object.assign({}, GameCore.settings, serverState.settings);
    }
  }

  // =========================================================
  // RENDER GIAO DIỆN TỪ TRẠNG THÁI ĐÃ ĐỒNG BỘ
  // =========================================================
  function renderFromServer() {
    if (!window.GameUI) return;
    window.GameUI.renderUI();
    updateControls();
  }

  // Cập nhật nút bấm theo lượt / trạng thái
  function updateControls() {
    const rollBtn = $('roll-btn');
    const endTurnBtn = $('end-turn-btn');
    const bailBtn = $('bail-btn');
    const surrenderBtn = $('surrender-btn');
    const specBanner = $('spectator-banner');

    // Hiển thị banner Spectator nếu là khán giả
    if (specBanner) {
      specBanner.classList.toggle('hidden', !isSpectator);
    }

    // Nếu là khán giả -> Khóa hoàn toàn mọi nút tương tác bàn cờ
    if (isSpectator) {
      if (rollBtn) rollBtn.disabled = true;
      if (endTurnBtn) endTurnBtn.disabled = true;
      if (bailBtn) bailBtn.style.display = 'none';
      if (surrenderBtn) surrenderBtn.disabled = true;
      return;
    }

    if (!rollBtn || !endTurnBtn) return;
    endTurnBtn.style.display = 'none';
    if (surrenderBtn) surrenderBtn.disabled = false;

    const state = GameCore.state;
    const isMyTurn = state.currentPlayerIndex === myIndex;
    const auctionActive = !!(state.auctionState && state.auctionState.active);

    // Khi lượt thay đổi -> reset cờ "đã gieo"
    if (lastCurrentPlayerIndex !== state.currentPlayerIndex) {
      lastCurrentPlayerIndex = state.currentPlayerIndex;
      myTurnRolled = false;
    }

    // Đang đấu giá: khoá các nút lượt và mở/cập nhật modal đấu giá
    if (auctionActive) {
      rollBtn.disabled = true;
      endTurnBtn.disabled = true;
      if (window.GameUI && GameUI.openAuctionModal) {
        GameUI.openAuctionModal();
      }
      return;
    } else {
      const auctionModal = $('auction-modal');
      if (auctionModal && !auctionModal.classList.contains('hidden')) {
        if (window.GameUI && GameUI.closeAuctionModal) {
          GameUI.closeAuctionModal();
        }
      }
    }

    // Cảnh báo nợ nần khi âm tiền
    const debtAlertBanner = $('debt-alert-banner');
    const debtAlertText = $('debt-alert-text');
    const me = state.players[myIndex];

    if (debtAlertBanner) {
      if (me && !me.isBankrupt && me.money < 0) {
        debtAlertBanner.classList.remove('hidden');
        if (debtAlertText) {
          const debtAmount = Math.abs(me.money);
          if (me.lastCreditorId) {
            const creditor = state.players.find(p => p.id === me.lastCreditorId);
            debtAlertText.innerText = `Đang nợ ${creditor ? creditor.name : 'người chơi khác'} $${debtAmount}! Hãy bán nhà, cầm cố đất hoặc giao dịch để trả nợ trước khi kết thúc lượt.`;
          } else {
            debtAlertText.innerText = `Đang nợ Ngân hàng $${debtAmount}! Hãy bán nhà, cầm cố đất hoặc giao dịch để trả nợ trước khi kết thúc lượt.`;
          }
        }
      } else {
        debtAlertBanner.classList.add('hidden');
      }
    }

    // Nếu chưa phải lượt của mình -> khoá
    if (!isMyTurn) {
      rollBtn.disabled = true;
      endTurnBtn.disabled = true;
      if (bailBtn) bailBtn.style.display = 'none';
      return;
    }

    // Nếu đang chờ mua đất / thẻ / nộp bảo lãnh -> khoá cả 2 nút lượt
    const hasPending = !!(state.pendingTile || state.pendingCard);
    if (hasPending) {
      rollBtn.disabled = true;
      endTurnBtn.disabled = true;
      return;
    }

    // Lượt của mình, chưa gieo -> chỉ cho Gieo xúc xắc
    if (!myTurnRolled) {
      rollBtn.innerText = 'GIEO XÚC XẮC';
      rollBtn.dataset.action = 'roll';
      rollBtn.disabled = false;
      endTurnBtn.disabled = true;
      return;
    }

    // Đã gieo xúc xắc -> kiểm tra nợ trước khi cho Kết thúc lượt
    rollBtn.innerText = state.extraRollPending ? 'GIEO XÚC XẮC' : 'KẾT THÚC LƯỢT';
    rollBtn.dataset.action = state.extraRollPending ? 'roll' : 'end-turn';
    rollBtn.disabled = false;
    if (me && me.money < 0 && !state.extraRollPending) {
      rollBtn.disabled = true; // Chặn kết thúc lượt khi đang nợ!
    }
  }

  // Đánh dấu đã gieo xúc xắc trong lượt (gọi khi ROLL_DICE thành công)
  function markRolled() {
    const state = GameCore.state;
    if (state.currentPlayerIndex === myIndex) {
      myTurnRolled = true;
    }
  }

  // Render bảng "Luật Chơi Phòng" bên phải từ settings của server
  function renderRules(settings) {
    const rulesList = $('rules-list');
    if (!rulesList || !settings) return;
    rulesList.innerHTML = `<ul>
      <li>• Tiền khởi tạo: <b>$${settings.initialMoney}</b></li>
      <li>• Lương qua ô Start: <b>$${settings.passGoMoney}</b></li>
      <li>• Nhân đôi thuê khi trọn nhóm: <b>${settings.doubleRentOnFullGroup ? 'Bật' : 'Tắt'}</b></li>
      <li>• Cầm cố thay vì bán: <b>${settings.mortgageInsteadOfSell ? 'Bật' : 'Tắt'}</b></li>
      <li>• Jackpot Bãi xe: <b>${settings.jackpotOnFreeParking ? 'Bật' : 'Tắt'}</b></li>
      <li>• Nhận thuê khi ở tù: <b>${settings.receiveRentWhileJailed ? 'Bật' : 'Tắt'}</b></li>
      <li>• Chế độ đấu giá: <b>${settings.auctionMode ? 'Bật' : 'Tắt'}</b></li>
      <li>• Trọn bộ màu nâng nhà tự do: <b>${settings.freeBuildOnFullGroup ? 'Bật' : 'Tắt'}</b></li>
    </ul>`;
  }

  // Chủ phòng bắt đầu trò chơi với các luật đã chọn
  function hostStartGame(settings) {
    const s = getSocket();
    if (!s || !roomCode) return;
    s.emit('game:start', { code: roomCode, settings: settings || {} }, (res) => {
      const errEl = $('lobby-error');
      if (!res || !res.ok) {
        if (errEl) {
          errEl.innerText = (res && res.error) || 'Không thể bắt đầu trò chơi.';
          errEl.classList.remove('hidden');
        }
      }
    });
  }

  // =========================================================
  // XỬ LÝ SỰ KIỆN TỪ SERVER
  // =========================================================
  let isStateProcessing = false;
  const stateQueue = [];

  async function onGameState(data) {
    if (!data || !data.state) return;
    if (isStateProcessing) {
      stateQueue.push(data);
      return;
    }
    isStateProcessing = true;
    try {
      await processGameState(data);
    } finally {
      isStateProcessing = false;
      if (stateQueue.length > 0) {
        const nextData = stateQueue.shift();
        onGameState(nextData);
      }
    }
  }

  async function processGameState(data) {
    const previousPositions = (GameCore.state.players || []).map(player => player.position);
    const wasStarted = gameStarted;

    // Đảm bảo ẩn các pop-up hành động trong khi quân cờ đang chạy
    const buyModalEl = $('buy-modal');
    const cardModalEl = $('card-modal');
    if (buyModalEl) buyModalEl.classList.add('hidden');
    if (cardModalEl) cardModalEl.classList.add('hidden');

    syncState(data.state);

    // Cập nhật tên/màu người chơi (từ server)
    if (data.playersMeta && GameCore.state.players) {
      data.playersMeta.forEach((meta, i) => {
        if (GameCore.state.players[i]) {
          GameCore.state.players[i].name = meta.name;
          GameCore.state.players[i].color = meta.color;
        }
      });
    }

    // Lần đầu nhận state -> dựng bàn cờ
    if (!gameStarted) {
      gameStarted = true;
      if (window.GameUI) {
        GameUI.buildBoard();
        GameUI.buildPlayersUI();
      }
      // Ẩn overlay
      const waiting = $('room-waiting-overlay');
      const lobby = $('lobby-overlay');
      const settings = $('settings-overlay');
      if (waiting) waiting.classList.add('hidden');
      if (lobby) lobby.classList.add('hidden');
      if (settings) settings.classList.add('hidden');
    }

    // Hoạt ảnh xúc xắc và di chuyển từng bước của quân cờ
    if (wasStarted && window.GameUI && GameCore.state.players) {
      const movedIndex = GameCore.state.players.findIndex((player, index) =>
        previousPositions[index] !== undefined && player.position !== previousPositions[index]
      );
      if (movedIndex >= 0 && GameUI.playerTokens && GameUI.playerTokens[movedIndex]) {
        const startPos = previousPositions[movedIndex];
        const endPos = GameCore.state.players[movedIndex].position;
        const serverPath = Array.isArray(data.state.lastMovementPath) ? data.state.lastMovementPath : [];
        const steps = serverPath.length || (endPos - startPos + 40) % 40;
        if (steps > 0 && steps <= 12) {
          await GameUI.playDiceAnimation(GameCore.state.lastRoll, data.state.lastDice || GameCore.state.lastDice);
          await GameUI.moveTokenStepByStep(GameUI.playerTokens[movedIndex], startPos, steps, serverPath);
          if (endPos === 10 && GameCore.state.players[movedIndex].inJail) {
            await new Promise(resolve => setTimeout(resolve, 200));
            const jailTile = document.getElementById('tile-10');
            if (jailTile && GameUI.playerTokens[movedIndex]) {
              jailTile.appendChild(GameUI.playerTokens[movedIndex]);
            }
          }
        }
      }
    }

    renderFromServer();

    // Render bảng luật chơi phòng từ settings của server
    if (GameCore.state.settings) {
      renderRules(GameCore.state.settings);
    }

    // CHỈ mở pop-up mua đất / rút thẻ / đấu giá SAU KHI quân cờ đã chạy tới đích
    handlePendingFromServer();
  }

  function handlePendingFromServer() {
    const state = GameCore.state;
    const buyModal = $('buy-modal');
    const cardModal = $('card-modal');
    const currentPlayer = state.players?.[myIndex];
    const currentTile = currentPlayer ? state.board?.[currentPlayer.position] : null;

    if (currentTile?.type === 'SHOP' && window.GameCore?.Shop && GameCore.Shop.shopSession?.playerId !== currentPlayer.id) {
      GameCore.Shop.openShop(currentPlayer);
    }

    // Mở bảng chọn tuyến ngay sau state xúc xắc, khi token vẫn ở ga.
    if (state.crossRouteChoice && state.pendingCrossRouteRoll && state.currentPlayerIndex === myIndex) {
      const choice = {
        from: state.crossRouteChoice.station,
        to: state.crossRouteChoice.path[state.crossRouteChoice.path.length - 1]
      };
      document.dispatchEvent(new CustomEvent('game:cross-route-choice', {
        detail: {
          crossRouteChoice: choice,
          dice: state.pendingCrossRouteRoll.dice,
          startPos: state.pendingCrossRouteRoll.startPos
        }
      }));
    }

    // Nếu có pendingTile và đó là lượt mình -> hiện modal mua
    if (state.pendingTile && state.currentPlayerIndex === myIndex) {
      if (buyModal) {
        $('modal-tile-name').innerText = state.pendingTile.name;
        const me = state.players[myIndex];
        const effectivePrice = (me && me.hasDiscount) ? Math.round(state.pendingTile.price * 0.5) : state.pendingTile.price;
        $('modal-tile-price').innerText = (me && me.hasDiscount) ? `Giá ưu đãi (50%): $${effectivePrice} (Gốc: $${state.pendingTile.price})` : `Giá: $${state.pendingTile.price}`;

        const buyAuctionBtn = $('buy-auction-btn');
        if (buyAuctionBtn) {
          if (GameCore.settings?.auctionMode === true) {
            buyAuctionBtn.classList.remove('hidden');
          } else {
            buyAuctionBtn.classList.add('hidden');
          }
        }
        const buyYesBtn = $('buy-yes-btn');
        if (buyYesBtn) {
          buyYesBtn.disabled = !me || me.money < effectivePrice;
        }

        if (window.positionBuyPrompt) {
          // Find the tile index from the board
          const tileIndex = state.players[myIndex].position;
          window.positionBuyPrompt(tileIndex);
        }
        buyModal.classList.remove('hidden');
      }
    } else if (buyModal) {
      buyModal.classList.add('hidden');
    }

    // Nếu có pendingCard -> hiện modal thẻ (nếu là lượt mình)
    if (state.pendingCard && state.currentPlayerIndex === myIndex) {
      if (cardModal) {
        $('card-type-badge').innerText = state.pendingCard.type || 'CƠ HỘI';
        $('card-title').innerText = state.pendingCard.title || '';
        $('card-text').innerText = state.pendingCard.text || '';
        cardModal.classList.remove('hidden');
      }
    } else if (cardModal) {
      cardModal.classList.add('hidden');
    }
  }

  function onRoomStarted(data) {
    myIndex = data.index !== undefined ? data.index : 0;
    isSpectator = !!data.isSpectator;
    // Reset lại các cờ cho ván mới
    gameStarted = false;
    myTurnRolled = false;
    lastCurrentPlayerIndex = -1;
    console.log(`🎮 Game bắt đầu! myIndex: ${myIndex}, isSpectator: ${isSpectator}`);
    updateControls();
  }

  function onResetToLobby() {
    gameStarted = false;
    isSpectator = false;
    myTurnRolled = false;
    lastCurrentPlayerIndex = -1;
    setMode('lobby');

    // Xóa sạch fireworks nếu có
    if (window.GameUI && GameUI.clearFireworks) GameUI.clearFireworks();

    const victory = $('victory-overlay');
    const bankruptcy = $('bankruptcy-modal');
    const buyModal = $('buy-modal');
    const cardModal = $('card-modal');
    const tradeModal = $('trade-offer-modal');
    const specBanner = $('spectator-banner');
    const debtBanner = $('debt-alert-banner');
    const surrenderModal = $('surrender-confirm-modal');
    if (victory) { victory.classList.add('hidden'); victory._shown = false; }
    if (bankruptcy) bankruptcy.classList.add('hidden');
    if (buyModal) buyModal.classList.add('hidden');
    if (cardModal) cardModal.classList.add('hidden');
    if (tradeModal) tradeModal.classList.add('hidden');
    if (specBanner) specBanner.classList.add('hidden');
    if (debtBanner) debtBanner.classList.add('hidden');
    if (surrenderModal) surrenderModal.classList.add('hidden');

    // Hiện lại phòng chờ
    const lobby = $('lobby-overlay');
    const waiting = $('room-waiting-overlay');
    if (waiting) waiting.classList.remove('hidden');
    if (lobby) lobby.classList.remove('hidden');
  }

  function restartGame(mode = 'instant') {
    const s = getSocket();
    if (!s || !roomCode) return;
    s.emit('game:restart', { code: roomCode, mode }, (res) => {
      if (res && !res.ok && res.error) {
        alert(res.error);
      }
    });
  }

  // =========================================================
  // CHAT
  // =========================================================
  function onChatMessage(data) {
    if (!data || !data.text || !window.GameCore) return;
    GameCore.state.chatMessages = GameCore.state.chatMessages || [];
    const message = { from: data.from || 'Người chơi', text: data.text, ts: data.ts || `${data.from}:${data.text}` };
    if (GameCore.state.chatMessages.some(item => item.ts === message.ts)) return;
    GameCore.state.chatMessages.push(message);
    if (window.GameUI && GameCore.state.players.length) {
      GameUI.renderUI();
    } else {
      const chatBox = $('chat-box');
      if (!chatBox) return;
      const msgDiv = document.createElement('div');
      msgDiv.className = 'chat-msg';
      msgDiv.innerText = `${data.from || 'Người chơi'}: ${data.text}`;
      chatBox.appendChild(msgDiv);
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }

  function sendChatMessage() {
    const input = $('chat-input');
    const s = getSocket();
    const message = input ? input.value.trim() : '';
    if (!isOnline() || !s || !roomCode || !message) return;
    s.emit('chat:message', { code: roomCode, text: message });
    input.value = '';
  }

  // =========================================================
  // HOOK CÁC EVENT LISTENER CỦA UI (chế độ online)
  // =========================================================
  function hookButtons() {
    const rollBtn = $('roll-btn');

    const chatInput = $('chat-input');
    const chatSendBtn = $('chat-send-btn');
    if (chatSendBtn) chatSendBtn.addEventListener('click', sendChatMessage);
    if (chatInput) {
      chatInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          sendChatMessage();
        }
      });
    }

    // Gieo xúc xắc -> gửi lên server
    if (rollBtn) {
      rollBtn.addEventListener('click', () => {
        if (!isOnline() || isSpectator) return;
        if (rollBtn.dataset.action === 'end-turn') {
          sendAction('END_TURN');
          return;
        }
        markRolled();
        rollBtn.disabled = true;
        const godDiceSelect = document.querySelector('#god-dice-control select');
        const currentPlayer = GameCore.getCurrentPlayer();
        const steps = currentPlayer?.godDiceTurns > 0 && godDiceSelect ? Number(godDiceSelect.value) : null;
        sendAction('ROLL_DICE', steps ? { steps } : {});
      }, true);
    }

    // Mua đất
    const buyYes = $('buy-yes-btn');
    if (buyYes) {
      buyYes.addEventListener('click', () => {
        if (!isOnline() || isSpectator) return;
        $('buy-modal').classList.add('hidden');
        sendAction('BUY_PROPERTY');
      }, true);
    }

    // Bỏ qua mua
    const buyNo = $('buy-no-btn');
    if (buyNo) {
      buyNo.addEventListener('click', () => {
        if (!isOnline() || isSpectator) return;
        $('buy-modal').classList.add('hidden');
        sendAction('SKIP_PROPERTY');
      }, true);
    }

    // Đấu giá (nút trong buy-popover khi auctionMode bật)
    const buyAuction = $('buy-auction-btn');
    if (buyAuction) {
      buyAuction.addEventListener('click', () => {
        if (!isOnline() || isSpectator) return;
        $('buy-modal').classList.add('hidden');
        sendAction('AUCTION_PROPERTY');
      }, true);
    }

    // Chấp nhận thẻ
    const acceptCard = $('btn-accept-card');
    if (acceptCard) {
      acceptCard.addEventListener('click', () => {
        if (!isOnline() || isSpectator) return;
        $('card-modal').classList.add('hidden');
        sendAction('APPLY_CARD');
      }, true);
    }

    // Kết thúc lượt
    const endTurnBtn = $('end-turn-btn');
    if (endTurnBtn) {
      endTurnBtn.addEventListener('click', () => {
        if (!isOnline() || isSpectator) return;
        sendAction('END_TURN');
      }, true);
    }

    // Nộp bảo lãnh ra tù
    const bailBtn = $('bail-btn');
    if (bailBtn) {
      bailBtn.addEventListener('click', () => {
        if (!isOnline() || isSpectator) return;
        sendAction('PAY_BAIL');
      }, true);
    }

    // Đầu hàng / Phá sản (Online)
    const surrenderBtn = $('surrender-btn');
    const debtSurrenderBtn = $('debt-surrender-btn');
    const surrenderYesBtn = $('surrender-yes-btn');
    const surrenderNoBtn = $('surrender-no-btn');
    const surrenderModal = $('surrender-confirm-modal');
    const surrenderConfirmDesc = $('surrender-confirm-desc');

    function openOnlineSurrenderModal() {
      if (!isOnline() || isSpectator) return;
      const me = GameCore.state.players[myIndex];
      if (!me || me.isBankrupt) return;
      if (surrenderConfirmDesc) {
        if (me.lastCreditorId) {
          const creditor = GameCore.state.players.find(x => x.id === me.lastCreditorId);
          surrenderConfirmDesc.innerText = `Bạn đang nợ ${creditor ? creditor.name : 'người chơi khác'}. Nếu đầu hàng, toàn bộ tiền mặt và ${GameCore.state.board.filter(t => t.owner === me.id).length} bất động sản của bạn sẽ được chuyển giao cho ${creditor ? creditor.name : 'chủ nợ'}!`;
        } else {
          surrenderConfirmDesc.innerText = `Bạn có chắc chắn muốn tuyên bố phá sản và đầu hàng không? Toàn bộ tài sản sẽ bị thu hồi về Ngân hàng!`;
        }
      }
      if (surrenderModal) surrenderModal.classList.remove('hidden');
    }

    if (surrenderBtn) {
      surrenderBtn.addEventListener('click', () => {
        openOnlineSurrenderModal();
      }, true);
    }

    if (debtSurrenderBtn) {
      debtSurrenderBtn.addEventListener('click', () => {
        openOnlineSurrenderModal();
      }, true);
    }

    if (surrenderYesBtn) {
      surrenderYesBtn.addEventListener('click', () => {
        if (!isOnline() || isSpectator) return;
        if (surrenderModal) surrenderModal.classList.add('hidden');
        sendAction('SURRENDER');
      }, true);
    }

    if (surrenderNoBtn) {
      surrenderNoBtn.addEventListener('click', () => {
        if (surrenderModal) surrenderModal.classList.add('hidden');
      }, true);
    }

    // Xây nhà / dỡ nhà / cầm cố
    const buildBtn = $('btn-build-house');
    if (buildBtn) {
      buildBtn.addEventListener('click', () => {
        if (!isOnline() || isSpectator) return;
        const idx = window.GameUI ? window.GameUI.selectedTileIndex : null;
        if (idx == null) return;
        const tile = GameCore.state.board[idx];
        if (tile) sendAction('BUILD_HOUSE', { tileId: tile.id });
      }, true);
    }
    const sellBtn = $('btn-sell-house');
    if (sellBtn) {
      sellBtn.addEventListener('click', () => {
        if (!isOnline() || isSpectator) return;
        const idx = window.GameUI ? window.GameUI.selectedTileIndex : null;
        if (idx == null) return;
        const tile = GameCore.state.board[idx];
        if (tile) sendAction('SELL_HOUSE', { tileId: tile.id });
      }, true);
    }
    const mortgageBtn = $('btn-mortgage');
    if (mortgageBtn) {
      mortgageBtn.addEventListener('click', () => {
        if (!isOnline() || isSpectator) return;
        const idx = window.GameUI ? window.GameUI.selectedTileIndex : null;
        if (idx == null) return;
        const tile = GameCore.state.board[idx];
        if (tile) sendAction('MORTGAGE', { tileId: tile.id });
      }, true);
    }

    // Nút ChƠi lại trên Victory Screen (Online chủ động xử lý, Offline bỏ qua)
    const victoryInstantBtn = $('victory-play-again-btn');
    if (victoryInstantBtn) {
      victoryInstantBtn.addEventListener('click', () => {
        if (!isOnline()) return; // Offline xử lý trong ui.js
        // Ẩn overlay trước
        const ov = $('victory-overlay');
        if (ov) { ov.classList.add('hidden'); ov._shown = false; }
        restartGame('instant');
      }, true);
    }

    const victoryLobbyBtn = $('victory-lobby-btn');
    if (victoryLobbyBtn) {
      victoryLobbyBtn.addEventListener('click', () => {
        if (!isOnline()) return;
        const ov = $('victory-overlay');
        if (ov) { ov.classList.add('hidden'); ov._shown = false; }
        restartGame('lobby');
      }, true);
    }
  }

  // =========================================================
  // KHỞI TẠO
  // =========================================================
  function onGameOver(data) {
    // Server báo hiệu game kết thúc - show màn hình chiến thắng
    if (!data) return;
    if (window.GameUI && GameUI.showVictoryScreen) {
      const winner = data.winner || GameCore.state.winner;
      const players = data.players || GameCore.state.players;
      GameUI.showVictoryScreen(winner, players);
    }
  }

  function init() {
    document.addEventListener('DOMContentLoaded', () => {
      const connectCb = () => {
        const s = getSocket();
        if (!s) { setTimeout(connectCb, 200); return; }
        socket = s;
        socket.on('room:joined', (data) => {
          if (data) {
            if (data.isSpectator !== undefined) isSpectator = !!data.isSpectator;
            if (data.roomCode) roomCode = data.roomCode;
          }
          updateControls();
        });
        socket.on('room:started', onRoomStarted);
        socket.on('room:resetToLobby', onResetToLobby);
        socket.on('game:state', onGameState);
        socket.on('game:over', onGameOver);
        socket.on('chat:message', onChatMessage);
        hookButtons();
      };
      connectCb();
    });
  }

  // =========================================================
  // EXPOSE API (cho lobby.js và ui.js dùng)
  // =========================================================
  window.GameOnline = {
    setMode,
    isOnline,
    onGameState,
    onChatMessage,
    sendAction,
    markRolled,
    renderRules,
    hostStartGame,
    restartGame,
    isSpectator: () => isSpectator,
    getRoomCode: () => roomCode,
    setRoomCode: (c) => { roomCode = c; },
    get myIndex() { return myIndex; }
  };

  init();
})();
