package handlers

import (
	"net/http"
	"os"

	"github.com/gerenciador-ferias/backend/internal/middleware"
	"github.com/gerenciador-ferias/backend/internal/models"
	"github.com/gerenciador-ferias/backend/internal/utils"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func Login(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var loginReq models.LoginRequest
		if err := c.ShouldBindJSON(&loginReq); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid request format",
			})
			return
		}

		// Find user by email
		var user models.User
		if err := db.Preload("Manager").Where("email = ? AND active = ?", loginReq.Email, true).First(&user).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusUnauthorized, gin.H{
					"error": "Invalid email or password",
				})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Database error",
			})
			return
		}

		// Check password
		if err := utils.CheckPassword(loginReq.Password, user.PasswordHash); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid email or password",
			})
			return
		}

		// Generate JWT tokens
		jwtSecret := os.Getenv("JWT_SECRET")
		if jwtSecret == "" {
			jwtSecret = "your-secret-key-change-in-production"
		}

		accessToken, err := utils.GenerateJWT(user.ID, user.Email, string(user.Role), jwtSecret)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to generate access token",
			})
			return
		}

		refreshToken, err := utils.GenerateRefreshToken(user.ID, jwtSecret)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to generate refresh token",
			})
			return
		}

		// Return login response
		response := models.LoginResponse{
			User:         user.ToResponse(),
			AccessToken:  accessToken,
			RefreshToken: refreshToken,
			TokenType:    "Bearer",
			ExpiresIn:    24 * 60 * 60, // 24 hours in seconds
		}

		c.JSON(http.StatusOK, response)
	}
}

func RefreshToken(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var refreshReq models.RefreshTokenRequest
		if err := c.ShouldBindJSON(&refreshReq); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid request format",
			})
			return
		}

		jwtSecret := os.Getenv("JWT_SECRET")
		if jwtSecret == "" {
			jwtSecret = "your-secret-key-change-in-production"
		}

		// Validate refresh token
		claims, err := utils.ValidateJWT(refreshReq.RefreshToken, jwtSecret)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid or expired refresh token",
			})
			return
		}

		// Find user
		var user models.User
		if err := db.Preload("Manager").Where("id = ? AND active = ?", claims.UserID, true).First(&user).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "User not found or inactive",
			})
			return
		}

		// Generate new access token
		accessToken, err := utils.GenerateJWT(user.ID, user.Email, string(user.Role), jwtSecret)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to generate access token",
			})
			return
		}

		response := gin.H{
			"access_token": accessToken,
			"token_type":   "Bearer",
			"expires_in":   24 * 60 * 60, // 24 hours in seconds
		}

		c.JSON(http.StatusOK, response)
	}
}

func Logout(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// In a stateless JWT implementation, logout is handled client-side
		// by removing the token from storage
		c.JSON(http.StatusOK, gin.H{
			"message": "Logged out successfully",
		})
	}
}

func GetCurrentUser(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userIDStr, exists := c.Get(middleware.UserIDKey)
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "User ID not found in context",
			})
			return
		}

		userID, err := uuid.Parse(userIDStr.(string))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid user ID format",
			})
			return
		}

		// Find user
		var user models.User
		if err := db.Preload("Manager").Where("id = ? AND active = ?", userID, true).First(&user).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusNotFound, gin.H{
					"error": "User not found",
				})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Database error",
			})
			return
		}

		c.JSON(http.StatusOK, user.ToResponse())
	}
}