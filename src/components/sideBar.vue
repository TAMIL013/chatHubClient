<template>
    <section class="sidebar-container">
        <div class="sidebar-toggle" @click="toggleSidebar">
            <span v-if="isOpen"  class="logo" @click.stop="navigateToHome">Chat Hub</span>
            <v-spacer></v-spacer>
            <img v-if="isOpen" src="../assets/logo/sidebar-close.png" alt="" >
            <img v-else src="../assets/logo/sidebar-open.png" alt="">
        </div>
        <div class="side-bar" :class="{ 'closed': !isOpen }" :key="refershChatHistory">
            <div v-for="(chat,index) of chats" :key="chat.id" class="chat-item" :class="(chat._id== selectedId)? 'active':''"
            @click="navigateToChat(chat._id)">
                <span>
                    {{ chat.title || `chat ${index+1}` }}
                </span>
            </div>
        </div>

        <!-- Make the user profile section clickable -->
        <div v-if="loggedInUser" class="user-profile-sidebar" @click="showLogoutDialog = true">
            <img  :src="loggedInUser.photoURL" referrerpolicy="no-referrer" class="profile-pic">
            <span v-if="isOpen" class="user-name">{{ loggedInUser.displayName || loggedInUser.email }}</span>
        </div>
        <div v-else class="default-profile" >
            <span class="default-pic">
                <img  src="../assets/logo/default-user.svg" >
            </span>
            <span >Sign in</span>
        </div>

        <!-- Vuetify Logout Dialog -->
        <v-dialog
            v-model="showLogoutDialog"
            max-width="300"
        >
            <v-card>
                <v-card-text>
                    Are you sure you want to log out?
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer> <!-- Pushes buttons to the right -->
                    <v-btn
                        color="grey darken-1"
                        text
                        @click="showLogoutDialog = false"
                    >
                        Cancel
                    </v-btn>
                    <v-btn
                        color="red darken-1"
                        text
                        @click="handleLogout"
                    >
                        Logout
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

    </section>
</template>

<script>
import { ref, onMounted } from 'vue';
import { auth } from '../firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
// Import Vuetify components for the dialog
import { VDialog, VCard, VCardText, VCardActions, VBtn, VSpacer } from 'vuetify/components';


export default {
    name:'sidBar',
    components: { // Register Vuetify components
        VDialog,
        VCard,
        VCardText,
        VCardActions,
        VBtn,
        VSpacer
    },
    data() {
        return {
            isOpen:true,
            chats: [],
            selectedId:null,
            refershChatHistory:0
        }
    },
    setup() {
        const loggedInUser = ref(null);
        const showLogoutDialog = ref(false); // Reactive state for dialog visibility

        onMounted(() => {
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    const userProfile = {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                    }
                    loggedInUser.value = userProfile;
                } else {
                    loggedInUser.value = null;
                }
            });
        });


        return {
             loggedInUser,
             showLogoutDialog,
        };
    },
    async mounted() {
        await this.fetchChats()
        if(this.$route.params.id) this.selectedId=this.$route.params.id
    },
    methods: {
        async fetchChats() {
            try {
                const idToken = localStorage.getItem('firebaseIdToken');

                if (!idToken) {
                     console.log('No ID token found in local storage, skipping chat history fetch.');
                     this.chats = [];
                     return;
                }


                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/history`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${idToken}` // Use the token from local storage
                    }
                });

                 if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Error fetching chat history:', response.status, errorData);

                     if (response.status === 401 || response.status === 403) {
                         await signOut(auth);
                         localStorage.removeItem('firebaseIdToken')
                         localStorage.removeItem('firebaseUser')
                         this.$router.push('/login')
                     }
                     throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                this.chats = data;
                console.log('Chat history fetched:', this.chats);

            } catch (error) {
                console.error('Error fetching chat history:', error);
                // Additional error handling here
            }
        },
        navigateToChat(id) {
            this.selectedId=id
            this.refershChatHistory++
            this.$router.replace(`/chat/${id}`)
        },
        toggleSidebar(){
            this.isOpen=!this.isOpen
        },       
        async handleLogout() {
            try {
                await signOut(auth);
                console.log('User logged out successfully');
                this.showLogoutDialog = false;
                localStorage.removeItem('firebaseIdToken')
                localStorage.removeItem('firebaseUser')
                this.$emit('logout',true)
                this.$router.push('/login');
            } catch (error) {
                console.error('Error logging out:', error);
            }
        },
        navigateToHome() {
            console.log('Navigating to home.');
            this.selectedId=''
            this.refershChatHistory++
            this.$router.push('/');
        }
    }
}
</script>

<style scoped>
.logo{
  /* border-bottom: 1px solid oklch(var(--text-color)/.1); */
  color: var(--primary-color); cursor: pointer;
  font-weight: bolder;
}
.side-bar{
    width: 15dvw;
    transition: all 0.3s ease;
    overflow-y: auto;
    overflow-x: hidden;
    height: calc(100vh - 10rem); 
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
  border-bottom: 1px solid oklch(var(--text-color)/.1);

}

.side-bar.closed {
    width: 0;
    padding: 0;
    overflow: hidden;
}

.chat-item {
    padding: .5rem;
    color: white;
    cursor: pointer;
    white-space: nowrap;
    border-radius: var(--rounded-box);
    max-width: 100%;
    align-items: center;
    display: flex;
    margin-bottom: 0.25rem;
}
.chat-item span{
    overflow: hidden;
    text-overflow: ellipsis;
}
.active{
    background-color: oklch(var(--bg3))
}
.chat-item:hover {
    background-color: oklch(var(--bg3))
}
.sidebar-container{
  margin: .5rem;
  margin-right: 0rem;
  display: flex;
  flex-direction: column;
}
.sidebar-toggle {
  display: flex;
  padding:.5em ;
  min-height: fit-content;
  height: 3.75rem;
  cursor: pointer;
  align-items: center ;
  text-align: center;
  border-bottom: 1px solid oklch(var(--text-color)/.1);

  /* box-shadow: 2px 0 4px rgba(0,0,0,0.1); */
}

/* User Profile Display at the Bottom of the Sidebar - Made clickable */
.user-profile-sidebar {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background-color: oklch(var(--bg4));
  color: oklch(var(--text-color));
  gap: 0.75rem;
  margin-top: auto;
  border-radius: var(--rounded-box);
  flex-shrink: 0;
  height: 5rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
} 
.default-profile{
    flex-direction: column;
    height: 5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--primary-color);

} 
.default-pic{
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background-color: var(--primary-color);
    display: flex;
    justify-content: center;
    align-items: center;
}
.default-pic img{
    width: 28px;
    height: 28px;
    border: 2px solid black;
    border-radius: 50%;
    object-fit: cover;

}

.user-profile-sidebar:hover {
    background-color: oklch(var(--bg4)/.8);
}

/* Reuse profile pic and user name styles */
.profile-pic {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
    font-size: 0.9em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>