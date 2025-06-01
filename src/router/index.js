import { createRouter, createWebHistory } from 'vue-router'
import Home from '../screens/Home.vue'
import Login from '../screens/Login.vue'
import Chat from '../screens/Chat.vue'

// Import Firebase auth
import { auth } from '../firebase/config'
import { onAuthStateChanged } from 'firebase/auth'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: { requiresAuth: true } // Protect this route
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { requiresGuest: true } // Only for unauthenticated users
  },
  {
    path: '/chat/:id',
    name: 'chat',
    component: Chat,
    props: true,
    meta: { requiresAuth: true } // Also protect chat routes
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

let isFirebaseInitialized = false
onAuthStateChanged(auth, () => {
  isFirebaseInitialized = true
})

router.beforeEach(async (to, from, next) => {
  if (!isFirebaseInitialized) {
    await new Promise(resolve => {
      const unsubscribe = onAuthStateChanged(auth, () => {
        unsubscribe()
        resolve()
      })
    })
    isFirebaseInitialized = true
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)

  const storedToken = localStorage.getItem('firebaseIdToken'); 
  const user = auth.currentUser; 

  if (storedToken) {
      if (requiresGuest && user) { 
           next('/') 
      } else if (requiresAuth && !user) {
            next('/login');
      }
      else {
         next(); 
      }

  } else {
      if (user) {
        try {
            const idToken = await user.getIdToken();
             localStorage.setItem('firebaseIdToken', idToken); 
             localStorage.setItem('firebaseUser', JSON.stringify({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
            }));
            if (requiresGuest) {
                next('/') 
            } else {
                next(); 
            }

        } catch (error) {
            console.error('Failed to get ID token:', error);
             localStorage.removeItem('firebaseIdToken'); 
             localStorage.removeItem('firebaseUser'); 
             if (requiresAuth) { 
                 next('/login'); 
             } else {
                 next(); 
             }
        }
      } else {
        if (requiresAuth) {
          next('/login');
        } else {
          next();
        }
      }
  }

});

export default router 