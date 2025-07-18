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

func GetPendingRequests(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userIDStr, exists := c.Get(middleware.UserIDKey)
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "User ID not found in context",
			})
			return
		}

		userRole, exists := c.Get(middleware.UserRoleKey)
		if !exists || (userRole != "manager" && userRole != "admin") {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Insufficient permissions",
			})
			return
		}

		managerID, err := uuid.Parse(userIDStr.(string))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid user ID format",
			})
			return
		}

		// Parse query parameters
		page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
		perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "10"))

		if page < 1 {
			page = 1
		}
		if perPage < 1 || perPage > 100 {
			perPage = 10
		}

		offset := (page - 1) * perPage

		// Get pending requests from team members
		query := db.Preload("User").Preload("Approver").
			Joins("JOIN users ON users.id = vacation_requests.user_id").
			Where("users.manager_id = ? AND vacation_requests.status = ?", managerID, models.StatusPending)

		// Count total
		var total int64
		if err := query.Model(&models.VacationRequest{}).Count(&total).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to count pending requests",
			})
			return
		}

		// Get requests
		var requests []models.VacationRequest
		if err := query.Order("vacation_requests.created_at ASC").
			Offset(offset).Limit(perPage).Find(&requests).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to fetch pending requests",
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

func ApproveVacationRequest(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userIDStr, exists := c.Get(middleware.UserIDKey)
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "User ID not found in context",
			})
			return
		}

		userRole, exists := c.Get(middleware.UserRoleKey)
		if !exists || (userRole != "manager" && userRole != "admin") {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Insufficient permissions",
			})
			return
		}

		managerID, err := uuid.Parse(userIDStr.(string))
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

		var req models.ApprovalRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid request format",
			})
			return
		}

		// Find the vacation request and verify manager authority
		var vacationRequest models.VacationRequest
		if err := db.Preload("User").
			Joins("JOIN users ON users.id = vacation_requests.user_id").
			Where("vacation_requests.id = ? AND users.manager_id = ? AND vacation_requests.status = ?",
				requestID, managerID, models.StatusPending).
			First(&vacationRequest).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusNotFound, gin.H{
					"error": "Vacation request not found or you don't have permission to approve it",
				})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to fetch vacation request",
			})
			return
		}

		// Update the request
		now := time.Now()
		vacationRequest.Status = models.StatusApproved
		vacationRequest.ApprovedBy = &managerID
		vacationRequest.ApprovalDate = &now
		vacationRequest.ApprovalComment = req.Comment

		if err := db.Save(&vacationRequest).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to approve vacation request",
			})
			return
		}

		// Update user's vacation balance
		var user models.User
		if err := db.Where("id = ?", vacationRequest.UserID).First(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to fetch user information",
			})
			return
		}

		user.VacationBalance -= vacationRequest.BusinessDays
		if err := db.Save(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to update user vacation balance",
			})
			return
		}

		// TODO: Create notification for employee
		// TODO: Send email notification

		// Load updated data for response
		if err := db.Preload("User").Preload("Approver").First(&vacationRequest, vacationRequest.ID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to load vacation request details",
			})
			return
		}

		c.JSON(http.StatusOK, vacationRequest.ToResponse())
	}
}

func RejectVacationRequest(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userIDStr, exists := c.Get(middleware.UserIDKey)
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "User ID not found in context",
			})
			return
		}

		userRole, exists := c.Get(middleware.UserRoleKey)
		if !exists || (userRole != "manager" && userRole != "admin") {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Insufficient permissions",
			})
			return
		}

		managerID, err := uuid.Parse(userIDStr.(string))
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

		var req models.ApprovalRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid request format",
			})
			return
		}

		if req.Comment == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Comment is required for rejection",
			})
			return
		}

		// Find the vacation request and verify manager authority
		var vacationRequest models.VacationRequest
		if err := db.Preload("User").
			Joins("JOIN users ON users.id = vacation_requests.user_id").
			Where("vacation_requests.id = ? AND users.manager_id = ? AND vacation_requests.status = ?",
				requestID, managerID, models.StatusPending).
			First(&vacationRequest).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusNotFound, gin.H{
					"error": "Vacation request not found or you don't have permission to reject it",
				})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to fetch vacation request",
			})
			return
		}

		// Update the request
		now := time.Now()
		vacationRequest.Status = models.StatusRejected
		vacationRequest.ApprovedBy = &managerID
		vacationRequest.ApprovalDate = &now
		vacationRequest.ApprovalComment = req.Comment

		if err := db.Save(&vacationRequest).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to reject vacation request",
			})
			return
		}

		// TODO: Create notification for employee
		// TODO: Send email notification

		// Load updated data for response
		if err := db.Preload("User").Preload("Approver").First(&vacationRequest, vacationRequest.ID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to load vacation request details",
			})
			return
		}

		c.JSON(http.StatusOK, vacationRequest.ToResponse())
	}
}

