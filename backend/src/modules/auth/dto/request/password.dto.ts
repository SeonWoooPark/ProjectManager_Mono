export interface ForgotPasswordRequestDto {
  email: string;
}

export interface ResetPasswordRequestDto {
  token: string;
  new_password: string;
  confirm_password: string;
}

export interface ChangePasswordRequestDto {
  current_password: string;
  new_password: string;
  confirm_password: string;
}
