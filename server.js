/**
* SERVER - Cờ Tỉ Phú Nhà Làm Online Multiplayer
 * Express static server + Socket.io realtime rooms
 * Authoritative game state hosted on the server.
 */

const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

// Shared game logic (works on both server & client)
const { createGame, applyAction } = require('./shared/gameServer.js');

const app = express();
app.use(express.static(path.join(__dirname, '.')));

const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// =========================================================
// ROOM MANAGEMENT
// =========================================================
const rooms = new Map(); // roomCode -> { players: Map(socketId->player), hostId, game }

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  do {
    code = '';
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  } while (rooms.has(code));
  return code;
}

function generateSessionToken() {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

function getRoom(roomCode) {
  return rooms.get(roomCode);
}

function roomClients(io, roomCode) {
  const room = getRoom(roomCode);
  if (!room) return [];
  return [...room.players.keys()];
}

function broadcastRoomState(roomCode) {
  const room = getRoom(roomCode);
  if (!room || !room.game) return;
  const state = room.game.exportState();
  const spectatorsCount = room.spectators ? room.spectators.size : 0;
  io.to(roomCode).emit('game:state', {
    state,
    playersMeta: room.game.getPlayersMeta(),
    currentPlayerIndex: state.currentPlayerIndex,
    spectatorsCount
  });
}

function manageRoomAuctionTimer(room, code) {
  if (!room || !room.game) return;
  const a = room.game.state.auctionState;
  if (!a || !a.active) {
    if (room.auctionTimer) {
      clearTimeout(room.auctionTimer);
      room.auctionTimer = null;
    }
    return;
  }

  if (room.auctionTimer) {
    clearTimeout(room.auctionTimer);
    room.auctionTimer = null;
  }

  const remainingMs = Math.max(100, (a.timerEnd || (Date.now() + 5000)) - Date.now());
  room.auctionTimer = setTimeout(() => {
    if (room.game && room.game.state.auctionState && room.game.state.auctionState.active) {
      room.game.endAuction();
      broadcastRoomState(code);
    }
    room.auctionTimer = null;
  }, remainingMs);
}

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

function assignDefaultToken(room, player) {
  const usedEmojis = [...room.players.values()].filter(p => p.id !== player.id && p.token).map(p => p.token.emoji);
  const available = DEFAULT_ANIMAL_TOKENS.find(t => !usedEmojis.includes(t.emoji)) || DEFAULT_ANIMAL_TOKENS[0];
  player.token = { name: available.name, emoji: available.emoji };
}

// =========================================================
// SOCKET.IO HANDLERS
// =========================================================
io.on('connection', (socket) => {
  console.log(`🔗 User connected: ${socket.id}`);

  // ---- Create Room ----
  socket.on('room:create', (payload, cb) => {
    const name = (payload && payload.name) || `Player ${Math.floor(Math.random() * 9000) + 1000}`;
    const code = generateRoomCode();
    const sessionToken = generateSessionToken();
    const player = {
      id: socket.id,
      sessionToken,
      name,
      isHost: true,
      disconnected: false,
      disconnectTimer: null
    };

    const room = {
      code,
      players: new Map([[socket.id, player]]),
      spectators: new Map(),
      hostId: socket.id,
      game: null,
      started: false,
      socketToPlayer: {},
      settings: {
        doubleRentOnFullGroup: true,
        mortgageInsteadOfSell: true,
        jackpotOnFreeParking: true,
        receiveRentWhileJailed: false,
        auctionMode: false,
        freeBuildOnFullGroup: false,
        boardMode: 'standard',
        crossBoard: false,
        initialMoney: 1500,
        passGoMoney: 200
      }
    };
    assignDefaultToken(room, player);
    rooms.set(code, room);
    socket.join(code);

    if (typeof cb === 'function') cb({ ok: true, roomCode: code, sessionToken, player });

    // Notify the host of the room created
    io.to(socket.id).emit('room:joined', { roomCode: code, isHost: true, sessionToken, player });
    updateLobby(io, code);
  });

  // ---- Join Room (or join as Spectator if in-game) ----
  socket.on('room:join', (payload, cb) => {
    const code = (payload && payload.code || '').trim().toUpperCase();
    const name = (payload && payload.name) || `Player ${Math.floor(Math.random() * 9000) + 1000}`;
    const sessionToken = payload && payload.sessionToken;
    const room = getRoom(code);

    if (!room) {
      if (typeof cb === 'function') cb({ ok: false, error: 'Không tìm thấy phòng. Kiểm tra mã phòng!' });
      return;
    }

    // 1. Check if this is a reconnecting player with matching sessionToken
    if (sessionToken) {
      for (const [oldSocketId, p] of room.players.entries()) {
        if (p.sessionToken === sessionToken) {
          // Reconnect logic
          if (p.disconnectTimer) {
            clearTimeout(p.disconnectTimer);
            p.disconnectTimer = null;
          }
          p.disconnected = false;
          p.disconnectExpiresAt = null;

          room.players.delete(oldSocketId);
          p.id = socket.id;
          room.players.set(socket.id, p);

          if (room.hostId === oldSocketId) room.hostId = socket.id;
          socket.join(code);

          if (room.started && room.game) {
            let pIdx = room.socketToPlayer ? room.socketToPlayer[oldSocketId] : undefined;
            if (pIdx === undefined) {
              pIdx = room.game.state.players.findIndex(gp => gp.name === p.name);
            }
            if (pIdx !== undefined && pIdx >= 0) {
              if (room.socketToPlayer) {
                delete room.socketToPlayer[oldSocketId];
                room.socketToPlayer[socket.id] = pIdx;
              }
              if (room.game.state.players[pIdx]) {
                room.game.state.players[pIdx].socketId = socket.id;
                room.game.state.players[pIdx].disconnected = false;
                room.game.state.players[pIdx].disconnectExpiresAt = null;
              }
            }
            room.game.state.logs.push(`⚡ ${p.name} đã kết nối lại vào ván đấu!`);
            if (typeof cb === 'function') cb({ ok: true, roomCode: code, isHost: p.isHost, index: pIdx, isSpectator: false, sessionToken: p.sessionToken, started: true });
            io.to(socket.id).emit('room:joined', { roomCode: code, isHost: p.isHost, isSpectator: false, sessionToken: p.sessionToken, started: true });
            io.to(socket.id).emit('room:started', { index: pIdx, isSpectator: false });
            broadcastRoomState(code);
          } else {
            if (typeof cb === 'function') cb({ ok: true, roomCode: code, isHost: p.isHost, isSpectator: false, sessionToken: p.sessionToken, started: false });
            io.to(socket.id).emit('room:joined', { roomCode: code, isHost: p.isHost, isSpectator: false, sessionToken: p.sessionToken, started: false });
            updateLobby(io, code);
          }
          return;
        }
      }
    }

    // 2. If room has already started -> Join as Spectator!
    if (room.started) {
      if (!room.spectators) room.spectators = new Map();
      const specToken = sessionToken || generateSessionToken();
      const spectator = { id: socket.id, sessionToken: specToken, name, isSpectator: true };
      room.spectators.set(socket.id, spectator);
      socket.join(code);

      if (typeof cb === 'function') cb({ ok: true, roomCode: code, isSpectator: true, sessionToken: specToken, started: true });
      io.to(socket.id).emit('room:joined', { roomCode: code, isSpectator: true, sessionToken: specToken, started: true });
      io.to(socket.id).emit('room:started', { index: -1, isSpectator: true });

      if (room.game) {
        room.game.state.logs.push(`👁️ Khán giả ${name} đã tham gia theo dõi ván đấu!`);
      }
      broadcastRoomState(code);
      return;
    }

    // 3. Normal pre-game room join
    if (room.players.size >= 8) {
      if (typeof cb === 'function') cb({ ok: false, error: 'Phòng đã đủ 8 người chơi!' });
      return;
    }

    // Tự động phân biệt nếu trùng tên trong phòng (thêm hậu tố 2, 3...)
    let finalPlayerName = name;
    let nameSuffix = 2;
    while ([...room.players.values()].some(p => p.name.toLowerCase() === finalPlayerName.toLowerCase())) {
      finalPlayerName = `${name} (${nameSuffix++})`;
    }

    const newSessionToken = generateSessionToken();
    const player = {
      id: socket.id,
      sessionToken: newSessionToken,
      name: finalPlayerName,
      isHost: false,
      disconnected: false,
      disconnectTimer: null
    };
    assignDefaultToken(room, player);
    room.players.set(socket.id, player);
    socket.join(code);

    if (typeof cb === 'function') cb({ ok: true, roomCode: code, player, sessionToken: newSessionToken, started: false });
    io.to(socket.id).emit('room:joined', { roomCode: code, isHost: false, sessionToken: newSessionToken, started: false, player });
    updateLobby(io, code);
  });

  // ---- Reconnect Endpoint ----
  socket.on('room:reconnect', (payload, cb) => {
    const code = (payload && payload.code || '').trim().toUpperCase();
    const sessionToken = payload && payload.sessionToken;
    const room = getRoom(code);

    if (!room) {
      if (typeof cb === 'function') cb({ ok: false, error: 'Phòng không tồn tại hoặc ván đấu đã kết thúc!' });
      return;
    }

    // Tìm trong players
    for (const [oldSocketId, p] of room.players.entries()) {
      if (p.sessionToken === sessionToken) {
        if (p.disconnectTimer) {
          clearTimeout(p.disconnectTimer);
          p.disconnectTimer = null;
        }
        p.disconnected = false;
        p.disconnectExpiresAt = null;

        room.players.delete(oldSocketId);
        p.id = socket.id;
        room.players.set(socket.id, p);

        if (room.hostId === oldSocketId) room.hostId = socket.id;
        socket.join(code);

        if (room.started && room.game) {
          let pIdx = room.socketToPlayer ? room.socketToPlayer[oldSocketId] : undefined;
          if (pIdx === undefined) {
            pIdx = room.game.state.players.findIndex(gp => gp.name === p.name);
          }
          if (pIdx !== undefined && pIdx >= 0) {
            if (room.socketToPlayer) {
              delete room.socketToPlayer[oldSocketId];
              room.socketToPlayer[socket.id] = pIdx;
            }
            if (room.game.state.players[pIdx]) {
              room.game.state.players[pIdx].socketId = socket.id;
              room.game.state.players[pIdx].disconnected = false;
              room.game.state.players[pIdx].disconnectExpiresAt = null;
            }
          }
          room.game.state.logs.push(`⚡ ${p.name} đã kết nối lại ván đấu!`);
          if (typeof cb === 'function') cb({ ok: true, roomCode: code, isHost: p.isHost, index: pIdx, isSpectator: false, sessionToken: p.sessionToken, started: true });
          io.to(socket.id).emit('room:joined', { roomCode: code, isHost: p.isHost, isSpectator: false, sessionToken: p.sessionToken, started: true });
          io.to(socket.id).emit('room:started', { index: pIdx, isSpectator: false });
          broadcastRoomState(code);
        } else {
          if (typeof cb === 'function') cb({ ok: true, roomCode: code, isHost: p.isHost, isSpectator: false, sessionToken: p.sessionToken, started: false });
          io.to(socket.id).emit('room:joined', { roomCode: code, isHost: p.isHost, isSpectator: false, sessionToken: p.sessionToken, started: false });
          updateLobby(io, code);
        }
        return;
      }
    }

    // Tìm trong spectators
    if (room.spectators) {
      for (const [oldSocketId, spec] of room.spectators.entries()) {
        if (spec.sessionToken === sessionToken) {
          room.spectators.delete(oldSocketId);
          spec.id = socket.id;
          room.spectators.set(socket.id, spec);
          socket.join(code);
          if (typeof cb === 'function') cb({ ok: true, roomCode: code, isSpectator: true, sessionToken, started: room.started });
          io.to(socket.id).emit('room:joined', { roomCode: code, isSpectator: true, sessionToken, started: room.started });
          io.to(socket.id).emit('room:started', { index: -1, isSpectator: true });
          if (room.started) broadcastRoomState(code); else updateLobby(io, code);
          return;
        }
      }
    }

    // Nếu game đang chạy mà không tìm thấy -> cho làm Spectator
    if (room.started && room.game) {
      const name = (payload && payload.name) || `Khán giả ${Math.floor(Math.random() * 900) + 100}`;
      const specToken = sessionToken || generateSessionToken();
      if (!room.spectators) room.spectators = new Map();
      room.spectators.set(socket.id, { id: socket.id, sessionToken: specToken, name, isSpectator: true });
      socket.join(code);
      if (typeof cb === 'function') cb({ ok: true, roomCode: code, isSpectator: true, sessionToken: specToken, started: true });
      io.to(socket.id).emit('room:joined', { roomCode: code, isSpectator: true, sessionToken: specToken, started: true });
      io.to(socket.id).emit('room:started', { index: -1, isSpectator: true });
      broadcastRoomState(code);
      return;
    }

    if (typeof cb === 'function') cb({ ok: false, error: 'Không tìm thấy phiên chơi hợp lệ.' });
  });

  // ---- Update Room Settings ----
  socket.on('room:updateSettings', (payload, cb) => {
    const code = (payload && payload.code || '').trim().toUpperCase();
    const room = getRoom(code);
    if (!room) { if (typeof cb === 'function') cb({ ok: false, error: 'Phòng không tồn tại!' }); return; }
    if (room.started) { if (typeof cb === 'function') cb({ ok: false, error: 'Trò chơi đã bắt đầu!' }); return; }

    const s = (payload && payload.settings) || {};
    ['doubleRentOnFullGroup','mortgageInsteadOfSell','jackpotOnFreeParking','receiveRentWhileJailed','auctionMode','freeBuildOnFullGroup','crossBoard'].forEach(k => {
      if (typeof s[k] === 'boolean') room.settings[k] = s[k];
    });
    if (typeof s.boardMode === 'string') room.settings.boardMode = s.boardMode;
    if (s.crossBoard !== undefined) room.settings.boardMode = s.crossBoard ? 'cross' : 'standard';
    if (typeof s.initialMoney === 'number' && s.initialMoney > 0) room.settings.initialMoney = s.initialMoney;
    if (typeof s.passGoMoney === 'number' && s.passGoMoney >= 0) room.settings.passGoMoney = s.passGoMoney;

    if (typeof cb === 'function') cb({ ok: true, settings: room.settings });
    io.to(code).emit('room:settings', { settings: room.settings });
  });

  // ---- Host opens shared settings screen ----
  socket.on('room:openSettings', (payload, cb) => {
    const code = (payload && payload.code || '').trim().toUpperCase();
    const room = getRoom(code);
    if (!room) { if (typeof cb === 'function') cb({ ok: false, error: 'Phòng không tồn tại!' }); return; }
    if (room.hostId !== socket.id) { if (typeof cb === 'function') cb({ ok: false, error: 'Chỉ chủ phòng mới được mở cài đặt!' }); return; }
    if (room.started) { if (typeof cb === 'function') cb({ ok: false, error: 'Trò chơi đã bắt đầu!' }); return; }

    io.to(code).emit('room:openSettings', { settings: room.settings });
    if (typeof cb === 'function') cb({ ok: true, settings: room.settings });
  });

  // ---- Select Character Token ----
  socket.on('room:selectToken', (payload, cb) => {
    const code = (payload && payload.code || '').trim().toUpperCase();
    const room = getRoom(code);
    if (!room) { if (typeof cb === 'function') cb({ ok: false, error: 'Phòng không tồn tại!' }); return; }
    if (room.started) { if (typeof cb === 'function') cb({ ok: false, error: 'Trò chơi đã bắt đầu!' }); return; }

    const player = room.players.get(socket.id);
    if (!player) { if (typeof cb === 'function') cb({ ok: false, error: 'Bạn không trong phòng!' }); return; }

    const token = (payload && payload.token) || null;
    if (!token || !token.emoji) { if (typeof cb === 'function') cb({ ok: false, error: 'Nhân vật không hợp lệ!' }); return; }

    const taken = [...room.players.values()].some(p => p.id !== socket.id && p.token && p.token.emoji === token.emoji);
    if (taken) { if (typeof cb === 'function') cb({ ok: false, error: 'Nhân vật này đã được chọn!' }); return; }

    player.token = { name: token.name, emoji: token.emoji };
    if (typeof cb === 'function') cb({ ok: true, token: player.token });

    updateLobby(io, code);
  });

  // ---- Leave / Disconnect with 2-minute Reconnect Window ----
  function handleLeave(socket) {
    for (const [code, room] of rooms.entries()) {
      // Spectator rời phòng
      if (room.spectators && room.spectators.has(socket.id)) {
        room.spectators.delete(socket.id);
        socket.leave(code);
        broadcastRoomState(code);
        return;
      }

      if (room.players.has(socket.id)) {
        const player = room.players.get(socket.id);

        // NẾU TRẬN ĐẤU ĐANG DIỄN RA: Cho phép 2 phút (120s) để kết nối lại
        if (room.started && room.game && !room.game.state.gameOver) {
          player.disconnected = true;
          player.disconnectExpiresAt = Date.now() + 120000;
          socket.leave(code);

          let pIdx = room.socketToPlayer ? room.socketToPlayer[socket.id] : undefined;
          if (pIdx === undefined) {
            pIdx = room.game.state.players.findIndex(p => p.name === player.name);
          }
          if (pIdx !== undefined && pIdx >= 0 && room.game.state.players[pIdx]) {
            room.game.state.players[pIdx].disconnected = true;
            room.game.state.players[pIdx].disconnectExpiresAt = player.disconnectExpiresAt;
          }

          room.game.state.logs.push(`🔌 ${player.name} bị mất kết nối! Có 2 phút để vào lại.`);
          broadcastRoomState(code);

          // Đặt bộ đếm 2 phút (120,000ms)
          if (player.disconnectTimer) clearTimeout(player.disconnectTimer);
          player.disconnectTimer = setTimeout(() => {
            if (player.disconnected && room.game && !room.game.state.gameOver) {
              let resolvedIdx = room.socketToPlayer ? room.socketToPlayer[player.id] : undefined;
              if (resolvedIdx === undefined) {
                for (const [sid, pidx] of Object.entries(room.socketToPlayer || {})) {
                  if (room.players.get(sid) === player || sid === player.id) { resolvedIdx = pidx; break; }
                }
              }
              if (resolvedIdx === undefined) {
                resolvedIdx = room.game.state.players.findIndex(p => p.name === player.name);
              }
              const gamePlayer = (resolvedIdx !== undefined && resolvedIdx >= 0) ? room.game.state.players[resolvedIdx] : null;
              if (gamePlayer && !gamePlayer.isBankrupt) {
                room.game.surrender(gamePlayer.id);
                room.game.state.logs.push(`⏰ Hết 2 phút chờ kết nối lại! ${player.name} bị xử thua do vắng mặt.`);
                broadcastRoomState(code);

                if (room.game.state.gameOver) {
                  io.to(code).emit('game:over', {
                    winner: room.game.state.winner,
                    players: room.game.state.players
                  });
                }
              }
            }
          }, 120000);

          return;
        }

        // NẾU CHƯA BẮT ĐẦU HOẶC ĐÃ KẾT THÚC: Rời phòng bình thường
        if (player.disconnectTimer) {
          clearTimeout(player.disconnectTimer);
          player.disconnectTimer = null;
        }
        room.players.delete(socket.id);
        socket.leave(code);

        if (room.players.size === 0 && (!room.spectators || room.spectators.size === 0)) {
          rooms.delete(code);
          return;
        }

        if (room.hostId === socket.id && room.players.size > 0) {
          const nextHost = [...room.players.keys()][0];
          room.hostId = nextHost;
          const hostPlayer = room.players.get(nextHost);
          if (hostPlayer) hostPlayer.isHost = true;
          io.to(nextHost).emit('room:host', { isHost: true });
        }

        updateLobby(io, code);
        return;
      }
    }
  }

  socket.on('disconnect', () => handleLeave(socket));
  socket.on('room:leave', () => handleLeave(socket));

  // ---- Start Game (host only) ----
  socket.on('game:start', (payload, cb) => {
    const code = (payload && payload.code || '').trim().toUpperCase();
    const room = getRoom(code);
    if (!room) { if (typeof cb === 'function') cb({ ok: false, error: 'Phòng không tồn tại!' }); return; }
    if (room.hostId !== socket.id) { if (typeof cb === 'function') cb({ ok: false, error: 'Chỉ chủ phòng mới có thể bắt đầu!' }); return; }
    if (room.players.size < 2) { if (typeof cb === 'function') cb({ ok: false, error: 'Cần ít nhất 2 người chơi mới có thể bắt đầu!' }); return; }

    const playerList = [...room.players.values()];
    // Đảm bảo mỗi người chơi đều có nhân vật con vật hợp lệ
    playerList.forEach((p, i) => {
      if (!p.token || !p.token.emoji) {
        assignDefaultToken(room, p);
      }
    });

    // Apply settings from host / any player (already stored on room.settings)
    const settings = (payload && payload.settings) || room.settings || {};
    room.settings = settings;
    const game = createGame({ players: playerList, settings });

    room.game = game;
    room.started = true;

    // Map socket ids to randomized player indices
    room.socketToPlayer = {};
    game.state.players.forEach((gp, idx) => {
      if (gp.socketId) {
        room.socketToPlayer[gp.socketId] = idx;
      }
    });

    // Gửi cho mỗi client biết index của họ trong trận
    [...room.players.values()].forEach((p) => {
      const myIdx = room.socketToPlayer[p.id] !== undefined ? room.socketToPlayer[p.id] : 0;
      io.to(p.id).emit('room:started', { index: myIdx, isSpectator: false });
    });

    // Thông báo cho spectators
    if (room.spectators) {
      [...room.spectators.values()].forEach((spec) => {
        io.to(spec.id).emit('room:started', { index: -1, isSpectator: true });
      });
    }

    if (typeof cb === 'function') cb({ ok: true });
    broadcastRoomState(code);
  });

  // ---- Restart Game (Chơi lại ván mới hoặc về sảnh chờ) ----
  socket.on('game:restart', (payload, cb) => {
    const code = (payload && payload.code || '').trim().toUpperCase();
    const restartMode = (payload && payload.mode) || 'lobby'; // 'lobby' | 'instant'
    const room = getRoom(code);

    if (!room) { if (typeof cb === 'function') cb({ ok: false, error: 'Phòng không tồn tại!' }); return; }

    // Xóa mọi timer disconnect và timer đấu giá của phòng
    if (room.auctionTimer) {
      clearTimeout(room.auctionTimer);
      room.auctionTimer = null;
    }
    for (const p of room.players.values()) {
      if (p.disconnectTimer) {
        clearTimeout(p.disconnectTimer);
        p.disconnectTimer = null;
      }
      p.disconnected = false;
      p.disconnectExpiresAt = null;
    }

    // Chuyển tất cả spectators vào danh sách người chơi nếu còn chỗ
    if (room.spectators && room.spectators.size > 0) {
      for (const [specId, spec] of room.spectators.entries()) {
        if (room.players.size < 8 && !room.players.has(specId)) {
          const newPlayer = {
            id: specId,
            sessionToken: spec.sessionToken || generateSessionToken(),
            name: spec.name,
            isHost: false,
            disconnected: false,
            disconnectTimer: null
          };
          assignDefaultToken(room, newPlayer);
          room.players.set(specId, newPlayer);
          io.to(specId).emit('room:joined', { roomCode: code, isHost: false, isSpectator: false, sessionToken: newPlayer.sessionToken, player: newPlayer });
        }
      }
      room.spectators.clear();
    }

    if (restartMode === 'instant' && room.players.size >= 2) {
      const playerList = [...room.players.values()];
      playerList.forEach((p) => {
        if (!p.token || !p.token.emoji) assignDefaultToken(room, p);
      });

      const game = createGame({ players: playerList, settings: room.settings });

      room.game = game;
      room.started = true;
      room.socketToPlayer = {};
      game.state.players.forEach((gp, idx) => {
        if (gp.socketId) room.socketToPlayer[gp.socketId] = idx;
      });

      [...room.players.values()].forEach((p) => {
        const myIdx = room.socketToPlayer[p.id] !== undefined ? room.socketToPlayer[p.id] : 0;
        io.to(p.id).emit('room:started', { index: myIdx, isSpectator: false });
      });

      if (typeof cb === 'function') cb({ ok: true, mode: 'instant' });
      broadcastRoomState(code);
    } else {
      // Về sảnh chờ
      room.started = false;
      room.game = null;
      room.socketToPlayer = {};

      io.to(code).emit('room:resetToLobby', { roomCode: code });
      updateLobby(io, code);
      if (typeof cb === 'function') cb({ ok: true, mode: 'lobby' });
    }
  });

  // ---- Game Action from a player ----
  socket.on('game:action', (payload, cb) => {
    const code = (payload && payload.code || '').trim().toUpperCase();
    const room = getRoom(code);
    if (!room || !room.game) { if (typeof cb === 'function') cb({ ok: false, error: 'Trò chơi chưa bắt đầu!' }); return; }

    // Chặn hành động nếu là Spectator
    if (room.spectators && room.spectators.has(socket.id)) {
      if (typeof cb === 'function') cb({ ok: false, error: 'Khán giả không thể thực hiện hành động trong trận!' });
      return;
    }

    const playerIdx = room.socketToPlayer ? room.socketToPlayer[socket.id] : undefined;
    if (playerIdx === undefined) { if (typeof cb === 'function') cb({ ok: false, error: 'Bạn không trong trận!' }); return; }

    // Chặn hành động khi game đã kết thúc
    if (room.game.state.gameOver) {
      if (typeof cb === 'function') cb({ ok: false, error: 'Ván đấu đã kết thúc!' });
      return;
    }

    const action = payload && payload.action;
    const result = applyAction(room.game, playerIdx, action);

    manageRoomAuctionTimer(room, code);
    broadcastRoomState(code);

    // Nếu game vừa kết thúc sau action này -> broadcast game:over
    if (room.game.state.gameOver) {
      io.to(code).emit('game:over', {
        winner: room.game.state.winner,
        players: room.game.state.players
      });
    }

    if (typeof cb === 'function') cb({ ok: !!result, result });
    else io.to(socket.id).emit('game:action:result', { ok: !!result, result });
  });

  // ---- Chat ----
  socket.on('chat:message', (payload) => {
    const code = (payload && payload.code || '').trim().toUpperCase();
    const room = getRoom(code);
    if (!room) return;

    let senderName = 'Ẩn danh';
    let isSpec = false;

    if (room.players.has(socket.id)) {
      senderName = room.players.get(socket.id).name;
    } else if (room.spectators && room.spectators.has(socket.id)) {
      senderName = room.spectators.get(socket.id).name;
      isSpec = true;
    } else {
      return;
    }

    const text = String((payload && payload.text) || '').trim().slice(0, 500);
    if (!text) return;
    io.to(code).emit('chat:message', {
      from: isSpec ? `[Khán giả] ${senderName}` : senderName,
      text,
      ts: Date.now()
    });
  });
});

// =========================================================
// LOBBY UPDATES
// =========================================================
function updateLobby(io, roomCode) {
  const room = getRoom(roomCode);
  if (!room) return;
  const players = [...room.players.values()].map(p => ({ id: p.id, name: p.name, isHost: p.isHost, token: p.token || null }));
  io.to(roomCode).emit('lobby:update', {
    roomCode,
    players,
    hostId: room.hostId,
    started: room.started,
    settings: room.settings
  });
}

// =========================================================
// AUTO PORT FALLBACK – tự tìm cổng trống nếu 3000 bị chiếm
// =========================================================
function startServer(port, maxTries = 10) {
  server.removeAllListeners('listening');
  server.removeAllListeners('error');

  server.once('listening', () => {
    const addr = server.address();
    console.log(`\n🚀 Cờ Tỉ Phú Nhà Làm server đang chạy!`);
    console.log(`   Local:  http://localhost:${addr.port}`);
    console.log(`   Mở trình duyệt rồi vào địa chỉ trên để chơi!\n`);
  });

  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      if (maxTries > 0) {
        console.warn(`⚠️  Cổng ${port} đang bị chiếm – thử cổng ${port + 1}...`);
        startServer(port + 1, maxTries - 1);
      } else {
        console.error('❌ Không tìm được cổng trống. Hãy tắt các tiến trình node đang chạy rồi thử lại.');
        process.exit(1);
      }
    } else {
      throw err;
    }
  });

  server.listen(port);
}

startServer(Number(process.env.PORT) || 3000);


