import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import asyncModal from './use/async-modal'

createApp(App).use(asyncModal).mount('#app')
