/**
 * ============================================================================
 *  componente.js — Toasts (notificaciones flotantes)
 * ----------------------------------------------------------------------------
 *  Componente visual interactivo, reutilizable, sin frameworks.
 *  Muestra notificaciones flotantes que aparecen, se pueden pausar con el
 *  mouse, cerrar con clic y desaparecen solas después de un tiempo — en vez
 *  de usar alert(), que congela la página y no se puede personalizar.
 *
 *  Uso mínimo:
 *      <link rel="stylesheet" href="css/componente.css">
 *      <script src="js/componente.js"></script>
 *      <script>
 *          mostrarToast("Cambios guardados");
 *      </script>
 * ============================================================================
 */

(function () {

  const ICONOS = {
    info: 'i',
    exito: '✓',
    error: '✕',
    advertencia: '!',
  };

  // Un contenedor <div> distinto por cada posición usada en la página,
  // para poder mostrar toasts en varias esquinas a la vez si se quiere.
  const contenedores = {};

  // Registro de los toasts activos, para poder cerrarlos todos con limpiar().
  const activos = [];

  /**
   * Obtiene (o crea si no existe) el contenedor fijo de una posición dada.
   * @param {string} posicion - Una de: "arriba-derecha", "arriba-izquierda",
   *        "abajo-derecha", "abajo-izquierda".
   * @returns {HTMLElement} El contenedor donde se apilan los toasts.
   */
  function obtenerContenedor(posicion) {
    if (!contenedores[posicion]) {
      const div = document.createElement('div');
      div.className = 'toast-contenedor';
      div.dataset.posicion = posicion;
      document.body.appendChild(div);
      contenedores[posicion] = div;
    }
    return contenedores[posicion];
  }

  /**
   * Muestra una notificación tipo "toast" en pantalla. Es la función
   * principal del componente: cada llamada crea un toast nuevo, con su
   * propio mensaje, tipo, duración y posición — nada queda fijo ("hardcodeado"),
   * todo se recibe por parámetro.
   *
   * @param {string} mensaje - Texto a mostrar (se inserta como texto plano,
   *        nunca como HTML, para evitar inyección de código).
   * @param {Object|string} [opciones] - Objeto de configuración, o un string
   *        corto como atajo para el tipo (p. ej. mostrarToast("Listo", "exito")).
   * @param {"info"|"exito"|"error"|"advertencia"} [opciones.tipo="info"] - Estilo del toast.
   * @param {number} [opciones.duracion=4000] - Milisegundos antes de auto-cerrarse.
   *        Usa 0 para que no se cierre solo (el usuario debe cerrarlo con clic).
   * @param {"arriba-derecha"|"arriba-izquierda"|"abajo-derecha"|"abajo-izquierda"} [opciones.posicion="arriba-derecha"]
   * @returns {{cerrar: Function}} Un control para cerrar ese toast específico
   *          desde tu propio código, por ejemplo tras terminar una tarea.
   *
   * @example
   * mostrarToast("Perfil actualizado correctamente");
   * mostrarToast("No se pudo conectar con el servidor", { tipo: "error" });
   * mostrarToast("Esto no se cierra solo", { tipo: "advertencia", duracion: 0 });
   * const control = mostrarToast("Subiendo archivo...", { duracion: 0 });
   * // más tarde, cuando termine la tarea real:
   * control.cerrar();
   */
  function mostrarToast(mensaje, opciones = {}) {
    if (typeof opciones === 'string') {
      opciones = { tipo: opciones };
    }
    const {
      tipo = 'info',
      duracion = 4000,
      posicion = 'arriba-derecha',
    } = opciones;

    const contenedor = obtenerContenedor(posicion);

    const toast = document.createElement('div');
    toast.className = `toast toast--${tipo}`;
    toast.setAttribute('role', 'status');

    const icono = document.createElement('span');
    icono.className = 'toast__icono';
    icono.textContent = ICONOS[tipo] || ICONOS.info;

    const texto = document.createElement('span');
    texto.className = 'toast__mensaje';
    texto.textContent = mensaje; // textContent, nunca innerHTML: evita inyección.

    const botonCerrar = document.createElement('button');
    botonCerrar.className = 'toast__cerrar';
    botonCerrar.type = 'button';
    botonCerrar.setAttribute('aria-label', 'Cerrar notificación');
    botonCerrar.innerHTML = '&times;';

    const barra = document.createElement('span');
    barra.className = 'toast__progreso';
    if (duracion > 0) {
      barra.style.animationDuration = duracion + 'ms';
    } else {
      barra.style.display = 'none';
    }

    toast.append(icono, texto, botonCerrar, barra);
    contenedor.appendChild(toast);

    // Forzar reflow antes de agregar la clase de entrada, para que la
    // animación CSS sí se dispare (si no, el navegador la salta).
    requestAnimationFrame(() => toast.classList.add('toast--visible'));

    let inicio = Date.now();
    let restante = duracion;
    let temporizador = null;

    function iniciarTemporizador() {
      if (restante <= 0 && duracion > 0) return cerrar();
      if (duracion <= 0) return; // duracion 0 = no se autocierra
      inicio = Date.now();
      temporizador = setTimeout(cerrar, restante);
      barra.style.animationPlayState = 'running';
    }

    function pausarTemporizador() {
      if (!temporizador) return;
      clearTimeout(temporizador);
      temporizador = null;
      restante -= Date.now() - inicio;
      barra.style.animationPlayState = 'paused';
    }

    function cerrar() {
      if (temporizador) clearTimeout(temporizador);
      const i = activos.indexOf(control);
      if (i !== -1) activos.splice(i, 1);
      toast.classList.remove('toast--visible');
      toast.classList.add('toast--saliendo');
      toast.addEventListener('transitionend', () => toast.remove(), { once: true });
      // Respaldo por si transitionend no dispara (p. ej. pestaña en segundo plano).
      setTimeout(() => toast.remove(), 500);
    }

    toast.addEventListener('mouseenter', pausarTemporizador);
    toast.addEventListener('mouseleave', iniciarTemporizador);
    botonCerrar.addEventListener('click', cerrar);

    iniciarTemporizador();

    const control = { cerrar };
    activos.push(control);
    return control;
  }

  /**
   * Cierra todas las notificaciones que estén visibles en ese momento.
   * Útil, por ejemplo, al cambiar de página dentro de una SPA o al reiniciar
   * un formulario.
   *
   * @returns {void}
   *
   * @example
   * limpiarToasts();
   */
  function limpiarToasts() {
    activos.slice().forEach((control) => control.cerrar());
  }

  // API con espacio de nombres, para quien prefiera Toast.mostrar(...),
  // más atajos por tipo para escribir menos en el caso más común.
  const Toast = {
    mostrar: mostrarToast,
    limpiar: limpiarToasts,
    exito: (mensaje, extra) => mostrarToast(mensaje, { tipo: 'exito', ...normalizar(extra) }),
    error: (mensaje, extra) => mostrarToast(mensaje, { tipo: 'error', ...normalizar(extra) }),
    info: (mensaje, extra) => mostrarToast(mensaje, { tipo: 'info', ...normalizar(extra) }),
    advertencia: (mensaje, extra) => mostrarToast(mensaje, { tipo: 'advertencia', ...normalizar(extra) }),
  };

  function normalizar(extra) {
    if (extra === undefined) return {};
    if (typeof extra === 'number') return { duracion: extra };
    return extra;
  }

  if (typeof window !== 'undefined') {
    window.mostrarToast = mostrarToast;
    window.limpiarToasts = limpiarToasts;
    window.Toast = Toast;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { mostrarToast, limpiarToasts, Toast };
  }
})();
