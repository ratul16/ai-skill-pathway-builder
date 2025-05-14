# AI Skill Pathway Builder

A Nuxt 3 web app that generates and visualizes personalized learning pathways using a local LLM (via LM Studio) and Vue Flow. Enter your current skills and target role, and the AI will return a directed graph of "owned", "next" and "future" skills. The graph is auto-laid out with Dagre and color-coded by status.

---

## 🚀 Features

- **AI-powered skill graph**: Uses a local LLM (DeepSeek R1 Distill LLaMA-8B) to generate a skill roadmap tailored to your target role.
- **Interactive diagram**: Vue Flow displays nodes and curved, animated edges.
- **Auto-layout**: Dagre arranges nodes in a top-to-bottom flowchart.
- **Status highlighting**:
  - **Owned** skills in green
  - **Next** skill in amber
  - **Future** skills in blue
- **Modal form**: Tailwind/TailwindCSS-styled modal to enter skills & role.
- **Re-layout button**: Re-run Dagre at any time.
- **Local development**: No external API keys—connects to your LM Studio endpoint.

---

## 🛠 Tech Stack

- [Nuxt 3](https://v3.nuxtjs.org/) (Vue 3, Vite)
- [Pinia](https://pinia.vuejs.org/) for state management
- [Vue Flow](https://vueflow.dev/) for graph rendering
- [@dagrejs/dagre](https://www.npmjs.com/package/@dagrejs/dagre) for automatic layout
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [LM Studio](https://lm‐studio.ai/) & local LLM for AI completions

---

## 📦 Installation

1. **Clone** the repo
   ```bash
   git clone https://github.com/ratul16/skill-pathway-builder
   cd skill-pathway-builder
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   # or npm install / yarn install
   ```

3. **Configure LM Studio**

   - Launch LM Studio and load your model (e.g.  `meta-llama-3.1-8b-instruct`, `deepseek-r1-distill-llama-8b`).
   - Note the local API URL (defaults to `http://127.0.0.1:1234`).

4. **Set environment variables** (Optional)

   Create a `.env` at project root:

   ```dotenv
   LM_STUDIO_URL=http://127.0.0.1:1234
   ```

---

## 🏃‍♂️ Development

```bash
pnpm dev
# or npm run dev / yarn dev
```

- **Frontend** on `http://localhost:3000`
- **API** endpoints under `/server/api/skill-pathway.post.js` proxy to your LM Studio instance.

---

## 🔧 Configuration

- **Prompt template**: `server/api/skill-pathway.post.js` contains the LLM prompt—tweak the instructions to refine skill selection and graph structure.

- **Node layout**:

  - The `applyDagreLayout()` function in `GraphViewer.vue` runs a top-to-bottom layout (`rankdir: 'TB'`).
  - Change to `'LR'` for left-to-right flows.

---

## 📑 Usage

1. Click **Open Skill Pathway Builder**.
2. Enter your comma-separated current skills and desired target role.
3. Click **Generate Pathway**.
4. Watch the AI-generated graph appear.
5. Use **Re-order** to re-run auto-layout.
6. Drag, zoom, and pan the diagram as needed.
