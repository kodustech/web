<p align="center">
  <img alt="koduslogo" src="https://kodus.io/wp-content/uploads/2025/04/kodusweb.png">
</p>

<p align="center">
  <a href="https://kodus.io" target="_blank">Website</a>
  ·
  <a href="" target="_blank">Community</a>
  ·
  <a href="https://docs.kodus.io" target="_blank">Docs</a>
  ·
  <a href="https://app.kodus.io" target="_blank"><strong>Try Kodus Cloud »</strong></a>
</p>

<p align="center">
   <a href="https://github.com/kodustech/kodus-web" target="_blank"><img src="https://img.shields.io/github/stars/kodustech/kodus-web" alt="Github Stars"></a>
   <a href="https://github.com/kodustech/kodus-web/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-AGPLv3-red" alt="License"></a>
</p>

<h3 align="center">A modern, intuitive interface for managing your code reviews.</h3>

<br/>

## About Kodus Web

Kodus Web is the official web interface for Kodus, delivering a modern and intuitive experience for managing your code reviews. Built with cutting-edge technologies, it provides a seamless and responsive experience for all users.

### Key Features

- **Modern Interface** — Clean and intuitive design that makes navigation and review management a breeze
- **Responsive Design** — Perfectly crafted for both desktop and mobile devices
- **Dark Mode** — Eye-friendly dark theme for comfortable viewing
- **API Integration** — Efficient communication with the Kodus backend

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker

### Installation

1. Clone the repository:
```bash
git clone https://github.com/kodustech/kodus-web.git
cd kodus-web
```

2. Build and start the containers:
```bash
npm run docker:build
npm run docker:start
# or
yarn docker:build
yarn docker:start
```

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: 
  - Tailwind CSS
  - Radix UI
  - Lucide React
- **State Management**: 
  - React Query (TanStack Query)
  - React Hook Form
- **Authentication**: NextAuth.js
- **Data Visualization**: Victory
- **Development Tools**:
  - ESLint
  - Prettier
  - TypeScript
  - Docker

## Contributing

We welcome contributions! 
