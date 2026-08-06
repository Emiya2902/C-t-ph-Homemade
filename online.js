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
    const s = getSocket();
    if (!s || !roomCode) return;
    s.emit('game:action', {
      code: roomCode,
      action: Object.assign({ type }, payload || {})
    }, (res) => {
      if (res && res.ok === false && res.error) {
        console.warn('Hành động bị từ chối:', res.error);
      }
    });
  }

  // Đồng bộ trạng thái từ server vào GameCore.state (để UI render)
  function syncState(serverState) {
    if (!GameCore || !GameCore.state) return;

    // Đồng bộ board (bản sao sâu)
    GameCore.state.board = JSON.parse(JSON.stringify(serverState.board || []));

    // Đồng bộ players
    GameCore.state.players = JSON.parse(JSON.stringify(serverState.players || []));

    GameCore.state.currentPlayerIndex = serverState.currentPlayerIndex || 0;
    GameCore.state.logs = (serverState.logs || []).slice();
    GameCore.state.lastRoll = serverState.lastRoll || 0;

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
    // Cập nhật cả state.settings (cho renderRules) và GameCore.settings (cho các
    // hành động như xây nhà/cầm cố/đấu giá trong ui.js dựa trên module settings)
    if (serverState.settings) {
      GameCore.state.settings = serverState.settings;
      GameCore.settings = Object.assign({}, GameCore.settings, serverState.settings);
    }
  }

  // Render toàn bộ giao diện từ trạng thái đã đồng bộ
  function renderFromServer() {
    if (!window.GameUI) return;
    // renderUI dựa vào GameCore.state đã được sync
    window.GameUI.renderUI();
    updateControls();
  }

