"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Camera,
  Edit,
  Mail,
  Calendar,
  Shield,
  Key,
  Bell,
  Trash2,
  Save,
  X,
  User,
  Briefcase,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { UserModel } from "@/models/user/user.response.model";
import {
  getUserProfileService,
  updateUserProfileService,
} from "@/services/dashboard/user/user.service";
import { AppToast } from "@/components/app/components/app-toast";
import { UpdateUserRequest } from "@/models/user/user.request.model";
import { ProfileSection } from "@/components/app/admin/profile/profile-props";
import { ProfileField } from "@/components/app/admin/profile/profile-field";
import { STATUS_USER_OPTIONS } from "@/constants/app-resource/status/status";
import ChangePasswordModal from "@/components/shared/modal/profile/change-password-modal";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  phoneNumber: string;
  address: string;
  profileImageUrl?: string;
  position: string;
  notes: string;
}

const tabList = [
  { label: "Profile", value: "profile", icon: User },
  { label: "Security", value: "security", icon: Shield },
  { label: "Notifications", value: "notifications", icon: Bell },
];

export default function UserProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserModel | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    status: "",
    phoneNumber: "",
    address: "",
    position: "",
    profileImageUrl: "",
    notes: "",
  });

  const router = useRouter();

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    securityAlerts: true,
    systemUpdates: false,
  });

  const loadProfile = useCallback(async () => {
    setIsProfileLoading(true);
    try {
      const response: UserModel = await getUserProfileService();
      setUserProfile(response);
      // Initialize form data from user profile
      if (response) {
        setFormData({
          firstName: response.firstName,
          lastName: response.lastName,
          position: response.position,
          email: response.email || "",
          status: response.accountStatus,
          phoneNumber: response.phoneNumber || "",
          address: response.address || "",
          profileImageUrl: response.profileImageUrl || "",
          notes: response.notes || "",
        });
      }
    } catch (error: any) {
      console.error(error?.message || "Error fetching profile");
      AppToast({
        type: "error",
        message: "Failed to load profile",
        duration: 3000,
        position: "top-right",
      });
    } finally {
      setIsProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const updateData: UpdateUserRequest = {
        notes: formData.notes,
        accountStatus: formData.status,
        position: formData.position,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        profileImageUrl: formData.profileImageUrl,
      };

      const response = await updateUserProfileService(updateData);
      // Update the user profile state with new data
      setUserProfile(response);
      setIsEditing(false);
      setHasUnsavedChanges(false);

      AppToast({
        type: "success",
        message: "Profile updated successfully",
        duration: 3000,
        position: "top-right",
      });
      console.log("Profile updated successfully");
    } catch (error) {
      console.error("Error updating user profile:", error);
      AppToast({
        type: "error",
        message: "Failed to update profile",
        duration: 3000,
        position: "top-right",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        status: userProfile.accountStatus,
        position: userProfile.position,
        email: userProfile.email || "",
        phoneNumber: userProfile.phoneNumber || "",
        address: userProfile.address || "",
        profileImageUrl: userProfile.profileImageUrl || "",
        notes: userProfile.notes || "",
      });
    }
    setIsEditing(false);
    setHasUnsavedChanges(false);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasUnsavedChanges(true);
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return { color: "bg-green-100 text-green-800", icon: CheckCircle };
      case "pending":
        return { color: "bg-yellow-100 text-yellow-800", icon: AlertCircle };
      case "suspended":
        return { color: "bg-red-100 text-red-800", icon: AlertCircle };
      case "inactive":
        return { color: "bg-gray-100 text-gray-800", icon: AlertCircle };
      default:
        return { color: "bg-gray-100 text-gray-800", icon: AlertCircle };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(userProfile?.accountStatus || "");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.back()}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  User Profile
                </h1>
                <p className="text-gray-600">
                  Manage your account settings and preferences
                </p>
              </div>
            </div>

            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Unsaved changes</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200">
            {tabList.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* Profile Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                    <AvatarImage
                      src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${userProfile?.profileImageUrl}`}
                      alt={userProfile?.fullName}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                      {userProfile?.fullName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {isEditing
                        ? `${formData.firstName} ${formData.lastName}`.trim()
                        : userProfile?.fullName}
                    </h2>
                    <p className="text-gray-600 flex items-center gap-2 mt-1">
                      <Briefcase className="h-4 w-4" />
                      {isEditing ? formData.position : userProfile?.position}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      className={`${statusConfig.color} font-medium px-3 py-1`}
                    >
                      <statusConfig.icon className="h-3 w-3 mr-1" />
                      {userProfile?.accountStatus}
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800 font-medium px-3 py-1">
                      <Shield className="h-3 w-3 mr-1" />
                      {userProfile?.userType}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Joined {formatDate(userProfile?.createdAt || "")}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {userProfile?.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        size="sm"
                        disabled={isSubmitting}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSave}
                        className="bg-blue-600 hover:bg-blue-700"
                        size="sm"
                        disabled={isSubmitting}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isSubmitting ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <ProfileSection title="Personal Information" icon={User}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProfileField
                  label="First Name"
                  value={formData.firstName}
                  isEditing={isEditing}
                  onChange={(value: any) =>
                    handleInputChange("firstName", value)
                  }
                  required
                />
                <ProfileField
                  label="Last Name"
                  value={formData.lastName}
                  isEditing={isEditing}
                  onChange={(value: any) =>
                    handleInputChange("lastName", value)
                  }
                  required
                />
                <ProfileField
                  label="Email Address"
                  value={formData.email}
                  isEditing={isEditing}
                  type="email"
                  disabled={true}
                />
                <ProfileField
                  label="Phone Number"
                  value={formData.phoneNumber}
                  isEditing={isEditing}
                  onChange={(value: any) =>
                    handleInputChange("phoneNumber", value)
                  }
                  type="tel"
                />
                <ProfileField
                  label="Position"
                  value={formData.position}
                  isEditing={isEditing}
                  onChange={(value: any) =>
                    handleInputChange("position", value)
                  }
                />
                <ProfileField
                  label="Status"
                  value={formData.status}
                  isEditing={isEditing}
                  onChange={(value: any) => handleInputChange("status", value)}
                  type="select"
                  options={STATUS_USER_OPTIONS}
                  required
                />
                {!isEditing && (
                  <ProfileField
                    label="User Identifier"
                    value={userProfile?.userIdentifier || ""}
                    isEditing={false}
                  />
                )}
                <ProfileField
                  label="Address"
                  value={formData.address}
                  isEditing={isEditing}
                  onChange={(value: any) => handleInputChange("address", value)}
                  className="md:col-span-2"
                />
                <ProfileField
                  label="Notes"
                  value={formData.notes}
                  isEditing={isEditing}
                  onChange={(value: any) => handleInputChange("notes", value)}
                  type="textarea"
                  className="md:col-span-2"
                />
              </div>
            </ProfileSection>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <ProfileSection title="Security Settings" icon={Key}>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Change Password
                    </h3>
                    <p className="text-sm text-gray-600">
                      Update your password to keep your account secure
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setIsChangePasswordModalOpen(true)}
                    className="bg-white"
                  >
                    Change Password
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Two-Factor Authentication
                    </h3>
                    <p className="text-sm text-gray-600">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline" className="bg-white">
                    Enable 2FA
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Active Sessions
                    </h3>
                    <p className="text-sm text-gray-600">
                      Manage your active sessions across devices
                    </p>
                  </div>
                  <Button variant="outline" className="bg-white">
                    View Sessions
                  </Button>
                </div>
              </div>
            </ProfileSection>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <ProfileSection title="Notification Preferences" icon={Bell}>
              <div className="space-y-6">
                {Object.entries({
                  emailNotifications: {
                    title: "Email Notifications",
                    desc: "Receive notifications via email",
                  },
                  pushNotifications: {
                    title: "Push Notifications",
                    desc: "Receive push notifications in your browser",
                  },
                  securityAlerts: {
                    title: "Security Alerts",
                    desc: "Get notified about security-related events",
                  },
                  systemUpdates: {
                    title: "System Updates",
                    desc: "Receive notifications about system updates",
                  },
                }).map(([key, { title, desc }]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">{title}</h3>
                      <p className="text-sm text-gray-600">{desc}</p>
                    </div>
                    <Switch
                      checked={notifications[key as keyof typeof notifications]}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, [key]: checked })
                      }
                    />
                  </div>
                ))}
              </div>
            </ProfileSection>
          </TabsContent>
        </Tabs>

        {/* Danger Zone */}
        <ProfileSection
          title="Danger Zone"
          icon={Trash2}
          className="border-red-200 bg-red-50"
        >
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
            <div>
              <h3 className="font-medium text-red-900">Delete Account</h3>
              <p className="text-sm text-red-600">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Account
            </Button>
          </div>
        </ProfileSection>

        <ChangePasswordModal
          isOpen={isChangePasswordModalOpen}
          onClose={() => setIsChangePasswordModalOpen(false)}
        />
      </div>
    </div>
  );
}
