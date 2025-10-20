import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@arco-design/web-react/dist/css/arco.css";
import "@/components/index.css";
import "@/index.css";

createRoot(document.getElementById("root")!).render(<App />);
