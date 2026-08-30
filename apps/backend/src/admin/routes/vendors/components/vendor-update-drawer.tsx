import { Drawer } from "@medusajs/ui";
import { AdminCreateVendor, QueryVendor } from "../../../../types";
import { useUpdateVendor } from "../../../hooks/api";
import { VendorForm } from "./vendor-form";

export function VendorUpdateDrawer({
  vendor,
  open,
  setOpen,
}: {
  vendor: QueryVendor;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { mutateAsync, isPending } = useUpdateVendor(vendor.id);

  const handleSubmit = async (formData: AdminCreateVendor) => {
    await mutateAsync(formData, {
      onSuccess: () => setOpen(false),
    });
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Edit vendor</Drawer.Title>
        </Drawer.Header>
        <VendorForm
          vendor={vendor}
          handleSubmit={handleSubmit}
          loading={isPending}
        />
      </Drawer.Content>
    </Drawer>
  );
}
