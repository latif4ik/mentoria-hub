// Backend (FastAPI AI service) base URL.
// Dev: http://localhost:8000  |  Prod: your Railway URL.
// Set VITE_API_URL in .env locally and in the Vercel dashboard for production.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function generateLesson(youtubeUrl, numQuestions = 50) {
  const res = await fetch(`${API_URL}/generate-lesson`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ youtube_url: youtubeUrl, num_questions: numQuestions }),
  })
  if (!res.ok) {
    let detail = `AI service error ${res.status}`
    try { const body = await res.json(); detail = body.detail || detail } catch {}
    throw new Error(detail)
  }
  return res.json()
}

export { API_URL }
