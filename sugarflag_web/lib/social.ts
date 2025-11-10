import { prisma } from './prisma'
import { analytics } from './analytics'

/**
 * Social Features Service
 * Handles friends, sharing, leaderboards, and community
 */

/**
 * Send friend request
 */
export async function sendFriendRequest(userId: string, friendEmail: string) {
  const friend = await prisma.user.findUnique({
    where: { email: friendEmail },
  })

  if (!friend) {
    throw new Error('User not found')
  }

  if (friend.id === userId) {
    throw new Error('Cannot add yourself as friend')
  }

  // Check if already friends or pending
  const existing = await prisma.friend.findFirst({
    where: {
      OR: [
        { userId, friendId: friend.id },
        { userId: friend.id, friendId: userId },
      ],
    },
  })

  if (existing) {
    if (existing.status === 'accepted') {
      throw new Error('Already friends')
    } else if (existing.status === 'pending') {
      throw new Error('Friend request already sent')
    }
  }

  const friendRequest = await prisma.friend.create({
    data: {
      userId,
      friendId: friend.id,
      status: 'pending',
    },
  })

  // Send notification to friend
  await prisma.notification.create({
    data: {
      userId: friend.id,
      type: 'friend_request',
      title: 'New Friend Request',
      message: `You have a new friend request!`,
      data: { friendRequestId: friendRequest.id, fromUserId: userId },
    },
  })

  analytics.friendRequestSent(userId, friend.id)

  return friendRequest
}

/**
 * Accept friend request
 */
export async function acceptFriendRequest(userId: string, requestId: string) {
  const request = await prisma.friend.findUnique({
    where: { id: requestId },
  })

  if (!request) {
    throw new Error('Friend request not found')
  }

  if (request.friendId !== userId) {
    throw new Error('Not authorized')
  }

  await prisma.friend.update({
    where: { id: requestId },
    data: {
      status: 'accepted',
      acceptedAt: new Date(),
    },
  })

  // Notify requester
  await prisma.notification.create({
    data: {
      userId: request.userId,
      type: 'friend_accepted',
      title: 'Friend Request Accepted',
      message: `Your friend request was accepted!`,
    },
  })

  analytics.friendRequestAccepted(userId, request.userId)

  return request
}

/**
 * Create shareable scan card
 */
export async function createShareCard(
  userId: string,
  scanId: string,
  platform: string
): Promise<string> {
  const scan = await prisma.scan.findUnique({
    where: { id: scanId },
    include: {
      product: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
    },
  })

  if (!scan || scan.userId !== userId) {
    throw new Error('Scan not found or not authorized')
  }

  // Generate share card image URL (in production, use canvas or image service)
  const shareCardUrl = `/api/share/card?scanId=${scanId}`

  // Track share
  await prisma.share.create({
    data: {
      userId,
      scanId,
      type: 'scan',
      platform,
      imageUrl: shareCardUrl,
    },
  })

  analytics.contentShared(userId, 'scan', platform, scanId)

  return shareCardUrl
}

/**
 * Get friends list
 */
export async function getFriends(userId: string) {
  const friends = await prisma.friend.findMany({
    where: {
      OR: [
        { userId, status: 'accepted' },
        { friendId: userId, status: 'accepted' },
      ],
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          xp: true,
          level: true,
          currentStreak: true,
        },
      },
      friend: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          xp: true,
          level: true,
          currentStreak: true,
        },
      },
    },
  })

  return friends.map((f) => (f.userId === userId ? f.friend : f.user))
}

/**
 * Get friend leaderboard
 */
export async function getFriendLeaderboard(userId: string) {
  const friends = await getFriends(userId)
  const friendIds = friends.map((f) => f.id)
  friendIds.push(userId) // Include self

  // Get today's sugar intake for all friends
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const intakes = await prisma.dailyIntake.findMany({
    where: {
      userId: { in: friendIds },
      date: today,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
    },
  })

  return intakes
    .sort((a, b) => a.addedSugar - b.addedSugar) // Lowest sugar = best
    .map((intake, index) => ({
      rank: index + 1,
      user: intake.user,
      addedSugar: intake.addedSugar,
      goalMet: intake.goalMet,
    }))
}
