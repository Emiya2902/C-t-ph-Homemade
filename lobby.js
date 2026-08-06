/**
 * LOBBY CONTROLLER - Xử lý màn hình tạo/tham gia phòng chơi online
 */
(function () {
  'use strict';

  let socket = null;
  let myPlayer = null;
  let myRoomCode = null;
  let isHost = false;

  const lobbyOverlay = document.getElementById('lobby-overlay');
  const roomWaitingOverlay = document.getElementById('room-waiting-overlay');
  const settingsOverlay = document.getElementById('settings-overlay');

  function $(id) { return document.getElementById(id); }
  function show(el) { if (el) el.classList.remove('hidden'); }
  function hide(el) { if (el) el.classList.add('hidden'); }

  function showError(msg) {
    const errEl = $('lobby-error');
    if (errEl) {
      errEl.innerText = msg;
      errEl.classList.remove('hidden');
    }
  }
  function clearError() {
    const errEl = $('lobby-error');
    if (errEl) errEl.classList.add('hidden');
  }

  function getPlayerName() {
    const input = $('lobby-name');
    const name = (input && input.value.trim()) || '';
    return name || `Player${Math.floor(Math.random() * 9000) + 1000}`;
  }

  function connectSocket() {
    if (socket) return socket;
    socket = io();
    window.LobbySocket = socket;

    socket.on('connect', () => {
      console.log('🔌 Đã kết nối server!');
    });

    socket.on('disconnect', () => {
      console.log('⚠️ Mất kết nối server!');
      showError('Mất kết nối server. Vui lòng thử lại.');
    });

socket.on('room:joined', (data) => {
      myRoomCode = data.roomCode;
      // Quan trọng: cập nhật roomCode cho online.js để gửi hành động lên server
      if (window.GameOnline && window.GameOnline.setRoomCode) {
        window.GameOnline.setRoomCode(data.roomCode);
      }
    });

    socket.on('room:host', (data) => {
      isHost = !!data.isHost;
      updateHostUI();
    });

socket.on('lobby:update', (data) => {
      renderRoomPlayers(data);
    });

    // Chủ phòng mở màn hình cài đặt -> tất cả người chơi cùng chuyển sang màn hình cài đặt
    socket.on('room:openSettings', (data) => {
      openSettingsScreen('online', data && data.settings);
    });

    // Luật chơi được cập nhật trong thời gian thực
    socket.on('room:settings', (data) => {
      if (data && data.settings) {
        renderWaitingRules(data.settings);
        applySettingsToForm(data.settings);
      }
    });

    socket.on('game:state', (data) => {
      // Khi server gửi trạng thái trò chơi -> chuyển sang màn hình chơi
      if (window.GameOnline && window.GameOnline.onGameState) {
        window.GameOnline.onGameState(data);
      }
    });

    socket.on('chat:message', (data) => {
      if (window.GameOnline && window.GameOnline.onChatMessage) {
        window.GameOnline.onChatMessage(data);
      }
    });

    return socket;
  }

function renderRoomPlayers(data) {
    const listEl = $('room-players-list');
    if (!listEl) return;
    listEl.innerHTML = '';
    data.players.forEach((p) => {
      const row = document.createElement('div');
      row.className = 'room-player-row';
      const nameEl = document.createElement('span');
      nameEl.innerText = `${p.isHost ? '👑 ' : ''}${p.name}${(p.token && p.token.emoji) ? ' ' + p.token.emoji : ''}`;
      row.appendChild(nameEl);
      if (p.id === socket.id) {
        const you = document.createElement('span');
        you.className = 'room-you';
        you.innerText = ' (bạn)';
        row.appendChild(you);
      }
      listEl.appendChild(row);
    });
    isHost = data.hostId === socket.id;
    updateHostUI();

    // Hiển thị luật chơi phòng trong thời gian thực cho mọi người trong phòng chờ
    if (data.settings) {
      renderWaitingRules(data.settings);
    }

    // Render bộ chọn nhân vật cho riêng người chơi này (trên màn hình cài đặt - chung cho online)
    renderTokenPicker(data.players);
  }

// Render bộ chọn nhân vật (quân cờ) cho người chơi hiện tại
  function renderTokenPicker(players) {
    const pickerEl = $('room-token-picker');
    if (!pickerEl) return;
    const tokens = (window.GameCore && GameCore.animalTokens) || [];
    if (!tokens.length) return;

    // Lấy thông tin người chơi hiện tại & các token đã được chọn
    const me = players.find(p => p.id === socket.id);
    const taken = players.filter(p => p.id !== socket.id && p.token).map(p => p.token.emoji);
    const myToken = (me && me.token) || null;

    pickerEl.innerHTML = '';
    tokens.forEach((token) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'room-token-option';
      btn.dataset.emoji = token.emoji;
      btn.innerHTML = `<span class="char-emoji">${token.emoji}</span><span class="char-name">${token.name}</span>`;

      const isMine = myToken && myToken.emoji === token.emoji;
      const isTaken = taken.includes(token.emoji);

      if (isMine) btn.classList.add('selected');
      if (isTaken) btn.classList.add('taken');

      btn.addEventListener('click', () => {
        if (isTaken) return;
        const s = connectSocket();
        s.emit('room:selectToken', { code: myRoomCode, token: { name: token.name, emoji: token.emoji } }, (res) => {
          if (!res || !res.ok) {
            showError((res && res.error) || 'Không chọn được nhân vật.');
          }
        });
      });
      pickerEl.appendChild(btn);
    });
  }

  // Hiển thị "Luật Chơi Phòng" bên phải từ settings của server (phòng chờ)
  function renderWaitingRules(settings) {
    const rulesList = $('rules-list');
    if (!rulesList) return;
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

// Sao chép mã phòng dự phòng (khi không có Clipboard API)
  function fallbackCopy(text, btn) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      if (btn) {
        btn.innerText = '✅ Đã chép!';
        setTimeout(() => { btn.innerText = '📋 Sao chép'; }, 1500);
      }
    } catch (e) {
      if (btn) btn.innerText = '⚠️ Không chép được';
    }
    document.body.removeChild(ta);
  }

