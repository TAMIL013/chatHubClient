<template>
  <v-app>
    <v-main class="main font-poppins custom-scroll">
      
      <SideBar
        :is-open="true"
        ref="sidebar"
        :key="sidebarKey"
        @logout="handleLogout"
      />
      <router-view @new-chat="handleNewChat" ></router-view>

    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import SideBar from './components/sideBar.vue'

const sidebar = ref(null)
const sidebarKey = ref(0)

const handleNewChat = (chatData) => {
  console.log('test',sidebar.value)
  sidebarKey.value++
}
const handleLogout=()=>{
  sidebarKey.value++
}
</script>

<style >
@import './assets/css/common.css';
.main{
  display: flex;
  flex-direction: row;
  background-color: oklch(var(--bg2));
  color: black !important;
  position: relative;
  max-width: 100dvw;
  
}
</style>