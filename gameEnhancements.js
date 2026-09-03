/**
 * GAME ENHANCEMENTS - Advanced Logic & UI Rendering
 * Weather System | Turn Counters | Card Effects | Visual Effects
 */

window.GameEnhancements = {
  /**
   * =========================================================
   * FUNCTION 1: updateTurnCounters(gameState)
   * Quản lý đếm ngược cho thời tiết và các hiệu ứng ô đất
   * =========================================================
   */
  updateTurnCounters(gameState = window.GameCore?.state || {}) {
    // Giảm số lượt thời tiết
    if (gameState.weatherTurns && gameState.weatherTurns > 0) {
      gameState.weatherTurns -= 1;
    }

    // Reset thời tiết về CLEAR khi hết lượt
    if (gameState.weatherTurns <= 0) {
      gameState.weather = 'CLEAR';
      gameState.canBuild = true;
      gameState.weatherTurns = 0;
      gameState.weatherMoveBonus = 0;
      if (window.GameEnhancements.showEffectToast) {
        window.GameEnhancements.showEffectToast('🌤️ Thời tiết quay về bình thường!', 'success');
      }
    }

    // Duyệt tất cả ô đất để giảm đếm ngược các hiệu ứng
    if (Array.isArray(gameState.board)) {
      gameState.board.forEach(tile => {
        // Giảm frozenTurns (ô bị đóng băng)
        if (tile.frozenTurns && tile.frozenTurns > 0) {
          tile.frozenTurns -= 1;
          if (tile.frozenTurns <= 0) {
            delete tile.frozenTurns;
            if (window.GameEnhancements.showEffectToast) {
              window.GameEnhancements.showEffectToast(`❄️ ${tile.name} hết hiệu ứng đóng băng!`, 'success');
            }
          }
        }

        // Giảm protectedTurns (ô được bảo vệ)
        if (tile.protectedTurns && tile.protectedTurns > 0) {
          tile.protectedTurns -= 1;
          if (tile.protectedTurns <= 0) {
            delete tile.protectedTurns;
            if (window.GameEnhancements.showEffectToast) {
              window.GameEnhancements.showEffectToast(`🛡️ ${tile.name} mất khiên bảo vệ!`, 'warning');
            }
          }
        }

        // Giảm boostTurns (ô có tăng giá thuê)
        if (tile.boostTurns && tile.boostTurns > 0) {
          tile.boostTurns -= 1;
          if (tile.boostTurns <= 0) {
            delete tile.boostTurns;
            if (window.GameEnhancements.showEffectToast) {
              window.GameEnhancements.showEffectToast(`🔥 ${tile.name} hết hiệu ứng tăng thuê!`, 'warning');
            }
          }
        }
      });
    }

    return gameState;
  },

  /**
   * =========================================================
   * FUNCTION 2: triggerWeatherEffect(gameState)
   * Kích hoạt hiệu ứng thời tiết ngẫu nhiên
   * =========================================================
   */
  triggerWeatherEffect(gameState = window.GameCore?.state || {}) {
    const weatherEffects = [
      {
        weather: 'FLOOD',
        emoji: '🌧️',
        name: 'Mưa Ngập',
        turns: 3,
        canBuild: true,
        rentMultiplier: 0.7,
        description: '🌊 Đường phố ngập lụt, di chuyển khó khăn.',
        effects: [
          'Lùi 1 ô',
          'Vẫn được xây nhà'
        ]
      },
      {
        weather: 'HEATWAVE',
        emoji: '☀️',
        name: 'Nắng Nóng',
        turns: 3,
        canBuild: true,
        rentMultiplier: 1.5,
        description: '🔥 Nắng nóng, chủ đất hưởng lợi.',
        effects: [
          'Chủ đất lời hơn',
          'Vẫn được xây nhà'
        ]
      },
      {
        weather: 'STORM',
        emoji: '🌪️',
        name: 'Bão Lớn',
        turns: 2,
        canBuild: false,
        rentMultiplier: 1.0,
        description: '⛈️ Bão lớn làm hư hại công trình trên toàn bàn.',
        effects: [
          'Hạ 1 cấp mọi ô có nhà',
          'Cấm xây trong 2 lượt'
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

    // Không chọn lại trạng thái đang kích hoạt
    const availableEffects = weatherEffects.filter(effect => effect.weather !== gameState.weather);
    const effect = availableEffects[Math.floor(Math.random() * availableEffects.length)];

    // Cập nhật game state
    gameState.weather = effect.weather;
    gameState.weatherTurns = effect.turns;
    gameState.canBuild = effect.canBuild;
    gameState.weatherRentMultiplier = effect.rentMultiplier;
    gameState.weatherMoveBonus = effect.moveBonus || 0;
    gameState.weatherName = effect.name;
    gameState.weatherEmoji = effect.emoji;

    if (effect.weather === 'STORM' && Array.isArray(gameState.board)) {
      gameState.board.forEach(tile => {
        if (tile.type === 'PROPERTY' && tile.houses > 0) tile.houses -= 1;
      });
      window.GameCore?.addLog?.('🌪️ Bão Lớn hạ 1 cấp nhà trên mọi ô đất đang có nhà.');
    }

    // Ghi log
    if (window.GameCore?.addLog) {
      const effectsSummary = effect.effects?.join('\n') || '';
      window.GameCore.addLog(
        `${effect.emoji} **Thời tiết đổi thành: ${effect.name}**\n` +
        `${effect.description}\n\n` +
        `📋 **Các hiệu ứng:**\n` +
        effectsSummary +
        `\n⏱️ Kéo dài **${effect.turns} lượt**`
      );
    }

    // Hiển thị toast thông báo
    gameState.pendingWeatherNotification = {
      emoji: effect.emoji,
      name: effect.name,
      turns: effect.turns,
      weather: effect.weather
    };

    // Hiển thị tóm tắt thời tiết
    if (window.GameEnhancements.showWeatherSummary) {
      window.GameEnhancements.showWeatherSummary(effect);
    }

    // Render UI
    window.GameEnhancements.renderWeatherUI(gameState);

    return effect;
  },

  playWeatherSound(weather) {
    if (typeof window === 'undefined' || !window.AudioContext && !window.webkitAudioContext) return;
    try {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      const context = window.GameEnhancements._audioContext || new AudioCtor();
      window.GameEnhancements._audioContext = context;
      if (context.state === 'suspended') context.resume().catch(() => {});
      const patterns = {
        FLOOD: [220, 165, 110],
        HEATWAVE: [440, 554, 659],
        STORM: [130, 98, 73],
        LIGHT_WIND: [392, 494, 587]
      };
      (patterns[weather] || [330, 440]).forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = weather === 'STORM' ? 'sawtooth' : 'sine';
        oscillator.frequency.value = frequency;
        const start = context.currentTime + index * 0.09;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.055, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(start);
        oscillator.stop(start + 0.18);
      });
    } catch (error) {
      // Audio is optional and may be unavailable in restricted browsers.
    }
  },

  triggerCenterImpact(message) {
    const board = document.querySelector('#board');
    const centerTile = document.querySelector('#tile-44');
    board?.classList.remove('center-impact');
    centerTile?.classList.remove('center-tile-impact');
    requestAnimationFrame(() => {
      board?.classList.add('center-impact');
      centerTile?.classList.add('center-tile-impact');
    });
    if (navigator.vibrate) navigator.vibrate([45, 35, 70]);
    this.showEffectToast(message || '✨ Buff ô trung tâm đã kích hoạt!', 'success');
    this.playWeatherSound('LIGHT_WIND');
  },

  /**
   * =========================================================
   * FUNCTION 3: calculateRent(tile, owner, gameState)
   * Tính tiền thuê với các hiệu ứng (frozen, protected, boosted, weather)
   * =========================================================
   */
  calculateRent(tile, owner, gameState = window.GameCore?.state || {}) {
    // Nếu ô bị đóng băng, không thu tiền thuê
    if (tile.frozenTurns && tile.frozenTurns > 0) {
      console.log(`❄️ [FROZEN] ${tile.name} bị đóng băng, không thu tiền thuê!`);
      return 0;
    }

    // Nếu ô được bảo vệ, không thu tiền thuê
    if (tile.protectedTurns && tile.protectedTurns > 0) {
      console.log(`🛡️ [PROTECTED] ${tile.name} được bảo vệ, không thu tiền thuê!`);
      return 0;
    }

    let rent = 0;

    // === Tính tiền cơ bản ===
    if (tile.type === 'RAILROAD') {
      // Bến xe: 25, 50, 100, 200 tùy số sở hữu
      const ownedRailroads = gameState.board
        ? gameState.board.filter(t => t.type === 'RAILROAD' && t.owner === owner.id).length
        : 1;
      rent = [0, 25, 50, 100, 200][ownedRailroads] || 0;
    } else if (tile.type === 'UTILITY') {
      // Tiện ích: nhân (4 hoặc 10) với giá xúc xắc
      const ownedUtilities = gameState.board
        ? gameState.board.filter(t => t.type === 'UTILITY' && t.owner === owner.id).length
        : 1;
      const diceMultiplier = gameState.lastRoll || 7;
      rent = ownedUtilities === 2 ? diceMultiplier * 10 : diceMultiplier * 4;
    } else {
      // BĐS thường: lấy từ mảng rent dựa số nhà
      const rents = tile.rent || [Math.round((tile.price || 100) * 0.1)];
      rent = rents[tile.houses || 0] || rents[0] || 0;

      // Nhân đôi nếu sở hữu trọn nhóm màu
      if (gameState.settings?.doubleRentOnFullGroup && !tile.houses) {
        const groupTiles = gameState.board
          ? gameState.board.filter(t => t.group === tile.group)
          : [];
        if (groupTiles.length > 0 && groupTiles.every(t => t.owner === owner.id && !t.mortgaged)) {
          rent *= 2;
        }
      }
    }

    // === Áp dụng hiệu ứng tăng giá thuê (boostTurns) ===
    if (tile.boostTurns && tile.boostTurns > 0) {
      rent = Math.round(rent * 1.5);
      console.log(`🔥 [BOOSTED] ${tile.name} tăng 1.5x tiền thuê: $${rent}`);
    }

    // === Áp dụng hiệu ứng thời tiết ===
    if (gameState.weatherRentMultiplier && gameState.weatherRentMultiplier !== 1.0) {
      rent = Math.round(rent * gameState.weatherRentMultiplier);
      console.log(`🌤️ [WEATHER: ${gameState.weatherName}] ${tile.name} áp dụng nhân tử thời tiết: $${rent}`);
    }

    return Math.max(rent, 0);
  },

  /**
   * =========================================================
   * FUNCTION 4: applyCardEffect(player, card, gameState)
   * Áp dụng hiệu ứng thẻ can thiệp đất
   * =========================================================
   */
  applyCardEffect(player, card, gameState = window.GameCore?.state || {}) {
    if (!card || !card.action) {
      console.warn('⚠️ Card không hợp lệ:', card);
      return false;
    }

    const action = card.action;
    const board = gameState.board || [];
    const otherPlayers = gameState.players?.filter(p => p.id !== player.id && !p.isBankrupt) || [];

    switch (action) {
      // === FREEZE_ENEMY_TILE: Đóng băng ô đất đắt nhất của đối thủ ===
      case 'FREEZE_ENEMY_TILE': {
        if (otherPlayers.length === 0) {
          window.GameEnhancements.showEffectToast('❌ Không có đối thủ để đóng băng!', 'danger');
          return false;
        }

        // Tìm ô đất đắt nhất của đối thủ giàu nhất
        const richestOpponent = otherPlayers.reduce((a, b) => a.money > b.money ? a : b);
        const opponentTiles = board.filter(t => t.owner === richestOpponent.id && t.type === 'PROPERTY');
        const mostExpensiveTile = opponentTiles.reduce((a, b) => (a.price || 0) > (b.price || 0) ? a : b, null);

        if (mostExpensiveTile) {
          mostExpensiveTile.frozenTurns = 2;
          window.GameEnhancements.showEffectToast(
            `❄️ ${mostExpensiveTile.name} của ${richestOpponent.name} bị đóng băng 2 lượt!`,
            'success'
          );
          if (window.GameCore?.addLog) {
            window.GameCore.addLog(
              `❄️ **${player.name}** đã đóng băng **${mostExpensiveTile.name}** của ${richestOpponent.name} (2 lượt)`
            );
          }
          return true;
        }
        break;
      }

      // === PROTECT_MY_LAND: Bảo vệ ô đất của mình ===
      case 'PROTECT_MY_LAND': {
        const playerTiles = board.filter(t => t.owner === player.id && t.type === 'PROPERTY');
        if (playerTiles.length === 0) {
          window.GameEnhancements.showEffectToast('❌ Bạn không có ô đất nào!', 'danger');
          return false;
        }

        // Chọn ô đắt nhất
        const mostExpensiveTile = playerTiles.reduce((a, b) => (a.price || 0) > (b.price || 0) ? a : b);
        mostExpensiveTile.protectedTurns = 2;
        window.GameEnhancements.showEffectToast(
          `🛡️ ${mostExpensiveTile.name} của bạn được bảo vệ 2 lượt!`,
          'success'
        );
        if (window.GameCore?.addLog) {
          window.GameCore.addLog(`🛡️ **${player.name}** đã bảo vệ **${mostExpensiveTile.name}** (2 lượt)`);
        }
        return true;
      }

      // === BOOST_RENT_TEMP: Tăng giá thuê tạm thời ===
      case 'BOOST_RENT_TEMP': {
        const playerTiles = board.filter(t => t.owner === player.id && t.type === 'PROPERTY');
        if (playerTiles.length === 0) {
          window.GameEnhancements.showEffectToast('❌ Bạn không có ô đất nào!', 'danger');
          return false;
        }

        const mostExpensiveTile = playerTiles.reduce((a, b) => (a.price || 0) > (b.price || 0) ? a : b);
        mostExpensiveTile.boostTurns = 2;
        window.GameEnhancements.showEffectToast(
          `🔥 Giá thuê ${mostExpensiveTile.name} tăng 1.5x trong 2 lượt!`,
          'success'
        );
        if (window.GameCore?.addLog) {
          window.GameCore.addLog(`🔥 **${player.name}** đã tăng giá thuê **${mostExpensiveTile.name}** (2 lượt, x1.5)`);
        }
        return true;
      }

      // === UPGRADE_MY_TILE: Nâng cấp miễn phí ===
      case 'UPGRADE_MY_TILE': {
        const playerTiles = board.filter(t => t.owner === player.id && t.type === 'PROPERTY' && !t.mortgaged);
        if (playerTiles.length === 0) {
          window.GameEnhancements.showEffectToast('❌ Bạn không có ô đất nào để nâng cấp!', 'danger');
          return false;
        }

        // Chọn ô rẻ nhất
        const cheapestTile = playerTiles.reduce((a, b) => (a.price || 0) < (b.price || 0) ? a : b);
        const maxHouses = 5; // House levels 0-5 (hotel = 5)
        if (cheapestTile.houses === undefined) cheapestTile.houses = 0;

        if (cheapestTile.houses < maxHouses) {
          cheapestTile.houses += 1;
          window.GameEnhancements.showEffectToast(
            `🏠 ${cheapestTile.name} nâng cấp lên level ${cheapestTile.houses}!`,
            'success'
          );
          if (window.GameCore?.addLog) {
            window.GameCore.addLog(
              `🏠 **${player.name}** nâng cấp miễn phí **${cheapestTile.name}** lên level ${cheapestTile.houses}`
            );
          }
          return true;
        } else {
          window.GameEnhancements.showEffectToast('⚠️ Ô đất đã ở mức tối đa!', 'warning');
          return false;
        }
      }

      // === DEMOLISH_ENEMY_HOUSE: Phá nhà đối thủ ===
      case 'DEMOLISH_ENEMY_HOUSE': {
        if (otherPlayers.length === 0) {
          window.GameEnhancements.showEffectToast('❌ Không có đối thủ để phá nhà!', 'danger');
          return false;
        }

        const richestOpponent = otherPlayers.reduce((a, b) => a.money > b.money ? a : b);
        const opponentTiles = board.filter(t => t.owner === richestOpponent.id && t.type === 'PROPERTY' && t.houses > 0);

        if (opponentTiles.length === 0) {
          window.GameEnhancements.showEffectToast('❌ Đối thủ không có nhà để phá!', 'danger');
          return false;
        }

        const mostExpensiveTile = opponentTiles.reduce((a, b) => (a.price || 0) > (b.price || 0) ? a : b);
        const oldLevel = mostExpensiveTile.houses;
        mostExpensiveTile.houses = Math.max(0, mostExpensiveTile.houses - 1);

        window.GameEnhancements.showEffectToast(
          `📉 Phá nhà tại ${mostExpensiveTile.name} của ${richestOpponent.name}!`,
          'success'
        );
        if (window.GameCore?.addLog) {
          window.GameCore.addLog(
            `📉 **${player.name}** đã phá nhà tại **${mostExpensiveTile.name}** của ${richestOpponent.name} (level ${oldLevel} → ${mostExpensiveTile.houses})`
          );
        }
        return true;
      }

      default:
        console.warn(`⚠️ Card action không được hỗ trợ: ${action}`);
        return false;
    }

    return false;
  },

  /**
   * =========================================================
   * FUNCTION 5: renderWeatherUI(gameState)
   * Hiển thị banner thời tiết và overlay tint
   * =========================================================
   */
  renderWeatherUI(gameState = window.GameCore?.state || {}) {
    // Tạo hoặc lấy container overlay
    let overlay = document.querySelector('.weather-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'weather-overlay';
      document.body.appendChild(overlay);
    }

    // Cập nhật class overlay dựa trên thời tiết
    overlay.className = 'weather-overlay';
    if (gameState.weather && gameState.weather !== 'CLEAR') {
      overlay.classList.add(`weather-${gameState.weather.toLowerCase()}`);
    }

    // Tạo hoặc lấy banner
    const boardElement = document.querySelector('#board');
    let banner = document.querySelector('.weather-board-status');
    if (!banner) {
      banner = document.createElement('div');
      banner.className = 'weather-banner weather-board-status';
      (boardElement || document.body).appendChild(banner);
    }

    // Cập nhật nội dung banner
    if (gameState.weather && gameState.weather !== 'CLEAR') {
      banner.innerHTML = `
        <div class="weather-banner-icon">${gameState.weatherEmoji || '🌤️'}</div>
        <div class="weather-banner-text">
          <div class="weather-banner-name">${gameState.weatherName || 'Bình thường'}</div>
          <div class="weather-banner-turns">⏱️ ${gameState.weatherTurns || 0} lượt</div>
        </div>
      `;
      banner.style.display = 'flex';
    } else {
      banner.style.display = 'none';
    }
  },

  /**
   * =========================================================
   * FUNCTION 5B: showWeatherSummary(weatherEffect)
   * Hiển thị popup tóm tắt thời tiết chi tiết
   * =========================================================
   */
  showWeatherSummary(weatherEffect) {
    if (!weatherEffect) return;

    // Tạo container modal nếu chưa có
    let modal = document.querySelector('.weather-summary-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'weather-summary-modal';
      document.body.appendChild(modal);
    }

    // Tạo nội dung tóm tắt
    const effectsList = weatherEffect.effects
      ?.map(effect => `<li class="summary-effect-item">${effect}</li>`)
      .join('') || '';

    modal.innerHTML = `
      <div class="weather-summary-content weather-summary-${weatherEffect.weather.toLowerCase()}">
        <div class="summary-close-btn">&times;</div>
        <div class="summary-header">
          <div class="summary-icon">${weatherEffect.emoji}</div>
          <div class="summary-title">${weatherEffect.name}</div>
        </div>

        <div class="summary-description">
          ${weatherEffect.description}
        </div>

        <div class="summary-section">
          <h4 class="summary-subtitle">📋 Các Hiệu Ứng:</h4>
          <ul class="summary-effects-list">
            ${effectsList}
          </ul>
        </div>

        <div class="summary-duration">
          <span class="duration-icon">⏱️</span>
          <span class="duration-text">Kéo dài <strong>${weatherEffect.turns} lượt</strong></span>
        </div>

        <div class="summary-footer">
          <button class="summary-close-button">Đã Hiểu</button>
        </div>
      </div>
    `;

    // Hiển thị modal với animation
    modal.classList.add('show');
    modal.style.display = 'flex';

    // Xử lý đóng modal
    const closeBtn = modal.querySelector('.summary-close-btn');
    const closeButton = modal.querySelector('.summary-close-button');

    const closeModal = () => {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.style.display = 'none';
      }, 300);
    };

    closeBtn.addEventListener('click', closeModal);
    closeButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Tự động đóng sau 8 giây
    setTimeout(closeModal, 8000);
  },

  /**
   * =========================================================
   * FUNCTION 6: renderTileStatus(tileElement, tileData)
   * Render badges và hiệu ứng visual cho ô đất
   * =========================================================
   */
  renderTileStatus(tileElement, tileData) {
    if (!tileElement || !tileData) return;

    // Xóa các class hiệu ứng cũ
    tileElement.classList.remove('tile-frozen', 'tile-protected', 'tile-boosted');

    // Xóa badges cũ
    const oldBadges = tileElement.querySelectorAll('.tile-turns-badge');
    oldBadges.forEach(badge => badge.remove());

    // === Nếu ô bị đóng băng ===
    if (tileData.frozenTurns && tileData.frozenTurns > 0) {
      tileElement.classList.add('tile-frozen');

      const badge = document.createElement('div');
      badge.className = 'tile-turns-badge';
      badge.textContent = tileData.frozenTurns;
      badge.style.borderColor = 'rgba(0, 210, 255, 0.8)';
      badge.style.backgroundColor = 'rgba(0, 100, 150, 0.8)';
      tileElement.appendChild(badge);
    }

    // === Nếu ô được bảo vệ ===
    if (tileData.protectedTurns && tileData.protectedTurns > 0) {
      tileElement.classList.add('tile-protected');

      const badge = document.createElement('div');
      badge.className = 'tile-turns-badge';
      badge.textContent = tileData.protectedTurns;
      badge.style.borderColor = 'rgba(255, 215, 0, 0.8)';
      badge.style.backgroundColor = 'rgba(184, 134, 11, 0.8)';
      tileElement.appendChild(badge);
    }

    // === Nếu ô có tăng giá thuê ===
    if (tileData.boostTurns && tileData.boostTurns > 0) {
      tileElement.classList.add('tile-boosted');

      const badge = document.createElement('div');
      badge.className = 'tile-turns-badge';
      badge.textContent = tileData.boostTurns;
      badge.style.borderColor = 'rgba(255, 69, 0, 0.8)';
      badge.style.backgroundColor = 'rgba(139, 35, 0, 0.8)';
      tileElement.appendChild(badge);
    }
  },

  /**
   * =========================================================
   * FUNCTION 7: showEffectToast(message, type)
   * Hiển thị thông báo popup hiệu ứng nổi ở giữa màn hình
   * =========================================================
   */
  showEffectToast(message, type = 'info') {
    // Tạo container nếu chưa có
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    // Tạo toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    if (message.includes('đã chặn đứng đòn tấn công')) toast.classList.add('shield-block-toast');

    // Chọn icon dựa trên loại toast
    let icon = '📢';
    if (type === 'success') icon = '✅';
    else if (type === 'warning') icon = '⚠️';
    else if (type === 'danger') icon = '❌';
    else if (message.includes('❄️')) icon = '❄️';
    else if (message.includes('🛡️')) icon = '🛡️';
    else if (message.includes('🔥')) icon = '🔥';
    else if (message.includes('🌧️') || message.includes('☀️') || message.includes('🌪️')) {
      icon = message.split(' ')[0];
    }

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-message">
        <div class="toast-title">${message}</div>
      </div>
    `;

    container.appendChild(toast);

    // Tự động xóa sau 3 giây
    setTimeout(() => {
      toast.classList.add('toast-disappear');
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  },

  /**
   * =========================================================
   * HELPER: updateAllTilesUI(gameState)
   * Cập nhật UI cho tất cả ô đất trên bàn cờ
   * =========================================================
   */
  updateAllTilesUI(gameState = window.GameCore?.state || {}) {
    const boardElement = document.querySelector('#board');
    if (!boardElement) return;

    const tileElements = boardElement.querySelectorAll('[data-tile-index]');
    tileElements.forEach(elem => {
      const index = parseInt(elem.getAttribute('data-tile-index'), 10);
      const tile = gameState.board?.[index];
      if (tile) {
        window.GameEnhancements.renderTileStatus(elem, tile);
      }
    });
  },

  /**
   * =========================================================
   * HELPER: applyGameState(gameState)
   * Tổng hợp cập nhật UI khi thay đổi game state
   * =========================================================
   */
  applyGameState(gameState = window.GameCore?.state || {}) {
    // Cập nhật thời tiết
    window.GameEnhancements.renderWeatherUI(gameState);

    // Cập nhật tất cả ô đất
    window.GameEnhancements.updateAllTilesUI(gameState);

    // Cập nhật trạng thái người chơi (shield, frozen)
    if (Array.isArray(gameState.players)) {
      gameState.players.forEach(player => {
        const playerAvatarElem = document.querySelector(`[data-player-id="${player.id}"]`);
        if (playerAvatarElem) {
          const hasCenterBuff = window.GameCore?.isCenterBuffActive?.(player) || false;
          playerAvatarElem.classList.remove('has-shield', 'shield-aura', 'center-buff-aura', 'is-frozen');
          if (hasCenterBuff) playerAvatarElem.classList.add('center-buff-aura');
          if ((Number(player.shieldCharges) || 0) > 0) playerAvatarElem.classList.add('has-shield', 'shield-aura');
          if (player.inJail && player.jailTurns > 0) playerAvatarElem.classList.add('is-frozen');
        }
      });
    }
  },

  /**
   * =========================================================
   * INITIALIZATION: Gắn CSS vào document
   * =========================================================
   */
  initializeCSS() {
    // Kiểm tra xem CSS đã được load chưa
    const existingLink = document.querySelector('link[href*="gameEnhancements.css"]');
    if (existingLink) return;

    // Thêm link CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'gameEnhancements.css';
    document.head.appendChild(link);
  }
};

// Auto-initialize CSS khi script được load
if (typeof document !== 'undefined' && document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.GameEnhancements.initializeCSS();
  });
} else if (typeof document !== 'undefined') {
  window.GameEnhancements.initializeCSS();
}
