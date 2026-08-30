import {
  Avatar,
  Badge,
  Container,
  Heading,
  Table,
  Text,
  Toaster,
} from "@medusajs/ui";
import { useParams } from "react-router-dom";
import { useVendor } from "../../../hooks/api";
import { VendorActionsMenu } from "../components";

const VendorDetails = () => {
  const { vendorId } = useParams();
  const { data, isPending } = useVendor(vendorId!, {
    fields: "*products,*admins",
  });

  const vendor = data?.vendor;

  if (isPending) {
    return <Text>Loading...</Text>;
  }

  if (!vendor) {
    return <div>Vendor not found</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <Container className="flex flex-col p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200 justify-between">
          <div className="flex items-center gap-2">
            <Avatar
              src={vendor.logo || undefined}
              fallback={vendor.name.charAt(0)}
            />
            <Heading className="font-sans font-medium h1-core">
              {vendor.name}
            </Heading>
            <Badge
              size="small"
              color={vendor.status === "active" ? "green" : "grey"}
            >
              {vendor.status}
            </Badge>
          </div>
          <VendorActionsMenu vendor={vendor} />
        </div>
        <Table>
          <Table.Body>
            <Table.Row>
              <Table.Cell className="font-medium">Handle</Table.Cell>
              <Table.Cell>{vendor.handle}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell className="font-medium">Email</Table.Cell>
              <Table.Cell>{vendor.email || "-"}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell className="font-medium">Phone</Table.Cell>
              <Table.Cell>{vendor.phone || "-"}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell className="font-medium">Description</Table.Cell>
              <Table.Cell>{vendor.description || "-"}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </Container>
      <Container className="flex flex-col p-0 overflow-hidden">
        <div className="p-6">
          <Heading className="font-sans font-medium h1-core">Products</Heading>
        </div>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Title</Table.HeaderCell>
              <Table.HeaderCell>Handle</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {(vendor.products || []).map((product) => (
              <Table.Row
                key={product.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() =>
                  (window.location.href = `/app/products/${product.id}`)
                }
              >
                <Table.Cell>{product.title}</Table.Cell>
                <Table.Cell>{product.handle}</Table.Cell>
                <Table.Cell>{product.status}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        {!vendor.products?.length && (
          <Text className="p-6 text-ui-fg-subtle">
            Assign this vendor on a product detail page to list catalog items
            here.
          </Text>
        )}
      </Container>
      <Toaster />
    </div>
  );
};

export default VendorDetails;
