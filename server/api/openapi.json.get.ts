export default defineEventHandler((event) => {
  const host = getRequestHeader(event, 'host')
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
  const serverUrl = host ? `${protocol}://${host}` : 'https://garden-nine-tawny.vercel.app'

  return {
    openapi: "3.0.0",
    info: {
      title: "Permaculture Garden API",
      version: "1.0.0",
      description: "API voor het beheren van de tuinplattegrond."
    },
    servers: [{ url: serverUrl }],
    paths: {
      "/api/garden/elements": {
        get: {
          summary: "Haal alle elementen op",
          operationId: "getElements",
          responses: {
            "200": {
              description: "Lijst van elementen",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/GardenElement" }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: "Update elementen",
          operationId: "updateElements",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    elements: {
                      type: "array",
                      items: { $ref: "#/components/schemas/GardenElement" }
                    }
                  },
                  required: ["elements"]
                }
              }
            }
          },
          responses: { "200": { description: "OK" } }
        }
      },
      "/api/garden/markdown/{id}": {
        get: {
          summary: "Haal beschrijving op",
          operationId: "getDescription",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "De markdown tekst" } }
        },
        post: {
          summary: "Update beschrijving",
          operationId: "updateDescription",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["markdown"],
                  properties: { markdown: { type: "string" } }
                }
              }
            }
          },
          responses: { "200": { description: "OK" } }
        }
      }
    },
    components: {
      schemas: {
        GardenElement: {
          type: "object",
          required: ["id", "title", "category", "shape", "size", "x", "y"],
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            category: { type: "string", enum: ["perennial", "biennial", "other"] },
            shape: { type: "string", enum: ["circle", "rect", "diamond"] },
            size: { type: "string", enum: ["xs", "s", "m", "l", "xl"] },
            x: { type: "number" },
            y: { type: "number" },
            createdAt: { type: "number" }
          }
        }
      },
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-garden-key"
        }
      }
    },
    security: [{ ApiKeyAuth: [] }]
  }
})
