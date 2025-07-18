package models

import (
	"time"

	"github.com/google/uuid"
)

type CreateVacationRequestRequest struct {
	StartDate        time.Time `json:"start_date" binding:"required"`
	EndDate          time.Time `json:"end_date" binding:"required"`
	Reason           string    `json:"reason"`
	EmergencyContact string    `json:"emergency_contact" binding:"required"`
}

type UpdateVacationRequestRequest struct {
	StartDate        *time.Time `json:"start_date,omitempty"`
	EndDate          *time.Time `json:"end_date,omitempty"`
	Reason           *string    `json:"reason,omitempty"`
	EmergencyContact *string    `json:"emergency_contact,omitempty"`
}

type VacationRequestResponse struct {
	ID                string                 `json:"id"`
	UserID            string                 `json:"user_id"`
	User              *UserResponse          `json:"user,omitempty"`
	StartDate         time.Time              `json:"start_date"`
	EndDate           time.Time              `json:"end_date"`
	BusinessDays      int                    `json:"business_days"`
	Status            string                 `json:"status"`
	Reason            string                 `json:"reason"`
	EmergencyContact  string                 `json:"emergency_contact"`
	ApprovedBy        *string                `json:"approved_by,omitempty"`
	Approver          *UserResponse          `json:"approver,omitempty"`
	ApprovalDate      *time.Time             `json:"approval_date,omitempty"`
	ApprovalComment   string                 `json:"approval_comment"`
	CreatedAt         time.Time              `json:"created_at"`
	UpdatedAt         time.Time              `json:"updated_at"`
}

type ApprovalRequest struct {
	Comment string `json:"comment"`
}

type VacationRequestsListResponse struct {
	Requests   []*VacationRequestResponse `json:"requests"`
	Total      int64                      `json:"total"`
	Page       int                        `json:"page"`
	PerPage    int                        `json:"per_page"`
	TotalPages int                        `json:"total_pages"`
}

func (vr *VacationRequest) ToResponse() *VacationRequestResponse {
	response := &VacationRequestResponse{
		ID:               vr.ID.String(),
		UserID:           vr.UserID.String(),
		StartDate:        vr.StartDate,
		EndDate:          vr.EndDate,
		BusinessDays:     vr.BusinessDays,
		Status:           string(vr.Status),
		Reason:           vr.Reason,
		EmergencyContact: vr.EmergencyContact,
		ApprovalComment:  vr.ApprovalComment,
		CreatedAt:        vr.CreatedAt,
		UpdatedAt:        vr.UpdatedAt,
	}

	if vr.User.ID != uuid.Nil {
		response.User = vr.User.ToResponse()
	}

	if vr.ApprovedBy != nil {
		response.ApprovedBy = &vr.ApprovedBy.String()
		if vr.Approver != nil && vr.Approver.ID != uuid.Nil {
			response.Approver = vr.Approver.ToResponse()
		}
	}

	if vr.ApprovalDate != nil {
		response.ApprovalDate = vr.ApprovalDate
	}

	return response
}