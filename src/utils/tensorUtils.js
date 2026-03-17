export function tabularCode(data, labels, featureNames) {
  const rows = data.map((r) => `    [${r.join(', ')}]`).join(',\n')
  const y = labels.join(', ')
  return `import torch

# Feature matrix — shape: [${data.length}, ${data[0].length}]
# Features: ${featureNames.join(', ')}
X = torch.tensor([
${rows}
], dtype=torch.float32)

# Labels — shape: [${labels.length}]
y = torch.tensor([${y}], dtype=torch.long)

print(X.shape)   # torch.Size([${data.length}, ${data[0].length}])
print(X.dtype)   # torch.float32
print(y.shape)   # torch.Size([${labels.length}])
print(y.dtype)   # torch.int64`
}

export function timeSeriesCode(data) {
  const first3 = data.slice(0, 3).map((r) => `    ${JSON.stringify(r)},`).join('\n')
  return `import torch

# NASDAQ OHLC — shape: [T, 4]  where T = ${data.length} trading days
# Columns: [Open, High, Low, Close]
sequence = torch.tensor([
${first3}
    # ... ${data.length - 3} more rows
], dtype=torch.float32)

print(sequence.shape)   # torch.Size([${data.length}, 4])

# Add batch dimension for model input:
batch = sequence.unsqueeze(0)
print(batch.shape)      # torch.Size([1, ${data.length}, 4])`
}

export function textCode(tokenIds, embedDim) {
  return `import torch

token_ids = torch.tensor(${JSON.stringify(tokenIds)})
print(token_ids.shape)   # torch.Size([${tokenIds.length}])

embed = torch.nn.Embedding(num_embeddings=${tokenIds.length}, embedding_dim=${embedDim})
embedded = embed(token_ids)
print(embedded.shape)    # torch.Size([${tokenIds.length}, ${embedDim}])`
}

export function imageCode(h, w) {
  return `import torch
from PIL import Image
import torchvision.transforms as T

img = Image.open("image.jpg").convert("L")  # grayscale

transform = T.Compose([
    T.Resize((${h}, ${w})),
    T.ToTensor(),  # scales [0,255] → [0.0, 1.0]
])

tensor = transform(img)
print(tensor.shape)  # torch.Size([1, ${h}, ${w}])

# Remove the channel axis if you want a pure 2D grid of values
tensor_2d = tensor.squeeze(0)
print(tensor_2d.shape)  # torch.Size([${h}, ${w}])`
}
