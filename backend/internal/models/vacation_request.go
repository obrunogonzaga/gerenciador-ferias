package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type VacationStatus string

const (
	StatusPending   VacationStatus = "pending"
	StatusApproved  VacationStatus = "approved"
	StatusRejected  VacationStatus = "rejected"
	StatusCancelled VacationStatus = "cancelled"
)

type VacationRequest struct {
	ID                uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID            uuid.UUID      `json:"user_id" gorm:"type:uuid;not null"`
	User              User           `json:"user,omitempty" gorm:"foreignKey:UserID"`
	StartDate         time.Time      `json:"start_date" gorm:"not null"`
	EndDate           time.Time      `json:"end_date" gorm:"not null"`
	BusinessDays      int            `json:"business_days" gorm:"not null"`
	Status            VacationStatus `json:"status" gorm:"type:varchar(20);not null;default:'pending'"`
	Reason            string         `json:"reason"`
	EmergencyContact  string         `json:"emergency_contact" gorm:"not null"`
	ApprovedBy        *uuid.UUID     `json:"approved_by" gorm:"type:uuid"`
	Approver          *User          `json:"approver,omitempty" gorm:"foreignKey:ApprovedBy"`
	ApprovalDate      *time.Time     `json:"approval_date"`
	ApprovalComment   string         `json:"approval_comment"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
	DeletedAt         gorm.DeletedAt `json:"-" gorm:"index"`
}

func (VacationRequest) TableName() string {
	return "vacation_requests"
}

func (vr *VacationRequest) BeforeCreate(tx *gorm.DB) error {
	if vr.ID == uuid.Nil {
		vr.ID = uuid.New()
	}
	// Calculate business days
	vr.BusinessDays = calculateBusinessDays(vr.StartDate, vr.EndDate)
	return nil
}

func calculateBusinessDays(start, end time.Time) int {
	days := 0
	for d := start; !d.After(end); d = d.AddDate(0, 0, 1) {
		if d.Weekday() != time.Saturday && d.Weekday() != time.Sunday {
			days++
		}
	}
	return days
}