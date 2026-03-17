# Everything is a Tensor

A small teaching demo that shows how three common data types become PyTorch tensors:

- Tabular data as a 2D feature matrix
- Time-series data as a 2D sequence over time
- Image data as a 2D grayscale pixel grid

The project is intentionally small and client-side only. The point is to make tensor shapes intuitive without extra moving parts.

## Stack

- React
- Vite
- Tailwind CSS
- GitHub Pages

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

## Deployment

GitHub Actions builds the site and deploys it to GitHub Pages.

## Scope

This trimmed version deliberately avoids higher-maintenance features like live tokenization, audio FFTs, and video frame pipelines. It focuses on the simplest path to the main idea: everything a model sees is ultimately a tensor.
