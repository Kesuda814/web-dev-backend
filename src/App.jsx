import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Home";
import LoginPage from "./Login";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}