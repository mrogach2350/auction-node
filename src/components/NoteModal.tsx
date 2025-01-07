import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function NoteModal({
  isActive,
  handleClose,
  selectedVehicle = { id: 0, note: "" },
}: {
  isActive: boolean;
  handleClose: () => void;
  selectedVehicle: { id: number; note: string };
}) {
  const router = useRouter();
  const [vehicleNoteValue, setVehicleNoteValue] = useState<string>();
  useEffect(() => {
    setVehicleNoteValue(selectedVehicle.note);
  }, [selectedVehicle.note]);

  const handleSaveNote = async () => {
    await fetch("/api/vehicles/update-vehicles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: selectedVehicle.id,
        note: vehicleNoteValue,
      }),
    });
    await router.replace(router.asPath);
    handleClose();
  };
  return (
    <div className={`modal ${isActive ? "is-active" : ""}`}>
      <div onClick={handleClose} className="modal-background"></div>
      <div className="modal-content h-3/6">
        <h1 className="title">Note Modal</h1>
        <textarea
          value={vehicleNoteValue}
          onChange={(e) => setVehicleNoteValue(e.target.value)}
          className="textarea"></textarea>
        <div className="flex space-x-3 mt-3">
          <button onClick={handleSaveNote} className="button is-primary">
            Save
          </button>
          <button onClick={handleClose} className="button is-danger">
            Discard
          </button>
        </div>
      </div>
      <button
        onClick={handleClose}
        className="modal-close is-large"
        aria-label="close"></button>
    </div>
  );
}
