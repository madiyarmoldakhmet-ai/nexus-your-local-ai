import express from 'express'
import cors from 'cors'

const app = express()
const port = process.env.PORT || 3001
const ollamaUrl = process.env.OLLAMA_URL || 'http://127.0.0.1:11434'

app.use(cors())
app.use(express.json({ limit: '2mb' }))

app.get('/api/models', async (_request, response) => {
  try {
    const ollamaResponse = await fetch(`${ollamaUrl}/api/tags`)
    if (!ollamaResponse.ok) throw new Error('Ollama unavailable')
    const data = await ollamaResponse.json()
    response.json({ online: true, models: data.models || [] })
  } catch {
    response.json({ online: false, models: [] })
  }
})

app.post('/api/chat', async (request, response) => {
  const { model, messages } = request.body
  if (!model || !Array.isArray(messages)) return response.status(400).json({ error: 'Model and messages are required.' })
  try {
    const ollamaResponse = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, stream: false }),
    })
    const data = await ollamaResponse.json()
    if (!ollamaResponse.ok) return response.status(ollamaResponse.status).json({ error: data.error || 'Ollama request failed.' })
    response.json(data)
  } catch {
    response.status(503).json({ error: 'Ollama is not running. Start it with: ollama serve' })
  }
})

app.listen(port, () => console.log(`Nexus API listening on http://localhost:${port}`))
