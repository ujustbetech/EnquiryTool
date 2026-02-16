import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { db } from "../../firebaseConfig";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { format } from "date-fns";
import Swal from "sweetalert2";

const EventLoginPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    bhk: "",
    otherBhk: "",
    services: "",
    otherService: "",
    comment: "",
  });

  const [errors, setErrors] = useState({});
  const [eventDetails, setEventDetails] = useState(null);
  const [registeredUserCount, setRegisteredUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const enquiryType = "Packers & Movers";

  useEffect(() => {
    if (id) {
      fetchEventDetails();
      fetchRegisteredUserCount();
    }
  }, [id]);

  const fetchEventDetails = async () => {
    const eventRef = doc(db, "Enquiry", id);
    const eventDoc = await getDoc(eventRef);
    if (eventDoc.exists()) {
      setEventDetails(eventDoc.data());
    }
    setLoading(false);
  };

  const fetchRegisteredUserCount = async () => {
    const registeredUsersRef = collection(
      db,
      "Enquiry",
      id,
      "registeredUsers"
    );
    const snapshot = await getDocs(registeredUsersRef);
    setRegisteredUserCount(snapshot.size);
  };

  // ---------------- VALIDATION ----------------

  const validateForm = () => {
    let newErrors = {};

    if (!formData.name.trim())
      newErrors.name = "Full name is required";

    if (!formData.phone)
      newErrors.phone = "Phone number is required";
    else if (!/^[0-9]{10}$/.test(formData.phone))
      newErrors.phone = "Enter valid 10 digit phone number";

    if (!formData.bhk)
      newErrors.bhk = "Please select BHK";

    if (formData.bhk === "Other" && !formData.otherBhk.trim())
      newErrors.otherBhk = "Please specify BHK";

    if (!formData.services)
      newErrors.services = "Please select service";

    if (formData.services === "Other" && !formData.otherService.trim())
      newErrors.otherService = "Please specify service";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ---------------- SUBMIT ----------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const userRef = doc(
        db,
        "Enquiry",
        id,
        "registeredUsers",
        formData.phone
      );

      const existingUser = await getDoc(userRef);

      if (existingUser.exists()) {
        Swal.fire({
          icon: "info",
          title: "Already Registered",
          text: "This phone number is already registered.",
        });
        return;
      }

      await setDoc(userRef, {
        name: formData.name,
        phoneNumber: formData.phone,
        bhk:
          formData.bhk === "Other"
            ? formData.otherBhk
            : formData.bhk,
        enquiryType,
        services:
          formData.services === "Other"
            ? formData.otherService
            : formData.services,
        comment: formData.comment,
        registeredAt: serverTimestamp(),
      });

      Swal.fire({
        icon: "success",
        title: "Registration Successful!",
      });

      setFormData({
        name: "",
        phone: "",
        bhk: "",
        otherBhk: "",
        services: "",
        otherService: "",
        comment: "",
      });

      setErrors({});
      fetchRegisteredUserCount();

    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong.",
      });
    }
  };

  if (loading) return <div style={{ padding: 50 }}>Loading...</div>;

  const formattedDate = eventDetails?.startDate?.seconds
    ? format(
        new Date(eventDetails.startDate.seconds * 1000),
        "EEEE, dd/MM/yyyy"
      )
    : "";

  return (
    <section className="feedbackContainer">
      <div className="feedback-form-container">

        <h2 className="feedback-form-title">
          {eventDetails?.eventName || "Event"}
        </h2>

        {formattedDate && (
          <div className="event-card">{formattedDate}</div>
        )}

        <div className="count-badge">
          {registeredUserCount} people registered
        </div>

        <form onSubmit={handleSubmit}>

          {/* NAME */}
          <div className="input-group">
            <label>Full Name</label>
            <input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            {errors.name && <span>{errors.name}</span>}
          </div>

          {/* PHONE */}
          <div className="input-group">
            <label>Contact Number</label>
            <input
              maxLength="10"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
            {errors.phone && <span>{errors.phone}</span>}
          </div>

          {/* BHK */}
          <div className="input-group">
            <label>BHK</label>
            <select
              value={formData.bhk}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bhk: e.target.value,
                  otherBhk: "",
                })
              }
            >
              <option value="">Select Option</option>
              <option value="1 BHK">1 BHK</option>
              <option value="2 BHK">2 BHK</option>
              <option value="Shop">Shop</option>
              <option value="Garage">Garage</option>
              <option value="Other">Other</option>
            </select>
            {errors.bhk && <span>{errors.bhk}</span>}
          </div>

          {formData.bhk === "Other" && (
            <div className="input-group">
              <label>Please Specify BHK</label>
              <input
                value={formData.otherBhk}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    otherBhk: e.target.value,
                  })
                }
              />
              {errors.otherBhk && <span>{errors.otherBhk}</span>}
            </div>
          )}

          {/* SERVICES */}
   <div className="input-group">
  <label>Services</label>
  <select
    value={formData.services}
    onChange={(e) =>
      setFormData({
        ...formData,
        services: e.target.value,
        otherService: "",
      })
    }
  >
    <option value="">Select Service</option>
    <option value="Packers and Movers">Packers and Movers</option>
    <option value="CCTV">CCTV</option>
    <option value="Pest Control">Pest Control</option>
    <option value="AC Servicing and Installation">
      AC Servicing and Installation
    </option>
    <option value="Wall Paper and Flooring">
      Wall Paper and Flooring
    </option>
    <option value="Other">Other</option>
  </select>

  {errors.services && <span>{errors.services}</span>}
</div>

          {formData.services === "Other" && (
            <div className="input-group">
              <label>Please Specify Service</label>
              <input
                value={formData.otherService}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    otherService: e.target.value,
                  })
                }
              />
              {errors.otherService && <span>{errors.otherService}</span>}
            </div>
          )}

          {/* COMMENT */}
          <div className="input-group">
            <label>Comment</label>
            <textarea
              rows="3"
              value={formData.comment}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  comment: e.target.value,
                })
              }
            />
          </div>

          {/* ENQUIRY TYPE */}
          <div className="input-group">
            <label>Enquiry Type</label>
            <input value={enquiryType} disabled readOnly />
          </div>

          <button type="submit" className="submitbtns">
            Submit Registration
          </button>

        </form>

      </div>
    </section>
  );
};

export default EventLoginPage;
