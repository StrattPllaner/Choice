# Cómo se calcula el perfil de exploración

Este documento existe para que cualquiera —un alumno, una orientadora, un investigador— pueda
revisar y discutir cómo salen los resultados. El código correspondiente está en
`src/features/perfil/puntuacion.ts` y los pesos en `src/features/perfil/reactivos.ts`.

**Versión del algoritmo: 1.0.0.** Cada perfil guardado registra con qué versión se calculó.

## Qué NO es esto

No es un test psicométrico. No está validado clínicamente, no mide rasgos de personalidad, no
predice desempeño académico ni éxito laboral, y no debe usarse para seleccionar, filtrar ni
orientar de forma definitiva a nadie. Es una suma ponderada de preferencias que el propio alumno
declara, y su único propósito es sugerir por dónde empezar a explorar. La interfaz lo dice en
pantalla, no en letras chiquitas.

## Los reactivos

22 reactivos en cuatro bloques:

| Bloque | Reactivos | Peso en el resultado |
|---|---|---|
| Intereses ("lo que te late") | 7 | 40% |
| Materias que se te dan | 6 | 25% |
| Forma de trabajo preferida | 4 | 15% |
| Lo que te importa (valores) | 5 | 20% |

Escala de 4 puntos: Nada (0), Poco (1), Bastante (2), Mucho (3). **No hay punto medio**, a
propósito: obliga a inclinarse y evita que todo quede en "ahí más o menos".

Por qué los intereses pesan más: es lo que mejor sostiene a alguien en una carrera larga. Las
materias pesan menos porque una materia que se te dificulta en prepa puede ser cuestión del
maestro, del momento o de la escuela, no de tu techo.

## El cálculo, paso a paso

1. **Intensidad.** Cada respuesta se convierte a 0, 0.33, 0.67 o 1 (respuesta ÷ 3).

2. **Puntaje por bloque y área.** Para cada área, se promedian los reactivos de ese bloque que
   tienen peso en ella:

   ```
   puntajeBloque(área) = Σ(intensidad × peso) / Σ(peso)
   ```

   Solo entran los reactivos con peso en esa área. Un bloque que no toca un área **no la
   penaliza**: simplemente no participa. Un reactivo sin contestar no cuenta ni a favor ni en contra.

3. **Afinidad final.** Promedio de los bloques, ponderado por la tabla de arriba y renormalizado
   sobre los bloques donde el área sí participa:

   ```
   afinidad(área) = Σ(puntajeBloque × pesoBloque) / Σ(pesoBloque) × 100
   ```

4. **Valores → áreas.** Los 5 reactivos de valores no apuntan a un área directamente; pasan por
   una tabla intermedia (`PESOS_VALOR_AREA`) que dice, por ejemplo, que quien valora la
   independencia se inclina a oficios, negocios y arte. **Esta tabla es la parte más discutible
   del modelo** y por eso está en un solo lugar, a la vista, y no repartida en el código.

5. **Orden estable.** Se ordena por puntaje y, en empate, alfabéticamente. Las mismas respuestas
   siempre dan el mismo resultado.

## Qué se muestra

- **Mínimo 3 áreas, siempre.** Nunca una sola, nunca "tu carrera es X". Si una cuarta o quinta
  área queda a menos de 5 puntos de la tercera, también se muestra (hasta 5 en total).
- El número es una **afinidad relativa entre áreas**, no un porcentaje de éxito ni una
  probabilidad. La interfaz nunca lo presenta como "eres 87% ingeniero".
- El texto es del tipo *"esto es lo que tus respuestas sugieren explorar primero"*.

## Cuándo el sistema avisa que confía poco

La confianza baja a `baja` y se le dice al alumno en pantalla cuando:

- **Contestó casi todo igual** (una misma opción en el 80% o más de los reactivos): el mapa sale
  parejo y no discrimina.
- **Las áreas quedaron muy parejas** (desviación estándar de las afinidades menor a 5 puntos): se
  le presenta como que tiene varias puertas abiertas, no como que ninguna le queda.

## Versionado e historial

Cada vez que se termina el cuestionario se guarda una **versión nueva** en el historial; nunca se
pisa la anterior. Se registra la fecha, el grado de prepa y la versión del algoritmo. Así el
alumno puede comparar cómo cambió entre primero y tercero, que es justo cuando la gente cambia de
idea. La comparación (`compararPerfiles`) solo tiene sentido entre versiones calculadas con el
mismo algoritmo; si cambia la versión, hay que decirlo en pantalla.

## Límites conocidos

- Los pesos son **criterio de autor**, no resultado de un estudio. No hay muestra, ni pilotaje,
  ni análisis factorial detrás.
- Un alumno de 15 años que nunca ha hecho algo no sabe si le gusta: el instrumento mide lo que
  cree hoy, no su potencial.
- El bloque de materias arrastra la calidad de la escuela y el sesgo de género en matemáticas y
  taller. Tenerlo en cuenta al leer resultados agregados.
- No se mide aptitud, ni habilidad real, ni condiciones económicas, que en México pesan más que
  el interés al decidir una carrera.

## Cómo proponer un cambio

Cambiar un peso es cambiar el resultado de miles de alumnos. Si vas a mover algo:

1. Modifica `reactivos.ts` (pesos) o `puntuacion.ts` (fórmula).
2. Sube `VERSION_ALGORITMO` (semver: un peso nuevo es *minor*, cambiar la fórmula es *major*).
3. Corre `npm run probar-puntuacion`: las pruebas fijan el comportamiento que no debe romperse.
4. Anota aquí qué cambiaste y por qué.
