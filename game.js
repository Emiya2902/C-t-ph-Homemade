<<<<<<< HEAD
// DÒNG 1: Nạp dữ liệu bàn cờ (BẮT BỤC PHẢI Ở ĐẦU FILE)
const BOARD = (typeof module !== 'undefined' && typeof require !== 'undefined')
  ? require('./board.js')
  : window.BOARD;

// 1. CLASS NGƯỜI CHƠI
class Player {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.position = 0;
    this.money = 1500;
    this.inJail = false;
    this.isBankrupt = false;
  }
}

// 2. HÀM GIEO XÚC XẮC
function rollDice() {
  const die1 = Math.floor(Math.random() * 6) + 1;
  const die2 = Math.floor(Math.random() * 6) + 1;
  return { die1, die2, sum: die1 + die2, isDouble: die1 === die2 };
}

// 3. HÀM DI CHUYỂN
function movePlayer(player, diceSum) {
  const oldPosition = player.position;
  const newPosition = (oldPosition + diceSum) % 40;
  player.position = newPosition;

  console.log(`🎲 ${player.name} gieo được ${diceSum} điểm! Di chuyển đến: Ô ${newPosition}`);

  // Luật qua ô Start
  if (newPosition < oldPosition) {
    player.money += 200;
    console.log(`  💵 Qua ô Bắt đầu! ${player.name} nhận $200 (Ví: $${player.money})`);
  }
}

// 4. HÀM XỬ LÝ SỰ KIỆN TẠI Ô ĐẤT
function handleTileAction(player, otherPlayer) {
  const currentTile = BOARD[player.position];
  console.log(`  📍 Đang đứng tại: [${currentTile.name}] - Loại: ${currentTile.type}`);

  // Xử lý nhóm ô Bất Động Sản (PROPERTY), Bến Xe/Metro (RAILROAD), Tiện Ích (UTILITY)
  if (["PROPERTY", "RAILROAD", "UTILITY"].includes(currentTile.type)) {
    
    // TRƯỜNG HỢP 1: Ô đất chưa có chủ -> MUA ĐẤT
    if (currentTile.owner === null) {
      if (player.money >= currentTile.price) {
        player.money -= currentTile.price;
        currentTile.owner = player.id;
        console.log(`  🛒 ${player.name} đã MUA [${currentTile.name}] với giá $${currentTile.price}. (Ví còn: $${player.money})`);
      } else {
        console.log(`  💸 ${player.name} không đủ $${currentTile.price} để mua đất này.`);
      }
    } 
    
    // TRƯỜNG HỢP 2: Đáp vào đất của ĐỐI THỦ -> TRẢ TIỀN THUÊ
    else if (currentTile.owner !== player.id) {
      const rentAmount = currentTile.rent ? currentTile.rent[0] : 25;

      player.money -= rentAmount;
      otherPlayer.money += rentAmount;

      console.log(`  💸 TRẢ TIỀN THUÊ! ${player.name} đáp vào đất của ${otherPlayer.name}.`);
      console.log(`     -> Trả $${rentAmount} cho ${otherPlayer.name}. (Ví ${player.name}: $${player.money} | Ví ${otherPlayer.name}: $${otherPlayer.money})`);
    } 
    
    // TRƯỜNG HỢP 3: Ô đất của CHÍNH MÌNH
    else {
      console.log(`  🏠 Đây là đất của ${player.name}. Không mất tiền!`);
    }
  } 
  
  // Xử lý ô Nộp Thuế
  else if (currentTile.type === "TAX") {
    player.money -= currentTile.amount;
    console.log(`  💸 Nộp ${currentTile.name}: -$${currentTile.amount}. (Ví còn: $${player.money})`);
  }
}

// ===================================================
// MÔ PHỎNG TRẬN ĐẤU 2 NGƯỜI CHƠI (P1 vs P2)
// ===================================================

const p1 = new Player(1, "Sài Gòn Pro");
const p2 = new Player(2, "Chợ Lớn VIP");

console.log("=== BẮT ĐẦU TRẬN ĐẤU GIẢ LẬP ===");

