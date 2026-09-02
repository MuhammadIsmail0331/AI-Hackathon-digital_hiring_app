"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Badge,
  CategorySelector,
  ToolSelector,
  DayPicker,
  NumberSelector,
} from "@/components/ui";
import { MobileNav, getWorkerNavItems } from "@/components/layout/MobileNav";
import type { WorkerCategoryId, ToolId, DayId } from "@/lib/constants";

export default function ComponentsPreview() {
  const nav = useTranslations("Nav");
  const common = useTranslations("Common");

  // Visual selector states
  const [category, setCategory] = useState<WorkerCategoryId | "">("");
  const [tools, setTools] = useState<ToolId[]>([]);
  const [days, setDays] = useState<DayId[]>([]);
  const [numWorkers, setNumWorkers] = useState(1);

  // Form states
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-24">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">
        Phase 3: UI Components
      </h1>
      <p className="mb-8 text-sm text-gray-500">
        Shared UI component library preview
      </p>

      <div className="space-y-10">
        {/* ─── Buttons ──────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Buttons
          </h2>
          <Card>
            <CardBody>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button loading>Loading</Button>
                <Button disabled>Disabled</Button>
                <Button variant="secondary" fullWidth>
                  Full Width
                </Button>
              </div>
            </CardBody>
          </Card>
        </section>

        {/* ─── Inputs ───────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Inputs
          </h2>
          <Card>
            <CardBody>
              <Input
                label="Default Input"
                placeholder="Type something..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Input
                label="With Icon"
                placeholder="03XX-XXXXXXX"
                type="tel"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                }
              />
              <Input
                label="With Error"
                defaultValue="bad-email"
                error="Please enter a valid email address"
              />
              <Input
                label="With Hint"
                hint="At least 8 characters"
                type="password"
              />
              <Input label="Disabled" disabled defaultValue="Can't edit" />
            </CardBody>
          </Card>
        </section>

        {/* ─── Badges ───────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Badges
          </h2>
          <Card>
            <CardBody>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge tone="success">Available</Badge>
                <Badge tone="warning">Pending</Badge>
                <Badge tone="danger">Cancelled</Badge>
                <Badge tone="info">In Progress</Badge>
                <Badge tone="purple">Matched</Badge>
              </div>
            </CardBody>
          </Card>
        </section>

        {/* ─── Category Selector ────────────────────── */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Category Selector
          </h2>
          <Card>
            <CardBody>
              <CategorySelector
                value={category}
                onChange={(cat) => setCategory(cat)}
              />
              {category && (
                <p className="mt-3 text-sm text-gray-500">
                  Selected: <strong>{category}</strong>
                </p>
              )}
            </CardBody>
          </Card>
        </section>

        {/* ─── Tool Selector ────────────────────────── */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Tool Selector
          </h2>
          <Card>
            <CardBody>
              <ToolSelector value={tools} onChange={setTools} />
              {tools.length > 0 && (
                <p className="mt-3 text-sm text-gray-500">
                  Selected: <strong>{tools.join(", ")}</strong>
                </p>
              )}
            </CardBody>
          </Card>
        </section>

        {/* ─── Day Picker ───────────────────────────── */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Day Picker
          </h2>
          <Card>
            <CardBody>
              <DayPicker value={days} onChange={setDays} />
              {days.length > 0 && (
                <p className="mt-3 text-sm text-gray-500">
                  Selected: <strong>{days.join(", ")}</strong>
                </p>
              )}
            </CardBody>
          </Card>
        </section>

        {/* ─── Number Selector ──────────────────────── */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Number Selector
          </h2>
          <Card>
            <CardBody>
              <NumberSelector
                label={common("workers")}
                value={numWorkers}
                onChange={setNumWorkers}
                min={1}
                max={20}
              />
              <p className="mt-3 text-sm text-gray-500">
                Value: <strong>{numWorkers}</strong>
              </p>
            </CardBody>
          </Card>
        </section>

        {/* ─── Card Variants ────────────────────────── */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Cards
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card padding="sm">
              <CardHeader>
                <CardTitle>Small Padding</CardTitle>
                <Badge tone="success">Active</Badge>
              </CardHeader>
              <p className="text-sm text-gray-500">
                A card with small padding for compact layouts.
              </p>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Medium Padding</CardTitle>
                <Badge tone="info">Open</Badge>
              </CardHeader>
              <p className="text-sm text-gray-500">
                Default card with medium padding for most content.
              </p>
            </Card>
          </div>
        </section>
      </div>

      {/* Mobile Nav demo - only visible on mobile */}
      <MobileNav items={getWorkerNavItems(nav)} />
    </div>
  );
}
