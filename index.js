const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.static("dist"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
morgan.token("body", (req) => {
  return JSON.stringify(req.body);
});
app.use(morgan(":method :url :status :response-time ms - body: :body"));
let persons = [
  {
    id: 1,
    name: "Chiqui",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/", (request, response) => {
  response.send("<h1> Bienvenidos a la Agenda</h1>");
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/info", (request, response) => {
  const date = new Date();
  const info = `La agenda tiene ${persons.length} personas. <br> ${date}`;
  response.send("<h3>" + info + "</h3>");
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);
  response.status(204).end();
});

const generateId = () => {
  return Math.floor(Math.random() * 100000) + 1;
};
app.post("/api/persons", (request, response) => {
  const body = request.body;
  if (!body.name) {
    return response.status(400).json({ error: "no pusiste nombre loco" });
  }
  if (!body.number) {
    return response.status(400).json({ error: "loco, no pusiste numero!!!" });
  }
  if (persons.find((person) => person.name === body.name)) {
    return response
      .status(400)
      .json({ error: "ya agendaste a ese chabon loco!!!" });
  }
  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  };
  persons = persons.concat(person);
  response.json(person);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
