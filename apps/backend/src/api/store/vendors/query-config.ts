export const storeVendorFields = [
  "id",
  "handle",
  "name",
  "description",
  "email",
  "phone",
  "logo",
  "status",
];

export const storeVendorQueryConfig = {
  list: {
    defaults: storeVendorFields,
    isList: true,
  },
  retrieve: {
    defaults: [...storeVendorFields, "*products"],
    isList: false,
  },
};
