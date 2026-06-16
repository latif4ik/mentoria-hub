const GOAL_TO_CATEGORY = {
  'Competitions':   ['Competition', 'Olympiad'],
  'Scholarships':   ['Scholarship'],
  'Skill building': ['Internship', 'Summer School'],
  'University prep':['Summer School', 'Scholarship'],
}

// Returns items from arr1 that loosely match any item in arr2
function overlap(arr1 = [], arr2 = []) {
  return arr1.filter(a =>
    arr2.some(b =>
      a.toLowerCase().includes(b.toLowerCase()) ||
      b.toLowerCase().includes(a.toLowerCase())
    )
  )
}

export function scoreOpportunity(opp, profile) {
  const { interests = [], subjects = [], goals = [], grade } = profile
  let score = 0
  const reasons = []

  if (interests.includes(opp.direction)) {
    score += 3
    reasons.push(`matches your interest in ${opp.direction}`)
  }

  const profileKeywords = [...interests, ...subjects, ...goals]
  const tagMatches = overlap(opp.tags, profileKeywords)
  score += tagMatches.length * 2
  if (tagMatches.length > 0 && !reasons.length) {
    reasons.push(`relevant to ${tagMatches[0]}`)
  }

  for (const goal of goals) {
    if ((GOAL_TO_CATEGORY[goal] || []).includes(opp.category)) {
      score += 2
      reasons.push(goal.toLowerCase())
      break
    }
  }

  let reason = 'Recommended for you'
  if (grade && reasons.length > 0) {
    reason = `Recommended because you're in grade ${grade} and it ${reasons[0]}`
  } else if (grade) {
    reason = `Recommended for students in grade ${grade}`
  } else if (reasons.length > 0) {
    reason = `Recommended because it ${reasons[0]}`
  }

  return { ...opp, _score: score, reason }
}

export function scoreCourse(course, profile) {
  const { interests = [], subjects = [], grade } = profile
  let score = 0
  const reasons = []

  if (subjects.includes(course.subject)) {
    score += 4
    reasons.push(`you study ${course.subject}`)
  }

  const profileKeywords = [...interests, ...subjects]
  const tagMatches = overlap(course.tags, profileKeywords)
  score += tagMatches.length * 2
  if (tagMatches.length > 0 && !reasons.length) {
    reasons.push(`it covers ${tagMatches[0]}`)
  }

  let reason = 'Recommended for you'
  if (grade && reasons.length > 0) {
    reason = `Recommended because you're in grade ${grade} and ${reasons[0]}`
  } else if (reasons.length > 0) {
    reason = `Recommended because ${reasons[0]}`
  }

  return { ...course, _score: score, reason }
}

export function getRecommendations(profile, opportunities, courses) {
  return {
    opportunities: opportunities
      .map(o => scoreOpportunity(o, profile))
      .sort((a, b) => b._score - a._score),
    courses: courses
      .map(c => scoreCourse(c, profile))
      .sort((a, b) => b._score - a._score),
  }
}
