import React from "react";
import PriceHistoryCard from "./PriceHistoryCard";

const PriceHistory = () => {
  return (
    <>
      <PriceHistoryCard
        lastUpdated="2025-06-14T06:17:00"
        changes={[
          {
            id: "1",
            date: "2025-06-14T06:17:00",
            oldPrice: 899,
            newPrice: 1000,
            currency: "USD",
            updatedBy: "Aung Aung",
            updatedByAvatar: "/avatars/aung.png",
            reason: "Supplier price increase due to component shortage",
          },
          {
            id: "2",
            date: "2025-02-01T21:45:00",
            oldPrice: 860,
            newPrice: 899,
            currency: "USD",
            updatedBy: "Maung Maung",
            updatedByAvatar: "/avatars/maung.png",
          },
          {
            id: "3",
            date: "2025-01-09T16:23:00",
            oldPrice: 820,
            newPrice: 860,
            currency: "USD",
            updatedBy: "Ma Ma",
            updatedByAvatar: "/avatars/mama.png",
            reason: "Supplier price increase due to component shortage",
          },
        ]}
      />
    </>
  );
};

export default PriceHistory;
