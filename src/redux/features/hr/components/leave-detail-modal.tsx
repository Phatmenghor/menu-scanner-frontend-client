"use client";

import { useEffect } from "react";
import { dateTimeFormat, formatDate } from "@/utils/date/date-time-format";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import {
  DetailRow,
  DetailSection,
} from "@/components/shared/modal/detail-section";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { fetchLeaveByIdService } from "../store/thunks/leave-thunks";
import {
  selectIsFetchingDetail,
  selectSelectedLeave,
} from "../store/selectors/leave-selectors";
import { clearSelectedLeave } from "../store/slice/leave-slice";

interface LeaveDetailModalProps {
  leaveId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function LeaveDetailModal({
  leaveId,
  isOpen,
  onClose,
}: LeaveDetailModalProps) {
  const dispatch = useAppDispatch();
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const leaveData = useAppSelector(selectSelectedLeave);

  useEffect(() => {
    const fetchLeaveData = async () => {
      if (!leaveId || !isOpen) return;
      try {
        await dispatch(fetchLeaveByIdService(leaveId)).unwrap();
      } catch (error: any) {
        console.error("Error fetching leave data:", error);
      }
    };

    fetchLeaveData();
  }, [leaveId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedLeave());
    onClose();
  };

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={isFetchingDetail}
      title={"Leave Details"}
      description={"Detailed information about the selected leave."}
    >
      {leaveData ? (
        <div className="space-y-6">
          {/* Leave Information */}
          <DetailSection title="Leave Information">
            <DetailRow
              label="Full Name"
              value={leaveData?.userInfo?.fullName || "---"}
            />

            <DetailRow
              label="Phone Number"
              value={leaveData?.userInfo?.phoneNumber || "---"}
            />

            <DetailRow
              label="Email"
              value={leaveData?.userInfo?.email || "---"}
            />

            <DetailRow
              label="Start Date"
              value={formatDate(leaveData?.startDate) || "---"}
            />

            <DetailRow
              label="End Date"
              value={formatDate(leaveData?.endDate) || "---"}
            />

            <DetailRow
              label="Total Days"
              value={leaveData?.totalDays || "---"}
            />

            <DetailRow label="Status" value={leaveData?.status || "---"} />

            <DetailRow
              label="Reason"
              value={leaveData?.reason || "---"}
              isLast
            />
          </DetailSection>

          <DetailSection title="Approved Information">
            <DetailRow
              label="Full Name"
              value={leaveData?.actionUserInfo?.fullName || "---"}
            />

            <DetailRow
              label="Phone Number"
              value={leaveData?.actionUserInfo?.phoneNumber || "---"}
            />

            <DetailRow
              label="Email"
              value={leaveData?.actionUserInfo?.email || "---"}
            />

            <DetailRow
              label="Email"
              value={dateTimeFormat(leaveData?.actionAt) || "---"}
            />

            <DetailRow
              label="Action Note"
              value={leaveData?.actionNote || "---"}
              isLast
            />
          </DetailSection>

          {/* System Information */}
          <DetailSection title="System Information">
            <DetailRow
              label="Leave Type ID"
              value={
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded break-all">
                  {leaveData?.id}
                </span>
              }
            />
            <DetailRow
              label="Created At"
              value={dateTimeFormat(leaveData?.createdAt ?? "")}
            />
            <DetailRow
              label="Created By"
              value={leaveData?.createdBy || "---"}
            />
            <DetailRow
              label="Last Updated"
              value={dateTimeFormat(leaveData?.updatedAt ?? "")}
            />
            <DetailRow
              label="Updated By"
              value={leaveData?.updatedBy || "---"}
              isLast
            />
          </DetailSection>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No leave data available</p>
        </div>
      )}
    </DetailModal>
  );
}
