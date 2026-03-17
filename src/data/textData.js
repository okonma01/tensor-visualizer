const EMBED_DIM = 6

function embeddingRow(tokenId) {
  return Array.from({ length: EMBED_DIM }, (_, index) => {
    const value = Math.sin(tokenId * 0.013 + index * 0.9) * 0.85
    return Math.round(value * 100) / 100
  })
}

export const TEXT_EXAMPLES = [
  {
    id: 'hello',
    label: 'Hello, world!',
    text: 'Hello, world!',
    tokens: [15496, 11, 995, 0],
    pieces: ['Hello', ',', 'world', '!'],
  },
  {
    id: 'tensors',
    label: 'Tensors are arrays',
    text: 'Tensors are arrays of numbers.',
    tokens: [51, 8118, 389, 12064, 286, 3146, 13],
    pieces: ['T', 'ensors', ' are', ' arrays', ' of', ' numbers', '.'],
  },
  {
    id: 'statquest',
    label: 'Keep it simple',
    text: 'Keep it simple and clear.',
    tokens: [2539, 340, 2829, 290, 1598, 13],
    pieces: ['Keep', ' it', ' simple', ' and', ' clear', '.'],
  },
]

export function getEmbeddingMatrix(tokenIds) {
  return tokenIds.map(embeddingRow)
}

export { EMBED_DIM }