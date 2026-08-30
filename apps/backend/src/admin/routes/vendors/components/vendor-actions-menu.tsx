import { PencilSquare, Trash } from "@medusajs/icons";
import { toast } from "@medusajs/ui";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QueryVendor } from "../../../../types";
import { ActionMenu } from "../../../components/common";
import { DeletePrompt } from "../../../components/common/delete-prompt";
import { useDeleteVendor } from "../../../hooks/api";
import { VendorUpdateDrawer } from "./vendor-update-drawer";

export const VendorActionsMenu = ({ vendor }: { vendor: QueryVendor }) => {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { mutateAsync: mutateDelete, isPending: loadingDelete } =
    useDeleteVendor(vendor.id);
  const navigate = useNavigate();

  return (
    <>
      <ActionMenu
        groups={[
          {
            actions: [
              {
                icon: <PencilSquare />,
                label: "Edit details",
                onClick: () => setEditOpen(true),
              },
            ],
          },
          {
            actions: [
              {
                icon: <Trash />,
                label: "Delete",
                onClick: () => setDeleteOpen(true),
              },
            ],
          },
        ]}
      />
      <VendorUpdateDrawer
        vendor={vendor}
        open={editOpen}
        setOpen={setEditOpen}
      />
      <DeletePrompt
        handleDelete={() => {
          mutateDelete(undefined, {
            onSuccess: () => {
              navigate("/vendors");
              toast.success(`Vendor ${vendor.name} deleted`);
            },
          });
        }}
        loading={loadingDelete}
        open={deleteOpen}
        setOpen={setDeleteOpen}
      />
    </>
  );
};
