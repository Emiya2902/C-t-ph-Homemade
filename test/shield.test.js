const test = require('node:test');
const assert = require('node:assert/strict');

global.window = {};
require('../gameCore.js');
const GameCore = global.window.GameCore;

test('không hiển thị khiên khi số lượt đã về 0', () => {
  assert.deepEqual(GameCore.getShieldVisualState({ hasShield: true, shieldCharges: 0 }), {
    shieldCharges: 0,
    hasShield: false,
    isCenterShield: false
  });
});

test('phân biệt khiên thường và khiên buff ô trung tâm', () => {
  assert.equal(GameCore.getShieldVisualState({ shieldCharges: 1 }).isCenterShield, false);
  assert.equal(GameCore.getShieldVisualState({ shieldCharges: 3, activeCenterBuff: 'TRIPLE_AEGIS_SHIELD' }).isCenterShield, true);
  assert.equal(GameCore.getShieldVisualState({ shieldCharges: 3, activeCenterBuff: 'MIDAS_EMPIRE' }).isCenterShield, false);
});

test('không chặn đòn đánh khi khiên đã hết', () => {
  const target = { hasShield: true, shieldCharges: 0 };
  assert.equal(GameCore.interceptAttack(null, target), false);
  assert.equal(target.hasShield, false);
});

test('vẫn hỗ trợ dữ liệu cũ chỉ có hasShield', () => {
  const target = { hasShield: true };
  assert.equal(GameCore.interceptAttack(null, target), true);
  assert.equal(target.shieldCharges, 0);
  assert.equal(target.hasShield, false);
});

test('buff trung tâm chỉ kích hoạt khi đáp đúng ô và không ghosting', () => {
  const centerTile = { id: 44, isCenterHub: true };
  GameCore.state.board = [centerTile];
  const player = { position: 0 };
  assert.equal(GameCore.canActivateCenterBuff(player, centerTile), true);
  player.isGhosting = true;
  assert.equal(GameCore.canActivateCenterBuff(player, centerTile), false);
  assert.equal(GameCore.canActivateCenterBuff({ position: 0 }, { id: 44 }), false);
});

test('landing trả về vị trí mới sau khi bẫy di dời người chơi', () => {
  const trapTile = { id: 0, trap: 'SLIDE_OIL' };
  GameCore.state.board = [trapTile, {}, {}, { id: 3, type: 'CHANCE' }];
  const player = { id: 1, name: 'Test', position: 0, shieldCharges: 0, hasShield: false };
  const landing = GameCore.processTileLanding(player);
  assert.equal(player.position, 3);
  assert.equal(landing.finalPos, 3);
  assert.equal(GameCore.state.board[landing.finalPos].id, 3);
});

test('lần gieo đôi hoặc 1-6 thứ ba đưa người chơi vào tù', () => {
  const originalRandom = Math.random;
  Math.random = () => 0;
  GameCore.state.board = Array.from({ length: 40 }, (_, id) => ({ id, type: 'CHANCE' }));
  GameCore.state.players = [
    { id: 1, name: 'Test', position: 0, money: 1500, inJail: false, isBankrupt: false, bonusRollStreak: 0 },
    { id: 2, name: 'Other', position: 0, money: 1500, inJail: false, isBankrupt: false }
  ];
  GameCore.state.currentPlayerIndex = 0;
  GameCore.state.gameOver = false;
  GameCore.rollDice();
  GameCore.rollDice();
  const result = GameCore.rollDice();
  Math.random = originalRandom;
  assert.equal(result.action, 'THREE_BONUS_ROLLS_JAIL');
  assert.equal(GameCore.state.players[0].position, 10);
  assert.equal(GameCore.state.players[0].inJail, true);
});

test('người chơi ra tù phải chờ một lượt trước khi di chuyển', () => {
  GameCore.state.players = [
    { id: 1, name: 'Test', position: 10, money: 1500, inJail: false, jailReleaseWait: true, isBankrupt: false },
    { id: 2, name: 'Other', position: 0, money: 1500, inJail: false, isBankrupt: false }
  ];
  GameCore.state.currentPlayerIndex = 0;
  GameCore.state.gameOver = false;
  const result = GameCore.rollDice();
  assert.equal(result.action, 'WAIT_AFTER_JAIL');
  assert.equal(GameCore.state.players[0].position, 10);
  assert.equal(GameCore.state.currentPlayerIndex, 1);
});

test('buff trung tâm tạo thông báo dùng chung cho toàn bàn', () => {
  const originalRandom = Math.random;
  Math.random = () => 0;
  const player = { id: 1, name: 'Test', shieldCharges: 0, hasShield: false };
  GameCore.state.players = [player];
  GameCore.activateCenterBuff(player);
  Math.random = originalRandom;
  assert.equal(GameCore.state.lastAnnouncement.type, 'success');
  assert.match(GameCore.state.lastAnnouncement.message, /Test/);
});

test('thẻ bảo hiểm giảm tiền thuê một lần rồi tự hết', () => {
  GameCore.state.players = [
    { id: 1, money: 1500, shopRentReduction: 0.3 },
    { id: 2, money: 1500 }
  ];
  const tile = { owner: 2, type: 'PROPERTY', rent: [100], houses: 0 };
  assert.equal(GameCore.collectRent(GameCore.state.players[0], tile), 70);
  assert.equal(GameCore.state.players[0].shopRentReduction, undefined);
  assert.equal(GameCore.state.players[0].money, 1430);
});

test('thẻ miễn phạt hoàn lại tiền thuế ngay khi đáp ô', () => {
  GameCore.state.board = Array.from({ length: 5 }, (_, id) => ({ id, type: id === 4 ? 'TAX' : 'CHANCE' }));
  GameCore.state.players = [{ id: 1, name: 'Test', position: 4, money: 1000, shopFreeParking: true }];
  const result = GameCore.processTileLanding(GameCore.state.players[0]);
  assert.equal(result.refunded, 100);
  assert.equal(GameCore.state.players[0].money, 1000);
  assert.equal(GameCore.state.players[0].shopFreeParking, undefined);
});

test('xúc xắc chẵn tiêu thụ hiệu ứng và cho tổng chẵn', () => {
  const originalRandom = Math.random;
  Math.random = () => 0;
  GameCore.state.board = Array.from({ length: 40 }, (_, id) => ({ id, type: 'CHANCE' }));
  GameCore.state.players = [
    { id: 1, name: 'Test', position: 0, money: 1500, shopEvenDice: true, isBankrupt: false },
    { id: 2, name: 'Other', position: 0, money: 1500, isBankrupt: false }
  ];
  GameCore.state.currentPlayerIndex = 0;
  GameCore.state.gameOver = false;
  const result = GameCore.rollDice();
  Math.random = originalRandom;
  assert.equal(result.dice % 2, 0);
  assert.equal(GameCore.state.players[0].shopEvenDice, undefined);
});

test('counter rời rạc không tự kích hoạt buff trung tâm khi chưa nhận buff', () => {
  const player = { id: 1, position: 0, midasCharges: 2, globalTollTurns: 2, godDiceTurns: 2 };
  GameCore.state.board = [{ id: 0, owner: 1, type: 'PROPERTY', houses: 0 }];
  GameCore.processMovementPasses(player, [0]);
  assert.equal(GameCore.state.board[0].houses, 0);
  assert.equal(GameCore.isCenterBuffActive(player), false);
});