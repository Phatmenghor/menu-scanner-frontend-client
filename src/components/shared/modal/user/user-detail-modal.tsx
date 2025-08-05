"use client";

import type React from "react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Shield,
  Calendar,
  FileText,
  UserCheck,
  Users,
  Briefcase,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Crown,
  Building2,
  X,
  Clock,
  Edit3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { UserModel } from "@/models/user/user.response.model";

interface UserDetailModalProps {
  open: boolean;
  onClose: () => void;
  user: UserModel | null;
}

export function UserDetailModal({ onClose, open, user }: UserDetailModalProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return {
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: <CheckCircle className="h-3.5 w-3.5" />,
          dot: "bg-emerald-500",
        };
      case "pending":
        return {
          color: "bg-amber-50 text-amber-700 border-amber-200",
          icon: <AlertTriangle className="h-3.5 w-3.5" />,
          dot: "bg-amber-500",
        };
      case "suspended":
        return {
          color: "bg-red-50 text-red-700 border-red-200",
          icon: <XCircle className="h-3.5 w-3.5" />,
          dot: "bg-red-500",
        };
      default:
        return {
          color: "bg-gray-50 text-gray-700 border-gray-200",
          icon: <XCircle className="h-3.5 w-3.5" />,
          dot: "bg-gray-500",
        };
    }
  };

  const getUserTypeConfig = (userType: string | null) => {
    switch (userType?.toLowerCase()) {
      case "platform_user":
        return {
          color: "bg-purple-50 text-purple-700 border-purple-200",
          icon: <Crown className="h-3.5 w-3.5" />,
        };
      case "business_user":
        return {
          color: "bg-blue-50 text-blue-700 border-blue-200",
          icon: <UserCheck className="h-3.5 w-3.5" />,
        };
      default:
        return {
          color: "bg-gray-50 text-gray-700 border-gray-200",
          icon: <User className="h-3.5 w-3.5" />,
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const InfoItem = ({
    icon,
    label,
    value,
    className = "",
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | React.ReactNode;
    className?: string;
  }) => (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="flex-shrink-0 mt-0.5 text-muted-foreground">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
          {label}
        </p>
        <div className="text-sm font-medium text-foreground">
          {value || (
            <span className="text-muted-foreground italic">Not provided</span>
          )}
        </div>
      </div>
    </div>
  );

  if (!open) return null;

  const statusConfig = getStatusConfig(user?.accountStatus ?? "");
  const userTypeConfig = getUserTypeConfig(user?.userType ?? null);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 transition-opacity backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col border">
          {/* Enhanced Header */}
          <div className="relative bg-gradient-to-r from-slate-50 to-slate-100 border-b p-6 flex-shrink-0 rounded-t-xl">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                    <AvatarImage
                      src={user?.profileImageUrl || "/placeholder.svg"}
                      alt={user?.fullName}
                    />
                    <AvatarFallback className="text-xl font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {user?.firstName?.[0]}
                      {user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-3 border-white ${statusConfig.dot}`}
                  />
                </div>

                <div className="flex-1 pt-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {user?.fullName}
                  </h2>
                  <p className="text-base text-gray-600 mb-3 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    {user?.position || "No position specified"}
                  </p>

                  <div className="flex items-center gap-3">
                    <Badge
                      className={`${statusConfig.color} font-medium px-3 py-1`}
                    >
                      {statusConfig.icon}
                      <span className="ml-1.5">{user?.accountStatus}</span>
                    </Badge>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-10 w-10 rounded-full hover:bg-white/80"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <InfoItem
                      icon={<Mail className="h-4 w-4" />}
                      label="Email Address"
                      value={user?.email}
                    />
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <InfoItem
                      icon={<Phone className="h-4 w-4" />}
                      label="Phone Number"
                      value={user?.phoneNumber}
                    />
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                  <CardContent className="p-4">
                    <InfoItem
                      icon={<Building2 className="h-4 w-4" />}
                      label="Business"
                      value={user?.businessName}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Personal Details */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="h-5 w-5 text-blue-600" />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <InfoItem
                          icon={<User className="h-4 w-4" />}
                          label="First Name"
                          value={user?.firstName}
                        />
                        <InfoItem
                          icon={<User className="h-4 w-4" />}
                          label="Last Name"
                          value={user?.lastName}
                        />
                      </div>
                      <Separator />
                      <InfoItem
                        icon={<MapPin className="h-4 w-4" />}
                        label="Address"
                        value={user?.address}
                      />
                    </CardContent>
                  </Card>

                  {/* Roles & Permissions */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Shield className="h-5 w-5 text-purple-600" />
                        Roles & Permissions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {user?.roles && user.roles.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {user.roles.map((role, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1"
                            >
                              <Users className="h-3 w-3 mr-1" />
                              {role}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          No roles assigned
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Notes */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <FileText className="h-5 w-5 text-green-600" />
                        Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 rounded-lg p-4 min-h-[120px]">
                        {user?.notes ? (
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">
                            {user.notes}
                          </p>
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            <div className="text-center">
                              <Edit3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm italic">
                                No notes available
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* System Information */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Clock className="h-5 w-5 text-orange-600" />
                        System Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <InfoItem
                          icon={<Calendar className="h-4 w-4" />}
                          label="Created"
                          value={
                            <div>
                              <div>{formatDate(user?.createdAt ?? "")}</div>
                              {user?.createdBy && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  by {user.createdBy}
                                </div>
                              )}
                            </div>
                          }
                        />
                        <InfoItem
                          icon={<Calendar className="h-4 w-4" />}
                          label="Last Updated"
                          value={
                            <div>
                              <div>{formatDate(user?.updatedAt ?? "")}</div>
                              {user?.updatedBy && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  by {user.updatedBy}
                                </div>
                              )}
                            </div>
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t bg-gray-50 px-6 py-4 flex justify-between items-center flex-shrink-0 rounded-b-xl">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="px-6 bg-transparent"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
