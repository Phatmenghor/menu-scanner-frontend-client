import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Send, Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-white py-10 px-4 md:px-8">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Logo and Tagline */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <Link
            href="#"
            className="flex items-center gap-2 mb-4"
            prefetch={false}
          >
            <Image
              src="/abstract-licking-logo.png"
              alt="Lick Logo"
              width={60}
              height={60}
              className="rounded-full"
            />
          </Link>
          <p className="text-sm max-w-xs">
            Designed exclusively for those who drink water! #Lick
          </p>
        </div>

        {/* Mores Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Mores</h3>
          <ul className="space-y-2">
            <li>
              <Link href="#" className="hover:underline" prefetch={false}>
                All Products
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:underline" prefetch={false}>
                FAQ
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:underline" prefetch={false}>
                About us
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:underline" prefetch={false}>
                Blogs
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:underline" prefetch={false}>
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Follow us Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Follow us</h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="#"
                className="flex items-center gap-2 hover:underline"
                prefetch={false}
              >
                <Facebook className="w-5 h-5" />
                Facebook
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="flex items-center gap-2 hover:underline"
                prefetch={false}
              >
                <Instagram className="w-5 h-5" />
                Instagram
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="flex items-center gap-2 hover:underline"
                prefetch={false}
              >
                <Send className="w-5 h-5" />
                Telegram
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact us Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Contact us</h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              +855 99 432 045
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              lick.official10@gmail.com
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              #237,Chhuk Meas Market Phnom Penh Thmey, Khan Sen Sok, Phnom Penh
            </li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto border-t border-white/20 mt-8 pt-6 text-sm text-center">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p>Copyright © 2025 by LICK All right reserved.</p>
          <div className="flex items-center gap-2">
            <span>Accept Payment:</span>
            <Image
              src="/aba-pay-logo.png"
              alt="ABA Pay"
              width={40}
              height={24}
            />
            <Image src="/KHQR_logo.png" alt="KHQR" width={40} height={24} />
          </div>
        </div>
        <p className="mt-4">
          Powered by{" "}
          <Link
            href="#"
            className="underline hover:no-underline"
            prefetch={false}
          >
            Krubkrong
          </Link>
        </p>
      </div>
    </footer>
  );
}
