export const validName = (name) => {
  const regex = /[a-zA-Z]{3,}$/;
  return regex.test(name);
};

export const validEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validPassword = (password) => {
  const regex = /^.{4,16}/;
  return regex.test(password);
};

export const validDataFormat = (date) => {
  const regex = /(\d{4})-(\d{2})-(\d{2})/;
  return regex.test(date);
};

export const validOwnerType = (ownerType) => {
  const regex = /USER|ADMIN/;
  return regex.test(ownerType);
};
