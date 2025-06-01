<template>
  <section class="login-container">
    <div class="login-card">
      <div class="login-content">
        <h1 class="login-title">
          Sign up below to <span class="unlock-text">unlock</span> the full<br>
          potential of Chat Hub
        </h1>
        
        <p class="privacy-text">
          By continuing, you agree to our <a href="#" class="privacy-link">privacy policy</a>.
        </p>
        
        <div class="auth-buttons">
          <button @click="loginWithGoogle" class="google-btn">
            <img  src="../assets/logo/google.svg" alt="" class="google-icon" >
            Continue with Google
          </button>
          
        </div>
      </div>
    </div>
  </section>
</template>
  
<script>
  import { auth, provider } from "../firebase/config.js";
  import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
  import { useRouter } from 'vue-router';
  
  export default {
    data() {
      return {
        // data properties if needed
      };
    },
    setup() {
        const router = useRouter();

        const loginWithGoogle = async () => {
            try {
                const result = await signInWithPopup(auth, provider);
                const user = result.user;
  
                const idToken = await user.getIdToken();
  
                localStorage.setItem('firebaseUser', JSON.stringify({
                  uid: user.uid,
                  email: user.email,
                  displayName: user.displayName,
                  photoURL: user.photoURL,
                }));
                localStorage.setItem('firebaseIdToken', idToken);
                router.replace('/');
                window.location.reload();
            } catch (err) {
                console.error("Google login error", err);
                const errorCode = err.code;
                const errorMessage = err.message;
                const email = err.customData?.email;
                const credential = GoogleAuthProvider.credentialFromError(err);
                console.error("Error details:", errorCode, errorMessage, email, credential);
            }
        };

        return {
            loginWithGoogle
        }
    }
  }
</script>
<style scoped>
.login-container {
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

.login-card {
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid oklch(var(--text-color)/.1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  padding: 0;
}

.login-content {
  padding: 3rem 2.5rem;
  text-align: center;
}

.login-title {
  font-size: 1.75rem;
  font-weight: 400;
  color: #e2e8f0;
  margin-bottom: 1.5rem;
  line-height: 1.3;
  font-family: 'Georgia', serif;
}

.unlock-text {
  font-style: italic;
  color: #cbd5e0;
}

.privacy-text {
  color: #a0aec0;
  font-size: 0.9rem;
  margin-bottom: 2rem;
}

.privacy-link {
  color: #a0aec0;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.privacy-link:hover {
  color: #cbd5e0;
}

.auth-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.google-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background-color: #e2e8f0;
  color: #2d3748;
  border: none;
  border-radius: var(--rounded-box);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.google-btn:hover {
  transform: translateY(-1px);
}

.google-icon{
  flex-shrink: 0;
}

.divider {
  position: relative;
  margin: 1.5rem 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.2);
}

.divider-text {
  background-color: #2d3748;
  color: #a0aec0;
  padding: 0 1rem;
  font-size: 0.9rem;
  position: relative;
  z-index: 1;
}

.email-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.email-input {
  padding: 0.875rem 1rem;
  background-color: rgba(45, 55, 72, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s ease;
}

.email-input::placeholder {
  color: #a0aec0;
}

.email-input:focus {
  border-color: rgba(255, 255, 255, 0.4);
}

.email-btn {
  padding: 0.875rem 1.5rem;
  background-color: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.email-btn:hover {
  background-color: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.sso-text {
  color: #a0aec0;
  font-size: 0.875rem;
  margin-top: 1rem;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .login-container {
    padding: 1rem;
  }
  
  .login-content {
    padding: 2rem 1.5rem;
  }
  
  .login-title {
    font-size: 1.5rem;
  }
}
</style>
  
