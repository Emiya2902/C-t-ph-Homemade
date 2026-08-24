/* GACHA CARD SHOP - 26 cards, one refresh per shop visit */
(function () {
  const rarityWeights = { COMMON: 45, UNCOMMON: 30, EPIC: 20, LEGENDARY: 5 };
  const rarityNames = { COMMON: 'COMMON', UNCOMMON: 'UNCOMMON', EPIC: 'EPIC', LEGENDARY: 'LEGENDARY' };
  const catalog = [
    { id: 'WALK_BOOST', rarity: 'COMMON', price: 25, title: '👟 Bước nhanh', text: 'Tiến thêm 2 bước.' },
    { id: 'SLAP_BACK', rarity: 'COMMON', price: 30, requireTarget: true, title: '🎯 Đẩy lùi', text: 'Đẩy một đối thủ lùi 2 bước.' },
    { id: 'FREEZE_ONE_TURN', rarity: 'COMMON', price: 40, requireTarget: true, title: '🎯 Khóa lượt', text: 'Đối thủ mất 1 lượt gieo xúc xắc.' },
    { id: 'CHEAP_REPAIR', rarity: 'COMMON', price: 20, title: '🔧 Sửa rẻ', text: 'Bảo dưỡng 1 ô đất với giá $20.' },
    { id: 'BUS_TICKET', rarity: 'COMMON', price: 35, title: '🚌 Vé xe buýt', text: 'Nhảy đến trạm gần nhất.' },
    { id: 'FREE_PARKING', rarity: 'COMMON', price: 30, title: '🅿️ Vé miễn phạt', text: 'Miễn tiền phạt/đỗ xe ở lượt tiếp theo.' },
    { id: 'EVEN_DICE', rarity: 'COMMON', price: 30, title: '🎲 Xúc xắc chẵn', text: 'Lượt tới chắc chắn ra tổng chẵn.' },
    { id: 'INSURANCE_MINI', rarity: 'COMMON', price: 35, title: '🛡️ Bảo hiểm nhỏ', text: 'Giảm 30% tiền thuê ở lần đáp tiếp theo.' },
    { id: 'SHIELD', rarity: 'UNCOMMON', price: 100, title: '🛡️ Khiên', text: 'Miễn tiền thuê hoặc phạt 1 lần.' },
    { id: 'DISCOUNT_50', rarity: 'UNCOMMON', price: 110, title: '🏷️ Voucher 50%', text: 'Giảm 50% tiền mua đất/xây nhà lượt tiếp.' },
    { id: 'PROPERTY_SABOTAGE', rarity: 'UNCOMMON', price: 140, requireTarget: true, targetType: 'TILE', title: '🎯 Phá nhà', text: 'Hạ 1 cấp nhà trên ô đất bất kỳ của đối thủ.' },
    { id: 'TELEPORT_FORWARD', rarity: 'UNCOMMON', price: 120, requireTarget: true, targetType: 'TILE', title: '🌀 Dịch chuyển', text: 'Chọn một ô bất kỳ trong 6 ô phía trước để dịch chuyển tới.' },
    { id: 'BOOST_RENT_1_5', rarity: 'UNCOMMON', price: 130, requireTarget: true, title: '📈 Tăng thuê', text: 'Nhân 1.5x tiền thuê 1 ô đất trong 2 lượt.' },
    { id: 'FORCE_MORTGAGE', rarity: 'UNCOMMON', price: 140, requireTarget: true, title: '🏦 Ép giải chấp', text: 'Ép người giàu nhất giải chấp 1 ô chưa xây.' },
    { id: 'ARREST_WARRANT', rarity: 'EPIC', price: 250, requireTarget: true, title: '🎯 Lệnh bắt', text: 'Đưa đối thủ vào Ô Tù.' },
    { id: 'HIJACK_RENT', rarity: 'EPIC', price: 270, requireTarget: true, title: '🎯 Chiếm tiền thuê', text: 'Chiếm tiền thuê 1 ô của đối thủ trong 2 lượt.' },
    { id: 'PULL_RICHEST', rarity: 'EPIC', price: 300, requireTarget: true, title: '🎯 Kéo đại gia', text: 'Ép đối thủ đến ô đất đắt nhất của bạn.' },
    { id: 'PROTECT_LAND_PERMANENT', rarity: 'EPIC', price: 220, title: '🛡️ Bảo vệ vĩnh viễn', text: 'Khóa 1 ô đất chống tráo hoặc phá.' },
    { id: 'SWAP_UNBUILT_TILE', rarity: 'EPIC', price: 280, requireTarget: true, title: '🔄 Tráo đất', text: 'Tráo ô chưa xây của bạn với đối thủ.' },
    { id: 'EARTHQUAKE_STRIKE', rarity: 'LEGENDARY', price: 420, requireTarget: true, title: '🌋 Động đất', text: 'Hạ 1 cấp nhà trên tất cả ô của đối thủ.' },
    { id: 'MIND_CONTROL', rarity: 'LEGENDARY', price: 400, requireTarget: true, title: '🧠 Điều khiển', text: 'Đưa đối thủ đến ô của bạn, giảm 30% tiền thuê.' },
    { id: 'REVERSE_GRAVITY', rarity: 'LEGENDARY', price: 280, title: '🌀 Trọng lực đảo chiều', text: 'Kéo tất cả đối thủ lùi ngay lập tức 2 ô.' },
    { id: 'SHADOW_STEP', rarity: 'COMMON', price: 25, title: '👻 Bước bóng', text: 'Đi qua 1 ô ở lượt này mà không kích hoạt tiền thuê hay hiệu ứng ô.' },
    { id: 'SLIDE_OIL', rarity: 'COMMON', price: 30, requireTarget: true, targetType: 'TILE', title: '🛢️ Dầu trượt', text: 'Đặt bẫy dầu lên 1 ô đất; người đầu tiên dẫm vào bị trượt thêm 3 ô.' },
    { id: 'BUILDING_PERMIT', rarity: 'UNCOMMON', price: 85, requireTarget: true, targetType: 'TILE', title: '🏗️ Giấy phép xây dựng', text: 'Xây hoặc nâng 1 cấp nhà từ xa trên ô đất của bạn.' },
    { id: 'POSITION_SWAP', rarity: 'UNCOMMON', price: 70, requireTarget: true, targetType: 'PLAYER', title: '🔀 Đổi vị trí', text: 'Tráo đổi vị trí với đối thủ trong bán kính 5 ô.' }
  ];
  const attackCardIds = new Set([
    'PROPERTY_SABOTAGE', 'BOOST_RENT_1_5', 'FORCE_MORTGAGE', 'ARREST_WARRANT',
    'HIJACK_RENT', 'PULL_RICHEST', 'SWAP_UNBUILT_TILE', 'EARTHQUAKE_STRIKE',
    'MIND_CONTROL', 'REVERSE_GRAVITY', 'SLIDE_OIL', 'BUILDING_PERMIT', 'POSITION_SWAP'
  ]);
  catalog.forEach(card => { card.category = attackCardIds.has(card.id) ? 'ATTACK' : 'DEFENSE'; });

  function ensureModal() {
    let modal = document.getElementById('shop-modal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'shop-modal';
    modal.className = 'shop-modal hidden';
    document.body.appendChild(modal);
    return modal;
  }

  function weightedRarity() {
    const roll = Math.random() * 100;
    let cursor = 0;
    for (const rarity of Object.keys(rarityWeights)) {
      cursor += rarityWeights[rarity];
      if (roll < cursor) return rarity;
    }
    return 'COMMON';
  }

  function drawCards() {
    const cards = [];
    const available = catalog.slice();
    while (cards.length < 3 && available.length) {
      const rarity = weightedRarity();
      const matching = available.filter(card => card.rarity === rarity);
      const pool = matching.length ? matching : available;
      const index = Math.floor(Math.random() * pool.length);
      const card = pool[index];
      cards.push(card);
      available.splice(available.indexOf(card), 1);
    }
    return cards;
  }

  function playerFromId(id) {
    return (window.GameCore.state.players || []).find(player => player.id === id);
  }

  function closeShop() {
    const modal = document.getElementById('shop-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.innerHTML = '';
    }
    clearTileSelection();
    Shop.shopSession = null;
  }

  function clearTileSelection() {
    document.querySelectorAll('.shop-target-tile').forEach(tile => tile.classList.remove('shop-target-tile'));
    Shop.tileSelection = null;
  }

  function getTileTargets(card, player) {
    return card.id === 'TELEPORT_FORWARD'
      ? Array.from({ length: 6 }, (_, offset) => window.GameCore.state.board[(player.position + offset + 1) % window.GameCore.state.board.length])
      : window.GameCore.state.board.filter(tile => tile.type === 'PROPERTY' && tile.price && (card.id === 'SLIDE_OIL' || card.id === 'BUILDING_PERMIT' && tile.owner === player.id || card.id === 'PROPERTY_SABOTAGE' && tile.owner && tile.owner !== player.id && tile.houses > 0));
  }

  function activateTileSelection(card, player, targets) {
    clearTileSelection();
    Shop.tileSelection = { card, player, targetIds: new Set(targets.map(tile => tile.id)) };
    targets.forEach(tile => document.getElementById(`tile-${tile.id}`)?.classList.add('shop-target-tile'));
    const modal = ensureModal();
    modal.innerHTML = '';
    modal.classList.add('hidden');
    window.GameEnhancements?.showEffectToast?.(`🎯 Chọn ô sáng trên bàn cờ để dùng thẻ ${card.title}.`, 'info');
  }

  function handleTileSelection(tileId) {
    const selection = Shop.tileSelection;
    if (!selection || !selection.targetIds.has(tileId)) return false;
    const target = window.GameCore.state.board.find(tile => tile.id === tileId);
    if (target) executeCard(selection.card, selection.player, target);
    return true;
  }

  function animateCardEffect(card, target, player) {
    const targetTile = target?.position !== undefined ? target.position : target?.id;
    const tileElement = targetTile !== undefined ? document.getElementById(`tile-${targetTile}`) : null;
    const playerElement = document.getElementById(`tile-${player.position}`);
    const className = card.id === 'FREEZE_ONE_TURN' || card.id === 'FREEZE_ENEMY_TILE'
      ? 'card-effect-freeze'
      : card.id === 'SLIDE_OIL'
        ? 'card-effect-oil'
        : card.id === 'PROTECT_MY_LAND' || card.id === 'PROTECT_LAND_PERMANENT'
          ? 'card-effect-shield'
          : card.id === 'BOOST_RENT_1_5' || card.id === 'BOOST_RENT_TEMP'
            ? 'card-effect-boost'
            : 'card-effect-cast';
    [tileElement, playerElement].filter(Boolean).forEach(element => {
      element.classList.remove(className);
      void element.offsetWidth;
      element.classList.add(className);
      setTimeout(() => element.classList.remove(className), 900);
    });
  }

  function renderShop() {
    const session = Shop.shopSession;
    const player = playerFromId(session.playerId);
    const modal = ensureModal();
    modal.innerHTML = `
      <div class="shop-dialog">
        <button class="shop-close" type="button" aria-label="Đóng cửa hàng">×</button>
        <div class="shop-heading"><span>🛒</span><div><h2>CỬA HÀNG GACHA</h2><p>Số dư: <b>$${player.money}</b></p></div></div>
        <div class="shop-card-grid">${session.cards.map(card => `
              <article class="shop-card rarity-${card.rarity} ${player.money < card.price ? 'unavailable' : ''}" data-card-id="${card.id}" role="button" tabindex="0" aria-label="Mua ${card.title}">
            <span class="shop-rarity">${rarityNames[card.rarity]}</span>
            <h3>${card.title}</h3><p>${card.text}</p>
                <span class="shop-card-price">Mua $${card.price}</span>
          </article>`).join('')}</div>
            <div class="shop-footer">
              <button class="shop-refresh" type="button" ${session.hasRefreshed || player.money < 30 ? 'disabled' : ''}>↻ Đổi 3 thẻ ($30)</button>
              <button class="shop-leave" type="button">Rời cửa hàng</button>
            </div>
        ${session.hasRefreshed ? '<p class="shop-notice">Đã hết lượt đổi cho lần vào cửa hàng này!</p>' : ''}
      </div>`;
    modal.classList.remove('hidden');
    modal.querySelector('.shop-close').onclick = closeShop;
    modal.querySelector('.shop-leave').onclick = closeShop;
    modal.querySelector('.shop-refresh').onclick = () => {
      if (session.hasRefreshed || player.money < 30) return;
      const cardGrid = modal.querySelector('.shop-card-grid');
      if (cardGrid) {
        cardGrid.classList.add('shop-refreshing');
        modal.querySelector('.shop-refresh').disabled = true;
        setTimeout(() => {
          player.money -= 30;
          session.cards = drawCards();
          session.hasRefreshed = true;
          session.selectedCardId = null;
          renderShop();
        }, 520);
        return;
      }
      player.money -= 30;
      session.cards = drawCards();
      session.hasRefreshed = true;
      session.selectedCardId = null;
      renderShop();
    };
    modal.querySelectorAll('.shop-card').forEach(cardElement => {
      const purchase = () => {
        const card = catalog.find(item => item.id === cardElement.dataset.cardId);
        if (!card || player.money < card.price || cardElement.classList.contains('card-purchased')) return;
        cardElement.classList.add('card-purchased');
        setTimeout(() => buyCard(card.id), 360);
      };
      cardElement.onclick = purchase;
      cardElement.onkeydown = event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          purchase();
        }
      };
    });
  }

  function buyCard(cardId) {
    const session = Shop.shopSession;
    const player = playerFromId(session.playerId);
    const card = catalog.find(item => item.id === cardId);
    if (!card || player.money < card.price) return;
    player.money -= card.price;
    if (card.category === 'ATTACK') {
      window.GameCore.addLog(`⚔️ ${player.name} mua và kích hoạt ngay thẻ [${card.title}].`);
      closeShop();
      if (card.requireTarget) return renderTargetSelector(card, player);
      return executeCard(card, player, null);
    }
    player.shopCards = Array.isArray(player.shopCards) ? player.shopCards : [];
    player.shopCards.push(card.id);
    window.GameCore.addLog(`🛒 ${player.name} mua thẻ [${card.title}] và cất vào kho.`);
    closeShop();
    window.GameUI?.renderUI?.();
  }

  function useOwnedCard(player, cardId) {
    const cardIndex = (player.shopCards || []).indexOf(cardId);
    const card = catalog.find(item => item.id === cardId);
    if (cardIndex < 0 || !card) return;
    player.shopCards.splice(cardIndex, 1);
    if (card.requireTarget) return renderTargetSelector(card, player);
    executeCard(card, player, null);
  }

  function renderTargetSelector(card, player) {
    const modal = ensureModal();
    if (!modal.querySelector('.shop-dialog')) modal.innerHTML = '<div class="shop-dialog"></div>';
    const dialog = modal.querySelector('.shop-dialog');
    const isTileTarget = card.targetType === 'TILE';
    const targets = isTileTarget
      ? getTileTargets(card, player)
      : (window.GameCore.state.players || []).filter(target => target.id !== player.id && !target.isBankrupt);
    if (isTileTarget) {
      activateTileSelection(card, player, targets);
      return;
    }
    dialog.innerHTML = `
      <button class="shop-close" type="button" aria-label="Hủy">×</button>
      <div class="shop-heading"><span>${card.title.split(' ')[0]}</span><div><h2>CHỌN MỤC TIÊU</h2><p>${card.text}</p></div></div>
      <div class="shop-target-list">${targets.map(target => `<button class="shop-target" data-target-id="${target.id}">${isTileTarget ? '🏠' : (target.tokenEmoji || '👤')} ${target.name || `Ô #${target.id}`}</button>`).join('')}</div>
      <button class="shop-leave" type="button">Hủy</button>`;
    modal.classList.remove('hidden');
    modal.querySelector('.shop-close').onclick = closeShop;
    modal.querySelector('.shop-leave').onclick = closeShop;
    modal.querySelectorAll('.shop-target').forEach(button => {
      button.onclick = () => {
        const target = isTileTarget
          ? window.GameCore.state.board.find(tile => tile.id === Number(button.dataset.targetId))
          : playerFromId(Number(button.dataset.targetId));
        executeCard(card, player, target);
      };
    });
  }

  function ownedTiles(player) {
    return window.GameCore.state.board.filter(tile => tile.owner === player.id && tile.price);
  }

  function executeCard(card, player, target) {
    const core = window.GameCore;
    const others = core.state.players.filter(item => item.id !== player.id && !item.isBankrupt);
    const richest = others.slice().sort((a, b) => (b.money || 0) - (a.money || 0))[0];
    const tiles = ownedTiles(player);
    switch (card.id) {
      case 'WALK_BOOST': player.position = (player.position + 2) % core.state.board.length; break;
      case 'SLAP_BACK': target.position = (target.position - 2 + core.state.board.length) % core.state.board.length; break;
      case 'FREEZE_ONE_TURN': target.skipTurns = (target.skipTurns || 0) + 1; break;
      case 'CHEAP_REPAIR': if (tiles.length) { player.money -= 20; tiles[0].houses = Math.max(0, (tiles[0].houses || 0) - 1); } break;
      case 'BUS_TICKET': { const stations = core.state.board.filter(tile => tile.type === 'RAILROAD'); const next = stations.sort((a, b) => ((a.id - player.position + core.state.board.length) % core.state.board.length) - ((b.id - player.position + core.state.board.length) % core.state.board.length))[0]; if (next) player.position = next.id; break; }
      case 'FREE_PARKING': player.shopFreeParking = true; break;
      case 'EVEN_DICE': player.shopEvenDice = true; break;
      case 'INSURANCE_MINI': player.shopRentReduction = 0.3; break;
      case 'SHIELD': player.hasShield = true; break;
      case 'DISCOUNT_50': player.hasDiscount = true; break;
      case 'PROPERTY_SABOTAGE': if (target.owner !== player.id && target.type === 'PROPERTY' && target.houses > 0) target.houses -= 1; break;
      case 'TELEPORT_FORWARD': if (target) player.position = target.id; break;
      case 'BOOST_RENT_1_5': { const tile = core.state.board.find(item => item.owner === target.id && item.price); if (tile) tile.boostTurns = 2; break; }
      case 'FORCE_MORTGAGE': { const tile = core.state.board.find(item => item.owner === richest?.id && item.houses === 0 && !item.mortgaged); if (tile) tile.mortgaged = true; break; }
      case 'ARREST_WARRANT': target.position = 10; target.inJail = true; break;
      case 'HIJACK_RENT': { const tile = core.state.board.find(item => item.owner === target.id && item.price); if (tile) tile.hijackPlayerId = player.id; break; }
      case 'PULL_RICHEST': { const tile = tiles.slice().sort((a, b) => b.price - a.price)[0]; if (tile && richest) richest.position = tile.id; break; }
      case 'PROTECT_LAND_PERMANENT': if (tiles.length) tiles[0].permanentProtection = true; break;
      case 'SWAP_UNBUILT_TILE': { const mine = tiles.find(item => !item.houses); const theirs = core.state.board.find(item => item.owner === target.id && item.price && !item.houses); if (mine && theirs) { mine.owner = target.id; theirs.owner = player.id; } break; }
      case 'EARTHQUAKE_STRIKE': core.state.board.filter(item => item.owner === target.id && item.type === 'PROPERTY' && item.houses > 0).forEach(item => { item.houses -= 1; }); break;
      case 'MIND_CONTROL': { const tile = tiles.slice().sort((a, b) => b.price - a.price)[0]; if (tile) { target.position = tile.id; target.shopRentReduction = 0.3; } break; }
      case 'SHADOW_STEP': player.isGhosting = true; break;
      case 'SLIDE_OIL': target.trap = 'SLIDE_OIL'; break;
      case 'BUILDING_PERMIT': if (target.owner === player.id && target.type === 'PROPERTY') target.houses = Math.min(5, (target.houses || 0) + 1); break;
      case 'POSITION_SWAP': { const distance = Math.abs(target.position - player.position); if (distance <= 5 || distance >= core.state.board.length - 5) [player.position, target.position] = [target.position, player.position]; break; }
      case 'REVERSE_GRAVITY':
        others.forEach(item => {
          item.position = (item.position - 2 + core.state.board.length) % core.state.board.length;
          item.moveDirection = 1;
          item.reverseTurns = 0;
        });
        core.addLog(`🌀 Tất cả đối thủ bị kéo lùi ngay lập tức 2 ô.`);
        window.GameEnhancements?.showEffectToast?.('🌀 Trọng lực đảo chiều! Tất cả đối thủ lùi 2 ô.', 'warning');
        break;
    }
      animateCardEffect(card, target, player);
    core.addLog(`🛒 ${player.name} đã dùng thẻ [${card.title}].`);
    closeShop();
    window.GameUI?.renderUI?.();
  }

  const Shop = {
    cardCatalog: catalog,
    shopSession: null,
    tileSelection: null,
    openShop(player) { this.shopSession = { playerId: player.id, cards: drawCards(), hasRefreshed: false, selectedCardId: null }; renderShop(); },
    refreshShop(player) { if (!this.shopSession || this.shopSession.playerId !== player.id || this.shopSession.hasRefreshed || player.money < 30) return false; player.money -= 30; this.shopSession.cards = drawCards(); this.shopSession.hasRefreshed = true; renderShop(); return true; },
    useCard: useOwnedCard,
    closeShop,
    handleTileSelection
  };
  window.GameCore.Shop = Shop;
})();
