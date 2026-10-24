import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'opd_saathi_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN_MS = 24 * 60 * 60 * 1000; // 24 hours

// Pre-configured staff credentials specified by user
export const STAFF_CREDENTIALS = {
  username: 'staff_101',
  password: 'staff123',
  name: 'Duty Nursing Officer (OPD Desk 1)',
  role: 'clinical_staff',
  staffPin: '1234'
};

// Base64URL encoding/decoding
function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64').toString('utf8');
}

/**
 * Generate standard HMAC-SHA256 JSON Web Token (JWT)
 */
export function signJwt(payload) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + Math.floor(JWT_EXPIRES_IN_MS / 1000)
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verify HMAC-SHA256 JSON Web Token (JWT)
 */
export function verifyJwt(token) {
  if (!token || typeof token !== 'string') {
    throw new Error('Token is missing or malformed');
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT structure');
  }

  const [encodedHeader, encodedPayload, signature] = parts;

  // Verify HMAC signature
  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  if (signature !== expectedSignature) {
    throw new Error('Invalid JWT signature');
  }

  // Parse payload and verify expiry
  const payloadStr = base64UrlDecode(encodedPayload);
  const payload = JSON.parse(payloadStr);

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    throw new Error('JWT token has expired');
  }

  return payload;
}

/**
 * Authenticate staff user via username and password
 */
export function authenticateStaff(username, password) {
  if (
    username === STAFF_CREDENTIALS.username &&
    password === STAFF_CREDENTIALS.password
  ) {
    const user = {
      username: STAFF_CREDENTIALS.username,
      name: STAFF_CREDENTIALS.name,
      role: STAFF_CREDENTIALS.role,
      authenticatedAt: new Date().toISOString()
    };

    const token = signJwt(user);
    return { success: true, user, token };
  }

  throw new Error('Invalid username or password. Use demo credentials: staff_101 / staff123');
}
