package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gerenciador-ferias/backend/internal/middleware"
	"github.com/gerenciador-ferias/backend/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func GetVacationRequests(db *gorm.DB) gin.HandlerFunc {
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

		// Parse query parameters
		page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
		perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "10"))
		status := c.Query("status")

		if page < 1 {
			page = 1
		}
		if perPage < 1 || perPage > 100 {
			perPage = 10
		}

		offset := (page - 1) * perPage

		// Build query
		query := db.Preload("User").Preload("Approver").Where("user_id = ?", userID)
		
		if status != "" {
			query = query.Where("status = ?", status)
		}

		// Count total
		var total int64
		if err := query.Model(&models.VacationRequest{}).Count(&total).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to count vacation requests",
			})
			return
		}

		// Get requests
		var requests []models.VacationRequest
		if err := query.Order("created_at DESC").Offset(offset).Limit(perPage).Find(&requests).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to fetch vacation requests",
			})
			return
		}

		// Convert to response format
		var responseRequests []*models.VacationRequestResponse
		for _, req := range requests {
			responseRequests = append(responseRequests, req.ToResponse())
		}

		totalPages := int((total + int64(perPage) - 1) / int64(perPage))

		response := models.VacationRequestsListResponse{
			Requests:   responseRequests,
			Total:      total,
			Page:       page,
			PerPage:    perPage,
			TotalPages: totalPages,
		}

		c.JSON(http.StatusOK, response)
	}
}

func CreateVacationRequest(db *gorm.DB) gin.HandlerFunc {
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

		var req models.CreateVacationRequestRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid request format",
			})
			return
		}

		// Validate dates
		if req.EndDate.Before(req.StartDate) {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "End date must be after start date",
			})
			return
		}

		// Check minimum advance notice (15 days)
		fifteenDaysFromNow := time.Now().AddDate(0, 0, 15)
		if req.StartDate.Before(fifteenDaysFromNow) {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Vacation requests must be made at least 15 days in advance",
			})
			return
		}

		// Calculate business days
		businessDays := calculateBusinessDays(req.StartDate, req.EndDate)
		if businessDays < 5 {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Minimum vacation period is 5 business days",
			})
			return
		}

		// Check user's vacation balance
		var user models.User
		if err := db.Where("id = ?", userID).First(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to fetch user information",
			})
			return
		}

		if user.VacationBalance < businessDays {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Insufficient vacation balance",
			})
			return
		}

		// Check for overlapping requests
		var overlapping int64
		if err := db.Model(&models.VacationRequest{}).
			Where("user_id = ? AND status IN (?, ?) AND ((start_date <= ? AND end_date >= ?) OR (start_date <= ? AND end_date >= ?))",
				userID, models.StatusPending, models.StatusApproved,
				req.StartDate, req.StartDate, req.EndDate, req.EndDate).
			Count(&overlapping).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to check for overlapping requests",
			})
			return
		}

		if overlapping > 0 {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "You have overlapping vacation requests",
			})
			return
		}

		// Create vacation request
		vacationRequest := models.VacationRequest{
			UserID:           userID,
			StartDate:        req.StartDate,
			EndDate:          req.EndDate,
			BusinessDays:     businessDays,
			Status:           models.StatusPending,
			Reason:           req.Reason,
			EmergencyContact: req.EmergencyContact,
		}

		if err := db.Create(&vacationRequest).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to create vacation request",
			})
			return
		}

		// Load user and approver for response
		if err := db.Preload("User").Preload("Approver").First(&vacationRequest, vacationRequest.ID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to load vacation request details",
			})
			return
		}

		// TODO: Create notification for manager
		// TODO: Send email notification

		c.JSON(http.StatusCreated, vacationRequest.ToResponse())
	}
}

func GetVacationRequest(db *gorm.DB) gin.HandlerFunc {
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

		requestIDStr := c.Param("id")
		requestID, err := uuid.Parse(requestIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid request ID format",
			})
			return
		}

		var vacationRequest models.VacationRequest
		if err := db.Preload("User").Preload("Approver").
			Where("id = ? AND user_id = ?", requestID, userID).
			First(&vacationRequest).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusNotFound, gin.H{
					"error": "Vacation request not found",
				})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to fetch vacation request",
			})
			return
		}

		c.JSON(http.StatusOK, vacationRequest.ToResponse())
	}
}

func UpdateVacationRequest(db *gorm.DB) gin.HandlerFunc {
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

		requestIDStr := c.Param("id")
		requestID, err := uuid.Parse(requestIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid request ID format",
			})
			return
		}

		// Find the vacation request
		var vacationRequest models.VacationRequest
		if err := db.Where("id = ? AND user_id = ?", requestID, userID).First(&vacationRequest).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusNotFound, gin.H{
					"error": "Vacation request not found",
				})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to fetch vacation request",
			})
			return
		}

		// Only pending requests can be updated
		if vacationRequest.Status != models.StatusPending {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Only pending requests can be updated",
			})
			return
		}

		var req models.UpdateVacationRequestRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid request format",
			})
			return
		}

		// Update fields if provided
		if req.StartDate != nil {
			vacationRequest.StartDate = *req.StartDate
		}
		if req.EndDate != nil {
			vacationRequest.EndDate = *req.EndDate
		}
		if req.Reason != nil {
			vacationRequest.Reason = *req.Reason
		}
		if req.EmergencyContact != nil {
			vacationRequest.EmergencyContact = *req.EmergencyContact
		}

		// Validate dates if updated
		if vacationRequest.EndDate.Before(vacationRequest.StartDate) {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "End date must be after start date",
			})
			return
		}

		// Recalculate business days
		vacationRequest.BusinessDays = calculateBusinessDays(vacationRequest.StartDate, vacationRequest.EndDate)

		if err := db.Save(&vacationRequest).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to update vacation request",
			})
			return
		}

		// Load related data for response
		if err := db.Preload("User").Preload("Approver").First(&vacationRequest, vacationRequest.ID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to load vacation request details",
			})
			return
		}

		c.JSON(http.StatusOK, vacationRequest.ToResponse())
	}
}

func DeleteVacationRequest(db *gorm.DB) gin.HandlerFunc {
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

		requestIDStr := c.Param("id")
		requestID, err := uuid.Parse(requestIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid request ID format",
			})
			return
		}

		// Find the vacation request
		var vacationRequest models.VacationRequest
		if err := db.Where("id = ? AND user_id = ?", requestID, userID).First(&vacationRequest).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusNotFound, gin.H{
					"error": "Vacation request not found",
				})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to fetch vacation request",
			})
			return
		}

		// Only pending requests can be cancelled
		if vacationRequest.Status != models.StatusPending {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Only pending requests can be cancelled",
			})
			return
		}

		// Update status to cancelled instead of deleting
		vacationRequest.Status = models.StatusCancelled
		if err := db.Save(&vacationRequest).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to cancel vacation request",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Vacation request cancelled successfully",
		})
	}
}

// Helper function to calculate business days
func calculateBusinessDays(start, end time.Time) int {
	days := 0
	for d := start; !d.After(end); d = d.AddDate(0, 0, 1) {
		if d.Weekday() != time.Saturday && d.Weekday() != time.Sunday {
			days++
		}
	}
	return days
}