for (let turn = 1; turn <= 10; turn++) {
  console.log(`\n=================== LƯỢT ${turn} ===================`);
  
  // Lượt P1
  const dice1 = rollDice();
  movePlayer(p1, dice1.sum);
  handleTileAction(p1, p2);

  // Lượt P2
  const dice2 = rollDice();
  movePlayer(p2, dice2.sum);
  handleTileAction(p2, p1);
=======
// DÒNG 1: Nạp dữ liệu bàn cờ (BẮT BỤC PHẢI Ở ĐẦU FILE)
const BOARD = (typeof module !== 'undefined' && typeof require !== 'undefined')
  ? require('./board.js')
  : window.BOARD;

// 1. CLASS NGƯỜI CHƠI
class Player {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.position = 0;
    this.money = 1500;
    this.inJail = false;
    this.isBankrupt = false;
  }
}

// 2. HÀM GIEO XÚC XẮC
function rollDice() {
  const die1 = Math.floor(Math.random() * 6) + 1;
  const die2 = Math.floor(Math.random() * 6) + 1;
  return { die1, die2, sum: die1 + die2, isDouble: die1 === die2 };
}

// 3. HÀM DI CHUYỂN
function movePlayer(player, diceSum) {
  const oldPosition = player.position;
  const newPosition = (oldPosition + diceSum) % 40;
  player.position = newPosition;

  console.log(`🎲 ${player.name} gieo được ${diceSum} điểm! Di chuyển đến: Ô ${newPosition}`);

  // Luật qua ô Start
  if (newPosition < oldPosition) {
    player.money += 200;
    console.log(`  💵 Qua ô Bắt đầu! ${player.name} nhận $200 (Ví: $${player.money})`);
  }
}

// 4. HÀM XỬ LÝ SỰ KIỆN TẠI Ô ĐẤT
function handleTileAction(player, otherPlayer) {
  const currentTile = BOARD[player.position];
  console.log(`  📍 Đang đứng tại: [${currentTile.name}] - Loại: ${currentTile.type}`);

  // Xử lý nhóm ô Bất Động Sản (PROPERTY), Bến Xe/Metro (RAILROAD), Tiện Ích (UTILITY)
  if (["PROPERTY", "RAILROAD", "UTILITY"].includes(currentTile.type)) {
    
    // TRƯỜNG HỢP 1: Ô đất chưa có chủ -> MUA ĐẤT
    if (currentTile.owner === null) {
      if (player.money >= currentTile.price) {
        player.money -= currentTile.price;
        currentTile.owner = player.id;
        console.log(`  🛒 ${player.name} đã MUA [${currentTile.name}] với giá $${currentTile.price}. (Ví còn: $${player.money})`);
      } else {
        console.log(`  💸 ${player.name} không đủ $${currentTile.price} để mua đất này.`);
      }
    } 
    
    // TRƯỜNG HỢP 2: Đáp vào đất của ĐỐI THỦ -> TRẢ TIỀN THUÊ
    else if (currentTile.owner !== player.id) {
      const rentAmount = currentTile.rent ? currentTile.rent[0] : 25;

      player.money -= rentAmount;
      otherPlayer.money += rentAmount;

      console.log(`  💸 TRẢ TIỀN THUÊ! ${player.name} đáp vào đất của ${otherPlayer.name}.`);
      console.log(`     -> Trả $${rentAmount} cho ${otherPlayer.name}. (Ví ${player.name}: $${player.money} | Ví ${otherPlayer.name}: $${otherPlayer.money})`);
    } 
    
    // TRƯỜNG HỢP 3: Ô đất của CHÍNH MÌNH
    else {
      console.log(`  🏠 Đây là đất của ${player.name}. Không mất tiền!`);
    }
  } 
  
  // Xử lý ô Nộp Thuế
  else if (currentTile.type === "TAX") {
    player.money -= currentTile.amount;
    console.log(`  💸 Nộp ${currentTile.name}: -$${currentTile.amount}. (Ví còn: $${player.money})`);
  }
}

// ===================================================
// MÔ PHỎNG TRẬN ĐẤU 2 NGƯỜI CHƠI (P1 vs P2)
// ===================================================

const p1 = new Player(1, "Sài Gòn Pro");
const p2 = new Player(2, "Chợ Lớn VIP");

console.log("=== BẮT ĐẦU TRẬN ĐẤU GIẢ LẬP ===");

for (let turn = 1; turn <= 10; turn++) {
  console.log(`\n=================== LƯỢT ${turn} ===================`);
  
  // Lượt P1
  const dice1 = rollDice();
  movePlayer(p1, dice1.sum);
  handleTileAction(p1, p2);

  // Lượt P2
  const dice2 = rollDice();
  movePlayer(p2, dice2.sum);
  handleTileAction(p2, p1);
>>>>>>> 814147eb7059fe1f3a8102216959befd1818b784
}