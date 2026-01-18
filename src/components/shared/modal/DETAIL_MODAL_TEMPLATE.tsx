/**
 * =============================================================================
 * DETAIL/VIEW MODAL TEMPLATE - COPY THIS FOR NEW ADMIN VIEW MODALS
 * =============================================================================
 *
 * This template provides a pattern for read-only detail/view modals
 * with 2-column layout support and dynamic sizing.
 *
 * USAGE:
 * 1. Copy this file to your feature components folder
 * 2. Rename it (e.g., your-feature-detail-modal.tsx)
 * 3. Replace all "ENTITY" placeholders with your entity name
 * 4. Update the detail sections and fields
 * 5. Update Redux imports
 *
 * LAYOUT OPTIONS:
 * - 1-column: Use DetailSection with DetailRow
 * - 2-column: Use DetailGrid with DetailRow for side-by-side fields
 *
 * MODAL SIZES:
 * - "lg": Standard detail view with 2-column layout (recommended)
 * - "xl": More detailed views
 * - "2xl": Very detailed with multiple sections
 *
 * =============================================================================
 */

"use client";

import React, { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  EnhancedDetailModal,
  DetailGrid,
  DetailRow,
  DetailSection,
  DetailFullRow,
} from "@/components/shared/modal/enhanced-detail-modal";
import { ModalSizePresets } from "@/components/shared/modal/dynamic-modal";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { dateTimeFormat } from "@/utils/date/date-time-format";

// TODO: Replace with your Redux imports
// import { fetchEntityById } from "../store/thunks/entity-thunks";
// import { selectSelectedEntity, selectIsFetchingDetail } from "../store/selectors/entity-selector";

interface EntityDetailModalProps {
  entityId: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * ENTITY Detail Modal - Read-only View
 *
 * CONFIGURATION:
 * - Modal Size: "lg" (good for 2-column layout)
 * - Layout: Mix of 1-column sections and 2-column grids
 * - Data: Fetched from Redux store
 */
export default function EntityDetailModal({
  entityId,
  isOpen,
  onClose,
}: EntityDetailModalProps) {
  const dispatch = useAppDispatch();

  // TODO: Replace with your selectors
  // const entity = useAppSelector(selectSelectedEntity);
  // const isFetchingDetail = useAppSelector(selectIsFetchingDetail);

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen && entityId) {
      // TODO: dispatch(fetchEntityById(entityId));
    }
  }, [isOpen, entityId, dispatch]);

  // TODO: Replace with your actual data
  const entity = null;
  const isFetchingDetail = false;

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      ACTIVE: "default",
      INACTIVE: "secondary",
      PENDING: "outline",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <EnhancedDetailModal
      isOpen={isOpen}
      onClose={onClose}
      isLoading={isFetchingDetail}
      title="Entity Details"
      description="View detailed information about this entity"
      avatarUrl={entity?.imageUrl}
      avatarName={entity?.name}
      badges={entity?.status && getStatusBadge(entity.status)}
      size={ModalSizePresets.detailView} // "xl" - good for 2-column details
    >
      {entity && (
        <div className="space-y-6">
          {/*
            PATTERN 1: 2-Column Grid Layout
            Use this when you have multiple simple fields that look good side-by-side
          */}
          <DetailSection title="Basic Information">
            <DetailGrid columns={2} gap="md">
              <DetailRow label="Entity Name" value={entity.name} />
              <DetailRow label="Status" value={getStatusBadge(entity.status)} />
              <DetailRow label="Category" value={entity.category || "N/A"} />
              <DetailRow label="Type" value={entity.type || "N/A"} />

              {/*
                DetailFullRow: Use for fields that need full width in 2-column grid
                Perfect for long text fields like descriptions
              */}
              <DetailFullRow>
                <DetailRow
                  label="Description"
                  value={entity.description || "No description provided"}
                />
              </DetailFullRow>
            </DetailGrid>
          </DetailSection>

          {/*
            PATTERN 2: Single Column Layout
            Use this for sections where fields should stack vertically
          */}
          <DetailSection title="Additional Details" divider>
            <DetailRow label="Email" value={entity.email || "N/A"} />
            <DetailRow label="Phone" value={entity.phone || "N/A"} />
            <DetailRow label="Website" value={entity.website || "N/A"} />
            <DetailRow
              label="Notes"
              value={entity.notes || "No notes"}
              isLast
            />
          </DetailSection>

          {/*
            PATTERN 3: Statistics (2-Column Grid)
            Good for displaying numeric data or counts
          */}
          {/* <DetailSection title="Statistics" divider>
            <DetailGrid columns={2}>
              <DetailRow
                label="Total Products"
                value={
                  <span className="font-semibold text-lg">
                    {entity.totalProducts || 0}
                  </span>
                }
              />
              <DetailRow
                label="Active Products"
                value={
                  <span className="font-semibold text-lg text-green-600">
                    {entity.activeProducts || 0}
                  </span>
                }
              />
            </DetailGrid>
          </DetailSection> */}

          {/*
            PATTERN 4: System Information (2-Column)
            Common pattern for created/updated timestamps and IDs
          */}
          <DetailSection title="System Information" divider>
            <DetailGrid columns={2}>
              <DetailRow
                label="Entity ID"
                value={
                  <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                    {entity.id}
                  </span>
                }
              />
              <DetailRow label="Status" value={getStatusBadge(entity.status)} />
              <DetailRow
                label="Created At"
                value={dateTimeFormat(entity.createdAt)}
              />
              <DetailRow
                label="Updated At"
                value={dateTimeFormat(entity.updatedAt)}
              />
              <DetailRow label="Created By" value={entity.createdBy || "System"} />
              <DetailRow
                label="Updated By"
                value={entity.updatedBy || "System"}
                isLast
              />
            </DetailGrid>
          </DetailSection>

          {/*
            PATTERN 5: Images/Media Section
            Use when entity has associated images
          */}
          {/* {entity.imageUrl && (
            <DetailSection title="Media" divider>
              <div className="flex items-center gap-4">
                <img
                  src={entity.imageUrl}
                  alt={entity.name}
                  className="w-32 h-32 object-cover rounded-lg border"
                />
                <div>
                  <p className="text-sm text-muted-foreground">Entity Image</p>
                  <a
                    href={entity.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View full size
                  </a>
                </div>
              </div>
            </DetailSection>
          )} */}
        </div>
      )}
    </EnhancedDetailModal>
  );
}
