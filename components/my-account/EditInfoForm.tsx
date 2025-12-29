"use client";
import FloatingInput from "@/components/FloatingInput";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

type EditInfoFormProps = {
  draftFirstName: string;
  draftLastName: string;
  draftEmail: string;
  draftGender: string;
  draftDateOfBirth: string;
  errors: Record<string, string>;
  setDraftFirstName: (v: string) => void;
  setDraftLastName: (v: string) => void;
  setDraftEmail: (v: string) => void;
  setDraftGender: (v: string) => void;
  setDraftDateOfBirth: (v: string) => void;
  cancelEdit: () => void;
  saveEdit: () => Promise<any>;
};

export default function EditInfoForm({
  draftFirstName,
  draftLastName,
  draftEmail,
  draftGender,
  draftDateOfBirth,
  errors,
  setDraftFirstName,
  setDraftLastName,
  setDraftEmail,
  setDraftGender,
  setDraftDateOfBirth,
  cancelEdit,
  saveEdit,
}: EditInfoFormProps) {
  const { updateUser, refetchUser } = useAuth();
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Edit Information</h3>
        <Button
          type="button"
          onClick={cancelEdit}
          className="w-9 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-full drop-shadow-none"
        >
          ✕
        </Button>
      </div>
      <hr className="my-4 border-t-2" />
      <p className="text-gray-600 mb-6 font-normal">
        Feel free to edit any of the details below so your account is up to
        date.
      </p>
      <form
        onSubmit={async(e) => {
          e.preventDefault();
          try {
            setSaving(true);
            const updated = await saveEdit();
            if (updated) {
              updateUser(updated);
            } else {
              await refetchUser();
            }
          } finally {
            setSaving(false);
          }
        }}
      >
        <div className="space-y-5 max-w">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FloatingInput
              id="firstName"
              label="First Name"
              value={draftFirstName}
              onChange={setDraftFirstName}
            />
            <FloatingInput
              id="lastName"
              label="Last Name"
              value={draftLastName}
              onChange={setDraftLastName}
            />
          </div>
          <FloatingInput
            id="email"
            type="email"
            label="Email Address"
            value={draftEmail}
            onChange={setDraftEmail}
            disabled
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FloatingInput
                id="gender"
                label="Gender"
                as="select"
                required
                value={draftGender}
                onChange={setDraftGender}
                options={[
                  { value: "male", label: "male" },
                  { value: "female", label: "female" },
                  { value: "other", label: "other" },
                ]}
              />
              {errors.gender && (
                <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
              )}
            </div>

            <div>
              <div className="edit-user-form">
                <FloatingInput
                id="dateOfBirth"
                label="Date of Birth"
                type="date"
                required
                placeholder=""
                value={draftDateOfBirth}
                onChange={setDraftDateOfBirth}
              />
              </div>
              {errors.dateOfBirth && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.dateOfBirth}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-4 mt-8">
          <Button
            type="button"
            onClick={cancelEdit}
            className="h-12 w-25 bg-white border border-2 border-gray-400 hover:border-gray-800 text-lg font-bold text-gray-400 hover:text-gray-800 rounded-full"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="h-12 w-25 bg-blue-600 text-white text-lg font-bold hover:bg-blue-800 rounded-full"
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}
