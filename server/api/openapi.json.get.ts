export default defineEventHandler((event) => {
  const host = getRequestHeader(event, 'host')
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
  const serverUrl = host ? `${protocol}://${host}` : 'https://garden-nine-tawny.vercel.app'

  const gardenElementSchema = {
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

  return {
    openapi: "3.0.0",
    info: {
      title: "Permaculture Garden API",
      version: "1.1.0",
      description: "API voor het beheren van planten op een tuinplattegrond."
    },
    servers: [{ url: serverUrl }],
    paths: {
      "/api/garden/elements": {
        get: {
          summary: "Lijst alle planten op",
          operationId: "getElements",
          responses: {
            "200": {
              description: "Een lijst van alle elementen",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: gardenElementSchema
                  }
                }
              }
            }
          }
        },
        post: {
          summary: "Update de volledige kaart",
          operationId: "updateElements",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["elements"],
                  properties: {
                    elements: {
                      type: "array",
                      items: gardenElementSchema
                    }
                  }
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Succesvol bijgewerkt",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { success: { type: "boolean" } }
                  }
                }
              }
            }
          }
        }
      },
      "/api/garden/markdown/{id}": {
        get: {
          summary: "Haal plantdetails op",
          operationId: "getDescription",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": {
              description: "Markdown tekst",
              content: {
                "text/plain": {
                  schema: { type: "string" }
                }
              }
            }
          }
        },
        post: {
          summary: "Update plantdetails",
          operationId: "updateDescription",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["markdown"],
                  properties: {
                    markdown: { type: "string" }
                  }
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Succesvol bijgewerkt",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { success: { type: "boolean" } }
                  }
                }
              }
            }
          }
        }
      }
    },
    components: {
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
