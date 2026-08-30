import { Button, Drawer } from "@medusajs/ui";
import { useState } from "react";
import { AdminCreateVendor } from "../../../../types";
import { useCreateVendor } from "../../../hooks/api";
import { VendorForm } from "./vendor-form";

export function VendorCreateDrawer() {
  const [open, setOpen] = useState(false);
  const { mutateAsync, isPending } = useCreateVendor();

  const handleSubmit = async (formData: AdminCreateVendor) => {
    await mutateAsync(formData, {
      onSuccess: () => setOpen(false),
    });
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <Button variant="secondary" size="small">
          Create
        </Button>
      </Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Create vendor</Drawer.Title>
        </Drawer.Header>
        <VendorForm handleSubmit={handleSubmit} loading={isPending} />
      </Drawer.Content>
    </Drawer>
  );
}
