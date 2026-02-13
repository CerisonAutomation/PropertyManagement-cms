// REST API Server - Enterprise-grade Express server with comprehensive middleware
// Implements patterns from major enterprise APIs and security best practices

import crypto from 'crypto';
import { startCacheCleanup } from '@/api/middleware/cache';
import routes from '@/api/rest/routes';
import { errorHandler } from '@/api/utils/error';
import compression from 'compression';
import cors from 'cors';
import express, { type Request, type Response, type NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import helmet from 'helmet';
import morgan from 'morgan';
import { z } from 'zod';

const envBoolean = z
  .string()
  .optional()
  .transform((value) => {
    if (!value) return false;
    return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
  });

// Enhanced Request interface with additional properties
interface EnhancedRequest extends Request {
  id: string;
  startTime: number;
  user?: any;
  session?: any;
  ip?: string;
  url?: string;
}

// Environment validation with Zod
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  REQUEST_TIMEOUT_MS: z.string().transform(Number).default('30000'),
  MAX_REQUEST_SIZE_MB: z.string().transform(Number).default('10'),
  ENABLE_AUDIT_LOGGING: envBoolean.default('true'),
  ENABLE_METRICS: envBoolean.default('true')
});

const env = envSchema.parse(process.env);

// Create Express app with enhanced configuration
const app = express();

// Trust proxy configuration for load balancers
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);

// Enhanced security middleware with comprehensive CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-eval'"], // Only if absolutely necessary
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://*.supabase.co", "wss://*.supabase.co"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "blob:"],
      frameSrc: ["'none'"],
      childSrc: ["'none'"],
      workerSrc: ["'self'", "blob:"],
      manifestSrc: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for compatibility
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Enhanced CORS configuration with security
const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    const allowedOrigins = env.CORS_ORIGIN.split(',').map(o => o.trim());

    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Request-ID',
    'X-Client-Version',
    'X-Device-Fingerprint'
  ],
  exposedHeaders: ['X-Request-ID', 'X-Rate-Limit-Remaining', 'X-Rate-Limit-Reset'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Enhanced compression with configuration
app.use(compression({
  filter: (req: Request, res: Response) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  threshold: 1024, // Only compress responses larger than 1KB
  level: 6 // Compression level (1-9, 6 is default)
}));

// Enhanced request parsing with validation
app.use(express.json({
  limit: `${env.MAX_REQUEST_SIZE_MB}mb`,
  strict: true,
  type: ['application/json', 'application/ld+json']
}));
app.use(express.urlencoded({
  extended: true,
  limit: `${env.MAX_REQUEST_SIZE_MB}mb`,
  parameterLimit: 1000
}));

// Request timeout middleware
app.use((req: EnhancedRequest, res: Response, next: NextFunction) => {
  req.startTime = Date.now();

  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(408).json({
        success: false,
        error: {
          code: 'REQUEST_TIMEOUT',
          message: 'Request timeout'
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.id,
          timeout: env.REQUEST_TIMEOUT_MS
        }
      });
    }
  }, env.REQUEST_TIMEOUT_MS);

  res.on('finish', () => clearTimeout(timeout));
  next();
});

// Enhanced logging with custom format
if (env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => {
        console.log(message.trim());
        // Here you could also write to a file or logging service
      }
    },
    skip: (req: Request, res: Response) => {
      // Skip logging for health checks
      return req.url === '/health' || req.url === '/api/health';
    }
  }));
}

