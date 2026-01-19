"use client";

import { useState } from "react";
import Image from "next/image";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Star,
  Check,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import { demoBusinessProfile } from "@/data/business-profile-template";
import { BusinessProfile, DayOfWeek } from "@/types/business-profile";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function BusinessProfilePage() {
  const [profile] = useState<BusinessProfile>(demoBusinessProfile);

  const getDayLabel = (day: DayOfWeek): string => {
    return day.charAt(0) + day.slice(1).toLowerCase();
  };

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Cover Image */}
      <section className="relative h-[400px] bg-gradient-to-r from-orange-500 to-orange-600">
        {profile.coverImage && (
          <Image
            src={profile.coverImage}
            alt={profile.businessName}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/40" />

        {/* Business Name & Logo */}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              {/* Logo */}
              {profile.logo && (
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-white">
                  <Image
                    src={profile.logo}
                    alt={`${profile.businessName} logo`}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Business Info */}
              <div className="flex-1 text-white">
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                  {profile.businessName}
                </h1>
                {profile.tagline && (
                  <p className="text-xl md:text-2xl text-orange-100">
                    {profile.tagline}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge className="bg-white/20 text-white border-white/30">
                    {profile.businessType}
                  </Badge>
                  <Badge className="bg-white/20 text-white border-white/30">
                    {profile.industry}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4">About Us</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {profile.description}
                </p>

                {/* Features */}
                {profile.features && profile.features.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Features & Amenities</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {profile.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Services/Products Section */}
            {profile.services && profile.services.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-6">Our Services</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.services.map((service) => (
                      <div
                        key={service.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          {service.icon && (
                            <span className="text-3xl">{service.icon}</span>
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">
                              {service.name}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {service.description}
                            </p>
                            {service.price && (
                              <p className="text-orange-600 font-semibold mt-2">
                                {service.currency} ${service.price.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Featured Products */}
            {profile.featuredProducts && profile.featuredProducts.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {profile.featuredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <div className="relative h-48">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {product.description}
                          </p>
                          <p className="text-orange-600 font-bold mt-2">
                            ${product.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Gallery */}
            {profile.gallery && profile.gallery.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-6">Gallery</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {profile.gallery.map((item) => (
                      <div
                        key={item.id}
                        className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
                      >
                        <Image
                          src={item.url}
                          alt={item.title || "Gallery image"}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {item.title && (
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                            <p className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                              {item.title}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Team Section */}
            {profile.team && profile.team.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-6">Meet Our Team</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {profile.team.map((member) => (
                      <div key={member.id} className="text-center">
                        {member.photo && (
                          <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden mb-4">
                            <Image
                              src={member.photo}
                              alt={member.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <h3 className="font-semibold text-lg">{member.name}</h3>
                        <p className="text-orange-600 text-sm">{member.position}</p>
                        {member.bio && (
                          <p className="text-gray-600 text-sm mt-2">{member.bio}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Testimonials */}
            {profile.testimonials && profile.testimonials.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-6">What Our Customers Say</h2>
                  <div className="space-y-4">
                    {profile.testimonials.map((testimonial) => (
                      <div key={testimonial.id} className="border rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">
                                {testimonial.customerName}
                              </h4>
                              <div className="flex">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-700 italic">
                              "{testimonial.comment}"
                            </p>
                            {testimonial.position && (
                              <p className="text-sm text-gray-500 mt-2">
                                - {testimonial.position}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            {profile.stats && (
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    {profile.stats.yearsInBusiness && (
                      <div>
                        <div className="text-3xl font-bold text-orange-600">
                          {profile.stats.yearsInBusiness}+
                        </div>
                        <div className="text-gray-600 text-sm mt-1">
                          Years in Business
                        </div>
                      </div>
                    )}
                    {profile.stats.customersServed && (
                      <div>
                        <div className="text-3xl font-bold text-orange-600">
                          {profile.stats.customersServed.toLocaleString()}+
                        </div>
                        <div className="text-gray-600 text-sm mt-1">
                          Happy Customers
                        </div>
                      </div>
                    )}
                    {profile.stats.customStats?.map((stat, index) => (
                      <div key={index}>
                        <div className="text-3xl font-bold text-orange-600">
                          {stat.icon} {stat.value}
                        </div>
                        <div className="text-gray-600 text-sm mt-1">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-4">Contact Us</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-orange-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-700">
                        {profile.contact.address.street}
                      </p>
                      <p className="text-sm text-gray-700">
                        {profile.contact.address.city},{" "}
                        {profile.contact.address.state}
                      </p>
                      <p className="text-sm text-gray-700">
                        {profile.contact.address.country}{" "}
                        {profile.contact.address.postalCode}
                      </p>
                      {profile.contact.mapLink && (
                        <a
                          href={profile.contact.mapLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-600 text-sm hover:underline inline-flex items-center gap-1 mt-1"
                        >
                          View on Map <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-orange-600" />
                    <a
                      href={`tel:${profile.contact.phone}`}
                      className="text-sm text-gray-700 hover:text-orange-600"
                    >
                      {profile.contact.phone}
                    </a>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-orange-600" />
                    <a
                      href={`mailto:${profile.contact.email}`}
                      className="text-sm text-gray-700 hover:text-orange-600"
                    >
                      {profile.contact.email}
                    </a>
                  </div>

                  {profile.contact.whatsapp && (
                    <Button className="w-full gap-2" variant="outline">
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp Us
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Business Hours */}
            {profile.businessHours && profile.businessHours.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    Business Hours
                  </h3>
                  <div className="space-y-2">
                    {profile.businessHours.map((hours) => (
                      <div
                        key={hours.day}
                        className="flex justify-between text-sm"
                      >
                        <span className="font-medium">
                          {getDayLabel(hours.day)}
                        </span>
                        {hours.isOpen ? (
                          <span className="text-gray-600">
                            {hours.is24Hours
                              ? "24 Hours"
                              : `${formatTime(hours.openTime!)} - ${formatTime(
                                  hours.closeTime!
                                )}`}
                          </span>
                        ) : (
                          <span className="text-red-600">Closed</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Social Media */}
            {profile.socialMedia && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4">Follow Us</h3>
                  <div className="flex flex-wrap gap-3">
                    {profile.socialMedia.facebook && (
                      <a
                        href={profile.socialMedia.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Facebook className="w-5 h-5 text-blue-600" />
                      </a>
                    )}
                    {profile.socialMedia.instagram && (
                      <a
                        href={profile.socialMedia.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Instagram className="w-5 h-5 text-pink-600" />
                      </a>
                    )}
                    {profile.socialMedia.twitter && (
                      <a
                        href={profile.socialMedia.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Twitter className="w-5 h-5 text-blue-400" />
                      </a>
                    )}
                    {profile.socialMedia.linkedin && (
                      <a
                        href={profile.socialMedia.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Linkedin className="w-5 h-5 text-blue-700" />
                      </a>
                    )}
                    {profile.socialMedia.website && (
                      <a
                        href={profile.socialMedia.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Globe className="w-5 h-5 text-gray-700" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
