const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ValidateEmail = (mail) => {
  if (emailRegex.test(mail)) {
    return true;
  } else {
    return false;
  }
};
