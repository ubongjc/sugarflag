import { prisma } from './prisma'
import { analytics } from './analytics'

/**
 * Gamification Service
 * Handles XP, levels, achievements, and streaks
 */

// XP thresholds for each level
const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000,
  15000, 20000, 26000, 33000, 41000, 50000, 60000, 71000, 83000, 96000,
]

const XP_REWARDS = {
  first_scan: 50,
  daily_scan: 10,
  week_streak: 100,
  month_streak: 500,
  goal_achieved: 200,
  friend_referral: 150,
  share_scan: 25,
  review_product: 30,
  complete_tutorial: 75,
}

export interface Achievement {
  key: string
  name: string
  description: string
  category: string
  iconUrl?: string
  xpReward: number
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  requirement: {
    type: string
    value: number
  }
}

/**
 * Award XP to a user
 */
export async function awardXP(
  userId: string,
  amount: number,
  reason: string
): Promise<{ newXP: number; newLevel: number; leveledUp: boolean }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true, level: true },
  })

  if (!user) {
    throw new Error('User not found')
  }

  const newXP = user.xp + amount
  const newLevel = calculateLevel(newXP)
  const leveledUp = newLevel > user.level

  await prisma.user.update({
    where: { id: userId },
    data: {
      xp: newXP,
      level: newLevel,
    },
  })

  // Track analytics
  analytics.xpAwarded(userId, amount, reason, newXP, newLevel)

  // If leveled up, send notification
  if (leveledUp) {
    await createNotification(userId, {
      type: 'level_up',
      title: `Level Up! You're now level ${newLevel}`,
      message: `Congratulations! You've reached level ${newLevel}. Keep up the great work!`,
    })
  }

  return { newXP, newLevel, leveledUp }
}

/**
 * Calculate user level from XP
 */
export function calculateLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      return i + 1
    }
  }
  return 1
}

/**
 * Get XP needed for next level
 */
export function getXPForNextLevel(currentLevel: number): number {
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    return Infinity
  }
  return LEVEL_THRESHOLDS[currentLevel]
}

/**
 * Check and award achievements
 */
export async function checkAchievements(
  userId: string,
  event: string,
  data?: any
): Promise<Achievement[]> {
  const newAchievements: Achievement[] = []

  // Get user's current achievements
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  })

  const achievedIds = new Set(userAchievements.map((a) => a.achievementId))

  // Get all possible achievements for this event
  const possibleAchievements = await prisma.achievement.findMany({
    where: {
      id: { notIn: Array.from(achievedIds) },
    },
  })

  for (const achievement of possibleAchievements) {
    const requirement = achievement.requirement as any

    let isAchieved = false

    switch (requirement.type) {
      case 'scan_count':
        const scanCount = await prisma.scan.count({
          where: { userId },
        })
        isAchieved = scanCount >= requirement.value
        break

      case 'streak_days':
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { currentStreak: true },
        })
        isAchieved = (user?.currentStreak || 0) >= requirement.value
        break

      case 'goal_completion':
        const completedGoals = await prisma.userGoal.count({
          where: {
            userId,
            progress: { gte: 100 },
          },
        })
        isAchieved = completedGoals >= requirement.value
        break

      case 'friends_count':
        const friendsCount = await prisma.friend.count({
          where: {
            OR: [
              { userId, status: 'accepted' },
              { friendId: userId, status: 'accepted' },
            ],
          },
        })
        isAchieved = friendsCount >= requirement.value
        break

      case 'xp_total':
        const userXP = await prisma.user.findUnique({
          where: { id: userId },
          select: { xp: true },
        })
        isAchieved = (userXP?.xp || 0) >= requirement.value
        break
    }

    if (isAchieved) {
      // Award the achievement
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
        },
      })

      // Award XP reward
      await awardXP(userId, achievement.xpReward, `Achievement: ${achievement.name}`)

      // Send notification
      await createNotification(userId, {
        type: 'achievement_unlocked',
        title: `Achievement Unlocked!`,
        message: `You've earned "${achievement.name}"!`,
        data: { achievementId: achievement.id },
      })

      newAchievements.push(achievement as Achievement)

      analytics.achievementUnlocked(userId, achievement.key, achievement.tier)
    }
  }

  return newAchievements
}

/**
 * Update user streak
 */
