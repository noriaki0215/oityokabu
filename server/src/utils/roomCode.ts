// 部屋コード生成ユーティリティ

const CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 紛らわしい文字を除外

export function generateRoomCode(length: number = 6): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
  }
  return code;
}

export function isValidRoomCode(code: string): boolean {
  if (code.length !== 6) return false;
  return /^[A-Z0-9]+$/.test(code);
}