// Enhanced request ID middleware with cryptographic security
app.use((req: EnhancedRequest, res: Response, next: NextFunction) => {
  req.id = crypto.randomUUID();
  res.set('X-Request-ID', req.id);

  // Add response timing header just before response is written
  const originalEnd = res.end;
  res.end = function (...args: any[]) {
    const duration = Date.now() - req.startTime;
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${duration}ms`);
    }

    return originalEnd.apply(this, args);
  };

  next();
});

// Rate limiting with enhanced configuration
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
      retryAfter: Math.ceil(env.RATE_LIMIT_WINDOW_MS / 1000)
    },
    meta: {
      timestamp: new Date().toISOString(),
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      maxRequests: env.RATE_LIMIT_MAX_REQUESTS
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: EnhancedRequest) => {
    // Use IP address for rate limiting, but consider authenticated users
    return req.user?.id || req.ip || 'unknown';
  },
  skip: (req: EnhancedRequest) => {
    // Skip rate limiting for health checks and admin users
    return req.url === '/health' ||
           req.url === '/api/health' ||
           req.user?.role === 'super_admin';
  }
});

app.use('/api', limiter);

// Apply slow down for additional protection
const speedLimiter = slowDown({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  delayAfter: Math.floor(env.RATE_LIMIT_MAX_REQUESTS * 0.7), // Start slowing down after 70% of limit
  delayMs: 500, // Add 500ms delay per request after limit
  maxDelayMs: 20000 // Maximum 20 seconds delay
});

app.use('/api', speedLimiter);

// Health check endpoint (before other middleware)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// API routes
app.use('/api', routes);

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'Advanced CMS REST API',
    version: '1.0.0',
    description: 'RESTful API for the Advanced CMS system',
    baseUrl: `${req.protocol}://${req.get('host')}/api`,
    endpoints: {
      pages: {
        'GET /api/pages': 'List all pages',
        'GET /api/pages/:id': 'Get a single page',
        'GET /api/pages/slug/:slug': 'Get page by slug',
        'POST /api/pages': 'Create a new page',
        'PUT /api/pages/:id': 'Update a page',
        'DELETE /api/pages/:id': 'Delete a page'
      },
      'blog-posts': {
        'GET /api/blog-posts': 'List all blog posts',
        'GET /api/blog-posts/:slug': 'Get blog post by slug',
        'POST /api/blog-posts': 'Create a new blog post',
        'PUT /api/blog-posts/:id': 'Update a blog post',
        'DELETE /api/blog-posts/:id': 'Delete a blog post'
      },
      properties: {
        'GET /api/properties': 'List all properties',
        'GET /api/properties/:id': 'Get a single property',
        'POST /api/properties': 'Create a new property',
        'PUT /api/properties/:id': 'Update a property',
        'DELETE /api/properties/:id': 'Delete a property'
      },
      media: {
        'GET /api/media': 'List all media files',
        'POST /api/media/upload': 'Upload a file',
        'DELETE /api/media/:id': 'Delete a file'
      },
      search: {
        'GET /api/search': 'Global search across all content'
      },
      health: {
        'GET /api/health': 'Health check endpoint',
        'GET /api/stats': 'API statistics'
      }
    },
    authentication: {
      type: 'Bearer Token',
      scheme: 'JWT',
      loginEndpoint: '/api/auth/login',
      registerEndpoint: '/api/auth/register'
    },
    rateLimiting: {
      default: '100 requests per minute',
      auth: '5 requests per 15 minutes',
      upload: '10 requests per minute'
    },
    caching: {
      default: '5 minutes',
      static: '1 hour',
      dynamic: '5 minutes'
    },
    examples: {
      pages: {
        list: 'GET /api/pages?limit=10&offset=0&sort=created_at.desc',
        filter: 'GET /api/pages?filter={"status":"published"}',
        search: 'GET /api/pages?search=malta'
      }
    }
  });
});