function updateHostUI() {
    const startBtn = $('room-start-btn');
    const note = $('room-waiting-note');
    if (!startBtn || !note) return;
    if (isHost) {
      startBtn.classList.remove('hidden');
      note.classList.add('hidden');
    } else {
      startBtn.classList.add('hidden');
      note.classList.remove('hidden');
    }
  }

  // Mở màn hình cài đặt (chung) - chọn nhân vật + luật chơi
  // mode: 'online' | 'offline'
  function openSettingsScreen(mode, settings) {
    const offlineSection = $('offline-settings-section');
    const onlineSection = $('online-settings-section');
    const startBtn = $('start-game-btn');
    const waitingNote = $('settings-waiting-note');
    const backBtn = $('settings-back-btn');

    clearError();
    hide(lobbyOverlay);
    hide(roomWaitingOverlay);
    show(settingsOverlay);

    if (mode === 'online') {
      if (offlineSection) offlineSection.classList.add('hidden');
      if (onlineSection) onlineSection.classList.remove('hidden');
      // Host có thể bắt đầu; người chơi khác chờ host bắt đầu
      if (startBtn) startBtn.classList.toggle('hidden', !isHost);
      if (waitingNote) waitingNote.classList.toggle('hidden', isHost);
      if (backBtn) backBtn.classList.toggle('hidden', !isHost);
      // Render bộ chọn nhân vật cho chính người chơi này
      if (settings) {
        applySettingsToForm(settings);
        renderWaitingRules(settings);
      }
    } else {
      if (offlineSection) offlineSection.classList.remove('hidden');
      if (onlineSection) onlineSection.classList.add('hidden');
      if (startBtn) startBtn.classList.remove('hidden');
      if (waitingNote) waitingNote.classList.add('hidden');
      if (backBtn) backBtn.classList.remove('hidden');
    }

    // Báo chế độ cho ui.js
    if (window.GameMode) window.GameMode = mode;
    if (window.GameOnline && window.GameOnline.setMode) window.GameOnline.setMode(mode);
  }

  // Áp dụng settings từ server vào form cài đặt (giúp host thấy đúng luật hiện tại)
  function applySettingsToForm(settings) {
    if (!settings) return;
    const setInitial = $('set-initial-money');
    const setPassGo = $('set-pass-go');
    const setDouble = $('set-double-rent');
    const setMortgage = $('set-mortgage');
    const setJackpot = $('set-jackpot');
    const setRentJailed = $('set-rent-jailed');
    const setAuction = $('set-auction');
    if (setInitial) setInitial.value = settings.initialMoney;
    if (setPassGo) setPassGo.value = settings.passGoMoney;
    if (setDouble) setDouble.checked = !!settings.doubleRentOnFullGroup;
    if (setMortgage) setMortgage.checked = !!settings.mortgageInsteadOfSell;
    if (setJackpot) setJackpot.checked = !!settings.jackpotOnFreeParking;
    if (setRentJailed) setRentJailed.checked = !!settings.receiveRentWhileJailed;
    if (setAuction) setAuction.checked = !!settings.auctionMode;
  }

