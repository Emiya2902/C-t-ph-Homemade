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
      clearError();

      // Tự động kết nối lại nếu trước đó bị rớt mạng trong lúc đang chơi online
      const session = getSavedOnlineSession();
      if (session && session.roomCode && session.sessionToken && window.GameOnline && window.GameOnline.isOnline && window.GameOnline.isOnline()) {
        socket.emit('room:reconnect', {
          code: session.roomCode,
          sessionToken: session.sessionToken,
          name: session.name || getPlayerName()
        }, (res) => {
          if (res && res.ok) {
            console.log('⚡ Đã tự động kết nối lại ván đấu thành công!');
            myRoomCode = res.roomCode;
            isHost = !!res.isHost;
            if (window.GameOnline && window.GameOnline.setRoomCode) {
              window.GameOnline.setRoomCode(res.roomCode);
            }
          }
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('⚠️ Mất kết nối server!');
      if (window.GameOnline && window.GameOnline.isOnline && window.GameOnline.isOnline()) {
        // Đang trong trận -> báo đang thử kết nối lại
        console.warn('Đang cố gắng kết nối lại máy chủ...');
      } else {
        showError('Mất kết nối server. Vui lòng thử lại.');
      }
    });

    socket.on('room:joined', (data) => {
      myRoomCode = data.roomCode;
      if (data.sessionToken) {
        saveOnlineSession(data.roomCode, data.sessionToken, getPlayerName(), !!data.isHost);
      }
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

    socket.on('room:resetToLobby', (data) => {
      myRoomCode = data.roomCode;
      enterRoomWaiting(data.roomCode);
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

  let currentPlayersCount = 0;

  function renderRoomPlayers(data) {
    const listEl = $('room-players-list');
    if (!listEl) return;
    listEl.innerHTML = '';
    currentPlayersCount = (data.players && data.players.length) || 0;

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
    updateHostUI(currentPlayersCount);

    // Hiển thị luật chơi phòng trong thời gian thực cho mọi người trong phòng chờ
    if (data.settings) {
      renderWaitingRules(data.settings);
    }

    // Render bộ chọn nhân vật cho riêng người chơi này (trong phòng chờ)
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
      <li>• Trọn bộ màu nâng nhà tự do: <b>${settings.freeBuildOnFullGroup ? 'Bật' : 'Tắt'}</b></li>
      <li>• Bản đồ: <b>${(settings.boardMode === 'cross' || settings.crossBoard) ? 'Chữ Thập (57 ô)' : 'Chuẩn (40 ô)'}</b></li>
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

  function updateHostUI(count = currentPlayersCount) {
    const startBtn = $('room-start-btn');
    const note = $('room-waiting-note');
    if (!startBtn || !note) return;
    if (isHost) {
      startBtn.classList.remove('hidden');
      note.classList.add('hidden');
      if (count < 2) {
        startBtn.disabled = true;
        startBtn.style.opacity = '0.55';
        startBtn.style.cursor = 'not-allowed';
        startBtn.innerText = `⏳ CẦN ÍT NHẤT 2 NGƯỜI CHƠI (${count}/2)`;
      } else {
        startBtn.disabled = false;
        startBtn.style.opacity = '1';
        startBtn.style.cursor = 'pointer';
        startBtn.innerText = '🚀 BẮT ĐẦU TRÒ CHƠI';
      }
    } else {
      startBtn.classList.add('hidden');
      note.classList.remove('hidden');
      note.innerText = 'Đang chờ chủ phòng bắt đầu...';
    }
  }

  // Mở màn hình cài đặt (chung) - chọn nhân vật + luật chơi
  // mode: 'online' | 'offline'
  function openSettingsScreen(mode, settings) {
    const offlineSection = $('offline-settings-section');
    const startBtn = $('start-game-btn');
    const waitingNote = $('settings-waiting-note');
    const backBtn = $('settings-back-btn');

    clearError();
    hide(lobbyOverlay);
    hide(roomWaitingOverlay);
    show(settingsOverlay);

    if (mode === 'online') {
      // Ẩn hoàn toàn ô chọn nhân vật/số người chơi của chế độ offline
      if (offlineSection) offlineSection.classList.add('hidden');
      // Host có thể bắt đầu; người chơi khác chờ host bắt đầu
      if (startBtn) {
        startBtn.classList.toggle('hidden', !isHost);
        if (currentPlayersCount < 2) {
          startBtn.disabled = true;
          startBtn.style.opacity = '0.55';
          startBtn.style.cursor = 'not-allowed';
          startBtn.innerText = `⏳ CẦN ÍT NHẤT 2 NGƯỜI CHƠI (${currentPlayersCount}/2)`;
        } else {
          startBtn.disabled = false;
          startBtn.style.opacity = '1';
          startBtn.style.cursor = 'pointer';
          startBtn.innerText = '🚀 BẮT ĐẦU TRÒ CHƠI';
        }
      }
      if (waitingNote) waitingNote.classList.toggle('hidden', isHost);
      if (backBtn) backBtn.classList.toggle('hidden', !isHost);
      if (settings) {
        applySettingsToForm(settings);
        renderWaitingRules(settings);
      }
    } else {
      // Offline mode: hiện đầy đủ ô chọn nhân vật & số người chơi
      if (offlineSection) offlineSection.classList.remove('hidden');
      if (startBtn) {
        startBtn.classList.remove('hidden');
        startBtn.disabled = false;
        startBtn.style.opacity = '1';
        startBtn.style.cursor = 'pointer';
        startBtn.innerText = '🚀 BẮT ĐẦU TRÒ CHƠI';
      }
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
    const setFreeBuild = $('set-free-build-full-group');
    const setCross = $('set-cross-board');
    if (setInitial && settings.initialMoney !== undefined) setInitial.value = settings.initialMoney;
    if (setPassGo && settings.passGoMoney !== undefined) setPassGo.value = settings.passGoMoney;
    if (setDouble && settings.doubleRentOnFullGroup !== undefined) setDouble.checked = !!settings.doubleRentOnFullGroup;
    if (setMortgage && settings.mortgageInsteadOfSell !== undefined) setMortgage.checked = !!settings.mortgageInsteadOfSell;
    if (setJackpot && settings.jackpotOnFreeParking !== undefined) setJackpot.checked = !!settings.jackpotOnFreeParking;
    if (setRentJailed && settings.receiveRentWhileJailed !== undefined) setRentJailed.checked = !!settings.receiveRentWhileJailed;
    if (setAuction && settings.auctionMode !== undefined) setAuction.checked = !!settings.auctionMode;
    if (setFreeBuild && settings.freeBuildOnFullGroup !== undefined) setFreeBuild.checked = !!settings.freeBuildOnFullGroup;
    if (setCross && (settings.crossBoard !== undefined || settings.boardMode !== undefined)) {
      setCross.checked = !!(settings.crossBoard || settings.boardMode === 'cross');
    }
  }

  function getFormSettings() {
    const setInitial = $('set-initial-money');
    const setPassGo = $('set-pass-go');
    const setDouble = $('set-double-rent');
    const setMortgage = $('set-mortgage');
    const setJackpot = $('set-jackpot');
    const setRentJailed = $('set-rent-jailed');
    const setAuction = $('set-auction');
    const setFreeBuild = $('set-free-build-full-group');
    const setCross = $('set-cross-board');
    const isCross = setCross ? !!setCross.checked : false;
    return {
      initialMoney: setInitial ? Math.max(500, Number(setInitial.value) || 1500) : 1500,
      passGoMoney: setPassGo ? Math.max(50, Number(setPassGo.value) || 200) : 200,
      doubleRentOnFullGroup: setDouble ? !!setDouble.checked : true,
      mortgageInsteadOfSell: setMortgage ? !!setMortgage.checked : true,
      jackpotOnFreeParking: setJackpot ? !!setJackpot.checked : true,
      receiveRentWhileJailed: setRentJailed ? !!setRentJailed.checked : false,
      auctionMode: setAuction ? !!setAuction.checked : false,
      freeBuildOnFullGroup: setFreeBuild ? !!setFreeBuild.checked : false,
      boardMode: isCross ? 'cross' : 'standard',
      crossBoard: isCross
    };
  }

  function broadcastSettingsIfHost() {
    if (!isHost || !myRoomCode) return;
    const currentSettings = getFormSettings();
    renderWaitingRules(currentSettings);
    const s = connectSocket();
    s.emit('room:updateSettings', { code: myRoomCode, settings: currentSettings });
  }

  function hookSettingsInputs() {
    const inputIds = ['set-initial-money', 'set-pass-go', 'set-double-rent', 'set-mortgage', 'set-jackpot', 'set-rent-jailed', 'set-auction', 'set-free-build-full-group', 'set-cross-board'];
    inputIds.forEach(id => {
      const el = $(id);
      if (el) {
        el.addEventListener('change', broadcastSettingsIfHost);
        el.addEventListener('input', broadcastSettingsIfHost);
      }
    });
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
    if (currentPlayersCount < 2) {
      showError('Cần ít nhất 2 người chơi để bắt đầu!');
      return;
    }
    const s = connectSocket();
    s.emit('game:start', { code: myRoomCode, settings: settings || {} }, (res) => {
      if (!res || !res.ok) {
        showError((res && res.error) || 'Không thể bắt đầu trò chơi.');
      }
    });
  }

  // Quản lý phiên kết nối online
  function saveOnlineSession(roomCode, sessionToken, name, isHost) {
    try {
      localStorage.setItem('monopoly_online_session', JSON.stringify({
        roomCode,
        sessionToken,
        name,
        isHost,
        timestamp: Date.now()
      }));
    } catch (e) { }
  }

  function getSavedOnlineSession() {
    try {
      const data = localStorage.getItem('monopoly_online_session');
      if (!data) return null;
      const session = JSON.parse(data);
      if (session && session.roomCode && session.sessionToken) {
        // Chỉ giữ phiên trong 3 giờ
        if (Date.now() - (session.timestamp || 0) < 3 * 3600 * 1000) {
          return session;
        }
      }
    } catch (e) { }
    return null;
  }

  function clearOnlineSession() {
    try { localStorage.removeItem('monopoly_online_session'); } catch (e) { }
  }

  function checkAndShowReconnectBanner() {
    const session = getSavedOnlineSession();
    const banner = $('reconnect-banner');
    const codeDisplay = $('reconnect-room-code');
    if (session && banner && codeDisplay) {
      codeDisplay.innerText = session.roomCode;
      banner.classList.remove('hidden');
    } else if (banner) {
      banner.classList.add('hidden');
    }
  }

  // ---- Event handlers ----
  function init() {
    if (!lobbyOverlay) return;

    checkAndShowReconnectBanner();
    hookSettingsInputs();

    // Nút Vào lại từ banner
    const reconnectJoinBtn = $('reconnect-join-btn');
    if (reconnectJoinBtn) {
      reconnectJoinBtn.addEventListener('click', () => {
        const session = getSavedOnlineSession();
        if (!session) return;
        clearError();
        const s = connectSocket();
        s.emit('room:reconnect', {
          code: session.roomCode,
          sessionToken: session.sessionToken,
          name: session.name || getPlayerName()
        }, (res) => {
          if (res && res.ok) {
            myRoomCode = res.roomCode;
            isHost = !!res.isHost;
            $('reconnect-banner')?.classList.add('hidden');
            if (window.GameOnline && window.GameOnline.setMode) {
              window.GameOnline.setMode('online');
            }
            if (window.GameOnline && window.GameOnline.setRoomCode) {
              window.GameOnline.setRoomCode(res.roomCode);
            }
            if (res.started) {
              hide(lobbyOverlay);
              hide(roomWaitingOverlay);
              hide(settingsOverlay);
            } else if (!res.isSpectator) {
              enterRoomWaiting(res.roomCode);
            }
          } else {
            showError((res && res.error) || 'Ván đấu không còn tồn tại.');
            clearOnlineSession();
            $('reconnect-banner')?.classList.add('hidden');
          }
        });
      });
    }

    // Nút Bỏ qua từ banner
    const reconnectDismissBtn = $('reconnect-dismiss-btn');
    if (reconnectDismissBtn) {
      reconnectDismissBtn.addEventListener('click', () => {
        clearOnlineSession();
        $('reconnect-banner')?.classList.add('hidden');
      });
    }

    // Tạo phòng
    $('lobby-create-btn').addEventListener('click', () => {
      clearError();
      const s = connectSocket();
      s.emit('room:create', { name: getPlayerName() }, (res) => {
        if (res && res.ok) {
          myPlayer = res.player;
          isHost = true;
          if (res.sessionToken) {
            saveOnlineSession(res.roomCode, res.sessionToken, getPlayerName(), true);
          }
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
      const session = getSavedOnlineSession();
      const sessionToken = (session && session.roomCode === code) ? session.sessionToken : null;
      const s = connectSocket();
      s.emit('room:join', { code, name: getPlayerName(), sessionToken }, (res) => {
        if (res && res.ok) {
          myPlayer = res.player;
          isHost = !!res.isHost;
          if (res.sessionToken) {
            saveOnlineSession(res.roomCode, res.sessionToken, getPlayerName(), isHost);
          }
          if (window.GameOnline && window.GameOnline.setMode) {
            window.GameOnline.setMode('online');
          }
          if (window.GameOnline && window.GameOnline.setRoomCode) {
            window.GameOnline.setRoomCode(res.roomCode);
          }
          if (res.started) {
            hide(lobbyOverlay);
            hide(roomWaitingOverlay);
            hide(settingsOverlay);
          } else if (!res.isSpectator) {
            enterRoomWaiting(res.roomCode);
          }
        } else {
          showError((res && res.error) || 'Không tham gia được phòng.');
        }
      });
    });

    // Bắt đầu game (host) -> mở màn hình cài đặt luật chơi trước (cho tất cả người chơi)
    $('room-start-btn').addEventListener('click', () => {
      clearError();
      if (!isHost) return;
      const s = connectSocket();
      s.emit('room:openSettings', { code: myRoomCode }, (res) => {
        if (res && res.ok) {
          openSettingsScreen('online', res.settings);
        } else {
          showError((res && res.error) || 'Không thể mở cài đặt.');
        }
      });
    });

    // Nút quay lại phòng chờ từ màn hình cài đặt
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
      clearOnlineSession();
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
    startGame,
    saveOnlineSession,
    clearOnlineSession
  };
})();
