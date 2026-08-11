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

// Utility function to convert base64url to ArrayBuffer
function base64urlDecode(str) {
  // Pad the base64 string to a multiple of 4
  const padLen = (4 - (str.length % 4)) % 4;
  str += '='.repeat(padLen);
  // Replace characters
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Decode
  const raw = atob(base64);
  const buffer = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) {
    buffer[i] = raw.charCodeAt(i);
  }
  return buffer.buffer;
}

// Verifies an HMAC-SHA256 signed JWT
export async function verifyMagicLinkToken(token, secret) {
  if (!token || typeof token !== 'string') {
    throw new Error('Invalid token format');
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token structure');
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const dataToVerify = `${encodedHeader}.${encodedPayload}`;

  const encoder = new TextEncoder();
  const keyMaterial = encoder.encode(secret);
  const dataMaterial = encoder.encode(dataToVerify);

  let signatureBuffer;
  try {
    signatureBuffer = base64urlDecode(encodedSignature);
  } catch (e) {
    throw new Error('Invalid token signature encoding');
  }

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyMaterial,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const isValid = await crypto.subtle.verify(
    'HMAC',
    cryptoKey,
    signatureBuffer,
    dataMaterial
  );

  if (!isValid) {
    throw new Error('Invalid token signature');
  }

  let payload;
  try {
    // Basic atob doesn't need to be fully safe for base64url since our base64urlDecode handles padding,
    // but we can just use simple logic since payload is simple JSON
    const padLen = (4 - (encodedPayload.length % 4)) % 4;
    const paddedPayload = encodedPayload + '='.repeat(padLen);
    const base64Payload = paddedPayload.replace(/-/g, '+').replace(/_/g, '/');
    payload = JSON.parse(atob(base64Payload));
  } catch (e) {
    throw new Error('Invalid token payload format');
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    throw new Error('Token has expired');
  }

  return payload;
}
