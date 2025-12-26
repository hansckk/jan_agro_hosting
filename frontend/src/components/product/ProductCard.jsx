import React from "react";
import { Link } from "react-router-dom";
import { Card, Button, Badge } from "flowbite-react";

export default function ProductCard({ item, onAdd }) {
  const isOutOfStock = item.stock === 0;

  return (
    <Card
      className={`h-full flex flex-col justify-between overflow-hidden !bg-white shadow-sm rounded-md ${
        isOutOfStock ? "opacity-80" : ""
      }`}
    >
      <div className="relative">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-48 object-cover rounded-t-md"
          />
        ) : (
          <div className="w-full h-48 bg-white flex items-center justify-center text-6xl rounded-t-md border-b border-gray-100">
            🪴
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute top-3 right-3">
            <Badge color="failure" className="uppercase tracking-wide">
              Out of Stock
            </Badge>
          </div>
        )}
      </div>

      <div className="p-4 flex-grow">
        <h5 className="text-lg font-semibold text-black line-clamp-2">
          {item.name}
        </h5>
        <p className="text-xs uppercase text-gray-600">{item.category}</p>
        <p className="text-sm text-gray-700 mt-3 line-clamp-3">
          {item.description}
        </p>
      </div>

      <div className="p-4 pt-0 flex items-center gap-3">
        <div className="flex-1">
          <p className="text-black font-semibold">
            Rp {item.price.toLocaleString("id-ID")}
          </p>
        </div>

        <Link to={`/product/${item._id}`} aria-label={`Detail ${item.name}`}>
          <Button size="sm" color="gray" outline>
            Detail
          </Button>
        </Link>

        <Button
          size="sm"
          color="blue"
          onClick={() => onAdd(item._id)}
          disabled={isOutOfStock}
        >
          {isOutOfStock ? "Unavailable" : "Add"}
        </Button>
      </div>
    </Card>
  );
}
