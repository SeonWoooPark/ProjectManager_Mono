export interface CompanyManagerSignupRequestDto {
  user: {
    email: string;
    password: string;
    user_name: string;
    phone_number: string;
  };
  company: {
    company_name: string;
    company_description?: string;
  };
}

export interface TeamMemberSignupRequestDto {
  user: {
    email: string;
    password: string;
    user_name: string;
    phone_number: string;
  };
  invitation_code: string;
}