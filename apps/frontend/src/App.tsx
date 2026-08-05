import "./index.css";

import { BrowserRouter, Route, Routes } from "react-router";
import Landing from "./pages/Landing";
import Appbar from "./components/Appbar";
import Signin from "./pages/Signin";
import Dashboard from "./pages/Dashboard";
import VideoCreator from "./pages/VideoCreator";
import Signup from "./pages/Signup";

export function App() {
  return (
    <div>
      <BrowserRouter>
      <Appbar /> 
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/video-creator" element={<VideoCreator />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
