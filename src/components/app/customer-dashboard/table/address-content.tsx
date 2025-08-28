import { Button } from "@/components/ui/button";
import { DateTimeFormat } from "@/utils/date/date-time-format";
import { Check, Edit, Eye, Trash } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AddressModel } from "@/models/public/dashboard/address/address.response";
import { TableColumn } from "@/components/shared/table/data-table";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface AddressTableHandlers {
  handleOpenEditAddressDialog: (Address: AddressModel) => void;
  handleOpenViewAddressDetailDialog: (Address: AddressModel) => void;
  handleOpenDeleteAddressDialog: (Address: AddressModel) => void;
  handleSetDefaultAddress: (Address: AddressModel) => void;
}

interface AddressTableOptions {
  data: AddressModel[] | null;
  handlers: AddressTableHandlers;
}

export const createAddressTableColumns = ({
  handlers,
}: AddressTableOptions): TableColumn<AddressModel>[] => {
  const {
    handleOpenEditAddressDialog,
    handleOpenViewAddressDetailDialog,
    handleOpenDeleteAddressDialog,
    handleSetDefaultAddress,
  } = handlers;

  return [
    {
      key: "index",
      label: "#",
      className: "w-[60px]",
      render: (_, index) => <span className="font-medium">{index + 1}</span>,
    },
    {
      key: "default",
      label: "Default Address",
      render: (address: AddressModel) => (
        <Switch
          checked={address.isDefault} // directly use the boolean
          aria-label="Toggle default address"
          onCheckedChange={() => handleSetDefaultAddress(address)}
          className={cn(
            "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
            "bg-gray-300 dark:bg-gray-600 data-[state=checked]:bg-blue-500 dark:data-[state=checked]:bg-blue-400"
          )}
        >
          <div
            className={cn(
              "inline-block h-6 w-11 transform rounded-full bg-white dark:bg-gray-100 shadow-md transition-transform",
              "translate-x-1 data-[state=checked]:translate-x-5"
            )}
          >
            {address.isDefault && (
              <Check className="h-6 m-auto text-orange-600 dark:text-orange-300" />
            )}
          </div>
        </Switch>
      ),
    },
    {
      key: "village",
      label: "Village",
      render: (Address) => (
        <span className="font-medium">{Address.village || "---"}</span>
      ),
    },
    {
      key: "commune",
      label: "Commune",
      render: (Address) => (
        <span className="font-medium">{Address.commune || "---"}</span>
      ),
    },
    {
      key: "district",
      label: "District",
      render: (Address) => (
        <span className="font-medium">{Address.district || "---"}</span>
      ),
    },
    {
      key: "province",
      label: "Province",
      render: (Address) => (
        <span className="font-medium">{Address.province || "---"}</span>
      ),
    },
    {
      key: "streetNumber",
      label: "Street Number",
      render: (Address) => (
        <span className="font-medium">{Address.streetNumber || "---"}</span>
      ),
    },
    {
      key: "houseNumber",
      label: "House Number",
      render: (Address) => (
        <span className="font-medium">{Address.houseNumber || "---"}</span>
      ),
    },
    {
      key: "note",
      label: "Note",
      render: (Address) => (
        <span className="font-medium">{Address.note || "---"}</span>
      ),
    },
    {
      key: "latitude",
      label: "Latitude",
      render: (Address) => (
        <span className="font-medium">{Address.latitude || "---"}</span>
      ),
    },
    {
      key: "longitude",
      label: "Longitude",
      render: (Address) => (
        <span className="font-medium">{Address.longitude || "---"}</span>
      ),
    },
    {
      key: "isDefault",
      label: "Default",
      render: (Address) => <span>{Address.isDefault ? "Yes" : "No"}</span>,
    },
    {
      key: "fullAddress",
      label: "Full Address",
      render: (Address) => (
        <span className="font-medium">{Address.fullAddress || "---"}</span>
      ),
    },
    {
      key: "hasCoordinates",
      label: "Has Coordinates",
      render: (Address) => <span>{Address.hasCoordinates ? "Yes" : "No"}</span>,
    },
    {
      key: "createdAt",
      label: "Created At",
      render: (Address) => (
        <span className="text-muted-foreground">
          {DateTimeFormat(Address.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      className: "w-[160px]",
      render: (Address) => (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEditAddressDialog(Address)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenViewAddressDetailDialog(Address)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleOpenDeleteAddressDialog(Address)}
                >
                  <Trash className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ];
};
