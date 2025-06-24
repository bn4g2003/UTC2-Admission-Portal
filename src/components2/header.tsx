"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Search, Globe, Phone, Mail } from "lucide-react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      {/* Top Bar */}
      <div className="bg-[#1e3a8a] text-white py-2 text-sm">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>024.3869.3108</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>tuyensinh@utc2.edu.vn</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-16 h-16">
                <img src="/images/LogoUTC2.png" alt="UTC2 Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1e3a8a] leading-tight">TRƯỜNG ĐẠI HỌC GIAO THÔNG VẬN TẢI</h1>
                <p className="text-sm text-gray-600">PHÂN HIỆU TẠI TP. HỒ CHÍ MINH</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-[#1e3a8a] font-medium transition-colors"
              >
                TRANG CHỦ
              </Link>
              <Link 
                href="/gioi-thieu" 
                className="text-gray-700 hover:text-[#1e3a8a] font-medium transition-colors"
              >
                GIỚI THIỆU
              </Link>
              <Link 
                href="/tuyen-sinh" 
                className="text-gray-700 hover:text-[#1e3a8a] font-medium transition-colors"
              >
                TUYỂN SINH
              </Link>
            </nav>

            {/* Search & Mobile Menu */}
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="text-gray-700 hover:text-[#1e3a8a]">
                <Search className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden text-gray-700 hover:text-[#1e3a8a]"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden border-t py-4">
              <nav className="flex flex-col space-y-4">
                <Link href="/" className="text-gray-700 hover:text-[#1e3a8a] font-medium">
                  TRANG CHỦ
                </Link>
                <Link href="/gioi-thieu" className="text-gray-700 hover:text-[#1e3a8a] font-medium">
                  GIỚI THIỆU
                </Link>
                <Link href="/tuyen-sinh" className="text-gray-700 hover:text-[#1e3a8a] font-medium">
                  TUYỂN SINH
                </Link>
                <Link href="/dao-tao" className="text-gray-700 hover:text-[#1e3a8a] font-medium">
                  ĐÀO TẠO
                </Link>
                <Link href="/sinh-vien" className="text-gray-700 hover:text-[#1e3a8a] font-medium">
                  SINH VIÊN
                </Link>
                <Link href="/lien-he" className="text-gray-700 hover:text-[#1e3a8a] font-medium">
                  LIÊN HỆ
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  )
}
