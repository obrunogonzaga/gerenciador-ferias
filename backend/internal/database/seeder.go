package database

import (
	"log"

	"github.com/gerenciador-ferias/backend/internal/models"
	"github.com/gerenciador-ferias/backend/internal/utils"
	"gorm.io/gorm"
)

func SeedDatabase(db *gorm.DB) error {
	// Check if users already exist
	var userCount int64
	if err := db.Model(&models.User{}).Count(&userCount).Error; err != nil {
		return err
	}

	if userCount > 0 {
		log.Println("Database already seeded, skipping...")
		return nil
	}

	log.Println("Seeding database with initial data...")

	// Create admin user
	adminPassword, err := utils.HashPassword("admin123")
	if err != nil {
		return err
	}

	admin := models.User{
		Email:           "admin@empresa.com",
		Name:            "Administrador Sistema",
		PasswordHash:    adminPassword,
		Role:            models.RoleAdmin,
		VacationBalance: 30,
		Department:      "TI",
		Active:          true,
	}

	if err := db.Create(&admin).Error; err != nil {
		return err
	}

	// Create manager user
	managerPassword, err := utils.HashPassword("manager123")
	if err != nil {
		return err
	}

	manager := models.User{
		Email:           "maria.silva@empresa.com",
		Name:            "Maria Silva",
		PasswordHash:    managerPassword,
		Role:            models.RoleManager,
		VacationBalance: 25,
		Department:      "RH",
		Active:          true,
	}

	if err := db.Create(&manager).Error; err != nil {
		return err
	}

	// Create employee users
	employeePassword, err := utils.HashPassword("123456")
	if err != nil {
		return err
	}

	employees := []models.User{
		{
			Email:           "joao.santos@empresa.com",
			Name:            "João Santos",
			PasswordHash:    employeePassword,
			Role:            models.RoleEmployee,
			ManagerID:       &manager.ID,
			VacationBalance: 22,
			Department:      "Desenvolvimento",
			Active:          true,
		},
		{
			Email:           "ana.oliveira@empresa.com",
			Name:            "Ana Oliveira",
			PasswordHash:    employeePassword,
			Role:            models.RoleEmployee,
			ManagerID:       &manager.ID,
			VacationBalance: 28,
			Department:      "Design",
			Active:          true,
		},
		{
			Email:           "carlos.pereira@empresa.com",
			Name:            "Carlos Pereira",
			PasswordHash:    employeePassword,
			Role:            models.RoleEmployee,
			ManagerID:       &manager.ID,
			VacationBalance: 15,
			Department:      "Marketing",
			Active:          true,
		},
	}

	for _, employee := range employees {
		if err := db.Create(&employee).Error; err != nil {
			return err
		}
	}

	log.Println("Database seeded successfully!")
	log.Println("Available users:")
	log.Println("- Admin: admin@empresa.com / admin123")
	log.Println("- Manager: maria.silva@empresa.com / manager123")
	log.Println("- Employee: joao.santos@empresa.com / 123456")
	log.Println("- Employee: ana.oliveira@empresa.com / 123456")
	log.Println("- Employee: carlos.pereira@empresa.com / 123456")

	return nil
}