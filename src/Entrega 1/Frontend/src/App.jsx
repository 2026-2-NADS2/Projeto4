import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./paginas/Landing.jsx";
import Perfil from "./paginas/Perfil.jsx";
import Login from "./paginas/Login.jsx";
import DashboardResponsavel from "./paginas/DashboardResponsavel.jsx";
import DashboardProfessor from "./paginas/DashboardProfessor.jsx";
import DashboardAdmin from "./paginas/DashboardAdmin.jsx";
import NaoEncontrada from "./paginas/NaoEncontrada.jsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/perfil" element={<Perfil />} />
                <Route path="/login" element={<Login />} />
                <Route path="/responsavel" element={<DashboardResponsavel />} />
                <Route path="/professor" element={<DashboardProfessor />} />
                <Route path="/admin" element={<DashboardAdmin />} />
                <Route path="*" element={<NaoEncontrada />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;