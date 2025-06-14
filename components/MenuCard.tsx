"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus } from "lucide-react";
import { MenuItem } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";

interface MenuCardProps {
  item: MenuItem;
  isCustomer?: boolean;
}

export const MenuCard: React.FC<MenuCardProps> = ({
  item,
  isCustomer = false,
}) => {
  const { addItem, items, updateQuantity } = useCart();

  const cartItem = items.find((i) => i._id === item._id);
  const quantity = cartItem?.quantity || 0;

  const handleAdd = () => {
    addItem(item);
  };

  const handleIncrease = () => {
    if (cartItem) {
      updateQuantity(cartItem._id!, cartItem.quantity + 1);
    }
  };

  const handleDecrease = () => {
    if (cartItem && cartItem.quantity > 1) {
      updateQuantity(cartItem._id!, cartItem.quantity - 1);
    } else if (cartItem) {
      updateQuantity(cartItem._id!, 0);
    }
  };

  // Format price using Intl.NumberFormat
  const formattedPrice = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(item.price);

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-video relative overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">No image</span>
          </div>
        )}
        <Badge className="absolute top-2 right-2 bg-amber-600 text-white">
          {item.category}
        </Badge>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-2">
          {item.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-amber-600">
            {formattedPrice}
          </span>

          {isCustomer && (
            <div className="flex items-center space-x-2">
              {quantity === 0 ? (
                <Button
                  onClick={handleAdd}
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={handleDecrease}
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="font-semibold min-w-[20px] text-center">
                    {quantity}
                  </span>
                  <Button
                    onClick={handleIncrease}
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
