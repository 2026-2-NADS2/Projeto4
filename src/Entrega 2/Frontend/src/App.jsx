import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import RotaProtegida from "./componentes/RotaProtegida.jsx";
import Auditoria from "./paginas/admin/Auditoria.jsx";
import {
  AlunoForm,
  Alunos,
  ProfessorForm,
  Professores,
  ResponsavelForm,
  Responsaveis,
} from "./paginas/admin/Cadastros.jsx";
import {
  Disciplinas,
  Periodos,
  TurmaDetalhe as AdminTurmaDetalhe,
  Turmas as AdminTurmas,
  Vinculos,
} from "./paginas/admin/Estrutura.jsx";
import AdminPainel from "./paginas/admin/Painel.jsx";
import Relatorios from "./paginas/admin/Relatorios.jsx";
import { RevisaoDetalhe, RevisaoLista } from "./paginas/admin/Revisao.jsx";
import Configuracoes from "./paginas/comuns/Configuracoes.jsx";
import Perfil from "./paginas/comuns/Perfil.jsx";
import HistoricoFamilia from "./paginas/familia/Historico.jsx";
import Imprimir from "./paginas/familia/Imprimir.jsx";
import PainelFamilia from "./paginas/familia/Painel.jsx";
import { RelatorioDetalhe, RelatoriosFamilia } from "./paginas/familia/Relatorios.jsx";
import Selecionar from "./paginas/familia/Selecionar.jsx";
import ProfessorPainel from "./paginas/professor/Painel.jsx";
import {
  RegistroDetalhe,
  RegistroForm,
  RegistroPrevia,
  Registros as ProfessorRegistros,
} from "./paginas/professor/Registros.jsx";
import {
  AlunoDetalhe as ProfessorAlunoDetalhe,
  TurmaDetalhe as ProfessorTurmaDetalhe,
  Turmas as ProfessorTurmas,
} from "./paginas/professor/Turmas.jsx";
import AcessoNegado from "./paginas/publico/AcessoNegado.jsx";
import Cadastro from "./paginas/publico/Cadastro.jsx";
import CriarConta from "./paginas/publico/CriarConta.jsx";
import Documentacao from "./paginas/publico/Documentacao.jsx";
import Entrar from "./paginas/publico/Entrar.jsx";
import Inicio from "./paginas/publico/Inicio.jsx";
import Login from "./paginas/publico/Login.jsx";
import NaoEncontrada from "./paginas/publico/NaoEncontrada.jsx";
import Privacidade from "./paginas/publico/Privacidade.jsx";
import RecuperarSenha from "./paginas/publico/RecuperarSenha.jsx";
import SessaoExpirada from "./paginas/publico/SessaoExpirada.jsx";

