export default defineEventHandler(() => {
  return {
    openapi: "3.0.0",
    info: {
      title: "Permaculture Garden API",
      version: "1.0.0",
      description: "API for managing garden elements and plant descriptions"
    },
    paths: {
      "/api/garden/elements": {
        get: {
          summary: "List all garden elements",
          operationId: "getElements",
          responses: { "200": { description: "OK" } }
        },
        post: {
          summary: "Update all garden elements",
          operationId: "updateElements",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      title: { type: "string" },
                      category: { type: "string", enum: ["perennial", "biennial", "other"] },
                      shape: { type: "string", enum: ["circle", "rect", "diamond"] },
                      size: { type: "string", enum: ["xs", "s", "m", "l", "xl"] },
                      x: { type: "number" },
                      y: { type: "number" }
                    }
                  }
                }
              }
            }
          },
          responses: { "200": { description: "OK" } }
        }
      },
      "/api/garden/markdown/{id}": {
        post: {
          summary: "Update description for an element",
          operationId: "updateDescription",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { type: "object", properties: { markdown: { type: "string" } } } } }
          },
          responses: { "200": { description: "OK" } }
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
