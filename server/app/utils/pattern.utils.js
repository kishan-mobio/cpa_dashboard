export const PASSWORD_REGEX =
  /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,15}$/;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PHONE_REGEX = /^\d{10}$/;

export const URL_REGEX = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
