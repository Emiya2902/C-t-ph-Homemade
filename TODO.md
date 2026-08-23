# TODO - Cờ Tỉ Phú Nhà Làm

- [x] Update game name to "Cờ Tỉ Phú Nhà Làm" (index.html, package.json, server.js, gameCore.js)
- [x] Show players' chosen emoji tokens on the board (ui.js)
- [x] Widen color bars + enlarge house icons (style.css)
- [x] Stack tokens when multiple players land on same tile (ui.js)
- [x] Player who skipped buying can't join the auction (gameCore.js, ui.js, online.js, shared/gameServer.js)
- [x] Add inventory box under the chat (chat box cut in half) (index.html, style.css, ui.js)
- [x] Add Trading function box under room rules (trade properties + cash) (gameCore.js, ui.js, online.js, shared/gameServer.js)
- [x] Bỏ nút/ô "Đổi Sáng/Tối" (Theme Toggle) (index.html, style.css, ui.js)
- [x] Hiển thị quân cờ (token) thành các con vật chiếm trọn ô token, bỏ khung viền màu cũ (style.css, ui.js, gameCore.js, shared/gameServer.js)
- [x] Thêm icon đặc trưng cho tất cả các ô đất và phóng to/nâng cấp icon các ô chức năng (ui.js, style.css)
- [x] Không cho vào game nếu chỉ có đúng 1 người chơi (server.js, lobby.js, ui.js)
- [x] Random thứ tự bắt đầu chơi (gameCore.js, server.js, shared/gameServer.js)
- [x] Xóa ô chọn nhân vật cho chế độ offline ở màn hình setup chế độ online (index.html, lobby.js)
- [x] Tự động gán nhân vật khởi đầu cho mỗi người chơi để tránh thiếu nhân vật (server.js, lobby.js, ui.js, gameCore.js)

## Ưu tiên 1 - Tối ưu hóa hệ thống (Đã hoàn thành)
- [x] Tự động đổi Port (Auto-fallback) trong `server.js` khi cổng 3000 bị chiếm, tránh lỗi `EADDRINUSE`.
- [x] Đồng bộ và hoàn thiện Game Engine phá sản (`checkBankruptcy`, `netWorth`, `declareBankrupt`) cho cả `gameCore.js` và `shared/gameServer.js`.
- [x] Màn hình Phá sản (Bankruptcy Modal) và Màn hình Chiến thắng (Victory Screen với pháo hoa hoạt ảnh, bảng xếp hạng tổng tài sản, nút chơi lại) trong `index.html`, `style.css`, `ui.js`.
- [x] Cục xúc xắc 2D truyền thống có dấu chấm (Pip dots, chấm đỏ số 1 & số 4) và hoạt ảnh lắc xoay chân thực (`style.css`, `ui.js`).
- [x] Sửa lỗi Pop-up mua đất/rút thẻ hiện trước khi quân cờ chạy trong chế độ Online Multiplayer (`online.js`).
- [x] Cập nhật luật mua nhà: Mỗi lượt chỉ mua nhà tối đa 1 lần (áp dụng trên mọi ô đất) và đối với cùng 1 ô đất bắt buộc phải cách 1 lượt mới được mua tiếp (`shared/gameServer.js`, `gameCore.js`, `ui.js`).
- [x] Nâng cấp giao diện Kho đồ (Inventory) & Giao dịch (Trade): Hiển thị đầy đủ thông tin (nhóm màu, tên, icon, giá, tiền thuê, số nhà/khách sạn, trạng thái cầm cố/bộ màu) và hiệu ứng Glow Up phát sáng neon khi được chọn (`style.css`, `ui.js`).
- [x] Tối ưu hóa giao diện cho người chơi Mobile: Bàn cờ luôn hiển thị vuông vắn, sắc nét ở trên cùng, 2 thanh bên (Trò chuyện, Kho đồ, Danh sách người chơi, Trao đổi, Luật) chuyển xuống bên dưới và cho phép cuộn trang mượt mà (`style.css`, `index.html`, `ui.js`).
- [x] Hoàn thiện cơ chế Phá sản / Đầu hàng (Bankrupt): Thêm nút Phá sản/Đầu hàng, banner cảnh báo nợ khi âm tiền, cho phép bán nhà/cầm cố đất/trao đổi để gỡ nợ trước khi kết thúc lượt; nếu đầu hàng khi đang nợ người chơi khác thì chủ nợ nhận toàn bộ tiền và đất đai (`gameCore.js`, `shared/gameServer.js`, `index.html`, `style.css`, `ui.js`, `online.js`).
- [x] Mở rộng danh sách Thẻ Cơ Hội & Khí Vận lên 15 thẻ mỗi mảng cùng 6 action mới (`SHIELD`, `DISCOUNT`, `MULTIPLY_LAND_RENT`, `STEAL_RICHEST`, `PULL_RICHEST_TO_MY_LAND`, `SWAP_TILE`) (`gameCore.js`, `shared/gameServer.js`).
- [x] Thêm hiệu ứng hình ảnh cho các thẻ mới (Badge `x1.5` vàng kim trên ô đất, badge `🛡️ Khiên` và `🏷️ -50%` trên thẻ người chơi) và hoàn thiện cơ chế Glow Up viền đậm + x2 tiền thuê khi sở hữu trọn bộ màu (hoàn toàn không cầm cố) (`style.css`, `ui.js`, `gameCore.js`, `shared/gameServer.js`).
- [x] Cho phép người chơi kết nối lại phòng trong vòng 2 phút nếu bị disconnect/rớt mạng (`server.js`, `lobby.js`, `online.js`, `ui.js`).
- [x] Bổ sung chế độ Khán Giả (Spectator Mode) cho người tham gia phòng sau khi trận đấu đã bắt đầu (`server.js`, `online.js`, `index.html`, `style.css`).
- [x] Tích hợp cơ chế Chơi lại / Khởi động ván mới (Instant Restart & Reset to Lobby) cho cả chế độ Online & Offline (`server.js`, `online.js`, `ui.js`, `index.html`, `style.css`).
- [x] Sửa lỗi đấu giá: Ẩn nút đấu giá ở chế độ không đấu giá; thêm nút đấu giá đúng chức năng và nút bỏ qua giữ đúng chức năng ở chế độ có đấu giá; sửa lỗi tăng tiền đấu giá mượt mà cho cả Online và Offline (`shared/gameServer.js`, `server.js`, `gameCore.js`, `ui.js`, `online.js`, `index.html`, `style.css`).