func GetTeamCalendar(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userIDStr, exists := c.Get(middleware.UserIDKey)
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "User ID not found in context",
			})
			return
		}

		userRole, exists := c.Get(middleware.UserRoleKey)
		if !exists || (userRole != "manager" && userRole != "admin") {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Insufficient permissions",
			})
			return
		}

		managerID, err := uuid.Parse(userIDStr.(string))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid user ID format",
			})
			return
		}

		// Parse query parameters for date range
		startDateStr := c.DefaultQuery("start_date", time.Now().Format("2006-01-02"))
		endDateStr := c.DefaultQuery("end_date", time.Now().AddDate(0, 3, 0).Format("2006-01-02"))

		startDate, err := time.Parse("2006-01-02", startDateStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid start_date format (YYYY-MM-DD)",
			})
			return
		}

		endDate, err := time.Parse("2006-01-02", endDateStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid end_date format (YYYY-MM-DD)",
			})
			return
		}

		// Get all approved vacation requests for team members in the date range
		var requests []models.VacationRequest
		if err := db.Preload("User").
			Joins("JOIN users ON users.id = vacation_requests.user_id").
			Where("users.manager_id = ? AND vacation_requests.status = ? AND vacation_requests.start_date <= ? AND vacation_requests.end_date >= ?",
				managerID, models.StatusApproved, endDate, startDate).
			Order("vacation_requests.start_date ASC").
			Find(&requests).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to fetch team calendar",
			})
			return
		}

		// Convert to response format
		var calendarEntries []map[string]interface{}
		for _, req := range requests {
			calendarEntries = append(calendarEntries, map[string]interface{}{
				"id":            req.ID.String(),
				"user_id":       req.UserID.String(),
				"user_name":     req.User.Name,
				"start_date":    req.StartDate.Format("2006-01-02"),
				"end_date":      req.EndDate.Format("2006-01-02"),
				"business_days": req.BusinessDays,
				"reason":        req.Reason,
			})
		}

		response := gin.H{
			"start_date": startDate.Format("2006-01-02"),
			"end_date":   endDate.Format("2006-01-02"),
			"entries":    calendarEntries,
			"total":      len(calendarEntries),
		}

		c.JSON(http.StatusOK, response)
	}
}

func GetTeamStats(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userIDStr, exists := c.Get(middleware.UserIDKey)
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "User ID not found in context",
			})
			return
		}

		userRole, exists := c.Get(middleware.UserRoleKey)
		if !exists || (userRole != "manager" && userRole != "admin") {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Insufficient permissions",
			})
			return
		}

		managerID, err := uuid.Parse(userIDStr.(string))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid user ID format",
			})
			return
		}

		// Get team members count
		var teamMembersCount int64
		if err := db.Model(&models.User{}).
			Where("manager_id = ? AND active = ?", managerID, true).
			Count(&teamMembersCount).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to count team members",
			})
			return
		}

		// Get pending requests count
		var pendingRequestsCount int64
		if err := db.Model(&models.VacationRequest{}).
			Joins("JOIN users ON users.id = vacation_requests.user_id").
			Where("users.manager_id = ? AND vacation_requests.status = ?", managerID, models.StatusPending).
			Count(&pendingRequestsCount).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to count pending requests",
			})
			return
		}

		// Get current year approved requests
		currentYear := time.Now().Year()
		startOfYear := time.Date(currentYear, 1, 1, 0, 0, 0, 0, time.UTC)
		endOfYear := time.Date(currentYear, 12, 31, 23, 59, 59, 0, time.UTC)

		var approvedRequestsCount int64
		if err := db.Model(&models.VacationRequest{}).
			Joins("JOIN users ON users.id = vacation_requests.user_id").
			Where("users.manager_id = ? AND vacation_requests.status = ? AND vacation_requests.start_date >= ? AND vacation_requests.start_date <= ?",
				managerID, models.StatusApproved, startOfYear, endOfYear).
			Count(&approvedRequestsCount).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to count approved requests",
			})
			return
		}

		// Get total vacation days approved this year
		var totalVacationDays int64
		if err := db.Model(&models.VacationRequest{}).
			Select("COALESCE(SUM(business_days), 0)").
			Joins("JOIN users ON users.id = vacation_requests.user_id").
			Where("users.manager_id = ? AND vacation_requests.status = ? AND vacation_requests.start_date >= ? AND vacation_requests.start_date <= ?",
				managerID, models.StatusApproved, startOfYear, endOfYear).
			Scan(&totalVacationDays).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to calculate vacation days",
			})
			return
		}

		// Get team members with their vacation balances
		var teamMembers []models.User
		if err := db.Where("manager_id = ? AND active = ?", managerID, true).
			Order("name ASC").Find(&teamMembers).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to fetch team members",
			})
			return
		}

		var teamMembersData []map[string]interface{}
		for _, member := range teamMembers {
			teamMembersData = append(teamMembersData, map[string]interface{}{
				"id":               member.ID.String(),
				"name":             member.Name,
				"email":            member.Email,
				"vacation_balance": member.VacationBalance,
				"department":       member.Department,
			})
		}

		response := gin.H{
			"team_members_count":      teamMembersCount,
			"pending_requests_count":  pendingRequestsCount,
			"approved_requests_count": approvedRequestsCount,
			"total_vacation_days":     totalVacationDays,
			"current_year":            currentYear,
			"team_members":            teamMembersData,
		}

		c.JSON(http.StatusOK, response)
	}
}