import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";
import Player from "./pages/Player";
import Host from "./pages/Host";
import Karaoke from "./pages/Karaoke";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Route principali */}
          <Route path="/player" element={<Player />} />
          <Route path="/karaoke" element={<Karaoke />} />
          <Route path="/host" element={<Host />} />
          <Route path="/" element={<Player  />} />

          {/* Route di default: se l'URL non corrisponde a nulla, vai su /player */}
          <Route path="*" element={<Navigate to="/player" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
