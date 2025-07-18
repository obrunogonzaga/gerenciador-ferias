package models

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type LoginResponse struct {
	User         *UserResponse `json:"user"`
	AccessToken  string        `json:"access_token"`
	RefreshToken string        `json:"refresh_token"`
	TokenType    string        `json:"token_type"`
	ExpiresIn    int           `json:"expires_in"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

type UserResponse struct {
	ID              string    `json:"id"`
	Email           string    `json:"email"`
	Name            string    `json:"name"`
	Role            string    `json:"role"`
	VacationBalance int       `json:"vacation_balance"`
	Department      string    `json:"department"`
	Manager         *Manager  `json:"manager,omitempty"`
}

type Manager struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

func (u *User) ToResponse() *UserResponse {
	response := &UserResponse{
		ID:              u.ID.String(),
		Email:           u.Email,
		Name:            u.Name,
		Role:            string(u.Role),
		VacationBalance: u.VacationBalance,
		Department:      u.Department,
	}

	if u.Manager != nil {
		response.Manager = &Manager{
			ID:    u.Manager.ID.String(),
			Name:  u.Manager.Name,
			Email: u.Manager.Email,
		}
	}

	return response
}