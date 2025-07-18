package main

import (
	"log"
	"os"

	"github.com/gerenciador-ferias/backend/internal/config"
	"github.com/gerenciador-ferias/backend/internal/database"
	"github.com/gerenciador-ferias/backend/internal/handlers"
	"github.com/gerenciador-ferias/backend/internal/middleware"
	"github.com/gin-contrib/cors"
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

	// Setup Gin router
	router := gin.Default()

	// Configure CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

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
			protected.GET("/vacation-requests/:id", handlers.GetVacationRequest(db))
			protected.PUT("/vacation-requests/:id", handlers.UpdateVacationRequest(db))
			protected.DELETE("/vacation-requests/:id", handlers.DeleteVacationRequest(db))

			// Manager routes
			protected.GET("/manager/pending-requests", handlers.GetPendingRequests(db))
			protected.PUT("/vacation-requests/:id/approve", handlers.ApproveVacationRequest(db))
			protected.PUT("/vacation-requests/:id/reject", handlers.RejectVacationRequest(db))
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