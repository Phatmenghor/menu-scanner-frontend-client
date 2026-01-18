/**
 * REFACTORED Brand Detail Modal - Example using Enhanced Detail Modal
 *
 * This demonstrates:
 * - EnhancedDetailModal with size="lg" (matches edit modal)
 * - DetailGrid with 2-column layout for side-by-side fields
 * - DetailSection for organizing information
 * - DetailFullRow for fields that need full width
 * - Cleaner, more organized code
 */

"use client";

import { useEffect } from "react";
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
import {
  selectIsFetchingDetail,
  selectSelectedBrand,
} from "../store/selectors/brand-selector";
import { fetchBrandByIdService } from "../store/thunks/brand-thunks";
import { clearSelectedBrand } from "../store/slice/brand-slice";

interface BrandDetailModalProps {
  brandId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function BrandDetailModalRefactored({
  brandId,
  isOpen,
  onClose,
}: BrandDetailModalProps) {
  const dispatch = useAppDispatch();
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const brandData = useAppSelector(selectSelectedBrand);

  useEffect(() => {
    const fetchBrandData = async () => {
      if (!brandId || !isOpen) return;

      try {
        await dispatch(fetchBrandByIdService(brandId)).unwrap();
      } catch (error: any) {
        console.error("Error fetching brand data:", error);
      }
    };

    fetchBrandData();
  }, [brandId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedBrand());
    onClose();
  };

  // Helper to get status badge with proper variant
  const getStatusBadge = (status: string) => {
    const variant = status === "ACTIVE" ? "default" : "secondary";
    return <Badge variant={variant}>{status}</Badge>;
  };

  return (
    <EnhancedDetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={isFetchingDetail}
      title="Brand Details"
      description={brandData?.name || "Loading brand information..."}
      avatarUrl={brandData?.imageUrl}
      avatarName={brandData?.name}
      badges={brandData?.status && getStatusBadge(brandData.status)}
      size={ModalSizePresets.detailView} // "xl" - Matches edit modal size for consistency
    >
      {brandData ? (
        <div className="space-y-6">
          {/*
            SECTION 1: Basic Information (2-Column Layout)
            Name and Status side-by-side, Description full width
          */}
          <DetailSection title="Brand Information">
            <DetailGrid columns={2} gap="md">
              <DetailRow label="Brand Name" value={brandData.name} />

              <DetailRow
                label="Status"
                value={getStatusBadge(brandData.status)}
              />

              {/* Description spans full width */}
              <DetailFullRow>
                <DetailRow
                  label="Description"
                  value={brandData.description || undefined}
                />
              </DetailFullRow>
            </DetailGrid>
          </DetailSection>

          {/*
            SECTION 2: Statistics (2-Column Layout)
            Product counts displayed side-by-side
          */}
          <DetailSection title="Product Statistics" divider>
            <DetailGrid columns={2} gap="md">
              <DetailRow
                label="Total Products"
                value={
                  <span className="font-semibold text-lg">
                    {brandData.totalProducts || 0}
                  </span>
                }
              />

              <DetailRow
                label="Active Products"
                value={
                  <span className="font-semibold text-lg text-green-600">
                    {brandData.activeProducts || 0}
                  </span>
                }
              />
            </DetailGrid>
          </DetailSection>

          {/*
            SECTION 3: System Information (2-Column Layout)
            Created/Updated info in pairs
          */}
          <DetailSection title="System Information" divider>
            <DetailGrid columns={2} gap="md">
              {/* First row: ID and Business Name */}
              <DetailFullRow>
                <DetailRow
                  label="Brand ID"
                  value={
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded break-all">
                      {brandData.id}
                    </span>
                  }
                />
              </DetailFullRow>

              <DetailRow
                label="Business Name"
                value={brandData.businessName || "N/A"}
              />

              <DetailRow label="Status" value={getStatusBadge(brandData.status)} />

              {/* Second row: Created info */}
              <DetailRow
                label="Created At"
                value={dateTimeFormat(brandData.createdAt ?? "")}
              />

              <DetailRow
                label="Created By"
                value={brandData.createdBy || "System"}
              />

              {/* Third row: Updated info */}
              <DetailRow
                label="Last Updated"
                value={dateTimeFormat(brandData.updatedAt ?? "")}
              />

              <DetailRow
                label="Updated By"
                value={brandData.updatedBy || "System"}
                isLast
              />
            </DetailGrid>
          </DetailSection>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No brand data available</p>
        </div>
      )}
    </EnhancedDetailModal>
  );
}
