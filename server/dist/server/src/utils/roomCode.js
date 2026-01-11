"use strict";
// 部屋コード生成ユーティリティ
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRoomCode = generateRoomCode;
exports.isValidRoomCode = isValidRoomCode;
const CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 紛らわしい文字を除外
function generateRoomCode(length = 6) {
    let code = '';
    for (let i = 0; i < length; i++) {
        code += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
    }
    return code;
}
function isValidRoomCode(code) {
    if (code.length !== 6)
        return false;
    return /^[A-Z0-9]+$/.test(code);
}
//# sourceMappingURL=roomCode.js.map