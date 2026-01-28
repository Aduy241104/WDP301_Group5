import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ModalProvider } from "./context/ModalContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
   <StrictMode>
      <BrowserRouter>
         <AuthProvider>
            <ModalProvider>
               <ToastProvider>
                  <App />
               </ToastProvider>
            </ModalProvider>
         </AuthProvider>
      </BrowserRouter>
   </StrictMode>
);
