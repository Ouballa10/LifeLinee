function getFirebaseApiKey(req) {
  return String(
    process.env.FIREBASE_API_KEY ||
      process.env.VITE_FIREBASE_API_KEY ||
      req.body?.apiKey ||
      req.headers['x-firebase-api-key'] ||
      ''
  ).trim();
}

async function verifyFirebaseIdToken(idToken, req) {
  const token = String(idToken || '').trim();

  if (!token) {
    throw new Error('Firebase token is required.');
  }

  const apiKey = getFirebaseApiKey(req);

  if (!apiKey) {
    throw new Error('FIREBASE_API_KEY is missing on the backend.');
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken: token }),
    }
  );

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Unable to verify the Firebase session.');
  }

  const account = payload?.users?.[0];

  if (!account?.localId) {
    throw new Error('No Firebase user was returned for this session.');
  }

  return {
    idToken: token,
    firebaseUid: String(account.localId || '').trim(),
    email: String(account.email || '').trim().toLowerCase(),
    emailVerified: account.emailVerified !== false,
    fullName: String(account.displayName || '').trim(),
    photoURL: String(account.photoUrl || '').trim(),
    providerUserInfo: account.providerUserInfo || [],
  };
}

module.exports = {
  getFirebaseApiKey,
  verifyFirebaseIdToken,
};