// Cập nhật nút bấm theo lượt / trạng thái
  function updateControls() {
    const rollBtn = $('roll-btn');
    const endTurnBtn = $('end-turn-btn');
    const bailBtn = $('bail-btn');
    if (!rollBtn || !endTurnBtn) return;

    const state = GameCore.state;
    const isMyTurn = state.currentPlayerIndex === myIndex;
    const auctionActive = !!(state.auctionState && state.auctionState.active);

// Khi lượt thay đổi -> reset cờ "đã gieo" (cho cả lượt của mình và người khác)
    if (lastCurrentPlayerIndex !== state.currentPlayerIndex) {
      lastCurrentPlayerIndex = state.currentPlayerIndex;
      myTurnRolled = false;
    }

    // Đang đấu giá: khoá các nút lượt
    if (auctionActive) {
      rollBtn.disabled = true;
      endTurnBtn.disabled = true;
      // Bật modal đấu giá
      if (window.GameUI && GameUI.openAuctionModal) {
        GameUI.openAuctionModal();
      }
      return;
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
      rollBtn.disabled = false;
      endTurnBtn.disabled = true;
      return;
    }

    // Đã gieo xúc xắc -> chỉ cho Kết thúc lượt
    rollBtn.disabled = true;
    endTurnBtn.disabled = false;
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
  async function onGameState(data) {
    if (!data || !data.state) return;
    const previousPositions = GameCore.state.players.map(player => player.position);
    const wasStarted = gameStarted;
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

    // Animate the token from its previous tile before rendering the final
    // authoritative position, instead of teleporting it across the board.
    if (wasStarted && window.GameUI) {
      const movedIndex = GameCore.state.players.findIndex((player, index) => previousPositions[index] !== undefined && player.position !== previousPositions[index]);
      if (movedIndex >= 0) {
        const startPos = previousPositions[movedIndex];
        const steps = (GameCore.state.players[movedIndex].position - startPos + 40) % 40;
        if (steps > 0 && steps <= 12) {
          await GameUI.playDiceAnimation(GameCore.state.lastRoll);
          await GameUI.moveTokenStepByStep(GameUI.playerTokens[movedIndex], startPos, steps);
        }
      }
    }

renderFromServer();

    // Render bảng luật chơi phòng từ settings của server
    if (GameCore.state.settings) {
      renderRules(GameCore.state.settings);
    }

    // Xử lý pending card / pending buy / auction tự động
    handlePendingFromServer();
  }

  function handlePendingFromServer() {
    const state = GameCore.state;
    const buyModal = $('buy-modal');
    const cardModal = $('card-modal');

    // Nếu có pendingTile và đó là lượt mình -> hiện modal mua
    if (state.pendingTile && state.currentPlayerIndex === myIndex) {
      if (buyModal) {
        $('modal-tile-name').innerText = state.pendingTile.name;
        $('modal-tile-price').innerText = `Giá: $${state.pendingTile.price}`;
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
    myIndex = data.index;
    console.log(`🎮 Bạn là người chơi #${myIndex + 1}`);
  }

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
        if (!isOnline()) return; // offline do ui.js xử lý
        markRolled();
        rollBtn.disabled = true;
        sendAction('ROLL_DICE');
      }, true); // capture phase để chạy trước handler của ui.js
    }

    // Mua đất
    const buyYes = $('buy-yes-btn');
    if (buyYes) {
      buyYes.addEventListener('click', () => {
        if (!isOnline()) return;
        // Đóng modal ngay, server sẽ xác nhận
        $('buy-modal').classList.add('hidden');
        sendAction('BUY_PROPERTY');
      }, true);
    }

    // Bỏ qua mua
    const buyNo = $('buy-no-btn');
    if (buyNo) {
      buyNo.addEventListener('click', () => {
        if (!isOnline()) return;
        $('buy-modal').classList.add('hidden');
        sendAction('SKIP_PROPERTY');
      }, true);
    }

    // Chấp nhận thẻ
    const acceptCard = $('btn-accept-card');
    if (acceptCard) {
      acceptCard.addEventListener('click', () => {
        if (!isOnline()) return;
        $('card-modal').classList.add('hidden');
        sendAction('APPLY_CARD');
      }, true);
    }

    // Trả giá trong đấu giá: các nút +2/+10/+100
    document.querySelectorAll('.auction-add-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!isOnline()) return;
        const add = parseInt(btn.dataset.add, 10) || 10;
        const a = GameCore.state.auctionState;
        if (!a || !a.active) return;
        sendAction('PLACE_BID', { amount: a.currentBid + add });
      }, true);
    });

    // Kết thúc lượt
    const endTurnBtn = $('end-turn-btn');
    if (endTurnBtn) {
      endTurnBtn.addEventListener('click', () => {
        if (!isOnline()) return;
        sendAction('END_TURN');
      }, true);
    }

    // Nộp bảo lãnh ra tù
    const bailBtn = $('bail-btn');
    if (bailBtn) {
      bailBtn.addEventListener('click', () => {
        if (!isOnline()) return;
        sendAction('PAY_BAIL');
      }, true);
    }

    // Xây nhà / dỡ nhà / cầm cố
    const buildBtn = $('btn-build-house');
    if (buildBtn) {
      buildBtn.addEventListener('click', () => {
        if (!isOnline()) return;
        const idx = window.GameUI ? window.GameUI.selectedTileIndex : null;
        if (idx == null) return;
        const tile = GameCore.state.board[idx];
        if (tile) sendAction('BUILD_HOUSE', { tileId: tile.id });
      }, true);
    }
    const sellBtn = $('btn-sell-house');
    if (sellBtn) {
      sellBtn.addEventListener('click', () => {
        if (!isOnline()) return;
        const idx = window.GameUI ? window.GameUI.selectedTileIndex : null;
        if (idx == null) return;
        const tile = GameCore.state.board[idx];
        if (tile) sendAction('SELL_HOUSE', { tileId: tile.id });
      }, true);
    }
    const mortgageBtn = $('btn-mortgage');
    if (mortgageBtn) {
      mortgageBtn.addEventListener('click', () => {
        if (!isOnline()) return;
        const idx = window.GameUI ? window.GameUI.selectedTileIndex : null;
        if (idx == null) return;
        const tile = GameCore.state.board[idx];
        if (tile) sendAction('MORTGAGE', { tileId: tile.id });
      }, true);
    }
  }

  // Khi start button (host) bắt đầu -> chuyển sang online
  function init() {
    // Lắng nghe các sự kiện từ socket qua Lobby
    document.addEventListener('DOMContentLoaded', () => {
      // Chờ socket có sẵn
      const connectCb = () => {
        const s = getSocket();
        if (!s) { setTimeout(connectCb, 200); return; }
        socket = s;
        socket.on('room:started', onRoomStarted);
        socket.on('game:state', onGameState);
        socket.on('chat:message', onChatMessage);
        hookButtons();
      };
      connectCb();
    });
  }

// Expose API
  window.GameOnline = {
    setMode,
    isOnline,
    onGameState,
    onChatMessage,
    sendAction,
    markRolled,
    renderRules,
    hostStartGame,
    getRoomCode: () => roomCode,
    setRoomCode: (c) => { roomCode = c; },
    get myIndex() { return myIndex; }
  };

  init();
})();
