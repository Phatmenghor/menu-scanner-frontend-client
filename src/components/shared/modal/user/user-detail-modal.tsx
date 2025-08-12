"use client";

import type React from "react";
import { useState } from "react";
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
  Clock,
  Edit3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserModel } from "@/models/user/user.response.model";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UserDetailModalProps {
  open: boolean;
  onClose: () => void;
  user: UserModel | null;
}

// Move utility functions outside component to prevent recreation on each render
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

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "Not provided";

  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Invalid date";
  }
};

// InfoItem component moved outside for better performance
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

export function UserDetailModal({ onClose, open, user }: UserDetailModalProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Early return if user is null
  if (!user) return null;

  const statusConfig = getStatusConfig(user.accountStatus ?? "");
  const userTypeConfig = getUserTypeConfig(user.userType ?? null);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="sr-only">
          <DialogTitle>User Details for {user.fullName}</DialogTitle>
        </DialogHeader>

        {/* Enhanced Header */}
        <div className="relative bg-gradient-to-r from-slate-50 to-slate-100 border-b p-6 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                  <AvatarImage
                    src={
                      process.env.NEXT_PUBLIC_API_BASE_URL +
                        user.profileImageUrl || "/placeholder.svg"
                    }
                    alt={user.fullName}
                  />
                  <AvatarFallback className="text-xl font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {user.firstName?.[0] || ""}
                    {user.lastName?.[0] || ""}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-3 border-white ${statusConfig.dot}`}
                  aria-label={`Status: ${user.accountStatus}`}
                />
              </div>

              <div className="flex-1 pt-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {user.fullName ||
                    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                    "No name provided"}
                </h2>
                <p className="text-base text-gray-600 mb-3 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  {user.position || "No position specified"}
                </p>

                <div className="flex items-center gap-3">
                  <Badge
                    className={`${statusConfig.color} font-medium px-3 py-1`}
                  >
                    {statusConfig.icon}
                    <span className="ml-1.5">
                      {user.accountStatus || "Unknown"}
                    </span>
                  </Badge>

                  {user.userType && (
                    <Badge
                      className={`${userTypeConfig.color} font-medium px-3 py-1`}
                    >
                      {userTypeConfig.icon}
                      <span className="ml-1.5">
                        {user.userType
                          .replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-4 rounded-none border-b bg-transparent h-12">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <User className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="personal"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Mail className="h-4 w-4 mr-2" />
                Personal
              </TabsTrigger>
              <TabsTrigger
                value="roles"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Shield className="h-4 w-4 mr-2" />
                Roles & Access
              </TabsTrigger>
              <TabsTrigger
                value="system"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Clock className="h-4 w-4 mr-2" />
                System Info
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent
              value="overview"
              className="flex-1 p-6 overflow-y-auto"
            >
              <div className="space-y-6">
                {/* Quick Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <InfoItem
                        icon={<Mail className="h-4 w-4" />}
                        label="Email Address"
                        value={user.email}
                      />
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <InfoItem
                        icon={<Phone className="h-4 w-4" />}
                        label="Phone Number"
                        value={user.phoneNumber}
                      />
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4">
                      <InfoItem
                        icon={<Building2 className="h-4 w-4" />}
                        label="Business"
                        value={user.businessName}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Notes Section */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5 text-green-600" />
                      Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 rounded-lg p-4 min-h-[120px]">
                      {user.notes ? (
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {user.notes}
                        </p>
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          <div className="text-center">
                            <Edit3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm italic">No notes available</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Personal Tab */}
            <TabsContent
              value="personal"
              className="flex-1 p-6 overflow-y-auto"
            >
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <User className="h-5 w-5 text-blue-600" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InfoItem
                        icon={<User className="h-4 w-4" />}
                        label="First Name"
                        value={user.firstName}
                      />
                      <InfoItem
                        icon={<User className="h-4 w-4" />}
                        label="Last Name"
                        value={user.lastName}
                      />
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InfoItem
                        icon={<Mail className="h-4 w-4" />}
                        label="Email Address"
                        value={user.email}
                      />
                      <InfoItem
                        icon={<Phone className="h-4 w-4" />}
                        label="Phone Number"
                        value={user.phoneNumber}
                      />
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 gap-6">
                      <InfoItem
                        icon={<MapPin className="h-4 w-4" />}
                        label="Address"
                        value={user.address}
                      />
                      <InfoItem
                        icon={<Building2 className="h-4 w-4" />}
                        label="Business Name"
                        value={user.businessName}
                      />
                      <InfoItem
                        icon={<Briefcase className="h-4 w-4" />}
                        label="Position"
                        value={user.position}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Roles & Access Tab */}
            <TabsContent value="roles" className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Shield className="h-5 w-5 text-purple-600" />
                      User Roles
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {user.roles && user.roles.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {user.roles.map((role, index) => (
                            <Badge
                              key={`role-${index}`}
                              variant="secondary"
                              className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-2 text-sm"
                            >
                              <Users className="h-4 w-4 mr-2" />
                              {role}
                            </Badge>
                          ))}
                        </div>
                        <Separator />
                        <p className="text-sm text-muted-foreground">
                          This user has {user.roles.length} role
                          {user.roles.length !== 1 ? "s" : ""} assigned.
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                        <p className="text-sm text-muted-foreground italic">
                          No roles assigned to this user
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <UserCheck className="h-5 w-5 text-blue-600" />
                      Account Type
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Badge
                        className={`${userTypeConfig.color} font-medium px-4 py-2 text-sm`}
                      >
                        {userTypeConfig.icon}
                        <span className="ml-2">
                          {user.userType
                            ? user.userType
                                .replace("_", " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())
                            : "Standard User"}
                        </span>
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* System Info Tab */}
            <TabsContent value="system" className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Clock className="h-5 w-5 text-orange-600" />
                      Account Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <InfoItem
                      icon={<Calendar className="h-4 w-4" />}
                      label="Account Created"
                      value={
                        <div>
                          <div className="font-medium">
                            {formatDate(user.createdAt)}
                          </div>
                          {user.createdBy && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Created by: {user.createdBy}
                            </div>
                          )}
                        </div>
                      }
                    />

                    <Separator />

                    <InfoItem
                      icon={<Calendar className="h-4 w-4" />}
                      label="Last Updated"
                      value={
                        <div>
                          <div className="font-medium">
                            {formatDate(user.updatedAt)}
                          </div>
                          {user.updatedBy && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Updated by: {user.updatedBy}
                            </div>
                          )}
                        </div>
                      }
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Account Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 mb-4">
                      <Badge
                        className={`${statusConfig.color} font-medium px-4 py-2 text-sm`}
                      >
                        {statusConfig.icon}
                        <span className="ml-2">
                          {user.accountStatus || "Unknown"}
                        </span>
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Account status indicates the current state of the user's
                      access and permissions.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4 flex justify-end items-center flex-shrink-0">
          <Button variant="outline" onClick={onClose} className="px-6">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
