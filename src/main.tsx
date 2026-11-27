import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import 'katex/dist/katex.min.css';
import './index.css';
// Applies the saved light/dark choice and follows the system setting.
import './store/themeStore';

createRoot(document.getElementById('root')!).render(<App />);
