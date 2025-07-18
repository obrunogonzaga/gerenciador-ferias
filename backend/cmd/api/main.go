package main

import (
	"log"
	"os"

	"github.com/gerenciador-ferias/backend/internal/config"
	"github.com/gerenciador-ferias/backend/internal/database"
	"github.com/gerenciador-ferias/backend/internal/handlers"
	"github.com/gerenciador-ferias/backend/internal/middleware"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Connect to database
	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Run migrations
	if err := database.Migrate(db); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	// Setup Gin router without default middlewares
	router := gin.New()
	
	// Add only the logger middleware
	router.Use(gin.Logger())
	
	// Add recovery middleware
	router.Use(gin.Recovery())

	// Configure CORS middleware - must be first after basic middlewares
	router.Use(func(c *gin.Context) {
		// Set CORS headers for all requests
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization, Accept, X-Requested-With")
		c.Header("Access-Control-Expose-Headers", "Content-Length, Authorization")
		c.Header("Access-Control-Max-Age", "43200")

		// Handle preflight OPTIONS requests
		if c.Request.Method == "OPTIONS" {
			c.Status(204)
			return
		}

		c.Next()
	})

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "healthy",
			"service": "vacation-management-api",
		})
	})

	// API routes
	api := router.Group("/api")
	{
		// Public routes
		api.POST("/auth/login", handlers.Login(db))
		api.POST("/auth/refresh", handlers.RefreshToken(db))

		// Protected routes
		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		{
			// Auth routes
			protected.POST("/auth/logout", handlers.Logout(db))
			protected.GET("/auth/me", handlers.GetCurrentUser(db))

			// Vacation request routes
			protected.GET("/vacation-requests", handlers.GetVacationRequests(db))
			protected.POST("/vacation-requests", handlers.CreateVacationRequest(db))
			protected.GET("/vacation-requests/stats", handlers.GetVacationRequestStats(db))
			protected.GET("/vacation-requests/:id", handlers.GetVacationRequest(db))
			protected.PUT("/vacation-requests/:id", handlers.UpdateVacationRequest(db))
			protected.DELETE("/vacation-requests/:id", handlers.DeleteVacationRequest(db))

			// Manager routes
			protected.GET("/manager/pending-requests", handlers.GetPendingRequests(db))
			protected.POST("/manager/approve/:id", handlers.ApproveVacationRequest(db))
			protected.POST("/manager/reject/:id", handlers.RejectVacationRequest(db))
			protected.GET("/manager/team-calendar", handlers.GetTeamCalendar(db))
			protected.GET("/manager/team-stats", handlers.GetTeamStats(db))

			// Notification routes
			protected.GET("/notifications", handlers.GetNotifications(db))
			protected.PUT("/notifications/:id/read", handlers.MarkNotificationAsRead(db))
			protected.PUT("/notifications/read-all", handlers.MarkAllNotificationsAsRead(db))

			// User routes (admin only)
			protected.GET("/users", middleware.RequireRole("admin"), handlers.GetUsers(db))
			protected.POST("/users", middleware.RequireRole("admin"), handlers.CreateUser(db))
			protected.PUT("/users/:id", middleware.RequireRole("admin"), handlers.UpdateUser(db))
			protected.DELETE("/users/:id", middleware.RequireRole("admin"), handlers.DeleteUser(db))
		}
	}

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}