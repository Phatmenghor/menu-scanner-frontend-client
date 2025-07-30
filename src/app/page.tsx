import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Scan, Users, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const features = [
    {
      icon: Scan,
      title: "Smart Scanning",
      description: "Advanced QR code and menu scanning technology",
    },
    {
      icon: Users,
      title: "User Management",
      description: "Comprehensive user and permission management",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Detailed insights and reporting dashboard",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Scan className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Menu Scanner</span>
          </div>
          <Link href="/login">
            <Button>
              Admin Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Menu Scanner
            <span className="text-primary block">Admin System</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Advanced menu scanning and management solution with powerful admin
            controls and analytics.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
