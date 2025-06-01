<template>
  <div class="home-container">
    <chatInput @chatEmitter="askLLM" />
  </div>
</template>

<script>
import chatInput from '../components/chatInput.vue'
import { isLoggedIn, getCurrentUser } from '../firebase/config';
export default {
  name: 'Home',
  
  data() {
    return {
    }
  },
  mounted(){
  },
  methods: {
    async askLLM(event) {
      try {
        const idToken = localStorage.getItem('firebaseIdToken');
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({
            message: event,
          })
        });

        const data = await response.json();
        
        if (data.chatId) {
          this.$emit('new-chat', {
            id: data.chatId,
            title: data.title
          });
          
          this.$router.replace({
            path: `/chat/${data.chatId}`,
            query: { message: event }
          });
        }
      } catch (err) {
        console.error('Failed to create chat:', err);
      }
    },
  }
}
</script>

<style scoped>
.home-container{
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: .5rem;
  border-radius: var(--rounded-box);
  background-color: oklch(var(--bg1));
  border: 1px solid oklch(var(--text-color)/.1);
}
</style>