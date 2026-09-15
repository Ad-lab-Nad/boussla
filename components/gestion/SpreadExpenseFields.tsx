"use client";

import { useState } from "react";

export function SpreadExpenseFields({
  defaultSpreadMonths,
}: {
  defaultSpreadMonths?: number | null;
}) {
  const [spread, setSpread] = useState(Boolean(defaultSpreadMonths && defaultSpreadMonths > 1));

  return (
    <>
      <div className="g-check-field">
        <input
          type="checkbox"
          id="isSpread"
          name="isSpread"
          checked={spread}
          onChange={(e) => setSpread(e.target.checked)}
        />
        <label htmlFor="isSpread">Cette dépense concerne plusieurs mois ?</label>
      </div>
      {spread && (
        <div className="g-field">
          <label>Étaler sur combien de mois</label>
          <input
            type="number"
            name="spreadMonths"
            min="2"
            step="1"
            defaultValue={defaultSpreadMonths && defaultSpreadMonths > 1 ? defaultSpreadMonths : 12}
            required
          />
        </div>
      )}
    </>
  );
}
