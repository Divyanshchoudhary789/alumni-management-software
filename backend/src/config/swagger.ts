import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Alumni Management API',
      version: '1.0.0',
      description: 'Comprehensive API for Alumni Management Dashboard',
      contact: {
        name: 'API Support',
        email: 'support@alumni-management.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://api.alumni-management.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Clerk JWT token'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  description: 'Error message'
                },
                code: {
                  type: 'string',
                  description: 'Error code'
                },
                details: {
                  type: 'object',
                  description: 'Additional error details'
                }
              },
              required: ['message', 'code']
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            currentPage: {
              type: 'integer',
              minimum: 1
            },
            totalPages: {
              type: 'integer',
              minimum: 0
            },
            totalItems: {
              type: 'integer',
              minimum: 0
            },
            itemsPerPage: {
              type: 'integer',
              minimum: 1
            },
            hasNextPage: {
              type: 'boolean'
            },
            hasPrevPage: {
              type: 'boolean'
            }
          }
        },
        AlumniProfile: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              format: 'objectid'
            },
            userId: {
              type: 'string',
              format: 'objectid'
            },
            firstName: {
              type: 'string',
              maxLength: 50
            },
            lastName: {
              type: 'string',
              maxLength: 50
            },
            graduationYear: {
              type: 'integer',
              minimum: 1900,
              maximum: 2050
            },
            degree: {
              type: 'string',
              maxLength: 100
            },
            currentCompany: {
              type: 'string',
              maxLength: 100
            },
            currentPosition: {
              type: 'string',
              maxLength: 100
            },
            location: {
              type: 'string',
              maxLength: 100
            },
            bio: {
              type: 'string',
              maxLength: 1000
            },
            profileImage: {
              type: 'string',
              format: 'uri'
            },
            linkedinUrl: {
              type: 'string',
              format: 'uri'
            },
            websiteUrl: {
              type: 'string',
              format: 'uri'
            },
            phone: {
              type: 'string'
            },
            isPublic: {
              type: 'boolean',
              default: true
            },
            skills: {
              type: 'array',
              items: {
                type: 'string',
                maxLength: 50
              }
            },
            interests: {
              type: 'array',
              items: {
                type: 'string',
                maxLength: 50
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          },
          required: ['firstName', 'lastName', 'graduationYear', 'degree']
        },
        Event: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              format: 'objectid'
            },
            title: {
              type: 'string',
              maxLength: 200
            },
            description: {
              type: 'string',
              maxLength: 2000
            },
            eventDate: {
              type: 'string',
              format: 'date-time'
            },
            location: {
              type: 'string',
              maxLength: 200
            },
            capacity: {
              type: 'integer',
              minimum: 1,
              maximum: 10000
            },
            registrationDeadline: {
              type: 'string',
              format: 'date-time'
            },
            status: {
              type: 'string',
              enum: ['draft', 'published', 'cancelled', 'completed']
            },
            imageUrl: {
              type: 'string',
              format: 'uri'
            },
            createdBy: {
              type: 'string',
              format: 'objectid'
            },
            registrationCount: {
              type: 'integer',
              minimum: 0
            },
            spotsRemaining: {
              type: 'integer',
              minimum: 0
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          },
          required: ['title', 'description', 'eventDate', 'location', 'capacity', 'registrationDeadline']
        },
        Communication: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              format: 'objectid'
            },
            title: {
              type: 'string',
              maxLength: 200
            },
            content: {
              type: 'string',
              maxLength: 10000
            },
            type: {
              type: 'string',
              enum: ['newsletter', 'announcement', 'event_invitation', 'donation_request', 'general']
            },
            targetAudience: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['all', 'alumni', 'recent_graduates', 'donors', 'mentors', 'mentees', 'event_attendees']
              }
            },
            status: {
              type: 'string',
              enum: ['draft', 'scheduled', 'sent']
            },
            scheduledDate: {
              type: 'string',
              format: 'date-time'
            },
            sentDate: {
              type: 'string',
              format: 'date-time'
            },
            recipients: {
              type: 'array',
              items: {
                type: 'string',
                format: 'objectid'
              }
            },
            deliveryStats: {
              type: 'object',
              properties: {
                sent: { type: 'integer', minimum: 0 },
                delivered: { type: 'integer', minimum: 0 },
                opened: { type: 'integer', minimum: 0 },
                clicked: { type: 'integer', minimum: 0 },
                failed: { type: 'integer', minimum: 0 }
              }
            },
            createdBy: {
              type: 'string',
              format: 'objectid'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          },
          required: ['title', 'content', 'type']
        },
        Donation: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              format: 'objectid'
            },
            donorId: {
              type: 'string',
              format: 'objectid'
            },
            amount: {
              type: 'number',
              minimum: 0.01
            },
            purpose: {
              type: 'string',
              maxLength: 200
            },
            campaignId: {
              type: 'string',
              format: 'objectid'
            },
            paymentMethod: {
              type: 'string',
              enum: ['credit_card', 'debit_card', 'bank_transfer', 'paypal', 'stripe']
            },
            transactionId: {
              type: 'string',
              maxLength: 100
            },
            status: {
              type: 'string',
              enum: ['pending', 'completed', 'failed', 'refunded']
            },
            donationDate: {
              type: 'string',
              format: 'date-time'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          },
          required: ['amount', 'purpose', 'paymentMethod']
        },
        Campaign: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              format: 'objectid'
            },
            title: {
              type: 'string',
              maxLength: 200
            },
            description: {
              type: 'string',
              maxLength: 2000
            },
            goalAmount: {
              type: 'number',
              minimum: 1
            },
            currentAmount: {
              type: 'number',
              minimum: 0,
              default: 0
            },
            startDate: {
              type: 'string',
              format: 'date-time'
            },
            endDate: {
              type: 'string',
              format: 'date-time'
            },
            status: {
              type: 'string',
              enum: ['draft', 'active', 'completed', 'cancelled']
            },
            progress: {
              type: 'number',
              minimum: 0,
              maximum: 100
            },
            daysRemaining: {
              type: 'integer',
              minimum: 0
            },
            createdBy: {
              type: 'string',
              format: 'objectid'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          },
          required: ['title', 'description', 'goalAmount', 'startDate', 'endDate']
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/models/*.ts'
  ]
};

const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Express): void => {
  // Swagger UI setup
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Alumni Management API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true
    }
  }));

  // JSON endpoint for the swagger spec
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  console.log('📚 API Documentation available at /api-docs');
};

export { specs };