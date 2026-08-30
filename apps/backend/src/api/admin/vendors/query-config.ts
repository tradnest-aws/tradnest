export const adminVendorFields = [
  "id",
  "handle",
  "name",
  "description",
  "email",
  "phone",
  "logo",
  "status",
  "created_at",
  "updated_at",
  "*admins",
  "*products",
];

export const adminVendorQueryConfig = {
  list: {
    defaults: adminVendorFields,
    isList: true,
  },
  retrieve: {
    defaults: adminVendorFields,
    isList: false,
  },
};
