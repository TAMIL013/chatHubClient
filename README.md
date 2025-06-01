# Chat Hub

Chat Hub is a modern web application that lets you chat with an AI assistant, similar to ChatGPT. It features a clean interface, Google sign-in, chat history, markdown and code highlighting, and responsive design.

## Features

- **Chat with AI**: Interact with an LLM (Large Language Model) just like ChatGPT.
- **Google Authentication**: Secure login using your Google account via Firebase.
- **Chat History**: Sidebar to view and revisit previous conversations.
- **Markdown & Code Highlighting**: AI responses support markdown formatting and syntax-highlighted code blocks.

## Getting Started

1. **Install dependencies**
   ```sh
   npm install
   ```
2. **Configure environment**
   - Add your Firebase and backend API credentials to the `.env` file.
3. **Run the app**
   ```sh
   npm run dev
   ```
   Open [http://localhost:8080](http://localhost:8080) in your browser.

## Project Structure

- `src/screens/Home.vue` — Main Home Page with input box (start a conversation)
- `src/screens/Chat.vue` — Main chat interface (continue conversation)
- `src/screens/Login.vue` — Login Screen (Google sign in)
- `src/components/chatInput.vue` — Message input box
- `src/components/sideBar.vue` — Chat history sidebar
- `src/utils/prettyChat.js` — Markdown and code highlighting utility
- `src/firebase/config.js` — Firebase authentication setup

## License

MIT

---

**Chat Hub — your own ChatGPT-like assistant, powered by Vue and Firebase.**
