/**
 * 企業レベルのセキュア暗号化ユーティリティ（Vite版）
 * メインアプリと同じ暗号化/復号化ロジック
 */

// 暗号化キーをソルトと組み合わせて生成
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000, // 高いイテレーション数でセキュリティ強化
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// データを復号化
export async function decryptData(encryptedString: string, userId: string, timestamp: number): Promise<any> {
  try {
    const decoder = new TextDecoder();
    
    // Base64デコード
    const combined = new Uint8Array(
      Array.from(atob(encryptedString), char => char.charCodeAt(0))
    );
    
    // ソルト、IV、暗号化データを分離
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encryptedData = combined.slice(28);
    
    // 同じ暗号化キーを再生成
    const password = `${userId}_${timestamp}_health_share_secure`;
    const key = await deriveKey(password, salt);
    
    // AES-GCM復号化
    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encryptedData
    );
    
    // JSON文字列をパース
    const jsonString = decoder.decode(decryptedData);
    return JSON.parse(jsonString);
    
  } catch (error) {
    console.error('復号化エラー:', error);
    throw new Error('データの復号化に失敗しました。無効なデータまたは期限切れです。');
  }
}

// データ有効性チェック
export function validateSecureData(secureData: any): boolean {
  const now = Date.now();
  
  // 必須フィールドチェック
  if (!secureData.userId || !secureData.timestamp || !secureData.expiresAt || !secureData.sessionId) {
    console.error('無効なデータ構造');
    return false;
  }
  
  // 有効期限チェック
  if (now > secureData.expiresAt) {
    console.error('データの有効期限切れ');
    return false;
  }
  
  // タイムスタンプの妥当性チェック（未来の日付でない）
  if (secureData.timestamp > now) {
    console.error('無効なタイムスタンプ');
    return false;
  }
  
  return true;
}