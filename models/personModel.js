const mongoose = require("mongoose");

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "El nombre es obligatorio"],
    minlength: [3, "El nombre debe tener al menos 3 caracteres"],
    trim: true, // Elimina espacios en blanco al inicio y final
  },
  number: {
    type: String,
    required: [true, "El número de teléfono es obligatorio"],
    minlength: [8, "El número debe tener al menos 8 caracteres"],
    validate: {
      validator: function (v) {
        return /^\d{2,3}-\d{6,8}$/.test(v); // 2-3 dígitos, guion, 6-8 dígitos
      },
      message: (props) =>
        `${props.value} no es un número de teléfono válido. Debe tener el formato xx-xxxxxx o xxx-xxxxxxx.`,
    },
  },
});

// Índice único para evitar nombres duplicados
personSchema.index({ name: 1 }, { unique: true });

// Transformación para la respuesta JSON
personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Person", personSchema);
