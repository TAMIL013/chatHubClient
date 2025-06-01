<template>
  <div class="chat-container">
    <p class="chat-title">{{ title }}</p>
    <div class="chat-window" ref="chatWindow">
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="[ 'markdown-body','chat-message', message.role]"
        v-html="renderMarkdown(message.content)"
      ></div>
       <div v-if="isThinking" class="thinking-container assistant" >
        <div class="outer-spin">
          <img src="/src/assets/logo/chat-gpt.svg" alt="Model Logo" class="inner-spin" />
        </div>
      </div>
    </div>
    <chatInput @chatEmitter="continueChat" />
  </div>
</template>

<script>
import chatInput from '../components/chatInput.vue';
import { marked } from 'marked';
import { nextTick, ref } from 'vue';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import { auth } from "../firebase/config";
marked.setOptions({
  highlight: function (code, lang) {
    if (Prism.languages[lang]) {
      return Prism.highlight(code, Prism.languages[lang], lang);
    }
    return code;
  },
  breaks: true,
  gfm: true
});

export default {
  name: 'Chat',
  components: { chatInput },
  setup() {
    const chatWindow = ref(null);
    return { chatWindow };
  },
  data() {
    return {
      isThinking: false,
      title:'',
      messages: []
    };
  },
  watch: {
    // Watch for changes in the route params
    '$route.params.id': {
      immediate: true,
      handler(newId, oldId) {
        if (newId && !this.$route.query.message) {
          this.messages = []; 
          this.fetchChatHistory();
        }
      }
    }
  },
  async mounted() {
    if(!this.$route.params.id) return;
    
    const message = this.$route.query.message;
    if (message) {
      this.$router.replace({ 
        path: `/chat/${this.$route.params.id}`,
        query: {}
      });
      
      await this.continueChat(message);
    } else {
      await this.fetchChatHistory();
    }
  },
  methods: {
    async fetchChatHistory() {
      try {
        const id =this.$route.params.id
        const user = auth.currentUser;
        if (!user) {
          return
        }
        const idToken = await user.getIdToken(true);
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/${id}`,{
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
          }
        })
        const data = await response.json()
        this.title= data.title
        if(data.messages && data.messages[0].role && data.messages[0].role == "system")
          data.messages.shift()
        this.messages = data.messages.map(msg => ({
          ...msg,
          content: msg.content.replace(/\\n/g, '\n') 
        }))
        await this.$nextTick()
        this.scrollToBottom()
        Prism.highlightAll();
      } catch (error) {
        console.error('Error fetching chat history:', error)
      }
    },
    renderMarkdown(content) {
      if (!content) return '';
      const cleanContent = content
        .replace(/\\n/g, '\n') 
        .replace(/^"|"$/g, '') 
        .replace(/\\"/g, '"'); 
      return marked(cleanContent);
    },
    async continueChat(event) {
      const id = this.$route.params.id
      this.isThinking = true
      
      // Add user message first
      const userMessage = { role: 'user', content: event };
      this.messages.push(userMessage);
      
      // Add empty assistant message
      let botMessage = { role: 'assistant', content: '' };
      this.messages.push(botMessage);

      try {
        const user = auth.currentUser;
        if (!user) {
          return
        }
        const idToken = await user.getIdToken(true);
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/send/${id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({
            message: event,
          })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let result;

        while (!(result = await reader.read()).done) {
          buffer += decoder.decode(result.value, { stream: true });

          const lines = buffer.split('\n');
          buffer = lines.pop(); // Keep incomplete line

          for (const line of lines) {
            if (line.trim().startsWith('data:')) {
              const jsonData = line.substring(5).trim();
              if (jsonData === "[DONE]") continue;

              try {
                const parsed = JSON.parse(jsonData);
                const delta = parsed.choices?.[0]?.delta?.content || '';
                botMessage.content += delta;

                this.messages[this.messages.length - 1] = { ...botMessage };
                if(this.isThinking) this.isThinking = false;
                // Auto-scroll and re-highlight
                await nextTick();
                this.scrollToBottom();
                Prism.highlightAll();
              } catch (e) {
                console.error('Error parsing stream chunk:', e);
              }
            }
          }
        }
      } catch (err) {
        console.error('Streaming failed:', err);
      }
    },
    scrollToBottom() {
      const el = this.chatWindow;
      if (el?.$el) {
        el.$el.scrollTop = el.$el.scrollHeight;
      } else if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }
  }
};
</script>

<style scoped>
.chat-container {
  flex: 1;
  height: calc(100dvh - 1rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: .5rem;
  border-radius: var(--rounded-box);
  background-color: oklch(var(--bg1));
  border: 1px solid oklch(var(--text-color)/.1);
  overflow: hidden;
}
.chat-title{
  color:var(--primary-color);
  font-size: 28px;
  padding:.5rem 1rem;
  border-bottom: 1px solid oklch(var(--text-color)/.1);
  width: 100%;
  text-align: center;
}
.chat-window {
  width: 50dvw;
  flex-grow: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: .5em;
  height: calc(100dvh - 80px);
  scroll-behavior: smooth;
}

.chat-message {
  padding: 0.5em;
  border-radius: 0.5em;
  margin-bottom: 0.75em;
  width: fit-content;
  max-width: 90%;
}

.user {
  align-self: flex-end;
  background-color: #222222;
  color: #fff;
}

.assistant {
  align-self: flex-start;
  background-color: transparent;
  color: #e2e8f0;
}

code {
  background-color: #181717;
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-family: monospace;
}

pre {
  background-color: #181717;
  /* padding: 1em; */
  border-radius: 0.5em;
  overflow-x: auto;
  /* margin-top: 0.5em; */
}
.markdown-body {
  color: #e0e0e0;
  line-height: 1.6;
  padding: 1rem;
  word-break: break-word;
  width: 100%;
  overflow-wrap: break-word;
}

.markdown-body ul,
.markdown-body ol {
  padding-left: 1.5em;   
  margin-left: 0;
}

.markdown-body li {
  margin-bottom: 0.4em;
  list-style-position: inside; 
}
.thinking-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left:1rem ;
}

.outer-spin {
  display: inline-flex;
  border-radius: 50%;
  animation: spin-ltr 4s linear infinite;
}

.inner-spin {
  width: 32px;
  height: 32px;
  animation: spin-rtl 2s linear infinite;
}

@keyframes spin-rtl {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes spin-ltr {
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
}

</style>

