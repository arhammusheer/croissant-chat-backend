export const validateEmail = (email: string) => {
  const isEmailValid = email.match(
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
  );

  return !!isEmailValid;
};

export const validatePassword = (password: string) => {
  // Password validation
  const regex_8length = /.{8,}/;
  const regex_1uppercase = /(?=.*[A-Z])/;
  const regex_1lowercase = /(?=.*[a-z])/;
  const regex_1number = /(?=.*[0-9])/;

  const isPasswordValid =
    regex_8length.test(password) &&
    regex_1uppercase.test(password) &&
    regex_1lowercase.test(password) &&
    regex_1number.test(password);

  return !!isPasswordValid;
};