function enterRoomWaiting(roomCode) {
    clearError();
    hide(lobbyOverlay);
    show(roomWaitingOverlay);
    $('room-code-display').innerText = roomCode;
  }

  // Chủ phòng bắt đầu trò chơi online với các luật đã chọn
  function startGame(settings) {
    clearError();
    if (!isHost) return;
    const s = connectSocket();
    s.emit('game:start', { code: myRoomCode, settings: settings || {} }, (res) => {
      if (!res || !res.ok) {
        showError((res && res.error) || 'Không thể bắt đầu trò chơi.');
      }
    });
  }

  // ---- Event handlers ----
  function init() {
    if (!lobbyOverlay) return;

    // Tạo phòng
    $('lobby-create-btn').addEventListener('click', () => {
      clearError();
      const s = connectSocket();
      s.emit('room:create', { name: getPlayerName() }, (res) => {
        if (res && res.ok) {
          myPlayer = res.player;
          isHost = true;
          enterRoomWaiting(res.roomCode);
        } else {
          showError((res && res.error) || 'Không tạo được phòng.');
        }
      });
    });

    // Tham gia phòng
    $('lobby-join-btn').addEventListener('click', () => {
      clearError();
      const code = ($('lobby-room-code').value || '').trim().toUpperCase();
      if (!code) { showError('Vui lòng nhập mã phòng!'); return; }
      const s = connectSocket();
      s.emit('room:join', { code, name: getPlayerName() }, (res) => {
        if (res && res.ok) {
          myPlayer = res.player;
          isHost = false;
          enterRoomWaiting(res.roomCode);
        } else {
          showError((res && res.error) || 'Không tham gia được phòng.');
        }
      });
    });

// Bắt đầu game (host) -> mở màn hình cài đặt luật chơi trước (cho tất cả người chơi)
    $('room-start-btn').addEventListener('click', () => {
      clearError();
      if (!isHost) return;
      // Yêu cầu server mở màn hình cài đặt cho mọi người trong phòng
      const s = connectSocket();
      s.emit('room:openSettings', { code: myRoomCode }, (res) => {
        if (res && res.ok) {
          openSettingsScreen('online', res.settings);
        } else {
          showError((res && res.error) || 'Không thể mở cài đặt.');
        }
      });
    });

    // Nút quay lại phòng chờ từ màn hình cài đặt (nếu có)
    const backBtn = $('settings-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        hide(settingsOverlay);
        if (isHost) show(roomWaitingOverlay); else show(lobbyOverlay);
      });
    }

// Sao chép mã phòng
    const copyBtn = $('room-copy-code-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const code = $('room-code-display').innerText || myRoomCode || '';
        if (!code) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(code).then(() => {
            copyBtn.innerText = '✅ Đã chép!';
            setTimeout(() => { copyBtn.innerText = '📋 Sao chép'; }, 1500);
          }).catch(() => fallbackCopy(code, copyBtn));
        } else {
          fallbackCopy(code, copyBtn);
        }
      });
    }

    // Rời phòng
    $('room-leave-btn').addEventListener('click', () => {
      clearError();
      if (socket) socket.emit('room:leave');
      hide(roomWaitingOverlay);
      show(lobbyOverlay);
    });

// Chơi offline
    $('lobby-offline-btn').addEventListener('click', () => {
      openSettingsScreen('offline');
    });
  }

  // Khởi tạo khi DOM sẵn sàng
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API cho online.js dùng
  window.Lobby = {
    get socket() { return socket; },
    get roomCode() { return myRoomCode; },
    get isHost() { return isHost; },
get playerName() { return getPlayerName(); },
    connectSocket,
    enterRoomWaiting,
    startGame
  };
})();
