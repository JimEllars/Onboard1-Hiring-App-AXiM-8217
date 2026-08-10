// Utility function to convert a string to base64url format
function base64urlEncode(str) {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Utility function to convert an ArrayBuffer to base64url format
function base64urlEncodeBuffer(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return base64urlEncode(binary);
}

// Generates an HMAC-SHA256 signed JWT
export async function issueMagicLinkToken(candidateId, secret) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + (30 * 60); // 30 minutes TTL

  const payload = {
    candidateId,
    iat,
    exp
  };

  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(payload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const encoder = new TextEncoder();
  const keyMaterial = encoder.encode(secret);
  const dataMaterial = encoder.encode(dataToSign);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyMaterial,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    dataMaterial
  );

  const encodedSignature = base64urlEncodeBuffer(signatureBuffer);

  return `${dataToSign}.${encodedSignature}`;
}
