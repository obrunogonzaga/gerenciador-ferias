package utils

import (
	"errors"

	"golang.org/x/crypto/bcrypt"
)

const minPasswordLength = 6

func HashPassword(password string) (string, error) {
	if len(password) < minPasswordLength {
		return "", errors.New("password too short")
	}
	
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedPassword), nil
}

func CheckPassword(password, hashedPassword string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}