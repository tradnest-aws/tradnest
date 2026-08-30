import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { DetailWidgetProps, HttpTypes } from "@medusajs/framework/types";
import { Button, Container, Heading, Select, Text, toast } from "@medusajs/ui";
import { useState } from "react";
import {
  useAssignProductVendor,
  useProductVendor,
  useUnassignProductVendor,
  useVendors,
} from "../hooks/api";

const ProductVendorWidget = ({
  data,
}: DetailWidgetProps<HttpTypes.AdminProduct>) => {
  const { data: vendorData } = useProductVendor(data.id);
  const { data: vendorsData } = useVendors();
  const { mutateAsync: assign, isPending: assigning } = useAssignProductVendor(
    data.id
  );
  const { mutateAsync: unassign, isPending: unassigning } =
    useUnassignProductVendor(data.id);
  const [vendorId, setVendorId] = useState("");

  const currentVendor = vendorData?.vendor;

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Vendor</Heading>
      </div>
      <div className="px-6 py-4 flex flex-col gap-3">
        <Text size="small" className="text-ui-fg-subtle">
          {currentVendor
            ? `Sold by ${currentVendor.name}`
            : "This product is not assigned to a vendor."}
        </Text>
        <Select value={vendorId} onValueChange={setVendorId}>
          <Select.Trigger>
            <Select.Value placeholder="Select a vendor" />
          </Select.Trigger>
          <Select.Content>
            {(vendorsData?.vendors || []).map((vendor) => (
              <Select.Item key={vendor.id} value={vendor.id}>
                {vendor.name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
        <div className="flex gap-2">
          <Button
            size="small"
            disabled={!vendorId}
            isLoading={assigning}
            onClick={async () => {
              await assign({ vendor_id: vendorId });
              toast.success("Vendor assigned");
            }}
          >
            Assign
          </Button>
          {currentVendor && (
            <Button
              size="small"
              variant="secondary"
              isLoading={unassigning}
              onClick={async () => {
                await unassign();
                toast.success("Vendor removed");
              }}
            >
              Remove
            </Button>
          )}
        </div>
      </div>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "product.details.side.after",
});

export default ProductVendorWidget;
