export default defineEventHandler((event) => {
  // Bepaal de base URL dynamisch, of val terug op je Vercel URL
  const host = getRequestHeader(event, 'host')
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
  const serverUrl = host ? `${protocol}://${host}` : 'https://garden-nine-tawny.vercel.app'

  return {
    openapi: "3.1.0",
    info: {
      title: "Permaculture Garden AI Assistant API",
      version: "1.0.0",
      description: "Beheer de permacultuur tuinplattegrond. Haal elementen op, voeg planten toe of wijzig beschrijvingen."
    },
    servers: [
      {
        url: serverUrl,
        description: "Garden API Server"
      }
    ],
    paths: {
      "/api/garden/elements": {
        get: {
          summary: "Haal alle huidige tuin elementen op",
          description: "Geeft een array terug met alle planten, bomen en andere elementen die momenteel op de kaart staan.",
          operationId: "getElements",
          responses: {
            "200": {
              description: "Succesvol overzicht van elementen",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string", description: "Unieke UUID" },
                        title: { type: "string", description: "Naam van de plant" },
                        category: { type: "string", enum: ["perennial", "biennial", "other"] },
                        shape: { type: "string", enum: ["circle", "rect", "diamond"] },
                        size: { type: "string", enum: ["xs", "s", "m", "l", "xl"] },
                        x: { type: "number", description: "X coördinaat (tussen 600 en 4000)" },
                        y: { type: "number", description: "Y coördinaat (tussen -8000 en -4000)" },
                        createdAt: { type: "number", description: "Timestamp" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: "Update de volledige lijst met tuin elementen",
          description: "Gebruik dit om een nieuwe plant toe te voegen, of elementen te verplaatsen/verwijderen. Je moet altijd de volledige, gewijzigde array terugsturen.",
          operationId: "updateElements",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  description: "De nieuwe, complete lijst van alle elementen op de kaart.",
                  items: {
                    type: "object",
                    required: ["id", "title", "category", "shape", "size", "x", "y"],
                    properties: {
                      id: { type: "string", description: "UUID van het element." },
                      title: { type: "string", description: "Naam van de plant." },
                      category: { type: "string", enum: ["perennial", "biennial", "other"], description: "Soort plant." },
                      shape: { type: "string", enum: ["circle", "rect", "diamond"], description: "Vorm op de kaart." },
                      size: { type: "string", enum: ["xs", "s", "m", "l", "xl"], description: "Grootte op de kaart." },
                      x: { type: "number", description: "X coördinaat." },
                      y: { type: "number", description: "Y coördinaat." },
                      createdAt: { type: "number" }
                    }
                  }
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Succesvol geüpdatet",
              content: {
                "application/json": {
                  schema: { type: "object", properties: { success: { type: "boolean" } } }
                }
              }
            }
          }
        }
      },
      "/api/garden/markdown/{id}": {
        get: {
          summary: "Haal de beschrijving op van een specifiek element",
          description: "Geeft de markdown tekst terug voor een plant op basis van het ID.",
          operationId: "getDescription",
          parameters: [
            { name: "id", in: "path", required: true, description: "Het UUID van het element.", schema: { type: "string" } }
          ],
          responses: {
            "200": {
              description: "De markdown tekst (plain text)",
              content: { "text/plain": { schema: { type: "string" } } }
            }
          }
        },
        post: {
          summary: "Update de beschrijving voor een element",
          description: "Gebruik dit om informatie over een plant toe te voegen of aan te passen.",
          operationId: "updateDescription",
          parameters: [
            { name: "id", in: "path", required: true, description: "Het UUID van het element.", schema: { type: "string" } }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["markdown"],
                  properties: {
                    markdown: { type: "string", description: "De markdown inhoud voor de beschrijving." }
                  }
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Succesvol geüpdatet",
              content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" } } } } }
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
          name: "x-garden-key",
          description: "Je geheime API sleutel om wijzigingen te mogen maken."
        }
      }
    },
    security: [{ ApiKeyAuth: [] }]
  }
})
