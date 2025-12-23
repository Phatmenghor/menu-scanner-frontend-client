import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import {
  AllExchangeRateResponseModel,
  ExchangeRateResponseModel,
} from "../store/models/response/exchange-rate-response";
import { ActionButton } from "@/components/shared/button/action-button";

interface HandlersTableHandlers {
  handleEdit: (param: ExchangeRateResponseModel) => void;
  handleViewDetail: (param: ExchangeRateResponseModel) => void;
  handleDelete: (param: ExchangeRateResponseModel) => void;
}

interface TableOptions {
  parameter: AllExchangeRateResponseModel | null;
  handlers: HandlersTableHandlers;
}

export const bannerTableColumns = ({
  parameter,
  handlers,
}: TableOptions): TableColumn<ExchangeRateResponseModel>[] => {
  const { handleEdit, handleViewDetail, handleDelete } = handlers;

  return [
    {
      key: "index",
      label: "#",
      minWidth: "10px",
      maxWidth: "400px",
      render: (_, index) => (
        <span className="font-medium">
          {indexDisplay(parameter?.pageNo, parameter?.pageSize, index + 1)}
        </span>
      ),
    },

    {
      key: "usdToKhrRate",
      label: "USD To KHR Rate",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (parameter) => (
        <span className="text-xs text-muted-foreground">
          {parameter?.formattedKhrRate || "---"}
        </span>
      ),
    },
    {
      key: "usdToCnyRate",
      label: "USD To CNY Rate",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (parameter) => (
        <span className="text-xs text-muted-foreground">
          {parameter?.formattedCnyRate || "---"}
        </span>
      ),
    },
    {
      key: "usdToThbRate",
      label: "USD To THB Rate",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (parameter) => (
        <span className="text-xs text-muted-foreground">
          {parameter?.formattedThbRate || "---"}
        </span>
      ),
    },
    {
      key: "usdToVndRate",
      label: "USD To VND Rate",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (parameter) => (
        <span className="text-xs text-muted-foreground">
          {parameter?.formattedVndRate || "---"}
        </span>
      ),
    },

    {
      key: "status",
      label: "Status",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (parameter) => (
        <span className="text-xs text-muted-foreground">
          {parameter?.isActive || "---"}
        </span>
      ),
    },

    {
      key: "createdAt",
      label: "Created At",
      minWidth: "10px",
      maxWidth: "400px",
      render: (parameter) => (
        <span className="text-sm text-muted-foreground">
          {dateTimeFormat(parameter?.createdAt)}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      minWidth: "10px",
      maxWidth: "400px",
      render: (parameter) => (
        <div className="flex items-center gap-2">
          <ActionButton
            icon={<Eye className="w-4 h-4" />}
            tooltip="View Details"
            onClick={() => handleViewDetail(parameter)}
          />
          <ActionButton
            icon={<Edit className="w-4 h-4" />}
            tooltip="Edit Banner"
            onClick={() => handleEdit(parameter)}
          />
          <ActionButton
            icon={<Trash className="w-4 h-4" />}
            tooltip="Delete Banner"
            onClick={() => handleDelete(parameter)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
