import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProblemList from "./pages/ProblemList";
import ProblemDetail from "./pages/ProblemDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";


function App() {
return (
    <BrowserRouter>
      <Routes>
        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/problems" element={<ProblemList />} />
         <Route path="/problems/:id" element={<ProblemDetail />} />

        {/* Default route */}
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}


export default App;