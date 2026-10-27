# 📸 Commons Photo Album

A Google Photos-inspired, mobile-friendly portfolio viewer for **Wikimedia Commons** contributors.

Turn any contributor's uploads list (e.g. `Special:ListFiles/Tshrinivasan`) into a modern, responsive photo album showcase.

---

## ✨ Features

- **Dynamic Contributor Routing**:
  - Visit `site.url/<username>`, `site.url/#/<username>`, or `site.url/?user=<username>`.
  - Built-in search bar to quickly jump to any Commons contributor.
  - Defaults to `Tshrinivasan` as requested in [`specs.md`](specs.md).
- **Contributor Profile & Stats Header**:
  - Contributor avatar & username with verified Commons link.
  - Real-time stats chips: **Total Uploads**, **Categories Count**, **Member Since**, and **Wikimedia Edit Count**.
  - One-click **Share** button (copies direct shareable URL with toast confirmation).
  - Quick link to contributor's `Special:ListFiles` and User Talk page.
- **Smart Category Explorer & Filtering**:
  - Horizontal scrollable pill navigation (touch-friendly on mobile).
  - Automatically identifies subject categories (e.g. *Monuments and memorials*, *Politicians of India*, *Cooksville GO Station*) while filtering out internal administrative / license maintenance tags.
  - Photo count badge on each category pill.
  - "Browse All Categories" searchable modal for contributors with many categories.
  - Clicking any category immediately filters the photo gallery.
- **Google Photos-Style Gallery**:
  - **Timeline View**: Automatically groups uploads by Month and Year (e.g. *October 2023*, *November 2011*) with sticky date headers.
  - **Continuous Grid View**: Toggle to an uninterrupted masonry stream.
  - **Aspect-ratio preserved**: No distorted or cropped images.
  - Responsive layout (2 columns on mobile, 3–5 columns on tablet & desktop).
  - Optimized Wikimedia thumbnail loading (600px/800px) with smooth shimmer skeletons.
  - Infinite scroll / "Load More Photos" batching.
- **Fullscreen Lightbox / Photo Inspector**:
  - Fullscreen high-resolution preview.
  - Smooth keyboard navigation (← / → arrow keys, Esc to close, `i` to toggle info).
  - Touch swipe gestures on mobile devices.
  - Collapsible metadata drawer showing:
    - Title & description
    - Date taken vs. upload timestamp
    - Camera resolution & file size
    - Contributor attribution
    - License deed link (CC-BY-SA, CC-BY, etc.)
    - Clickable category badges (clicking filters the gallery directly)
    - Direct download button & "View on Wikimedia Commons" link.
- **100% Static Web Application**:
  - Calls Wikimedia Commons API directly via browser CORS (`origin=*`).
  - Zero backend server required, zero maintenance, free hosting anywhere.

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 18+ (Node 20 recommended)
- npm or pnpm

### Installation & Development
```bash
# Clone the repository
git clone <repo-url>
cd commons_photo_album

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

Open `http://localhost:5173/` in your browser.

---

## 📦 Production Build

```bash
# Build optimized static bundle into /dist
npm run build

# Preview the production build locally
npm run preview
```

---

## 🌐 Free Static Hosting & Deployment

Because this is a pure static web app, you can host it for free anywhere:

### 1. GitHub Pages (Automated via GitHub Actions)
A GitHub Actions workflow is already included in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
1. Push this repository to GitHub.
2. In your repository on GitHub, navigate to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. Every push to `main` will automatically build and publish the site!

### 2. Vercel / Netlify / Cloudflare Pages
- **Build command**: `npm run build`
- **Output directory**: `dist`
- Zero server configuration required.

---

## 👥 About Kaniyam Foundation
This project is developed and maintained with dedication by the **Kaniyam Foundation Team** ([கணியம் அறக்கட்டளை](https://kaniyam.com/foundation)).

- **Website**: [https://kaniyam.com/foundation](https://kaniyam.com/foundation)
- **GitHub**: [https://github.com/KaniyamFoundation](https://github.com/KaniyamFoundation)
- **Repository**: [https://github.com/KaniyamFoundation/commons_photo_album](https://github.com/KaniyamFoundation/commons_photo_album)

---

## 📄 License
Open source and available under the MIT License.
