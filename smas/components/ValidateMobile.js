export const validateMobile = (mobile) => {
  const regex = /^[6789]\d{9}$/;
  if (regex.test(mobile)) {
    return true;
  }
  return false;
};
