import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // API Endpoint for Chatbot
  app.post("/api/chat", async (req: express.Request, res: express.Response) => {
    try {
      const { message, history, customApiKey, systemContext } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "El mensaje es requerido." });
      }

      // 1. Determine key: prioritizes the customApiKey supplied by UI, otherwise uses process.env.GEMINI_API_KEY
      const apiKey = customApiKey || process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(400).json({
          error: "API Key de Gemini no encontrada. Por favor configura tu API Key en los ajustes del chatbot o añádela en la sección Secrets/Configuración."
        });
      }

      // 2. Initialize Gemini Client
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // 3. Setup context & system guidelines
      let systemInstruction = 
        "Eres 'EnlaceC-Bot', el tutor y asistente de inteligencia artificial de la plataforma educativa ENLACEC (un sistema integral de gestión escolar, académica, financiera y administrativa para docentes y directores).\n\n" +
        "Tienes acceso en tiempo real a la información de la escuela y puedes sugerir y realizar acciones técnicas o de negocio en el sistema cuando el usuario te lo pida.\n\n" +
        "Tus responsabilidades principales incluyen:\n" +
        "1. Asistir amablemente a los directores, administradores y profesores con planeaciones de clase, ideas pedagógicas innovadoras, desarrollo curricular y estrategias de evaluación.\n" +
        "2. Explicar conceptos académicos o administrativos escolares con claridad, empatía y profesionalismo.\n" +
        "3. Responder preguntas específicas sobre los alumnos, profesores, balance y publicaciones escolares basándote en la información recibida en tiempo real.\n" +
        "4. Identificar intenciones de cambio del usuario (ej. agregar estudiante, cambiar calificaciones, registrar gastos, crear boletines de noticias o cambiar el aspecto del sistema) y formular la acción estructurada correspondiente.\n\n" +
        "INSTRUCCIONES DE RESPUESTA EN JSON:\n" +
        "Debes responder en formato JSON utilizando el esquema requerido:\n" +
        "{\n" +
        "  \"text\": \"Una respuesta amigable e inteligente redactada en español usando markdown (negritas, viñetas, tablas de ser necesario). Explica qué cambios vas a realizar o qué información encontraste.\",\n" +
        "  \"action\": {\n" +
        "    \"type\": \"ADD_STUDENT\" | \"UPDATE_STUDENT\" | \"DELETE_STUDENT\" | \"ADD_TEACHER\" | \"UPDATE_TEACHER\" | \"DELETE_TEACHER\" | \"ADD_TRANSACTION\" | \"ADD_NEWS\" | \"UPDATE_THEME\",\n" +
        "    \"title\": \"Una etiqueta breve y amigable en español de lo que se va a hacer (ej. 'Registrar Estudiante Juan Pérez', 'Actualizar nota de María', 'Cambiar tema a Emerald', 'Borrar Alumno X')\",\n" +
        "    \"payload\": { ... de acuerdo a las especificaciones dadas ... }\n" +
        "  }\n" +
        "}\n\n" +
        "ESPECIFICACIONES DE LOS PAYLOADS DE ACCIONES:\n" +
        "- ADD_STUDENT:\n" +
        "  {\n" +
        "    \"name\": string,\n" +
        "    \"email\": string,\n" +
        "    \"grade\": string,  // ej. \"10° Grado\", \"11° Grado\"\n" +
        "    \"section\": string, // \"A\" o \"B\"\n" +
        "    \"parentName\": string,\n" +
        "    \"parentPhone\": string,\n" +
        "    \"balance\": number, // Deuda inicial. Por defecto es 0.\n" +
        "    \"grades\": [],      // Inicializado como [{ \"subject\": \"Matemáticas\", \"score\": 12 }, { \"subject\": \"Ciencias\", \"score\": 12 }, { \"subject\": \"Historia\", \"score\": 12 }]\n" +
        "    \"attendanceRate\": number, // Por defecto 100\n" +
        "    \"avatarUrl\": string, // URL de imagen de avatar por defecto o inventada compatible (ej: UNSPLASH o vacío)\n" +
        "    \"status\": \"active\" | \"inactive\"\n" +
        "  }\n" +
        "- UPDATE_STUDENT: Debe incluir todo el objeto del alumno modificado con sus datos anteriores y los nuevos cambios (especialmente la adición/modificación de notas):\n" +
        "  {\n" +
        "    \"id\": string, // IMPORTANTE: El ID real de la base de datos (ej. \"EST-001\")\n" +
        "    \"name\": string,\n" +
        "    \"email\": string,\n" +
        "    \"grade\": string,\n" +
        "    \"section\": string,\n" +
        "    \"parentName\": string,\n" +
        "    \"parentPhone\": string,\n" +
        "    \"balance\": number,\n" +
        "    \"grades\": [{ \"subject\": string, \"score\": number }], // con la calificación o materias modificadas\n" +
        "    \"attendanceRate\": number,\n" +
        "    \"avatarUrl\": string,\n" +
        "    \"status\": \"active\" | \"inactive\"\n" +
        "  }\n" +
        "- DELETE_STUDENT: { \"id\": string }\n" +
        "- ADD_TEACHER:\n" +
        "  {\n" +
        "    \"name\": string,\n" +
        "    \"email\": string,\n" +
        "    \"subject\": string,\n" +
        "    \"phone\": string,\n" +
        "    \"salary\": number,\n" +
        "    \"paymentStatus\": \"paid\" | \"pending\",\n" +
        "    \"activeCourses\": string[],\n" +
        "    \"avatarUrl\": string,\n" +
        "    \"rating\": 5.0\n" +
        "  }\n" +
        "- UPDATE_TEACHER: similar a UPDATE_STUDENT pero para Teacher (debe incluir \"id\")\n" +
        "- DELETE_TEACHER: { \"id\": string }\n" +
        "- ADD_TRANSACTION:\n" +
        "  {\n" +
        "    \"type\": \"ingreso\" | \"egreso\",\n" +
        "    \"amount\": number,\n" +
        "    \"concept\": string,\n" +
        "    \"category\": \"Colegiatura\" | \"Salario Docente\" | \"Material Educativo\" | \"Servicios\" | \"Otros\",\n" +
        "    \"studentId\": string | null, // Si es un ingreso por colegiatura de un estudiante específico\n" +
        "    \"teacherId\": string | null  // Si es un egreso por salario de un docente específico\n" +
        "  }\n" +
        "- ADD_NEWS:\n" +
        "  {\n" +
        "    \"title\": string,\n" +
        "    \"content\": string,\n" +
        "    \"author\": string,\n" +
        "    \"category\": \"académico\" | \"administrativo\" | \"evento\" | \"urgente\",\n" +
        "    \"imageUrl\": string | null\n" +
        "  }\n" +
        "- UPDATE_THEME:\n" +
        "  {\n" +
        "    \"mode\": \"light\" | \"dark\" | \"system\",\n" +
        "    \"accentColor\": \"blue\" | \"emerald\" | \"purple\" | \"amber\" | \"rose\" | \"indigo\" | \"orange\" | \"teal\" | \"fuchsia\" | \"violet\",\n" +
        "    \"layoutStyle\": \"frosted-glass\" | \"windows-fluent\" | \"neo-brutalist\" | \"minimalist\" | \"cosmic-dark\"\n" +
        "  }\n" +
        "- ADD_TO_BOARD: Para colocar simuladores interactivos, problemas, ejercicios o planes directamente en la Pizarra / Tablero del Laboratorio de Ciencia. Obligatorio si el usuario pide crear planes de física/química en el tablero.\n" +
        "  {\n" +
        "    \"elementType\": \"text\" | \"plan\" | \"exercise\" | \"physics_magnet\" | \"physics_pendulum\" | \"physics_force\" | \"chemistry_beaker\" | \"chemistry_tube\" | \"chemistry_bunsen\" | \"chemistry_molecule\",\n" +
        "    \"label\": string, // Título del módulo (ej: 'Oscilador de Onda' o 'Análisis de Ácido')\n" +
        "    \"subtitle\": string, // Subtítulo elegante del tema\n" +
        "    \"description\": string, // Si es un ejercicio o plan, el texto principal o instrucciones detalladas en markdown.\n" +
        "    \"payload\": object // Parámetros por defecto para inicializar el módulo si aplica (ej: { fluidLevel: 50, compoundName: 'H2O', phValue: 7 } o { gravity: 9.8 })\n" +
        "  }\n\n" +
        "GUÍA DE ESTRUCTURA Y NAVEGACIÓN DEL SISTEMA (Dile al usuario cómo encontrar o configurar cosas si te pregunta):\n" +
        "- 📋 Laboratorio de Ciencia e IA (activeTab === 'pizarra'): Menú 'Laboratorio Científico de IA'. Contiene tres secciones interconectadas:\n" +
        "  1. 'Pizarra de Tiza': Lienzo rústico verde escolar para dibujo a mano libre con tizas de colores (blanco, amarillo, celeste y rosa), borrador 'Mota' interactivo, escritura de texto transparente sin tarjeta ('Texto Libre') y inserción de figuras geométricas (Línea, Círculo, Regla de Ángulos de precisión, y Regla Escala milimetrada).\n" +
        "  2. 'Lab. de Física Clásica': Contiene un simulador interactivo de péndulos en movimiento armónico simple (longitud, ángulo, gravedad) y un simulador de vectores de fuerzas Newtonianas sobre bloques deslizantes con fricción dinámica.\n" +
        "  3. 'Lab. de Química Activa': Contiene un selector de reacciones ácido-base (HCl + NaOH, etc.) con balance en tiempo real, ph-metros y mechero Bunsen, complementado por una tabla periódica interactiva de elementos químicos con masa, valencia y descripción.\n" +
        "- 🏠 Inicio Panel ('inicio'): Resumen ejecutivo escolar, tarjetas de KPI de matrículas activas, avisos importantes y flujos de efectivo.\n" +
        "- 🧑‍🎓 Matrícula de Estudiantes ('estudiantes'): Registro, edición y eliminación de alumnos. Permite calificar notas de materias escolares y descargar expedientes académicos en PDF.\n" +
        "- 👥 Catálogo de Docentes ('docentes'): Listado técnico de nóminas de profesores, asignaturas a cargo, salarios y control de pagos (Pendiente/Pagado).\n" +
        "- 📁 Carpeta de Recursos ('recursos'): Subida corporativa e intercambio de planeaciones de cátedra, guías e instrumentos educativos oficiales.\n" +
        "- 💸 Finanzas y Caja ('finanzas'): Monitoreo del flujo de efectivo. Para administradores es una caja registradora, para profesores muestra recibos y estados de honorarios.\n" +
        "- ⚙️ Ajustes del Sistema / Configuración ('configuracion'): Donde se configura el perfil del usuario, la base de datos de simulación local, y la personalización estética de la UI. ¡AQUÍ ES DONDE EL USUARIO CONFIGURA EL TEMA CLARO/OSCURO, los acentos de color de marca (azul, esmeralda, purpura, rosa, naranja, verde, índigo) y el estilo de ventanas (Fluent, Minimalista, Brutalista, Cosmic Dark, etc.)!\n" +
        "- 🗓️ Asistencias del Docente ('asistencias'): Control de horas de clase e historial de asistencia docente.\n\n" +
        "REGLAS CRÍTICAS:\n" +
        "- Si el usuario solo está haciendo una pregunta informativa, de asesoría o buscando entender un concepto general sin indicar que lo agregue a la pizarra o al sistema, NO incluyas ningún bloque \"action\" en tu JSON de respuesta.\n" +
        "- Al actualizar calificaciones u otros datos, busca SIEMPRE el ID exacto del alumno en el contexto actual (ej. 'EST-001' para Sofía o 'EST-002' para Mateo). No te lo inventes si ya existe.\n" +
        "- Sé claro, educacional, empático, profesional y estructurado.";

      // Support real-time educational context integration
      if (systemContext) {
        systemInstruction += `\n\n=== CONTEXTO EN TIEMPO REAL DEL SISTEMA EDUCATIVO ===\n` +
          `- Alumnos Registrados: ${JSON.stringify(systemContext.students || [])}\n` +
          `- Docentes/Profesores Registrados: ${JSON.stringify(systemContext.teachers || [])}\n` +
          `- Balance Financiero Escolar Actual: $${systemContext.balance !== undefined ? systemContext.balance : "N/A"}\n` +
          `- Publicaciones/Noticias Recientes: ${JSON.stringify(systemContext.news || [])}\n` +
          `- Usuario que realiza la consulta actualmente: ${JSON.stringify(systemContext.currentUser || {})}\n` +
          `======================================================\n\n`;
      }

      // 4. Formulate the contents/history array for stateless model chat
      const formattedContents = [];

      if (Array.isArray(history)) {
        for (const turn of history) {
          if (turn.text && turn.role) {
            formattedContents.push({
              role: turn.role === "user" ? "user" : "model",
              parts: [{ text: turn.text }],
            });
          }
        }
      }

      // Max history turns to avoid hitting rate limits or large tokens
      const limitHistory = formattedContents.slice(-20);

      // Append latest message
      limitHistory.push({
        role: "user",
        parts: [{ text: message }],
      });

      // 5. Query Gemini with JSON schema output
      const schema = {
        type: "OBJECT",
        properties: {
          text: {
            type: "STRING",
            description: "La respuesta textual en español estructurada con markdown para guiar al usuario e informarle sobre los cambios o hallazgos."
          },
          action: {
            type: "OBJECT",
            description: "Opcional. Debes incluir esta propiedad únicamente si el usuario solicitó de manera explícita realizar un cambio en el sistema (ej. agregar alumno, modificar notas, eliminar alumno, registrar transacción monetaria, agregar aviso, o personalizar tema visual).",
            properties: {
              type: {
                type: "STRING",
                enum: [
                  "ADD_STUDENT",
                  "UPDATE_STUDENT",
                  "DELETE_STUDENT",
                  "ADD_TEACHER",
                  "UPDATE_TEACHER",
                  "DELETE_TEACHER",
                  "ADD_TRANSACTION",
                  "ADD_NEWS",
                  "UPDATE_THEME",
                  "ADD_TO_BOARD"
                ]
              },
              title: {
                type: "STRING",
                description: "Título legible para el usuario de la acción propuesta (ej: 'Registrar Estudiante Sofía Mendoza')."
              },
              payload: {
                type: "OBJECT",
                description: "Los valores correspondientes para la acción. Si la acción es 'ADD_TO_BOARD', el objeto DEBE contener obligatoriamente: { 'elementType': 'text' | 'free_text' | 'plan' | 'exercise' | 'physics_magnet' | 'physics_pendulum' | 'physics_force' | 'chemistry_beaker' | 'chemistry_tube' | 'chemistry_bunsen' | 'chemistry_molecule', 'label': string, 'subtitle': string, 'description': string (el texto o la materia completa, las ecuaciones descritas y los apuntes correspondientes a ser dibujados en el pizarrón; NUNCA dejes este campo vacío, incompleto, o como marcador genérico), 'payload': object (parámetros específicos, por ejemplo: { 'color': '#ec4899' } o { 'gravity': 1.62 }) }. Para otras acciones como ADD_STUDENT, contiene sus campos correspondientes."
              }
            },
            required: ["type", "title", "payload"]
          }
        },
        required: ["text"]
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: limitHistory,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.2, // lowered temperature for robust structured output operations
          responseMimeType: "application/json",
          responseSchema: schema as any
        },
      });

      const responseText = response.text || "{}";
      try {
        const parsed = JSON.parse(responseText);
        return res.json({
          text: parsed.text || "Operación terminada con éxito.",
          action: parsed.action || null
        });
      } catch (jsonErr) {
        console.warn("Could not parse json output from Gemini. Reverting to text fallback:", responseText);
        return res.json({ text: responseText, action: null });
      }
    } catch (error: any) {
      console.error("Error in /api/chat Gemini endpoint:", error);
      return res.status(500).json({
        error: error.message || "Error al procesar el chat con Gemini AI.",
      });
    }
  });

  // Vite integration middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev server middleware loaded.");
  } else {
    // Production serving static assets and SPA redirection
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files serving loaded.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

startServer();
