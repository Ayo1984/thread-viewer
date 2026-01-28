# Thread Viewer

A real-time thread messaging application with virtual scrolling, infinite pagination, and Server-Sent Events (SSE) for live message updates.

Dark mode based on system preference

## Tech Stack

**Frontend:**
- Next.js 16 (React 19)
- TypeScript
- React Query (`@tanstack/react-query`)
- `react-window` for virtualization
- Tailwind CSS
- Axios

**Backend:**
- Express.js
- TypeScript
- Zod for validation
- Server-Sent Events (SSE)

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

1. Install server dependencies:
```bash
cd server && npm install
```

2. Install client dependencies:
```bash
cd client && npm install
```

### Running the Application

From the root directory:

```bash
npm run dev
```

This starts both the server (port 4000) and client (port 3000).

Or run them separately:

```bash
# Server only
npm run dev:server

# Client only
npm run dev:client
```

Visit `http://localhost:3000` in your browser.

## Project Structure

```
thread-viewer/
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Next.js pages
│   │   └── utils/         # Utilities and types
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── store/         # In-memory data store
│   │   └── index.ts        # Server entry point
│   └── package.json
├── DECISIONS.md            # Architecture decisions
└── README.md
```

### Virtual Scrolling
Messages are rendered using `react-window` to handle large lists efficiently. Only visible messages are rendered in the DOM.

### Infinite Pagination
Uses cursor-based pagination (50 messages per page). Older messages load when scrolling to the top.

### Real-time Updates
Server-Sent Events broadcast new messages to all connected clients in real-time.

### Scroll Behavior
- Newest messages appear at the bottom (ChatGPT-style)
- Older messages load when scrolling up
- Scroll position preserved when loading older messages
- Auto-scrolls to bottom when new messages arrive (if user is at bottom)
- Shows "New messages" button when scrolled up

## API Endpoints

- `GET /threads` - List all threads
- `GET /threads/:id/messages?cursor=&limit=` - Get messages with pagination
- `POST /threads/:id/messages` - Send a new message
- `GET /threads/:id/stream` - SSE stream for real-time updates

[Postman Collection for Endpoints](https://www.postman.com/workspace/My-Workspace~c37204b0-7fea-47c9-85c0-e29670bd16c3/collection/17409249-0ec1adc4-9256-497c-8ed3-0d009a2dcc57?action=share&creator=17409249)

## Development Notes

See [DECISIONS.md](./DECISIONS.md) for detailed architecture decisions and implementation notes.
