const BASE = import.meta.env.VITE_API_URL || "/api";

export const getToken = () => localStorage.getItem("kfka.token");

export const setToken = (t) =>
    t ? localStorage.setItem("kfka.token", t) : localStorage.removeItem("kfka.token");

export async function api(caminho, { metodo = "GET", corpo } = {}) {
    const r = await fetch(BASE + caminho, {
        method: metodo,
        headers: {
            "Content-Type": "application/json",
            ...(getToken() && { Authorization: `Bearer ${getToken()}` })
        },
        body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });

    const json = await r.json().catch(() => ({}));
    if (!r.ok || json.sucesso === false) {
        const e = new Error(json.erro?.mensagem || "Falha na requisição");
        Object.assign(e, { status: r.status, codigo: json.erro?.codigo, detalhes: json.erro?.detalhes });
        throw e;
    }
    return json.dados;
}