"use client";

import {
  fetchOrders,
  updateOrderStatusInDb,
  type Order,
  type OrderStatus,
} from "@/lib/orders";
import { formatKES } from "@/lib/utils";
import {
  Calendar,
  ChevronDown,
  Package,
  ShoppingBag,
  User,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  shipped: {
    label: "Shipped",
    className: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  },
  delivered: {
    label: "Delivered",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  },
};

const ALL_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function OrderSkeleton() {
  return (
    <div className="border border-border rounded-2xl p-5 animate-pulse space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2">
          <div className="h-3 w-28 bg-muted rounded-full" />
          <div className="h-2.5 w-20 bg-muted rounded-full" />
        </div>
        <div className="h-6 w-20 bg-muted rounded-full" />
      </div>
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-muted" />
        <div className="h-11 w-11 rounded-xl bg-muted" />
        <div className="h-11 w-11 rounded-xl bg-muted" />
      </div>
      <div className="flex items-center justify-between pt-1">
        <div className="h-2.5 w-24 bg-muted rounded-full" />
        <div className="h-8 w-32 bg-muted rounded-xl" />
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}

// ─── Status Dropdown ──────────────────────────────────────────────────────────

function StatusDropdown({
  orderId,
  current,
  onUpdate,
}: {
  orderId: string;
  current: OrderStatus;
  onUpdate: (id: string, status: OrderStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleSelect = async (status: OrderStatus) => {
    if (status === current) {
      setOpen(false);
      return;
    }
    setUpdating(true);
    setOpen(false);
    onUpdate(orderId, status); // optimistic
    await updateOrderStatusInDb(orderId, status);
    setUpdating(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={updating}
        className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-border bg-background text-xs font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
      >
        {updating ? (
          <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <StatusBadge status={current} />
        )}
        <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1.5 z-20 w-36 bg-background border border-border rounded-xl shadow-lg overflow-hidden py-1">
            {ALL_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => handleSelect(s)}
                className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-muted transition-colors flex items-center gap-2 ${
                  s === current ? "opacity-50 cursor-default" : "cursor-pointer"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    STATUS_CONFIG[s].className.includes("amber")
                      ? "bg-amber-400"
                      : STATUS_CONFIG[s].className.includes("blue")
                      ? "bg-blue-500"
                      : STATUS_CONFIG[s].className.includes("violet")
                      ? "bg-violet-500"
                      : STATUS_CONFIG[s].className.includes("emerald")
                      ? "bg-emerald-500"
                      : "bg-rose-500"
                  }`}
                />
                {STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────

function OrderCard({
  order,
  onStatusUpdate,
}: {
  order: Order;
  onStatusUpdate: (id: string, status: OrderStatus) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const dateStr = new Date(order.createdAt).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="border border-border rounded-2xl bg-card overflow-hidden">
      {/* Card header */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="font-mono text-sm font-bold text-foreground">
              {order.orderNumber}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{dateStr}</span>
            </div>
          </div>
          <StatusDropdown
            orderId={order.id}
            current={order.status}
            onUpdate={onStatusUpdate}
          />
        </div>

        {/* Customer info */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground leading-none truncate">
              {order.customerName}
            </p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {order.customerPhone || order.customerEmail}
            </p>
          </div>
        </div>

        {/* Product thumbnails */}
        <div className="flex items-center gap-2 mb-4">
          {order.items.slice(0, 4).map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="relative w-11 h-11 rounded-xl bg-muted border border-border overflow-hidden shrink-0"
            >
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="44px"
                className="object-cover"
              />
              {item.quantity > 1 && (
                <span className="absolute bottom-0 right-0 text-[9px] font-bold bg-background/90 leading-none px-1 py-0.5 rounded-tl-md text-foreground">
                  ×{item.quantity}
                </span>
              )}
            </div>
          ))}
          {order.items.length > 4 && (
            <div className="w-11 h-11 rounded-xl bg-muted border border-border flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-muted-foreground">
                +{order.items.length - 4}
              </span>
            </div>
          )}
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">
              {order.items.reduce((s, i) => s + i.quantity, 0)} item
              {order.items.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""}
            </p>
            <p className="text-sm font-black text-foreground">
              {formatKES(order.total)}
            </p>
          </div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-primary underline underline-offset-2 hover:no-underline transition-all cursor-pointer"
          >
            {expanded ? "Hide details" : "View details"}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-border/60 px-4 sm:px-5 pb-4 pt-3 space-y-3 bg-muted/20">
          {/* Items list */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Items
            </p>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  className="flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="relative w-8 h-8 rounded-lg bg-muted border border-border overflow-hidden shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    </div>
                    <span className="font-medium text-foreground truncate">
                      {item.name}
                    </span>
                    <span className="text-muted-foreground shrink-0">
                      ×{item.quantity}
                    </span>
                  </div>
                  <span className="font-semibold text-foreground shrink-0">
                    {formatKES(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping address */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Ship to
            </p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              {order.shippingAddress}
            </p>
          </div>

          {/* Notes */}
          {order.notes && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Notes
              </p>
              <p className="text-xs text-foreground/80 leading-relaxed">
                {order.notes}
              </p>
            </div>
          )}

          {/* Price breakdown */}
          <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs">
            <span className="text-muted-foreground">Total</span>
            <span className="font-black text-foreground text-sm">
              {formatKES(order.total)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");

  useEffect(() => {
    fetchOrders().then(({ orders: data }) => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  const handleStatusUpdate = (id: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
  };

  const filtered =
    filterStatus === "all"
      ? orders
      : orders.filter((o) => o.status === filterStatus);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 max-w-3xl">
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Orders
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {loading ? "Loading…" : `${orders.length} order${orders.length !== 1 ? "s" : ""} total`}
        </p>
      </div>

      {/* Status filter chips */}
      {!loading && orders.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-6">
          {(["all", ...ALL_STATUSES] as const).map((s) => {
            const count =
              s === "all"
                ? orders.length
                : orders.filter((o) => o.status === s).length;
            if (count === 0 && s !== "all") return null;
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  filterStatus === s
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                }`}
              >
                {s === "all" ? "All" : STATUS_CONFIG[s].label}
                <span
                  className={`text-[10px] font-bold ${
                    filterStatus === s
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground/60"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-4">
          <OrderSkeleton />
          <OrderSkeleton />
          <OrderSkeleton />
        </div>
      )}

      {/* Empty state */}
      {!loading && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
            <ShoppingBag className="h-7 w-7 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-semibold text-foreground">No orders yet</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Orders placed through the store will appear here once customers
            complete checkout.
          </p>
        </div>
      )}

      {/* Filtered empty state */}
      {!loading && orders.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package className="h-8 w-8 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-semibold text-foreground">
            No {STATUS_CONFIG[filterStatus as OrderStatus]?.label.toLowerCase()} orders
          </p>
        </div>
      )}

      {/* Orders list */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
