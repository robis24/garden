export default defineEventHandler((event) => {
  const host = getRequestHeader(event, 'host')
  const protocol = import.meta.dev ? 'http' : 'https'
  const serverUrl = host ? `${protocol}://${host}` : 'https://garden-nine-tawny.vercel.app'

  return {
    "openapi": "3.1.0",
    "info": {
      "title": "Permaculture Garden API",
      "description": "API voor het beheren van planten op een tuinplattegrond.",
      "version": "v1.0.0"
    },
    "servers": [
      {
        "url": serverUrl
      }
    ],
    "paths": {
      "/api/garden/elements": {
        "get": {
          "description": "Lijst alle planten op de kaart op",
          "operationId": "getElements",
          "responses": {
            "200": {
              "description": "Een lijst van alle elementen",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/GardenElement"
                    }
                  }
                }
              }
            }
          },
          "deprecated": false
        },
        "post": {
          "description": "Voeg een nieuwe plant toe aan de kaart",
          "operationId": "addElement",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/GardenElement" }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Succesvol toegevoegd",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": { "success": { "type": "boolean" } }
                  }
                }
              }
            }
          },
          "deprecated": false
        }
      },
      "/api/garden/elements/{id}": {
        "patch": {
          "description": "Werk een bestaande plant bij (gedeeltelijk)",
          "operationId": "updateElement",
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": { "type": "string" }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "title":    { "type": "string" },
                    "category": { "type": "string", "enum": ["perennial", "biennial", "other"] },
                    "shape":    { "type": "string", "enum": ["circle", "rect", "diamond"] },
                    "size":     { "type": "string", "enum": ["xs", "s", "m", "l", "xl"] },
                    "x":        { "type": "number" },
                    "y":        { "type": "number" }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Succesvol bijgewerkt",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": { "success": { "type": "boolean" } }
                  }
                }
              }
            },
            "404": { "description": "Plant niet gevonden" }
          },
          "deprecated": false
        },
        "delete": {
          "description": "Verwijder een plant van de kaart",
          "operationId": "deleteElement",
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": { "type": "string" }
            }
          ],
          "responses": {
            "200": {
              "description": "Succesvol verwijderd",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": { "success": { "type": "boolean" } }
                  }
                }
              }
            },
            "404": { "description": "Plant niet gevonden" }
          },
          "deprecated": false
        }
      },
      "/api/garden/markdown/{id}": {
        "get": {
          "description": "Haal de markdown beschrijving van een plant op",
          "operationId": "getDescription",
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "De markdown tekst",
              "content": {
                "text/plain": {
                  "schema": {
                    "type": "string"
                  }
                }
              }
            }
          },
          "deprecated": false
        },
        "post": {
          "description": "Update de markdown beschrijving van een plant",
          "operationId": "updateDescription",
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["markdown"],
                  "properties": {
                    "markdown": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Succesvol bijgewerkt",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean"
                      }
                    }
                  }
                }
              }
            }
          },
          "deprecated": false
        }
      }
    },
    "components": {
      "schemas": {
        "GardenElement": {
          "type": "object",
          "required": ["id", "title", "category", "shape", "size", "x", "y"],
          "properties": {
            "id": { "type": "string" },
            "title": { "type": "string" },
            "category": { "type": "string", "enum": ["perennial", "biennial", "other"] },
            "shape": { "type": "string", "enum": ["circle", "rect", "diamond"] },
            "size": { "type": "string", "enum": ["xs", "s", "m", "l", "xl"] },
            "x": { "type": "number" },
            "y": { "type": "number" },
            "createdAt": { "type": "number" }
          }
        }
      },
      "securitySchemes": {
        "ApiKeyAuth": {
          "type": "apiKey",
          "in": "header",
          "name": "x-garden-key"
        }
      }
    },
    "security": [
      {
        "ApiKeyAuth": []
      }
    ]
  }
})