// OpenAPI/Swagger documentation
app.get('/api/openapi.json', (req, res) => {
  const openApiSpec = {
    openapi: '3.0.0',
    info: {
      title: 'Advanced CMS API',
      version: '1.0.0',
      description: 'RESTful API for the Advanced CMS system',
      contact: {
        name: 'API Support',
        email: 'api@example.com'
      }
    },
    servers: [
      {
        url: `${req.protocol}://${req.get('host')}/api`,
        description: 'Development server'
      }
    ],
    paths: {
      '/pages': {
        get: {
          summary: 'List all pages',
          tags: ['Pages'],
          parameters: [
            {
              name: 'select',
              in: 'query',
              schema: { type: 'array', items: { type: 'string' } },
              description: 'Fields to select'
            },
            {
              name: 'filter',
              in: 'query',
              schema: { type: 'object' },
              description: 'Filter conditions'
            },
            {
              name: 'sort',
              in: 'query',
              schema: { type: 'string' },
              description: 'Sort order (field.direction)'
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', minimum: 1, maximum: 100 },
              description: 'Number of items to return'
            },
            {
              name: 'offset',
              in: 'query',
              schema: { type: 'integer', minimum: 0 },
              description: 'Number of items to skip'
            }
          ],
          responses: {
            200: {
              description: 'List of pages',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Page' }
                      },
                      meta: { $ref: '#/components/schemas/PaginationMeta' }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Create a new page',
          tags: ['Pages'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreatePage' }
              }
            }
          },
          responses: {
            201: {
              description: 'Page created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { $ref: '#/components/schemas/Page' },
                      message: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/pages/{id}': {
        get: {
          summary: 'Get a single page',
          tags: ['Pages'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'Page ID'
            }
          ],
          responses: {
            200: {
              description: 'Page details',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { $ref: '#/components/schemas/Page' }
                    }
                  }
                }
              }
            }
          }
        },
        put: {
          summary: 'Update a page',
          tags: ['Pages'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'Page ID'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdatePage' }
              }
            }
          },
          responses: {
            200: {
              description: 'Page updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { $ref: '#/components/schemas/Page' },
                      message: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        },
        delete: {
          summary: 'Delete a page',
          tags: ['Pages'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'Page ID'
            }
          ],
          responses: {
            200: {
              description: 'Page deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    components: {
      schemas: {
        Page: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            slug: { type: 'string' },
            title: { type: 'string' },
            content: { type: 'object' },
            template: {
              type: 'string',
              enum: ['default', 'landing', 'blog', 'portfolio']
            },
            status: {
              type: 'string',
              enum: ['draft', 'published', 'archived']
            },
            sort_order: { type: 'integer' },
            seo_title: { type: 'string' },
            seo_description: { type: 'string' },
            meta_image: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
            published_at: { type: 'string', format: 'date-time' }
          }
        },
        CreatePage: {
          type: 'object',
          required: ['title', 'slug'],
          properties: {
            title: { type: 'string', minLength: 1, maxLength: 255 },
            slug: { type: 'string', minLength: 1, maxLength: 255 },
            content: { type: 'object' },
            template: {
              type: 'string',
              enum: ['default', 'landing', 'blog', 'portfolio'],
              default: 'default'
            },
            status: {
              type: 'string',
              enum: ['draft', 'published', 'archived'],
              default: 'draft'
            },
            sort_order: { type: 'integer', default: 0 },
            seo_title: { type: 'string', maxLength: 60 },
            seo_description: { type: 'string', maxLength: 160 },
            meta_image: { type: 'string' }
          }
        },
        UpdatePage: {
          type: 'object',
          properties: {
            title: { type: 'string', minLength: 1, maxLength: 255 },
            slug: { type: 'string', minLength: 1, maxLength: 255 },
            content: { type: 'object' },
            template: {
              type: 'string',
              enum: ['default', 'landing', 'blog', 'portfolio']
            },
            status: {
              type: 'string',
              enum: ['draft', 'published', 'archived']
            },
            sort_order: { type: 'integer' },
            seo_title: { type: 'string', maxLength: 60 },
            seo_description: { type: 'string', maxLength: 160 },
            meta_image: { type: 'string' }
          }
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            pagination: {
              type: 'object',
              properties: {
                total: { type: 'integer' },
                limit: { type: 'integer' },
                offset: { type: 'integer' },
                page: { type: 'integer' },
                totalPages: { type: 'integer' }
              }
            },
            timestamp: { type: 'string', format: 'date-time' },
            version: { type: 'string' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
                details: { type: 'any' }
              }
            },
            meta: {
              type: 'object',
              properties: {
                timestamp: { type: 'string', format: 'date-time' },
                version: { type: 'string' },
                requestId: { type: 'string' }
              }
            }
          }
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  });

  res.json(openApiSpec);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      requestId: (req as any).id
    }
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start periodic cleanup tasks
if (process.env.NODE_ENV !== 'test') {
  startCacheCleanup(5 * 60 * 1000); // Every 5 minutes
}

export default app;
