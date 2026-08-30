import { Button, Drawer, Input, Label, Select, Textarea } from "@medusajs/ui";
import { useState } from "react";
import { AdminCreateVendor, AdminUpdateVendor, VendorStatus } from "../../../../types";

export function VendorForm({
  vendor,
  handleSubmit,
  loading,
}: {
  vendor?: AdminUpdateVendor & { name?: string };
  handleSubmit: (data: AdminCreateVendor) => Promise<void>;
  loading: boolean;
}) {
  const [formData, setFormData] = useState<AdminCreateVendor>({
    name: vendor?.name || "",
    handle: vendor?.handle || "",
    description: vendor?.description || "",
    email: vendor?.email || "",
    phone: vendor?.phone || "",
    logo: vendor?.logo || "",
    status: vendor?.status || "active",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(formData);
      }}
    >
      <Drawer.Body className="p-4 flex flex-col gap-2">
        <Label size="xsmall">Vendor name</Label>
        <Input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Acme Wholesale"
          required
        />
        <Label size="xsmall">Handle</Label>
        <Input
          name="handle"
          value={formData.handle || ""}
          onChange={handleChange}
          placeholder="acme-wholesale"
        />
        <Label size="xsmall">Email</Label>
        <Input
          type="email"
          name="email"
          value={formData.email || ""}
          onChange={handleChange}
          placeholder="sales@vendor.com"
        />
        <Label size="xsmall">Phone</Label>
        <Input
          name="phone"
          value={formData.phone || ""}
          onChange={handleChange}
        />
        <Label size="xsmall">Logo URL</Label>
        <Input
          name="logo"
          value={formData.logo || ""}
          onChange={handleChange}
        />
        <Label size="xsmall">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) =>
            setFormData({ ...formData, status: value as VendorStatus })
          }
        >
          <Select.Trigger>
            <Select.Value placeholder="Status" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="active">Active</Select.Item>
            <Select.Item value="pending">Pending</Select.Item>
            <Select.Item value="inactive">Inactive</Select.Item>
          </Select.Content>
        </Select>
        <Label size="xsmall">Description</Label>
        <Textarea
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          placeholder="What this supplier sells"
        />
      </Drawer.Body>
      <Drawer.Footer>
        <Drawer.Close asChild>
          <Button variant="secondary">Cancel</Button>
        </Drawer.Close>
        <Button type="submit" isLoading={loading}>
          Save
        </Button>
      </Drawer.Footer>
    </form>
  );
}
