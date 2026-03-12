const createRoomSchema = {
  description: `Create a new meeting room.
Conditions:
- name must be unique (case-insensitive)
- capacity must be >= 1
- amenities optional
`,
  tags: ["Rooms"],

  body: {
    type: "object",
    required: ["name", "capacity", "floor"],
    properties: {
      name: { type: "string", minLength: 1 },
      capacity: { type: "integer", minimum: 1 },
      floor: { type: "integer" },
      amenities: {
        type: "array",
        items: { type: "string" },
        default: []
      }
    }
  },

  response: {
    201: {
      type: "object",
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
        capacity: { type: "integer" },
        floor: { type: "integer" },
        amenities: {
          type: "array",
          items: { type: "string" }
        }
      }
    },

    409: {
      type: "object",
      properties: {
        error: { type: "string" },
        message: { type: "string" }
      }
    }
  }
};

const listRoomsSchema = {
  description: `List available meeting rooms.
Conditions:
- filter by minCapacity
- filter by amenity
- filters can be combined
`,
  tags: ["Rooms"],

  querystring: {
    type: "object",
    properties: {
      minCapacity: { type: "integer", minimum: 1 },
      amenity: { type: "string" }
    }
  },

  response: {
    200: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          capacity: { type: "integer" },
          floor: { type: "integer" },
          amenities: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    }
  }
};

module.exports = { createRoomSchema, listRoomsSchema };