// Almacenes del panel: dónde se leen y escriben los archivos de contenido.
// Las rutas son relativas a la raíz del repositorio (p. ej. «src/content/cursos/x.md»).
//   almacenDisco(root)  escribe en los archivos del proyecto (npm run dev)
//   almacenGitHub(...)  lee la rama de GitHub y guarda cada cambio como un commit;
//                       el commit dispara la nueva publicación en Vercel (y en GitHub Pages)
import fs from 'node:fs/promises';

export function almacenDisco(root) {
  const url = (ruta) => new URL(ruta, root);
  return {
    remoto: false,
    async listar(dir) {
      return fs.readdir(url(dir + '/')).catch(() => []);
    },
    async leer(ruta) {
      return fs.readFile(url(ruta)).catch(() => null);
    },
    async existe(ruta) {
      return fs.access(url(ruta)).then(() => true, () => false);
    },
    async escribir(cambios) {
      for (const { ruta, contenido } of cambios) {
        if (contenido === null) await fs.rm(url(ruta), { force: true });
        else await fs.writeFile(url(ruta), contenido);
      }
    },
  };
}

// Los blobs de git no cambian nunca: se guardan en memoria mientras la función siga viva.
const blobs = new Map();

export function almacenGitHub({ token, repo, rama = 'main', api = 'https://api.github.com' }) {
  async function gh(metodo, ruta, body) {
    const res = await fetch(`${api}/repos/${repo}${ruta}`, {
      method: metodo,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'rivsan-panel',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const err = new Error(`GitHub respondió ${res.status} en ${metodo} ${ruta}`);
      err.status = res.status === 401 || res.status === 403 || res.status === 404 ? 502 : res.status;
      err.github = res.status;
      throw err;
    }
    return res.json();
  }

  // Árbol completo de la rama (ruta → sha), una sola llamada por petición al panel.
  let arbol = null;
  function leerArbol() {
    arbol ??= gh('GET', `/git/trees/${encodeURIComponent(rama)}?recursive=1`).then(
      (t) => new Map(t.tree.filter((n) => n.type === 'blob').map((n) => [n.path, n.sha])),
    );
    return arbol;
  }

  async function commit(cambios, mensaje) {
    const ref = await gh('GET', `/git/ref/heads/${encodeURIComponent(rama)}`);
    const padre = await gh('GET', `/git/commits/${ref.object.sha}`);
    const tree = await Promise.all(
      cambios.map(async ({ ruta, contenido }) => ({
        path: ruta,
        mode: '100644',
        type: 'blob',
        sha:
          contenido === null
            ? null
            : (await gh('POST', '/git/blobs', { content: Buffer.from(contenido).toString('base64'), encoding: 'base64' })).sha,
      })),
    );
    const nuevoArbol = await gh('POST', '/git/trees', { base_tree: padre.tree.sha, tree });
    const nuevo = await gh('POST', '/git/commits', { message: mensaje, tree: nuevoArbol.sha, parents: [ref.object.sha] });
    await gh('PATCH', `/git/refs/heads/${encodeURIComponent(rama)}`, { sha: nuevo.sha });
  }

  return {
    remoto: true,
    async listar(dir) {
      const pre = dir.replace(/\/?$/, '/');
      return [...(await leerArbol()).keys()].filter((p) => p.startsWith(pre) && !p.slice(pre.length).includes('/')).map((p) => p.slice(pre.length));
    },
    async leer(ruta) {
      const sha = (await leerArbol()).get(ruta);
      if (!sha) return null;
      if (!blobs.has(sha)) blobs.set(sha, Buffer.from((await gh('GET', `/git/blobs/${sha}`)).content, 'base64'));
      return blobs.get(sha);
    },
    async existe(ruta) {
      return (await leerArbol()).has(ruta);
    },
    async escribir(cambios, mensaje) {
      try {
        await commit(cambios, mensaje);
      } catch (e) {
        // 422: la rama avanzó entre la lectura y la escritura (otro guardado a la vez). Se reintenta una vez.
        if (e.github !== 422) throw e;
        await commit(cambios, mensaje);
      }
      arbol = null;
    },
  };
}
