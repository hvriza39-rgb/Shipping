import BookShipment from "@/components/user/BookShipment";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Book Shipment | SwiftShip" };

export default function BookPage() {
  return <BookShipment />;
}
