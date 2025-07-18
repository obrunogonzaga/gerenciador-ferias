package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserRole string

const (
	RoleEmployee UserRole = "employee"
	RoleManager  UserRole = "manager"
	RoleAdmin    UserRole = "admin"
)

type User struct {
	ID              uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Email           string         `json:"email" gorm:"uniqueIndex;not null"`
	Name            string         `json:"name" gorm:"not null"`
	PasswordHash    string         `json:"-" gorm:"not null"`
	Role            UserRole       `json:"role" gorm:"type:varchar(20);not null;default:'employee'"`
	ManagerID       *uuid.UUID     `json:"manager_id" gorm:"type:uuid"`
	Manager         *User          `json:"manager,omitempty" gorm:"foreignKey:ManagerID"`
	VacationBalance int            `json:"vacation_balance" gorm:"default:30"`
	Department      string         `json:"department"`
	Active          bool           `json:"active" gorm:"default:true"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `json:"-" gorm:"index"`
}

func (User) TableName() string {
	return "users"
}

// BeforeCreate hook to ensure UUID is generated
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}