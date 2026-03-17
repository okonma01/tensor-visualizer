# Everything is a Tensor

A small visual explainer showing how common data types become PyTorch tensors:

- Tabular data
- Time-series (sequential) data
- Text (sequential) data
- Image (spatial) data

The project is intentionally small and client-side only. It focuses on the basic structural idea: common inputs become arrays of numbers with shapes a model can process.

**Live Demo**: [Everything is a Tensor](https://okonma01.github.io/tensor-visualizer/)

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

This project deliberately omits modalities like audio and video, for simplicity. It stays on the shortest path to the main idea: everything a model sees is ultimately a tensor.
