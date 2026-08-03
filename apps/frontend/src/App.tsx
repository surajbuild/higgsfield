import "./index.css";

import { BrowserRouter, Route, Routes } from "react-router";
import Landing from "./pages/Landing";
import Appbar from "./components/Appbar";

export function App() {
  return (
    <div>
      <Appbar />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
