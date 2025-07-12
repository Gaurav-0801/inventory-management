"use client"

import React, { useEffect, useState } from "react"

import Sidebar from "./(components)/Sidebar"
import StoreProvider from "@/app/redux"
import { useAppSelector } from "@/app/redux"
import { Navbar } from "./(components)/Navbar"

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed)
  
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="w-full min-h-screen flex bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white">
      <Sidebar />
      <main
        className={`flex flex-col w-full h-full py-7 px-9 transition-colors duration-300 ${
          isSidebarCollapsed ? "md:pl-24" : "md:pl-72"
        }`}
      >
       <Navbar/>
        {children}
      </main>
    </div>
  )
}

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </StoreProvider>
  )
}

export default DashboardWrapper
