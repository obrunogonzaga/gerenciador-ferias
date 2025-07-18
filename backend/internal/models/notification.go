package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type NotificationType string

const (
	NotificationRequest  NotificationType = "request"
	NotificationApproval NotificationType = "approval"
	NotificationRejection NotificationType = "rejection"
	NotificationReminder NotificationType = "reminder"
	NotificationSystem   NotificationType = "system"
)

type Notification struct {
	ID        uuid.UUID        `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID    uuid.UUID        `json:"user_id" gorm:"type:uuid;not null"`
	User      User             `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Type      NotificationType `json:"type" gorm:"type:varchar(20);not null"`
	Title     string           `json:"title" gorm:"not null"`
	Message   string           `json:"message" gorm:"not null"`
	Read      bool             `json:"read" gorm:"default:false"`
	ReadAt    *time.Time       `json:"read_at"`
	CreatedAt time.Time        `json:"created_at"`
	UpdatedAt time.Time        `json:"updated_at"`
}

func (Notification) TableName() string {
	return "notifications"
}

func (n *Notification) BeforeCreate(tx *gorm.DB) error {
	if n.ID == uuid.Nil {
		n.ID = uuid.New()
	}
	return nil
}