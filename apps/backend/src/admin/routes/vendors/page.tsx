import { defineRouteConfig } from "@medusajs/admin-sdk";
import { BuildingStorefront } from "@medusajs/icons";
import {
  Avatar,
  Badge,
  Container,
  Heading,
  Table,
  Text,
  Toaster,
} from "@medusajs/ui";
import { QueryVendor } from "../../../types";
import { useVendors } from "../../hooks/api";
import { VendorActionsMenu, VendorCreateDrawer } from "./components";

const Vendors = () => {
  const { data, isPending } = useVendors();

  return (
    <>
      <Container className="flex flex-col p-0 overflow-hidden">
        <div className="p-6 flex justify-between">
          <Heading className="font-sans font-medium h1-core">Vendors</Heading>
          <VendorCreateDrawer />
        </div>
        {isPending && <Text>Loading...</Text>}
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell></Table.HeaderCell>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Handle</Table.HeaderCell>
              <Table.HeaderCell>Email</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Products</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          {data?.vendors && (
            <Table.Body>
              {data.vendors.map((vendor: QueryVendor) => (
                <Table.Row
                  key={vendor.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() =>
                    (window.location.href = `/app/vendors/${vendor.id}`)
                  }
                >
                  <Table.Cell>
                    <Avatar
                      src={vendor.logo || undefined}
                      fallback={vendor.name.charAt(0)}
                    />
                  </Table.Cell>
                  <Table.Cell>{vendor.name}</Table.Cell>
                  <Table.Cell>{vendor.handle}</Table.Cell>
                  <Table.Cell>{vendor.email || "-"}</Table.Cell>
                  <Table.Cell>
                    <Badge
                      size="small"
                      color={
                        vendor.status === "active"
                          ? "green"
                          : vendor.status === "pending"
                            ? "orange"
                            : "grey"
                      }
                    >
                      {vendor.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{vendor.products?.length || 0}</Table.Cell>
                  <Table.Cell onClick={(e) => e.stopPropagation()}>
                    <VendorActionsMenu vendor={vendor} />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          )}
        </Table>
      </Container>
      <Toaster />
    </>
  );
};

export const config = defineRouteConfig({
  label: "Vendors",
  icon: BuildingStorefront,
});

export default Vendors;
