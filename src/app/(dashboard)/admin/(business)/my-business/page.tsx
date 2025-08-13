"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Edit,
  Save,
  X,
  Phone,
  MapPin,
  DollarSign,
  Percent,
  Shield,
  Calendar,
  ChefHat,
  AlertTriangle,
  Mail,
  User,
  CreditCard,
  Globe,
  Upload,
  Camera,
  Loader2,
  Clock,
  Package,
  Settings,
  ExternalLink,
} from "lucide-react";
import { BusinessSettingModel } from "@/models/business-group/business-setting/business-setting.response";
import { Controller, useForm } from "react-hook-form";
import {
  MyBusinessFormData,
  updateMyBusinessSchema,
} from "@/models/business-group/business-setting/business-setting.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadImageRequest } from "@/models/image/image.request";
import { uploadImageService } from "@/services/dashboard/image/image.service";
import {
  getMyBusinessSettingService,
  updateMyBusinessSettingService,
} from "@/services/dashboard/business/business-setting/business-setting.service";
import { cleanValue } from "@/lib/utils";
import { UpdateMyBusinessSetting } from "@/models/business-group/business-setting/business-setting.request";
import { AppToast } from "@/components/app/components/app-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { AppIcons } from "@/constants/app-resource/icons/icons";

const steps = [
  {
    id: 1,
    title: "Owner Details",
    description: "Tell us about yourself",
    icon: User,
  },
  {
    id: 2,
    title: "Business Info",
    description: "Your business details",
    icon: Building2,
  },
  {
    id: 3,
    title: "Plan & Payment",
    description: "Choose your plan",
    icon: Package,
  },
];

