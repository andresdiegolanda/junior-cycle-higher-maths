# Cuentas y actividad por alumno — implementación y puesta en marcha

Actualizado: 4 de noviembre de 2026.

## 1. Decisiones del piloto

- Sitio: https://junior-cycle-higher-maths.andresdiegolanda.workers.dev
- Máximo de diez cuentas en total, incluyendo al administrador e invitaciones pendientes.
- Administrador: `andresdiegolanda@gmail.com`.
- Acceso mediante un código que Cloudflare envía al email del usuario.
- Retención de actividad y progreso: seis meses calendario; limpieza diaria.
- Compilación y pruebas en el entorno local actual, sin despliegue de staging.
- Las notas escritas permanecen en el dispositivo; no se suben al servidor.

## 2. Estado actual

Versión publicada desde `main` el 4 de noviembre de 2026: commit `bf164eb`, versión Cloudflare `b760e1c9`. Activación coordinada autorizada por el propietario. Access, base D1 y cron diario confirmados en producción. Se verificó el ingreso del administrador y la persistencia de una lección, un intento, una pista y una respuesta correcta tras recargar. Ver `ACCOUNTS-VALIDATION.md` para la evidencia.

Ya se preparó en Cloudflare:

| Recurso | Valor |
| --- | --- |
| Cuenta | `cf55d6902d2f52c76ed5d15768434a61` |
| D1 | `junior-maths-activity` |
| ID de D1 | `b83a391f-e80d-4749-ac31-7e44dfc2972d` |
| Jurisdicción de la base | Unión Europea |
| Esquema aplicado | `migrations/0001_accounts.sql` |
| Registro de migración | `d1_migrations`: `0001_accounts.sql` |
| Usuario inicial | Andrés, administrador, pendiente del primer login |
| Equipo de Access | `https://young-wood-9dd6.cloudflareaccess.com` |
| Proveedor añadido | One-time PIN |
| Política | Junior Maths invited accounts |
| ID de política | `2b519dc4-7fcd-4787-a5a3-9a1990c5290a` |
| Email permitido inicialmente | `andresdiegolanda@gmail.com` |
| Duración de la política | 6 horas |

Access está aplicado a **All traffic**, con sesión de seis horas, tras autorización explícita para la transición. Aplicación: `32bb3d9d-29ed-4590-a4b7-f42c6a8f079e`.

`ACCESS_AUD` contiene el valor real de la aplicación Access y `npm run check:deploy` pasa. El AUD no es una contraseña: identifica la aplicación cuyos tokens se aceptan.

## 3. Probar el resultado ahora

Desde la raíz del repositorio, con Node 24+ y Python 3:

```sh
npm ci
npm run build
npm run test:accounts
npm run dev
```

Abrir http://127.0.0.1:8787/dev/login.

1. Entrar como **Test student A**, abrir una lección y resolver un ejercicio.
2. Abrir una pista y revelar pasos. Revisar **My activity**.
3. Cerrar sesión y entrar como **Test student B**. Su historial debe estar vacío.
4. Entrar como **Administrator**, abrir **Students** y revisar la actividad de A.
5. Probar **Invite a student** con un email ficticio `example.test` en este entorno local. El sistema prepara un correo; no lo envía.
6. Abrir otra pestaña y cambiar de cuenta. La pestaña anterior debe pedir reconectar cuando intente guardar o leer datos con la identidad anterior.
7. Probar una desconexión temporal y reconexión: lo pendiente se reenvía sin duplicarse. No cerrar sesión si se desea conservar actividad pendiente.

El servidor está limitado a `127.0.0.1`. Las identidades de prueba y SQLite local están separados del Worker de producción. `dev/.local-state/` está excluido de Git. Reiniciar el servidor local después de modificar el backend.

## 4. Qué registra

| Registro | Interpretación |
| --- | --- |
| Lección y paso abiertos | Consulta del contenido, no dominio demostrado |
| Inicio de ejercicio | Un intento; «Start a new attempt» inicia otro |
| Respuesta de opción múltiple | La corrección se calcula en el servidor |
| Pista o solución revelada | Ayuda consultada |
| Autoevaluación escrita | Declaración del alumno, no corrección automática |
| Confianza en una lección | Elección del alumno |
| Tiempo activo | Estimación con pestaña visible, foco e interacción reciente o audio |
| Sesión de estudio | Se inicia otra tras 30 minutos sin actividad registrada |

Los intervalos superpuestos no se suman dos veces. El temporizador no renueva su propio plazo de inactividad. Los eventos se muestran en orden temporal, incluso si llegaron juntos después de una desconexión.

Cada alumno tiene progreso y una cola de reintentos propios. Los identificadores evitan duplicados; las revisiones impiden que un dispositivo atrasado sobrescriba progreso más reciente. Una comprobación adicional impide atribuir la cola a otra cuenta cuando cambian las cookies. La identidad y el rol proceden siempre de un JWT verificado y de la base, nunca de un email declarado por el navegador.

## 5. Procedimiento de publicación

