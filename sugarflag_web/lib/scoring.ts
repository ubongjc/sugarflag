import { Sweetener } from '@prisma/client'

/**
 * Calculate a sugar score (0-100) for a product
 * Higher score = better (lower/healthier sugar content)
 */
export function calculateSugarScore(
  addedSugars: number | null,
  totalSugars: number | null,
  sweeteners: Array<{ sweetener: Sweetener; position: number }>,
  servingSize?: string | null
): { score: number; rationale: string; uncertainty: number } {
  let score = 100
  let rationale: string[] = []
  let uncertainty = 0

  // Factor 1: Added sugars (most important)
  if (addedSugars !== null) {
    if (addedSugars === 0) {
      rationale.push('No added sugars')
    } else if (addedSugars <= 5) {
      score -= 10
      rationale.push(`Low added sugars (${addedSugars}g per serving)`)
    } else if (addedSugars <= 10) {
      score -= 25
      rationale.push(`Moderate added sugars (${addedSugars}g per serving)`)
    } else if (addedSugars <= 20) {
      score -= 40
      rationale.push(`High added sugars (${addedSugars}g per serving)`)
    } else {
      score -= 60
      rationale.push(`Very high added sugars (${addedSugars}g per serving)`)
    }
  } else if (totalSugars !== null) {
    // Fallback to total sugars with higher uncertainty
    uncertainty += 0.2
    if (totalSugars <= 5) {
      score -= 5
      rationale.push(`Low total sugars (${totalSugars}g per serving, added sugars unknown)`)
    } else if (totalSugars <= 15) {
      score -= 20
      rationale.push(`Moderate total sugars (${totalSugars}g per serving, added sugars unknown)`)
    } else {
      score -= 35
      rationale.push(`High total sugars (${totalSugars}g per serving, added sugars unknown)`)
    }
  } else {
    uncertainty += 0.3
    rationale.push('Sugar content not available')
  }

  // Factor 2: Sweetener types and positions
  const artificialSweeteners = sweeteners.filter(s => s.sweetener.type === 'artificial')
  const addedSugarSweeteners = sweeteners.filter(s => s.sweetener.type === 'added_sugar')
  const naturalAlternatives = sweeteners.filter(s => s.sweetener.type === 'natural_alternative')

  // Penalize artificial sweeteners
  if (artificialSweeteners.length > 0) {
    const topArtificial = artificialSweeteners.filter(s => s.position <= 5)
    if (topArtificial.length > 0) {
      score -= 15
      rationale.push(`Contains artificial sweeteners: ${topArtificial.map(s => s.sweetener.name).join(', ')}`)
    } else {
      score -= 8
      rationale.push(`Contains artificial sweeteners in small amounts`)
    }
  }

  // Penalize added sugars in top ingredients
  if (addedSugarSweeteners.length > 0) {
    const topAdded = addedSugarSweeteners.filter(s => s.position <= 3)
    if (topAdded.length > 0) {
      score -= 20
      rationale.push(`Multiple added sugars in top ingredients: ${topAdded.map(s => s.sweetener.name).join(', ')}`)
    } else if (addedSugarSweeteners.filter(s => s.position <= 5).length > 0) {
      score -= 10
      rationale.push(`Added sugars present: ${addedSugarSweeteners.map(s => s.sweetener.name).join(', ')}`)
    }
  }

  // Reward natural alternatives
  if (naturalAlternatives.length > 0) {
    score += 5
    rationale.push(`Uses natural sweeteners: ${naturalAlternatives.map(s => s.sweetener.name).join(', ')}`)
  }

  // Ensure score stays in bounds
  score = Math.max(0, Math.min(100, score))

  // Calculate final uncertainty
  uncertainty = Math.min(1, uncertainty)

  return {
    score: Math.round(score),
    rationale: rationale.join('. ') + '.',
    uncertainty,
  }
}

/**
 * Determine score category and label
 */
export function getScoreLabel(score: number): {
  label: string
  color: string
  description: string
} {
  if (score >= 80) {
    return {
      label: 'Excellent',
      color: 'green',
      description: 'Very low sugar content, great choice!',
    }
  } else if (score >= 60) {
    return {
      label: 'Good',
      color: 'lime',
      description: 'Moderate sugar content, reasonable option.',
    }
  } else if (score >= 40) {
    return {
      label: 'Fair',
      color: 'yellow',
      description: 'Notable sugar content, consider alternatives.',
    }
  } else if (score >= 20) {
    return {
      label: 'Poor',
      color: 'orange',
      description: 'High sugar content, limit consumption.',
    }
  } else {
    return {
      label: 'Very Poor',
      color: 'red',
      description: 'Very high sugar content, seek better options.',
    }
  }
}
