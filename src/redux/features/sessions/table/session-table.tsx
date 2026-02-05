import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";

import { ActionButton } from "@/components/shared/button/action-button";
import {
  AllSessionsResponseModel,
  SessionResponseModel,
} from "../store/models/response/session-response";

interface SessionTableHandlers {
  handleSessionViewDetail: (session: SessionResponseModel) => void;
  handleDeleteSession: (session: SessionResponseModel) => void;
}

interface SessionTableOptions {
  data: AllSessionsResponseModel | null;
  handlers: SessionTableHandlers;
}

export const sessionTableColumns = ({
  data,
  handlers,
}: SessionTableOptions): TableColumn<SessionResponseModel>[] => {
  const { handleSessionViewDetail, handleDeleteSession } = handlers;

  return [
    {
      key: "index",
      label: "#",
      minWidth: "10px",
      maxWidth: "400px",
      render: (_, index) => (
        <span className="font-medium">
          {indexDisplay(data?.pageNo || 1, data?.pageSize || 15, index + 1)}
        </span>
      ),
    },

    {
      key: "status",
      label: "Status",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (deliveryOptions) => (
        <span className="text-xs text-muted-foreground">
          {deliveryOptions?.status || "---"}
        </span>
      ),
    },

    {
      key: "createdAt",
      label: "Created At",
      minWidth: "10px",
      maxWidth: "400px",
      render: (deliveryOptions) => (
        <span className="text-sm text-muted-foreground">
          {dateTimeFormat(deliveryOptions?.createdAt)}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      minWidth: "10px",
      maxWidth: "400px",
      render: (session) => (
        <div className="flex items-center gap-2">
          <ActionButton
            icon={<Eye className="w-4 h-4" />}
            tooltip="View Details"
            onClick={() => handleSessionViewDetail(session)}
          />

          <ActionButton
            icon={<Trash className="w-4 h-4" />}
            tooltip="Delete Session"
            onClick={() => handleDeleteSession(session)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