function ScrollAoTopo() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollAoTopo />
      <Routes>
        {/* Público */}
        <Route path="/" element={<Inicio />} />
        <Route path="/entrar" element={<Entrar />} />
        <Route path="/entrar/:perfil" element={<Login />} />
        <Route path="/criar-conta" element={<CriarConta />} />
        <Route path="/criar-conta/:perfil" element={<Cadastro />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/privacidade" element={<Privacidade />} />
        <Route path="/documentacao" element={<Documentacao />} />
        <Route path="/sessao-expirada" element={<SessaoExpirada />} />
        <Route path="/acesso-negado" element={<AcessoNegado />} />

        {/* Coordenação */}
        <Route path="/admin" element={<Navigate to="/admin/painel" replace />} />
        <Route
          path="/admin/painel"
          element={
            <RotaProtegida perfil="administrador">
              <AdminPainel />
            </RotaProtegida>
          }
        />
        <Route
          path="/admin/alunos"
          element={
            <RotaProtegida perfil="administrador">
              <Alunos />
            </RotaProtegida>
          }
        />
        <Route
          path="/admin/alunos/novo"
          element={
            <RotaProtegida perfil="administrador">
              <AlunoForm />
            </RotaProtegida>
          }
        />
        <Route
          path="/admin/alunos/:id/editar"
          element={
            <RotaProtegida perfil="administrador">
              <AlunoForm />
            </RotaProtegida>
          }
        />
        <Route
          path="/admin/professores"
          element={
            <RotaProtegida perfil="administrador">
              <Professores />
            </RotaProtegida>
          }
        />
        <Route
          path="/admin/professores/novo"
          element={
            <RotaProtegida perfil="administrador">
              <ProfessorForm />
            </RotaProtegida>
          }
        />
        <Route
          path="/admin/professores/:id/editar"
          element={
            <RotaProtegida perfil="administrador">
              <ProfessorForm />
            </RotaProtegida>
          }
        />
        <Route
          path="/admin/responsaveis"
          element={
            <RotaProtegida perfil="administrador">
              <Responsaveis />
            </RotaProtegida>
          }
        />
        <Route
          path="/admin/responsaveis/novo"
          element={
            <RotaProtegida perfil="administrador">
              <ResponsavelForm />
            </RotaProtegida>
          }
        />
        <Route
          path="/admin/responsaveis/:id/editar"
          element={
            <RotaProtegida perfil="administrador">
              <ResponsavelForm />
            </RotaProtegida>
          }
        />
        <Route
          path="/admin/turmas"
          element={
            <RotaProtegida perfil="administrador">
              <AdminTurmas />
            </RotaProtegida>
          }
        />
        <Route
          path="/admin/turmas/:id"
          element={
            <RotaProtegida perfil="administrador">
              <AdminTurmaDetalhe />
            </RotaProtegida>
          }
        />
        <Route
          path="/admin/disciplinas"
          element={
            <RotaProtegida perfil="administrador">
              <Disciplinas />
            </RotaProtegida>
          }
        />
        <Route
          path="/admin/vinculos"
          element={
            <RotaProtegida perfil="administrador">
              <Vinculos />
            </RotaProtegida>
          }
        />
        <Route
          path="/admin/periodos"
          element={
            <RotaProtegida perfil="administrador">
              <Periodos />
            </RotaProtegida>
          }
        />
        <Route
          path="/admin/revisao"
          element={
            <RotaProtegida perfil="administrador">
              <RevisaoLista />
            </RotaProtegida>
          }
        />
        <Route
          path="/admin/revisao/:id"
          element={
            <RotaProtegida perfil="administrador">
              <RevisaoDetalhe />
            </RotaProtegida>
          }
        />
        <Route
          path="/admin/relatorios"
          element={
            <RotaProtegida perfil="administrador">
              <Relatorios />
            </RotaProtegida>
          }
        />
        <Route
          path="/admin/auditoria"
          element={
            <RotaProtegida perfil="administrador">
              <Auditoria />
            </RotaProtegida>
          }
        />
        <Route
          path="/admin/perfil"
          element={
            <RotaProtegida perfil="administrador">
              <Perfil papel="admin" />
            </RotaProtegida>
          }
        />
        <Route
          path="/admin/configuracoes"
          element={
            <RotaProtegida perfil="administrador">
              <Configuracoes papel="admin" />
            </RotaProtegida>
          }
        />

        {/* Professor */}
        <Route path="/professor" element={<Navigate to="/professor/painel" replace />} />
        <Route
          path="/professor/painel"
          element={
            <RotaProtegida perfil="professor">
              <ProfessorPainel />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/turmas"
          element={
            <RotaProtegida perfil="professor">
              <ProfessorTurmas />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/turmas/:id"
          element={
            <RotaProtegida perfil="professor">
              <ProfessorTurmaDetalhe />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/alunos/:id"
          element={
            <RotaProtegida perfil="professor">
              <ProfessorAlunoDetalhe />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/registros"
          element={
            <RotaProtegida perfil="professor">
              <ProfessorRegistros />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/registros/:id"
          element={
            <RotaProtegida perfil="professor">
              <RegistroDetalhe />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/registro/novo"
          element={
            <RotaProtegida perfil="professor">
              <RegistroForm />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/registro/:id/editar"
          element={
            <RotaProtegida perfil="professor">
              <RegistroForm />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/registro/:id/previa"
          element={
            <RotaProtegida perfil="professor">
              <RegistroPrevia />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/perfil"
          element={
            <RotaProtegida perfil="professor">
              <Perfil papel="professor" />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/configuracoes"
          element={
            <RotaProtegida perfil="professor">
              <Configuracoes papel="professor" />
            </RotaProtegida>
          }
        />

        {/* Família */}
        <Route path="/familia" element={<Navigate to="/familia/selecionar" replace />} />
        <Route
          path="/familia/selecionar"
          element={
            <RotaProtegida perfil="responsavel">
              <Selecionar />
            </RotaProtegida>
          }
        />
        <Route
          path="/familia/painel"
          element={
            <RotaProtegida perfil="responsavel">
              <PainelFamilia />
            </RotaProtegida>
          }
        />
        <Route
          path="/familia/relatorios"
          element={
            <RotaProtegida perfil="responsavel">
              <RelatoriosFamilia />
            </RotaProtegida>
          }
        />
        <Route
          path="/familia/relatorios/:id"
          element={
            <RotaProtegida perfil="responsavel">
              <RelatorioDetalhe />
            </RotaProtegida>
          }
        />
        <Route
          path="/familia/historico"
          element={
            <RotaProtegida perfil="responsavel">
              <HistoricoFamilia />
            </RotaProtegida>
          }
        />
        <Route
          path="/familia/imprimir/:id"
          element={
            <RotaProtegida perfil="responsavel">
              <Imprimir />
            </RotaProtegida>
          }
        />
        <Route
          path="/familia/perfil"
          element={
            <RotaProtegida perfil="responsavel">
              <Perfil papel="familia" />
            </RotaProtegida>
          }
        />
        <Route
          path="/familia/configuracoes"
          element={
            <RotaProtegida perfil="responsavel">
              <Configuracoes papel="familia" />
            </RotaProtegida>
          }
        />

        <Route path="*" element={<NaoEncontrada />} />
      </Routes>
    </>
  );
}
