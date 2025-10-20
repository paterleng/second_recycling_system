import React from "react";
import { PhoneRecycling } from "./components/PhoneRecycling";
import { LanguageProvider } from "./components/LanguageContext";
import { DynamicTitle } from "./components/DynamicTitle";

export default function App() {
  return (
    <LanguageProvider>
      <DynamicTitle />
      <PhoneRecycling />
    </LanguageProvider>
  );
}