export default function BusinessPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [businessData, setBusinessData] = useState<BusinessSettingModel | null>(
    null
  );
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const {
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { isDirty, isSubmitting },
  } = useForm<MyBusinessFormData>({
    resolver: zodResolver(updateMyBusinessSchema),
    defaultValues: {
      imageUrl: "",
      name: "",
      description: "",
      phone: "",
      address: "",
      businessType: "",
      facebookUrl: "",
      instagramUrl: "",
      telegramUrl: "",
      usdToKhrRate: 0,
      taxRate: 0,
    },
  });

  const imageUrl = watch("imageUrl");

  useEffect(() => {
    if (imageUrl) {
      setLogoPreview(imageUrl);
    }
  }, [imageUrl]);

  useEffect(() => {
    if (businessData) {
      reset({
        name: businessData.name || "",
        description: businessData.description || "",
        phone: businessData.phone || "",
        address: businessData.address || "",
        businessType: businessData.businessType || "",
        facebookUrl: businessData.facebookUrl || "",
        instagramUrl: businessData.instagramUrl || "",
        telegramUrl: businessData.telegramUrl || "",
        usdToKhrRate: businessData.usdToKhrRate || 0,
        taxRate: businessData.taxRate || 0,
        imageUrl: businessData.imageUrl || "",
      });
      setLogoPreview(businessData.imageUrl);
    }
  }, [businessData, reset]);

  // Clean up blob URLs
  useEffect(() => {
    return () => {
      if (logoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(",")[1];

        const payload: UploadImageRequest = {
          base64: base64Data,
          type: file.type,
        };

        const response = await uploadImageService(payload);
        setValue("imageUrl", response?.imageUrl, {
          shouldValidate: true,
        });
        console.log(
          "Image Preview URL:",
          process.env.NEXT_PUBLIC_API_BASE_URL + response.imageUrl
        );

        setLogoPreview(response?.imageUrl);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Failed to upload image", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setValue("imageUrl", "", { shouldDirty: true });
  };

  const getImageSource = () => {
    return logoPreview?.startsWith("http")
      ? logoPreview
      : (process.env.NEXT_PUBLIC_API_BASE_URL ?? "") + logoPreview;
  };

  const loadMyBusiness = useCallback(async () => {
    try {
      const response = await getMyBusinessSettingService();
      setBusinessData(response);
      console.log("Load business: ", response);
      reset({
        imageUrl: response.imageUrl || "",
        name: response.name || "",
        description: response.description || "",
        phone: response.phone || "",
        address: response.address || "",
        businessType: response.businessType || "",
        facebookUrl: response.facebookUrl || "",
        instagramUrl: response.instagramUrl || "",
        telegramUrl: response.telegramUrl || "",
        usdToKhrRate: response.usdToKhrRate || 0,
        taxRate: response.taxRate || 0,
      });
    } catch (error) {
      console.error("Fail to fetch my business");
    }
  }, []);

  useEffect(() => {
    loadMyBusiness();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    reset({
      imageUrl: businessData?.imageUrl || "",
      name: businessData?.name || "",
      description: businessData?.description || "",
      phone: businessData?.phone || "",
      address: businessData?.address || "",
      businessType: businessData?.businessType || "",
      facebookUrl: businessData?.facebookUrl || "",
      instagramUrl: businessData?.instagramUrl || "",
      telegramUrl: businessData?.telegramUrl || "",
      usdToKhrRate: businessData?.usdToKhrRate || 0,
      taxRate: businessData?.taxRate || 0,
    });
    setIsEditing(false);
  };

  const onSubmit = async (formData: MyBusinessFormData) => {
    setIsLoading(true);
    try {
      const payload: UpdateMyBusinessSetting = {
        imageUrl: cleanValue(formData.imageUrl),
        name: cleanValue(formData.name),
        description: cleanValue(formData.description),
        phone: cleanValue(formData.phone),
        address: cleanValue(formData.address),
        businessType: cleanValue(formData.businessType),
        facebookUrl: cleanValue(formData.facebookUrl),
        instagramUrl: cleanValue(formData.instagramUrl),
        telegramUrl: cleanValue(formData.telegramUrl),
        usdToKhrRate: cleanValue(formData.usdToKhrRate),
        taxRate: cleanValue(formData.taxRate),
      };

      const response = await updateMyBusinessSettingService(payload);
      setBusinessData(response);
      setIsEditing(false);

      AppToast({
        type: "success",
        message: "Business information updated successfully",
        duration: 3000,
        position: "top-right",
      });
    } catch (error) {
      AppToast({
        type: "error",
        message: "Failed to update business information",
        duration: 3000,
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getSubscriptionStatus = () => {
    if (!businessData?.hasActiveSubscription) {
      return { color: "bg-red-100 text-red-800", text: "Inactive" };
    }
    if (businessData?.daysRemaining <= 7) {
      return { color: "bg-yellow-100 text-yellow-800", text: "Expiring Soon" };
    }
    return { color: "bg-green-100 text-green-800", text: "Active" };
  };

  const getSubscriptionProgress = () => {
    if (!businessData?.hasActiveSubscription) return 0;
    const totalDays = 30; // Assuming 30-day subscription
    return ((totalDays - businessData.daysRemaining) / totalDays) * 100;
  };

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Enhanced Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              My Business
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your business information and settings
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isDirty && isEditing && (
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm">
                <Clock className="w-4 h-4" />
                Unsaved changes
              </div>
            )}

            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                onClick={handleEdit}
                className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Edit className="w-4 h-4" />
                Edit Business
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Enhanced Business Overview Sidebar */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Business Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Enhanced Logo Section */}
                <div className="text-center mb-6">
                  {isEditing ? (
                    <div className="relative inline-block">
                      <div className="relative w-24 h-24 mx-auto">
                        <img
                          src={getImageSource() || "/placeholder.svg"}
                          alt="Business Logo"
                          className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                        {logoPreview && (
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center hover:bg-red-600 shadow-lg transition-colors"
                            title="Remove logo"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-3 flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Logo
                      </Button>
                      <Input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  ) : (
                    <Avatar className="w-24 h-24 mx-auto mb-4 shadow-lg border-4 border-white">
                      <AvatarImage
                        src={getImageSource() || "/placeholder.svg"}
                        alt={businessData?.name}
                      />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        {businessData?.name
                          ?.split(" ")
                          .map((n: any) => n[0])
                          .join("")
                          .toUpperCase() || "B"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>

                {/* Business Info */}
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {businessData?.name || "Business Name"}
                    </h3>
                    <div className="flex items-center justify-center gap-2">
                      <ChefHat className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">
                        {businessData?.businessType || "Business Type"}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Subscription Status with Progress */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-gray-600">
                        Status
                      </Label>
                      <Badge
                        className={`${getSubscriptionStatus().color} border`}
                      >
                        {getSubscriptionStatus().text}
                      </Badge>
                    </div>

                    {businessData?.hasActiveSubscription && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Days remaining</span>
                          <span className="font-medium">
                            {businessData.daysRemaining}
                          </span>
                        </div>
                        <Progress
                          value={getSubscriptionProgress()}
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Current Plan
                    </Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Shield className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-gray-900">
                        {businessData?.currentPlan || "No Plan"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                {/* <div className="mt-6 pt-4 border-t space-y-2">
                  <Button

                    variant="outline"
                    size="sm"
                    className="w-full justify-start bg-transparent"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Upgrade Plan
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start bg-transparent"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    View Website
                  </Button>
                </div> */}
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Main Content with Tabs */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <div className="border-b bg-gray-50/50 px-6 py-4">
                    <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
                      <TabsTrigger
                        value="overview"
                        className="flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        Overview
                      </TabsTrigger>
                      <TabsTrigger
                        value="basic"
                        className="flex items-center gap-2"
                      >
                        <Building2 className="w-4 h-4" />
                        Basic Info
                      </TabsTrigger>
                      <TabsTrigger
                        value="contact"
                        className="flex items-center gap-2"
                      >
                        <Phone className="w-4 h-4" />
                        Contact
                      </TabsTrigger>
                      <TabsTrigger
                        value="settings"
                        className="flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="p-6">
                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6 mt-0">
                      {/* Subscription Warning */}
                      {businessData?.hasActiveSubscription &&
                        businessData.daysRemaining <= 7 && (
                          <Alert className="border-amber-200 bg-amber-50">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                            <AlertDescription className="text-amber-800">
                              <strong>Subscription Expiring Soon!</strong>
                              <p className="mt-1">
                                Your subscription will expire in{" "}
                                {businessData.daysRemaining} days.
                                <Button
                                  variant="link"
                                  className="p-0 h-auto ml-1 text-amber-700 underline"
                                >
                                  Renew now to continue using all features.
                                </Button>
                              </p>
                            </AlertDescription>
                          </Alert>
                        )}

                      {/* Quick Stats Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600">
                                  Subscription
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                  {businessData?.daysRemaining || 0}
                                </p>
                                <p className="text-xs text-gray-500">
                                  days remaining
                                </p>
                              </div>
                              <Calendar className="w-8 h-8 text-blue-500" />
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-green-500">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600">
                                  Exchange Rate
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                  {businessData?.usdToKhrRate?.toLocaleString() ||
                                    0}
                                </p>
                                <p className="text-xs text-gray-500">
                                  KHR per USD
                                </p>
                              </div>
                              <DollarSign className="w-8 h-8 text-green-500" />
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-purple-500">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600">
                                  Tax Rate
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                  {businessData?.taxRate || 0}%
                                </p>
                                <p className="text-xs text-gray-500">
                                  current rate
                                </p>
                              </div>
                              <Percent className="w-8 h-8 text-purple-500" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Business Description */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">
                            About Your Business
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700 leading-relaxed">
                            {businessData?.description ||
                              "No description available. Add a description to tell customers about your business."}
                          </p>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Basic Information Tab */}
                    <TabsContent value="basic" className="space-y-6 mt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium">
                            Business Name{" "}
                            {isEditing && (
                              <span className="text-red-500">*</span>
                            )}
                          </Label>
                          {isEditing ? (
                            <Controller
                              control={control}
                              name="name"
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  id="name"
                                  placeholder="Enter business name"
                                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                                />
                              )}
                            />
                          ) : (
                            <div className="p-3 bg-gray-50 rounded-md border">
                              <p className="text-gray-900 font-medium">
                                {businessData?.name || "Not specified"}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="businessType"
                            className="text-sm font-medium"
                          >
                            Business Type
                          </Label>
                          {isEditing ? (
                            <Controller
                              control={control}
                              name="businessType"
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  id="businessType"
                                  placeholder="e.g., Restaurant, Retail, Service"
                                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                                />
                              )}
                            />
                          ) : (
                            <div className="p-3 bg-gray-50 rounded-md border">
                              <p className="text-gray-900 font-medium">
                                {businessData?.businessType || "Not specified"}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="description"
                          className="text-sm font-medium"
                        >
                          Business Description
                        </Label>
                        {isEditing ? (
                          <Controller
                            control={control}
                            name="description"
                            render={({ field }) => (
                              <Textarea
                                {...field}
                                id="description"
                                placeholder="Describe your business, products, or services..."
                                rows={4}
                                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                              />
                            )}
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-md border min-h-[100px]">
                            <p className="text-gray-900">
                              {businessData?.description ||
                                "No description provided"}
                            </p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    {/* Contact Information Tab */}
                    <TabsContent value="contact" className="space-y-6 mt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="phone"
                            className="text-sm font-medium flex items-center gap-2"
                          >
                            <Phone className="w-4 h-4" />
                            Phone Number
                          </Label>
                          {isEditing ? (
                            <Controller
                              control={control}
                              name="phone"
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  id="phone"
                                  type="tel"
                                  placeholder="+855 12 345 678"
                                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                                />
                              )}
                            />
                          ) : (
                            <div className="p-3 bg-gray-50 rounded-md border">
                              <p className="text-gray-900 font-medium">
                                {businessData?.phone || "Not provided"}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="email"
                            className="text-sm font-medium flex items-center gap-2"
                          >
                            <Mail className="w-4 h-4" />
                            Email Address
                          </Label>
                          <div className="p-3 bg-gray-50 rounded-md border">
                            <p className="text-gray-900 font-medium">
                              business@example.com
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="address"
                          className="text-sm font-medium flex items-center gap-2"
                        >
                          <MapPin className="w-4 h-4" />
                          Business Address
                        </Label>
                        {isEditing ? (
                          <Controller
                            control={control}
                            name="address"
                            render={({ field }) => (
                              <Textarea
                                {...field}
                                id="address"
                                placeholder="Enter your business address"
                                rows={3}
                                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                              />
                            )}
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-md border">
                            <p className="text-gray-900">
                              {businessData?.address || "No address provided"}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Social Media Links */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Social Media
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            {
                              name: "facebookUrl",
                              label: "Facebook",
                              icon: AppIcons.Facebook,
                              color: "text-blue-600",
                            },
                            {
                              name: "instagramUrl",
                              label: "Instagram",
                              icon: AppIcons.Instagram,
                              color: "text-pink-600",
                            },
                            {
                              name: "telegramUrl",
                              label: "Telegram",
                              icon: AppIcons.Telegram,
                              color: "text-blue-500",
                            },
                          ].map((social) => (
                            <div key={social.name} className="space-y-2">
                              <Label className="text-sm font-medium flex items-center gap-2">
                                <img
                                  src={social.icon}
                                  alt={social.label}
                                  className="w-5 h-5 object-contain"
                                />
                                {social.label}
                              </Label>

                              {isEditing ? (
                                <Controller
                                  control={control}
                                  name={social.name as any}
                                  render={({ field }) => (
                                    <Input
                                      {...field}
                                      placeholder={`https://${social.label.toLowerCase()}.com/yourpage`}
                                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                                    />
                                  )}
                                />
                              ) : (
                                <div className="p-3 bg-gray-50 rounded-md border">
                                  {businessData?.[
                                    social.name as keyof BusinessSettingModel
                                  ] ? (
                                    <a
                                      href={
                                        businessData[
                                          social.name as keyof BusinessSettingModel
                                        ] as string
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`${social.color} hover:underline flex items-center gap-2`}
                                    >
                                      Visit {social.label} Page
                                      <ExternalLink className="w-4 h-4" />
                                    </a>
                                  ) : (
                                    <p className="text-gray-500">
                                      Not connected
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings" className="space-y-6 mt-0">
                      {/* Financial Settings */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5" />
                            Financial Settings
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label
                                htmlFor="usdToKhrRate"
                                className="text-sm font-medium"
                              >
                                USD to KHR Exchange Rate
                              </Label>
                              {isEditing ? (
                                <Controller
                                  control={control}
                                  name="usdToKhrRate"
                                  render={({ field }) => (
                                    <Input
                                      {...field}
                                      id="usdToKhrRate"
                                      type="number"
                                      placeholder="4100"
                                      onChange={(e) =>
                                        field.onChange(Number(e.target.value))
                                      }
                                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                                    />
                                  )}
                                />
                              ) : (
                                <div className="p-3 bg-gray-50 rounded-md border">
                                  <p className="text-2xl font-bold text-gray-900">
                                    {businessData?.usdToKhrRate?.toLocaleString() ||
                                      0}{" "}
                                    KHR
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="taxRate"
                                className="text-sm font-medium"
                              >
                                Tax Rate (%)
                              </Label>
                              {isEditing ? (
                                <Controller
                                  control={control}
                                  name="taxRate"
                                  render={({ field }) => (
                                    <Input
                                      {...field}
                                      id="taxRate"
                                      type="number"
                                      placeholder="10"
                                      min="0"
                                      max="100"
                                      onChange={(e) =>
                                        field.onChange(Number(e.target.value))
                                      }
                                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                                    />
                                  )}
                                />
                              ) : (
                                <div className="p-3 bg-gray-50 rounded-md border">
                                  <p className="text-2xl font-bold text-gray-900 flex items-center gap-1">
                                    {businessData?.taxRate || 0}
                                    <Percent className="w-5 h-5 text-gray-500" />
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Subscription Information */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Subscription Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-600">
                                Current Plan
                              </Label>
                              <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                                <p className="text-lg font-semibold text-blue-900">
                                  {businessData?.currentPlan || "No Plan"}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-600">
                                Status
                              </Label>
                              <div className="p-3 bg-gray-50 rounded-md border">
                                <Badge
                                  className={`${
                                    getSubscriptionStatus().color
                                  } border text-sm`}
                                >
                                  {getSubscriptionStatus().text}
                                </Badge>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-600">
                                Days Remaining
                              </Label>
                              <div className="p-3 bg-gray-50 rounded-md border">
                                <p className="text-lg font-semibold text-gray-900">
                                  {businessData?.daysRemaining || 0} days
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-600">
                                End Date
                              </Label>
                              <div className="p-3 bg-gray-50 rounded-md border">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-900">
                                    {businessData?.subscriptionEndDate ||
                                      "Not available"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
