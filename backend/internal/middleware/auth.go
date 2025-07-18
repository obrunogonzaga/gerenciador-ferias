package middleware

import (
	"github.com/gin-gonic/gin"
)

func AuthMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// TODO: Implement JWT validation
		// For now, just continue to allow development
		c.Next()
	}
}

func RequireRole(role string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// TODO: Implement role checking
		// For now, just continue to allow development
		c.Next()
	}
}