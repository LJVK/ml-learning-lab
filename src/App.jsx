import { BrowserRouter, Routes, Route } from "react-router-dom";


import Layout from "./components/Layout";
import Home from "./pages/Home";
import Concepts from "./pages/Concepts";
import ConceptDetail from "./pages/ConceptDetail";
import Code from "./pages/Code";
import Questions from "./pages/Questions";
import Roadmap from "./pages/Roadmap";
import Resources from "./pages/Resources";

function App() {
  return (
    <BrowserRouter basename="/ml-learning-lab">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="concepts" element={<Concepts />} />
          <Route path="concepts/:conceptId" element={<ConceptDetail />} />
          <Route path="code" element={<Code />} />
          <Route path="questions" element={<Questions />} />
          <Route path="roadmap" element={<Roadmap />} />
          <Route path="resources" element={<Resources />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;