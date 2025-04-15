require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const Person = require("./models/personModel");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("dist"));
app.use(express.urlencoded({ extended: true }));

// Configuración de morgan
morgan.token("body", (req) => JSON.stringify(req.body));
app.use(morgan(":method :url :status :response-time ms - body: :body"));

// Conexión a MongoDB
const url = process.env.MONGODB_URI;
mongoose
  .connect(url)
  .then(() => {
    console.log("Conectado a MongoDB");
  })
  .catch((error) => {
    console.log("Error de conexión:", error.message);
  });

// Rutas
app.get("/info", async (request, response, next) => {
  try {
    const date = new Date().toString();
    const count = await Person.countDocuments({});
    response.send(`<p>La agenda tiene ${count} personas</p><p>${date}</p>`);
  } catch (error) {
    next(error);
  }
});

app.get("/api/persons", async (request, response, next) => {
  try {
    const persons = await Person.find({});
    response.json(persons);
  } catch (error) {
    next(error);
  }
});

app.get("/api/persons/:id", async (request, response, next) => {
  try {
    const person = await Person.findById(request.params.id);
    if (person) {
      response.json(person);
    } else {
      response.status(404).json({ error: "Persona no encontrada" });
    }
  } catch (error) {
    next(error);
  }
});

app.delete("/api/persons/:id", async (request, response, next) => {
  try {
    const result = await Person.findByIdAndDelete(request.params.id);
    if (result) {
      response.status(204).end();
    } else {
      response.status(404).json({ error: "Persona no encontrada" });
    }
  } catch (error) {
    next(error);
  }
});

app.post("/api/persons", async (request, response, next) => {
  try {
    const body = request.body;

    if (!body.name) {
      return response.status(400).json({ error: "no pusiste nombre loco" });
    }
    if (!body.number) {
      return response.status(400).json({ error: "loco, no pusiste numero!!!" });
    }

    const person = new Person({
      name: body.name,
      number: body.number,
    });

    const savedPerson = await person.save();
    response.json(savedPerson);
  } catch (error) {
    next(error);
  }
});

app.put("/api/persons/:id", async (request, response, next) => {
  try {
    const body = request.body;

    if (!body.number) {
      return response.status(400).json({ error: "loco, no pusiste numero!!!" });
    }

    const updatedData = {
      name: body.name || undefined,
      number: body.number,
    };

    const person = await Person.findByIdAndUpdate(
      request.params.id,
      { $set: updatedData },
      { new: true, runValidators: true, context: "query" }
    );

    if (person) {
      response.json(person);
    } else {
      response.status(404).json({ error: "Persona no encontrada" });
    }
  } catch (error) {
    next(error);
  }
});

// Middleware de errores
app.use((error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).json({ error: "ID inválido" });
  }
  if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }
  if (error.code === 11000) {
    return response
      .status(400)
      .json({ error: "ya agendaste a ese chabon loco!!!" });
  }

  response.status(500).json({ error: "Error interno del servidor" });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
