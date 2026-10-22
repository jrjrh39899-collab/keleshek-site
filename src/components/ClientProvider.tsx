"use client";

import React from "react";
import { DataProvider } from "@/context/DataContext";
import AdminModal from "@/components/AdminModal";

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <DataProvider>
      {children}
      <AdminModal />
    </DataProvider>
  );
}
