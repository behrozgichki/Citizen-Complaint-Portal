import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createComplaint } from "../services/complaints";

function CreateComplaint() {
  const navigate = useNavigate();

const [form, setForm] = useState({
  title: "",
  category: "Road",
  area: "",
  description: "",
  imageUrl: "",
  latitude: null,
  longitude: null,
});

  const [imageFile, setImageFile] =
    useState(null);

  const [imagePreview, setImagePreview] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [uploadingImage, setUploadingImage] =
    useState(false);

  const [error, setError] =
    useState("");

  // ==========================
  // HANDLE TEXT INPUTS
  // ==========================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // ==========================
  // HANDLE IMAGE SELECTION
  // ==========================

  const handleImageChange = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      setImageFile(null);
      setImagePreview("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert(
        "Please select a valid image file."
      );

      event.target.value = "";
      return;
    }

    // 5 MB limit
    if (
      file.size >
      5 * 1024 * 1024
    ) {
      alert(
        "Image must be smaller than 5MB."
      );

      event.target.value = "";
      return;
    }

    setImageFile(file);

    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(previewUrl);
  };

  // ==========================
  // UPLOAD IMAGE TO CLOUDINARY
  // ==========================

  const uploadImage = async () => {
    if (!imageFile) {
      return "";
    }

    const cloudName =
      import.meta.env
        .VITE_CLOUDINARY_CLOUD_NAME;

    const uploadPreset =
      import.meta.env
        .VITE_CLOUDINARY_UPLOAD_PRESET;

    if (
      !cloudName ||
      !uploadPreset
    ) {
      throw new Error(
        "Cloudinary configuration is missing."
      );
    }

    try {
      setUploadingImage(true);

      const imageForm =
        new FormData();

      imageForm.append(
        "file",
        imageFile
      );

      imageForm.append(
        "upload_preset",
        uploadPreset
      );

      const response =
        await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: imageForm,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error?.message ||
            "Image upload failed."
        );
      }

      return (
        data.secure_url || ""
      );
    } finally {
      setUploadingImage(false);
    }
  };

const handleUseLocation = () => {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );

        const data = await response.json();

        const readableAddress =
          data.display_name || "Location captured";

        setForm((current) => ({
          ...current,
          latitude,
          longitude,
          area: readableAddress,
        }));
      } catch (error) {
        console.error("Reverse geocoding failed:", error);

        setForm((current) => ({
          ...current,
          latitude,
          longitude,
        }));
      }
    },
    () => {
      alert("Unable to get your location. Please allow location access.");
    }
  );
};
  // ==========================
  // SUBMIT COMPLAINT
  // ==========================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      let uploadedImageUrl = "";

      if (imageFile) {
        uploadedImageUrl =
          await uploadImage();
      }

      await createComplaint({
        ...form,
        imageUrl:
          uploadedImageUrl,
      });

      alert(
        "Complaint submitted successfully"
      );

      navigate(
        "/complaints/mine"
      );
    } catch (error) {
      console.log(error);

      setError(
        error.message ||
          "Failed to submit complaint"
      );
    } finally {
      setSubmitting(false);
      setUploadingImage(false);
    }
  };

  // ==========================
  // UI
  // ==========================

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <span className="eyebrow">
            CITIZEN SERVICES
          </span>

          <h1>
            Report a Civic Problem
          </h1>

          <p>
            Tell us what's happening
            in your area and we'll make
            sure it reaches the right
            team.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="complaint-form"
      >
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* TITLE */}

        <div className="form-group">
          <label>
            Complaint title
          </label>

          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Broken streetlight near park"
            required
          />
        </div>

        {/* CATEGORY */}

        <div className="form-group">
          <label>Category</label>

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="Road">
              Road
            </option>

            <option value="Garbage">
              Garbage
            </option>

            <option value="Water">
              Water
            </option>

            <option value="Electricity">
              Electricity
            </option>

            <option value="Other">
              Other
            </option>
          </select>
        </div>

        {/* AREA */}

        <div className="form-group">
          <label>
            Area / Locality
          </label>

          <input
            type="text"
            name="area"
            value={form.area}
            onChange={handleChange}
            placeholder="e.g. Gulshan Block 5"
            required
          />
        </div>
<div className="form-group">
  <label>Location</label>

  <button
    type="button"
    className="secondary-button"
    onClick={handleUseLocation}
  >
    📍 Use My Current Location
  </button>

 {form.latitude && form.longitude && (
  <div
    style={{
      marginTop: "10px",
      padding: "10px 12px",
      borderRadius: "10px",
      background: "#eff6ff",
      color: "#1e3a8a",
      fontSize: "13px",
    }}
  >
    <strong>📍 Location captured</strong>
    <div>{form.area}</div>
  </div>
)}
</div>
        {/* DESCRIPTION */}

        <div className="form-group">
          <label>Description</label>

          <textarea
            name="description"
            rows="5"
            value={
              form.description
            }
            onChange={handleChange}
            placeholder="Describe the problem..."
            required
          />
        </div>

        {/* PHOTO UPLOAD */}

        <div className="form-group">
          <label>
            Upload Photo
            <span
              style={{
                fontWeight:
                  "normal",
                opacity: 0.7,
              }}
            >
              {" "}
              (Optional)
            </span>
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={
              handleImageChange
            }
          />

          <small
            style={{
              display: "block",
              marginTop: "7px",
              opacity: 0.7,
            }}
          >
            JPG, PNG or other image
            formats. Maximum 5MB.
          </small>
        </div>

        {/* IMAGE PREVIEW */}

        {imagePreview && (
          <div
            style={{
              marginBottom:
                "20px",
            }}
          >
            <p
              style={{
                marginBottom:
                  "8px",
              }}
            >
              <strong>
                Photo Preview
              </strong>
            </p>

            <img
              src={imagePreview}
              alt="Complaint preview"
              style={{
                width: "100%",
                maxWidth:
                  "500px",
                maxHeight:
                  "280px",
                objectFit:
                  "cover",
                borderRadius:
                  "12px",
              }}
            />

            <div
              style={{
                marginTop:
                  "10px",
              }}
            >
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setImageFile(
                    null
                  );

                  setImagePreview(
                    ""
                  );
                }}
              >
                Remove Photo
              </button>
            </div>
          </div>
        )}

        {/* SUBMIT */}

        <button
          type="submit"
          className="primary-button"
          disabled={
            submitting ||
            uploadingImage
          }
        >
          {uploadingImage
            ? "Uploading Photo..."
            : submitting
              ? "Submitting..."
              : "Submit Complaint"}
        </button>
      </form>
    </div>
  );
}

export default CreateComplaint;