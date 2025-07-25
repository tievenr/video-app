# PeerStream

PeerStream is a minimal real-time video chat application using WebRTC for peer-to-peer media streaming and Socket.IO for signaling. The project is split into a React-based frontend and a Node.js backend.

## Stack

- **Frontend:** React, Vite, Tailwind CSS, Socket.IO Client, WebRTC
- **Backend:** Node.js, Express, Socket.IO

## Network Protocol

- **Signaling:** Socket.IO is used for signaling between peers. The server relays messages (`offer`, `answer`, `candidate`, `ready`, `bye`) between clients to establish and manage WebRTC connections.
- **Media:** WebRTC is used for direct peer-to-peer video and audio streaming. ICE servers (Google STUN) are used for NAT traversal.
- **Flow:**
  1. A client joins and notifies others via a `ready` message.
  2. Peers exchange `offer` and `answer` SDP messages to negotiate the connection.
  3. ICE candidates are exchanged to establish the best path.
  4. Media streams are sent directly between clients via WebRTC.

## Prerequisites

- Node.js (v16+ recommended)
- npm

## Setup & Run

### 1. Clone the repository

```sh
git clone <repo-url>
cd video-app
```

### 2. Install dependencies

#### Server

```sh
cd server
npm install
```

#### Client

```sh
cd ../client
npm install
```

### 3. Start the backend server

```sh
cd ../server
node server.js
```

The server will start on port 3000 by default.

### 4. Start the frontend

```sh
cd ../client
npm run dev
```

The frontend will be available at the URL shown in the terminal (usually `http://localhost:5173`).

### 5. Usage

- Open the frontend in two different browser tabs or devices.
- Allow camera and microphone access.
- Click the video and audio buttons to start/stop your stream or mute/unmute audio.

## Notes

- The server only handles signaling; all media is sent peer-to-peer.
- The default signaling server address in the client is hardcoded. Update the IP in `src/App.jsx` if needed.
- For production, consider using HTTPS and deploying with secure TURN servers.