Esta fase cambia el sitio público. Completar y revisar las pruebas locales antes de iniciarla. No publicar una versión estática que omita el Worker de autenticación.

1. Revisar el cambio en Git y acordar una ventana breve de activación. Confirmar acceso del administrador a su email para recibir el primer PIN.
2. Con autorización para esa transición, aplicar **All traffic** al Worker usando **Junior Maths invited accounts**, duración 6 horas. La versión anterior quedará detrás del login; aún no registrará actividad.
3. Obtener el **Application Audience (AUD)** de la aplicación Access creada. Poner ese valor real en `wrangler.jsonc`; no inventarlo ni usar un token.
4. Verificar `ACCESS_TEAM_URL`, `APP_ORIGIN`, el ID de D1 y `run_worker_first: true`. La base ya tiene la migración inicial: no repetir el SQL completo. Las migraciones futuras se aplican con `wrangler d1 migrations apply`.
5. Cambiar los comandos de la integración Git en Cloudflare a los indicados debajo. Desactivar preview builds para este primer piloto; las URLs de preview están deshabilitadas también en el Worker.
6. Compilar, probar y ejecutar `npm run check:deploy`. Revisar y publicar el cambio en `main` cuando esté autorizado. La integración debe desplegar Worker, D1, recursos estáticos protegidos y cron.
7. Verificar en la web real: visitante anónimo recibe login; el administrador entra con PIN; su rol aparece; un ejercicio genera actividad; un email no invitado no accede; PDF y HTML individuales están protegidos.
8. Confirmar el cron diario `15 3 * * *`. No sembrar alumnos ficticios ni ejecutar pruebas destructivas en la base real.

| Campo Cloudflare | Valor |
| --- | --- |
| Build command | `npm ci && npm run build && npm run test:accounts` |
| Deploy command | `npm run deploy` |
| Root directory | Raíz del repositorio |
| Production branch | `main` |

No se ha contratado ni activado un plan de pago. Los límites y la facturación dependen del uso real y de la cuenta.

## 6. Invitar a un alumno

La entrega de invitaciones de este piloto es manual y visible:

1. **Students → Invite a student**: introducir nombre y email individual.
2. La invitación vale durante 30 días. La cuenta reserva una de las diez plazas hasta que la elimines, incluso si la invitación vence.
3. Añadir exactamente ese email a **Junior Maths invited accounts** en Cloudflare Access. No permitir todo `gmail.com` ni «Everyone».
4. Usar **Open invitation email** y enviar el mensaje desde el correo habitual.
5. El alumno abre el enlace y Cloudflare envía el PIN. Al verificarlo, la invitación queda vinculada a su identidad.

La app no guarda una clave de correo ni un token de administración de Cloudflare. Automatizar los pasos 3 y 4 requeriría configurar esos servicios y permisos por separado. No se enviaron invitaciones reales durante la implementación.

**Manage → Suspend account** bloquea las peticiones aunque el login de Cloudflare siga vigente. Para eliminar, escribir el email y confirmar: se borran cuenta, progreso y actividad. Retirar también el email de la política Access. Los datos ya descargados o las copias de recuperación del proveedor tienen un ciclo de vida separado.

## 7. Retención y operación

- A las 03:15 UTC, el Worker borra eventos, intentos, sesiones y progreso vencidos, junto con auditoría antigua. Se usan seis meses calendario, ajustando meses cortos; no simplemente 180 días.
- El progreso vence seis meses después de su última actualización.
- Nombre, email y vínculo de identidad permanecen hasta eliminar la cuenta.
- **My activity → Download my data** exporta todo el historial disponible mediante paginación. El administrador puede exportar el de cada alumno.
- Las notas no se exportan desde el servidor. Cerrar sesión elimina la copia local de la cuenta; se advierte si queda actividad sin guardar.
- **Import old progress** exige declarar que los registros anónimos anteriores son propios. No inventa fechas ni sube notas y conserva progreso más nuevo.
- Los registros de autenticación y copias de recuperación de Cloudflare siguen su propia configuración. La retención de seis meses se refiere a los datos de actividad en uso por esta app.
- Los archivos descargados funcionan offline y no pueden imponer identidad verificada. El login protege el sitio alojado y sus registros, no archivos ya copiados.

## 8. Verificaciones

```sh
npm run build
npm run test:accounts
node source/test-practice.cjs
node source/test-guided-reading.cjs
node source/test-search.cjs
node source/test-speech.cjs
node source/test-formulas.cjs
node source/test-rule-help.cjs
python -m pip install -r source/requirements-test.txt
python source/validate.py
python source/test-practice.py
python source/test-working-lines.py
python source/test-narration-content.py
python source/package.py
npx wrangler deploy --dry-run
```

El dry-run compila sin publicar. El control de despliegue valida AUD, identidad, D1, protección de recursos y retención antes de publicar.

Referencias: [Access para Workers](https://developers.cloudflare.com/workers/configuration/cloudflare-access/), [verificación de JWT](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/), [límites D1](https://developers.cloudflare.com/d1/platform/limits/).
