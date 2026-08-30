export type VendorStatus = "pending" | "active" | "inactive";

export type ModuleVendor = {
  id: string;
  handle: string;
  name: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  logo: string | null;
  status: VendorStatus;
};

export type ModuleCreateVendor = {
  name: string;
  handle?: string;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  logo?: string | null;
  status?: VendorStatus;
};

export type ModuleUpdateVendor = Partial<ModuleCreateVendor> & {
  id: string;
};
