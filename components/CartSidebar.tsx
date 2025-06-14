"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { apiClient, OrderItem } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";

interface CartSidebarProps {
  tableNumber?: number;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ tableNumber }) => {
  const { items, updateQuantity, clearCart, totalItems, totalPrice } =
    useCart();
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const currentTableNumber =
    tableNumber || Number(searchParams.get("table")) || 1;

  const handleSubmitOrder = async () => {
    if (items.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before placing an order.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const orderItems: OrderItem[] = items.map((item) => ({
        item_id: item._id!,
        quantity: item.quantity,
      }));

      console.log(orderItems, " ", currentTableNumber, " ", items, "resss===");

      await apiClient.createOrder({
        table_number: currentTableNumber,
        items: orderItems,
        notes: notes || undefined,
        status: "pending",
      });

      clearCart();
      setNotes("");
      toast({
        title: "Order Placed!",
        description:
          "Your order has been successfully placed. We'll prepare it shortly.",
      });
    } catch (error) {
      toast({
        title: "Order Failed",
        description: "Failed to place your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format price using Intl.NumberFormat
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(price);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-6 right-6 bg-amber-600 hover:bg-amber-700 text-white shadow-lg z-40"
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          Cart{" "}
          {totalItems > 0 && (
            <Badge className="ml-2 bg-white text-amber-600">{totalItems}</Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-amber-700">
            Your Order - Table {currentTableNumber}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-auto mt-6">
            {items.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateQuantity(item._id!, item.quantity - 1)
                        }
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>

                      <span className="font-semibold min-w-[20px] text-center">
                        {item.quantity}
                      </span>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateQuantity(item._id!, item.quantity + 1)
                        }
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item._id!, 0)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions (Optional)
                </label>
                <Textarea
                  placeholder="Any special requests or allergies..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-amber-600">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                size="lg"
              >
                {isSubmitting ? "Placing Order..." : "Place Order"}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
