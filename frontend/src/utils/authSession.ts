import type { User } from '../types';

export const getTokenFromResponse = (response: {
  data?: {
    data?: { token?: string; accessToken?: string };
    token?: string;
    accessToken?: string;
  };
}): string | null =>
  response?.data?.data?.token ||
  response?.data?.token ||
  response?.data?.data?.accessToken ||
  response?.data?.accessToken ||
  null;

export const getUserFromResponse = (response: {
  data?: { data?: { user?: unknown }; user?: unknown };
}): unknown =>
  response?.data?.data?.user || response?.data?.user || null;

/** Normalize backend user shapes (_id vs id, avatar object vs string) */
export const normalizeUser = (raw: unknown): User | null => {
  if (!raw || typeof raw !== 'object') return null;

  const user = raw as Record<string, unknown>;
  const id =
    (typeof user.id === 'string' && user.id) ||
    (user._id != null && String(user._id)) ||
    '';

  if (!id) return null;

  let avatar = '';
  if (typeof user.avatar === 'string') {
    avatar = user.avatar;
  } else if (user.avatar && typeof user.avatar === 'object') {
    avatar = String((user.avatar as { url?: string }).url || '');
  }

  return {
    id,
    _id: id,
    name: String(user.name || ''),
    email: String(user.email || ''),
    role: (user.role as User['role']) || 'customer',
    avatar: avatar || undefined,
    bio: typeof user.bio === 'string' ? user.bio : undefined,
    isVerified: Boolean(user.isVerified),
    createdAt:
      typeof user.createdAt === 'string'
        ? user.createdAt
        : user.createdAt instanceof Date
          ? user.createdAt.toISOString()
          : new Date().toISOString(),
  };
};
