"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeading } from "./primitives";
import {
  Calendar,
  BookMarked,
  Bot,
  BarChart2,
  ClipboardList,
  Users,
  Video,
  DollarSign,
  Disc,
  LayoutDashboard,
  UserCheck,
  CreditCard,
} from "lucide-react";

const tabs = ["student", "teacher", "admin"] as const;
type Tab = (typeof tabs)[number];

const studentItems = [
  { icon: Calendar, key: "s1" },
  { icon: BookMarked, key: "s2" },
  { icon: Bot, key: "s3" },
  { icon: BarChart2, key: "s4" },
  { icon: ClipboardList, key: "s5" },
] as const;

const teacherItems = [
  { icon: Users, key: "t1" },
  { icon: Calendar, key: "t2" },
  { icon: DollarSign, key: "t3" },
  { icon: Disc, key: "t4" },
] as const;

const adminItems = [
  { icon: LayoutDashboard, key: "a1" },
  { icon: Video, key: "a2" },
  { icon: CreditCard, key: "a3" },
  { icon: UserCheck, key: "a4" },
] as const;

const itemsByTab: Record<Tab, readonly { icon: typeof Calendar; key: string }[]> = {
  student: studentItems,
  teacher: teacherItems,
  admin: adminItems,
};

export function DashboardPreviewSection() {
  const t = useTranslations("dashboardPreview");
  const [activeTab, setActiveTab] = useState<Tab>("student");

  const items = itemsByTab[activeTab];

  return (
    <section className="bg-muted/40 py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading title={t("title")} />

        {/* Tabs */}
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card border border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              {t(`tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`)}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.key}
                  className="premium-card flex items-center gap-4 p-5"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {t(item.key)}
                  </p>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
