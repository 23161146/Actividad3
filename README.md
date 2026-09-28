# componente-toast

**Nombre** : Santos Ríos Ángel Omar

**Problema que resuelve:** `alert()` congela toda la página hasta que el
usuario le da clic a "Aceptar", se ve distinto en cada navegador y no se
puede personalizar ni mostrar más de uno a la vez. `componente-toast`
muestra notificaciones flotantes con estilo propio —éxito, error,
advertencia o información— que se cierran solas, se pausan al pasar el
mouse y no interrumpen lo que el usuario está haciendo, en cualquier
proyecto donde se incluya con dos líneas:
`<link rel="stylesheet" href="css/componente.css">` y
`<script src="js/componente.js"></script>`.

> Demo en vivo: `https://<tu-usuario>.github.io/<tu-repo>/`
> (agrega aquí el link una vez activado GitHub Pages)

---

## Instalación

Copia las carpetas `css/` y `js/` a tu proyecto y agrégalas en tu HTML:

```html
<link rel="stylesheet" href="css/componente.css">
<script src="js/componente.js"></script>
<script>
  // aquí ya puedes usar mostrarToast(), Toast.exito(), etc.
</script>
```

No requiere `npm install` ni build: son un archivo CSS y un archivo
JavaScript vanilla, sin dependencias.

---

## Uso

La función queda disponible como global y también agrupada en
`window.Toast`, por si prefieres usarla con espacio de nombres.

### 1. `mostrarToast(mensaje, opciones)`

Muestra una notificación flotante. Es la función principal del componente.

```js
mostrarToast("Cambios guardados");
mostrarToast("No se pudo conectar con el servidor", { tipo: "error" });
mostrarToast("Esto no se cierra solo", { tipo: "advertencia", duracion: 0 });
```

### 2. `Toast.exito(mensaje)` / `Toast.error(mensaje)` / `Toast.info(mensaje)` / `Toast.advertencia(mensaje)`

Atajos de `mostrarToast()` para el tipo más común, sin tener que escribir
el objeto de opciones.

```js
Toast.exito("Perfil actualizado");
Toast.error("Correo o contraseña incorrectos");
Toast.advertencia("Tu sesión está por expirar");
Toast.info("Hay una nueva versión disponible");
```

### 3. `mostrarToast(...).cerrar()`

Cada llamada regresa un control para cerrar ese toast específico desde tu
propio código, por ejemplo cuando termina una tarea larga.

```js
const control = mostrarToast("Subiendo archivo...", { duracion: 0 });
subirArchivo().then(() => {
  control.cerrar();
  Toast.exito("Archivo subido correctamente");
});
```

### 4. `limpiarToasts()`

Cierra todas las notificaciones visibles en ese momento.

```js
limpiarToasts(); // o Toast.limpiar()
```

---

## Capturas de pantalla

```markdown
![Los 4 tipos de toast mostrados a la vez](img/Captura%20de%20pantalla%202026-09-27%20192426.png)
![Formulario personalizado generando un toast dinámico](img/Captura%20de%20pantalla%202026-09-27%20192450.png)
![Formulario de contacto mostrando el toast de error](img/Captura%20de%20pantalla%202026-09-27%20192519.png)
```

---

## Video demo

> **Video:** `https://youtu.be/Pbb1h6BVAWo`
