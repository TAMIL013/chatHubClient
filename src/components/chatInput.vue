<template>
<div class="chat-input">
    <div class="toolbar-container">
        
    </div>
    <textarea 
        v-model="currentChat" 
        class="input-field"
        @keydown.enter.prevent="ask"
        @input="adjustHeight"
        placeholder="Ask anything..."
        ref="textarea"
    ></textarea>
</div>
</template>

<script>
export default {
    name:'chatInput',
    data() {
        return {
            currentChat:'',
            selectedModel: 'gpt-4',
            models: [
                { title: 'GPT-4', value: 'gpt-4' },
                { title: 'GPT-3.5', value: 'gpt-3.5' },
                { title: 'Claude', value: 'claude' },
                { title: 'Mistral', value: 'mistral' }
            ]
        }
    },
    methods: {
        ask(){
            this.$emit('chatEmitter',this.currentChat)
            this.currentChat=''
            console.log(this.currentChat)
        },
        adjustHeight() {
            const textarea = this.$refs.textarea;
            textarea.style.height = 'auto';
            const newHeight = Math.min(textarea.scrollHeight, 160); // 10rem = 160px
            textarea.style.height = newHeight + 'px';
        }
    },
    mounted() {
        this.adjustHeight();
    }
}
</script>

<style scoped>
.chat-input{
    width: 50dvw;
    display: flex;
    flex-direction: column;
    background-color: oklch(var(--bg2));
    padding: 1rem;
    margin: .5rem 0em;
    position: relative;
    border-radius: var(--rounded-box);
    border: 1px solid oklch(var(--text-color)/.1);
    height: fit-content;
    max-height: 100%;
    overflow: hidden;
}

.input-field {
    width: 100%;
    max-height: 10rem;
    border: none;
    resize: none;
    overflow-y: auto;
    font-family: inherit;
    box-sizing: border-box;
    display: block;
    background: transparent;
}

/* Scrollbar Styles */

.toolbar-container {
    display: flex;
    justify-content: flex-end;
    padding-top: 0.5rem;
}

.input-field:focus {
    outline: none;
    border-color: #666;
}
</style>