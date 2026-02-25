# Justificación Técnica — Pipeline DevSecOps

**Práctica 2 · Desarrollo Frontend / Backend**

---

## Pipeline: 8 etapas, secuencia lineal

El código solo avanza si supera cada gate. Un fallo detiene el pipeline completo.

| Etapa        | Herramienta                          | Fase    | Riesgo Mitigado                           | Gate       |
| ------------ | ------------------------------------ | ------- | ----------------------------------------- | ---------- |
| Instalación  | `npm ci`                             | Code    | Versiones inconsistentes entre entornos   | ✅         |
| Calidad      | ESLint                               | Code    | Errores, malas prácticas, `eval()`        | ✅         |
| SCA deps     | `npm audit --audit-level=critical`   | Build   | CVEs en librerías de terceros             | 🔴 Crítico |
| Testing      | Jest + Supertest                     | Test    | Regresiones funcionales                   | ✅         |
| SAST         | Semgrep `--severity=ERROR`           | Code    | Vulnerabilidades en código fuente         | 🔴 Error   |
| Credenciales | GitHub Secrets + `.env`              | Plan    | Credenciales expuestas en el repositorio  | ✅         |
| Build        | `docker compose build` + SHA tag     | Build   | Imagen no reproducible o sin trazabilidad | ✅         |
| Scan imagen  | Trivy `exit-code: 1`                 | Release | CVEs en OS base y paquetes del sistema    | 🔴 Crítico |
| Smoke test   | `docker compose up` + `curl /health` | Deploy  | Sistema no arranca en entorno real        | ✅         |

---

## Justificación por herramienta

**`npm ci`** usa `package-lock.json` como única fuente de verdad, garantizando instalaciones idénticas en cada ejecución. Falla si hay discrepancias. Sin esto, versiones distintas entre developer y CI causan bugs silenciosos en producción.

**ESLint** detecta errores antes de ejecutar el código: variables no declaradas (`no-undef`), uso de `eval()` (vector de inyección), código muerto. JavaScript no tiene compilador; sin ESLint estos errores solo aparecen en runtime ante un input específico en producción.

**`npm audit`** cruza las dependencias contra la National Vulnerability Database. Los flags `--omit=dev --audit-level=critical` excluyen libs de desarrollo y bloquean solo ante riesgos críticos. Una librería con CVE puede comprometer todo el sistema sin que el código propio cambie.

**Jest + Supertest** validan el contrato funcional de cada servicio: rutas `/health`, autenticación JWT, respuestas ante inputs inválidos. Los tests unitarios usan mocks, por eso también existe el smoke test final. Sin tests, "funciona" es una afirmación sin respaldo verificable.

**Semgrep** analiza el código con reglas semánticas de seguridad: SQL Injection, hardcoded secrets, prototype pollution, weak cryptography, path traversal. Es complementario a ESLint: donde ESLint detecta calidad, Semgrep detecta patrones de ataque desde la perspectiva de un atacante.

**GitHub Secrets** genera los `.env` en tiempo de ejecución, nunca en el repositorio. Las credenciales en texto plano en un commit quedan en el historial de Git para siempre, accesibles a cualquier persona con acceso de lectura al repo.

**Docker Build con tag SHA** vincula cada imagen al commit exacto que la generó. Permite trazabilidad total y rollback trivial (revertir = desplegar la imagen del SHA anterior). Sin versionado, es imposible auditar qué versión del código está en producción.

**Trivy** escanea la imagen en tres capas: OS base, paquetes del sistema y dependencias de la app. Detecta CVEs que `npm audit` no ve, como vulnerabilidades en `libssl` o `glibc` del sistema operativo. Una app con código perfecto sobre una imagen con exploits del kernel sigue siendo un sistema comprometible.

**Smoke test** levanta todos los servicios con Docker Compose y hace un request HTTP real al API Gateway. Es la única etapa que valida la integración completa en un entorno idéntico al de producción, donde los mocks de los tests unitarios no existen.

---

## ¿Por qué DevSecOps y no solo CI/CD?

Un sistema funcional no es un sistema seguro. Cada etapa responde a: **¿qué pasaría si no existiera?** En todos los casos, el riesgo solo se descubriría en producción, cuando el costo de corrección es máximo.

| CI/CD Tradicional                         | Este Pipeline                                 |
| ----------------------------------------- | --------------------------------------------- |
| Verifica que el código funciona           | Verifica que funciona **y** es seguro         |
| Seguridad = revisión manual posterior     | Seguridad embebida en cada commit             |
| Vulnerabilidades detectadas en producción | Bloqueadas antes del merge                    |
| Dependencias auditadas esporádicamente    | CVEs verificados en cada push automáticamente |

## Evidencia de ejecución

Como evidencia se adjuntan:

- Capturas de pantalla del workflow en GitHub Actions.
  ![alt text](files/pipeline-devsecops.png)

- URLs de evidencia:

1. Repositorio: `https://github.com/j4vie2/tarea-2-devsecops`
2. Pipeline GitHub Actions: `https://github.com/j4vie2/tarea-2-devsecops/actions/runs/22379608499/job/64777201873`