export async function updateStreak(userId: string): Promise<{
  currentStreak: number
  increased: boolean
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastScanDate: true, currentStreak: true, longestStreak: true },
  })

  if (!user) {
    throw new Error('User not found')
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const lastScanDate = user.lastScanDate ? new Date(user.lastScanDate) : null
  if (lastScanDate) {
    lastScanDate.setHours(0, 0, 0, 0)
  }

  let currentStreak = user.currentStreak
  let increased = false

  if (!lastScanDate) {
    // First scan ever
    currentStreak = 1
    increased = true
  } else {
    const daysDiff = Math.floor(
      (today.getTime() - lastScanDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysDiff === 0) {
      // Already scanned today, no change
      return { currentStreak, increased: false }
    } else if (daysDiff === 1) {
      // Consecutive day!
      currentStreak += 1
      increased = true

      // Award XP for streak milestones
      if (currentStreak === 7) {
        await awardXP(userId, XP_REWARDS.week_streak, '7-day streak')
      } else if (currentStreak === 30) {
        await awardXP(userId, XP_REWARDS.month_streak, '30-day streak')
      }
    } else {
      // Streak broken
      currentStreak = 1
      increased = true
    }
  }

  // Update user
  const longestStreak = Math.max(user.longestStreak, currentStreak)

  await prisma.user.update({
    where: { id: userId },
    data: {
      currentStreak,
      longestStreak,
      lastScanDate: new Date(),
    },
  })

  // Track streak in separate table
  const activeStreak = await prisma.streak.findFirst({
    where: {
      userId,
      isActive: true,
      streakType: 'daily_scan',
    },
  })

  if (activeStreak && increased) {
    await prisma.streak.update({
      where: { id: activeStreak.id },
      data: {
        daysCount: currentStreak,
      },
    })
  } else if (!activeStreak && increased) {
    await prisma.streak.create({
      data: {
        userId,
        startDate: today,
        daysCount: currentStreak,
        streakType: 'daily_scan',
        isActive: true,
      },
    })
  }

  // Check for streak achievements
  await checkAchievements(userId, 'streak_updated', { streak: currentStreak })

  return { currentStreak, increased }
}

/**
 * Get user's gamification stats
 */
export async function getGamificationStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      xp: true,
      level: true,
      currentStreak: true,
      longestStreak: true,
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  const xpForNext = getXPForNextLevel(user.level)
  const xpProgress = user.xp - LEVEL_THRESHOLDS[user.level - 1]
  const xpNeeded = xpForNext - LEVEL_THRESHOLDS[user.level - 1]

  const achievements = await prisma.userAchievement.count({
    where: { userId },
  })

  const totalScans = await prisma.scan.count({
    where: { userId },
  })

  return {
    ...user,
    xpForNextLevel: xpForNext,
    xpProgress,
    xpNeeded,
    progressPercent: (xpProgress / xpNeeded) * 100,
    achievements,
    totalScans,
  }
}

/**
 * Create notification helper
 */
async function createNotification(
  userId: string,
  data: {
    type: string
    title: string
    message: string
    data?: any
    actionUrl?: string
  }
) {
  await prisma.notification.create({
    data: {
      userId,
      ...data,
    },
  })

  // In production, also send push notification here
}

/**
 * Get leaderboard
 */
export async function getLeaderboard(
  type: 'global' | 'friends',
  period: 'daily' | 'weekly' | 'monthly' | 'all_time',
  userId?: string,
  limit: number = 100
) {
  let whereClause: any = {}

  if (type === 'friends' && userId) {
    // Get user's friend IDs
    const friends = await prisma.friend.findMany({
      where: {
        OR: [
          { userId, status: 'accepted' },
          { friendId: userId, status: 'accepted' },
        ],
      },
      select: { userId: true, friendId: true },
    })

    const friendIds = new Set<string>()
    friends.forEach((f) => {
      friendIds.add(f.userId === userId ? f.friendId : f.userId)
    })
    friendIds.add(userId) // Include self

    whereClause.id = { in: Array.from(friendIds) }
  }

  // Calculate date range for period
  let dateFilter: Date | undefined
  const now = new Date()

  if (period === 'daily') {
    dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  } else if (period === 'weekly') {
    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - 7)
    dateFilter = weekAgo
  } else if (period === 'monthly') {
    const monthAgo = new Date(now)
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    dateFilter = monthAgo
  }

  // Get top users by XP
  const users = await prisma.user.findMany({
    where: whereClause,
    orderBy: { xp: 'desc' },
    take: limit,
    select: {
      id: true,
      clerkId: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      xp: true,
      level: true,
      currentStreak: true,
    },
  })

  return users.map((user, index) => ({
    rank: index + 1,
    ...user,
  }))
}
